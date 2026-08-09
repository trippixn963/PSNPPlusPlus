"""
PSNP++ - Tree Logging
=====================

Formats structured events as trees and streams them to a Discord webhook, in
the same shape SyriaBot uses:

    🔄 Sync Completed
      ├─ Revision: 81
      └─ Changed: +2 games, -1 game

Lives server-side, and has to. The userscript is published from a public URL
and its source is a public repository, so a webhook it carried would be readable
by anyone — and anyone holding it can post to the channel. The browser sends
events to the sidecar over the authenticated sync endpoint; only this process
ever sees the webhook.

The delivery rules are lifted from SyriaBot's logger, which learned them the
hard way:

  - Trees are BATCHED into one POST. One-POST-per-tree hit Discord's global
    per-IP rate limit during bursts.
  - Sends are SPACED. Discord allows roughly 30 posts/min per webhook.
  - A 429 TRIPS A CIRCUIT for five minutes. Without it, a rate-limited logger
    retries into the block and sustains it — and if error paths are what log,
    the failure feeds itself.
  - The queue is BOUNDED and drops the middle. Faults are correlated: one
    problem fires many lines, and the first few explain it while the last few
    show where it got to.

Author: Trippixn
Server: discord.gg/syria
"""

from __future__ import annotations

import json
import os
import threading
import time
import urllib.error
import urllib.request
from typing import Any, Callable

# Discord's content cap is 2000; the rest is headroom for the ``` fences.
BATCH_CHARS = 1800
SEND_SPACING_S = 2.0
CIRCUIT_COOLDOWN_S = 300.0
QUEUE_MAX = 50
QUEUE_KEEP = 20
# Kept from the FRONT of an overflowing queue: the first events are the ones
# that explain the rest.
QUEUE_HEAD = 5
TRUNCATE_SUFFIX = "\n… [truncated]"

BRANCH = "├─"
LAST = "└─"

# Same set SyriaBot routes to its error webhook. Only one webhook is configured
# here, so these do not change the destination — they are still worth naming, so
# a future split is a config change rather than a rewrite, and so nothing
# routine is ever logged with an alarm glyph.
ERROR_EMOJIS = frozenset({"❌", "⚠️", "🚨", "💥"})

# Discord rejects the default urllib agent outright. Identify properly.
USER_AGENT = "PSNPPP-TreeLog/1.0 (+https://github.com/trippixn963/PSNPPlusPlus)"

MAX_ITEMS = 25
MAX_VALUE_CHARS = 300


def _flat(text: Any) -> str:
    """Strip what could break out of the code block or forge structure.

    A backtick can close the fence early and spill the rest of the batch into
    the channel as markdown — which is also how an escaped @everyone would get
    rendered. A newline lets a value forge its own tree rows, so a game title
    could fake a "Sync Failed" line. Applied to the title and emoji too, not
    just values: those are interpolated into the first line of every tree.
    """
    return str(text).replace("`", "'").replace("\n", " ").replace("\r", " ")


def render_tree(title: str, items: list[tuple[str, Any]], emoji: str = "📦") -> str:
    """One tree, exactly as it will appear inside the code block."""
    lines = [f"{_flat(emoji)} {_flat(title)}"]
    rows = list(items)[:MAX_ITEMS]
    for index, (key, value) in enumerate(rows):
        prefix = LAST if index == len(rows) - 1 else BRANCH
        text = _flat(value)
        if len(text) > MAX_VALUE_CHARS:
            text = text[: MAX_VALUE_CHARS - 1] + "…"
        lines.append(f"  {prefix} {_flat(key)}: {text}")
    return "\n".join(lines)


def pack_batch(pending: list[str], max_chars: int = BATCH_CHARS) -> list[str]:
    """Take trees off the front of ``pending`` for ONE message.

    The first is always taken, so a lone oversized tree ships rather than
    wedging the queue behind something that can never fit. It is truncated
    instead of dropped: an over-long tree is usually the error you most need.
    """
    first = pending.pop(0)
    if len(first) > max_chars:
        first = first[: max_chars - len(TRUNCATE_SUFFIX)] + TRUNCATE_SUFFIX
    batch = [first]
    size = len(first)
    while pending and size + len(pending[0]) + 2 <= max_chars:
        nxt = pending.pop(0)
        batch.append(nxt)
        size += len(nxt) + 2
    return batch


def trim_queue(pending: list[str]) -> int:
    """Drop the MIDDLE of an overflowing queue, keeping the head and tail.

    Returns how many were dropped. The head says what started it and the tail
    says where it ended up; the middle is repetition of the same fault.
    """
    if len(pending) <= QUEUE_MAX:
        return 0
    dropped = len(pending) - QUEUE_KEEP
    tail = QUEUE_KEEP - QUEUE_HEAD
    pending[:] = pending[:QUEUE_HEAD] + pending[len(pending) - tail :]
    return dropped


class Circuit:
    """Trips on a 429 and stays open for a cooldown.

    ``now`` is injected so this is pure and testable without sleeping.
    """

    def __init__(self, cooldown_s: float = CIRCUIT_COOLDOWN_S,
                 now: Callable[[], float] = time.monotonic) -> None:
        self._cooldown = cooldown_s
        self._now = now
        self._opened_at: float | None = None

    def trip(self) -> None:
        self._opened_at = self._now()

    @property
    def is_open(self) -> bool:
        if self._opened_at is None:
            return False
        if self._now() - self._opened_at >= self._cooldown:
            self._opened_at = None
            return False
        return True


class TreeLogger:
    """Queues trees and drains them to the webhook on a background thread.

    Nothing here may raise into a request handler. A logger that can fail a
    sync is worse than no logger — the events being logged are the ones that
    matter, and losing the write to report them would be the actual damage.
    """

    def __init__(self, webhook_url: str = "", post: Callable[..., int] | None = None) -> None:
        self._webhook = webhook_url or os.getenv("PSNPPP_LOG_WEBHOOK", "")
        self._post = post or _post_webhook
        self._pending: list[str] = []
        self._lock = threading.Lock()
        self._wake = threading.Event()
        self._circuit = Circuit()
        self._dropped = 0
        self._thread: threading.Thread | None = None

    @property
    def enabled(self) -> bool:
        return bool(self._webhook)

    def log(self, title: str, items: list[tuple[str, Any]], emoji: str = "📦") -> None:
        if not self.enabled:
            return
        try:
            tree = render_tree(title, items, emoji)
        except Exception:
            return
        with self._lock:
            self._pending.append(tree)
            self._dropped += trim_queue(self._pending)
        self._ensure_thread()
        self._wake.set()

    def _ensure_thread(self) -> None:
        if self._thread is not None and self._thread.is_alive():
            return
        # daemon: this must never hold up interpreter shutdown. Losing the tail
        # of a log queue on exit is acceptable; hanging the service is not.
        self._thread = threading.Thread(target=self._drain, name="psnppp-treelog", daemon=True)
        self._thread.start()

    def _drain(self) -> None:
        while True:
            self._wake.wait(timeout=30.0)
            self._wake.clear()
            while True:
                if self._circuit.is_open:
                    break
                with self._lock:
                    if not self._pending:
                        break
                    dropped, self._dropped = self._dropped, 0
                    batch = pack_batch(self._pending)
                if dropped:
                    batch.append(render_tree(
                        "Log Queue Overflowed",
                        [("Dropped", dropped), ("Reason", "correlated burst; middle discarded")],
                        "⚠️",
                    ))
                body = "```\n" + "\n\n".join(batch) + "\n```"
                try:
                    status = self._post(self._webhook, body)
                except Exception:
                    status = 0
                if status == 429:
                    print(f"[treelog] 429 from the webhook; pausing {CIRCUIT_COOLDOWN_S:.0f}s", flush=True)
                    self._circuit.trip()
                    break
                if not (200 <= status < 300):
                    # Loud, because the previous version returned this status to
                    # nobody: a 403 from Discord looked exactly like success from
                    # every other vantage point, including the browser's.
                    print(f"[treelog] webhook rejected the batch: HTTP {status}", flush=True)
                time.sleep(SEND_SPACING_S)


def _post_webhook(url: str, content: str) -> int:
    # allowed_mentions disarms every ping. Belt and braces with _flat above: if
    # anything ever does escape the code fence, it must not be able to notify a
    # server full of people.
    data = json.dumps({
        "content": content,
        "allowed_mentions": {"parse": []},
    }).encode("utf-8")
    # A real User-Agent is REQUIRED, not decoration. Discord (via Cloudflare)
    # answers 403 to urllib's default "Python-urllib/3.x" — verified against the
    # live webhook, where curl got 204 and urllib got 403 with the same URL and
    # the same body. It failed silently for a full day because the status was
    # returned and never read.
    request = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return int(response.status)
    except urllib.error.HTTPError as error:
        return int(error.code)
    except Exception:
        return 0

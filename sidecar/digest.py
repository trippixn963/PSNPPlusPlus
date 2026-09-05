"""
PSNP++ - Daily Digest
=====================

One tree a day, at midnight Eastern: where the store stands, what the day did,
and how big it has grown. A quiet "still alive" for a service whose other
lines only appear when something happens.

The counts live in memory and reset with each digest, so a restart loses at
most one day's tallies — and the digest carries the uptime, which says so.
Eastern because that is the day the userscript's own daily backup keeps
(backup.mjs, easternDay), so the two calendars agree.

Developer: Trippixn
Website:   https://trippixn.com
Discord:   discord.gg/syria
"""
from __future__ import annotations

import threading
import time
from datetime import datetime, timedelta, timezone
from typing import Any, Callable
from zoneinfo import ZoneInfo

DIGEST_ZONE = ZoneInfo("America/New_York")

# What the day is counted in. A name outside this set is ignored by `bump`
# rather than raised: the counters are touched from request handlers, and a
# typo there must not turn a sync into a 500.
COUNTED = ("pushes", "pulls", "conflicts", "logs", "rejected")


class Counters:
    """Thread-safe tallies of the day's work. `take` returns them and resets."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._counts: dict[str, int] = dict.fromkeys(COUNTED, 0)

    def bump(self, name: str) -> None:
        if name not in self._counts:
            return
        with self._lock:
            self._counts[name] += 1

    def peek(self) -> dict[str, int]:
        with self._lock:
            return dict(self._counts)

    def take(self) -> dict[str, int]:
        with self._lock:
            snapshot = dict(self._counts)
            for name in self._counts:
                self._counts[name] = 0
        return snapshot


def next_midnight(now: datetime, zone: ZoneInfo = DIGEST_ZONE) -> datetime:
    """The next local midnight strictly after `now`.

    Built from tomorrow's DATE rather than by adding 24 hours, so the digest
    lands at 00:00 on the day the clocks change too, instead of at 23:00 or
    01:00.
    """
    local = now.astimezone(zone)
    tomorrow = local.date() + timedelta(days=1)
    return datetime(tomorrow.year, tomorrow.month, tomorrow.day, tzinfo=zone)


def format_bytes(count: int) -> str:
    """'812 B', '143.4 KB', '2.4 MB'."""
    count = max(0, int(count))
    if count < 1024:
        return f"{count} B"
    if count < 1024 ** 2:
        return f"{count / 1024:.1f} KB"
    return f"{count / 1024 ** 2:.1f} MB"


def format_duration(seconds: float) -> str:
    """'3d 4h', '5h 20m', '42m' — the shape the site's uptimes use."""
    total = max(0, int(seconds))
    days, rest = divmod(total, 86_400)
    hours, rest = divmod(rest, 3_600)
    minutes = rest // 60
    if days:
        return f"{days}d {hours}h"
    if hours:
        return f"{hours}h {minutes}m"
    return f"{minutes}m"


def render_digest(
    day: str, counts: dict[str, int], snapshot: dict[str, Any], uptime_s: float
) -> tuple[str, list[tuple[str, Any]], str]:
    """The digest as (title, rows, emoji), in the order a reader wants them."""
    items: list[tuple[str, Any]] = [
        ("Day", day),
        ("Revision", snapshot.get("revision", 0)),
        ("Pushes", counts.get("pushes", 0)),
        ("Pulls", counts.get("pulls", 0)),
        ("Conflicts", counts.get("conflicts", 0)),
        ("Log Lines", counts.get("logs", 0)),
        ("Keys Rejected", counts.get("rejected", 0)),
        ("Revisions Held", snapshot.get("history", 0)),
        ("Database", format_bytes(snapshot.get("db_bytes", 0))),
        ("Uptime", format_duration(uptime_s)),
    ]
    return "Daily Digest", items, "📊"


class DailyDigest:
    """Fires one digest at each local midnight, on a daemon thread.

    `now` is injected so the schedule is testable without a clock, and `fire`
    is public so one digest can be produced on demand.
    """

    def __init__(
        self,
        log: Callable[..., None],
        snapshot: Callable[[], dict[str, Any]],
        counters: Counters,
        *,
        started_at: float | None = None,
        now: Callable[[], datetime] | None = None,
        zone: ZoneInfo = DIGEST_ZONE,
    ) -> None:
        self._log = log
        self._snapshot = snapshot
        self._counters = counters
        self._started_at = time.time() if started_at is None else started_at
        self._now = now or (lambda: datetime.now(timezone.utc))
        self._zone = zone
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    def fire(self, at: datetime) -> None:
        """One digest for the day that ended at `at`, a local midnight.

        Never raises: this runs on its own thread, where an exception would
        end the schedule silently rather than surface anywhere.
        """
        day = (at.astimezone(self._zone) - timedelta(days=1)).date().isoformat()
        counts = self._counters.take()
        try:
            snapshot = self._snapshot()
        except Exception as error:
            snapshot = {"error": repr(error)}
        title, items, emoji = render_digest(day, counts, snapshot, time.time() - self._started_at)
        if "error" in snapshot:
            items.append(("Store", f"unreadable: {snapshot['error']}"))
        try:
            self._log(title, items, emoji)
        except Exception:
            pass

    def start(self) -> None:
        if self._thread is not None and self._thread.is_alive():
            return
        # daemon: the digest must never hold up interpreter shutdown.
        self._thread = threading.Thread(target=self._run, name="psnppp-digest", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()

    def _run(self) -> None:
        while not self._stop.is_set():
            target = next_midnight(self._now(), self._zone)
            seconds = (target - self._now()).total_seconds()
            if self._stop.wait(timeout=max(1.0, seconds)):
                return
            self.fire(target)

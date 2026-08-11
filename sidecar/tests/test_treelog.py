"""Tree logging: rendering, batching, queue trimming, and the 429 circuit."""

from __future__ import annotations

import treelog

from conftest import AUTH, BASE


def test_tree_matches_the_syriabot_shape() -> None:
    out = treelog.render_tree("Sync Completed", [("Revision", 81), ("Changed", "+2 games")], "🔄")
    assert out == "🔄 Sync Completed\n  ├─ Revision: 81\n  └─ Changed: +2 games"


def test_single_item_uses_the_closing_branch() -> None:
    assert treelog.render_tree("X", [("A", 1)]).splitlines()[1].startswith("  └─")


def test_backticks_cannot_escape_the_code_block() -> None:
    # A game title containing ``` would close the fence and spill the rest of
    # the batch into the channel as markdown.
    out = treelog.render_tree("Game Added", [("Game", "a ``` title")], "➕")
    assert "`" not in out


def test_long_values_are_capped() -> None:
    out = treelog.render_tree("X", [("Err", "z" * 5000)])
    assert len(out) < 400


def test_batch_packs_several_trees_but_respects_the_cap() -> None:
    pending = ["a" * 700, "b" * 700, "c" * 700]
    batch = treelog.pack_batch(pending, max_chars=1800)
    assert len(batch) == 2 and len(pending) == 1


def test_an_oversized_tree_ships_alone_and_truncated_rather_than_wedging_the_queue() -> None:
    pending = ["x" * 5000, "small"]
    batch = treelog.pack_batch(pending, max_chars=1800)
    assert len(batch) == 1
    assert len(batch[0]) == 1800
    assert batch[0].endswith(treelog.TRUNCATE_SUFFIX)
    assert pending == ["small"]


def test_overflow_keeps_the_head_and_tail_and_drops_the_middle() -> None:
    pending = [str(i) for i in range(80)]
    dropped = treelog.trim_queue(pending)
    assert dropped == 60
    assert len(pending) == treelog.QUEUE_KEEP
    assert pending[: treelog.QUEUE_HEAD] == ["0", "1", "2", "3", "4"]  # what started it
    assert pending[-1] == "79"                                         # where it got to


def test_circuit_opens_on_trip_and_closes_after_the_cooldown() -> None:
    clock = {"t": 0.0}
    circuit = treelog.Circuit(cooldown_s=300.0, now=lambda: clock["t"])
    assert not circuit.is_open
    circuit.trip()
    assert circuit.is_open
    clock["t"] = 299.0
    assert circuit.is_open
    clock["t"] = 300.0
    assert not circuit.is_open


def test_disabled_without_a_webhook_and_never_raises() -> None:
    logger = treelog.TreeLogger(webhook_url="")
    assert not logger.enabled
    logger.log("X", [("A", 1)])  # must be a no-op, not an error


def test_a_failing_webhook_never_raises_into_the_caller() -> None:
    def boom(url: str, content: str) -> int:
        raise RuntimeError("network gone")

    logger = treelog.TreeLogger(webhook_url="https://example.invalid/x", post=boom)
    logger.log("X", [("A", 1)])  # queues; the drain swallows the failure


def test_the_log_endpoint_is_behind_the_sync_key(client) -> None:
    # It posts into a Discord channel; an unauthenticated caller could flood it.
    assert client.post(f"{BASE}/log", json={"title": "X", "items": []}).status_code == 401


def test_a_logging_failure_never_surfaces_as_an_error_to_the_browser(client, monkeypatch) -> None:
    # Events are logged while something is already going wrong. A 500 here
    # would bury the original fault under a second one.
    import app as application

    def boom(*args, **kwargs):
        raise RuntimeError("webhook exploded")

    monkeypatch.setattr(application.TREE_LOG, "_post", boom)
    monkeypatch.setattr(application.TREE_LOG, "_webhook", "https://example.invalid/x")
    response = client.post(
        f"{BASE}/log",
        json={"title": "Game Added", "items": [["Game", "Bloodborne"]], "emoji": "\u2795"},
        headers=AUTH,
    )
    assert response.status_code == 200
    assert response.json() == {"logged": True}


def test_a_title_cannot_escape_the_code_block_or_forge_rows() -> None:
    out = treelog.render_tree("Evil```\n@everyone", [("k", "v")], "🔄")
    assert "`" not in out
    assert out.count("\n") == 1, "a newline in the title would forge a tree row"


def test_an_emoji_field_cannot_escape_either() -> None:
    assert "`" not in treelog.render_tree("T", [("k", "v")], "```x")


def test_a_value_cannot_forge_a_tree_row() -> None:
    out = treelog.render_tree("T", [("k", "one\n  └─ Fake: forged")])
    assert out.count("\n") == 1


def test_the_webhook_body_disarms_mentions() -> None:
    sent = {}

    class FakeResponse:
        status = 204
        def __enter__(self): return self
        def __exit__(self, *a): return False

    import urllib.request as ur
    real = ur.urlopen
    try:
        ur.urlopen = lambda req, timeout=None: (sent.update(body=req.data), FakeResponse())[1]
        treelog._post_webhook("https://example.invalid/x", "hi")
    finally:
        ur.urlopen = real
    import json as _json
    assert _json.loads(sent["body"])["allowed_mentions"] == {"parse": []}


def test_the_request_identifies_itself() -> None:
    # Discord answers 403 to urllib's default agent. This failed silently for a
    # day: the status was returned by _post_webhook and read by nobody.
    seen = {}

    class FakeResponse:
        status = 204
        def __enter__(self): return self
        def __exit__(self, *a): return False

    import urllib.request as ur
    real = ur.urlopen
    try:
        ur.urlopen = lambda req, timeout=None: (seen.update(req=req), FakeResponse())[1]
        treelog._post_webhook("https://example.invalid/x", "hi")
    finally:
        ur.urlopen = real
    agent = seen["req"].get_header("User-agent")
    assert agent and "python-urllib" not in agent.lower()


# ---------------------------------------------------------------------------
# An overflowing queue must not throw away the errors
# ---------------------------------------------------------------------------

def test_a_fault_in_the_middle_survives_the_trim():
    """The bug this replaced: the middle was dropped wholesale.

    A burst of routine traffic around one error meant the error sat in the
    middle and was discarded, while the routine trees either side of it were
    kept -- the exact inversion of what the log exists for, and invisible when
    it happened, because the dropped count says how many and never which.
    """
    pending = [f"📦 Routine {n}" for n in range(60)]
    pending[30] = "❌ Sync Failed"

    dropped = treelog.trim_queue(pending)

    assert "❌ Sync Failed" in pending, "the fault survived"
    assert len(pending) <= treelog.QUEUE_KEEP, "and the queue is still bounded"
    assert dropped == 60 - len(pending)
    assert "📦 Routine 30" not in pending, "a routine tree in that slot would not have"


def test_every_fault_glyph_counts_and_routine_ones_do_not():
    for emoji in ("❌", "⚠️", "🚨", "💥"):
        assert treelog.is_fault(f"{emoji} Something Broke"), emoji
    for emoji in ("📦", "🔄", "➕", "➖", "📋", "📥", "🆙"):
        assert not treelog.is_fault(f"{emoji} Routine Event"), emoji


def test_faults_cannot_grow_the_queue_past_the_cap():
    # All faults is the one case where the middle really is repetition, so it
    # falls back to head-and-tail rather than keeping everything.
    pending = [f"❌ Failure {n}" for n in range(60)]

    dropped = treelog.trim_queue(pending)

    assert len(pending) == treelog.QUEUE_KEEP
    assert dropped == 60 - treelog.QUEUE_KEEP
    assert pending[0] == "❌ Failure 0", "the head still explains what started it"
    assert pending[-1] == "❌ Failure 59", "and the tail still shows where it got to"


def test_a_queue_under_the_cap_is_left_alone_faults_or_not():
    pending = ["❌ Failure", "📦 Routine"]
    assert treelog.trim_queue(pending) == 0
    assert pending == ["❌ Failure", "📦 Routine"]

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

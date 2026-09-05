"""The daily digest: its schedule, its words, and its counters.

Developer: Trippixn
Website:   https://trippixn.com
Discord:   discord.gg/syria
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import digest


def test_next_midnight_is_the_next_eastern_midnight_in_utc_terms() -> None:
    # 15:00 UTC on a January day is 10:00 EST; the next midnight EST is 05:00 UTC.
    now = datetime(2026, 1, 10, 15, 0, tzinfo=timezone.utc)
    target = digest.next_midnight(now)
    assert target.hour == 0 and target.minute == 0
    assert target.astimezone(timezone.utc) == datetime(2026, 1, 11, 5, 0, tzinfo=timezone.utc)


def test_next_midnight_lands_on_midnight_across_the_clock_change() -> None:
    # EDT begins 2026-03-08. From just before, the next midnight is 23 hours
    # away in real time and must still be 00:00 local, not 01:00.
    before = datetime(2026, 3, 7, 5, 0, tzinfo=timezone.utc)  # 00:00 EST on the 7th
    first = digest.next_midnight(before)
    assert first.hour == 0
    assert first.utcoffset() == timedelta(hours=-5)
    second = digest.next_midnight(first)
    assert second.hour == 0
    assert second.utcoffset() == timedelta(hours=-4), "the day after the change is EDT"
    # Compared in UTC: aware datetimes sharing one tzinfo subtract by wall
    # clock, which would say 24 hours about a day that only had 23.
    elapsed = second.astimezone(timezone.utc) - first.astimezone(timezone.utc)
    assert elapsed == timedelta(hours=23), "and that day is 23 hours long"


def test_next_midnight_is_strictly_after_a_midnight_now() -> None:
    at = datetime(2026, 6, 1, 0, 0, tzinfo=digest.DIGEST_ZONE)
    assert digest.next_midnight(at) == datetime(2026, 6, 2, 0, 0, tzinfo=digest.DIGEST_ZONE)


def test_bytes_and_durations_read_the_way_the_site_says_them() -> None:
    assert digest.format_bytes(812) == "812 B"
    assert digest.format_bytes(143_360) == "140.0 KB"
    assert digest.format_bytes(2_539_520) == "2.4 MB"
    assert digest.format_duration(42 * 60) == "42m"
    assert digest.format_duration(5 * 3600 + 20 * 60) == "5h 20m"
    assert digest.format_duration(3 * 86_400 + 4 * 3600) == "3d 4h"
    assert digest.format_duration(-5) == "0m"


def test_counters_count_and_take_resets_them() -> None:
    counters = digest.Counters()
    counters.bump("pushes")
    counters.bump("pushes")
    counters.bump("pulls")
    counters.bump("not-a-counter")  # ignored, never raised: this runs in request handlers
    assert counters.peek()["pushes"] == 2
    taken = counters.take()
    assert taken["pushes"] == 2 and taken["pulls"] == 1 and taken["rejected"] == 0
    assert counters.peek()["pushes"] == 0, "take resets"


def test_the_digest_rows_are_in_reading_order() -> None:
    title, items, emoji = digest.render_digest(
        "2026-09-05",
        {"pushes": 12, "pulls": 40, "conflicts": 1, "logs": 9, "rejected": 2},
        {"revision": 1503, "history": 100, "db_bytes": 143_360},
        3 * 86_400 + 4 * 3600,
    )
    assert title == "Daily Digest" and emoji == "📊"
    assert [key for key, _ in items] == [
        "Day", "Revision", "Pushes", "Pulls", "Conflicts", "Log Lines",
        "Keys Rejected", "Revisions Held", "Database", "Uptime",
    ]
    assert dict(items)["Database"] == "140.0 KB"
    assert dict(items)["Uptime"] == "3d 4h"


def test_fire_logs_one_digest_for_the_day_that_ended_and_resets_the_counts() -> None:
    trees: list[tuple[str, list, str]] = []
    counters = digest.Counters()
    counters.bump("pushes")
    daily = digest.DailyDigest(
        log=lambda title, items, emoji: trees.append((title, items, emoji)),
        snapshot=lambda: {"revision": 7, "history": 7, "db_bytes": 1024},
        counters=counters,
        started_at=0.0,
    )
    daily.fire(datetime(2026, 9, 6, 0, 0, tzinfo=digest.DIGEST_ZONE))
    assert len(trees) == 1
    title, items, _ = trees[0]
    assert title == "Daily Digest"
    assert dict(items)["Day"] == "2026-09-05", "the day that just ended, not the one starting"
    assert dict(items)["Pushes"] == 1
    assert counters.peek()["pushes"] == 0


def test_fire_survives_a_store_that_cannot_be_read() -> None:
    trees: list = []

    def broken() -> dict:
        raise RuntimeError("locked")

    daily = digest.DailyDigest(
        log=lambda *args: trees.append(args), snapshot=broken, counters=digest.Counters()
    )
    daily.fire(datetime(2026, 9, 6, 0, 0, tzinfo=digest.DIGEST_ZONE))
    assert len(trees) == 1
    assert any(key == "Store" and "locked" in str(value) for key, value in trees[0][1])


def test_fire_never_raises_when_the_log_itself_does() -> None:
    def boom(*args) -> None:
        raise RuntimeError("webhook gone")

    daily = digest.DailyDigest(log=boom, snapshot=dict, counters=digest.Counters())
    daily.fire(datetime(2026, 9, 6, 0, 0, tzinfo=digest.DIGEST_ZONE))

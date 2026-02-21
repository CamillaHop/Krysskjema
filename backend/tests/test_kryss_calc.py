"""Unit tests for compute_kryss_for_minutes."""

import pytest

from app.kryss_calc import compute_kryss_for_minutes


@pytest.mark.parametrize(
    "minutes_late, expected",
    [
        (0, 1),   # ln(1)=0      -> <1 => 1
        (1, 1),   # ln(2)=0.693  -> <1 => 1
        (3, 1),   # ln(4)=1.386  -> floor=1, frac=0.386 < 0.5 => 1
        (4, 2),   # ln(5)=1.609  -> floor=1, frac=0.609 >= 0.5 => 2
        (10, 2),  # ln(11)=2.397 -> floor=2, frac=0.397 < 0.5 => 2
        (12, 3),  # ln(13)=2.565 -> floor=2, frac=0.565 >= 0.5 => 3
    ],
)
def test_compute_kryss_for_minutes(minutes_late: int, expected: int):
    assert compute_kryss_for_minutes(minutes_late) == expected


def test_negative_minutes_raises():
    with pytest.raises(ValueError, match="minutesLate must be >= 0"):
        compute_kryss_for_minutes(-1)


def test_large_minutes():
    """Smoke test – shouldn't crash for large values."""
    result = compute_kryss_for_minutes(1000)
    assert isinstance(result, int)
    assert result >= 1


def test_boundary_exactly_one():
    """e-1 ≈ 1.718 → ln(1 + 1.718) = ln(2.718) ≈ 1.0.
    minutesLate must be int so test minutesLate=2 → ln(3)=1.0986 → frac=0.0986 → 1
    """
    assert compute_kryss_for_minutes(2) == 1

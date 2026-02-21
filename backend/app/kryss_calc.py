"""Kryss‑count calculation from minutes late.

Formula
-------
raw = ln(1 + minutesLate)

Rounding
--------
- If raw < 1  →  1
- Else: standard rounding with 0.5 going **up**:
    integer_part = floor(raw)
    frac = raw − integer_part
    if frac >= 0.5 → integer_part + 1
    else           → integer_part
"""

from __future__ import annotations

import math


def compute_kryss_for_minutes(minutes_late: int) -> int:
    """Return the number of kryss for a given *minutesLate* value."""
    if minutes_late < 0:
        raise ValueError("minutesLate must be >= 0")

    raw = math.log(1 + minutes_late)

    if raw < 1:
        return 1

    integer_part = math.floor(raw)
    frac = raw - integer_part

    if frac >= 0.5:
        return integer_part + 1
    return integer_part

"""Team members – constant list.

Edit names/ids here when the roster changes.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Person:
    id: str
    name: str


PEOPLE: list[Person] = [
    Person(id="p1", name="Henrik"),
    Person(id="p2", name="Lars Ivar"),
    Person(id="p3", name="Camilla H"),
    Person(id="p4", name="Camilla W"),
    Person(id="p5", name="Nicolai"),
]

PEOPLE_BY_ID: dict[str, Person] = {p.id: p for p in PEOPLE}

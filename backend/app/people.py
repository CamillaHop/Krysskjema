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
    Person(id="henrik-solheim", name="Henrik"),
    Person(id="lars-ivar-skaarset", name="Lars Ivar"),
    Person(id="camilla-hop", name="Camilla H"),
    Person(id="camilla-wigstoel", name="Camilla W"),
    Person(id="nicolai-baklund", name="Nicolai"),
]

PEOPLE_BY_ID: dict[str, Person] = {p.id: p for p in PEOPLE}

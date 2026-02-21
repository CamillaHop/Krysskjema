"""Pydantic models for request / response validation."""

import datetime as _dt
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, model_validator


# ---------- Enums ---------- #


class Category(str, Enum):
    FORSENTKOMMING = "Forsentkomming"
    UDUGELIGHET = "Udugelighet"
    ANNET = "Annet"


# ---------- Request Models ---------- #


class KryssCreate(BaseModel):
    """Payload for creating a new kryss entry."""

    date: _dt.date = Field(default_factory=_dt.date.today, description="ISO date string")
    recipientPersonId: str = Field(..., description="Person receiving the kryss")
    givenByPersonId: str = Field(..., description="Person who issued the kryss")
    category: Category
    minutesLate: Optional[int] = Field(
        None, ge=0, description="Required for Forsentkomming"
    )
    comment: Optional[str] = Field(
        None, description="Required for Udugelighet / Annet"
    )
    kryssCount: Optional[int] = Field(
        None,
        ge=1,
        description="Required for Udugelighet/Annet; computed for Forsentkomming",
    )

    @model_validator(mode="after")
    def check_category_fields(self) -> "KryssCreate":
        if self.category == Category.FORSENTKOMMING:
            if self.minutesLate is None:
                raise ValueError(
                    "minutesLate is required for category Forsentkomming"
                )
            # kryssCount will be computed server‑side; ignore whatever was sent
        else:
            # Udugelighet or Annet
            if not self.comment or not self.comment.strip():
                raise ValueError(
                    f"comment is required for category {self.category.value}"
                )
            if self.kryssCount is None:
                raise ValueError(
                    f"kryssCount is required for category {self.category.value}"
                )
            if self.minutesLate is not None:
                raise ValueError(
                    "minutesLate must be null for non‑Forsentkomming categories"
                )
        return self


class KryssUpdate(BaseModel):
    """Payload for updating an existing kryss entry (partial‑ish)."""

    date: Optional[_dt.date] = None
    recipientPersonId: Optional[str] = None
    givenByPersonId: Optional[str] = None
    category: Optional[Category] = None
    minutesLate: Optional[int] = Field(None, ge=0)
    comment: Optional[str] = None
    kryssCount: Optional[int] = Field(None, ge=1)


# ---------- Response Models ---------- #


class PersonResponse(BaseModel):
    id: str
    name: str


class KryssResponse(BaseModel):
    id: str
    date: str
    recipientPersonId: str
    givenByPersonId: str
    category: str
    minutesLate: Optional[int] = None
    comment: Optional[str] = None
    kryssCount: int
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

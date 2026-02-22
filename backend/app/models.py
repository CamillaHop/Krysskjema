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
    givenByPersonId: Optional[str] = Field(None, description="Person who issued the kryss")
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
    givenByPersonId: Optional[str] = None
    category: str
    minutesLate: Optional[int] = None
    comment: Optional[str] = None
    kryssCount: int
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


# ---------- Ice Models ---------- #


class IceCreate(BaseModel):
    """Payload for creating an ice entry."""

    date: _dt.date = Field(default_factory=_dt.date.today, description="ISO date string")
    iceePersonId: str = Field(..., description="Person receiving the ice")
    icerPersonId: str = Field(..., description="Person giving the ice")
    comment: Optional[str] = Field(None, description="Optional comment")


class IceUpdate(BaseModel):
    """Payload for updating an existing ice entry."""

    date: Optional[_dt.date] = None
    iceePersonId: Optional[str] = None
    icerPersonId: Optional[str] = None
    comment: Optional[str] = None


class IceResponse(BaseModel):
    id: str
    date: str
    iceePersonId: str
    icerPersonId: str
    comment: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


# ---------- Quote Models ---------- #


class QuoteCreate(BaseModel):
    """Payload for creating a quote entry."""

    personId: str = Field(..., description="Person who said the quote")
    context: Optional[str] = Field(None, description="Free-text context, e.g. about/to whom")
    text: str = Field(..., min_length=1, description="The quote text")


class QuoteUpdate(BaseModel):
    """Payload for updating an existing quote."""

    personId: Optional[str] = None
    context: Optional[str] = None
    text: Optional[str] = None


class QuoteResponse(BaseModel):
    id: str
    personId: str
    context: Optional[str] = None
    text: str
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

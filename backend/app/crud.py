"""Firestore CRUD operations for kryss entries."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from google.cloud.firestore_v1 import FieldFilter

from app.firebase_client import get_firestore_client
from app.kryss_calc import compute_kryss_for_minutes
from app.models import Category, KryssCreate, KryssUpdate
from app.people import PEOPLE_BY_ID

COLLECTION = "kryssEntries"


def _now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def _validate_person(person_id: str, field: str) -> None:
    if person_id not in PEOPLE_BY_ID:
        raise ValueError(f"Unknown {field}: {person_id}")


# --------------------------------------------------------------------------- #
#  CREATE
# --------------------------------------------------------------------------- #


def create_kryss(data: KryssCreate) -> dict[str, Any]:
    """Create a new kryss document and return it (with id)."""
    _validate_person(data.recipientPersonId, "recipientPersonId")
    _validate_person(data.givenByPersonId, "givenByPersonId")

    # Compute kryssCount for Forsentkomming
    if data.category == Category.FORSENTKOMMING:
        kryss_count = compute_kryss_for_minutes(data.minutesLate)  # type: ignore[arg-type]
    else:
        kryss_count = data.kryssCount  # type: ignore[assignment]

    now = _now_utc()
    doc_data: dict[str, Any] = {
        "date": data.date.isoformat(),
        "recipientPersonId": data.recipientPersonId,
        "givenByPersonId": data.givenByPersonId,
        "category": data.category.value,
        "minutesLate": data.minutesLate,
        "comment": data.comment,
        "kryssCount": kryss_count,
        "createdAt": now,
        "updatedAt": now,
    }

    db = get_firestore_client()
    _, doc_ref = db.collection(COLLECTION).add(doc_data)
    return {"id": doc_ref.id, **doc_data}


# --------------------------------------------------------------------------- #
#  READ
# --------------------------------------------------------------------------- #


def list_kryss(limit: int = 100) -> list[dict[str, Any]]:
    """Return kryss entries sorted by date desc."""
    db = get_firestore_client()
    query = (
        db.collection(COLLECTION)
        .order_by("date", direction="DESCENDING")
        .limit(limit)
    )
    docs = query.stream()
    results: list[dict[str, Any]] = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        results.append(d)
    return results


def get_kryss(doc_id: str) -> dict[str, Any] | None:
    """Return a single kryss entry by id, or None."""
    db = get_firestore_client()
    doc = db.collection(COLLECTION).document(doc_id).get()
    if not doc.exists:
        return None
    d = doc.to_dict()
    d["id"] = doc.id
    return d


# --------------------------------------------------------------------------- #
#  UPDATE
# --------------------------------------------------------------------------- #


def update_kryss(doc_id: str, data: KryssUpdate) -> dict[str, Any] | None:
    """Update an existing kryss entry. Returns updated doc or None."""
    db = get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(doc_id)
    existing = doc_ref.get()
    if not existing.exists:
        return None

    existing_data = existing.to_dict()
    updates: dict[str, Any] = {}

    # Merge provided fields
    if data.date is not None:
        updates["date"] = data.date.isoformat()
    if data.recipientPersonId is not None:
        _validate_person(data.recipientPersonId, "recipientPersonId")
        updates["recipientPersonId"] = data.recipientPersonId
    if data.givenByPersonId is not None:
        _validate_person(data.givenByPersonId, "givenByPersonId")
        updates["givenByPersonId"] = data.givenByPersonId

    # Category change may affect other fields
    new_category = data.category.value if data.category else existing_data.get("category")

    if data.category is not None:
        updates["category"] = data.category.value

    if new_category == Category.FORSENTKOMMING.value:
        minutes = data.minutesLate if data.minutesLate is not None else existing_data.get("minutesLate")
        if minutes is None:
            raise ValueError("minutesLate is required for Forsentkomming")
        updates["minutesLate"] = minutes
        updates["kryssCount"] = compute_kryss_for_minutes(minutes)
        if data.comment is not None:
            updates["comment"] = data.comment
    else:
        if data.comment is not None:
            updates["comment"] = data.comment
        if data.kryssCount is not None:
            updates["kryssCount"] = data.kryssCount
        if data.minutesLate is not None:
            updates["minutesLate"] = None  # clear for non-Forsentkomming

    updates["updatedAt"] = _now_utc()
    doc_ref.update(updates)

    # Return full merged document
    merged = {**existing_data, **updates, "id": doc_id}
    return merged


# --------------------------------------------------------------------------- #
#  DELETE
# --------------------------------------------------------------------------- #


def delete_kryss(doc_id: str) -> bool:
    """Delete a kryss entry. Returns True if it existed."""
    db = get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(doc_id)
    doc = doc_ref.get()
    if not doc.exists:
        return False
    doc_ref.delete()
    return True

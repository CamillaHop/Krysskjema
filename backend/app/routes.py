"""FastAPI route definitions."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query

from app.crud import create_kryss, delete_kryss, get_kryss, list_kryss, update_kryss, create_ice, list_ice, delete_ice
from app.models import KryssCreate, KryssResponse, KryssUpdate, PersonResponse, IceCreate, IceResponse
from app.people import PEOPLE

logger = logging.getLogger(__name__)
router = APIRouter()


# ---------- Health --------------------------------------------------------- #


@router.get("/health")
def health_check():
    return {"status": "ok"}


# ---------- People --------------------------------------------------------- #


@router.get("/people", response_model=list[PersonResponse])
def get_people():
    return [{"id": p.id, "name": p.name} for p in PEOPLE]


# ---------- Kryss ---------------------------------------------------------- #


@router.get("/kryss", response_model=list[KryssResponse])
def get_kryss_list(limit: int = Query(100, ge=1, le=500)):
    try:
        return list_kryss(limit=limit)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.exception("Failed to list kryss")
        raise HTTPException(status_code=500, detail=f"Firestore error: {exc}")


@router.post("/kryss", response_model=KryssResponse, status_code=201)
def post_kryss(payload: KryssCreate):
    try:
        return create_kryss(payload)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.exception("Failed to create kryss")
        raise HTTPException(status_code=500, detail=f"Firestore error: {exc}")


@router.put("/kryss/{kryss_id}", response_model=KryssResponse)
def put_kryss(kryss_id: str, payload: KryssUpdate):
    try:
        result = update_kryss(kryss_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.exception("Failed to update kryss")
        raise HTTPException(status_code=500, detail=f"Firestore error: {exc}")
    if result is None:
        raise HTTPException(status_code=404, detail="Kryss entry not found")
    return result


@router.delete("/kryss/{kryss_id}", status_code=204)
def remove_kryss(kryss_id: str):
    try:
        if not delete_kryss(kryss_id):
            raise HTTPException(status_code=404, detail="Kryss entry not found")
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to delete kryss")
        raise HTTPException(status_code=500, detail=f"Firestore error: {exc}")


# ---------- Ice ------------------------------------------------------------ #


@router.get("/ice", response_model=list[IceResponse])
def get_ice_list(limit: int = Query(100, ge=1, le=500)):
    try:
        return list_ice(limit=limit)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.exception("Failed to list ice")
        raise HTTPException(status_code=500, detail=f"Firestore error: {exc}")


@router.post("/ice", response_model=IceResponse, status_code=201)
def post_ice(payload: IceCreate):
    try:
        return create_ice(payload)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.exception("Failed to create ice")
        raise HTTPException(status_code=500, detail=f"Firestore error: {exc}")


@router.delete("/ice/{ice_id}", status_code=204)
def remove_ice(ice_id: str):
    try:
        if not delete_ice(ice_id):
            raise HTTPException(status_code=404, detail="Ice entry not found")
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to delete ice")
        raise HTTPException(status_code=500, detail=f"Firestore error: {exc}")

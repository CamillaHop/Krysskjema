"""Firebase Authentication dependency for FastAPI routes."""

from __future__ import annotations

import logging
from typing import Optional

import firebase_admin.auth
from fastapi import Header, HTTPException

logger = logging.getLogger(__name__)


async def require_auth(authorization: Optional[str] = Header(None)) -> dict:
    """FastAPI dependency that verifies a Firebase ID token.

    Extracts the Bearer token from the Authorization header and verifies it
    using the Firebase Admin SDK. Returns the decoded token dict on success.
    Raises HTTP 401 on missing, invalid, or expired tokens.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Ikke autentisert")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        decoded = firebase_admin.auth.verify_id_token(token)
        return decoded
    except firebase_admin.auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Sesjonen har utl\u00f8pt, vennligst logg inn p\u00e5 nytt",
        )
    except Exception as exc:
        logger.warning("Token verification failed: %s", exc)
        raise HTTPException(status_code=401, detail="Ugyldig autentisering")

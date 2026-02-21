"""Firebase Admin SDK initialisation & Firestore helpers."""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)

_db = None
_init_error: str | None = None

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    from app.config import FIREBASE_SERVICE_ACCOUNT_PATH, FIRESTORE_PROJECT_ID

    _cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH)
    _options: dict = {}
    if FIRESTORE_PROJECT_ID:
        _options["projectId"] = FIRESTORE_PROJECT_ID

    firebase_admin.initialize_app(_cred, _options)
    _db = firestore.client()
    logger.info("Firebase initialized successfully")
except Exception as e:
    _init_error = str(e)
    logger.error(f"Firebase initialization failed: {e}")
    _db = None


def get_firestore_client():
    """Return the Firestore client, or raise a clear error if not available."""
    if _db is None:
        raise RuntimeError(
            f"Firebase is not initialized. Check your service account configuration. Error: {_init_error}"
        )
    return _db

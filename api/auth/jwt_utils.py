import json
import base64
import hmac
import hashlib
import time
from typing import Dict, Any

from django.conf import settings


def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def _b64url_decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def encode(payload: Dict[str, Any], exp_seconds: int) -> str:
    """
    Encode payload into JWT (HS256) with expiration.

    - Adds 'iat' and 'exp' to payload.
    - Signs with settings.SECRET_KEY.
    """
    if not isinstance(payload, dict):
        raise ValueError("Payload must be a dict")

    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    to_encode = dict(payload)
    to_encode["iat"] = now
    to_encode["exp"] = now + int(exp_seconds)

    header_json = json.dumps(header, separators=(",", ":"), sort_keys=True).encode("utf-8")
    payload_json = json.dumps(to_encode, separators=(",", ":"), sort_keys=True).encode("utf-8")

    header_b64 = _b64url_encode(header_json)
    payload_b64 = _b64url_encode(payload_json)
    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")

    signature = hmac.new(
        key=settings.SECRET_KEY.encode("utf-8"),
        msg=signing_input,
        digestmod=hashlib.sha256,
    ).digest()
    signature_b64 = _b64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"


def decode(token: str) -> Dict[str, Any]:
    """
    Decode JWT (HS256) and validate signature and expiration.

    Returns payload dict on success.
    Raises ValueError with human-readable message on failure.
    """
    if not token or token.count(".") != 2:
        raise ValueError("Invalid token format")

    header_b64, payload_b64, signature_b64 = token.split(".")

    try:
        header_raw = _b64url_decode(header_b64)
        payload_raw = _b64url_decode(payload_b64)
        signature_provided = _b64url_decode(signature_b64)
        header = json.loads(header_raw.decode("utf-8"))
        payload = json.loads(payload_raw.decode("utf-8"))
    except Exception:
        raise ValueError("Invalid token encoding")

    if header.get("alg") != "HS256" or header.get("typ") != "JWT":
        raise ValueError("Unsupported token header")

    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    expected_sig = hmac.new(
        key=settings.SECRET_KEY.encode("utf-8"),
        msg=signing_input,
        digestmod=hashlib.sha256,
    ).digest()

    if not hmac.compare_digest(expected_sig, signature_provided):
        raise ValueError("Invalid token signature")

    exp = payload.get("exp")
    if not isinstance(exp, int):
        raise ValueError("Invalid token payload: exp")

    now = int(time.time())
    if now >= exp:
        raise ValueError("Token expired")

    return payload

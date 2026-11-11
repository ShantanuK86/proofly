import time
from collections import defaultdict
from typing import Dict, List
from fastapi import Request

from app.core.config import settings
from app.core.exceptions import RateLimitExceededException

# In-memory sliding window store: ip_address -> list of timestamps
_submission_records: Dict[str, List[float]] = defaultdict(list)


def check_submission_rate_limit(request: Request, limit: int = None, window_seconds: int = 3600) -> None:
    if limit is None:
        limit = settings.RATE_LIMIT_SUBMISSIONS_PER_IP_PER_HOUR

    # Extract client IP
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    cutoff = now - window_seconds

    # Filter timestamps older than window
    timestamps = [ts for ts in _submission_records[client_ip] if ts > cutoff]
    
    if len(timestamps) >= limit:
        raise RateLimitExceededException(
            f"Rate limit exceeded: You can only submit up to {limit} testimonials per hour."
        )

    timestamps.append(now)
    _submission_records[client_ip] = timestamps


def reset_rate_limits() -> None:
    """Helper for testing."""
    _submission_records.clear()

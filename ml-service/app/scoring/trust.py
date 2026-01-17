from redis import Redis

DEFAULT_TRUST = 0.5
MIN_TRUST = 0.1
MAX_TRUST = 0.95




def clamp(value: float) -> float:
    return min(MAX_TRUST, max(MIN_TRUST, value))




def get_user_trust(r: Redis, user_id: str) -> float:
    key = f"user:trust:{user_id}"
    value = r.get(key)
    if value is None:
        r.set(key, DEFAULT_TRUST)
        return DEFAULT_TRUST
    return float(value)




def update_user_trust(r: Redis, user_id: str, delta: float) -> float:
    trust = clamp(get_user_trust(r, user_id) + delta)
    r.set(f"user:trust:{user_id}", trust)
    return trust
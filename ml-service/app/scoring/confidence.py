import time




def freshness(ts: int) -> float:
    age = int(time.time()) - ts
    if age < 300:
        return 1.0
    if age < 900:
        return 0.7
    return 0.4




def severity_weight(sev: int) -> float:
    return 0.8 + (sev * 0.1)




def compute_confidence(trust: float, dup_boost: float, fresh: float, sev: int) -> float:
    base = (0.5 * trust) + (0.3 * dup_boost) + (0.2 * fresh)
    score = base * severity_weight(sev)
    return min(1.0, max(0.0, score))
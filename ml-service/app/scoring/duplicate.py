import hashlib
import time


DUP_RADIUS_METERS = 50
TIME_WINDOW = 300




def cluster_id(lat: float, lng: float, timestamp: int) -> str:
    bucket = timestamp // TIME_WINDOW
    raw = f"{round(lat,3)}:{round(lng,3)}:{bucket}"
    return hashlib.sha1(raw.encode()).hexdigest()




def duplicate_boost(count: int) -> float:
    if count >= 4:
        return 0.2
    if count >= 2:
        return 0.1
    return 0.0
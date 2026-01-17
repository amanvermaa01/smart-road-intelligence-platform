from pydantic import BaseModel, Field
from typing import Literal, Dict, Optional
import time


EventType = Literal["accident", "pothole", "flooding", "other"]




class RawEvent(BaseModel):
    id: str
    user_id: Optional[str] = "anon"
    type: str # Use string as frontend sends lowercase
    lat: float
    lng: float
    timestamp: Optional[int] = Field(default_factory=lambda: int(time.time())) # Handled in consumer if needed
    severity: int = Field(ge=1, le=5)
    source: Optional[str] = "unknown"




class ScoredEvent(BaseModel):
    event_id: str
    confidence: float
    trust_score: float
    duplicate_cluster_id: str
    lat: float
    lng: float
    type: str
    severity: int
    signals: Dict[str, float]
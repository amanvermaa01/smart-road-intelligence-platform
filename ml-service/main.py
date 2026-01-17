import json
from fastapi import FastAPI, HTTPException
from app.redis_client import redis_client

app = FastAPI(title="ML-Lite Confidence Service")

@app.get("/confidence/{event_id}")
def get_confidence(event_id: str):
    key = f"event:confidence:{event_id}"
    data = redis_client.get(key)
    if not data:
        raise HTTPException(status_code=404, detail="Event not scored")
    return json.loads(data)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

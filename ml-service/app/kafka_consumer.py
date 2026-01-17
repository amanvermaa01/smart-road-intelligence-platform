import json
import os
import time
from kafka import KafkaConsumer, KafkaProducer
from app.schemas import RawEvent, ScoredEvent
from app.redis_client import redis_client
from app.scoring.trust import get_user_trust
from app.scoring.duplicate import cluster_id, duplicate_boost
from app.scoring.confidence import freshness, compute_confidence

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
KAFKA_TOPIC_IN = "road-events"
KAFKA_TOPIC_OUT = "events.scored"

def start_consumer():
    consumer = KafkaConsumer(
        KAFKA_TOPIC_IN,
        bootstrap_servers=[KAFKA_BROKER],
        value_deserializer=lambda v: json.loads(v.decode()),
        auto_offset_reset='earliest',
        group_id='ml-service-group'
    )

    producer = KafkaProducer(
        bootstrap_servers=[KAFKA_BROKER],
        value_serializer=lambda v: json.dumps(v).encode()
    )

    print(f"ML Service Consumer started. Listening on {KAFKA_TOPIC_IN}...")

    for msg in consumer:
        try:
            data = msg.value
            # Map JS camelCase or different names if necessary
            # event-service sends 'id', 'type', 'severity', 'lat', 'lng', '_publishedAt'
            raw = RawEvent(
                id=data.get('id'),
                type=data.get('type'),
                severity=data.get('severity'),
                lat=data.get('lat'),
                lng=data.get('lng'),
                timestamp=data.get('_publishedAt', int(time.time() * 1000)),
                user_id=data.get('user_id', 'anon'),
                source=data.get('source', 'sensor')
            )

            cid = cluster_id(raw.lat, raw.lng, raw.timestamp // 1000) # duplicate.py expects seconds
            cluster_key = f"cluster:{cid}"
            count = redis_client.incr(cluster_key)
            redis_client.expire(cluster_key, 600)

            dup_boost = duplicate_boost(count)
            trust = get_user_trust(redis_client, raw.user_id)
            fresh = freshness(raw.timestamp // 1000)

            confidence = compute_confidence(trust, dup_boost, fresh, raw.severity)

            scored = ScoredEvent(
                event_id=raw.id,
                confidence=confidence,
                trust_score=trust,
                duplicate_cluster_id=cid,
                lat=raw.lat,
                lng=raw.lng,
                type=raw.type,
                severity=raw.severity,
                signals={
                    "user_trust": trust,
                    "duplicate_boost": dup_boost,
                    "freshness": fresh
                }
            )

            # Store as JSON string instead of partial dict to avoid nested hash issues
            redis_client.set(f"event:confidence:{raw.id}", scored.json())

            producer.send(KAFKA_TOPIC_OUT, scored.dict())
            print(f"Scored event {raw.id}: confidence={confidence:.2f}")

        except Exception as e:
            print(f"Error processing message: {e}")

if __name__ == "__main__":
    start_consumer()
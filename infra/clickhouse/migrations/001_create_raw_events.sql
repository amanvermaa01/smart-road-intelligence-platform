CREATE TABLE IF NOT EXISTS traffic_events_raw
(
    event_time DateTime,
    lat Float64,
    lon Float64,
    severity UInt8,
    event_type LowCardinality(String),
    route_id String
)
ENGINE = MergeTree
PARTITION BY toDate(event_time)
ORDER BY (event_time, route_id)
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS traffic_heatmap_5m
(
    window_start DateTime,
    lat_bucket Int32,
    lon_bucket Int32,
    event_count UInt32,
    avg_severity Float32
)
ENGINE = SummingMergeTree
PARTITION BY toDate(window_start)
ORDER BY (window_start, lat_bucket, lon_bucket);

CREATE TABLE road_edges (
  id UUID PRIMARY KEY,
  source BIGINT NOT NULL,
  target BIGINT NOT NULL,

  geom GEOMETRY(LineString, 4326) NOT NULL,

  base_cost DOUBLE PRECISION NOT NULL,
  current_cost DOUBLE PRECISION NOT NULL,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enforce rule: base_cost must be positive
ALTER TABLE road_edges
ADD CONSTRAINT chk_base_cost_positive CHECK (base_cost > 0);

-- current_cost must be >= base_cost unless blocked
ALTER TABLE road_edges
ADD CONSTRAINT chk_current_cost_valid
CHECK (current_cost >= base_cost OR current_cost = 'Infinity');

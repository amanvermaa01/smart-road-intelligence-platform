-- Spatial indexes (CRITICAL for performance)
CREATE INDEX idx_road_edges_geom
ON road_edges USING GIST (geom);

CREATE INDEX idx_hazards_geom
ON hazards USING GIST (geom);

-- Protect base_cost from accidental updates
CREATE OR REPLACE FUNCTION prevent_base_cost_update()
RETURNS trigger AS $$
BEGIN
  IF NEW.base_cost <> OLD.base_cost THEN
    RAISE EXCEPTION 'base_cost is immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_base_cost_update
BEFORE UPDATE ON road_edges
FOR EACH ROW
EXECUTE FUNCTION prevent_base_cost_update();

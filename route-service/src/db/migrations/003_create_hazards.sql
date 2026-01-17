CREATE TABLE hazards (
  id UUID PRIMARY KEY,

  severity INT NOT NULL CHECK (severity BETWEEN 1 AND 5),

  geom GEOMETRY(Point, 4326) NOT NULL,

  radius_m INT NOT NULL CHECK (radius_m > 0),

  active BOOLEAN DEFAULT TRUE,

  expires_at TIMESTAMP NOT NULL,

  created_at TIMESTAMP DEFAULT NOW()
);

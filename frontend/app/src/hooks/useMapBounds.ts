import maplibregl from "maplibre-gl";

export const getBBoxFromMap = (map: maplibregl.Map) => {
  const bounds = map.getBounds();

  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
};

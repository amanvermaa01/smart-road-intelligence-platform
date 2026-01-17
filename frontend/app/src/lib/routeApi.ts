import { gql } from "@apollo/client";
import { client } from "./apollo-client";

const GET_ROUTE = gql`
  query GetRoute($startLat: Float!, $startLng: Float!, $endLat: Float!, $endLng: Float!) {
    getRoute(startLat: $startLat, startLng: $startLng, endLat: $endLat, endLng: $endLng) {
      id
      distanceMeters
      etaSeconds
      geometry
      alternativeRoute
      isBlocked
    }
  }
`;

export async function fetchRoute(
  start: [number, number],
  end: [number, number]
) {
  const { data } = await client.query({
    query: GET_ROUTE,
    variables: {
      startLat: start[1],
      startLng: start[0],
      endLat: end[1],
      endLng: end[0],
    },
    fetchPolicy: 'network-only'
  });

  return {
    id: data.getRoute.id,
    distance_meters: data.getRoute.distanceMeters,
    eta_seconds: data.getRoute.etaSeconds,
    geometry: data.getRoute.geometry,
    alternativeRoute: data.getRoute.alternativeRoute,
    isBlocked: data.getRoute.isBlocked,
  };
}

import { gql } from "@apollo/client";

export const LIVE_ALERTS_SUB = gql`
  subscription LiveAlerts($routeId: ID) {
    liveAlerts(routeId: $routeId) {
      id
      message
      severity
      routeId
    }
  }
`;

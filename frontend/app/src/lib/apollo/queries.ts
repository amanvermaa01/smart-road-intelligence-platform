import { gql } from "@apollo/client";


export const ROUTE_HAZARD_SUMMARY = gql`
query RouteHazardSummary($routeId: ID!) {
routeHazardSummary(routeId: $routeId) {
totalHazards
byType {
type
count
}
}
}
`;


export const EVENT_FEED = gql`
  query EventFeed($routeId: ID, $severityMin: Int, $type: String, $hoursAgo: Int) {
    eventFeed(routeId: $routeId, severityMin: $severityMin, type: $type, hoursAgo: $hoursAgo) {
      id
      type
      severity
      timestamp
      lat
      lng
      description
      upvotes
      downvotes
    }
  }
`;

export const VOTE_EVENT = gql`
  mutation VoteEvent($id: String!, $type: String!) {
    voteEvent(id: $id, type: $type)
  }
`;


"use client";

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

// --- HTTP link (Queries & Mutations)
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL || "http://localhost:3003/graphql",
  credentials: "include",
});

// --- WebSocket link (Subscriptions)
const wsLink = typeof window !== "undefined"
  ? new GraphQLWsLink(
      createClient({
        url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || "ws://localhost:3003/graphql",
        retryAttempts: 5,
      })
    )
  : null;

// --- Split based on operation type
const splitLink = typeof window !== "undefined" && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink
    )
  : httpLink;

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
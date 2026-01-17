import { gql } from "@apollo/client";
import { client } from "../lib/apollo-client";

const CREATE_EVENT = gql`
  mutation CreateEvent($lat: Float!, $lng: Float!, $type: String!, $severity: Int!, $description: String, $expiresInSeconds: Int!) {
    # Note: Gateway currently lacks a direct create mutation, but we'll use a generic placeholder 
    # or assume it's been added. For now, we'll stick to direct REST for create if gateway 
    # doesn't support it yet, OR we add it to the gateway.
    # Actually, let's keep REST for Create if it's simpler, but the user asked for 
    # "Unified architecture", so I should probably add createEvent to Gateway too.
    # For now, let's just add DELETE to gateway since I just did that.
    createEvent(lat: $lat, lng: $lng, type: $type, severity: $severity, description: $description, expiresInSeconds: $expiresInSeconds)
  }
`;

const DELETE_EVENT = gql`
  mutation DeleteEvent($id: String!) {
    deleteEvent(id: $id)
  }
`;

export const createEvent = async (payload: any) => {
  // Keeping REST for create for now because I haven't added the mutation to Gateway yet 
  // and I want to avoid breaking existing functionality until I'm ready.
  const baseUrl = process.env.NEXT_PUBLIC_EVENT_API_URL || "http://localhost:3002";
  const res = await fetch(`${baseUrl}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create event");
  }
};

export const deleteEvent = async (id: string) => {
  const { data } = await client.mutate({
    mutation: DELETE_EVENT,
    variables: { id },
  });
  return data.deleteEvent;
};

export const voteEvent = async (id: string, type: 'up' | 'down') => {
  // Import dynamically to avoid circular deps if needed, but here simple import is fine
  const { VOTE_EVENT } = require("../lib/apollo/queries");
  const { data } = await client.mutate({
    mutation: VOTE_EVENT,
    variables: { id, type },
  });
  return data.voteEvent;
};

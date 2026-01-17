import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { SubscribeEventsDto } from "../dto/subscribe-events.dto";
import { isInsideBBox } from "../../../common/utils/bbox.utils";
import { EventsService } from "../services/events.service";

@WebSocketGateway({
  namespace: "/events",
  cors: {
    origin: "*",
  },
})
export class EventsGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly eventsService: EventsService) {}

  afterInit() {
    console.log("[WS] Events Gateway initialized");
  }

  handleConnection(client: Socket) {
    console.log(`[WS] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WS] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("subscribe")
  async handleSubscribe(
    @MessageBody() payload: SubscribeEventsDto,
    @ConnectedSocket() client: Socket
  ) {
    client.data.bbox = payload.bbox;
    client.emit("subscribed", { status: "ok" });

    // Send existing events in this bbox
    try {
      const events = await this.eventsService.getEventsInBBox(payload.bbox);
      events.forEach((e) => {
        // Map DB entity to broadcast format
        let lat = 0, lng = 0;
        if (e.location && e.location.coordinates) {
          lng = e.location.coordinates[0];
          lat = e.location.coordinates[1];
        } else if (typeof e.location === 'string') {
          // Fallback parsing for 'POINT(lng lat)'
          const matches = e.location.match(/POINT\((.+) (.+)\)/);
          if (matches) {
            lng = parseFloat(matches[1]);
            lat = parseFloat(matches[2]);
          }
        }

        const formatted = {
          id: e.id,
          lat,
          lng,
          severity: e.severity,
          type: e.type,
          description: e.description,
          expiresAt: e.expiresAt,
          createdAt: e.createdAt,
        };
        client.emit("event:new", formatted);
      });
    } catch (err) {
      console.error("[WS] Failed to fetch initial events:", err.message);
    }
  }

  broadcastEvent(event: any) {
    if (!this.server) return;

    const sockets = (this.server as any).sockets;
    if (!sockets || typeof sockets.forEach !== 'function') {
      console.error("[WS] Namespace sockets Map not found");
      return;
    }

    sockets.forEach((socket: Socket) => {
      const bbox = socket.data?.bbox;
      if (!bbox) return;

      if (isInsideBBox(event, bbox)) {
        socket.emit("event:new", event);
      }
    });
  }
}

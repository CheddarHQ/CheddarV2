/**
 * @file durable_socket_server.ts
 * @description This file defines a Durable Object for handling WebSocket connections and room management
 */

import { DurableObject } from "cloudflare:workers";
import { Env } from "./interfaces";
import { generateClientId, heartBeat } from "./utils";

/**
 * @description Main fetch handler for the worker
 * @param request The incoming request
 * @param env Environment variables
 * @returns Response based on the request path
 */
export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1).split('/');

    if (!path[0]) {
      return new Response("Couldn't access path", { status: 400 });
    }

    switch (path[0]) {
      case "api":
        return handleApiRequest(path.slice(1), request, env);
      default:
        return new Response("Not found", { status: 404 });
    }
  }
}

/**
 * @description Handles API requests, particularly for room management
 * @param path Array of path segments
 * @param request The incoming request
 * @param env Environment variables
 * @returns Response based on the API request
 */
async function handleApiRequest(path: string[], request: Request, env: Env) {
  switch (path[0]) {
    case "room": {
      const roomName = path[1];

      if (!roomName) {
        if (request.method === "POST") {
          const id = env.rooms.newUniqueId();
          return new Response(id.toString(), { headers: { "Access-Control-Allow-Origin": "*" } });
        } else {
          return new Response("Method not allowed", { status: 405 });
        }
      }

      let id;
      if (roomName.match(/^[0-9a-f]{64}$/)) {
        id = env.rooms.idFromString(roomName);
      } else if (roomName.length <= 32) {
        id = env.rooms.idFromName(roomName);
      } else {
        return new Response("Name too long", { status: 400 });
      }

      const roomObject = env.rooms.get(id);

      const newUrl = new URL(request.url);
      newUrl.pathname = "/websocket" + path.slice(2).join("/");

      return roomObject.fetch(newUrl, request);
    }
    default:
      return new Response("Not found", { status: 404 });
  }
}

/**
 * @class durableSocketServer
 * @description Durable Object class for managing WebSocket connections
 */
export class durableSocketServer extends DurableObject {
  clients: Map<string, WebSocket>;
  state: DurableObjectState;
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    this.env = env;
    this.clients = new Map();
  }

  /**
   * @description Handles incoming requests to the Durable Object
   * @param request The incoming request
   * @returns Response or WebSocket connection
   */
  async fetch(request: Request) {
    const url = new URL(request.url);
    if (url.pathname === "/websocket") {
      const clientId = generateClientId();
      if (!clientId) {
        return new Response("Expected clientId", { status: 400 });
      }
      return this.handleWebSocket(request, clientId);
    }
    return new Response("Not Found", { status: 404 });
  }

  /**
   * @description Handles WebSocket connection setup
   * @param request The incoming WebSocket request
   * @param clientId Unique identifier for the client
   * @returns WebSocket connection response
   */
  async handleWebSocket(request: Request, clientId: string) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    server.accept();
    this.clients.set(clientId, server);

    console.log(`${clientId} joined the chat`);

    server.addEventListener("message", async (event) => {
      try {
        const message = JSON.parse(event.data as string);
        console.log(`Received message from client ${clientId}:`, message);
        this.broadcast({ type: "message", data: message.data });
      } catch (error) {
        console.error("Error processing message:", error);
        server.send(JSON.stringify({ type: "error", message: "Error processing your message" }));
      }
    });

    server.addEventListener('close', () => {
      this.clients.delete(clientId);
      server.close();
    });

    heartBeat(server, clientId, this.clients);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  /**
   * @description Broadcasts a message to all connected clients
   * @param message The message to broadcast
   */
  broadcast(message: string | object) {
    const messageString = typeof message === 'string' ? message : JSON.stringify(message);
    this.clients.forEach((client, clientId) => {
      try {
        client.send(messageString);
      } catch (error) {
        console.error(`Failed to send message to client ${clientId}:`, error);
        this.clients.delete(clientId);
      }
    });
  }
}

/**
 * @description Upgrades a connection to a WebSocket
 * @param req The incoming request
 * @param env Environment variables
 * @param roomName The name of the room to connect to
 * @returns Response from the Durable Object
 */
export async function upgradeConnection(
  req: Request, 
  env: Env,
  roomName: string
): Promise<Response> {
  try {
    const header = req.headers.get("Upgrade");
    if (header !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    let id: DurableObjectId = env.rooms.idFromName(roomName);
    let stub: DurableObjectStub = env.rooms.get(id);

    return await stub.fetch(req);
  } catch (error) {
    console.error("Error handling WebSocket upgrade:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
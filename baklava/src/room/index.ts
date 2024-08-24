/**
 * @file index.ts
 * @description This file contains code for the whole Durable Objects + websocket server
 */

import { DurableObject } from "cloudflare:workers";
import { Env } from "./interfaces";
import { upgradeConnection } from "./upgrade";
import { generateClientId, heartBeat } from "./utils";

const roomName = "baklavaChat";             // Name of the durable object


export default {
  async fetch(request: Request, env: Env) {
    // Parse the URL and route the request
    const url = new URL(request.url);
    const path = url.pathname.slice(1).split('/');

    console.log("Path:", path);

    if (!path[0]) {
      // Serve our HTML at the root path or handle root path differently
      return new Response("Couldn't access path", { status: 400 });
    }

    // Switch case to handle different paths
    switch (path[0]) {
      case "api":
        // This is a request for `/api/...`, call the API handler.
        return handleApiRequest(path.slice(1), request, env);

      default:
        return new Response("Not found", { status: 404 });
    }
  }
}

async function handleApiRequest(path: string[], request: Request, env: Env) {
  // Route the request based on the API path

  switch (path[0]) {
    case "room": {
      // Handle requests for `/api/room/...`
      // make sure all the users are connected to the same room from the frontend
      const roomName = path[1];

      if (!roomName) {
        // The request is for `/api/room`, no room ID/name specified
        if (request.method === "POST") {
          // POST to `/api/room` to create a private room
          const id = env.rooms.newUniqueId();
          return new Response(id.toString(), { headers: { "Access-Control-Allow-Origin": "*" } });
        } else {
          return new Response("Method not allowed", { status: 405 });
        }
      }

      // Route to the specific Durable Object for the room
      let id;
      if (roomName.match(/^[0-9a-f]{64}$/)) {
        // Treat as a hex-encoded unique ID
        id = env.rooms.idFromString(roomName);
      } else if (roomName.length <= 32) {
        // Treat as a string-derived room name
        id = env.rooms.idFromName(roomName);
      } else {
        return new Response("Name too long", { status: 400 });
      }

      const roomObject = env.rooms.get(id);

      // Forward the remaining path to the Durable Object
      const newUrl = new URL(request.url);
      newUrl.pathname = "/" + path.slice(2).join("/");

      return roomObject.fetch(newUrl, request);
    }

    default:
      return new Response("Not found", { status: 404 });
  }
}




export class durableSocketServer extends DurableObject {
  clients: Map<string, WebSocket>;          // Hashmap of client to the socket it corresponds to
  state: DurableObjectState;
  env: Env; 

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    this.env = env;
    this.clients = new Map();
  }

  async fetch(request: Request){
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

  async handleWebSocket(request: Request, clientId: string) {
    upgradeConnection(request, this.env, roomName); 
    
    const [client, server] = Object.values(new WebSocketPair());
    this.clients.set(clientId, server);

    server.accept();  //establish websocket connection
    console.log(`${clientId} joined the chat`);

    server.addEventListener("message", async (event) => {
      try {
        const message = JSON.parse(event.data as string); // Get this message from the frontend

        console.log(`Received message from client ${clientId}:`, message);
        
        // Broadcasting the received message to all clients
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
    
    return new Response(`${clientId} left the chat`, { status: 200 });
  }

  broadcast(message: string | object) {
    // Convert the message to a string if it's not already
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }

    // Iterate over all connected clients and send them the message
    this.clients.forEach((client, clientId) => {
      try {
        client.send(message);
      } catch (error) {
        console.error(`Failed to send message to client ${clientId}:`, error);
        this.clients.delete(clientId);
      }
    });
  }

  async getActiveUsersCount() {
    return this.clients.size;
  }
}

export type DurableRouter = typeof durableSocketServer;

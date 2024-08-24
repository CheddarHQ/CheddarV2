/**
 * @file index.ts
 * @description This file contains code for the whole Durable Objects + websocket server
 */

import { DurableObject } from "cloudflare:workers";
import { Env } from "./interfaces";
import { upgradeConnection } from "./upgrade";
import { generateClientId, heartBeat } from "./utils";

const roomName = "baklavaChat";             // Name of the durable object

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

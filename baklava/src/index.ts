/**
 * @file index.ts
 * @description This file contains code for the whole Durable Objects + websocket server
 */

import { DurableObject } from "cloudflare:workers";
import { Env } from "./room/interfaces";
import { upgradeConnection } from "./room/upgrade";
import { getAddress } from "./room/address";
import { handleClose } from "./room/closer";
import { generateClientId, heartBeat } from "./room/utils";

const roomName = "baklavaChat";             // name of the durable object 

export class DurableSocketServer extends DurableObject {
  clients: Map<string, WebSocket>;          // hashmap of client to the socket it corresponds to
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
    const webSocket = new WebSocketPair();
    const [client, server] = Object.values(new WebSocketPair());
    this.clients.set(clientId, server);

    server.accept();
    console.log(`${clientId} joined the chat`);

    server.addEventListener("message", async (event) => {
      try {
          const message = JSON.parse(event.data as string); // Get this message from the frontend

          console.log(`Received message from client ${clientId}:`, message);
          server.send(JSON.stringify({ type: "message", data: message.data }));

          // BROADCASTING THE MESSAGE
          this.clients.forEach((client) => {
            client.send(JSON.stringify({ type: "message", data: message.data }));
          });

      } catch (error) {
          console.error("Error processing message:", error);
          server.send(JSON.stringify({ type: "error", message: "Error processing your message" }));
      }
  });

    server.addEventListener('close', () => {
      handleClose(server, clientId, this.clients);
    });

    heartBeat(server, clientId, this.clients);
    
    return new Response(`${clientId} left the chat`, { status: 200 });
  }
}

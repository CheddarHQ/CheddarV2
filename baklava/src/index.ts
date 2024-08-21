/**
 * @file index.ts
 * @description This file contains code for the whole Durable Objects + websocket server
 */

import { DurableObject } from "cloudflare:workers";
import { Env } from "./room/interfaces";
import { upgradeConnection } from "./room/upgrade";
import { getAddress } from "./room/address";
import { handleMessanger } from "./room/messanger";
import { handleCloser } from "./room/closer";
import { handleHeartbeat } from "./room/heartbeat";

const name = "baklavaChat";             // name of the durable object 
// TODO: auto generate when scalling

export class DurableSocketServer extends DurableObject {
  clients: Map<string, WebSocket>; 
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
      const clientId = url.searchParams.get("clientId");      // NOT SECURE
      if (!clientId) {
        return new Response("Expected clientId", { status: 400 });
      }
        return this.handleWebSocket(request, clientId);
    }
    return new Response("Not Found", { status: 404 });
  }
async handleWebSocket(request: Request, clientId: string) {
    upgradeConnection(request, this.env, name); 
    const webSocket = new WebSocketPair();          
    const [client, server] = Object.values(new WebSocketPair());  // makes a client socket pair
    this.clients.set(clientId, server);                           // stores the pair in a map of id: socket
                                                                  // imp for scaling when we will have multiple durable objects

    server.accept(); // tells the durable that the connection is ready
    
    handleMessanger (server, clientId, this.clients);
    handleCloser(server, clientId, this.clients);
    handleHeartbeat(server, clientId, this.clients);

    return new Response(null, { status: 101, webSocket: client });
  }
}
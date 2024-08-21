/**
 * @file index.ts
 * @description This file contains code for the whole Durable Objects + websocket server
 */

import { DurableObject } from "cloudflare:workers";
import { Env } from "./room/interfaces";
import { upgradeConnection } from "./room/upgrade";
import { getAddress } from "./room/address";

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
      const clientId = url.searchParams.get("clientId");
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

    server.accept(); // accepts the connection
    
    eventListerner1(); // this listener will contain broadcasting pub/sub
    eventListerner2(); // this listener will contain the closing of connection and state of the client

    heatbeat(); // checks if the connection is still alive or not (might use ping only if internal in not
    // available as pinging quite inefficient)

    return new Response(null, { status: 101, webSocket: client });
  }
}
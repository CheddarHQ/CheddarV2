import axios from "axios";
import { DurableObject } from "cloudflare:workers";
import { Env } from "./interfaces";
// Client-side
// const websocket = new WebSocket('wss://example-websocket.signalnerve.workers.dev');


// Durable Object
export class WebSocketServer extends DurableObject {
    constructor(ctx, env) {
      super(ctx, env);
      this.clients = new Map();
    }
  
    // Sends a req to connect to the client and server
    // this will happen when the user will click enter Cheddar (my app name)
    // when the user clicks enter Cheddar, the client will send a request to the server
    // with upgrade: websocket
    async fetch(request) {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected WebSocket', { status: 426 });
      }

  // now we will retrieve the login id by the Auth we are using (supabase)
  // we will maybe keep the userid same or change it by hashing it or someshit like that
  // for security reasons
      const clientId = generateUniqueClientIdfromSupabase();
    // Creates pair of client and server, server will have mutiple pairs
      const [client, server] = Object.values(new WebSocketPair());
  
    //  After calling accept(), the WebSocket connection is live and can begin communication.
    // tells runtime that the connection is accepted and ready to recieve messages
      this.clients.set(clientId, server);
  
      // This is i think the message event listener that when a user sends a message
      // on the app it gets sent to the server and then the server sends it to all the clients
      // Does this also gets to the user who sent the message????
      server.addEventListener('message', (event) => {
        for (const [id, socket] of this.clients) {
          if (id !== clientId) {
            socket.send(`[Durable Object] Message from ${clientId}: ${event.data}`);
          }
        }
      });

      // This will trigger when the user closes the app
      // This will remove the client from the server
      server.addEventListener('close', () => {
        this.clients.delete(clientId);
      });
  
      return new Response(null, { status: 101, webSocket: client });
    }
  }
  
// 5000 users -> each send 100 messages in 1 day -> 500,000 messages -> 
// 1,000,000 requests per day
// 1,000,000 * 30 = 30,000,000 requests per month -> $4.5 / month

// Compute costs
// each user logged in for 4 hours/day -> 4 * 60 = 240 minutes -> 240 * 60 = 14,400 seconds
// each month -> 14,400 * 30 -> 432,000 for 1 durable object 
// assuiming 10 durable objects -> 4,320,000 secs
// 4,320,000 * 128 MB -> 552,960,000 MB-s / 1000 -> 552,960 GB-s 
// 552,960 - 400,000 (free) = 152,960 GB-s -> 0.15296 million GB-s 
// 0.15296 * 12.50 = $1.91     // compute costs

// D1 -> nil 

// kv cost -> like $20 for 10k users

// queues for 30,000,000 / month -> $40 (only for efficient messaging)

// r2 -> nill

// some image processing -> $10

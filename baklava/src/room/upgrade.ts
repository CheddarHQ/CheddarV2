/**
 * @file room/upgrade.ts
 * @description This file is responsible for upgrading the room to a websocket connections and all the edge cases 
 */
import { Env } from "./interfaces";
/**
 * @module upgradeConnection 
 * @description This function is responsible for upgrading the connection to a websocket connection
 * @returns Returns a promise forwarding the request to the durable object
 */
async function upgradeConnection(
    req: Request, 
    env: Env,
    name: string
    ): Promise<any> {
    try {
        const header = req.headers.get("Upgrade");

        if (header !== "websocket" || !header) {
            return new Response("Expected WebSocket", { status: 426 });
        }
        // extract ID of the durable object from the name 
        // let id = OBJECT_NAMESPACE.idFromString(hexId); id -> string
        let id = env.WEBSOCKET_SERVER.idFromName(name);
        let stub = env.WEBSOCKET_SERVER.get(id); // Client of the durable used to send messages

        return await stub.fetch(req);
        }
        catch (error) {
            console.error("Error handling WebSocket upgrade:", error);
            return new Response("Internal Server Error", { status: 500 });        }
    }

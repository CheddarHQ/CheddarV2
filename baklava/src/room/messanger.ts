import { broadcastMessage } from "./pubsub";

export async function handleMessanger(server: WebSocket, clientId: string, clients: Map<string, WebSocket>) {
    server.addEventListener("message", async (event) => {
        const message = JSON.parse(event.data as string);

        broadcastMessage(clients, message, clientId); // Pubsub
      });
    }
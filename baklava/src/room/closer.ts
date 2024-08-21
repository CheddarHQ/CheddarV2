export async function handleCloser(server: WebSocket, clientId: string, clients: Map<string, WebSocket>) {
    server.addEventListener("close", (cls: CloseEvent) => {
        // clients.delete(clientId);     MAKE BETTER
        server.close(cls.code, "Durable Object is closing WebSocket");
      });
}  
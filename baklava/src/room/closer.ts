export async function handleClose(server: WebSocket, clientId: string, clients: Map<string, WebSocket>) {
    server.addEventListener("close", (cls: CloseEvent) => {
        clients.delete(clientId);
        server.close(cls.code, "Durable Object is closing WebSocket");
      });
}  
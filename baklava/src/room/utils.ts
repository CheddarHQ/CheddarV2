export function getName() {

}

export function heartBeat(server: WebSocket, clientId: string, clients: Map<string, WebSocket>) {
    const intervalId = setInterval(() => {
      if (server.readyState === WebSocket.OPEN) {
        server.send(JSON.stringify({ type: "ping" }));
      } else {
        clearInterval(intervalId);
        clients.delete(clientId);
      }
    }, 30000);
}

export function generateClientId() {
    return Math.random().toString(36).substring(2, 15);
}
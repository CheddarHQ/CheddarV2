import Ably from 'ably';

export const broadCastMessage = (clientId: string, clients: Map<string, WebSocket>, message: string) => {

  const ably = new Ably.Realtime('23OSzg.9sDZtg:*****');
  console.log("pub/sub connected") 
}
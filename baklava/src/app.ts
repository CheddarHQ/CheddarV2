import { Hono } from 'hono';
import { Env } from './room/interfaces';
import { durableSocketServer } from './room';

const app = new Hono<{ Bindings: Env }>();

const roomName = "baklavaChat";

app.get('/websocket', async (c) => {
  const id = c.env.DURABLE_OBJECT.idFromName(roomName);
  const obj = c.env.DURABLE_OBJECT.get(id);
  const resp = await obj.fetch(c.req.raw);
  return resp;
});

export default {
    fetch: app.fetch,
    durableSocketServer
  };
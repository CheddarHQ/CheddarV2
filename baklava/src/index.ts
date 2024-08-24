import axios from 'axios';
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { logger } from 'hono/logger';
import { durableSocketServer } from './room';
import { upgradeConnection } from './room/upgrade';
import { Env } from './room/interfaces';

const app = new Hono()

app.use("*", logger());

//const apiRoutes = app.basePath("/api").route("durableSocketServer", durableSocketServer);


//TODO : define a zod schema for the message
// TODO : 

// app.get("/api/websocket", async (c)=>{
//   const req = c.req.raw
//   const env = c.env as Env
//   const response = await upgradeConnection(req, env, "baklavaChat")
//   return response;
// })


//route to send message
// app.post('/api/send-message', async (c) => {
//   const body = await c.req.json();


//   // Interact with your Durable Object
//   const response = await fetch(`${DURABLE_OBJECT_NAMESPACE}/websocket`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ type,data }),  //get the type from the zod schema (baad me dekhenge) -> z,object before async (c)
//   });

//   if (response.ok) {
//     return c.json({ success: true });
//   } else {
//     return c.json({ error: "Failed to send message" }, 500);
//   }
// });


//route to fetch the active users
app.get("/api/active-users", async (c)=>{
  const response = await axios.get(`${durableSocketServer}/getActiveUsersCount`);

  if(response.status ===200){
    const data = await response.data;
    return c.json({activeUser : data})
  }

})

export default app;
export type App = typeof app;
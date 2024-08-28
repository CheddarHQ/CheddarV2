import { Hono } from "hono";
import { logger } from "hono/logger";
import { userRouter } from "./users";

const app = new Hono()

app.use("*", logger());

const apiRoutes = app.basePath("/api")
                     .route("transaction", userRouter)



export default app;
export type App = typeof app;
export const fetch = app.fetch;
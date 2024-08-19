import { Hono } from "hono";
import { chartRouter } from "./chart";
import { dataRouter } from "./data";
import { buyRouter } from "./buy";
import { logger } from "hono/logger";
// import { serveStatic } from "hono/bun";

const app = new Hono()

app.use("*", logger());

const apiRoutes = app.basePath("/api")
                .route("buy", buyRouter)
                .route("data", dataRouter)
                .route("chart", chartRouter);

export default app;
export type App = typeof app;
export const fetch = app.fetch;
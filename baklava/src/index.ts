import axios from 'axios';
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { logger } from 'hono/logger';
import { durableSocketServer } from './room';

const app = new Hono()

app.use("*", logger());

const apiRoutes = app.basePath("/api")
                .route("durableSocketServer", durableSocketServer);

export default app;
export type App = typeof app;
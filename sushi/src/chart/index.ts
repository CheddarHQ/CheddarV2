/**
 * @file chart/index.ts
 * @description this file defines the main router for the application to fetch chart data
 */
import axios from 'axios';
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { querySchema } from "./schemas";

// TODO:
// We dont wanna show chart all the time can i just make one 24 hour call for 1440 data points and then
// remove 6 and 1 hr data from it when the user clicks to open chart and also cache it for 1 hour and as long its not hit again by the user it doesnt hit again

/**
 * @description Fetches the chart data for the specified token ticker for the last 24 hrs
 * @input ticker: the ticker of the token to fetch the chart data for
 * @returns an array of chart data of last 24 with 1 min interval (1440 data points)
 * @example http://<worker>/api/chart/fetchChart?ticker=SOL
 */ 

export const chartRouter = new Hono()
    .get("/fetchChart", zValidator("query", querySchema), async (c) => { const { ticker } = c.req.query();
            if (!ticker) {
                return c.json({
                    success: false,
                    error: {
                        issues: [
                            {
                                code: "invalid_type",
                                expected: "string",
                                received: "undefined",
                                path: ["ticker"],
                                message: "Ticker is required"
                            }
                        ]
                    }
                }, 400);
            }
            try {
                const response = await axios.get(
                    `https://min-api.cryptocompare.com/data/v2/histominute?fsym=${ticker}&tsym=SOL&limit=1440`
                );
                const data = response.data;
                if (!data || !data.Data || !data.Data.Data) {
                    throw new Error('Unexpected response format');
                }

                const chartData = data.Data.Data.map((point: any) => ({
                    time: new Date(point.time * 1000),  // converted to ms
                    open: point.open,
                    close: point.close,
                    high: point.high,
                    low: point.low,
                }));

                return c.json(chartData);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error('Axios error:', error.response?.data);
                    return c.json({ error: 'Failed to fetch data' }, 500);
                }
                console.error('General error:', error);
                return c.json({ error: 'Internal server error' }, 500);
            }
        }
    );

export type ChartRouter = typeof chartRouter;
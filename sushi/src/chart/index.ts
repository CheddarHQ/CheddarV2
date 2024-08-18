/**
 * @file chart/index.ts
 * @description this file defines the main router for the application to fetch chart data
 */

import { z } from 'zod';
import axios from 'axios';
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

// TODO:
// We dont wanna show chart all the time can i just make one 24 hour call for 1440 data points and then
// remove 6 and 1 hr data from it when the user clicks to open chart and also cache it for 1 hour and as long its not hit again by the user it doesnt hit again

/**
 * @description Fetches the chart data for the specified token ticker for the last 24 hrs
 * @input ticker: the ticker of the token to fetch the chart data for
 * @returns an array of chart data of last 24 with 1 min interval (1440 data points)
 */
export const chartRouter = new Hono()
    .get("/fetchChart", zValidator("json", z.object({ ticker: z.string() })), async (c) => {
        const { ticker } = c.body as unknown as { ticker: string };
        try {
            const response = await axios.get(
                `https://min-api.cryptocompare.com/data/v2/histominute?fsym=${ticker}&tsym=SOL&limit=1440`
            ); 
            const chartData = (response as any).Data.Data.map((point: any) => ({
                time: new Date(point.time * 1000),  // converted to ms 
                open: point.open,
                close: point.close,
                high: point.high,
                low: point.low,
            }));
            return c.json(chartData);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(error.response?.data);
                throw new Error('Failed to fetch data');
            }
            throw error;
        }
    });
export type ChartRouter = typeof chartRouter;
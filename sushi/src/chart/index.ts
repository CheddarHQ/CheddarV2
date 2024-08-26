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
.get("/fetchchart", zValidator("query", querySchema), async (c) => {
    const { ticker } = c.req.query();

    try {
        const response = await fetch(`https://min-api.cryptocompare.com/data/v2/histominute?fsym=${ticker}&tsym=USD&limit=1440`);
        const data = await response.json();

        // Ensure data is defined and structured as expected
        if (data && data.Data && data.Data.Data) {
            const chartData = data.Data.Data.map((point: any) => ({
                time: point.time,
                high: point.high,
                low: point.low,
                open: point.open,
                close: point.close,
            }));
            console.log(chartData);
            return c.json(chartData); // Return the data as a JSON response
        } else {
            console.error('Unexpected data format:', data);
            return c.json({ error: 'Unexpected data format' }, 500); // Return an error response
        }
    } catch (error) {
        console.error('Error fetching chart data:', error);
        return c.json({ error: 'Failed to fetch chart data' }, 500); // Return an error response
    }
});


export type ChartRouter = typeof chartRouter;
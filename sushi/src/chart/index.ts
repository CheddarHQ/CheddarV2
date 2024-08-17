/**
 * @file chart/index.ts
 * @description this file defines the main tRPC router for the application to fetch chart data
 */

import { publicProcedure, router} from "../trpc";
import { z } from 'zod';
import axios from 'axios';

export const approuter = router({

/**
 * @description Fetches the chart data for the specified token ticker for the last 24 hrs
 * @input ticker: the ticker of the token to fetch the chart data for
 * @returns an array of chart data of last 24 with 1 min interval (1440 data points)
 */
  fetchChart: publicProcedure
    .input(z.object({
      ticker: z.string(),
    }))

// TODO:
// We dont wanna show chart all the time can i just make one 24 hour call for 1440 data points and then
// remove 6 and 1 hr data from it when the user clicks to open chart and also cache it for 1 hour and as long its not hit again by the user it doesnt hit again
    .query(async ({ input }) => {
      try {
        const response = await axios.get(`https://min-api.cryptocompare.com/data/v2/histominute?fsym=${input.ticker}&tsym=SOL&limit=1440`);
        const chartData = response.data.map(point => ({
          time: new Date(point.time * 1000),  // converted to ms 
          open: point.open,
          close: point.close,
          high: point.high,
          low: point.low,
      }));
      return chartData;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data);
          throw new Error('Failed to fetch data');
        }
        throw error;
      }
    }),
})  
 

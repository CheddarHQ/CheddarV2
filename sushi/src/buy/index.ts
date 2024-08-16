import { publicProcedure, router } from '../trpc';
 import { z } from 'zod';
import axios from 'axios';

const appRouter = router({
    getQuote: publicProcedure
        .input(z.object({
            inputMint: z.string(),
            outputMint: z.string(),
            amount: z.number(),
            slippage: z.number().optional(),
            platformFees: z.number(),
        }))
        .query(async ({ input }) => {
        try {
            const response = await axios.get('https://quote-api.jup.ag/v6/quote', { 
                params: {
                    inputMint: input.inputMint,
                    outputMint: input.outputMint,
                    amount: input.amount,
                    slippage: input.slippage,
                    platformFeeBps: input.platformFees,
                  }
            });
            return response.data;       
            } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to fetch quote: ${error.message}`);
                }
            throw new Error('Failed to fetch quote');
            }
        }),
});

export default appRouter;

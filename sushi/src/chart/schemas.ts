/**
 * @file chart/schemas.ts
 * @description Schemas for validating data
 */
import { z } from "zod";

export const querySchema = z.object({
    ticker: z.string().nonempty("Ticker is required"),
});
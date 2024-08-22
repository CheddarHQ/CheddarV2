/**
 * @file donate/index.ts
 * @description This file defines the main router for the application to handle donation actions
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  VersionedTransaction,
} from '@solana/web3.js';
import { prepareTransaction } from './utils';
import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
} from '@solana/actions';

const DONATION_DESTINATION_WALLET = 'WALLETHAHHHAHH';
const DONATION_AMOUNT_SOL_OPTIONS = [1, 5, 10];
const DEFAULT_DONATION_AMOUNT_SOL = 1;

const paramsSchema = z.object({
  amount: z.string().optional(),
});

const bodySchema = z.object({
  account: z.string(),
});

/**
 * @description Handles donation actions including fetching donation info and processing donations
 * @returns Hono router for donation actions
 * @example http://<worker>/api/donate
 * @example http://<worker>/api/donate/5
 */
export const donateRouter = new Hono()
  .get('/', async (c) => {
    const { icon, title, description } = getDonateInfo();
    const amountParameterName = 'amount';
    const response: ActionGetResponse = {
      type: 'action',
      icon,
      label: `${DEFAULT_DONATION_AMOUNT_SOL} SOL`,
      title,
      description,
      links: {
        actions: [
          ...DONATION_AMOUNT_SOL_OPTIONS.map((amount) => ({
            label: `${amount} SOL`,
            href: `/api/donate/${amount}`,
          })),
          {
            href: `/api/donate/{${amountParameterName}}`,
            label: 'Donate',
            parameters: [
              {
                name: amountParameterName,
                label: 'Enter a custom SOL amount',
              },
            ],
          },
        ],
      },
    };
    return c.json(response);
  })
  .get('/:amount', zValidator('param', paramsSchema), async (c) => {
    const { amount } = c.req.param();
    const { icon, title, description } = getDonateInfo();
    const response: ActionGetResponse = {
      type: 'action',
      icon,
      label: `${amount} SOL`,
      title,
      description,
    };
    return c.json(response);
  })
  .post('/:amount', zValidator('param', paramsSchema), zValidator('json', bodySchema), async (c) => {
    const { amount } = c.req.param();
    const { account } = await c.req.json<ActionPostRequest>();

    const parsedAmount = parseFloat(amount || DEFAULT_DONATION_AMOUNT_SOL.toString());
    const transaction = await prepareDonateTransaction(
      new PublicKey(account),
      new PublicKey(DONATION_DESTINATION_WALLET),
      parsedAmount * LAMPORTS_PER_SOL,
    );
    const response: ActionPostResponse = {
      transaction: Buffer.from(transaction.serialize()).toString('base64'),
    };
    return c.json(response);
  });

function getDonateInfo(): Pick<ActionGetResponse, 'icon' | 'title' | 'description'> {
  return {
    icon: 'https://ucarecdn.com/7aa46c85-08a4-4bc7-9376-88ec48bb1f43/-/preview/880x864/-/quality/smart/-/format/auto/',
    title: 'Donate to Cheddar',
    description: 'Support our app by donating SOL to help us cover server costs and keep the app running!',
  };
}

async function prepareDonateTransaction(
  sender: PublicKey,
  recipient: PublicKey,
  lamports: number,
): Promise<VersionedTransaction> {
  const payer = new PublicKey(sender);
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: new PublicKey(recipient),
      lamports: lamports,
    }),
  ];
  return prepareTransaction(instructions, payer);
}

export type DonateRouter = typeof donateRouter;
/**
 * @file memo/index.ts
 * @description This file defines the main router for the application to handle memo actions
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  VersionedTransaction,
} from '@solana/web3.js';
import { prepareTransaction } from './utils';
import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  MEMO_PROGRAM_ID,
} from '@solana/actions';

const MEMO_DESTINATION_WALLET = 'CHEEDARWALLET';

const paramsSchema = z.object({
  memo: z.string().optional(),
});

const bodySchema = z.object({
  account: z.string(),
});

/**
 * @description Handles memo actions including fetching memo info and processing memo transactions
 * @returns Hono router for memo actions
 * @example http://<worker>/api/memo
 * @example http://<worker>/api/memo/Hello%20world!
 */
export const memoRouter = new Hono()
  .get('/', async (c) => {
    const { icon, title, description } = getMemoInfo();
    const memoParameterName = 'memo';
    const response: ActionGetResponse = {
      type: 'action',
      icon,
      label: 'Send a Memo',
      title,
      description,
      links: {
        actions: [
          {
            href: `/api/memo/{${memoParameterName}}`,
            label: 'Send a message',
            parameters: [
              {
                name: memoParameterName,
                label: 'Enter a custom message',
              },
            ],
          },
        ],
      },
    };
    return c.json(response);
  })
  .get('/:memo', zValidator('param', paramsSchema), async (c) => {
    const { memo } = c.req.param();
    const { icon, title, description } = getMemoInfo();
    const response: ActionGetResponse = {
      type: 'action',
      icon,
      label: `Message: ${memo}`,
      title,
      description,
    };
    return c.json(response);
  })
  .post('/:memo', zValidator('param', paramsSchema), zValidator('json', bodySchema), async (c) => {
    const { memo } = c.req.param();
    const { account } = await c.req.json<ActionPostRequest>();

    const transaction = await prepareMemoTransaction(
      new PublicKey(account),
      new PublicKey(MEMO_DESTINATION_WALLET),
      memo || 'Hello world!',
    );

    const response: ActionPostResponse = {
      transaction: Buffer.from(transaction.serialize()).toString('base64'),
      message: `Sent a message to Cheedar: ${memo}`,
    };
    return c.json(response);
  });

function getMemoInfo(): Pick<ActionGetResponse, 'icon' | 'title' | 'description'> {
  return {
    icon: 'https://ucarecdn.com/7aa46c85-08a4-4bc7-9376-88ec48bb1f43/-/preview/880x864/-/quality/smart/-/format/auto/',
    title: 'Send a Memo',
    description: 'Send a memo to Cheddar to say hello!',
  };
}

async function prepareMemoTransaction(
  sender: PublicKey,
  recipient: PublicKey,
  memoData: string,
): Promise<VersionedTransaction> {
  const payer = new PublicKey(sender);
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: recipient,
      lamports: 1,
    }),
    new TransactionInstruction({
      programId: new PublicKey(MEMO_PROGRAM_ID),
      data: Buffer.from(memoData, 'utf8'),
      keys: [],
    }),
  ];
  return prepareTransaction(instructions, payer);
}

export type MemoRouter = typeof memoRouter;

import { Button } from 'react-native';
import { FC } from 'react';
import { useDynamic } from '~/client';
import { dynamicClient } from '~/client';

import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  Connection
} from '@solana/web3.js';

interface Send1SolButtonProps {
  destinationAddress: string;
}

/**
 * Renders a button that sends 1 SOL to a given address.
 */
export const Send1SolButton: FC<Send1SolButtonProps> = ({ destinationAddress }) => {
  const send = async () => {
    const wallet = dynamicClient.wallets.primary;

    if (!wallet) return;

    // const connection = dynamicClient.solana.getConnection();
    const connection = new Connection('https://api.devnet.solana.com');

    const signer = dynamicClient.solana.getSigner({ wallet });

    const { blockhash } = await connection.getLatestBlockhash();
    const amountInLamports = 1 * LAMPORTS_PER_SOL;
    const fromKey = new PublicKey(wallet.address);
    const toKey = new PublicKey(destinationAddress);

    const instructions = [
      SystemProgram.transfer({
        fromPubkey: fromKey,
        lamports: amountInLamports,
        toPubkey: toKey,
      }),
    ];

    const messageV0 = new TransactionMessage({
      instructions,
      payerKey: fromKey,
      recentBlockhash: blockhash,
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    const { signature } = await signer.signAndSendTransaction(transaction);

    console.log('Successful transaction signature:', signature);
  };

  return <Button title="Send" onPress={send} />;
};

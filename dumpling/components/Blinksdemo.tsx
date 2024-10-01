import { useAction, type ActionAdapter } from '@dialectlabs/blinks';
import { Blink } from '@dialectlabs/blinks-react-native';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import bs58 from 'bs58';

interface PhantomAdapterProps {
  dappKeyPair: any;
  sharedSecret: Uint8Array | null;
  setSharedSecret: (secret: Uint8Array) => void;
  setSession: (session: string) => void;
  phantomWalletPublicKey: PublicKey | null;
  setPhantomWalletPublicKey: (key: PublicKey) => void;
  decryptPayload: (data: string, nonce: string, sharedSecret: Uint8Array) => any;
  encryptPayload: (payload: any, sharedSecret: Uint8Array) => [Uint8Array, Uint8Array];
  onConnectRedirectLink: string;
  session: string;
  navigation: any;
}

function getPhantomWalletAdapter({
  dappKeyPair,
  sharedSecret,
  setSharedSecret,
  setSession,
  phantomWalletPublicKey,
  setPhantomWalletPublicKey,
  decryptPayload,
  encryptPayload,
  onConnectRedirectLink,
  session,
  navigation
}: PhantomAdapterProps): ActionAdapter {
  const [deeplink, setDeepLink] = useState<string | null>(null);

  useEffect(() => {
    const initializeDeeplinks = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        setDeepLink(initialUrl);
      }
    };
    initializeDeeplinks();
  }, []);

  return {
    connect: async (_context) => {
      return new Promise((resolve, reject) => {
        const handleDeepLink = ({ url }: { url: string }) => {
          const parsedUrl = new URL(url);
          const params = parsedUrl.searchParams;

          if (/onConnect/.test(parsedUrl.pathname)) {
            try {
              const phantomPublicKey = params.get('phantom_encryption_public_key');
              const data = params.get('data');
              const nonce = params.get('nonce');

              if (!phantomPublicKey || !data || !nonce) {
                throw new Error('Missing required parameters');
              }

              const sharedSecretDapp = nacl.box.before(
                bs58.decode(phantomPublicKey),
                dappKeyPair.secretKey
              );

              const connectData = decryptPayload(data, nonce, sharedSecretDapp);

              setSharedSecret(sharedSecretDapp);
              setSession(connectData.session);
              
              if (connectData.public_key) {
                const publicKey = new PublicKey(connectData.public_key);
                setPhantomWalletPublicKey(publicKey);
                resolve(publicKey.toString());
              }

              Linking.removeEventListener('url', handleDeepLink);
            } catch (error) {
              reject(error);
            }
          }
        };

        Linking.addEventListener('url', handleDeepLink);

        const params = new URLSearchParams({
          dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
          cluster: 'mainnet-beta',
          app_url: 'https://phantom.app',
          redirect_link: onConnectRedirectLink,
        });
        
        const url = `phantom://connection/v1/connect?${params.toString()}`;
        Linking.openURL(url).catch(reject);
      });
    },

    signTransaction: async (transaction: Transaction | VersionedTransaction, _context) => {
      return new Promise((resolve, reject) => {
        if (!sharedSecret || !phantomWalletPublicKey) {
          reject(new Error('Wallet not connected'));
          return;
        }

        const handleDeepLink = ({ url }: { url: string }) => {
          const parsedUrl = new URL(url);
          const params = parsedUrl.searchParams;

          if (/onSignAndSendTransaction/.test(parsedUrl.pathname)) {
            try {
              const signAndSendTransactionData = decryptPayload(
                params.get('data')!,
                params.get('nonce')!,
                sharedSecret
              );

              resolve({
                signature: signAndSendTransactionData.signature,
              });

              Linking.removeEventListener('url', handleDeepLink);
              navigation.navigate('crypto');
            } catch (error) {
              reject(error);
              navigation.navigate('crypto');
            }
          }
        };

        Linking.addEventListener('url', handleDeepLink);

        const serializedTransaction = transaction.serialize({
          requireAllSignatures: false,
        });

        const payload = {
          session,
          transaction: bs58.encode(serializedTransaction),
        };

        const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

        const params = new URLSearchParams({
          dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
          nonce: bs58.encode(nonce),
          redirect_link: onConnectRedirectLink,
          payload: bs58.encode(encryptedPayload),
        });

        const url = `phantom://signAndSendTransaction?${params.toString()}`;
        Linking.openURL(url).catch(reject);
      });
    },

    confirmTransaction: async (_signature, _context) => {
      // Implement if needed based on your requirements
      console.log('confirmTransaction');
    },
  };
}

export const PhantomBlinkIntegration: React.FC<{
  url: string;
  adapterProps: PhantomAdapterProps;
}> = ({ url, adapterProps }) => {
  const adapter = getPhantomWalletAdapter(adapterProps);
  const { action } = useAction({ url, adapter });

  if (!action) {
    return null; // or your loading component
  }

  const actionUrl = new URL(url);
  return (
    <Blink
      theme={{
        '--blink-button': '#1D9BF0',
        '--blink-border-radius-rounded-button': 9999,
      }}
      action={action}
      websiteUrl={actionUrl.href}
      websiteText={actionUrl.hostname}
    />
  );
};

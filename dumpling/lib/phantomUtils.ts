// phantomUtils.ts

import { Buffer } from 'buffer';
import * as Linking from 'expo-linking';
import * as Random from 'expo-crypto';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { Transaction, PublicKey, Connection } from '@solana/web3.js';
import { encryptPayload } from '~/utils/ecryptPayload';
import { decryptPayload } from '~/utils/decryptPayload';
import { saveConnectionDetails, clearConnectionDetails } from '~/utils/asyncStorage';

// Constants
const onConnectRedirectLink = Linking.createURL('onConnect');
const onDisconnectRedirectLink = Linking.createURL('onDisconnect');
const onSignAndSendTransactionRedirectLink = Linking.createURL('onSignAndSendTransaction');
const useUniversalLinks = false;
const connection = new Connection('https://api.mainnet-beta.solana.com');

nacl.setPRNG((x, n) => {
  const randomBytes = Random.getRandomBytes(n);
  for (let i = 0; i < n; i++) {
    x[i] = randomBytes[i];
  }
});

const buildUrl = (path: string, params: URLSearchParams) =>
  `${useUniversalLinks ? 'https://phantom.app/ul/' : 'phantom://'}v1/${path}?${params.toString()}`;

export class PhantomWallet {
  private dappKeyPair: nacl.BoxKeyPair;
  private sharedSecret: Uint8Array | null = null;
  private session: string | null = null;
  private phantomWalletPublicKey: PublicKey | null = null;

  constructor() {
    this.dappKeyPair = nacl.box.keyPair();
  }

  async connect(setConnectionStatus: (status: string) => void) {
    console.log('Initiating connection...');
    setConnectionStatus('connecting');
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(this.dappKeyPair.publicKey),
      cluster: 'mainnet-beta',
      app_url: 'https://phantom.app',
      redirect_link: onConnectRedirectLink,
    });
    const url = buildUrl('connect', params);
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening URL:', error);
      setConnectionStatus('disconnected');
    }
  }

  async disconnect(setConnectionStatus: (status: string) => void) {
    if (!this.sharedSecret || !this.session) {
      console.error('No shared secret or session available for disconnection');
      setConnectionStatus('disconnected');
      return;
    }
    
    const payload = { session: this.session };
    const [nonce, encryptedPayload] = encryptPayload(payload, this.sharedSecret);
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(this.dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onDisconnectRedirectLink,
      payload: bs58.encode(encryptedPayload),
    });
    
    const url = buildUrl('disconnect', params);
    try {
      await Linking.openURL(url);
      await clearConnectionDetails();
    } catch (error) {
      console.error('Error opening URL:', error);
      setConnectionStatus('connected');
    }
  }

  async signAndSendTransaction(transaction: Transaction) {
    if (!this.phantomWalletPublicKey || !this.sharedSecret || !this.session) return;

    transaction.feePayer = this.phantomWalletPublicKey;

    const payload = {
      session: this.session,
      transaction: bs58.encode(
        transaction.serialize({
          requireAllSignatures: false,
        })
      ),
    };

    const [nonce, encryptedPayload] = encryptPayload(payload, this.sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(this.dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onSignAndSendTransactionRedirectLink,
      payload: bs58.encode(encryptedPayload),
    });

    const url = buildUrl('signAndSendTransaction', params);
    await Linking.openURL(url);
  }

  handleDeepLink(url: string, navigation: any, setConnectionStatus: (status: string) => void) {
    const parsedUrl = new URL(url);
    const params = parsedUrl.searchParams;

    if (params.get('errorCode')) {
      const error = Object.fromEntries([...params]);
      console.error('Phantom error:', error?.errorMessage ?? JSON.stringify(error, null, 2));
      navigation.navigate('crypto');
      return;
    }

    if (/onConnect/.test(parsedUrl.pathname)) {
      this.handleConnect(params, setConnectionStatus, navigation);
    } else if (/onDisconnect/.test(parsedUrl.pathname)) {
      this.handleDisconnect(setConnectionStatus, navigation);
    } else if (/onSignAndSendTransaction/.test(parsedUrl.pathname)) {
      this.handleSignAndSendTransaction(params, navigation);
    }
  }

  private handleConnect(params: URLSearchParams, setConnectionStatus: (status: string) => void, navigation: any) {
    try {
      const phantomPublicKey = params.get('phantom_encryption_public_key');
      const data = params.get('data');
      const nonce = params.get('nonce');

      if (!phantomPublicKey || !data || !nonce) {
        throw new Error('Missing required parameters');
      }

      const sharedSecretDapp = nacl.box.before(
        bs58.decode(phantomPublicKey),
        this.dappKeyPair.secretKey
      );

      const connectData = decryptPayload(data, nonce, sharedSecretDapp);

      this.sharedSecret = sharedSecretDapp;
      this.session = connectData.session;
      this.phantomWalletPublicKey = connectData.public_key ? new PublicKey(connectData.public_key) : null;

      setConnectionStatus('connected');

      const connectionData = {
        sharedSecret: sharedSecretDapp,
        session: connectData.session,
        phantomWalletPublicKey: connectData.public_key,
      };

      saveConnectionDetails(connectionData);
      navigation.navigate('crypto');
    } catch (error) {
      console.error('Error processing onConnect:', error);
      navigation.navigate('crypto');
    }
  }

  private handleDisconnect(setConnectionStatus: (status: string) => void, navigation: any) {
    this.phantomWalletPublicKey = null;
    this.sharedSecret = null;
    this.session = null;
    setConnectionStatus('disconnected');
    clearConnectionDetails();
    navigation.navigate('crypto');
  }

  private handleSignAndSendTransaction(params: URLSearchParams, navigation: any) {
    try {
      if (!this.sharedSecret) throw new Error('No shared secret available');
      const signAndSendTransactionData = decryptPayload(
        params.get('data')!,
        params.get('nonce')!,
        this.sharedSecret
      );
      console.log('signAndSendTransaction:', signAndSendTransactionData);
    } catch (error) {
      console.error('onSignAndSendTransaction Error:', error);
    } finally {
      navigation.navigate('crypto');
    }
  }

  // Getters
  getPhantomWalletPublicKey() { return this.phantomWalletPublicKey; }
  getSharedSecret() { return this.sharedSecret; }
  getSession() { return this.session; }
}

export const phantomWallet = new PhantomWallet();
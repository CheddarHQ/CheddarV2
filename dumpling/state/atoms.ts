import { PublicKey } from '@solana/web3.js';
import { atom } from 'recoil';
import { MessageProps } from '~/app/(tabs)/Chat';
import { UserProfile } from '~/components/Auth';

export interface detailedInfoProps {
  chainId: string;
  baseAddress: string;
  name: string;
  symbol: string;
  priceUsd: string;
  priceNative: string;
  imageUrl: string;
}

export const userAtom = atom({
  key: 'userAtom',
  default: {} as UserProfile,
});

export const messagesAtom = atom({
  key: 'messages',
  default: [] as MessageProps[],
});

export const phantomStatus = atom({
  key: 'phantomStatus',
  default: 'disconnected',
});

export const phantomPublicKey = atom({
  key: 'phantomId',
  default: {} as PublicKey | null,
});

export const outputMintAtom = atom({
  key: 'outputMint',
  default: '',
});

export const chainIdAtom = atom({
  key: 'chainId',
  default: 'solana',
});

export const inputMintAtom = atom({
  key: 'inputMint',
  default: 'So11111111111111111111111111111111111111112',
});

export const sharedSecretAtom = atom({
  key: 'sharedSecret',
  default: {} as Uint8Array,
});

export const detailedInfoAtom = atom({
  key: 'detailedInfoAtom',
  default: {} as string,
});

export const phantomSessionAtom = atom({
  key: 'phantomSession',
  default: '' as undefined | string,
});

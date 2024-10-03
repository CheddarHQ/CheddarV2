import { PhantomAdapterProps } from "~/app/(tabs)/Blinks";
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { NavigationProp } from '@react-navigation/native';

export const adapterProps: PhantomAdapterProps = {
    dappKeyPair: {
      publicKey: new Uint8Array(),
      secretKey: new Uint8Array(),
    },
    sharedSecret: null,
    setSharedSecret: (secret: Uint8Array) => {},
    setSession: (session: string) => {},
    phantomWalletPublicKey: null,
    setPhantomWalletPublicKey: (key: PublicKey) => {},
    decryptPayload: (data: string, nonce: string, sharedSecret: Uint8Array) => {
      return {};
    },
    encryptPayload: (payload: any, sharedSecret: Uint8Array) => {
      return [new Uint8Array(), new Uint8Array()];
    },
    onConnectRedirectLink: 'your-redirect-link',
    session: '',
    navigation: {} as NavigationProp<any>,
  };

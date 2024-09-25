import { Buffer } from 'buffer';
global.Buffer = Buffer;
import { Dimensions, Pressable } from 'react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { TabsContentProps } from 'tamagui';
import Feather from '@expo/vector-icons/Feather';
import { Text, SizableText, Tabs, XStack, YStack, Button, Card, CardHeader, Avatar } from 'tamagui';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Link, useLocalSearchParams, useGlobalSearchParams } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import * as Random from 'expo-crypto';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  VersionedTransaction,
  Transaction,
} from '@solana/web3.js';
import React, { useEffect, useCallback, useRef, useState } from 'react';
import nacl from 'tweetnacl';
import { encryptPayload } from '~/utils/ecryptPayload';
import Toast from 'react-native-toast-message';
import { decryptPayload } from '~/utils/decryptPayload';
import bs58 from 'bs58';
import Button2 from '~/components/Button2';
import Web3Button from '~/components/ButtonCustom';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRecoilValue, SetRecoilState } from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveConnectionDetails,
  getConnectionDetails,
  clearConnectionDetails,
} from '~/utils/asyncStorage';

import {
  phantomStatus,
  phantomPublicKey,
  outputMintAtom,
  chainIdAtom,
  inputMintAtom,
  sharedSecretAtom,
  detailedInfoAtom,
  phantomSessionAtom,
} from '~/state/atoms';

import HorizontalTabs from '~/components/HorizontalTabs';

import { detailedInfoProps } from '~/state/atoms';
import { phantomSelector } from '~/state/selectors';
import SwipeButton from '~/components/SwipeButton';
import { BlurView } from 'expo-blur';

nacl.setPRNG((x, n) => {
  const randomBytes = Random.getRandomBytes(n);
  for (let i = 0; i < n; i++) {
    x[i] = randomBytes[i];
  }
});

const onConnectRedirectLink = Linking.createURL('onConnect');
const onDisconnectRedirectLink = Linking.createURL('onDisconnect');
const onSignAndSendTransactionRedirectLink = Linking.createURL('onSignAndSendTransaction');

const connection = new Connection('https://api.mainnet-beta.solana.com');

const useUniversalLinks = false; // set as true when deploying to production

const buildUrl = (path: string, params: URLSearchParams) =>
  `${useUniversalLinks ? 'https://phantom.app/ul/' : 'phantom://'}v1/${path}?${params.toString()}`;

const NETWORK = clusterApiUrl('mainnet-beta');

export interface TokenBasicInfo {
  name: string;
  baseAddress: string;
  priceUsd: string;
  priceNative: string;
  imageUrl: string;
  priceChange: number;
  symbol: string;
}

interface TokenData {
  basicInfo: TokenBasicInfo[];
  detailedInfo: detailedInfoProps[]; // You can define a more specific type for detailedInfo if needed
}

const { width } = Dimensions.get('window');

const MoneyEx = () => {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deeplink, setDeepLink] = useState('');
  const [dappKeyPair] = useState(nacl.box.keyPair());

  const setSharedSecret = useSetRecoilState<Uint8Array>(sharedSecretAtom);

  const { sharedSecret, session, phantomWalletPublicKey, chainId } =
    useRecoilValue(phantomSelector);
  const setPhantomWalletPublicKey = useSetRecoilState(phantomPublicKey);

  console.log('Loggin secret using selector : ', sharedSecret);
  console.log('Loggin session using selector : ', session);
  console.log('Loggin phantomWalletPublicKey using selector : ', phantomWalletPublicKey);
  console.log('Loggin chainId using selector : ', chainId);

  // const [connectionStatus, setConnectionStatus] = useRecoilState(phantomStatus);

  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const setSession = useSetRecoilState(phantomSessionAtom);

  const outputMintAddress = useRecoilValue(outputMintAtom);
  const inputMintAddress = useRecoilValue(inputMintAtom);

  const setDetailedInfo = useSetRecoilState(detailedInfoAtom);

  console.log('OutputMintAddress : ', outputMintAddress);
  console.log('InputMintAddress : ', inputMintAddress);

  const handleDeepLink = useCallback(
    ({ url }: { url: string }) => {
      console.log('Received deeplink:', url);
      const parsedUrl = new URL(url);
      setDeepLink(url);

      console.log('Parsed url after returning from phantom :', parsedUrl);

      // Check if this is a return from Phantom
      if (parsedUrl.pathname.includes('onConnect')) {
        console.log('Returning from Phantom connection');

        // You might need to fetch or construct detailedInfo here
        // For now, let's set a placeholder
        // setDetailedInfo({
        //   chainId: 'solana',
        //   baseAddress: '',
        // });
      }
    },
    [setDetailedInfo]
  );

  const attemptReconnection = async () => {
    try {
      console.log('AttemptReconnection ran');
      const savedConnection = await getConnectionDetails();

      console.log('Saved connection : ', savedConnection);

      if (session) {
        console.log('Shared secret fromm saved connection : ', savedConnection.sharedSecret);

        // setSession(savedConnection.session);
        // setPhantomWalletPublicKey(new PublicKey(savedConnection.phantomWalletPublicKey));
        // setSharedSecret(savedConnection.sharedSecret)

        // setSession(session);
        // setPhantomWalletPublicKey(new PublicKey(phantomWalletPublicKey));
        // setSharedSecret(sharedSecret)
        console.log('Reconnection logs');
        console.log('public Key : ', phantomWalletPublicKey);
        console.log('shared secret : ', sharedSecret);
        console.log('session Id :', session);

        // setConnectionStatus('connected');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      console.log("Couldn't reconnect to phantom");
    }
  };

  useEffect(() => {
    // attempt reconnection
    console.log('Attempting reconnection');
    attemptReconnection();

    //  if(connectionStatus!=='connected'){
    //   connect();
    //  }
  }, []);

  useEffect(() => {
    const initializeDeeplinks = async () => {
      const initialUrl = await Linking.getInitialURL();
      console.log('Initial URL:', initialUrl);
      if (initialUrl) {
        setDeepLink(initialUrl);
      }
    };
    initializeDeeplinks();

    const listener = Linking.addEventListener('url', handleDeepLink);
    return () => {
      listener.remove();
    };
  }, [handleDeepLink]);

  useEffect(() => {
    console.log('Line 373');
    if (!deeplink) return;
    const url = new URL(deeplink);
    const params = url.searchParams;
    console.log('Params on line 377 :', params);
    console.log('URL on line 377 :', url);
    console.log('Line 377');

    if (params.get('errorCode')) {
      const error = Object.fromEntries([...params]);
      const message = error?.errorMessage ?? JSON.stringify(error, null, 2);
      console.error('Phantom error:', message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });

      navigation.navigate('crypto');
      return;
    }

    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;

    if (/onConnect/.test(url.pathname)) {
      console.log('Handling onConnect');
      try {
        //phantomPublicKey ----> encrypted key
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

        console.log('connect data public key : ', connectData.public_key);
        console.log('PhantompublicKey : ', phantomPublicKey);

        console.log('Connect Data : ', connectData);

        setSharedSecret(sharedSecretDapp);

        setSession(connectData.session);

        if (connectData.public_key) {
          console.log('Public key obtained');
          setPhantomWalletPublicKey(connectData.public_key);
        }

        setConnectionStatus('connected');
        console.log(`Connected to ${connectData.public_key?.toString()}`);
        const connectionData = {
          sharedSecret: sharedSecretDapp,
          session: connectData.session,
          phantomWalletPublicKey: connectData.public_key,
        };

        console.log('Connection data to be saved : ', connectionData);
        const saveConnection = async () => {
          await saveConnectionDetails(connectionData);
        };

        saveConnection();

        navigation.navigate('crypto');
      } catch (error) {
        console.error('Error processing onConnect:', error);
        navigation.navigate('crypto');
      }
    }

    if (/onDisconnect/.test(url.pathname)) {
      try {
        console.log('Handling onDisconnect');
        setPhantomWalletPublicKey(null);
        setConnectionStatus('disconnected');
        async function disconnect() {
          await clearConnectionDetails();
        }

        disconnect();

        console.log('Disconnected');
        navigation.navigate('crypto');
      } catch (error) {
        console.error('onDisconnect Error : ', error);
        navigation.navigate('crypto');
      }
    }

    if (/onSignAndSendTransaction/.test(url.pathname)) {
      try {
        console.log('Handling onSignAndSendTransaction');
        const signAndSendTransactionData = decryptPayload(
          params.get('data')!,
          params.get('nonce')!,
          sharedSecret
        );
        console.log('signAndSendTrasaction: ', signAndSendTransactionData);
        navigation.navigate('crypto');
      } catch (error) {
        console.error('onSignAndSendTransaction Error : ', error);
        navigation.navigate('crypto');
      }
    }
  }, [deeplink, dappKeyPair.secretKey]);

  const connect = async () => {
    console.log('Initiating connection...');
    setConnectionStatus('connecting');
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      cluster: 'mainnet-beta',
      app_url: 'https://phantom.app',
      redirect_link: onConnectRedirectLink,
    });
    const url = buildUrl('connect', params);
    console.log('Connection URL:', url);
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening URL:', error);
      setConnectionStatus('disconnected');
    }
  };

  const disconnect = async () => {
    console.log('Initiating disconnection...');
    setConnectionStatus('disconnecting');
    if (!sharedSecret) {
      console.error('No shared secret available for disconnection');
      setConnectionStatus('disconnected');
      return;
    }
    const payload = { session };
    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      redirect_link: onDisconnectRedirectLink,
      payload: bs58.encode(encryptedPayload),
    });
    const url = buildUrl('disconnect', params);
    console.log('Disconnection URL:', url);
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening URL:', error);
      setConnectionStatus('connected');
    }
  };

  const signAndSendTransaction = async (transaction: Transaction) => {
    if (!phantomWalletPublicKey) return;

    transaction.feePayer = phantomWalletPublicKey;

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    });

    const payload = {
      session,
      transaction: bs58.encode(
        transaction.serialize({
          requireAllSignatures: false,
        })
      ),
    };

    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey), // shi
      nonce: bs58.encode(nonce), // shi
      redirect_link: onSignAndSendTransactionRedirectLink,
      payload: bs58.encode(encryptedPayload), // shi
    });

    const url = buildUrl('signAndSendTransaction', params);
    await Linking.openURL(url);
  };

  // ADD STATE MANAGEMENT FOR TRANSACTIONS
  const performSwap = async () => {
    try {
      console.log('InputMint :', inputMintAddress);
      console.log('OutoutMint : ', outputMintAddress);

      console.log('Phantom Wallet Public Key during performSwap: ', phantomWalletPublicKey);

      if (phantomWalletPublicKey) {
        const response = await fetch('https://sushi.cheddar-io.workers.dev/api/buy/swap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteResponse: {
              inputMint: inputMintAddress,
              outputMint: outputMintAddress,
              amount: 10000,
              slippage: 50,
              platformFees: 10,
            },
            // users public key
            userPubkey: phantomWalletPublicKey.toString(),
            wrapAndUnwrapSol: true,
            feeAccount: '44LfWhS3PSYf7GxUE2evtTXvT5nYRe6jEMvTZd3YJ9E2',
          }),
        });
        const data = await response.json();

        console.log('Line 421 response : ', response);
        console.log('Line 422 data : ', data);

        if (response.ok && data.unsignedTransaction) {
          const swapTransactionBuf = Buffer.from(data.unsignedTransaction, 'base64');
          let transaction = VersionedTransaction.deserialize(swapTransactionBuf);

          console.log('Transaction : ', transaction);

          //this is where the code is breaking right now
          const signedTransaction = await signAndSendTransaction(transaction);

          console.log('Signed Transaction : ', signedTransaction);

          if (signedTransaction) {
            const latestBlockHash = await connection.getLatestBlockhash();

            const rawTransaction = transaction.serialize();
            const txid = await connection.sendRawTransaction(signedTransaction, {
              skipPreflight: true,
              maxRetries: 2,
            });

            await connection.confirmTransaction({
              blockhash: latestBlockHash.blockhash,
              lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
              signature: txid,
            });
            console.log(`https://solscan.io/tx/${txid}`);
            navigation.navigate('crypto');
          }
        } else {
          console.error('Response error signedTransaction:', data);
          navigation.navigate('crypto');
        }
      } else {
        console.error('Phantom wallet public key is not available.');
        navigation.navigate('crypto');
      }
    } catch (error) {
      console.error('Error performing swap:', error);
      navigation.navigate('crypto');
    }
  };

  function handleToggle() {
    performSwap();
  }
  const isDisconnected = connectionStatus !== 'connected';
  return (
    <YStack flex={1} backgroundColor="#111314" paddingHorizontal={20}>
      <LinearGradient colors={['transparent', 'rgba(63,43,150,0.6)']} style={styles.background} />
      <HorizontalTabs connectionStatus={connectionStatus} />
      <XStack alignSelf="center" marginTop={'$2'}>
        <SwipeButton onToggle={handleToggle} />
      </XStack>
      <XStack width="100%" justifyContent="space-between" marginBottom={10}>
        <Link href="/settings" asChild>
          <Button
            icon={<Feather name="settings" size={24} color="white" />}
            backgroundColor="transparent"
          />
        </Link>
        {/* Connect button remains usable */}
        <Button2
          title={connectionStatus === 'connected' ? 'Disconnect' : 'Connect Phantom'}
          onPress={connectionStatus === 'connected' ? disconnect : connect}
          diasabled={['connecting', 'disconnecting'].includes(connectionStatus)}
        />
        {/* {connectionStatus === 'conne  cted' && <Web3Button onPress={performSwap} />} */}
      </XStack>
      {phantomWalletPublicKey && (
        <View style={styles.wallet}>
          <View style={styles.greenDot} />
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="middle">
            {`Connected to: ${phantomWalletPublicKey.toString()}`}
          </Text>
        </View>
      )}
      <Text style={styles.statusText}>Status: {connectionStatus}</Text>

      {/* BlurView overlay for everything except the connect button */}
      {isDisconnected && (
        <BlurView intensity={50} style={styles.absolute} overlayColor="rgba(0, 0, 0, 0.5)">
          <Button onPress={connect}>Connect Phantom</Button>
        </BlurView>
      )}
    </YStack>
  );
};

export const BASE_URL = 'https://phantom.app/ul/v1/';

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1500,
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurText: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  amountText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Goldman',
  },
  usdText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    fontFamily: 'Goldman',
  },
  tokenIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFA07A',
    marginRight: 10,
  },
  tokenText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Goldman',
  },
  numButton: {
    width: width * 0.2,
    height: width * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Goldman',
  },
  tabButton: {
    flex: 1,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#00FF00',
  },
  tabButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Goldman',
  },
  activeTabText: {
    color: 'black',
    fontFamily: 'Goldman',
  },
  connectButton: {
    backgroundColor: '#00FF00',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  connectButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Goldman',
  },
  secureText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Goldman',
  },
});

export default MoneyEx;

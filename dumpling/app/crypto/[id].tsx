import { Buffer } from 'buffer'; // Import Buffer polyfill
global.Buffer = Buffer; // Set global Buffer

import { Dimensions, Pressable } from 'react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { TabsContentProps } from 'tamagui';
import Feather from '@expo/vector-icons/Feather';
import { Text, SizableText, Tabs, XStack, YStack, Button, Card, CardHeader, Avatar } from 'tamagui';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Link, useLocalSearchParams, useGlobalSearchParams } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import * as Random from 'expo-random';
import { clusterApiUrl, Connection, PublicKey, sendAndConfirmTransaction, VersionedTransaction, Transaction} from '@solana/web3.js';
import { getPublicKey } from '~/components/encryptionUtils';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Alert } from 'react-native';
import nacl from 'tweetnacl';
import ActionSheet from 'react-native-actions-sheet';
import { encryptPayload } from '~/utils/ecryptPayload';
import Toast from 'react-native-toast-message';
import { decryptPayload } from '~/utils/decryptPayload';
import bs58 from 'bs58';
import Button2 from '~/components/Button2';

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

interface TokenBasicInfo {
  name: string;
  baseAddress: string;
  priceUsd: string;
  priceNative: string;
  imageUrl: string;
  priceChange: number;
  symbol: string;
}
interface HorizontalTabsProps {
  connectionStatus: string;
}

interface TokenData {
  basicInfo: TokenBasicInfo[];
  detailedInfo: any[]; // You can define a more specific type for detailedInfo if needed
}

const { width } = Dimensions.get('window');

const HorizontalTabs = ({ connectionStatus }: HorizontalTabsProps) => {
  const navigation = useNavigation();
  const { detailedInfo } = useGlobalSearchParams<{ detailedInfo: string }>();
  const [tokenInfo, setTokenInfo] = useState<TokenBasicInfo | null>(null);

  const closeModal = () => {
    navigation.goBack();
  };

  useEffect(() => {
    try {
      const parsedDetailedInfo = JSON.parse(detailedInfo || 'null');
      console.log('Parsed detailedInfo:', parsedDetailedInfo);
      setTokenInfo(parsedDetailedInfo);
    } catch (error) {
      console.error('Error parsing detailedInfo:', error);
      setTokenInfo(null);
    }
  }, [detailedInfo]);

  const [buyInput, setBuyInput] = useState('');
  const [sellInput, setSellInput] = useState('');
  const [activeTab, setActiveTab] = useState('tab1');

  const buyInputLength = useSharedValue(buyInput.length);
  const sellInputLength = useSharedValue(sellInput.length);

  const handleBuyPress = (num: string) => {
    setBuyInput((prev) => {
      const newValue = prev + num;
      buyInputLength.value = newValue.length;
      return newValue;
    });
  };

  const handleSellPress = (num: string) => {
    setSellInput((prev) => {
      const newValue = prev + num;
      sellInputLength.value = newValue.length;
      return newValue;
    });
  };

  const handleBackspace = (inputType: 'buy' | 'sell') => {
    if (inputType === 'buy') {
      setBuyInput((prev) => {
        const newValue = prev.slice(0, -1);
        buyInputLength.value = newValue.length;
        return newValue;
      });
    } else {
      setSellInput((prev) => {
        const newValue = prev.slice(0, -1);
        sellInputLength.value = newValue.length;
        return newValue;
      });
    }
  };

  const animatedStyle = (inputLength: Animated.SharedValue<number>) =>
    useAnimatedStyle(() => {
      const fontSize = inputLength.value > 8 ? withTiming(40) : withTiming(60);
      return {
        fontSize,
        color: '#FFFFFF',
        fontWeight: 'bold',
        position: 'absolute',
        top: 20,
      };
    });

  interface CryptoCardProps {
    item: TokenBasicInfo;
    onPress: () => void;
    input: string;
  }

  const CryptoCard = ({ item, onPress, input }: CryptoCardProps) => (
    <Pressable onPress={onPress}>
      <XStack
        alignSelf="center"
        justifyContent="center"
        width="100%"
        maxHeight={100}
        maxWidth={360}
        paddingBottom={'$5'}>
        <Card borderRadius={'$12'} scale={0.8} alignSelf="center">
          <CardHeader>
            <XStack alignItems="center">
              <Avatar circular size="$3">
                <Avatar.Image accessibilityLabel={item.name} src={item.imageUrl} />
                <Avatar.Fallback backgroundColor="$blue10" />
              </Avatar>
              <YStack space={8} flex={1} paddingLeft={'$5'}>
                <Text color={'white'} alignSelf="center" fontSize={18} fontWeight="bold">
                  {item.name}
                </Text>
                <Text style={{ fontSize: 14, color: '#fff' }}>${item.priceUsd}</Text>
              </YStack>
              <Text
                style={{
                  fontSize: 20,
                  color: item.priceChange >= 0 ? '#00FF00' : '#FF0000',
                }}>
                {(parseFloat(input) / parseFloat(item.priceUsd)).toFixed(6)} {item.symbol}
              </Text>
            </XStack>
          </CardHeader>
        </Card>
      </XStack>
    </Pressable>
  );

  const renderNumpad = (inputType: 'buy' | 'sell') => (
    <YStack width="100%" alignItems="center" marginTop={20}>
      {[
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['.', '0', '←'],
      ].map((row, i) => (
        <XStack
          key={i}
          space
          justifyContent="space-between"
          width="100%"
          maxWidth={360}
          marginBottom={10}>
          {row.map((num) => (
            <Button
              key={num}
              size="$5"
              backgroundColor="#000000"
              borderRadius={10}
              onPress={() => {
                if (num === '←') handleBackspace(inputType);
                else if (inputType === 'buy') handleBuyPress(num);
                else handleSellPress(num);
              }}>
              <Text color="#FFFFFF" fontSize={24}>
                {num}
              </Text>
            </Button>
          ))}
        </XStack>
      ))}
    </YStack>
  );

  const { height, width } = useWindowDimensions();

  return (
    <Tabs
      defaultValue="tab1"
      orientation="horizontal"
      flexDirection="column"
      width={width - 40}
      height={height - 100}
      borderRadius="$4"
      overflow="hidden">
      <Tabs.List aria-label="Manage your account" paddingBottom={'$10'}>
        <Tabs.Tab flex={1} value="tab1">
          <SizableText fontFamily="$body">BUY</SizableText>
        </Tabs.Tab>
        <Tabs.Tab flex={1} value="tab2">
          <SizableText fontFamily="$body">SELL</SizableText>
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Content value="tab1" flex={1}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap={'$10'}>
          <XStack
            justifyContent="center"
            alignItems="center"
            width="100%"
            maxWidth={360}
            paddingBottom={'$7'}>
            <Animated.Text style={animatedStyle(buyInputLength)}>+{buyInput || '0'}</Animated.Text>
          </XStack>
          {tokenInfo ? (
            <CryptoCard item={tokenInfo} input={buyInput} onPress={closeModal} />
          ) : (
            <Text>No token information available</Text>
          )}
          {renderNumpad('buy')}
        </YStack>
      </Tabs.Content>

      <Tabs.Content value="tab2" flex={1}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap={'$10'}>
          <XStack
            justifyContent="center"
            alignItems="center"
            width="100%"
            maxWidth={360}
            paddingBottom={'$7'}>
            <Animated.Text style={animatedStyle(sellInputLength)}>
              -{sellInput || '0'}
            </Animated.Text>
          </XStack>
          {tokenInfo && (
            <CryptoCard
              item={tokenInfo}
              input={sellInput}
              onPress={() => {
                console.log(`Clicked on ${tokenInfo.name}`);
              }}
            />
          )}
          {renderNumpad('sell')}
        </YStack>
      </Tabs.Content>
    </Tabs>
  );
};

const MoneyEx = () => {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deeplink, setDeepLink] = useState('');
  const [dappKeyPair] = useState(nacl.box.keyPair());
  const [sharedSecret, setSharedSecret] = useState();
  const [session, setSession] = useState();
  const [phantomWalletPublicKey, setPhantomWalletPublicKey] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const handleDeepLink = useCallback(({ url }: { url: string }) => {
    console.log('Received deeplink:', url);
    const parsedUrl = new URL(url);
    setDeepLink(url);
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
    if (!deeplink) return;

    // console.log('Processing deeplink:', deeplink);
    const url = new URL(deeplink);
    const params = url.searchParams;

    if (params.get('errorCode')) {
      const error = Object.fromEntries([...params]);
      const message = error?.errorMessage ?? JSON.stringify(error, null, 2);
      console.error('Phantom error:', message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: message,
      });
      return;
    }

    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;

    if (/onConnect/.test(url.pathname)) {
      console.log('Handling onConnect');
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
        // console.log('Connect data:', connectData);
        setSharedSecret(sharedSecretDapp);
        setSession(connectData.session);
        if (connectData.public_key) {
          setPhantomWalletPublicKey(new PublicKey(connectData.public_key));
        }
        setConnectionStatus('connected');
        console.log(`Connected to ${connectData.public_key?.toString()}`);

        navigation.navigate('crypto');
      } catch (error) {
        console.error('Error processing onConnect:', error);
      }
    }

    if (/onDisconnect/.test(url.pathname)) {
      console.log('Handling onDisconnect');
      setPhantomWalletPublicKey(null);
      setConnectionStatus('disconnected');
      console.log('Disconnected');
    }

    if(/onSignAndSendTransaction/.test(url.pathname)) {
      console.log('Handling onSignAndSendTransaction');
      const signAndSendTransactionData = decryptPayload(
        params.get("data")!,
        params.get("nonce")!,
        sharedSecret
      );
      // console.log("signAndSendTrasaction: ", signAndSendTransactionData);
    }
  }, [deeplink, dappKeyPair.secretKey]);

  const connect = async () => {
    console.log('Initiating connection...');
    setConnectionStatus('connecting');
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      cluster: 'mainnet-beta',
      app_url: `http://192.168.29.125:8081/crypto/${id}`,
      redirect_link: Linking.createURL('onConnect'),
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
      redirect_link: Linking.createURL('onDisconnect'),
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
    // console.log('Transaction:', transaction);

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    });
    // console.log('Serialized transaction:', serializedTransaction);
  
    const payload = {
      session,
      transaction: bs58.encode(serializedTransaction),
    };
    // console.log('Payload:', payload);
  
    // Encrypt the payload
    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);
  
    // console.log('Encrypted payload:', encryptedPayload);
    // console.log('Nonce:', nonce);

    // console.log('Dapp Public Key:', bs58.encode(dappKeyPair.publicKey));
    // console.log('Nonce:', nonce);
    // console.log('Encrypted Payload:', encryptedPayload);
    // console.log('Redirect Link:', onSignAndSendTransactionRedirectLink);    

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey), // shi
      nonce: bs58.encode(nonce), // shi
      redirect_link: onSignAndSendTransactionRedirectLink,
      payload: bs58.encode(encryptedPayload), // shi
    });
  
    const url = buildUrl("signAndSendTransaction", params);
    // console.log('Sign and send transaction URL:', url);
    Linking.openURL(url);

  };


const handleOnSignAndSendTransaction = async (params) => {
  const data = params.get('data');
  const nonce = params.get('nonce');

  const decryptedData = decryptPayload(data, nonce, sharedSecret);
  // console.log('Transaction signature:', decryptedData.signature);
  
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  console.log(connection);

  const txid = await connection.sendRawTransaction(
      decryptedData.signedTransaction,
      { skipPreflight: false, preflightCommitment: 'confirmed' }
  );
  // console.log('Transaction sent:', txid);

  const confirmation = await connection.confirmTransaction(txid);
  console.log('Transaction confirmed:', confirmation);
};

const performSwap = async () => {
  try {
    if(phantomWalletPublicKey){
      const response = await fetch('https://sushi.cheddar-io.workers.dev/api/buy/swap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteResponse: {
              inputMint: "So11111111111111111111111111111111111111112",
              outputMint: "4Cnk9EPnW5ixfLZatCPJjDB1PUtcRpVVgTQukm9epump",
              amount: 10000,
              slippage: 50,
              platformFees: 10,
          },
          // users public key
          userPubkey: phantomWalletPublicKey.toString(),
          wrapAndUnwrapSol: true,
          feeAccount: "44LfWhS3PSYf7GxUE2evtTXvT5nYRe6jEMvTZd3YJ9E2"
      })
    });
    const data = await response.json();
    // console.log('API Response:', JSON.stringify(data, null, 2));

    if (response.ok && data.unsignedTransaction) {
      // Deserialize the transaction
      const swapTransactionBuf = Buffer.from(data.unsignedTransaction, 'base64');
      var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      // console.log('Deserialized transaction:', transaction);

      // send to phantom
      const signedTransaction = await signAndSendTransaction(transaction);

      // console.log('Signed transaction:', signedTransaction);
      if (signedTransaction) {
        const latestBlockHash = await connection.getLatestBlockhash();

        
      // Execute the transaction
      const rawTransaction = transaction.serialize()
        const txid = await connection.sendRawTransaction(signedTransaction, {
          skipPreflight: true,
          maxRetries: 2
        });
        await connection.confirmTransaction({
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: txid
         });
         console.log(`https://solscan.io/tx/${txid}`);         
        navigation.navigate('crypto');
      }
    } else {
      console.error('Response error signedTransaction:', data);
    }
  } else {
    console.error('Phantom wallet public key is not available.');
  }
} catch (error) {
  console.error('Error performing swap:', error);
}
};

  return (
    <YStack flex={1} backgroundColor="#000000" paddingHorizontal={20}>
      <XStack width="100%" justifyContent="space-between" marginBottom={10}>
        <Link href="/settings" asChild>
          <Button
            icon={<Feather name="settings" size={24} color="white" />}
            backgroundColor="transparent"
          />
        </Link>
{/* Add button somewhere here */}
        <Button2
          title={connectionStatus === 'connected' ? 'Disconnect' : 'Connect Phantom'}
          onPress={connectionStatus === 'connected' ? disconnect : connect}
          disabled={['connecting', 'disconnecting'].includes(connectionStatus)}
        />
                    {/* Add a swap button if needed */}
      {connectionStatus === 'connected' && (
        <Button
        onPress={performSwap}
        ><Text>SWAP</Text></Button>
      )}
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
      <HorizontalTabs connectionStatus={connectionStatus} />
    </YStack>
  );
};

export default MoneyEx;

export const BASE_URL = 'https://phantom.app/ul/v1/';

const buildUrl = (path: string, params: URLSearchParams) =>
  `${BASE_URL}${path}?${params.toString()}`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#808080',
    flexGrow: 1,
    position: 'relative',
  },
  statusText: {
    color: 'white',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  greenDot: {
    height: 8,
    width: 8,
    borderRadius: 10,
    marginRight: 5,
    backgroundColor: '#fff',
  },
  header: {
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  spinner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    zIndex: 1000,
  },
  text: {
    color: '#fff',
    width: '100%',
  },
  wallet: {
    alignItems: 'center',
    margin: 10,
    marginBottom: 15,
  },
});

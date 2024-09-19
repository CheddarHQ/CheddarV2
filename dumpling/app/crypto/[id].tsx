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
import * as Linking from 'expo-linking';
import * as Random from 'expo-crypto';
import { clusterApiUrl, Connection, PublicKey, sendAndConfirmTransaction, VersionedTransaction, Transaction} from '@solana/web3.js';
import React, { useEffect, useCallback, useRef, useState } from 'react';
import nacl from 'tweetnacl';
import { encryptPayload } from '~/utils/ecryptPayload';
import Toast from 'react-native-toast-message';
import { decryptPayload } from '~/utils/decryptPayload';
import bs58 from 'bs58';
import Button2 from '~/components/Button2';
import Web3Button from '~/components/ButtonCustom';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {useRecoilState, useSetRecoilState} from "recoil"
import {useRecoilValue, SetRecoilState} from "recoil"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveConnectionDetails, getConnectionDetails, clearConnectionDetails } from '~/utils/asyncStorage';

import {phantomStatus, phantomPublicKey, outputMintAtom, chainIdAtom, inputMintAtom, sharedSecretAtom, detailedInfoAtom, phantomSessionoAtom} from "~/state/atoms"


import { detailedInfoProps } from '~/state/atoms';
import { phantomSelector } from '~/state/selectors';
import CryptoCard from '~/components/CryptoCard';


nacl.setPRNG((x, n) => {
  const randomBytes = Random.getRandomBytes(n);
  for (let i = 0; i < n; i++) {
    x[i] = randomBytes[i];
  }
});

const onConnectRedirectLink = Linking.createURL("onConnect");
const onDisconnectRedirectLink = Linking.createURL("onDisconnect");
const onSignAndSendTransactionRedirectLink = Linking.createURL("onSignAndSendTransaction");

const connection = new Connection('https://api.mainnet-beta.solana.com');

const useUniversalLinks = false; // set as true when deploying to production

const buildUrl = (path: string, params: URLSearchParams) =>
  `${useUniversalLinks ? "https://phantom.app/ul/" : "phantom://"}v1/${path}?${params.toString()}`;

const NETWORK = clusterApiUrl("mainnet-beta");

export interface TokenBasicInfo {
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
  detailedInfo: detailedInfoProps[]; // You can define a more specific type for detailedInfo if needed
}

const { width } = Dimensions.get('window');

const HorizontalTabs = ({ connectionStatus }: HorizontalTabsProps) => {
  const [chainId , setChainId] = useRecoilState(chainIdAtom)
  const setOutputMint = useSetRecoilState(outputMintAtom)
  const setInputMint  = useSetRecoilState(inputMintAtom)
  const navigation = useNavigation();
  const { detailedInfo } = useGlobalSearchParams<{ detailedInfo: string }>();

  console.log("Detailed Info From Params : ", detailedInfo)

  if(detailedInfo){
    const parsedDetailedInfo = JSON.parse(detailedInfo || 'null');
     
    setChainId(parsedDetailedInfo.chainId)
    
    console.log("ChainId set to : ", chainId)
  }

  const [tokenInfo, setTokenInfo] = useState<TokenBasicInfo | null>(null);



  const closeModal = () => {
    navigation.goBack();
  };

  useEffect(() => {
    try {
      console.log("Detailed Info after detailed info changed : ", detailedInfo)
      const parsedDetailedInfo = JSON.parse(detailedInfo || 'null');
      // console.log('Parsed detailedInfo:', parsedDetailedInfo);

      setChainId(parsedDetailedInfo.chainId)

      if(chainId === "ethereum"){
        setInputMint("0x1234567890abcdef1234567890abcdef12345678")
      }
      

      setOutputMint(parsedDetailedInfo.baseAddress)
      
      
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


  // const [sharedSecret, setSharedSecret] = useRecoilState(sharedSecretAtom);
  const setSharedSecret = useSetRecoilState<Uint8Array>(sharedSecretAtom);

  const {sharedSecret, session, phantomWalletPublicKey} = useRecoilValue(phantomSelector);
  console.log("Loggin secret using selector : ", sharedSecret)


  const setPhantomWalletPublicKey = useSetRecoilState(phantomPublicKey);
  const [connectionStatus, setConnectionStatus] = useRecoilState(phantomStatus);

  // const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const outputMintAddress = useRecoilValue(outputMintAtom);
  const inputMintAddress = useRecoilValue(inputMintAtom);

  const setDetailedInfo = useSetRecoilState(detailedInfoAtom);
  const setSession = useSetRecoilState(phantomSessionoAtom);

  console.log("OutputMintAddress : ", outputMintAddress);
  console.log("InputMintAddress : ",inputMintAddress);

  const handleDeepLink = useCallback(({ url }: { url: string }) => {
    console.log('Received deeplink:', url);
    const parsedUrl = new URL(url);
    setDeepLink(url);

    console.log("Parsed url after returning from phantom :", parsedUrl)

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


  }, [setDetailedInfo]);


  const attemptReconnection = async () => {
    try{
      console.log("AttemptReconnection ran")
      const savedConnection = await getConnectionDetails();
      console.log("Saved connection : ", savedConnection)
      if (savedConnection) {
        console.log("Shared secret fromm saved connection : ", savedConnection.sharedSecret)
        setSession(savedConnection.session);
        setPhantomWalletPublicKey(new PublicKey(savedConnection.phantomWalletPublicKey));
        setSharedSecret(savedConnection.sharedSecret) 
        setConnectionStatus('connected');
      }
    }
    catch(error){
      setConnectionStatus('disconnected')
      console.log("Couldn't reconnect to phantom")
    }
  };


  useEffect(() => {
    const initializeDeeplinks = async () => {
      const initialUrl = await Linking.getInitialURL();
      console.log('Initial URL:', initialUrl);
      if (initialUrl) {
        setDeepLink(initialUrl);
      }
    };
    initializeDeeplinks();

    //attempt reconnection
    // console.log("Attempting reconnection")
    // attemptReconnection(); 
    
    const listener = Linking.addEventListener('url', handleDeepLink);
    return () => {
      listener.remove();
    };
  }, [handleDeepLink]);

  useEffect(() => {
    console.log("Line 373")
    if (!deeplink) return;
    const url = new URL(deeplink);
    const params = url.searchParams;
    console.log("Params on line 377 :", params)
    console.log("URL on line 377 :", url)
    console.log("Line 377")

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

        console.log("Connect Data : ", connectData)
      
        
        setSharedSecret(sharedSecretDapp);

        

        setSession(connectData.session);

        

        if (connectData.public_key) {
          console.log("Public key obtained")
          setPhantomWalletPublicKey(new PublicKey(connectData.public_key));
        }

        setConnectionStatus('connected');
        console.log(`Connected to ${connectData.public_key?.toString()}`);
        const connectionData = {
          sharedSecret : sharedSecretDapp,
          session : connectData.session,
          phantomWalletPublicKey: connectData.public_key,
        };

        console.log("Connection data to be saved : ", connectionData)
        const saveConnection = async ()=>{
          await saveConnectionDetails(connectionData);
        }

        saveConnection();


        navigation.navigate('crypto');
      } catch (error) {
        console.error('Error processing onConnect:', error);
      }
    }

    if (/onDisconnect/.test(url.pathname)) {
      console.log('Handling onDisconnect');
      setPhantomWalletPublicKey(null);
      setConnectionStatus('disconnected');
      async function disconnect(){
        await clearConnectionDetails();
      }

      disconnect();

      console.log('Disconnected');
    }

    if(/onSignAndSendTransaction/.test(url.pathname)) {
      console.log('Handling onSignAndSendTransaction');
      const signAndSendTransactionData = decryptPayload(
        params.get("data")!,
        params.get("nonce")!,
        sharedSecret
      );
      console.log("signAndSendTrasaction: ", signAndSendTransactionData);
    }
  }, [deeplink, dappKeyPair.secretKey]);

  const connect = async () => {
    console.log('Initiating connection...');
    setConnectionStatus('connecting');
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      cluster: 'mainnet-beta',
      app_url: "https://phantom.app",
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

  const signAndSendTransaction = async (transaction : Transaction) => {
    if (!phantomWalletPublicKey) return;

    transaction.feePayer = phantomWalletPublicKey;

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    });
  
    const payload = {
      session,
      transaction: bs58.encode(serializedTransaction),
    };

    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);

    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey), // shi
      nonce: bs58.encode(nonce), // shi
      redirect_link: onSignAndSendTransactionRedirectLink,
      payload: bs58.encode(encryptedPayload), // shi
    });
  
    const url = buildUrl("signAndSendTransaction", params);
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

  // ADD STATE MANAGEMENT FOR TRANSACTIONS
const performSwap = async () => {
  try {
    console.log("InputMint :", inputMintAddress)
    console.log("OutoutMint : ", outputMintAddress)
    
    if(phantomWalletPublicKey){
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
          feeAccount: "44LfWhS3PSYf7GxUE2evtTXvT5nYRe6jEMvTZd3YJ9E2"
      })
    });
    const data = await response.json();

  

    if (response.ok && data.unsignedTransaction) {

      const swapTransactionBuf = Buffer.from(data.unsignedTransaction, 'base64');
      let transaction = VersionedTransaction.deserialize(swapTransactionBuf);

     console.log("Transaction : ", transaction)

//this is where the code is breaking right now
      const signedTransaction = await signAndSendTransaction(transaction);
      

      console.log("Signed Transaction : ", signedTransaction);

      if (signedTransaction) {
        const latestBlockHash = await connection.getLatestBlockhash();

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

        {/* ADD THE ALL THE BUTTONS BELOW THE KEYPAD*/}
          <Button
            icon={<Feather name="settings" size={24} color="white" />}
            backgroundColor="transparent"/>
        </Link>
          <Button
            icon={<FontAwesome name="refresh" size={24} color="white" />}
            backgroundColor="transparent"
          />
        <Button2
          title={connectionStatus === 'connected' ? 'Disconnect' : 'Connect Phantom'}
          onPress={connectionStatus === 'connected' ? disconnect : connect}
          disabled={['connecting', 'disconnecting'].includes(connectionStatus)}/>
      {connectionStatus === 'connected' && (
        <Web3Button
        onPress={performSwap}
        ></Web3Button>
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

export const BASE_URL = 'https://phantom.app/ul/v1/';

const styles = StyleSheet.create({
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
  },
  usdText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
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
  },
  activeTabText: {
    color: 'black',
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
  },
  secureText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default MoneyEx;
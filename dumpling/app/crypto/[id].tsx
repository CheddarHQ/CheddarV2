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
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  VersionedTransaction,
  Transaction,
} from '@solana/web3.js';
import React, { useEffect, useCallback, useRef, useState } from 'react';
import Button2 from '~/components/Button2';
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';

import { phantomWallet, PhantomWallet } from '~/lib/phantomUtils';

import {
  phantomStatus,
  phantomPublicKey,
  outputMintAtom,
  chainIdAtom,
  inputMintAtom,
  sharedSecretAtom,
  detailedInfoAtom,
  phantomSessionAtom,
  slippageAtom,
} from '~/state/atoms';

import HorizontalTabs from '~/components/HorizontalTabs';
import { phantomSelector } from '~/state/selectors';
import SwipeButton from '~/components/SwipeButton';
import { BlurView } from 'expo-blur';
import { useDynamic } from '~/client';

const connection = new Connection('https://api.mainnet-beta.solana.com');

const { width } = Dimensions.get('window');

const MoneyEx = () => {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deeplink, setDeepLink] = useState('');

  const slippage = useRecoilValue(slippageAtom);
  const setSharedSecret = useSetRecoilState<Uint8Array>(sharedSecretAtom);
  const { sharedSecret, session, phantomWalletPublicKey, chainId } =
    useRecoilValue(phantomSelector);
  const setPhantomWalletPublicKey = useSetRecoilState(phantomPublicKey);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const setSession = useSetRecoilState(phantomSessionAtom);
  const outputMintAddress = useRecoilValue(outputMintAtom);
  const inputMintAddress = useRecoilValue(inputMintAtom);
  const setDetailedInfo = useSetRecoilState(detailedInfoAtom);

  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      console.log('Received deeplink:', url);
      setDeepLink(url);
      phantomWallet.handleDeepLink(url, navigation, setConnectionStatus);
    };

    const initializeDeeplinks = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        setDeepLink(initialUrl);
        phantomWallet.handleDeepLink(initialUrl, navigation, setConnectionStatus);
      }
    };

    initializeDeeplinks();
    const listener = Linking.addEventListener('url', handleDeepLink);
    return () => listener.remove();
  }, []);

  const {wallets} = useDynamic();
  const wallet = wallets.userWallets[0];
  console.log("Wallet : ", wallet.address)

  const connect = () => phantomWallet.connect(setConnectionStatus);
  const disconnect = () => phantomWallet.disconnect(setConnectionStatus);

  const performSwap = async () => {
    try {
      const currentPhantomPublicKey = phantomWallet.getPhantomWalletPublicKey();

      if (!currentPhantomPublicKey) {
        console.error('No connected wallet');
        return;
      }

      const response = await fetch('https://sushi.cheddar-io.workers.dev/api/buy/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: {
            inputMint: inputMintAddress,
            outputMint: outputMintAddress,
            amount: 10000,
            slippage: slippage,
            platformFees: 10,
          },
          userPubkey: currentPhantomPublicKey.toString(),
          wrapAndUnwrapSol: true,
          feeAccount: '44LfWhS3PSYf7GxUE2evtTXvT5nYRe6jEMvTZd3YJ9E2',
        }),
      });

      const data = await response.json();

      if (response.ok && data.unsignedTransaction) {
        const swapTransactionBuf = Buffer.from(data.unsignedTransaction, 'base64');
        let transaction = VersionedTransaction.deserialize(swapTransactionBuf);

        const signedTransaction = await phantomWallet.signAndSendTransaction(transaction);

        if (signedTransaction) {
          const latestBlockHash = await connection.getLatestBlockhash();
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
        }
      }
    } catch (error) {
      console.error('Error performing swap:', error);
    } finally {
      navigation.navigate('crypto');
    }
  };

  function handleToggle() {
    performSwap();
  }

  const isDisconnected = connectionStatus !== 'connected';
  const currentPhantomPublicKey = phantomWallet.getPhantomWalletPublicKey();

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
       
      </XStack>
      {currentPhantomPublicKey && (
        <View style={styles.wallet}>
          <View style={styles.greenDot} />
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="middle">
            {`Connected to: ${currentPhantomPublicKey.toString()}`}
          </Text>
        </View>
      )}
      <Text style={styles.statusText}>Status: {connectionStatus}</Text>

     
    </YStack>
  );
};

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
  wallet: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF00',
    marginRight: 8,
  },
  text: {
    color: 'white',
    flex: 1,
  },
  statusText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default MoneyEx;

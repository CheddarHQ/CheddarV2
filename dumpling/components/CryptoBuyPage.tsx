import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Text, YStack, Button, XStack } from 'tamagui';
import { Link, useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import Feather from '@expo/vector-icons/Feather';
import { BlurView } from 'expo-blur';

import Button2 from '~/components/Button2';
import { phantomWallet } from '~/lib/phantomUtils';
import {
  phantomStatus,
  phantomPublicKey,
  outputMintAtom,
  inputMintAtom,
  sharedSecretAtom,
  phantomSessionAtom,
  slippageAtom,
} from '~/state/atoms';
import { phantomSelector } from '~/state/selectors';
import SwipeButton from '~/components/SwipeButton';
import BuyPage from './BuyPageComp'; // Import the BuyPage component

const connection = new Connection('https://api.mainnet-beta.solana.com');

const { width } = Dimensions.get('window');

const CryptoBuyPage = () => {
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

  const connect = () => phantomWallet.connect(setConnectionStatus);
  const disconnect = () => phantomWallet.disconnect(setConnectionStatus);

  const performBuy = async () => {
    try {
      const currentPhantomPublicKey = phantomWallet.getPhantomWalletPublicKey();

      if (!currentPhantomPublicKey) {
        console.error('No connected wallet');
        return;
      }

      // Implement the buy logic here
      // This should be similar to the performSwap function in the original component,
      // but tailored specifically for buying

      // After successful buy
      navigation.navigate('crypto');
    } catch (error) {
      console.error('Error performing buy:', error);
    }
  };

  function handleToggle() {
    performBuy();
  }

  const isDisconnected = connectionStatus !== 'connected';
  const currentPhantomPublicKey = phantomWallet.getPhantomWalletPublicKey();

  return (
    <YStack flex={1} backgroundColor="#111314" paddingHorizontal={20}>
      <LinearGradient colors={['transparent', 'rgba(63,43,150,0.6)']} style={styles.background} />
      <BuyPage />
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
        <Button2
          title={connectionStatus === 'connected' ? 'Disconnect' : 'Connect Phantom'}
          onPress={connectionStatus === 'connected' ? disconnect : connect}
          disabled={['connecting', 'disconnecting'].includes(connectionStatus)}
        />
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

      {isDisconnected && (
        <BlurView intensity={50} style={styles.absolute} overlayColor="rgba(0, 0, 0, 0.5)">
          <Button onPress={connect}>Connect Phantom</Button>
        </BlurView>
      )}
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

export default CryptoBuyPage;

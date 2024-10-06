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
import { useDynamic } from '~/client';

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

  const { wallets, sdk } = useDynamic();
  const wallet = useDynamic.wallets.primary;
  // console.log("Wallet : ", wallet.address)
  // console.log("Wallet : ", wallet)

  // const signer = useDynamic?.solana?.getSigner({ wallet });

  const createAndSendTransaction = async (data: { unsignedTransaction: string }) => {
    try {
      const connection = useDynamic?.solana?.getConnection();
      const signer = useDynamic?.solana?.getSigner({ wallet });

      // Deserialize the transaction from base64
      const swapTransactionBuf = Buffer.from(data.unsignedTransaction, 'base64');
      let transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      // Sign the transaction
      const { signature } = await signer.signAndSendTransaction(transaction);

      // Get latest blockhash for confirmation
      const latestBlockHash = await connection.getLatestBlockhash();

      // Confirm the transaction
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      });

      console.log('Successful transaction signature:', signature);
      console.log(`https://solscan.io/tx/${signature}`);

      return signature;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const performSwap = async () => {
    try {
      const response = await fetch('https://sushi.cheddar-io.workers.dev/api/buy/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: {
            inputMint: inputMintAddress,
            outputMint: outputMintAddress,
            amount: 1000,
            slippage: slippage,
            platformFees: 10,
          },
          userPubkey: wallet.address.toString(),
          wrapAndUnwrapSol: true,
          feeAccount: '44LfWhS3PSYf7GxUE2evtTXvT5nYRe6jEMvTZd3YJ9E2',
        }),
      });

      const data = await response.json();

      //     if (response.ok && data.unsignedTransaction) {
      //       const swapTransactionBuf = Buffer.from(data.unsignedTransaction, 'base64');
      //       let transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      //       const signedTransaction = await sdk.wallet.SignTransaction(transaction);

      //       if (signedTransaction) {
      //         const latestBlockHash = await connection.getLatestBlockhash();
      //         const txid = await connection.sendRawTransaction(signedTransaction, {
      //           skipPreflight: true,
      //           maxRetries: 2,
      //         });

      //         await connection.confirmTransaction({
      //           blockhash: latestBlockHash.blockhash,
      //           lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      //           signature: txid,
      //         });
      //         console.log(`https://solscan.io/tx/${txid}`);
      //       }
      //     }
      //   } catch (error) {
      //     console.error('Error performing swap:', error);
      //   } finally {
      //     navigation.navigate('crypto');
      //   }
      // };
      if (response.ok && data.unsignedTransaction) {
        const signature = await createAndSendTransaction(data);

        if (signature) {
          console.log(`https://solscan.io/tx/${signature}`);
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

  return (
    <YStack flex={1} backgroundColor="#111314" paddingHorizontal={20}>
      <LinearGradient colors={['transparent', 'rgba(63,43,150,0.6)']} style={styles.background} />
      <BuyPage />
      <XStack alignSelf="center" marginTop={'$2'} padding={'$8'}>
        <SwipeButton onToggle={handleToggle} />
      </XStack>
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

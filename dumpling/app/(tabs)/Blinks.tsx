import React, { useState, useEffect } from 'react';
import { ScrollView, YStack, XStack, ZStack } from 'tamagui';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { NavigationProp } from '@react-navigation/native';
import { PhantomBlinkIntegration } from '~/components/Blinksdemo';
import { FlatList, View, TouchableOpacity, Text } from 'react-native';
import { Dimensions, Modal } from 'react-native';
import { StyleSheet } from 'react-native';

// Define types for your props and adapter
interface PhantomAdapterProps {
  dappKeyPair: {
    publicKey: Uint8Array;
    secretKey: Uint8Array;
  };
  sharedSecret: Uint8Array | null;
  setSharedSecret: (secret: Uint8Array) => void;
  setSession: (session: string) => void;
  phantomWalletPublicKey: PublicKey | null;
  setPhantomWalletPublicKey: (key: PublicKey) => void;
  decryptPayload: (data: string, nonce: string, sharedSecret: Uint8Array) => any;
  encryptPayload: (payload: any, sharedSecret: Uint8Array) => [Uint8Array, Uint8Array];
  onConnectRedirectLink: string;
  session: string;
  navigation: NavigationProp<any>; // Replace 'any' with your navigation param list type
}

const Blinks: React.FC = () => {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    Dimensions.addEventListener('change', updateOrientation);
    return () => {
      // Remove listener on cleanup
      // Note: In newer versions of React Native, this might not be necessary
    };
  }, []);

  const adapterProps: PhantomAdapterProps = {
    dappKeyPair: {
      publicKey: new Uint8Array(), // Initialize with actual values
      secretKey: new Uint8Array(), // Initialize with actual values
    },
    sharedSecret: null,
    setSharedSecret: (secret: Uint8Array) => {
      // Implement this
    },
    setSession: (session: string) => {
      // Implement this
    },
    phantomWalletPublicKey: null,
    setPhantomWalletPublicKey: (key: PublicKey) => {
      // Implement this
    },
    decryptPayload: (data: string, nonce: string, sharedSecret: Uint8Array) => {
      // Implement this
      return {};
    },
    encryptPayload: (payload: any, sharedSecret: Uint8Array) => {
      // Implement this
      return [new Uint8Array(), new Uint8Array()];
    },
    onConnectRedirectLink: 'your-redirect-link',
    session: '',
    navigation: {} as NavigationProp<any>, // Replace with actual navigation prop
  };

  const handlePress = (index: number) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const numColumns = orientation === 'portrait' ? 2 : 3;
  const gap = 10;
  const boxSize = (windowWidth - (numColumns + 1) * gap) / numColumns;
  const collapsedSize = (windowWidth - (numColumns + 1) * gap) / numColumns;
  const expandedHeight = windowHeight * 0.6;

  const actionsRegistry = [
    {
      url: 'https://dial.to/helius/stake',
      name: 'Helius Stake',
      color: '#FF5733', // Example color
    },
    {
      url: 'https://degenmarkets.com/pools/9rJ8Wr3thMyX2g52iYwo3d8Rx54BqFYnjNrb84Cv6arb',
      name: 'Degen Markets',
      color: '#33FF57', // Example color
    },
    {
      url: 'https://matchups.fun/fight',
      name: 'Matchups Fight',
      color: '#3357FF', // Example color
    },
    {
      url: 'https://memeroyale.xyz/tokens/HokhDNyQdXG3agBVXCKeQmPJ3e7D5jrWP2xUjxDB4nw3',
      name: 'Meme Royale',
      color: '#FF33A6', // Example color
    },
    {
      url: 'https://checkmate.sendarcade.fun',
      name: 'Checkmate',
      color: '#33FFF0', // Example color
    },
  ];

  return (
    <View style={styles.container}>
      <XStack></XStack>
      <FlatList
        data={actionsRegistry}
        keyExtractor={(item, index) => index.toString()}
        numColumns={numColumns}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.contentContainer}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity
              onPress={() => handlePress(index)}
              style={[
                styles.box,
                {
                  width: boxSize,
                  height: boxSize,
                  marginRight: (index + 1) % numColumns === 0 ? 0 : gap,
                  marginBottom: gap,
                },
              ]}>
              <ZStack style={[styles.boxContent, { backgroundColor: item.color }]}>
                <PhantomBlinkIntegration urls={[item.url]} adapterProps={adapterProps} />
                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>{item.name}</Text>
                </View>
              </ZStack>
            </TouchableOpacity>
          );
        }}
      />
      <Modal
        visible={expandedIndex !== null}
        animationType="slide"
        onRequestClose={() => setExpandedIndex(null)}>
        {expandedIndex !== null && (
          <View style={styles.modalContent}>
            <PhantomBlinkIntegration
              urls={[actionsRegistry[expandedIndex].url]}
              adapterProps={adapterProps}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setExpandedIndex(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 10,
  },
  box: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  boxContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  boxText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Blinks;

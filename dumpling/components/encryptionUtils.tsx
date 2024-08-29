import AsyncStorage from '@react-native-async-storage/async-storage';
import nacl from 'tweetnacl';
import * as Crypto from 'expo-crypto';
import bs58 from 'bs58';

const STORAGE_KEY = 'PHANTOM_ENCRYPTION_KEY_PAIR';

// Provide a custom random number generator using expo-crypto
nacl.setPRNG((x, n) => {
  const randomBytesGenerated = Crypto.getRandomBytes(n);
  for (let i = 0; i < n; i++) {
    x[i] = randomBytesGenerated[i];
  }
});

export const getOrCreateKeyPair = async () => {
  try {
    // Try to get existing key pair from storage
    const storedKeyPair = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedKeyPair) {
      return JSON.parse(storedKeyPair);
    }

    // If no existing key pair, create a new one
    const newKeyPair = nacl.box.keyPair();
    const keyPairToStore = {
      publicKey: bs58.encode(newKeyPair.publicKey),
      secretKey: bs58.encode(newKeyPair.secretKey),
    };

    // Store the new key pair
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(keyPairToStore));

    return keyPairToStore;
  } catch (error) {
    console.error('Error in getOrCreateKeyPair:', error);
    throw error;
  }
};

export const getPublicKey = async () => {
  const keyPair = await getOrCreateKeyPair();
  return keyPair.publicKey;
};

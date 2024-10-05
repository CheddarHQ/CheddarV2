import React, { useState } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import { generateKeyPair } from 'react-native-crypto';
import * as Keychain from 'react-native-keychain';
import * as Random from 'expo-random';

const WalletKeyGenerator = () => {
  const [publicKey, setPublicKey] = useState('');

  const generateWalletKeys = async () => {
    try {
      // Generate a secure random seed
      const randomBytes = await Random.getRandomBytesAsync(32);
      const seed = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // Generate the key pair
      const { publicKey, privateKey } = await new Promise((resolve, reject) => {
        generateKeyPair(
          'rsa',
          {
            modulusLength: 4096,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
          },
          (err, publicKey, privateKey) => {
            if (err) reject(err);
            else resolve({ publicKey, privateKey });
          }
        );
      });

      // Store the private key securely
      await Keychain.setGenericPassword('walletPrivateKey', privateKey, {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });

      // Update state with the public key
      setPublicKey(publicKey);

      Alert.alert('Success', 'Wallet keys generated and private key stored securely.');
    } catch (error) {
      console.error('Error generating wallet keys:', error);
      Alert.alert('Error', 'Failed to generate wallet keys. Please try again.');
    }
  };

  return (
    <View>
      <Button title="Generate Wallet Keys" onPress={generateWalletKeys} />
      {publicKey ? <Text>Public Key: {publicKey.slice(0, 20)}...</Text> : null}
    </View>
  );
};

export default WalletKeyGenerator;

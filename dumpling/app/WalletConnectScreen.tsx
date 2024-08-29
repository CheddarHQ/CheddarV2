import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function WalletConnectScreen() {
  const { phantom_encryption_public_key, errorCode, data } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (data) {
      // Handle successful connection
      console.log('Connected to Phantom wallet:', data);
      // You might want to store the connection data or update your app's state here
      router.replace('/'); // Navigate back to the main screen
    } else if (errorCode) {
      // Handle connection error
      console.error('Error connecting to Phantom wallet:', errorCode);
      router.replace('/'); // Navigate back to the main screen
    }
  }, [data, errorCode, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Connecting to Phantom Wallet...</Text>
    </View>
  );
}

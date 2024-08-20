import { Stack } from 'expo-router';

export default function CryptoLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Crypto Details', // This can be dynamic as well if you want to set the title based on the crypto
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

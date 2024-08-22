import { Stack } from 'expo-router';

export default function CryptoAnalyticsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'cryptoAnalytics', // This can be dynamic as well if you want to set the title based on the crypto
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

import { useFonts, Goldman_400Regular, Goldman_700Bold } from '@expo-google-fonts/goldman';
import * as SplashScreen from 'expo-splash-screen';
import { Stack, SplashScreen as ExpoRouterSplashScreen } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
//@ts-ignore
import { TamaguiProvider } from 'tamagui';
import { StatusBar } from 'expo-status-bar';
import { RecoilRoot } from 'recoil';
import { Text } from './components/Text'; // Import custom Text component globally
import config from '../tamagui.config';

ExpoRouterSplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Goldman_400Regular,
    Goldman_700Bold,
    Jersey10: require('../assets/Jersey10-Regular.ttf'),
    Press2P: require('../assets/PressStart2P-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <RecoilRoot>
      <TamaguiProvider config={config}>
        <StatusBar style="auto" />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="thing" options={{ headerShown: false }} />
            <Stack.Screen name="loginPage" options={{ headerShown: false }} />
            <Stack.Screen name="crypto" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="userPage" options={{ headerShown: false }} />
            <Stack.Screen
              name="cryptoGraph"
              options={{ headerShown: false, presentation: 'modal' }}
            />
          </Stack>
        </GestureHandlerRootView>
      </TamaguiProvider>
    </RecoilRoot>
  );
}

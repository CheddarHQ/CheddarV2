import { useFonts, Goldman_400Regular, Goldman_700Bold } from '@expo-google-fonts/goldman';
import * as SplashScreen from 'expo-splash-screen';
import { Stack, SplashScreen as ExpoRouterSplashScreen } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
//@ts-ignore
import { TamaguiProvider } from 'tamagui';
import { StatusBar } from 'expo-status-bar';
import { RecoilRoot } from 'recoil';
import config from '../tamagui.config';
import { OktoProvider, BuildType } from 'okto-sdk-react-native';
import LoginScreen from './loginScreen';

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

  const OKTO_CLIENT_API ="212f425f-1b78-4cf1-9610-7763f7ea2ae3"

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <RecoilRoot>
      <TamaguiProvider config={config}>
      <OktoProvider apiKey={OKTO_CLIENT_API} buildType={BuildType.SANDBOX}>
        <StatusBar style="auto" />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="thing" options={{ headerShown: false }} />
            <Stack.Screen name="loginScreen" options={{ headerShown: false }} />
            <Stack.Screen name="crypto" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="userPage" options={{ headerShown: false }} />
            <Stack.Screen
              name="cryptoGraph"
              options={{ headerShown: false, presentation: 'modal' }}
            />
          </Stack>
        </GestureHandlerRootView>
    </OktoProvider>
      </TamaguiProvider>
    </RecoilRoot>
  );
}

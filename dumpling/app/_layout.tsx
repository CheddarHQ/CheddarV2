import {
  useFonts,
  Poppins_100Thin,
  Poppins_400Regular,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen'; // Add this if SplashScreen is not recognized
import { Stack, SplashScreen as ExpoRouterSplashScreen } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
//@ts-ignore
import { TamaguiProvider } from 'tamagui';

import config from '../tamagui.config';

ExpoRouterSplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [loaded] = useFonts({
    Poppins_100Thin,
    Poppins_400Regular,
    Poppins_700Bold,
    Jersey10: require('../assets/Jersey10-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <TamaguiProvider config={config}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="thing" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ title: 'Modal', presentation: 'modal', headerShown: false }}
          />
          <Stack.Screen name="moneyEx" options={{ title: 'moneyEx', headerShown: false }} />
        </Stack>
      </GestureHandlerRootView>
    </TamaguiProvider>
  );
}

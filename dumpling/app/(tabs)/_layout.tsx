import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect } from 'react';
import { SplashScreen } from 'expo-router';
import { Tabs } from 'expo-router';
import CustomBottomTab from '~/components/CustomBottomTab';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  useFonts,
  Poppins_100Thin,
  Poppins_400Regular,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Setting: undefined;
  Profile: undefined;
};

const CustomBottomTabs = (props: BottomTabBarProps) => {
  return <CustomBottomTab {...props} />;
};

export default function TabLayout() {
  const [loaded] = useFonts({
    Poppins_100Thin,
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Tabs tabBar={CustomBottomTabs} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="Chat"
        options={{
          title: 'Chat',
        }}
      />
      <Tabs.Screen
        name="modal"
        options={{
          title: 'CryptoSwap',
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
        }}
      />
      <Tabs.Screen
        name="Blinks"
        options={{
          title: 'Blinks',
        }}
      />
    </Tabs>
  );
}

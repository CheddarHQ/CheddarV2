import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import CustomBottomTab from '~/components/CustomBottomTab';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';

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
        name="dummy"
        options={{
          title: 'NotCool',
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
        }}
      />
    </Tabs>
  );
}

import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import type { TabsContentProps } from 'tamagui';
import Feather from '@expo/vector-icons/Feather';
import {
  Text,
  SizableText,
  Tabs,
  XStack,
  YStack,
  Button,
  H5,
  Card,
  CardHeader,
  Avatar,
} from 'tamagui';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Link, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const TabsContent = (props: TabsContentProps) => (
  <Tabs.Content
    backgroundColor="$background"
    padding="$2"
    alignItems="center"
    justifyContent="center"
    flex={1}
    borderColor="$background"
    borderRadius="$2"
    borderTopLeftRadius={0}
    borderTopRightRadius={0}
    borderWidth="$2"
    {...props}>
    {props.children}
  </Tabs.Content>
);

const HorizontalTabs = () => {
  const { id } = useLocalSearchParams();
  const [buyInput, setBuyInput] = useState('');
  const [sellInput, setSellInput] = useState('');
  const [activeTab, setActiveTab] = useState('tab1');

  // Shared values for each input
  const buyInputLength = useSharedValue(buyInput.length);
  const sellInputLength = useSharedValue(sellInput.length);

  const handleBuyPress = (num: string) => {
    setBuyInput((prev) => {
      const newValue = prev + num;
      buyInputLength.value = newValue.length;
      return newValue;
    });
  };

  const handleSellPress = (num: string) => {
    setSellInput((prev) => {
      const newValue = prev + num;
      sellInputLength.value = newValue.length;
      return newValue;
    });
  };

  const handleBackspace = (inputType: 'buy' | 'sell') => {
    if (inputType === 'buy') {
      setBuyInput((prev) => {
        const newValue = prev.slice(0, -1);
        buyInputLength.value = newValue.length;
        return newValue;
      });
    } else {
      setSellInput((prev) => {
        const newValue = prev.slice(0, -1);
        sellInputLength.value = newValue.length;
        return newValue;
      });
    }
  };

  const animatedStyle = (inputLength: Animated.SharedValue<number>) =>
    useAnimatedStyle(() => {
      const fontSize = inputLength.value > 8 ? withTiming(40) : withTiming(60);
      return {
        fontSize,
        color: '#FFFFFF',
        fontWeight: 'bold',
        position: 'absolute', // Position to avoid layout shifts
        top: 20, // Adjust as needed
      };
    });

  const CryptoCard = () => (
    <XStack
      alignSelf="center"
      justifyContent="center"
      width="100%"
      maxWidth={360}
      paddingBottom={'$5'}>
      <Card borderRadius={'$12'} scale={0.8} alignSelf="center">
        <CardHeader>
          <XStack alignItems="center">
            <Avatar circular size="$3">
              <Avatar.Image
                accessibilityLabel="Cam"
                src="https://images.unsplash.com/photo-1548142813-c348350df52b?&w=150&h=150&dpr=2&q=80"
              />
              <Avatar.Fallback backgroundColor="$blue10" />
            </Avatar>
            <Text color={'white'} alignSelf="center" paddingLeft={'$5'}>
              Crypto Coin {id}
            </Text>
          </XStack>
        </CardHeader>
      </Card>
    </XStack>
  );

  const renderNumpad = (inputType: 'buy' | 'sell') => (
    <YStack width="100%" alignItems="center" marginTop={20}>
      {[
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['.', '0', '←'],
      ].map((row, i) => (
        <XStack
          key={i}
          space
          justifyContent="space-between"
          width="100%"
          maxWidth={360}
          marginBottom={10}>
          {row.map((num) => (
            <Button
              key={num}
              size="$5"
              backgroundColor="#000000"
              borderRadius={10}
              onPress={() => {
                if (num === '←') handleBackspace(inputType);
                else if (inputType === 'buy') handleBuyPress(num);
                else handleSellPress(num);
              }}>
              <Text color="#FFFFFF" fontSize={24}>
                {num}
              </Text>
            </Button>
          ))}
        </XStack>
      ))}
    </YStack>
  );

  return (
    <Tabs
      defaultValue="tab1"
      orientation="horizontal"
      flexDirection="column"
      width={360}
      height={700}
      borderRadius="$4"
      overflow="hidden">
      <Tabs.List aria-label="Manage your account" paddingBottom={'$10'}>
        <Tabs.Tab flex={1} value="tab1">
          <SizableText fontFamily="$body">BUY</SizableText>
        </Tabs.Tab>
        <Tabs.Tab flex={1} value="tab2">
          <SizableText fontFamily="$body">SELL</SizableText>
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Content value="tab1" flex={1}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap={'$10'}>
          <XStack
            justifyContent="center"
            alignItems="center"
            width="100%"
            maxWidth={360}
            paddingBottom={'$7'}>
            <Animated.Text style={animatedStyle(buyInputLength)}>+{buyInput || '0'}</Animated.Text>
          </XStack>
          <CryptoCard />
          {renderNumpad('buy')}
        </YStack>
      </Tabs.Content>

      <Tabs.Content value="tab2" flex={1}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap={'$10'}>
          <XStack
            justifyContent="center"
            alignItems="center"
            width="100%"
            maxWidth={360}
            paddingBottom={'$7'}>
            <Animated.Text style={animatedStyle(sellInputLength)}>
              -{sellInput || '0'}
            </Animated.Text>
          </XStack>
          <CryptoCard />
          <XStack>{renderNumpad('sell')}</XStack>
        </YStack>
      </Tabs.Content>
    </Tabs>
  );
};

const MoneyEx = () => (
  <YStack flex={1} backgroundColor="#000000" paddingHorizontal={20} paddingVertical={20}>
    <XStack width="100%" justifyContent="flex-start" marginBottom={20}>
      <Link href="/settings" asChild>
        <Button
          icon={<Feather name="settings" size={24} color="white" />}
          backgroundColor="transparent"
        />
      </Link>
    </XStack>
    <HorizontalTabs />
  </YStack>
);

export default MoneyEx;

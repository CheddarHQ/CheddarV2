import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable } from 'react-native';
import type { TabsContentProps } from 'tamagui';
import Feather from '@expo/vector-icons/Feather';
import {
  Text,
  SizableText,
  Tabs,
  XStack,
  YStack,
  Button,
  Card,
  CardHeader,
  Avatar,
} from 'tamagui';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Link, useLocalSearchParams } from 'expo-router';

interface TokenBasicInfo {
  name: string;
  baseAddress: string;
  priceUsd: string;
  priceNative: string;
  imageUrl: string;
  priceChange: number;
}

interface TokenData {
  basicInfo: TokenBasicInfo[];
  detailedInfo: any[]; // You can define a more specific type for detailedInfo if needed
}

const { width } = Dimensions.get('window');

const HorizontalTabs = () => {
  const { id } = useLocalSearchParams();
  const [buyInput, setBuyInput] = useState('');
  const [sellInput, setSellInput] = useState('');
  const [activeTab, setActiveTab] = useState('tab1');
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const ids =
    'GGXDG9XzfazWZGyV6CPKHQyB1V6qDzXGYb5RyufqfTVN,zcdAw3jpcqEY8JYVxNVMqs2cU35cyDdy4ot7V8edNhz,34Vzjmat2bRAY3mTxXaCemnT1ca51Tj7xL3J9T1cHhiT,3a7fVXt9vpQbxytdDkqep2n5hqw8iyCdXuN3N4i6Ki3r';

  useEffect(() => {
    async function fetchMetadata(ids: string) {
      try {
        setLoading(true);
        console.log('Fetching data...');
        const response = await fetch(
          `https://sushi.cheddar-io.workers.dev/api/data/fetchmetadata?ids=${ids}`
        );
        const data: TokenData = await response.json();
        console.log('Fetched data:', data);
        setTokenData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    }
    fetchMetadata(ids);
  }, []);

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

  interface CryptoCardProps {
    item: TokenBasicInfo;
    onPress: () => void;
  }

  const CryptoCard = ({ item, onPress }: CryptoCardProps) => (
    <Pressable onPress={onPress}>
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
                <Avatar.Image accessibilityLabel={item.name} src={item.imageUrl} />
                <Avatar.Fallback backgroundColor="$blue10" />
              </Avatar>
              <YStack space={8} flex={1} paddingLeft={'$5'}>
                <Text color={'white'} alignSelf="center" fontSize={18} fontWeight="bold">
                  {item.name}
                </Text>
                <Text style={{ fontSize: 14, color: '#888888' }}>${item.priceUsd}</Text>
              </YStack>
              <Text
                style={{
                  fontSize: 14,
                  color: item.priceChange >= 0 ? '#00FF00' : '#FF0000',
                }}>
                {item.priceChange.toFixed(2)}%
              </Text>
            </XStack>
          </CardHeader>
        </Card>
      </XStack>
    </Pressable>
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
          {tokenData && tokenData.basicInfo[0] && (
            <CryptoCard
              item={tokenData.basicInfo[0]}
              onPress={() => {
                console.log(`Clicked on ${tokenData.basicInfo[0].name}`);
              }}
            />
          )}
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
          {tokenData && tokenData.basicInfo[1] && (
            <CryptoCard
              item={tokenData.basicInfo[1]}
              onPress={() => {
                console.log(`Clicked on ${tokenData.basicInfo[1].name}`);
              }}
            />
          )}
          {renderNumpad('sell')}
        </YStack>
      </Tabs.Content>
    </Tabs>
  );
};

export default HorizontalTabs;

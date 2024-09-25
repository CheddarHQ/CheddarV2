import { Buffer } from 'buffer';
global.Buffer = Buffer;
import { Dimensions, Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Text, SizableText, Tabs, XStack, YStack, Button, Card, CardHeader, Avatar } from 'tamagui';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useGlobalSearchParams } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { useRecoilValue, SetRecoilState } from 'recoil';

import {
  phantomStatus,
  phantomPublicKey,
  outputMintAtom,
  chainIdAtom,
  inputMintAtom,
  sharedSecretAtom,
  detailedInfoAtom,
  phantomSessionAtom,
} from '~/state/atoms';
import { TokenBasicInfo } from '~/app/crypto/[id]';

import { detailedInfoProps } from '~/state/atoms';
import { phantomSelector } from '~/state/selectors';
import { Goldman_400Regular } from '@expo-google-fonts/goldman';
import AnimatedInput from './AnimateMoney';
import AnimatedText from './AnimateMoney';

interface HorizontalTabsProps {
  connectionStatus: string;
}

const HorizontalTabs = ({ connectionStatus }: HorizontalTabsProps) => {
  const [pressedButton, setPressedButton] = useState(null);
  const setChainId = useSetRecoilState(chainIdAtom);
  const [outputMint, setOutputMint] = useRecoilState(outputMintAtom);
  const [inputMint, setInputMint] = useRecoilState(inputMintAtom);
  const navigation = useNavigation();

  const { detailedInfo } = useGlobalSearchParams<{ detailedInfo: string }>();

  const memoizedDetailedInfo = useMemo(() => detailedInfo, []);

  const { sharedSecret, session, phantomWalletPublicKey, chainId } =
    useRecoilValue(phantomSelector);

  if (memoizedDetailedInfo) {
    const parsedDetailedInfo = JSON.parse(memoizedDetailedInfo || 'null');

    setChainId(parsedDetailedInfo.chainId);
  }

  const [tokenInfo, setTokenInfo] = useState<TokenBasicInfo | null>(null);

  const closeModal = () => {
    navigation.goBack();
  };

  useEffect(() => {
    try {
      const parsedDetailedInfo = JSON.parse(memoizedDetailedInfo || 'null');
      // console.log('Parsed detailedInfo:', parsedDetailedInfo);

      setChainId(parsedDetailedInfo.chainId);

      if (chainId === 'ethereum') {
        setInputMint('0x1234567890abcdef1234567890abcdef12345678');
      }

      setOutputMint(parsedDetailedInfo.baseAddress);

      setTokenInfo(parsedDetailedInfo);
    } catch (error) {
      console.error('Error parsing detailedInfo:', error);
      setTokenInfo(null);
    }
  }, []);

  const [buyInput, setBuyInput] = useState('');
  const [sellInput, setSellInput] = useState('');
  const [activeTab, setActiveTab] = useState('tab1');

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
      const fontSize = inputLength.value > 8 ? withTiming(20) : withTiming(30);
      return {
        fontSize,
        fontFamily: 'Goldman',
        color: '#FFFFFF',
        fontWeight: 'bold',
        position: 'absolute',
        top: 20,
      };
    });
  const formatAmount = (amount: any) => {
    if (amount >= 1e6) {
      return (amount / 1e6).toFixed(2) + 'M'; // Million
    } else if (amount >= 1e3) {
      return (amount / 1e3).toFixed(2) + 'K'; // Thousand
    }
    return amount.toFixed(2); // No formatting
  };

  interface CryptoCardProps {
    item: TokenBasicInfo;
    onPress: () => void;
    input: string;
  }

  const CryptoCard = ({ item, onPress, input }: CryptoCardProps) => {
    // Calculate the equivalent amount of the item based on the input in Solana
    const itemAmount = Number(input) / Number(item.priceNative);

    return (
      <Pressable onPress={onPress}>
        <XStack
          alignSelf="center"
          justifyContent="center"
          backgroundColor={'rgba(255,255,255,0.1)'}
          borderRadius={100}
          padding={8}
          height={28}
          marginBottom={'$-19'}>
          <XStack paddingRight={3}>
            <Text
              fontWeight={700}
              fontFamily={'Goldman'}
              color={'#F6F6F6'}
              alignSelf="center"
              fontSize={12}>
              {input} sol = {formatAmount(itemAmount)} {item.symbol}
            </Text>
          </XStack>
        </XStack>
      </Pressable>
    );
  };

  interface customButtonProps {
    onPress: any;
    title: string;
  }
  function customButton({ onPress, title }: customButtonProps) {
    return (
      <XStack onPress={onPress}>
        <Text>{title}</Text>
      </XStack>
    );
  }

  const renderNumpad = (inputType: 'buy' | 'sell') => (
    <YStack
      borderRadius={50}
      width={328}
      height={395}
      paddingTop={50}
      alignItems="center"
      backgroundColor={'black'}>
      {[
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['.', '0', '←'],
      ].map((row, i) => (
        <XStack key={i} justifyContent="space-around" width="100%" maxWidth={360} marginBottom={10}>
          {row.map((num) => (
            <Button
              key={num}
              size={'$5'}
              backgroundColor={'#000000'}
              borderRadius={100}
              onPress={() => {
                if (num === '←') handleBackspace(inputType);
                else if (inputType === 'buy') handleBuyPress(num);
                else handleSellPress(num);
              }}>
              <Text color="#FFFFFF" fontSize={30} fontFamily={'Goldman'}>
                {num}
              </Text>
            </Button>
          ))}
        </XStack>
      ))}
    </YStack>
  );

  const { height, width } = useWindowDimensions();

  return (
    <Tabs
      defaultValue="tab1"
      value={activeTab}
      onValueChange={setActiveTab}
      orientation="horizontal"
      flexDirection="column"
      width={width - 40}
      height={650}
      marginTop={30}
      borderRadius="$4"
      overflow="hidden">
      <Tabs.List aria-label="Manage your account" paddingBottom={'$10'}>
        <Tabs.Tab
          flex={1}
          value="tab1"
          marginRight={100}
          borderRadius={100}
          backgroundColor={activeTab === 'tab1' ? '#FEF503' : '#615E24'} // Set background color based on active tab
        >
          <XStack justifyContent="space-between" gap={30} alignContent="center" alignItems="center">
            <SizableText fontFamily="Goldman" fontSize={12} color={'black'} fontWeight={700}>
              BUY
            </SizableText>
            <MaterialIcons name="trending-up" size={24} color="black" />
          </XStack>
        </Tabs.Tab>
        <Tabs.Tab
          flex={1}
          value="tab2"
          borderRadius={100}
          backgroundColor={activeTab === 'tab2' ? '#FEF503' : '#615E24'} // Set background color based on active tab
        >
          <XStack justifyContent="space-between" gap={30} alignContent="center" alignItems="center">
            <SizableText fontFamily="Goldman" fontSize={12} color={'black'} fontWeight={700}>
              SELL
            </SizableText>
            <MaterialIcons name="trending-down" size={24} color="black" />
          </XStack>
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Content value="tab1" flex={1}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap={'$10'}>
          <XStack justifyContent="center" alignItems="center" top={50}>
            {tokenInfo && (
              <Avatar circular size={100}>
                <Avatar.Image accessibilityLabel={tokenInfo.name} src={tokenInfo.imageUrl} />
                <Avatar.Fallback backgroundColor="$blue10" />
              </Avatar>
            )}
          </XStack>
          <XStack
            justifyContent="center"
            alignItems="center"
            width="100%"
            maxWidth={360}
            marginBottom={'$-18'}>
            {/* <Animated.Text style={animatedStyle(buyInputLength)}>
              +{buyInput || '0'} SOL
            </Animated.Text> */}
            <AnimatedText
              style={{ fontSize: 30, color: 'white', fontFamily: 'Goldman' }} // Adjust styles as needed
              displayValue={`+${buyInput || '0'}`}
            />
          </XStack>
          {tokenInfo ? (
            <XStack marginBottom={'$-4'}>
              <CryptoCard item={tokenInfo} input={buyInput} onPress={closeModal} />
            </XStack>
          ) : (
            <Text>No token information available</Text>
          )}
          {renderNumpad('buy')}
        </YStack>
      </Tabs.Content>

      <Tabs.Content value="tab2" flex={1}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap={'$10'}>
          <XStack justifyContent="center" alignItems="center" top={50}>
            {tokenInfo && (
              <Avatar circular size={100}>
                <Avatar.Image accessibilityLabel={tokenInfo.name} src={tokenInfo.imageUrl} />
                <Avatar.Fallback backgroundColor="$blue10" />
              </Avatar>
            )}
          </XStack>
          <XStack
            justifyContent="center"
            alignItems="center"
            width="100%"
            maxWidth={360}
            marginBottom={'$-18'}>
            {/* <Animated.Text style={animatedStyle(sellInputLength)}>
              -{sellInput || '0'} SOL
            </Animated.Text> */}
            <AnimatedText
              style={{ fontSize: 32, color: 'white', fontFamily: 'Goldman' }} // Adjust styles as needed
              displayValue={`-${sellInput || '0'}`}
            />
          </XStack>
          {tokenInfo && (
            //   <XStack marginBottom={'$-4'}>
            //   <CryptoCard item={tokenInfo} input={buyInput} onPress={closeModal} />
            // </XStack>
            <XStack marginBottom={'$-4'}>
              <CryptoCard
                item={tokenInfo}
                input={sellInput}
                onPress={() => {
                  console.log(`Clicked on ${tokenInfo.name}`);
                }}
              />
            </XStack>
          )}
          {renderNumpad('sell')}
        </YStack>
      </Tabs.Content>
    </Tabs>
  );
};

export default HorizontalTabs;

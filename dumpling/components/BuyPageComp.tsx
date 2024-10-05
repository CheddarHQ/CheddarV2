import React, { useState, useEffect } from 'react';
import { Pressable, useWindowDimensions } from 'react-native';
import { Text, XStack, YStack, Button, Avatar } from 'tamagui';
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import { useGlobalSearchParams, useNavigation } from 'expo-router';
import AnimatedText from './AnimateMoney';
import { chainIdAtom, outputMintAtom, inputMintAtom } from '~/state/atoms';
import { phantomSelector } from '~/state/selectors';
import { TokenBasicInfo } from '~/app/crypto/buy/[id]';

const BuyPage = () => {
  const [buyInput, setBuyInput] = useState('');
  const setChainId = useSetRecoilState(chainIdAtom);
  const [outputMint, setOutputMint] = useRecoilState(outputMintAtom);
  const [inputMint, setInputMint] = useRecoilState(inputMintAtom);
  const navigation = useNavigation();
  const { detailedInfo } = useGlobalSearchParams<{ detailedInfo: string }>();
  const { chainId } = useRecoilValue(phantomSelector);
  const [tokenInfo, setTokenInfo] = useState<TokenBasicInfo | null>(null);

  useEffect(() => {
    try {
      const parsedDetailedInfo = JSON.parse(detailedInfo || 'null');
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
  }, [detailedInfo, chainId, setChainId, setInputMint, setOutputMint]);

  const handleBuyPress = (num: string) => {
    setBuyInput((prev) => prev + num);
  };

  const handleBackspace = () => {
    setBuyInput((prev) => prev.slice(0, -1));
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1e6) return (amount / 1e6).toFixed(2) + 'M';
    if (amount >= 1e3) return (amount / 1e3).toFixed(2) + 'K';
    return amount.toFixed(2);
  };

  const CryptoCard = ({ item, input }: { item: TokenBasicInfo; input: string }) => {
    const itemAmount = Number(input) / Number(item.priceNative);
    return (
      <Pressable onPress={() => navigation.goBack()}>
        <XStack
          alignSelf="center"
          justifyContent="center"
          backgroundColor={'rgba(255,255,255,0.1)'}
          borderRadius={100}
          padding={8}
          height={28}
          marginBottom={'$-19'}>
          <Text
            fontWeight={700}
            fontFamily={'Poppins'}
            color={'#F6F6F6'}
            alignSelf="center"
            fontSize={12}>
            {input} sol = {formatAmount(itemAmount)} {item.symbol}
          </Text>
        </XStack>
      </Pressable>
    );
  };

  const renderNumpad = () => (
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
              onPress={() => (num === '←' ? handleBackspace() : handleBuyPress(num))}>
              <Text color="#FFFFFF" fontSize={30} fontFamily={'Poppins'}>
                {num}
              </Text>
            </Button>
          ))}
        </XStack>
      ))}
    </YStack>
  );

  const { width } = useWindowDimensions();

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" gap={'$10'} width={width - 40}>
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
        <AnimatedText
          style={{ fontSize: 30, color: 'white', fontFamily: 'Poppins' }}
          displayValue={`+${buyInput || '0'}`}
        />
      </XStack>
      {tokenInfo && (
        <XStack marginBottom={'$-4'}>
          <CryptoCard item={tokenInfo} input={buyInput} />
        </XStack>
      )}
      {renderNumpad()}
    </YStack>
  );
};

export default BuyPage;

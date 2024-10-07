import { View, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { YStack, Text, XStack, Separator, Button, Avatar, Card, Dialog } from 'tamagui';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { DynamicContextProvider, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useDynamic } from '~/client';
import { getWalletBalance } from '~/utils/getBalance';
import { useRecoilState } from 'recoil';
import { balanceAtom } from '~/state/atoms';
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';
// import Balances from '~/components/Holdings';

const { width } = Dimensions.get('window');

const holdings = () => {
  // Hardcoded data for the flat list

  const [balance, setBalance] = useRecoilState(balanceAtom);

  const data = [
    {
      key: '1',
      symbol: 'MOTHER',
      priceUsd: '2400',
      priceChange: 5.38,
      baseAddress: '0x1234567890abcdef',
      imageUrl: 'https://cryptoicons.org/api/icon/btc/200',
    },
    {
      key: '2',
      symbol: 'ETH',
      priceUsd: '1089',
      priceChange: -2.45,
      baseAddress: '0xabcdef1234567890',
      imageUrl: 'https://cryptoicons.org/api/icon/eth/200',
    },
    {
      key: '3',
      symbol: 'LTC',
      priceUsd: '600',
      priceChange: 1.23,
      baseAddress: '0x9876543210fedcba',
      imageUrl: 'https://cryptoicons.org/api/icon/ltc/200',
    },
  ];

  const { auth, wallets, ui } = useDynamic();
  const navigation = useNavigation();

  const wallet = wallets.userWallets[0];

  // const fetchedBalance = getWalletBalance(wallet.address.toString)

  // setBalance(fetchedBalance)

  useEffect(() => {
    const fetchBalance = async () => {
      const data = await getWalletBalance(wallet.address);

      setBalance(data);
    };

    fetchBalance();
  }, []);

  // Render each item as a Card
  const renderItem = ({ item }) => (
    <Card
      elevate
      paddingVertical={20}
      borderRadius={0}
      style={{ backgroundColor: 'transparent', width: width * 0.9, marginBottom: 10 }}>
      <XStack alignItems="center" alignContent="center" justifyContent="space-between">
        <XStack gap={10}>
          <Avatar circular height={60}>
            <Avatar.Image accessibilityLabel={`Token ${item.symbol}`} src={item.imageUrl} />
            <Avatar.Fallback delayMs={600} backgroundColor="#808080" />
          </Avatar>
          <YStack gap={4}>
            <Text fontFamily="Goldman" color={'white'} fontWeight={700} fontSize={16}>
              {item.symbol}
            </Text>
            <Text fontFamily="Goldman" color={'#5D5D5D'} fontWeight={400} fontSize={14}>
              {item.baseAddress.slice(0, 4)}...{item.baseAddress.slice(-4)}
            </Text>
          </YStack>
        </XStack>
        <YStack gap={4}>
          <Text
            fontFamily="Goldman"
            color={'white'}
            fontWeight={700}
            fontSize={14}
            alignSelf="flex-end">
            ${item.priceUsd}
          </Text>
          <Text
            fontFamily="Goldman"
            color={item.priceChange >= 0 ? '#00FF00' : '#FF0000'}
            fontSize={14}
            fontWeight={400}
            alignSelf="flex-end">
            {item.priceChange.toFixed(2)}%
          </Text>
        </YStack>
      </XStack>
    </Card>
  );

  return (
    <YStack
      flex={1}
      justifyContent="flex-start"
      alignItems="center"
      padding={16}
      paddingTop={100}
      backgroundColor="#0a0b0f">
      {/* Total Cheddar Section */}
      <XStack marginBottom={10}>
        <Text color={'#B0B0B0'} fontWeight={600}>
          Total in Cheddar
        </Text>
      </XStack>
      <XStack marginBottom={10}>
        <Text fontSize={40} fontWeight={'bold'} color="#FFFFFF">
          <FontAwesome5 name="rupee-sign" size={32} color="white" /> {balance}
        </Text>
      </XStack>
      <XStack marginBottom={20}>
        {/* <Text color={'#00FF00'} fontWeight={'bold'} paddingRight={5}>
          5.38%
        </Text>
        <Text color={'#B0B0B0'}>All Time</Text> */}
      </XStack>

      <XStack justifyContent="space-around" marginVertical={20} width={width * 0.8}>
        <Dialog>
          <Dialog.Trigger asChild>
            <TouchableOpacity>
              <YStack justifyContent="center" alignItems="center" gap={8}>
                <FontAwesome5 name="rupee-sign" size={24} color="white" />
                <Text color={'white'} fontWeight={600}>
                  Add Cash
                </Text>
              </YStack>
            </TouchableOpacity>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay
              key="overlay"
              animation="quick"
              opacity={0.5}
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
            <Dialog.Content
              bordered
              elevate
              key="content"
              animation={[
                'quick',
                {
                  opacity: {
                    overshootClamping: true,
                  },
                },
              ]}
              enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
              exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
              x={0}
              scale={1}
              opacity={1}
              y={0}
              backgroundColor="black">
              <YStack space>
                <Dialog.Title alignSelf="center">Add Cash</Dialog.Title>
                <Dialog.Description color={'#808080'} marginTop={-10}>
                  Choose a method to add cash to your account
                </Dialog.Description>
                <XStack space justifyContent="center">
                  <Link href="/addMoney" asChild>
                    <Dialog.Close asChild>
                      <Button backgroundColor="white" color="black">
                        <Text fontWeight={'bold'}>Card</Text>
                      </Button>
                    </Dialog.Close>
                  </Link>
                  <Link href="/addMoneyUpi" asChild>
                    <Dialog.Close asChild>
                      <Button backgroundColor="white" color="black">
                        <Text fontWeight={'bold'}>UPI</Text>
                      </Button>
                    </Dialog.Close>
                  </Link>
                </XStack>
              </YStack>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
        <YStack justifyContent="center" alignItems="center" gap={8}>
          <TouchableOpacity>
            <Feather name="send" size={24} color="white" />
          </TouchableOpacity>
          <Text color={'white'} fontWeight={600}>
            {' '}
            Send{' '}
          </Text>
        </YStack>
        <YStack justifyContent="center" alignItems="center" gap={8}>
          <TouchableOpacity>
            <MaterialCommunityIcons name="swap-vertical" size={24} color="white" />
          </TouchableOpacity>
          <Text color={'white'} fontWeight={600}>
            {' '}
            Cash Out{' '}
          </Text>
        </YStack>
      </XStack>

      <Separator marginVertical={10} backgroundColor="#808080" />

      <XStack padding={8} justifyContent="space-between" width={width * 0.9}>
        <XStack alignItems="center">
          {/* <Text fontWeight={'bold'} fontSize={25} color="#FFFFFF">
            Cash
          </Text>
          <Text color={'#B0B0B0'} fontSize={20} paddingLeft={10}>
            
          </Text> */}
        </XStack>
        <AntDesign name="plus" size={24} color="white" />
      </XStack>

      <Separator marginVertical={10} backgroundColor="#808080" />
      {/* <Balances/> */}
    </YStack>
  );
};

export default holdings;

import { View, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import React, {useEffect, useState} from 'react';
import { YStack, Text, XStack, Separator, Button, Avatar, Card } from 'tamagui';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { DynamicContextProvider, useDynamicContext, useMultiWalletPromptState } from "@dynamic-labs/sdk-react-core";
import { useDynamic } from '~/client';
import { getTokenData, getWalletBalance } from '~/utils/getBalance';
import { useRecoilState } from 'recoil';
import { balanceAtom } from '~/state/atoms';
import { TokenData } from './analytics';
import { TokenBasicInfo } from './analytics';
import axios from "axios"


const { width } = Dimensions.get('window');


interface mergedDataProps{
    balance: number,
    mint: string,
    pubkey: string,
    name: string,
    symbol: string,
    logoURI: string
    verified: true
}


const holdings = () => {
  // Hardcoded data for the flat list


  const [balance , setBalance] = useRecoilState(balanceAtom)
  const [tokenData, setTokenData] = useState()
  const [loading, setLoading ] = useState(false)
  const [pubkeyIds, setPubkeyIds] = useState('');
  const [mintIds, setMintIds] = useState([]);
  const [mergedData, setMergedData] = useState<mergedDataProps[]>([])

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


  
  
  
  const { auth, wallets, ui} = useDynamic();
  
  const wallet = wallets.userWallets[0];
  
  
  const mergeTokenAndMintData = (tokenData, mintData) => {
    return tokenData.map(token => {
      const mintInfo = mintData.content.find(mint => mint.address === token.mint);
      return {
        ...token,
        ...(mintInfo ? {
          name: mintInfo.name,
          symbol: mintInfo.symbol,
          decimals: mintInfo.decimals,
          holders: mintInfo.holders,
          logoURI: mintInfo.logoURI,
          verified: mintInfo.verified
        } : {})
      };
    });
  };


  // const fetchedBalance = getWalletBalance(wallet.address.toString)

  // setBalance(fetchedBalance)

  useEffect(() => {
    async function fetchMetadata(ids: string) {
      if(ids.length === 0) return;
        try {
          setLoading(true);
          console.log('Fetching data...');
          
          const payload = {
            addresses : ids
          } //convert this into an array first
          
          const response = await axios.post(
          `https://token-list-api.solana.cloud/v1/mints?chainId=101`, payload);

          const data = response.data
          const mergedData = mergeTokenAndMintData(tokenData, data);
          
          setMergedData(mergedData);
          
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
      
      fetchMetadata(mintIds);
    
      
      const intervalId = setInterval(() => {
        fetchMetadata(mintIds);
      }, 300000);

    return () => clearInterval(intervalId);
  }, [mintIds]);

  


  useEffect(()=>{
    const fetchBalance = async ()=>{
      const data = await getWalletBalance(wallet.address)
    
      setBalance(data)
    }

    fetchBalance()
  },[])

  useEffect(()=>{
    const fetchTokenData = async ()=>{
      const {tokenData, pubkeys, mints} = await getTokenData(wallet.address)

      setTokenData(tokenData)
      setPubkeyIds(pubkeys)
      setMintIds(mints)
    }
    fetchTokenData()
  },[])


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
            <Avatar.Image accessibilityLabel={`Token ${item.symbol}`} src={item.logoURI} />
            <Avatar.Fallback delayMs={600} backgroundColor="#808080" />
          </Avatar>
          <YStack gap={4}>
            <Text fontFamily="Goldman" color={'white'} fontWeight={700} fontSize={16}>
              {item.symbol}
            </Text>
            <Text fontFamily="Goldman" color={'#5D5D5D'} fontWeight={400} fontSize={14}>
              {item.balance}
            </Text>
          </YStack>
        </XStack>
        <YStack gap={4}> 
        </YStack>
      </XStack>
    </Card>
  );

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding={16}
      paddingTop={100}
      backgroundColor="#121212">
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
        <YStack justifyContent="center" alignItems="center" gap={8}>
          <TouchableOpacity>
            <FontAwesome5 name="rupee-sign" size={24} color="white" />
          </TouchableOpacity>
          <Text color={'white'} fontWeight={600}>
            Add Cash
          </Text>
        </YStack>
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
      {/* FlatList for holdings */}
      <FlatList
        data={mergedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.mint}
        showsVerticalScrollIndicator={false}
        style={{ marginTop: 20 }}
      />
    </YStack>
  );
};

export default holdings;
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  FlatList,
  Dimensions,
  Platform,
  SectionList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Input, Card, Avatar, YStack, XStack, ZStack } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { ThisLoader } from '~/components/LgSkeleton';
import MagIcon from '../../assets/svg/search.svg';
import Animated, {
  Extrapolate,
  interpolate,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
} from 'react-native-reanimated';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('screen');
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
import { useRecoilValue } from 'recoil';
import { balanceAtom } from '~/state/atoms';
import { useDynamic } from '~/client';
import { getTokenData, getWalletBalance } from '~/utils/getBalance';
import { G } from 'react-native-svg';
import axios from "axios"

interface TokenBasicInfo {
  name: string;
  baseAddress: string;
  priceUsd: string;
  priceNative: string;
  imageUrl: string;
  priceChange: number;
  symbol: string;
}

interface TokenData {
  basicInfo: TokenBasicInfo[];
  detailedInfo: any[]; // Change this to an array
}

const _colors = {
  bg: '#111314',
  text: '#EAE9EE',
};
const _spacing = 10;
const _itemSize = width * 0.2;
const _otherSize = width * 0.3;

export default function Modal() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [headerData, setHeaderData] = useState(_headerDataDummy);

  const initialIdsDummy =
    'GfihScsf95v8G4TR73k2EcwXM2DrX63J7GX1i79GNbGs,FpjYwNjCStVE2Rvk9yVZsV46YwgNTFjp7ktJUDcZdyyk,HQQrpzTmt7KcGMf5E7RYgbDmz5izRxtHFCU9sZK6XANQ,HcPgh6B2yHNvT6JsEmkrHYT8pVHu9Xiaoxm4Mmn2ibWw,4xxM4cdb6MEsCxM52xvYqkNbzvdeWWsPDZrBcTqVGUar,zcdAw3jpcqEY8JYVxNVMqs2cU35cyDdy4ot7V8edNhz,6DowxaYxUdjNJknq9Cjfc5dy4Mq8Vv4BHXXY4zn6LTQy,5eLRsN6qDQTQSBF8KdW4B8mVpeeAzHCCwaDptzMyszxH,9uWW4C36HiCTGr6pZW9VFhr9vdXktZ8NA8jVnzQU35pJ,FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E,H6fxtvWLFYSJ66mPJqoz7cg6tk32Pcgc9vXrywu4LEWk,AB1eu2L1Jr3nfEft85AuD2zGksUbam1Kr8MR3uM2sjwt,2qWwU2UxvGnKKMKFysoX81F4wDhGB8EThZrV9noLXVFL,Fv6LxMh9DZZ2Xc1yzkKKLeqEkPkdv1jmKjrJg2vE2HBg,6oFWm7KPLfxnwMb3z5xwBoXNSPP3JJyirAPqPSiVcnsp,2M8mTcrAMf7nrBbex2SNzzUfiBd8YXs7t3yS1dRvheyA';

  const [initialIds, setInitialIds] = useState(initialIdsDummy)
  const [trendingIds, setTrendingIds] = useState("")


  const router = useRouter();

  const [balance, setBalance] = useState(0)
  const [walletTokenData, setWalletTokenData] = useState("")
  const { auth, wallets, ui } = useDynamic();
  

  function getFirst20Ids(pools) {
    // Get the first 20 pools and map to their ids
    const first20Ids = pools.slice(0, 20).map(pool => pool.attributes.address);
    console.log("First 20 Ids :", first20Ids) 
    setInitialIds(first20Ids.join(","))
  
    return first20Ids;
  }
  

  function getTop10Addresses(pools) {
    // Sort the pools based on from_volume_in_usd in descending order
    const sortedPools = pools.sort((a, b) => {
      return parseFloat(b.attributes.from_volume_in_usd) - parseFloat(a.attributes.from_volume_in_usd);
    });

    // Get the top 10 pools and map to their addresses
    const top10Addresses = sortedPools.slice(0, 10).map(pool => pool.attributes.address);

    return top10Addresses;
  }

  const transformMetadata = (data) => {
    return data.basicInfo.map((token) => ({
      key: token.baseAddress,
      name: token.name,
      symbol: token.symbol,
      priceChange: token.priceChange > 0 ? `+${token.priceChange}%` : `${token.priceChange}%`,
      price: `$${token.priceUsd}`,
      avatar: token.imageUrl,
    }));
  };

  useEffect(()=>{
    const fetchTrendingIds = async()=>{
      const response = await axios.get("https://app.geckoterminal.com/api/p1/pools?page=1&include_network_metrics=true&include_meta=1&include=dex%2Cdex.network%2Ctokens%2Ctokens.tags&fields%5Btoken%5D=tags%2Cname%2Csymbol%2Caddress%2Cimage_url&fields%5Btag%5D=name%2Cidentifier%2Cvolume_percent_changes")

      const data = response.data.data;
      const top10Addresses = getTop10Addresses(data)
      const first20Addresses = getFirst20Ids(data)

      console.log("Top 10 Addresses :", top10Addresses)
      setTrendingIds(top10Addresses.join(","))
      setInitialIds(first20Addresses.join(","))
    }
    fetchTrendingIds()

  },[])

  useEffect(()=>{
    const fetchGainers = async()=>{
      const response = await axios.get("https://api.moonshot.cc/trades/v2/latest/solana?minVolumeUsd=5&limit=30")

      const data = response.data;

      const tokens = data.map((token)=>{
        const baseToken = token.baseToken;
        const progress = token.metadata.progress
        return {
          key : baseToken.address,
          name: baseToken.name,
          symbol: baseToken.symbol,
          avatar: baseToken.icon,
          address : baseToken.address,
          progress : progress
        }
      })  

      setHeaderData(tokens);
    }

    fetchGainers();
  }, [initialIds, headerData, trendingIds])

  const [topGainers, setTopGainers] = useState([]);

  useEffect(() => {
    const fetchTopGainers = async () => {
      try {
        const response = await fetch(
          'https://app.geckoterminal.com/api/p1/pools?page=1&include_network_metrics=true&Y=1&include=dex%2Cdex.network%2Ctokens%2Ctokens.tags&fields%5Btoken%5D=tags%2Cname%2Csymbol%2Caddress%2Cimage_url&fields%5Btag%5D=name%2Cidentifier%2Cvolume_percent_changes'
        );
        const data = await response.json();

        const processedData = data.data
          .map((pool) => {
            const priceChange = pool.attributes.price_percent_changes?.last_24h;
            const changeNum = parseFloat(priceChange?.replace('%', ''));

            const networkId = pool.relationships?.dex?.data?.relationships?.network?.data?.id;
            const networkData = data.included.find(
              (item) => item.type === 'network' && item.id === networkId
            );

            // Get token data
            const tokenId = pool.relationships?.tokens?.data[0]?.id;
            const tokenData = data.included.find(
              (item) => item.type === 'token' && item.id === tokenId
            );

            // Use token image if available, fallback to network image
            const imageUrl =
              tokenData?.attributes?.image_url || networkData?.attributes?.image_url || null;

            return {
              key: pool.id,
              name: pool.attributes.name,
              symbol: pool.attributes.name.split(' / ')[0],
              priceChange: priceChange || '0%',
              changeNum: changeNum || 0,
              price: pool.attributes.price_in_usd,
              avatar: imageUrl,
            };
          })
          .filter((item) => !isNaN(item.changeNum))
          .sort((a, b) => b.Num - a.changeNum)
          .slice(0, 10);

        setTopGainers(processedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching top gainers:', error);
        setLoading(false);
      }
    };

    fetchTopGainers();
    const interval = setInterval(fetchTopGainers, 300000);
    return () => clearInterval(interval);
  }, []);
  

  useEffect(()=>{
    // const fetchData = async ()=>{
    //   const response = await getTokenData(wallets.userWallets[0].address);
    //   console.log("TokenData :", response)
    //   setWalletTokenData(response)
    // }

    const getBalance = async()=>{
      const data = await getWalletBalance(wallets.userWallets[0].address)
      setBalance(data)

    }

    getBalance()

    // fetchData();
  },[])



  useEffect(() => {
    async function fetchMetadata(ids: string) {
      try {
        setLoading(true);
        console.log('Fetching data...');
        const response = await fetch(
          `https://sushi.cheddar-io.workers.dev/api/data/fetchmetadata?ids=${ids}`
        );
        const data: TokenData = await response.json();

        setTokenData(data);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    }

    fetchMetadata(initialIds);

    const intervalId = setInterval(() => {
      fetchMetadata(initialIds);
    }, 300000);

    return () => clearInterval(intervalId);
  }, [initialIds, trendingIds]);

  // useEffect(() => {
  //   async function fetchMetadata(ids: string) {
  //     try {
  //       setLoading(true);
  //       console.log('Fetching data...');
  //       const response = await fetch(
  //         `https://sushi.cheddar-io.workers.dev/api/data/fetchmetadata?ids=${ids}`
  //       );
  //       const data: TokenData = await response.json();

  //       setTokenData(data);

  //       // const newHeaderData = transformMetadata(data);
  //       // console.log("New header data :", newHeaderData)
  //       // setHeaderData(newHeaderData)

  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //       setError(error instanceof Error ? error.message : String(error));
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   fetchMetadata(trendingIds);

  //   const intervalId = setInterval(() => {
  //     fetchMetadata(trendingIds);
  //   }, 300000);

  //   return () => clearInterval(intervalId);
  // }, [initialIds, trendingIds]);

  useEffect(() => {
    if (query === '') return;

    async function fetchSearchResults(query: string) {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching data with query:', query);

        const response = await fetch(
          `https://sushi.cheddar-io.workers.dev/api/data/fetchquery?query=${query}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data: TokenData = await response.json();
        setTokenData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    }

    const timeoutId = setTimeout(() => {
      fetchSearchResults(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const headerHeight = 200; // Adjust this value based on your design
  const searchBarHeight = 60; // Adjust this value based on your design

  const headerAnim = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const headerHeightValue = useSharedValue(height);

  const onScroll = useAnimatedScrollHandler((event) => {
    const { y } = event.contentOffset;
    scrollY.value = y;
    headerAnim.value = y;
  });

  const dummyHeaderStylez = useAnimatedStyle(() => {
    return {
      height: headerHeightValue.value,
    };
  });

  const balanceStylez = useAnimatedStyle(() => {
    const _extraSectionHeaderSpacing = _spacing * 3;
    return {
      opacity: interpolate(
        headerAnim.value,
        [0, _itemSize, _itemSize + _extraSectionHeaderSpacing, headerHeightValue.value],
        [1, 1, 1, 0]
      ),
      transform: [
        {
          translateY: interpolate(
            headerAnim.value,
            [
              0,
              _itemSize,
              _itemSize + _extraSectionHeaderSpacing,
              _itemSize + _extraSectionHeaderSpacing + 1,
            ],
            [0, 0, 0, -1]
          ),
        },
      ],
    };
  });

  const headerStylez = useAnimatedStyle(() => {
    return {
      transform: [
        {
          perspective: _itemSize * 5,
        },
        {
          translateY: interpolate(
            headerAnim.value,
            [0, _itemSize],
            [0, -_itemSize / 2],
            Extrapolate.CLAMP
          ),
        },
        {
          rotateX: `${interpolate(
            headerAnim.value,
            [0, _itemSize],
            [0, 90],
            Extrapolate.CLAMP
          )}deg`,
        },
      ],
      opacity: interpolate(
        headerAnim.value,
        [0, _itemSize / 2, _itemSize],
        [1, 1, 0],
        Extrapolate.CLAMP
      ),
    };
  });

  const _colors = {
    bg: '#030303',
    text: '#EAE9EE',
  };

  return (
    <YStack flex={1} backgroundColor={_colors.bg} paddingTop={50} paddingHorizontal={10}>
      <LinearGradient colors={['transparent', 'rgba(255,252,127,0.4)']} style={styles.background} />

      {/* Fixed Search Bar */}
      <View style={[styles.searchBar, { height: searchBarHeight }]}>
        <ZStack flex={1}>
          {/* Adjusted input field */}
          <Input
            width="100%"
            height={42}
            paddingHorizontal={45} // Adjust padding to avoid overlapping the button
            borderWidth={1}
            paddingVertical={9}
            placeholder="Search item here"
            borderRadius={20}
            color="#FFFFFF"
            backgroundColor="#18191B"
            borderColor="rgba(255, 255, 255, 0.1)"
            value={query}
            onChangeText={setQuery}
          />
          {/* Adjusted Search Icon Position */}
        </ZStack>
      </View>

      <AnimatedSectionList
        sections={tokenData?.basicInfo ? [{ title:"Tokens", data: tokenData.basicInfo }] : []}
        keyExtractor={(item: any) => item.baseAddress}
        onScroll={onScroll}
        ListHeaderComponent={
          <View>
            <Animated.View style={dummyHeaderStylez} />
            {/* Collapsible Header */}
            <View
              style={[styles.header, { position: 'absolute', zIndex: 1 }]}
              onLayout={(ev) => {
                if (headerHeightValue.value === ev.nativeEvent.layout.height) {
                  return;
                }
                headerHeightValue.value = withTiming(ev.nativeEvent.layout.height, {
                  duration: 0,
                });
              }}>
              <Animated.View style={[styles.balanceContainer, balanceStylez]}>
                {/* <Text style={[styles.regular, { fontSize: 42, color: _colors.text }]}>$4650</Text> */}
                <Text fontSize={42} color={'#fff'}>
                  {balance} SOL
                </Text>
                {/* <Text style={[styles.regular, { color: _colors.text, opacity: 0.6 }]}> */}
                <Text color={'#808080'} opacity={0.6}>
                  Total Balance
                </Text>
              </Animated.View>
              <AnimatedFlatList
                data={topGainers}
                keyExtractor={(item: any) => item.key}
                horizontal
                style={[{ flexGrow: 0 }, headerStylez]}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <XStack
                    padding={10}
                    borderColor={'#808080'}
                    borderWidth={1}
                    borderRadius={50}
                    alignItems="center"
                    marginHorizontal={6}
                    space>
                    <Avatar circular size={40}>
                      <Avatar.Image src={item.avatar} />
                    </Avatar>
                    <XStack gap={8}>
                      <Text color={'white'} fontWeight="bold">
                        {item.symbol}
                      </Text>
                      <Text color={'green'}>
                        {item.priceChange}
                      </Text>
                    </XStack>
                  </XStack>
                )}
              />
            </View>
          </View>
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={{ backgroundColor: `${_colors.bg}cc` }}>
            <Text style={[styles.bold, styles.sectionHeader]}>{title}</Text>
          </View>
        )}
        renderItem={({ item }: { item: any }) => (
          <Pressable
            onPress={() => {
              const detailedInfo = tokenData.detailedInfo.find(
                (detail) => detail.baseAddress === item.baseAddress
              );
              if (detailedInfo) {
                const detailedInfoString = JSON.stringify(detailedInfo);
                router.push({
                  pathname: `/cryptoGraph/${item.baseAddress}`,
                  params: { detailedInfo: detailedInfoString },
                });
              } else {
                console.log(`No detailed info found for ${item.baseAddress}`);
              }
            }}>
            <Card
              elevate
              paddingVertical={20}
              borderRadius={0}
              style={{ backgroundColor: 'transparent' }}>
              <XStack alignItems="center" alignContent="center" justifyContent="space-between">
                <XStack gap={10}>
                  <Avatar circular height={60}>
                    <Avatar.Image accessibilityLabel={`Token ${item.symbol}`} src={item.imageUrl} />
                    <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                  </Avatar>
                  <YStack gap={4}>
                    <Text fontFamily="Goldman" color={'white'} fontWeight={700} fontSize={16}>
                      {item.symbol}
                    </Text>
                    <Text fontFamily="Goldman" color={'#5D5D5D'} fontWeight={400} fontSize={14}>
                      {item.baseAddress.slice(0, 4)}...${item.baseAddress.slice(-4)}
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
          </Pressable>
        )}
      />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </YStack>
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1500,
  },
  searchBar: {
    position: 'absolute',
    top: Constants.statusBarHeight,
    left: 0,
    right: 0,
    zIndex: 10, // Ensures the search bar is on top
    paddingHorizontal: 16,
    marginRight: 10,
    paddingVertical: 8,
    backgroundColor: 'black',
  },
  header: {
    top: 0,
    left: _spacing,
    right: _spacing,
  },
  balanceContainer: {
    padding: _spacing,
    marginBottom: _spacing,
    marginTop: 50,
  },
  headerItem: {
    padding: _spacing * 2,
    backgroundColor: `${_colors.text}22`,
    marginRight: _spacing,
    height: 40,
    borderRadius: 50,
    flexDirection: 'row',
  },
  headerItemEmoji: {
    fontSize: 24,
    color: _colors.text,
    marginBottom: _spacing,
  },
  headerItemAmount: {
    fontSize: 24,
    color: _colors.text,
    fontWeight: 'bold',
  },
  headerItemDepartment: {
    fontSize: 16,
    opacity: 0.6,
    color: _colors.text,
  },
  sectionHeader: {
    fontSize: 24,
    color: _colors.text,
    padding: _spacing,
    marginVertical: _spacing,
  },
  regular: {
    fontFamily: 'LatoRegular',
  },
  bold: {
    fontFamily: 'LatoBold',
  },
});

const _headerDataDummy = [
  {
    key: '1a2b3c4d-1234-5678-9abc-def123456789',
    name: 'Shiba Inu',
    symbol: 'SHIB',
    priceChange: '+12%',
    price: '$0.00000875',
    avatar: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
  },
  {
    key: '2b3c4d5e-2345-6789-abcd-efg234567890',
    name: 'DogeCoin',
    symbol: 'DOGE',
    priceChange: '-3%',
    price: '$0.06',
    avatar: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
  },
  {
    key: '3c4d5e6f-3456-7890-bcde-fgh345678901',
    name: 'Pepe Coin',
    symbol: 'PEPE',
    priceChange: '+8%',
    price: '$0.00000112',
    avatar: 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
  },
  {
    key: '4d5e6f7g-4567-8901-cdef-hij456789012',
    name: 'Floki Inu',
    symbol: 'FLOKI',
    priceChange: '+15%',
    price: '$0.000032',
    avatar: 'https://cryptologos.cc/logos/floki-inu-floki-logo.png',
  },
  {
    key: '5e6f7g8h-5678-9012-defg-ijk567890123',
    name: 'Akita Inu',
    symbol: 'AKITA',
    priceChange: '-5%',
    price: '$0.0000015',
    avatar: 'https://cryptologos.cc/logos/akita-inu-akita-logo.png',
  },
];

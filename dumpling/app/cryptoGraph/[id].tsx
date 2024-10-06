import { useGlobalSearchParams, useLocalSearchParams } from 'expo-router';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineGraph } from 'react-native-graph';
import { Card, Text, XStack, YStack, Avatar, SizableText, Button } from 'tamagui';
const { width } = Dimensions.get('window');
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import MyCard from '~/components/MyCard';
import { formatValue } from '~/components/FormatValue';
import CopyIcon from '../../assets/svg/Vector.svg';
import { MyLoader } from '~/components/LgSkeleton';
import { WebView } from 'react-native-webview';
import { coinDirectory } from '~/utils/directory';
import { useRouter } from 'expo-router';
import CurrencyConverter from '~/components/CurrencyConverter';

interface PriceHistoryPoint {
  date: Date;
  value: number;
}

interface TokenInfo {
  imageUrl: string;
  name: string;
  symbol: string;
  liquidityUsd: string;
  marginTop: string;
  volH6: string;
  volH24: string;
  baseAddress: string;
}

type TimeRange = '1H' | '1D' | '7D' | '1M' | '6M' | '1Y';

const formatCoinName = (name: string): string => {
  if (name.toLowerCase().includes('popcat')) {
    return 'popcat-sol';
  }
  return name.toLowerCase().replace(/\s+/g, '-');
};
const fetchCoinId = (coinName: string): string | null => {
  let coinEntry = coinDirectory.values.find(
    (entry) => entry[1].toLowerCase() === coinName.toLowerCase()
  );

  if (!coinEntry) {
    coinEntry = coinDirectory.values.find(
      (entry) => entry[3].toLowerCase() === coinName.toLowerCase()
    );
  }

  if (!coinEntry) {
    coinEntry = coinDirectory.values.find(
      (entry) =>
        entry[1].toLowerCase().includes(coinName.toLowerCase()) ||
        entry[2].toLowerCase().includes(coinName.toLowerCase())
    );
  }

  return coinEntry ? coinEntry[0].toString() : null;
};

const fetchCoinData = async (coinId: string, range: TimeRange): Promise<PriceHistoryPoint[]> => {
  try {
    let apiRange = range;
    if (range === '6M') {
      apiRange = '180D'; // Use 180D instead of 6M for the API request
    }

    const response = await fetch(
      `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail/chart?id=${coinId}&range=${range}`
    );
    const data = await response.json();
    return Object.entries(data.data.points).map(([timestamp, point]: [string, any]) => ({
      date: new Date(parseInt(timestamp) * 1000),
      value: point.v[0],
    }));
  } catch (error) {
    console.error('Error fetching coin data:', error);
    return [];
  }
};

const MyChart: React.FC = ({ address = 'GKBt8MZRhKPgKtdKT1fxHGZb5n7YZXZz72YDiykBBAP' }) => {
  const { id } = useLocalSearchParams();
  const [selectedPoint, setSelectedPoint] = useState<PriceHistoryPoint | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');
  const [coinId, setCoinId] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);

  const { detailedInfo } = useGlobalSearchParams<{ detailedInfo: string }>();
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [graphLoading, setGraphLoading] = useState(true);
  const router = useRouter();
  const { convertUSDtoINR, exchangeRate, lastUpdated } = CurrencyConverter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const parsedDetailedInfo = JSON.parse(detailedInfo || 'null');
        console.log('Parsed detailedInfo:', parsedDetailedInfo);
        setTokenInfo(parsedDetailedInfo);

        if (parsedDetailedInfo && parsedDetailedInfo.name) {
          const fetchedCoinId = await fetchCoinId(parsedDetailedInfo.name);
          if (fetchedCoinId) {
            setCoinId(fetchedCoinId);
            const chartData = await fetchCoinData(fetchedCoinId, '1D');
            setPriceHistory(chartData);
            setGraphLoading(false);
          }
        }
      } catch (error) {
        console.error('Error parsing detailedInfo or fetching data:', error);
        setTokenInfo(null);
      }
    };

    fetchData();
  }, [detailedInfo]);

  const getCustomHTML = (dexAddress) => `
    <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      body { 
        margin: 0; 
        padding: 0; 
        background-color: #000000; 
      }
      #dexscreener-embed {
        position: relative;
        width: 100%;
        padding-bottom: 125%;
      }
      @media(min-width: 1400px) {
        #dexscreener-embed {
          padding-bottom: 65%;
        }
      }
      #dexscreener-embed iframe {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        border: 0;
      }
    </style>
  </head>
  <body>
    <div id="dexscreener-embed">
      <iframe 
        width="100%" 
        height="600" 
        src="https://birdeye.so/tv-widget/${dexAddress}?chain=solana&viewMode=pair&chartInterval=1D&chartType=LINE&chartTimezone=Asia%2FCalcutta&theme=dark&cssCustomProperties=--tv-color-platform-background%3A%23000000&cssCustomProperties=--tv-color-pane-background%3A%23000000&chartOverrides=paneProperties.backgroundType%3Asolid&chartOverrides=paneProperties.background%3A%23000000&leftToolbar=hide&chartLeftToolbar=hide&chartTopToolbar=hide&widgetBar=hide&attribution=hide&scalesVisibility=hide&hideTopMenu=true" 
        frameborder="0" 
        allowfullscreen>
      </iframe>
    </div>
  </body>
</html>

  `;

  useEffect(() => {
    if (coinId) {
      const fetchData = async () => {
        const chartData = await fetchCoinData(coinId, timeRange);
        setPriceHistory(chartData);
      };
      fetchData();
    }
  }, [coinId, timeRange]);

  const filteredPriceHistory = useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case '1H':
        return priceHistory.filter((d) => now.getTime() - d.date.getTime() <= 60 * 60 * 1000);
      case '1D':
        return priceHistory.filter((d) => now.getTime() - d.date.getTime() <= 24 * 60 * 60 * 1000);
      case '7D':
        return priceHistory.filter(
          (d) => now.getTime() - d.date.getTime() <= 7 * 24 * 60 * 60 * 1000
        );
      case '1M':
        return priceHistory.filter(
          (d) => now.getTime() - d.date.getTime() <= 30 * 24 * 60 * 60 * 1000
        );
      case '6M':
        return priceHistory.filter(
          (d) => now.getTime() - d.date.getTime() <= 180 * 24 * 60 * 60 * 1000
        );
      case '1Y':
        return priceHistory.filter(
          (d) => now.getTime() - d.date.getTime() <= 365 * 24 * 60 * 60 * 1000
        );
      default:
        return priceHistory;
    }
  }, [timeRange, priceHistory]);

  const latestPoint = useMemo(
    () =>
      filteredPriceHistory.length > 0
        ? filteredPriceHistory[filteredPriceHistory.length - 1]
        : null,
    [filteredPriceHistory]
  );

  const percentageChange = useMemo(() => {
    if (filteredPriceHistory.length < 2) return 0;
    const firstPrice = filteredPriceHistory[0].value;
    const lastPrice = filteredPriceHistory[filteredPriceHistory.length - 1].value;
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  }, [filteredPriceHistory]);

  const formatPriceTitle = useCallback(
    (point: PriceHistoryPoint) => {
      return `₹ ${convertUSDtoINR(point.value.toFixed(10))}`;
    },
    [convertUSDtoINR]
  );

  const formatTimeTitle = useCallback(
    (point: PriceHistoryPoint) => {
      const date = new Date(point.date);

      // Adjust date format based on time range
      switch (timeRange) {
        case '1H':
          return date.toLocaleTimeString();
        case '1D':
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        case '7D':
        case '1M':
        case '6M':
        case '1Y':
          return date.toLocaleDateString();
        default:
          return date.toLocaleString();
      }
    },
    [timeRange]
  );

  const handlePointSelected = useCallback((point: PriceHistoryPoint) => {
    setSelectedPoint(point);
  }, []);

  const handleGestureEnd = useCallback(() => {
    setSelectedPoint(null);
  }, []);

  const displayPoint = selectedPoint || latestPoint;

  return (
    <YStack backgroundColor={'#000000'} fullscreen flex={1} justifyContent="space-between">
      <YStack>
        <YStack justifyContent="flex-start">
          <Card backgroundColor={'#000000'}>
            <Card.Header>
              {tokenInfo && (
                <YStack alignItems="flex-start">
                  <XStack gap="$2" marginBottom="$4">
                    <Avatar circular size={'$3'}>
                      <Avatar.Image accessibilityLabel="Coin" src={tokenInfo.imageUrl} />
                      <Avatar.Fallback backgroundColor="$blue10" />
                    </Avatar>
                    <XStack justifyContent="flex-end" alignItems="flex-end">
                      <Text
                        color={'white'}
                        fontWeight={'bold'}
                        fontSize={32}
                        fontFamily={'Poppins'}>
                        {tokenInfo.symbol}
                      </Text>
                      <XStack marginBottom="$2">
                        <CopyIcon />
                      </XStack>
                    </XStack>
                  </XStack>
                  <XStack marginBottom="$-4">
                    <Text
                      color={'white'}
                      opacity={0.5}
                      fontWeight={600}
                      alignSelf="center"
                      fontFamily={'Poppins'}>
                      {tokenInfo.name}
                    </Text>
                  </XStack>
                </YStack>
              )}
            </Card.Header>
          </Card>
          {displayPoint && (
            <YStack alignItems="flex-start" marginLeft="$4" marginBottom="$2">
              <Text color={'#fff'} fontSize={32} fontWeight={'bold'}>
                {formatPriceTitle(displayPoint)}
              </Text>
              {percentageChange >= 0 ? (
                <XStack gap={4}>
                  <FontAwesome name="caret-up" size={20} color="#4caf50" />
                  <Text color={'#4caf50'} fontFamily={'Poppins'}>
                    {percentageChange.toFixed(2)}%
                  </Text>
                </XStack>
              ) : (
                <XStack gap={4}>
                  <FontAwesome name="caret-down" size={20} color="#f44336" />
                  <Text color={'#f44336'} fontFamily={'Poppins'}>
                    {percentageChange.toFixed(2)}%
                  </Text>
                </XStack>
              )}
              <Text style={styles.infoText} color={'#fff'} fontFamily={'Poppins'}>
                {formatTimeTitle(displayPoint)}
              </Text>
            </YStack>
          )}
        </YStack>
        <View style={{ height: 400, width: '100%' }}>
          <WebView
            source={{ html: getCustomHTML(tokenInfo?.baseAddress || address) }}
            style={{ flex: 1, backgroundColor: '#000000' }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scrollEnabled={false}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
            onLoadEnd={() => {
              console.log('WebView loaded successfully');
            }}
          />
        </View>

        <XStack alignContent="center" justifyContent="center">
          <Text color={'white'} opacity={0.5} fontWeight={600} fontSize={14} fontFamily={'Poppins'}>
            The pool is dry... make it rain {tokenInfo?.name}!
          </Text>
        </XStack>
      </YStack>
      <XStack gap={30}>
        <MyButton
          title="BUY"
          color="#39ef0f"
          onPress={() => {
            if (tokenInfo) {
              const detailedInfoString = JSON.stringify(tokenInfo);
              console.log('detailedInfoString', detailedInfoString);
              router.push({
                pathname: `/crypto/buy/${tokenInfo.baseAddress}`,
                params: { detailedInfo: detailedInfoString },
              });
            } else {
              console.log(`No detailed info available for this token.`);
            }
          }}
        />
        <MyButton
          title="SELL"
          color="red"
          onPress={() => {
            if (tokenInfo) {
              const detailedInfoString = JSON.stringify(tokenInfo);
              console.log('detailedInfoString', detailedInfoString);
              router.push({
                pathname: `/crypto/sell/${tokenInfo.baseAddress}`,
                params: { detailedInfo: detailedInfoString },
              });
            } else {
              console.log(`No detailed info available for this token.`);
            }
          }}
        />
      </XStack>
    </YStack>
  );
};

const styles = StyleSheet.create({
  chart: {
    width: width,
    height: 200,
  },
  infoText: {
    color: '#fff',
    fontSize: 32,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  button: {
    padding: 10,
    backgroundColor: '#000000',
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: '#141414',
    textDecorationColor: '#000000',
    borderColor: '#808080',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default MyChart;

interface MyButtonProps {
  title: string;
  onPress?: () => void;
  color?: string;
}

export const MyButton: React.FC<MyButtonProps> = ({ title, onPress, color }) => {
  return (
    <Button
      onPress={onPress}
      marginBottom="$6"
      backgroundColor={color}
      justifyContent="center"
      alignSelf="center"
      borderRadius="$10"
      width={180}
      height={50}>
      <XStack alignContent="center" alignItems="center">
        <Text color="#0B0A0F" fontFamily="Poppins" fontWeight="900" fontSize={24}>
          {title}
        </Text>
      </XStack>
    </Button>
  );
};

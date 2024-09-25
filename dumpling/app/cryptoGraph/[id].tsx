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
import { Instagram } from 'react-content-loader';
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
}

type TimeRange = '30min' | '1hour' | '6hours' | '24hours';

const formatCoinName = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-');
};

const fetchCoinId = async (coinName: string): Promise<string | null> => {
  try {
    const formattedName = formatCoinName(coinName);
    const response = await fetch(`https://coinmarketcap.com/currencies/${formattedName}/`);
    const html = await response.text();
    const match = html.match(/\/static\/img\/coins\/\d+x\d+\/(\d+)\.png/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error fetching coin ID:', error);
    return null;
  }
};

const fetchCoinData = async (coinId: string, range: string): Promise<PriceHistoryPoint[]> => {
  try {
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

const MyChart: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [selectedPoint, setSelectedPoint] = useState<PriceHistoryPoint | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('24hours');
  const [coinId, setCoinId] = useState<string | null>(null);

  const { detailedInfo } = useGlobalSearchParams<{ detailedInfo: string }>();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [graphLoading, setGraphLoading] = useState(true);

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
            console.log(chartData);
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

  useEffect(() => {
    if (coinId) {
      const fetchData = async () => {
        let range: string;
        switch (timeRange) {
          case '30min':
            range = '1H';
            break;
          case '1hour':
            range = '1H';
            break;
          case '6hours':
            range = '1D';
            break;
          case '24hours':
            range = '1D';
            break;
          default:
            range = '1D';
        }
        const chartData = await fetchCoinData(coinId, range);
        setPriceHistory(chartData);
      };
      fetchData();
    }
  }, [coinId, timeRange]);

  const filteredPriceHistory = useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case '30min':
        return priceHistory.filter((d) => now.getTime() - d.date.getTime() <= 30 * 60 * 1000);
      case '1hour':
        return priceHistory.filter((d) => now.getTime() - d.date.getTime() <= 60 * 60 * 1000);
      case '6hours':
        return priceHistory.filter((d) => now.getTime() - d.date.getTime() <= 6 * 60 * 60 * 1000);
      case '24hours':
        return priceHistory;
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

  const formatPriceTitle = useCallback((point: PriceHistoryPoint) => {
    return `$${point.value.toFixed(10)}`;
  }, []);

  const formatTimeTitle = useCallback((point: PriceHistoryPoint) => {
    return `Time: ${point.date.toLocaleTimeString()}`;
  }, []);

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
                        fontFamily={'Goldman'}>
                        {tokenInfo.symbol}
                      </Text>
                      <XStack marginBottom="$2">
                        <CopyIcon />
                      </XStack>
                    </XStack>
                  </XStack>
                  <XStack marginBottom="$-4">
                    <Text color={'white'} opacity={0.5} fontWeight={600} alignSelf="center">
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
                  <Text color={'#4caf50'}>{percentageChange.toFixed(2)}%</Text>
                </XStack>
              ) : (
                <XStack gap={4}>
                  <FontAwesome name="caret-down" size={20} color="#f44336" />
                  <Text color={'#f44336'}>{percentageChange.toFixed(2)}%</Text>
                </XStack>
              )}
              <Text style={styles.infoText} color={'#fff'}>
                {formatTimeTitle(displayPoint)}
              </Text>
            </YStack>
          )}
        </YStack>
        {graphLoading ? (
          <MyLoader />
        ) : (
          <LineGraph
            points={filteredPriceHistory}
            animated={true}
            color={percentageChange >= 0 ? '#0FFF50' : '#f44336'}
            style={styles.chart}
            enablePanGesture={true}
            panGestureDelay={300}
            onPointSelected={handlePointSelected}
            onGestureEnd={handleGestureEnd}
          />
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, timeRange === '30min' && styles.activeButton]}
            onPress={() => setTimeRange('30min')}>
            <Text style={styles.buttonText} color={'#fff'}>
              30m
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, timeRange === '1hour' && styles.activeButton]}
            onPress={() => setTimeRange('1hour')}>
            <Text style={styles.buttonText} color={'#fff'}>
              1hr
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, timeRange === '6hours' && styles.activeButton]}
            onPress={() => setTimeRange('6hours')}>
            <Text style={styles.buttonText} color={'#fff'}>
              6hr
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, timeRange === '24hours' && styles.activeButton]}
            onPress={() => setTimeRange('24hours')}>
            <Text style={styles.buttonText} color={'#fff'}>
              1D
            </Text>
          </TouchableOpacity>
        </View>
        {tokenInfo && (
          <XStack
            gap={10}
            padding={20}
            alignItems="center"
            alignContent="center"
            justifyContent="center">
            <MyCard
              text="liquidity"
              value={formatValue(tokenInfo.liquidityUsd)}
              icon={<Entypo name="drop" size={20} color="white" />}
            />
            <MyCard
              text="6h Vol"
              value={formatValue(tokenInfo.volH6)}
              icon={<Entypo name="area-graph" size={20} color="white" />}
            />
            <MyCard
              text="24h Vol"
              value={formatValue(tokenInfo.volH24)}
              icon={<Entypo name="bar-graph" size={20} color="white" />}
            />
          </XStack>
        )}
        <XStack alignContent="center" justifyContent="center">
          <Text color={'white'} opacity={0.5} fontWeight={600} fontSize={14}>
            The pool is dry... make it rain ETH!
          </Text>
        </XStack>
      </YStack>
      <MyButton title="LOCK IN" />
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

export const MyButton = (title: { title: string }) => {
  return (
    <Button
      marginBottom="$6"
      backgroundColor={'#FEF503'}
      justifyContent="center"
      alignSelf="center"
      borderRadius={'$10'}
      width={180}
      height={50}>
      <XStack alignContent="center" alignItems="center">
        <Text color={'#0B0A0F'} fontFamily={'Goldman'} fontWeight={900} fontSize={24}>
          {title.title}
        </Text>
      </XStack>
    </Button>
  );
};

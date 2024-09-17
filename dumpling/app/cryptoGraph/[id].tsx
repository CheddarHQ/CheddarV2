import { useGlobalSearchParams, useLocalSearchParams } from 'expo-router';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineGraph } from 'react-native-graph';
import { Card, Text, XStack, YStack, Avatar, SizableText } from 'tamagui';
const { width } = Dimensions.get('window');
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import MyCard from '~/components/MyCard';
import { formatValue } from '~/components/FormatValue';

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
    const response = await fetch(`https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail/chart?id=${coinId}&range=${range}`);
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
    () => (filteredPriceHistory.length > 0 ? filteredPriceHistory[filteredPriceHistory.length - 1] : null),
    [filteredPriceHistory]
  );

  const percentageChange = useMemo(() => {
    if (filteredPriceHistory.length < 2) return 0;
    const firstPrice = filteredPriceHistory[0].value;
    const lastPrice = filteredPriceHistory[filteredPriceHistory.length - 1].value;
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  }, [filteredPriceHistory]);

  const formatPriceTitle = useCallback((point: PriceHistoryPoint) => {
    return `$${point.value.toFixed(2)}`;
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
    <YStack backgroundColor={'#000000'} fullscreen flex={1}>
      <XStack alignItems="center" alignContent="space-between" justifyContent="space-between">
        <Card backgroundColor={'#000000'}>
          <Card.Header>
            {tokenInfo && (
              <XStack alignItems="center">
                <Avatar circular size="$3">
                  <Avatar.Image accessibilityLabel="Coin" src={tokenInfo.imageUrl} />
                  <Avatar.Fallback backgroundColor="$blue10" />
                </Avatar>
                <YStack paddingLeft="$3">
                  <Text color={'white'} alignSelf="center">
                    {tokenInfo.name}
                  </Text>
                  <Text color={'gray'}>{tokenInfo.symbol}</Text>
                </YStack>
              </XStack>
            )}
          </Card.Header>
        </Card>
        {displayPoint && (
          <YStack alignItems="flex-end" paddingRight={7}>
            <Text style={styles.infoText} color={'#fff'}>
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
      </XStack>
      {filteredPriceHistory.length > 0 && (
        <LineGraph
          points={filteredPriceHistory}
          animated={true}
          color={percentageChange >= 0 ? "#0FFF50" : "#f44336"}
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
            30 Min
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, timeRange === '1hour' && styles.activeButton]}
          onPress={() => setTimeRange('1hour')}>
          <Text style={styles.buttonText} color={'#fff'}>
            1 Hour
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, timeRange === '6hours' && styles.activeButton]}
          onPress={() => setTimeRange('6hours')}>
          <Text style={styles.buttonText} color={'#fff'}>
            6 Hours
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, timeRange === '24hours' && styles.activeButton]}
          onPress={() => setTimeRange('24hours')}>
          <Text style={styles.buttonText} color={'#fff'}>
            24 Hours
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
    </YStack>
  );
};

const styles = StyleSheet.create({
  chart: {
    width: width,
    height: 300,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
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
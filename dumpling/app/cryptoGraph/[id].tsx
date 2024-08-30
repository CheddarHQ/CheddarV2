import { useGlobalSearchParams, useLocalSearchParams } from 'expo-router';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineGraph } from 'react-native-graph';
import { Card, Text, XStack, YStack, Avatar, SizableText } from 'tamagui';
const { width } = Dimensions.get('window');
import { dummyGraphData } from '../../test/message';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import { point } from '@shopify/react-native-skia';
import MyCard from '~/components/MyCard';
import { formatValue } from '~/components/FormatValue';
const randomPrice = (min: number, max: number): number => Math.random() * (max - min) + min;

interface DataPoint {
  time: number;
  open: number;
  close: number;
  high: number;
  low: number;
}

interface PriceHistoryPoint {
  date: Date;
  value: number;
}

interface TokenBasicInfo {
  name: string;
  baseAddress: string;
  priceUsd: string;
  priceNative: string;
  imageUrl: string;
  priceChange: number;
  symbol: string;
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

const generateDayData = (): DataPoint[] => {
  const data: DataPoint[] = dummyGraphData.Data.Data.map((point) => ({
    time: point.time * 1000, // Convert seconds to milliseconds
    open: point.open,
    close: point.close,
    high: point.high,
    low: point.low,
  }));

  console.log('Number of data points:', data.length);

  return data;
};

const realData: DataPoint[] = generateDayData();

type TimeRange = '30min' | '1hour' | '6hours' | '24hours';

const MyChart: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [selectedPoint, setSelectedPoint] = useState<PriceHistoryPoint | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('24hours');

  const { detailedInfo } = useGlobalSearchParams<{ detailedInfo: string }>();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);

  useEffect(() => {
    try {
      const parsedDetailedInfo = JSON.parse(detailedInfo || 'null');
      console.log('Parsed detailedInfo:', parsedDetailedInfo);
      setTokenInfo(parsedDetailedInfo);
    } catch (error) {
      console.error('Error parsing detailedInfo:', error);
      setTokenInfo(null);
    }
  }, [detailedInfo]);

  const filteredData = useMemo(() => {
    const now = realData[realData.length - 1].time;
    switch (timeRange) {
      case '30min':
        return realData.filter((d) => now - d.time <= 30 * 60 * 1000);
      case '1hour':
        return realData.filter((d) => now - d.time <= 60 * 60 * 1000);
      case '6hours':
        return realData.filter((d) => now - d.time <= 6 * 60 * 60 * 1000);
      case '24hours':
        return realData.filter((d) => now - d.time <= 24 * 60 * 60 * 1000);
      default:
        return realData;
    }
  }, [timeRange]);

  const priceHistory = useMemo(
    () =>
      filteredData.map((point) => ({
        date: new Date(point.time),
        value: point.close,
      })),
    [filteredData]
  );

  const latestPoint = useMemo(
    () => (priceHistory.length > 0 ? priceHistory[priceHistory.length - 1] : null),
    [priceHistory]
  );

  const percentageChange = useMemo(() => {
    if (priceHistory.length < 2) return 0;
    const firstPrice = priceHistory[0].value;
    const lastPrice = priceHistory[priceHistory.length - 1].value;
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  }, [priceHistory]);

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
                  <Avatar.Image accessibilityLabel="Cam" src={tokenInfo.imageUrl} />
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
      {percentageChange >= 0 ? (
        <LineGraph
          points={priceHistory}
          animated={true}
          color="#0FFF50"
          style={styles.chart}
          enablePanGesture={true}
          panGestureDelay={300}
          onPointSelected={handlePointSelected}
          onGestureEnd={handleGestureEnd}
        />
      ) : (
        <LineGraph
          points={priceHistory}
          animated={true}
          color="#f44336"
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
  infoContainer: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 10,
    alignItems: 'center',
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  positiveChange: {
    color: '#4caf50',
  },
  negativeChange: {
    color: '#f44336',
  },
  priceTitleContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  priceTitleText: {
    color: '#fff',
    fontSize: 16,
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
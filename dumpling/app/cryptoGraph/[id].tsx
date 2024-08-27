import { useLocalSearchParams } from 'expo-router';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineGraph } from 'react-native-graph';
import { Card, Text, XStack, YStack, Avatar } from 'tamagui';
const { width } = Dimensions.get('window');
import { dummyGraphData } from '~/test/message';

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
    return `Time: ${point.date.toLocaleTimeString()}, Price: $${point.value.toFixed(2)}`;
  }, []);

  const handlePointSelected = useCallback((point: PriceHistoryPoint) => {
    setSelectedPoint(point);
  }, []);

  const handleGestureEnd = useCallback(() => {
    setSelectedPoint(null);
  }, []);

  const displayPoint = selectedPoint || latestPoint;

  return (
    <YStack
      backgroundColor={'#000000'}
      fullscreen
      flex={1}
      alignItems="center"
      justifyContent="center">
      <XStack paddingBottom={'$10'}>
        <Card>
          <Card.Header>
            <XStack>
              <Avatar circular size="$3">
                <Avatar.Image
                  accessibilityLabel="Cam"
                  src="https://images.unsplash.com/photo-1548142813-c348350df52b?&w=150&h=150&dpr=2&q=80"
                />
                <Avatar.Fallback backgroundColor="$blue10" />
              </Avatar>
              <Text color={'white'} alignSelf="center" paddingLeft="$3">
                Crypto Coin {id}
              </Text>
            </XStack>
          </Card.Header>
        </Card>
      </XStack>
      <LineGraph
        points={priceHistory}
        animated={true}
        color="#4484B2"
        style={styles.chart}
        enablePanGesture={true}
        panGestureDelay={300}
        onPointSelected={handlePointSelected}
        onGestureEnd={handleGestureEnd}
      />
      {displayPoint && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{formatPriceTitle(displayPoint)}</Text>
          <Text
            style={[
              styles.infoText,
              percentageChange >= 0 ? styles.positiveChange : styles.negativeChange,
            ]}>
            Total Change: {percentageChange.toFixed(2)}%
          </Text>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, timeRange === '30min' && styles.activeButton]}
          onPress={() => setTimeRange('30min')}>
          <Text style={styles.buttonText}>30 Min</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, timeRange === '1hour' && styles.activeButton]}
          onPress={() => setTimeRange('1hour')}>
          <Text style={styles.buttonText}>1 Hour</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, timeRange === '6hours' && styles.activeButton]}
          onPress={() => setTimeRange('6hours')}>
          <Text style={styles.buttonText}>6 Hours</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, timeRange === '24hours' && styles.activeButton]}
          onPress={() => setTimeRange('24hours')}>
          <Text style={styles.buttonText}>24 Hours</Text>
        </TouchableOpacity>
      </View>
    </YStack>
  );
};

const styles = StyleSheet.create({
  chart: {
    width: width - 40,
    height: 300,
  },
  infoContainer: {
    marginTop: 20,
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
    backgroundColor: '#4484B2',
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: '#2C5D7C',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default MyChart;

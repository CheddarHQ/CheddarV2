import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LineGraph } from 'react-native-graph';
import { YStack } from 'tamagui';

const { width } = Dimensions.get('window');

const dummyData = [
  { time: new Date('2024-08-01T00:00:00Z').getTime(), open: 100, close: 105, high: 110, low: 95 },
  { time: new Date('2024-08-02T00:00:00Z').getTime(), open: 105, close: 107, high: 112, low: 102 },
  { time: new Date('2024-08-03T00:00:00Z').getTime(), open: 107, close: 103, high: 109, low: 101 },
  { time: new Date('2024-08-04T00:00:00Z').getTime(), open: 103, close: 106, high: 108, low: 100 },
  { time: new Date('2024-08-05T00:00:00Z').getTime(), open: 106, close: 108, high: 115, low: 104 },
];

const priceHistory = dummyData.map((point) => ({
  date: new Date(point.time), // Convert timestamp to Date object
  value: point.close, // Close price for y-axis
}));

const MyChart = () => {
  const [priceTitle, setPriceTitle] = useState<string | null>(null);

  const updatePriceTitle = (point: { date: Date; value: number }) => {
    setPriceTitle(`Date: ${point.date.toDateString()}, Price: $${point.value}`);
  };

  const resetPriceTitle = () => {
    setPriceTitle(null);
  };

  return (
    <YStack
      backgroundColor={'#000000'}
      fullscreen
      flex={1}
      alignItems="center"
      justifyContent="center">
      <LineGraph
        points={priceHistory}
        animated={true}
        color="#4484B2"
        style={styles.chart}
        enablePanGesture={true}
        panGestureDelay={300} // Delay before the pan gesture activates; set to 0 for immediate activation
        onPointSelected={(p) => updatePriceTitle(p)}
        onGestureEnd={() => resetPriceTitle()}
      />
      {priceTitle && (
        <View style={styles.priceTitleContainer}>
          <Text style={styles.priceTitleText}>{priceTitle}</Text>
        </View>
      )}
    </YStack>
  );
};

const styles = StyleSheet.create({
  chart: {
    borderColor: '#808080',
    borderWidth: 2,
    width: width - 40, // Adjust as needed
    height: 300, // Adjust as needed
    borderRadius: 10,
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
});

export default MyChart;

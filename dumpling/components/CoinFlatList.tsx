import React from 'react';
import { FlatList, View, Image, Text, StyleSheet } from 'react-native';
import { VictoryChart, VictoryArea, VictoryAxis, VictoryContainer } from 'victory';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import transformChartData from './ChartDataTransformer';

const colors = {
  red: 'rgb(255, 99, 105)',
  green: 'rgb(76, 195, 138)',
  lightGray: 'rgba(255,255,255,0.3)',
};

const SparkLine = ({ chartData, priceChange }) => {
  const color = priceChange < 0 ? colors.red : colors.green;

  // Transform the chart data
  const transformedData = transformChartData(chartData);
  const prices = transformedData.sparkline_in_7d.price;

  // Create data points for VictoryArea
  const dataPoints = prices.map((price, index) => ({ x: index, y: price }));

  return (
    <VictoryChart
      domainPadding={{ y: [10, 10], x: [0, 0] }}
      width={90}
      height={55}
      padding={{ top: 10, bottom: 10, left: 0, right: 0 }}
      containerComponent={<VictoryContainer responsive />}>
      <Defs>
        <LinearGradient id="charGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} />
          <Stop offset="50%" stopColor={color} stopOpacity={0.4} />
          <Stop offset="90%" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <VictoryAxis
        style={{
          axis: { stroke: 'transparent' },
          ticks: { stroke: 'transparent' },
          tickLabels: { fill: 'transparent' },
        }}
      />
      <VictoryArea
        style={{
          data: {
            fill: 'url(#charGradient)',
            fillOpacity: 0.5,
            strokeWidth: 2,
            stroke: color,
          },
        }}
        data={dataPoints}
      />
    </VictoryChart>
  );
};

const CoinListItem = ({ coin, chartData }) => {
  return (
    <View style={styles.coinItem}>
      <View style={styles.coinInfo}>
        <Image source={{ uri: coin.imageUrl }} style={styles.coinImage} />
        <View style={styles.coinDetails}>
          <Text style={styles.coinSymbol}>{coin.symbol.toUpperCase()}</Text>
          <Text style={styles.coinName}>{coin.name}</Text>
        </View>
      </View>
      <View style={styles.priceInfo}>
        <SparkLine chartData={chartData} priceChange={coin.priceChangeh24} />
        <View style={styles.priceDetails}>
          <Text style={styles.currentPrice}>{coin.priceUsd.toFixed(2)}</Text>
          <Text
            style={[
              styles.priceChange,
              { color: coin.priceChangeh24 < 0 ? colors.red : colors.green },
            ]}>
            {coin.priceChangeh24.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const CoinFlatList = ({ coins, chartData }) => {
  return (
    <FlatList
      data={coins}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <CoinListItem coin={item} chartData={chartData[item.id] || []} />}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  coinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coinImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  coinDetails: {
    justifyContent: 'center',
  },
  coinSymbol: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  coinName: {
    color: colors.lightGray,
    fontSize: 14,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  priceDetails: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    color: 'white',
    fontSize: 16,
  },
  priceChange: {
    fontSize: 14,
  },
});

export default CoinFlatList;

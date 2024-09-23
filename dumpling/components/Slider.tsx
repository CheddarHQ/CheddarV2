import { Animated, FlatList, StyleSheet, Text, View } from 'react-native';
import React, { useRef, useState } from 'react';
import Slides from '../data';
import SlideItem from './SlideItem';
import Pagination from './Pagination';
import { YStack } from 'tamagui';

const Slider = () => {
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleOnScroll = (event: any) => {
    Animated.event(
      [
        {
          nativeEvent: {
            contentOffset: {
              x: scrollX,
            },
          },
        },
      ],
      {
        useNativeDriver: false,
      }
    )(event);
  };

  const handleOnViewableItemsChanged = useRef(({ viewableItems }) => {
    // console.log('viewableItems', viewableItems);
    setIndex(viewableItems[0].index);
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <YStack flex={1} justifyContent="center" alignContent="center" alignItems="center">
      <FlatList
        data={Slides}
        renderItem={({ item }) => <SlideItem item={item} />}
        horizontal
        pagingEnabled
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        onScroll={handleOnScroll}
        onViewableItemsChanged={handleOnViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      <View style={styles.paginationContainer}>
        <Pagination data={Slides} scrollX={scrollX} index={index} />
      </View>
    </YStack>
  );
};

export default Slider;

const styles = StyleSheet.create({
  paginationContainer: {
    position: 'absolute',
    bottom: 35, // Adjust this value as needed
    alignSelf: 'center',
  },
});

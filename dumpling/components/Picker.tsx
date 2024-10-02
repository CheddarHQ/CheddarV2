import { useEffect, useRef, useState, useMemo, memo } from 'react';
import {
  LayoutRectangle,
  useWindowDimensions,
  Text,
  StyleSheet,
  FlatList,
  FlatListProps,
} from 'react-native';
import Animated, {
  runOnJS,
  useDerivedValue,
  withTiming,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedFlatList = Animated.createAnimatedComponent<FlatListProps<PickerItem>>(FlatList);

type ScrollState = 'unknown' | 'idle' | 'scrolling';

type PointMeasurement = LayoutRectangle & { middleX: number };
type PickerItemProps = {
  item: PickerItem;
  index: number;
  scrollX: SharedValue<number>;
  activeIndex: SharedValue<number>;
  scrollState: SharedValue<ScrollState>;
  listOffset: number;
  measurements?: PointMeasurement;
};

function PickerItem({
  item,
  index,
  scrollX,
  measurements,
  activeIndex,
  scrollState,
}: PickerItemProps) {
  const stylez = useAnimatedStyle(() => {
    if (scrollState.value !== 'scrolling' || !measurements) {
      return {
        opacity: withTiming(activeIndex.value === index ? 1 : 0.1),
      };
    }

    if (!measurements) {
      return { opacity: 0 };
    }
    return {
      opacity: interpolate(
        scrollX.value,
        [
          measurements.middleX - measurements.width / 2 - _snapThreshold,
          measurements.middleX,
          measurements.middleX + measurements.width / 2 + _snapThreshold,
        ],
        [0.2, 1, 0.2],
        Extrapolation.CLAMP
      ),
    };
  });
  return (
    <Animated.View style={stylez}>
      <Text style={styles.pickerItemText}>{item.name}</Text>
    </Animated.View>
  );
}

type PickerItem = {
  id: number;
  name: string;
  value?: string;
};

type PickerProps = {
  data: PickerItem[];
  onChange: (item: PickerItem) => void;
  initialSelectedItem?: PickerItem;
};
const _snapThreshold = 42;
export const Picker = memo(({ data, onChange, initialSelectedItem }: PickerProps) => {
  const { width } = useWindowDimensions();
  const [done, setDone] = useState(false);
  const positions = useRef(new Map<number, PointMeasurement>());
  const [listOffset, setListOffset] = useState(width / 2);

  const scrollOffsets = useMemo(() => {
    if (!done) return;
    // We are sorting and mapping the values to get the middleX of each item
    // this is needed for the FlatList snap offsets.
    return [...positions.current.values()]
      .sort((a, b) => (a.middleX > b.middleX ? 1 : -1))
      .map((position) => position.middleX);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const flatlistRef = useRef<FlatList>(null);

  const findSelectedItemIndex = data.findIndex((item) => item.id === initialSelectedItem?.id);

  // Animations
  const scrollX = useSharedValue(0);
  const scrollState = useSharedValue<ScrollState>('unknown');
  const activeIndex = useSharedValue(findSelectedItemIndex ?? 0);

  const runSelection = async (value: number) => {
    onChange(data[value]);
    await Haptics.selectionAsync();
  };

  useDerivedValue(() => {
    const activeItemIndex = scrollOffsets?.findIndex((offset) => {
      return scrollX.value < offset + _snapThreshold && scrollX.value > offset - _snapThreshold;
    });
    if (activeIndex.value !== activeItemIndex && activeItemIndex !== -1) {
      activeIndex.value = activeItemIndex ?? 0;
      runOnJS(runSelection)(activeIndex.value);
    }
  });
  useEffect(() => {
    if (!done && scrollOffsets) return;

    flatlistRef.current?.scrollToOffset({
      offset: scrollOffsets?.[findSelectedItemIndex] ?? 0,
      animated: false,
    });
    const timer = setTimeout(() => {
      scrollState.value = 'idle';
      // Initial timer to show the items, before they "dissappear". This is
      // useful for the user to see the items before they are hidden, such
      // that they know they can scroll/swipe left or right
    }, 100);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, findSelectedItemIndex]);
  const onScroll = useAnimatedScrollHandler({
    onMomentumEnd: (e) => {
      scrollState.value = 'idle';
    },
    onScroll: (e) => {
      scrollState.value = 'scrolling';
      scrollX.value = e.contentOffset.x;
    },
  });

  return (
    <AnimatedFlatList
      ref={flatlistRef}
      onScroll={onScroll}
      horizontal
      data={data}
      snapToOffsets={scrollOffsets}
      style={{
        flexGrow: 0,
      }}
      onLayout={(e) => {
        setListOffset(e.nativeEvent.layout.width / 2);
      }}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        columnGap: _snapThreshold,
        paddingHorizontal: listOffset,
        paddingVertical: 20,
      }}
      CellRendererComponent={({ children, index, ...props }) => {
        return (
          <Animated.View
            {...props}
            onLayout={(e) => {
              positions.current.set(index, {
                x: Math.floor(e.nativeEvent.layout.x),
                middleX:
                  Math.floor(e.nativeEvent.layout.x) - listOffset + e.nativeEvent.layout.width / 2,
                y: Math.floor(e.nativeEvent.layout.y),
                width: Math.floor(e.nativeEvent.layout.width),
                height: Math.floor(e.nativeEvent.layout.height),
              });
              if (positions.current.size === data.length && !done) {
                setDone(true);
                return;
              }
            }}>
            {children}
          </Animated.View>
        );
      }}
      decelerationRate={'fast'}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item, index }) => {
        return (
          <PickerItem
            item={item}
            index={index}
            scrollX={scrollX}
            measurements={positions.current.get(index)}
            listOffset={listOffset}
            activeIndex={activeIndex}
            scrollState={scrollState}
          />
        );
      }}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
    color: '#fff',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  pickerItemText: {
    fontWeight: '900',
    fontSize: 24,
    textTransform: 'uppercase',
    color: '#fff',
  },
});

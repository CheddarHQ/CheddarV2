/* eslint-disable react-native/no-inline-styles */
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import React from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs/lib/typescript/src/types';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import BottomTabIcon from './BottomTabIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XStack } from 'tamagui';
import { BlurView } from 'expo-blur';

const CustomBottomTab = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const MARGIN = 20;
  const TAB_BAR_WIDTH = width - 2 * MARGIN;
  const TAB_WIDTH = TAB_BAR_WIDTH / state.routes.length;

  const translateAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withSpring(TAB_WIDTH * state.index) }],
    };
  });

  return (
    <BlurView
      intensity={50}
      style={[styles.tabBarContainer, { width: TAB_BAR_WIDTH, bottom: insets.bottom }]}>
      <Animated.View style={[styles.slidingTabContainer, { width: TAB_WIDTH }, translateAnimation]}>
        <View style={styles.slidingTab} />
      </Animated.View>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, { merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
            }}>
            <XStack justifyContent="center" alignContent="center" alignItems="center" gap="2">
              <BottomTabIcon route={route.name} isFocused={isFocused} />
              {isFocused && (
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: 'black',
                    fontSize: 14,
                    fontFamily: 'Goldman',
                  }}>
                  {route.name}
                </Text>
              )}
            </XStack>
          </Pressable>
        );
      })}
    </BlurView>
  );
};

export default CustomBottomTab;

const styles = StyleSheet.create({
  tabBarContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderRadius: 50,
    alignItems: 'center',
    overflow: 'hidden',
  },
  slidingTabContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  slidingTab: {
    width: 100,
    height: 44,
    borderRadius: 100,
    backgroundColor: '#FEF503',
    marginHorizontal: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 8,
    overflow: 'hidden',
  },
});

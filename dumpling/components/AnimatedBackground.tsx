import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
//@ts-ignore
import { YStack } from 'tamagui';

const { width, height } = Dimensions.get('window');

const AnimatedCircle = Animated.createAnimatedComponent(YStack);

interface BallProps {
  size: number;
  position: { x: number; y: number };
}

const Ball: React.FC<BallProps> = ({ size, position }) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20 + Math.random() * 20],
  });

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20 + Math.random() * 20],
  });

  return (
    <AnimatedCircle
      width={size}
      height={size}
      borderRadius={size / 2}
      backgroundColor="$yellow8"
      opacity={0.6}
      position="absolute"
      left={position.x}
      top={position.y}
      style={{
        transform: [{ translateX }, { translateY }],
      }}
    />
  );
};

export const AnimatedBackground: React.FC = () => {
  const balls = Array.from({ length: 50 }, () => ({
    size: 5 + Math.random() * 5, // Random size between 5 and 10
    position: {
      x: Math.random() * width,
      y: Math.random() * height,
    },
  }));

  return (
    <YStack position="absolute" width={width} height={height}>
      {balls.map((ball, index) => (
        <Ball key={index} {...ball} />
      ))}
    </YStack>
  );
};

import React, { useState } from 'react';
import { TextInput } from 'react-native';
import { YStack, XStack, Button, Input, Text } from 'tamagui';
import { Link } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  Layout,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';

const MoneyEx = ({ value }: { value: string }) => {
  const [input, setInput] = useState('');

  const handlePress = (num: string) => {
    setInput((prev) => prev + num);
  };

  const handleBackspace = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setInput('');
  };

  // Logic to render different content based on value
  let content;

  switch (value) {
    case 'option1':
      content = <Text>Content for Option 1</Text>;
      break;
    case 'option2':
      content = <Text>Content for Option 2</Text>;
      break;
    default:
      content = <Text>Default Content</Text>;
  }

  // Shared value for Reanimated
  const animationValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(animationValue.value) }],
  }));

  return (
    <YStack f={1} jc="center" ai="center" bg="$background" p="$4">
      {content}
      <Animated.View style={animatedStyle}>
        <XStack ai="center" space="$4" mb="$5">
          <Link href="/settings">
            <Ionicons name="settings-outline" size={24} color="white" />
          </Link>
          <Input
            value={input}
            editable={false} // Make it read-only if only using the keyboard
            placeholder="Enter number"
            keyboardType="numeric"
            size="$7"
            backgroundColor="$backgroundDark"
            color="white"
            fontSize={50}
            fontWeight="bold"
            width="70%"
          />
        </XStack>
      </Animated.View>

      {/* Number Keyboard */}
      <YStack width="80%" space="$2">
        {[
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ].map((row, rowIndex) => (
          <XStack key={rowIndex} space="$2">
            {row.map((num) => (
              <Button
                key={num}
                onPress={() => handlePress(num.toString())}
                width={70}
                height={70}
                br="$2"
                bg="$backgroundDark"
                color="white"
                fontSize={24}
                f={1}>
                {num}
              </Button>
            ))}
          </XStack>
        ))}
        <XStack space="$2">
          <Button
            onPress={handleClear}
            width={70}
            height={70}
            br="$2"
            bg="$backgroundDark"
            color="white"
            fontSize={24}
            f={1}>
            C
          </Button>
          <Button
            onPress={() => handlePress('0')}
            width={70}
            height={70}
            br="$2"
            bg="$backgroundDark"
            color="white"
            fontSize={24}
            f={1}>
            0
          </Button>
          <Button
            onPress={handleBackspace}
            width={70}
            height={70}
            br="$2"
            bg="$backgroundDark"
            color="white"
            fontSize={24}
            f={1}>
            ←
          </Button>
        </XStack>
      </YStack>
    </YStack>
  );
};

export default MoneyEx;

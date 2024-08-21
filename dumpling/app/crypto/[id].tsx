import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { Text, SizableText, Tabs, View, YStack, XStack, Button } from 'tamagui';
import Animated from 'react-native-reanimated'; // Import Animated from Reanimated
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const MoneyEx = ({ value }: { value: string }) => {
  const { id } = useLocalSearchParams();
  const [input, setInput] = useState('');

  // Shared value for Reanimated
  const inputLength = useSharedValue(input.length);

  const handlePress = (num: string) => {
    setInput((prev) => {
      const newValue = prev + num;
      inputLength.value = newValue.length;
      return newValue;
    });
  };

  const handleBackspace = () => {
    setInput((prev) => {
      const newValue = prev.slice(0, -1);
      inputLength.value = newValue.length;
      return newValue;
    });
  };

  const handleClear = () => {
    setInput('');
    inputLength.value = 0;
  };

  // Determine font size dynamically with Reanimated
  const animatedStyle = useAnimatedStyle(() => {
    const fontSize = inputLength.value > 10 ? withTiming(40) : withTiming(60);
    return { fontSize, color: '#FFFFFF', fontWeight: 'bold', marginBottom: 30 };
  });

  // Logic to render different content based on value
  let content;
  if (!id) {
    content = <Text color="#FFFFFF">No ID found</Text>;
  } else {
    switch (value) {
      case 'option1':
        content = <Text color="#FFFFFF">Content for Option 1</Text>;
        break;
      case 'option2':
        content = <Text color="#FFFFFF">Content for Option 2</Text>;
        break;
      default:
        content = <Text color="#FFFFFF">This page id is {id}</Text>;
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="#000000"
        paddingHorizontal={20}
        paddingVertical={20}>
        <Link href="/settings" asChild>
          <Button icon={<Ionicons name="settings-outline" size={24} color="white" />} />
        </Link>

        {/* Dynamic Text */}
        <Animated.Text style={animatedStyle}>{input || '0'}</Animated.Text>

        {/* Number Keyboard */}
        <YStack width="100%">
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['C', '0', '←'],
          ].map((row, i) => (
            <XStack key={i} space justifyContent="space-between" marginBottom={10}>
              {row.map((num) => (
                <Button
                  key={num}
                  size="$5"
                  backgroundColor="#555555"
                  borderRadius={10}
                  onPress={() => {
                    if (num === 'C') handleClear();
                    else if (num === '←') handleBackspace();
                    else handlePress(num);
                  }}>
                  <Text color="#FFFFFF" fontSize={24}>
                    {num}
                  </Text>
                </Button>
              ))}
            </XStack>
          ))}
        </YStack>

        {/* Tabs Section */}
        <Tabs
          defaultValue="tab1"
          width="100%"
          backgroundColor="#222222"
          borderRadius={10}
          paddingVertical={10}
          marginTop={20}>
          <Tabs.List space justifyContent="center" paddingVertical={10}>
            <Tabs.Tab value="tab1">
              <SizableText color="#FFFFFF">BUY</SizableText>
            </Tabs.Tab>
            <Tabs.Tab value="tab2">
              <SizableText color="#FFFFFF">SELL</SizableText>
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Content value="tab1">
            <Text color="#FFFFFF" fontSize={18} fontWeight="bold" padding={10}>
              {content}
            </Text>
          </Tabs.Content>
          <Tabs.Content value="tab2">
            <Text color="#FFFFFF" fontSize={18} fontWeight="bold" padding={10}>
              This is tab 2 content
            </Text>
          </Tabs.Content>
        </Tabs>
      </YStack>
    </ScrollView>
  );
};

export default MoneyEx;

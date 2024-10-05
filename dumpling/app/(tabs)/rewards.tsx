import { View } from 'react-native';
import React from 'react';
import { XStack, YStack, Text } from 'tamagui';

const rewards = () => {
  return (
    <YStack flex={1} justifyContent="center" alignContent="center" backgroundColor={'black'}>
      <XStack alignSelf="center">
        <Text color={'white'}>this page is coming soon</Text>
      </XStack>
    </YStack>
  );
};

export default rewards;

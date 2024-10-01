import { View } from 'react-native';
import React from 'react';
import { XStack, YStack, Text } from 'tamagui';

const Blinks = () => {
  return (
    <YStack justifyContent="center" flex={1} alignItems="center" backgroundColor={'black'}>
      <XStack>
        <Text alignSelf="center" color={'white'}>
          Blinks
        </Text>
      </XStack>
    </YStack>
  );
};

export default Blinks;

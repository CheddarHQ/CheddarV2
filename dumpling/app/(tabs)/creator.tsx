import { View } from 'react-native';
import React from 'react';
import CreateCoinForm from '~/components/CreateSPL';
import { XStack, YStack, Text } from 'tamagui';

const creator = () => {
  return (
    <YStack flex={1} height={'screen'} backgroundColor="#0a0b0f" paddingTop={50}>
      <XStack justifyContent="center">
        <Text textAlign="center" fontWeight={'bold'} fontSize={30} color={'white'}>
          Launch Pad
        </Text>
      </XStack>
      <CreateCoinForm />
    </YStack>
  );
};

export default creator;

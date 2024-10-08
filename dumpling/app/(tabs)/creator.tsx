import { View, Text } from 'react-native';
import React from 'react';
import CreateCoinForm from '~/components/CreateSPL';
import { YStack } from 'tamagui';

const creator = () => {
  return (
    <YStack paddingTop={50} flex={1} height={'screen'}>
      <CreateCoinForm />
    </YStack>
  );
};

export default creator;

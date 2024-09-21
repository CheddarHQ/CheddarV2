import { View, Text } from 'react-native';
import React from 'react';
import { YStack } from 'tamagui';
import ChatCard from '../../components/ChatCard';

const homePage = () => {
  return (
    <YStack backgroundColor={'#000000'} minHeight={'screen'} flex={1}>
      <ChatCard route="thing" />
    </YStack>
  );
};

export default homePage;

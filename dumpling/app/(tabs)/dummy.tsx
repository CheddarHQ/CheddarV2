import { View } from 'react-native';
import React from 'react';
import { XStack, YStack, Text } from 'tamagui';

const dummy = () => {
  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignContent="center"
      alignItems="center"
      backgroundColor={'black'}>
      <XStack>
        <Text fontFamily={'Goldman'} color={'white'}>
          Dummy page
        </Text>
      </XStack>
    </YStack>
  );
};

export default dummy;

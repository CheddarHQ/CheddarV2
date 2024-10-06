import { View } from 'react-native';
import React from 'react';
import { XStack, YStack, Text, Button } from 'tamagui';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const rewards = () => {
  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignContent="center"
      backgroundColor={'black'}
      paddingHorizontal={20}>
      <XStack alignSelf="center" marginBottom={20}>
        <FontAwesome name="money" size={35} color="white" />
      </XStack>
      <XStack alignSelf="center" marginBottom={20}>
        <Text color={'white'} fontSize={30} textAlign="center">
          Make money when your freinds trade
        </Text>
      </XStack>
      <XStack gap={20} alignContent="center" justifyContent="center" marginBottom={20}>
        <YStack justifyContent="center" alignItems="center" alignContent="center" gap={8}>
          <Text color="#808080">Lifetime Rewards</Text>
          <Text fontSize={20} color={'white'}>
            $18.08
          </Text>
        </YStack>
        <YStack justifyContent="center" alignItems="center" alignContent="center" gap={8}>
          <Text color="#808080">Friends Reffered</Text>
          <Text fontSize={20} color={'white'}>
            16
          </Text>
        </YStack>
      </XStack>
      <Button marginBottom={20}>Invite a friend</Button>

      <Text color="#808080" textAlign="center">
        {' '}
        earn 50% of all trading fees from each friend you refer.
      </Text>
    </YStack>
  );
};

export default rewards;

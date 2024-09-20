import { Link } from 'expo-router';
import React from 'react';
import { XStack, YStack, Text } from 'tamagui';

const ChatCard = (route: any) => {
  return (
    <YStack
      marginTop="$10"
      marginHorizontal="$5"
      borderRadius={20}
      height={200}
      backgroundColor={'#808080'}
      alignItems="center"
      justifyContent="center"
      padding="$10">
      <Link href={'/thing'}>
        <XStack>
          <Text color={'#ffffff'} fontWeight={'bold'} fontSize={'$12'}>
            Chat
          </Text>
        </XStack>
      </Link>
    </YStack>
  );
};

export default ChatCard;

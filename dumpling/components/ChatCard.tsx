import { Link } from 'expo-router';
import React from 'react';
import { XStack, YStack, Text } from 'tamagui';

interface ChatCardProps {
  route: string; // Ensure the route prop is a string
}

const ChatCard: React.FC<ChatCardProps> = ({ route }) => {
  return (
    <YStack
      marginTop="$10"
      marginHorizontal="$5"
      borderRadius={20}
      height={200}
      backgroundColor="#808080"
      alignItems="center"
      justifyContent="center"
      padding="$10">
      {/* @ts-ignore */}
      <Link href={`/${route}`}>
        <XStack>
          <Text color="#ffffff" fontWeight="bold" fontSize="$12">
            Chat
          </Text>
        </XStack>
      </Link>
    </YStack>
  );
};

export default ChatCard;

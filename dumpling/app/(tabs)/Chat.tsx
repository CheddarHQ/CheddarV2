import { View, Text } from 'react-native';
import React from 'react';
import { YStack } from 'tamagui';
import ChatCard from '../../components/ChatCard';
import SimplifiedChatList from '~/components/ChatList';
import { useNavigation } from 'expo-router';

const homePage = () => {
  const navigation = useNavigation();
  function onPressHandler() {
    navigation.navigate('thing');
  }
  return (
    <YStack backgroundColor={'#0a0a0f'} minHeight={'screen'} flex={1}>
      <SimplifiedChatList onPressHandler={onPressHandler} />
    </YStack>
  );
};

export default homePage;

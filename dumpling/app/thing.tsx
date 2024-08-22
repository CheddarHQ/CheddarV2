import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  TamaguiProvider,
  YStack,
  XStack,
  Text,
  Input,
  Button,
  Sheet,
  ScrollView,
  Theme,
  AnimatePresence,
} from 'tamagui';
import { Link } from 'expo-router';
import { AnimatedBackground } from 'components/AnimatedBackground';
// import config from "./tamagui.config";

// Mock data for chat messages
const initialMessages = [
  { id: '1', text: 'Hello!', sender: 'User1' },
  { id: '2', text: 'Hi there!', sender: 'User2' },
  { id: '3', text: 'How are you?', sender: 'User1' },
];

export default function chatroom() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [open, setOpen] = useState(false);

  const sendMessage = () => {
    if (inputText.trim()) {
      setMessages([...messages, { id: Date.now().toString(), text: inputText, sender: 'Me' }]);
      setInputText('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <YStack f={1} backgroundColor="#000000">
        {/* Header */}
        <XStack
          backgroundColor="#000000"
          paddingTop="$8"
          paddingHorizontal="$4"
          alignItems="center"
          justifyContent="space-between"
          paddingBottom="$3">
          {/* @ts-ignore */}
          <Link href={'/analytics'}>
            <MaterialIcons name="query-stats" size={24} color="white" padding={5} />
          </Link>
          {/* @ts-ignore */}
          <Text color="yellow" fontSize="$10" fontWeight="bold" fontFamily="Jersey10">
            Cheddar
          </Text>
          <Link href={'/modal'} asChild>
            <AntDesign name="pluscircle" size={24} color="white" />
          </Link>
        </XStack>

        {/* Chat Messages */}
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <YStack
              padding="$2"
              margin="$2"
              backgroundColor={item.sender === 'Me' ? '$yellow5' : '$gray5'}
              borderRadius="$4"
              alignSelf={item.sender === 'Me' ? 'flex-end' : 'flex-start'}>
              <Text color="#ffffff">{item.text}</Text>
              <Text fontSize="$1" color="$gray11">
                {item.sender}
              </Text>
            </YStack>
          )}
          keyExtractor={(item) => item.id}
        />

        {/* Footer - Message Input */}
        <XStack padding="$5">
          <Input
            flex={1}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            borderRadius="$10"
            height="$5"
            paddingHorizontal="$3"
            paddingRight={inputText ? '$8' : '$3'}
          />
          <AnimatePresence>
            {inputText && (
              <Button
                position="absolute"
                right="$2"
                bottom="$2"
                size="$3"
                circular
                onPress={sendMessage}
                animation="quick"
                enterStyle={{ opacity: 0, scale: 0.8 }}
                exitStyle={{ opacity: 0, scale: 0.8 }}>
                <Feather name="send" size={24} color="white" />
              </Button>
            )}
          </AnimatePresence>
        </XStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}

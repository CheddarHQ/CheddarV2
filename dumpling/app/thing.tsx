import React, { useState, useRef, useEffect } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

const { width } = Dimensions.get('window');
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

import { YStack, XStack, Text, Input, Button, AnimatePresence } from 'tamagui';
import { Link } from 'expo-router';

const initialMessages = [
  { id: '1', text: 'Hello!', sender: 'User1' },
  { id: '2', text: 'Hi there!', sender: 'User2' },
  { id: '3', text: 'How are you?', sender: 'User1' },
];

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function Chatroom() {
  const [messages, setMessages] = useState(
    initialMessages.map((msg) => ({
      key: generateUUID(),
      text: msg.text,
      mine: msg.sender === 'Me',
      user: msg.sender,
    }))
  );
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const ws = new WebSocket(
    'ws://baklava.cheddar-io.workers.dev/api/room/002e03cc4a62464c7aa46cadaa82676bce8d3f9559ebd73c401e958e43301da4/websocket'
  );
  useEffect(() => {

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(
        JSON.stringify({
          type: 'start_chat',
          user: 'new_user',
        })
      );
    };

    ws.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      console.log('Received message:', messageData);
    

      // Ignore heartbeat messages
      if (messageData.type === 'heartbeat') {
        return;
      }

      if (messageData.type === 'message') {
        // setMessages((prevMessages) => [
        //   ...prevMessages,
        //   {
        //     key: generateUUID(),
        //     text: messageData,
        //     mine: false, // Set to true if the message is from the current user
        //     user: messageData.user || 'Server', // Default to 'Server' if no user is provided
        //   },
        // ]);

        sendMessage(ws, messageData.user || "Server")
      }
    };

    ws.onerror = (error) => {
      console.log('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, []);

  function sendMessage(ws: WebSocket, sender: string) {
    console.log('Sending message');

    if(ws){
      ws.send(JSON.stringify({data: inputText}))
    }

    console.log("message sent")

    if (inputText.trim()) {
      setMessages([
        ...messages,
        { key: generateUUID(), text: inputText, mine: true, user: sender },
      ]);
   
  
      setInputText('');
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <YStack flex={1} backgroundColor="#000000">
        <XStack
          backgroundColor="#000000"
          paddingTop="$8"
          paddingHorizontal="$4"
          alignItems="center"
          justifyContent="space-between"
          paddingBottom="$3">
          <Link href={'/analytics'}>
            <MaterialIcons name="query-stats" size={24} color="white" padding={5} />
          </Link>
          <Text
            color="white"
            fontSize="$8"
            fontWeight="bold"
            //@ts-ignore
            fontFamily={'Press2P'}
            paddingTop={'$2'}
            paddingLeft={'$3'}
            alignSelf="center">
            CHEDDAR
          </Text>
          <Link href={'/modal'} asChild>
            <AntDesign name="pluscircle" size={24} color="white" />
          </Link>
        </XStack>

        <View style={{ flex: 1 }}>
          <Animated.ScrollView
            ref={scrollRef}
            scrollEventThrottle={16}
            onScroll={scrollHandler}
            style={{ flex: 1 }}>
            <MaskedView
              maskElement={
                <View style={{ backgroundColor: 'transparent' }}>
                  {messages.map((item) => (
                    <View
                      key={item.key}
                      style={[
                        styles.messageItem,
                        {
                          backgroundColor: item.mine ? 'white' : '#E4E7EB',
                          alignSelf: item.mine ? 'flex-end' : 'flex-start',
                        },
                      ]}>
                      <Text style={{ color: item.mine ? 'white' : '#111927' }}>{item.text}</Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: item.mine ? 'rgba(255,255,255,0.7)' : 'rgba(17,25,39,0.7)',
                          alignSelf: 'flex-end',
                          marginTop: 4,
                        }}>
                        {item.user}
                      </Text>
                    </View>
                  ))}
                </View>
              }>
              <View style={{ flex: 1 }}>
                <AnimatedLinearGradient
                  style={[
                    StyleSheet.absoluteFillObject,
                    {
                      transform: [{ translateY: scrollY }],
                    },
                  ]}
                  colors={['#FD84AA', '#A38CF9', '#09E0FF']}
                />
                <FlatList
                  scrollEnabled={false}
                  data={messages}
                  keyExtractor={(item) => item.key}
                  renderItem={({ item }) => (
                    <View
                      style={[
                        styles.messageItem,
                        {
                          backgroundColor: item.mine ? 'transparent' : '#141414',
                          alignSelf: item.mine ? 'flex-end' : 'flex-start',
                        },
                      ]}>
                      <Text color={'#fff'} style={{ color: 'white' }}>{item.text}</Text>
                      <Text
                        color={'#fff'}
                        style={{
                          fontSize: 12,
                          color: 'rgba(255,100,255,0.7)',
                          alignSelf: 'flex-end',
                          marginTop: 4,
                        }}>
                        {item.user}
                      </Text>
                    </View>
                  )}
                />
              </View>
            </MaskedView>
          </Animated.ScrollView>

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
                  onPress={() => sendMessage(ws, 'Me')}
                  animation="quick"
                  enterStyle={{ opacity: 0, scale: 0.8 }}
                  exitStyle={{ opacity: 0, scale: 0.8 }}>
                  <Feather name="send" size={24} color="white" />
                </Button>
              )}
            </AnimatePresence>
          </XStack>
        </View>
      </YStack>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  messageItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 12,
    marginBottom: 1,
    borderRadius: 12,
    maxWidth: width * 0.65,
    minWidth: 100,
    alignSelf: 'flex-start',
  },
});

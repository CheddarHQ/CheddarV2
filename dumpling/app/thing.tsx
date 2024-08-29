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
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';


const { width } = Dimensions.get('window');
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

import { YStack, XStack, Text, Input, Button, AnimatePresence } from 'tamagui';
import { Link } from 'expo-router';

interface Message {
  key: string;
  text: string;
  mine: boolean;
  user: string;
  sent: boolean;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function Chatroom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollY = useSharedValue(0);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    const newWs = new WebSocket(
      'ws://baklava.cheddar-io.workers.dev/api/room/002e03cc4a62464c7aa46cadaa82676bce8d3f9559ebd73c401e958e43301da4/websocket'
    );

    newWs.onopen = () => {
      console.log('WebSocket connected');
    };

    newWs.onmessage = (event) => {
      console.log('Raw message received:', event.data);
      try {
        const messageData = JSON.parse(event.data);
        console.log('Parsed message:', messageData);

        if (messageData.type === 'heartbeat') {
          console.log('Heartbeat received');
          return;
        }

        if(messageData.sender == 'Server'){
          return;
        }
        
        if (messageData.type === 'message' || messageData.data) {

          console.log("Message Data : ", messageData)
          const newMessage: Message = {
            key: generateUUID(),
            text: messageData.data || messageData.message || JSON.stringify(messageData),
            mine: messageData.sender === 'Me',
            user: messageData.sender || 'Server',
            sent: true,
          };
          console.log('Adding new message:', newMessage);
          console.log("sender :",newMessage.user)
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        } else {
          console.log('Unhandled message type:', messageData.type);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    newWs.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    newWs.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
    };

    setWs(newWs);

    return () => {
      newWs.close();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  function sendMessage() {
    if (inputText.trim() && ws) {
      const messageKey = generateUUID();
      const newMessage: Message = {
        key: messageKey,
        text: inputText,
        mine: true,
        user: 'Me',
        sent: false,
      };
  
      // Immediately add the message to the UI
      setMessages((prevMessages) => [...prevMessages, newMessage]);
  
      // Clear the input text
      setInputText('');
  
      // Prepare the message to send
      const messageToSend = {
        type: 'message',
        data: inputText,
        user: 'Me'   //use session details here
      };
  
      console.log('Sending message:', messageToSend);
  
      // Send the message
      ws.send(JSON.stringify(messageToSend));
  
      // Mark the message as sent after a short delay
      setTimeout(() => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.key === messageKey ? { ...msg, sent: true } : msg
          )
        );
      }, 500);
    }
  }
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <YStack flex={1} backgroundColor="#000000">
        {/* Header */}
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

        {/* Chat messages */}
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
                          opacity: item.sent ? 1 : 0.5,
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
                        {item.user} {!item.sent && '(Sending...)'}
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
                          opacity: item.sent ? 1 : 0.5,
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
                        {item.user} {!item.sent && '(Sending...)'}
                      </Text>
                    </View>
                  )}
                />
              </View>
            </MaskedView>
          </Animated.ScrollView>

          {/* Input area */}
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
              onSubmitEditing={sendMessage}
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
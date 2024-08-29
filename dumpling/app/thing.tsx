import React, { useState, useRef, useEffect } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
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
  const route = useRoute();
  const { username } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollY = useSharedValue(0);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [messageQueue, setMessageQueue] = useState([]);
  const [ackTimeouts, setAckTimeouts] = useState({});

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useEffect(() => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectInterval = 5000; // 5 seconds

    function connect() {
      console.log('Attempting to connect to WebSocket...');
      const newWs = new WebSocket(
        'wss://baklava.cheddar-io.workers.dev/api/room/hhh/websocket'
      );

      newWs.onopen = () => {
        console.log('WebSocket connected at:', new Date().toISOString());
        setIsConnected(true);
        reconnectAttempts = 0;
        newWs.send(JSON.stringify({ type: 'init', data: username }));
      };

      newWs.onmessage = (event) => {
        console.log('Message received at:', new Date().toISOString());
        console.log('Raw message:', event.data);
        try {
          const messageData = JSON.parse(event.data);
          console.log('Parsed message:', messageData);

          if (messageData.type === 'ack') {
            handleAcknowledgment(messageData.id);
            return;
          }

          if (messageData.type === 'heartbeat') {
            console.log('Heartbeat received');
            return;
          }

          if (messageData.sender === 'Server') {
            console.log('Server message:', messageData);
            return;
          }

          if (messageData.type === 'message' && messageData.data && messageData.sender !== username) {
            const newMessage: Message = {
              key: messageData.id || generateUUID(),
              text: messageData.data,
              mine: false,
              user: messageData.sender || 'Unknown',
              sent: true,
            };
            console.log('Adding new message:', newMessage);
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            setLastMessageTime(Date.now());
          } else {
            console.log('Unhandled message type:', messageData.type);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      newWs.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      newWs.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        if (reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttempts++;
            console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
            connect();
          }, reconnectInterval);
        }
      };

      setWs(newWs);
    }

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    if (isConnected && ws) {
      const heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 30000); // Send a heartbeat every 30 seconds

      return () => clearInterval(heartbeatInterval);
    }
  }, [isConnected, ws]);

  useEffect(() => {
    if (isConnected && messageQueue.length > 0) {
      console.log('Connection restored. Sending queued messages.');
      messageQueue.forEach((msg) => {
        ws.send(JSON.stringify(msg));
      });
      setMessageQueue([]);
    }
  }, [isConnected, messageQueue]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  function sendMessage() {
    if (inputText.trim()) {
      const messageId = generateUUID();
      const messageToSend = {
        type: 'message',
        id: messageId,
        data: inputText,
        user: username
      };

      console.log('Sending message:', messageToSend);

      if (!isConnected || !ws) {
        console.log('Not connected. Queueing message.');
        setMessageQueue((prev) => [...prev, messageToSend]);
      } else {
        ws.send(JSON.stringify(messageToSend));
      }

      const newMessage: Message = {
        key: messageId,
        text: inputText,
        mine: true,
        user: username,
        sent: false,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputText('');

      // Set up acknowledgment timeout
      const ackTimeout = setTimeout(() => {
        console.log(`No acknowledgment received for message ${messageId}`);
        handleAcknowledgment(messageId);  // Assume message was sent if no ack received
      }, 5000);
      setAckTimeouts((prev) => ({ ...prev, [messageId]: ackTimeout }));
    }
  }

  function handleAcknowledgment(messageId) {
    console.log(`Acknowledgment received for message ${messageId}`);
    clearTimeout(ackTimeouts[messageId]);
    setAckTimeouts((prev) => {
      const newTimeouts = { ...prev };
      delete newTimeouts[messageId];
      return newTimeouts;
    });
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.key === messageId ? { ...msg, sent: true } : msg
      )
    );
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

        {/* Connection status and refresh button */}
        <XStack justifyContent="space-between" paddingHorizontal="$4" paddingBottom="$2">
          <Text color={isConnected ? 'green' : 'red'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
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
                          backgroundColor: item.user === username ? 'white' : '#E4E7EB',
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
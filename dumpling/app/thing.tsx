import React, { useState, useRef, useEffect } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ParamListBase, RouteProp, useRoute } from '@react-navigation/native';
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
// import GridComponent from '~/components/Grid';
import { userAtom, messagesAtom } from '~/state/atoms';
import { useRecoilState, useRecoilValue } from 'recoil';


export interface MessageProps {
  key: string;
  text: string;
  mine: boolean;
  user: string;
  sent: boolean;
}

interface Route{
  params:string
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function Chatroom() {
  const route:RouteProp<ParamListBase> = useRoute();
  
  // const { username}  = route.params
  const userProfile = useRecoilValue(userAtom)
  const username = userProfile.username;

  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useRecoilState<MessageProps[]>(messagesAtom);
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
      'ws://baklava.cheddar-io.workers.dev/api/room/testroom/websocket'
    );

    newWs.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    newWs.onmessage = (event) => {
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
          const newMessage: MessageProps = {
            key: generateUUID(),
            text: messageData.data || messageData.message || JSON.stringify(messageData),
            mine: messageData.sender === username,
            user: messageData.sender || 'Server',
            sent: true,
          };
        
         
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
      setIsConnected(false);
    };

    newWs.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      setIsConnected(false);
    };

    setWs(newWs);

    return () => {
      setMessages([]);
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
        user: username,
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
        user: username   
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
  const GridBackground = () => {
  return (
    <View style={styles.gridContainer}>
      {[...Array(20)].map((_, i) => (
        <LinearGradient
          key={`v${i}`}
          colors={['#8A00C4', '#4D4DFF', '#ff8ad0', '#dee5fe']} // Colorful gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gridLine, styles.vertical, { left: `${(i + 1) * 5}%` }]}
        />
      ))}
      {[...Array(20)].map((_, i) => (
        <LinearGradient
          key={`h${i}`}
          colors={['#8A00C4', '#4D4DFF', '#ff8ad0', '#dee5fe']} // Colorful gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 2, y: 1 }}
          style={[styles.gridLine, styles.horizontal, { top: `${(i + 1) * 5}%` }]}
        />
      ))}
    </View>  
    );
};  
return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <YStack flex={1} backgroundColor="#000000">
        {/* Background layers */}
        <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]}>
          <View style={styles.topBackgroundLayer}>
            <GridBackground />
          </View>
          <View style={styles.bottomBackgroundLayer}>
            <GridBackground />
          </View>
        </View>
  
        {/* Main content */}
        <View style={{ flex: 1, zIndex: 1 }}>
          {/* Header */}
          <XStack
            backgroundColor="rgba(0,0,0,0.5)"
            paddingTop="$8"
            paddingHorizontal="$4"
            alignItems="center"
            justifyContent="space-between"
            paddingBottom="$3"
          >
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
              alignSelf="center"
            >
              CHEDDAR
            </Text>
            <Link href={'/modal'} asChild>
              <AntDesign name="pluscircle" size={24} color="white" />
            </Link>
          </XStack>
  
          {/* Connection status */}
          <XStack justifyContent="space-between" paddingHorizontal="$4" paddingBottom="$2">
            <Text color={isConnected ? '#96ff64' : 'red'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </XStack>
  
          {/* Chat messages */}
          <View style={{ flex: 1 }}>
            <Animated.ScrollView
              ref={scrollRef}
              scrollEventThrottle={16}
              onScroll={scrollHandler}
              style={{ flex: 1 }}
            >
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
                        ]}
                      >
                        <Text style={{ color: item.mine ? 'white' : '#111927' }}>{item.text}</Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: item.mine ? 'rgba(255,255,255,0.7)' : 'rgba(17,25,39,0.7)',
                            alignSelf: 'flex-end',
                            marginTop: 4,
                          }}
                        >
                          {item.user} {!item.sent && '(Sending...)'}
                        </Text>
                      </View>
                    ))}
                  </View>
                }
              >
                <View style={{ flex: 1 }}>
                  <AnimatedLinearGradient
                    style={[
                      StyleSheet.absoluteFillObject,
                      {
                        transform: [{ translateY: scrollY }],
                      },
                    ]}
                    colors={['#A38CF9','#FD84AA','#ba351f',  '#09E0FF']}
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
                        ]}
                      >
                        <Text color={'#fff'} style={{ color: 'white' }}>{item.text}</Text>
                        <Text
                          color="white"
                          opacity={0.5}
                          style={{
                            fontSize: 12,
                            color: 'rgba(255,100,255,0.7)',
                            alignSelf: 'flex-end',
                            marginTop: 4,
                          }}
                        >
                          {item.user} {!item.sent && '(Sending...)'}
                        </Text>
                      </View>
                    )}
                  />
                </View>
              </MaskedView>
            </Animated.ScrollView>
          </View>
  
          {/* Input area */}
          <XStack padding="$5" backgroundColor="rgba(0,0,0,0.5)">
            <Input
              flex={1}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              borderRadius="$8"
              height="$4"
              paddingHorizontal="$3"
              paddingRight={inputText ? '$8' : '$3'}
              onSubmitEditing={sendMessage}
              backgroundColor="#ffffff"
              color="#ffffff"
              fontWeight={500}
            />
            <AnimatePresence>
              {inputText && (
                <Button
                  position="absolute"
                  right="$6"
                  bottom="$6"
                  size="$3"
                  circular
                  onPress={sendMessage}
                  animation="quick"
                  enterStyle={{ opacity: 0, scale: 0.8 }}
                  exitStyle={{ opacity: 0, scale: 0.8 }}
                >
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
    paddingVertical: 12,
    margin: 12,
    marginBottom: 1,
    borderRadius: 12,
    maxWidth: width * 0.65,
    minWidth: 100,
    alignSelf: 'flex-start',
  },
  topBackgroundLayer: {
    position: 'absolute',
    top: -220,
    left: 0,
    right: 0,
    height: '80%',
    backgroundColor: '#000000',
    transform: [{ perspective: 300 }, { rotateX: '-45deg' }],
    zIndex: -10,
    pointerEvents: 'none',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'linear-gradient(to top, #000000, transparent)',
    zIndex: -10,
    pointerEvents: 'none',
  },
  bottomBackgroundLayer: {
    position: 'absolute',
    bottom: -230,
    left: 0,
    right: 0,
    height: '80%',
    backgroundColor: '#000000',
    transform: [{ perspective: 300 }, { rotateX: '40deg' }],
    zIndex: -14,
    pointerEvents: 'none',
  },
  additionalBottomGradient: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'linear-gradient(to bottom, #000000, transparent)',
    zIndex: -14,
    pointerEvents: 'none',
  },
  gridContainer: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  opacity: 0.35,
},
  gridLine: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  vertical: {
    width: 1,
    top: 0,
    bottom: 0,
  },
  horizontal: {
    height: 1,
    left: 0,
    right: 0,
  },
});

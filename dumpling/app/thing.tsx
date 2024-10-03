import React, { useState, useRef, useEffect } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'react-native';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { ParamListBase, RouteProp, useRoute } from '@react-navigation/native';
import { YStack, XStack, Text, Input, Button, AnimatePresence, Avatar } from 'tamagui';
import { Link } from 'expo-router';
import { userAtom, messagesAtom } from '~/state/atoms';
import { useRecoilState, useRecoilValue } from 'recoil';
import { PhantomBlinkIntegration } from '~/components/Blinksdemo';
import { adapterProps } from '~/utils/adapterProps';
import axios from "axios"
import { v5 as generateChatUUID } from 'uuid';



const { width } = Dimensions.get('window');
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export interface MessageProps {
  key: string;
  text: string;
  mine: boolean;
  user: string;
  avatar: string;
  sent: boolean;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const blinkUrl = 'https://dial.to';

function containsBlinkUrl(str: string) {
  return str.includes(blinkUrl);
}

export default function Chatroom() {
  const route: RouteProp<ParamListBase> = useRoute();
  const userProfile = useRecoilValue(userAtom);
  const username = userProfile.username;
  const AvatarUrl = userProfile.avatar_url;
  const { chatName, chatAvatar } = route.params;

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


  // Define a namespace for your UUID generation
const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // You can use any valid UUID as a namespace

  //creating a new chatRoom if it doesn't already exist
  useEffect(()=>{
    const createChatRoom = async () => {
      const payload = {
        id: generateChatUUID(chatName, NAMESPACE),
        name: chatName,
        description: chatName, // using the same value as the name for description
        admin_id: '12345', // admin ID hardcoded here
        created_at: new Date().toISOString(), // current datetime in ISO string format
      };

      try {
        const response = await axios.post('https://wasabi.cheddar-io.workers.dev/api/chat/chat_room', payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        console.log('Chat room created:', response.data);
      } catch (error) {
        console.error("ChatRoom with this name already exists")
        console.error('Error creating chat room:', error);

      }
    }

    createChatRoom();
  },[chatName])

  useEffect(() => {
    const newWs = new WebSocket(`ws://baklava.cheddar-io.workers.dev/api/room/${chatName}/websocket`);

    newWs.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    newWs.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);

        if (messageData.type === 'heartbeat') {
          console.log('Heartbeat received');
          return;
        }

        if (messageData.sender == 'Server') {
          return;
        }

        if (messageData.type === 'message' || messageData.data) {
          const newMessage: MessageProps = {
            key: generateUUID(),
            text: messageData.data || messageData.message || JSON.stringify(messageData),
            mine: messageData.sender === username,
            user: messageData.sender || 'Server',
            avatar: messageData.avatar,
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
      const newMessage: MessageProps = {
        key: messageKey,
        text: inputText,
        mine: true,
        user: username,
        avatar: AvatarUrl,
        sent: false,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputText('');

      const messageToSend = {
        type: 'message',
        data: inputText,
        user: username,
        avatar: AvatarUrl,
      };

      ws.send(JSON.stringify(messageToSend));

      setTimeout(() => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg.key === messageKey ? { ...msg, sent: true } : msg))
        );
      }, 500);
    }
  }

  async function addMessageToD1(){
    
  }

  const GridBackground = () => {
    return (
      <View style={styles.gridContainer}>
        {[...Array(20)].map((_, i) => (
          <LinearGradient
            key={`v${i}`}
            colors={['#8A00C4', '#4D4DFF', '#ff8ad0', '#dee5fe']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gridLine, styles.vertical, { left: `${(i + 1) * 5}%` }]}
          />
        ))}
        {[...Array(20)].map((_, i) => (
          <LinearGradient
            key={`h${i}`}
            colors={['#8A00C4', '#4D4DFF', '#ff8ad0', '#dee5fe']}
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
      style={{ flex: 1 }}>
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
            backgroundColor="rgba(0,0,0,1)"
            paddingTop="$8"
            paddingHorizontal="$4"
            alignItems="center"
            justifyContent="space-between"
            paddingBottom="$3">
            <Link href={'/(tabs)/Chat'}>
              <XStack
                backgroundColor={'black'}
                height={35}
                width={35}
                alignContent="center"
                alignItems="center"
                justifyContent="center"
                borderRadius={100}>
                <AntDesign name="arrowleft" size={24} color="black" />
              </XStack>
            </Link>
            <Image source={{ uri: chatAvatar }} style={styles.avatar} />
            <Text
              color="white"
              fontSize={30}
              fontWeight="bold"
              fontFamily={'Poppins'}
              paddingTop={'$2'}
              paddingLeft={'$3'}
              alignSelf="center">
              {chatName}
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
              style={{ flex: 1 }}>
              <MaskedView
                maskElement={
                  <View style={{ backgroundColor: 'transparent' }}>
                    {messages.map((item) => (
                      <XStack
                        key={item.key}
                        alignItems="center"
                        justifyContent={item.mine ? 'flex-end' : 'flex-start'}
                        marginBottom="$2"
                        paddingHorizontal="$3">
                        {!item.mine && (
                          <Avatar circular size="$3" marginRight="$1">
                            <Avatar.Image src={item.avatar} />
                            <Avatar.Fallback delayMs={600} backgroundColor="#131313" />
                          </Avatar>
                        )}
                        {containsBlinkUrl(item.text) ? (
                          <View style={styles.blinkContainer}>
                            <PhantomBlinkIntegration urls={[item.text]} adapterProps={adapterProps} />
                            <Text style={styles.blinkUserInfo}>
                              {item.user} {!item.sent && '(Sending...)'}
                            </Text>
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.messageItem,
                              {
                                backgroundColor: item.mine ? 'white' : '#141414',
                                alignSelf: item.mine ? 'flex-end' : 'flex-start',
                                opacity:1,
                              },
                            ]}>
                            <Text style={styles.messageText}>{item.text}</Text>
                            <Text style={styles.userInfo}>
                              {item.user} {!item.sent && '(Sending...)'}
                            </Text>
                          </View>
                        )}
                      </XStack>
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
                    colors={['#A38CF9', '#FD84AA', '#ba351f', '#09E0FF']}
                  />
                  <FlatList
                    scrollEnabled={false}
                    data={messages}
                    keyExtractor={(item) => item.key}
                    renderItem={({ item }) => (
                      <XStack
                        key={item.key}
                        alignItems="center"
                        justifyContent={item.mine ? 'flex-end' : 'flex-start'}
                        marginBottom="$2"
                        paddingHorizontal="$3">
                        {!item.mine && (
                          <Avatar circular size="$3" marginRight="$1">
                            <Avatar.Image src={item.avatar} />
                            <Avatar.Fallback delayMs={600} backgroundColor="#131313" />
                          </Avatar>
                        )}
                        {containsBlinkUrl(item.text) ? (
                          <View style={styles.blinkContainer}>
                            <PhantomBlinkIntegration urls={[item.text]} adapterProps={adapterProps} />
                            <Text style={styles.blinkUserInfo}>
                              {item.user} {!item.sent && '(Sending...)'}
                            </Text>
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.messageItem,
                              {
                                backgroundColor: 'white',
                                alignSelf: item.mine ? 'flex-end' : 'flex-start',
                                opacity: 1,
                              },
                            ]}>
                            <Text style={styles.messageText}>{item.text}</Text>
                            <Text style={styles.userInfo}>
                              {item.user} {!item.sent && '(Sending...)'}
                            </Text>
                          </View>
                        )}
                      </XStack>
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
              placeholder="Gm!... what we buyin today?"
              borderRadius={15}
              height="$4"
              paddingHorizontal="$3"
              paddingRight={inputText ? '$8' : '$3'}
              onSubmitEditing={sendMessage}
              backgroundColor="#1D1E21"
              color="#FFFFFF"
              fontWeight={500}
            />
            <AnimatePresence>
              {inputText && (
                <Button
                  position="absolute"
                  right="$6"
                  bottom={32}
                  size="$2"
                  borderRadius={10}
                  backgroundColor={'#FFCC00'}
                  onPress={sendMessage}
                  animation="quick"
                  enterStyle={{ opacity: 0, scale: 0.8 }}
                  exitStyle={{ opacity: 0, scale: 0.8 }}>
                  <Ionicons name="send" size={20} color="black" />
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
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  userInfo: {
    fontSize: 12,
    color: 'rgba(255,255,255,1)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  blinkContainer: {
    width: '100%',
    maxWidth: width * 0.8,
    backgroundColor: '#141414',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  blinkUserInfo: {
    fontSize: 12,
    color: 'rgba(255,255,255,1)',
    alignSelf: 'flex-end',
    marginTop: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 25,
    marginLeft: 15,
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
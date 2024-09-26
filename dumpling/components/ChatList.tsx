import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import telegramData from '~/data/telegramData';
import { Avatar, YStack } from 'tamagui';
import { BlurView } from 'expo-blur';
import { Link } from 'expo-router';
import { userAtom } from '~/state/atoms';
import { useRecoilValue } from 'recoil';

const ChatItem = ({ item }) => (
  <View style={styles.chatItem}>
    <Image source={{ uri: item.avatar }} style={styles.avatar} />
    <Link
      href={{
        pathname: '/thing',
        params: {
          id: item.id,
          chatName: item.name,
          chatAvatar: item.avatar,
        },
      }}
      style={{ flex: 1 }}>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.name}>{item.name}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
    </Link>
  </View>
);

const Header = () => {
  const user = useRecoilValue(userAtom);

  const imageUrl = user.avatar_url;
  const fallbackImageUrl =
    'https://europe1.discourse-cdn.com/figma/original/3X/6/1/6173a1aae8372541cfe858bbadccf198e2935f89.gif';

  return (
    <BlurView intensity={50} tint="dark" style={styles.header}>
      <Text style={styles.headerTitle}>Chats</Text>
      <TouchableOpacity onPress={() => alert('Settings button pressed')}>
        <Link href={'/userPage'}>
          <Avatar circular size="$4">
            <Avatar.Image accessibilityLabel="Profile Picture" src={imageUrl} />
            <Avatar.Fallback backgroundColor="black">
              <Image
                source={{ uri: fallbackImageUrl }}
                style={{ width: '100%', height: '100%', borderRadius: 20 }} // Adjust styles as needed
              />
            </Avatar.Fallback>
          </Avatar>
        </Link>
      </TouchableOpacity>
    </BlurView>
  );
};

const ChatListWithHeader = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <FlatList
        data={telegramData}
        renderItem={({ item }) => {
          console.log('chatlist : ');
          console.log(item);

          return <ChatItem item={item} />;
        }}
        keyExtractor={(item) => item.key}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1d1d1d',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1d1d1d',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 50,
    marginBottom: 5,
  },
  name: {
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Goldman',
    fontSize: 18,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  message: {
    color: '#037EE5',
  },
});

export default ChatListWithHeader;

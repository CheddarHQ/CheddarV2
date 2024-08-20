import { Link } from 'expo-router';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, Text, Pressable } from 'react-native';
//@ts-ignore
import { Input, Card, Avatar, YStack, XStack } from 'tamagui';

export default function Modal() {
  const router = useRouter();
  // Dummy data
  const data = [
    {
      id: '1', // Unique identifier for routing
      avatarUrl: 'https://example.com/avatar1.png',
      title: 'CryptoCoin 1',
      author: 'Author Name 1',
    },
    {
      id: '2',
      avatarUrl: 'https://example.com/avatar2.png',
      title: 'CryptoCoin 2',
      author: 'Author Name 2',
    },
    {
      id: '3',
      avatarUrl: 'https://example.com/avatar3.png',
      title: 'CryptoCoin 3',
      author: 'Author Name 3',
    },
  ];

  return (
    <YStack
      flex={1}
      backgroundColor="#000000" // Set the background color to black
      padding={16}>
      <Input
        size="$4"
        borderWidth={1}
        padding={4}
        marginHorizontal={4}
        placeholder="Search..."
        marginBottom={16}
        marginTop={10}
        borderRadius={20}
        color="#FFFFFF" // Set the text color for the input
        backgroundColor="#000000" // Optional: Set a background color for the input
      />

      {/* Cards section */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {data.map((item, index) => (
          <Pressable
            key={index}
            onPress={() => {
              //@ts-ignore
              router.push(`/crypto/${item.id}`);
            }}>
            <Card elevate paddingVertical={20} borderRadius={0} backgroundColor="#000000">
              <XStack alignItems="center" space>
                <Avatar circular size="$5">
                  <Avatar.Image accessibilityLabel="Nate Wienert" src={item.avatarUrl} />
                  <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                </Avatar>
                <YStack space={8}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }}>
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#888888' }}>{item.author}</Text>
                </YStack>
              </XStack>
            </Card>
          </Pressable>
        ))}
      </ScrollView>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </YStack>
  );
}

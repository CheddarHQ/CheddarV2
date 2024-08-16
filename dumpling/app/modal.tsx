import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, Text } from 'react-native';
import { Input, Card, Avatar, YStack, XStack } from 'tamagui';

export default function Modal() {
  // Dummy data
  const data = [
    {
      avatarUrl: 'https://example.com/avatar1.png',
      title: 'CryptoCoin 1',
      author: 'Author Name 1',
    },
    {
      avatarUrl: 'https://example.com/avatar2.png',
      title: 'CryptoCoin 2',
      author: 'Author Name 2',
    },
    {
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
      {/* Search bar on top */}

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
      <Link href={'/moneyEx'}>
        <Text> click me here</Text>
      </Link>

      {/* Cards section */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {data.map((item, index) => (
          <Card key={index} elevate paddingVertical={20} borderRadius={0} backgroundColor="#000000">
            <XStack alignItems="center" space>
              {/* Avatar */}
              <Avatar circular size="$5">
                <Avatar.Image accessibilityLabel="Nate Wienert" src={item.avatarUrl} />
                <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
              </Avatar>

              {/* Text content */}
              <YStack space={8}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 14, color: '#888888' }}>{item.author}</Text>
              </YStack>
            </XStack>
          </Card>
        ))}
      </ScrollView>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </YStack>
  );
}

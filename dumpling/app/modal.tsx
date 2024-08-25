import React, { useEffect, useState } from 'react';
//@ts-ignore
import { StatusBar } from 'expo-status-bar';
//@ts-ignore
import { Platform, ScrollView, Text, Pressable } from 'react-native';
//@ts-ignore
import { useRouter } from 'expo-router';
//@ts-ignore
import { Input, Card, Avatar, YStack, XStack } from 'tamagui';

interface TokenBasicInfo {
  baseAddress: string;
  priceUsd: string;
  priceNative: string;
  imageUrl: string;
  priceChange: number;
}

interface TokenData {
  basicInfo: TokenBasicInfo[];
  detailedInfo: any[]; // You can define a more specific type for detailedInfo if needed
}

export default function Modal() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const ids =
    'GGXDG9XzfazWZGyV6CPKHQyB1V6qDzXGYb5RyufqfTVN,zcdAw3jpcqEY8JYVxNVMqs2cU35cyDdy4ot7V8edNhz,34Vzjmat2bRAY3mTxXaCemnT1ca51Tj7xL3J9T1cHhiT,3a7fVXt9vpQbxytdDkqep2n5hqw8iyCdXuN3N4i6Ki3r';
  const router = useRouter();

  useEffect(() => {
    async function fetchMetadata(ids: string) {
      try {
        setLoading(true);
        console.log('Fetching data...');
        const response = await fetch(
          `https://sushi.cheddar-io.workers.dev/api/data/fetchmetadata?ids=${ids}`
        );
        const data: TokenData = await response.json();
        console.log('Fetched data:', data);
        setTokenData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    }
    fetchMetadata(ids);
  }, []);

  return (
    <YStack flex={1} backgroundColor="#000000" padding={16}>
      <Input
        size="$4"
        borderWidth={1}
        padding={4}
        marginHorizontal={4}
        placeholder="Search..."
        marginBottom={16}
        marginTop={10}
        borderRadius={20}
        color="#FFFFFF"
        backgroundColor="#000000"
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {loading && <Text style={{ color: '#FFFFFF' }}>Loading...</Text>}
        {error && <Text style={{ color: '#FF0000' }}>Error: {error}</Text>}
        {tokenData &&
          tokenData.basicInfo &&
          tokenData.basicInfo.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => {
                router.push(`/crypto/${item.baseAddress}`);
              }}>
              <Card elevate paddingVertical={20} borderRadius={0} backgroundColor="#000000">
                <XStack alignItems="center" space>
                  <Avatar circular size="$5">
                    <Avatar.Image accessibilityLabel={`Token ${index + 1}`} src={item.imageUrl} />
                    <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                  </Avatar>
                  <YStack space={8} flex={1}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#888888' }}>${item.priceUsd}</Text>
                  </YStack>
                  <Text
                    style={{ fontSize: 14, color: item.priceChange >= 0 ? '#00FF00' : '#FF0000' }}>
                    {item.priceChange.toFixed(2)}%
                  </Text>
                </XStack>
              </Card>
            </Pressable>
          ))}
        {tokenData && tokenData.basicInfo && tokenData.basicInfo.length === 0 && (
          <Text style={{ color: '#FFFFFF' }}>No data available</Text>
        )}
      </ScrollView>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </YStack>
  );
}

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Input, Card, Avatar, YStack, XStack } from 'tamagui';

interface TokenBasicInfo {
  name: string;
  baseAddress: string;
  priceUsd: string;
  priceNative: string;
  imageUrl: string;
  priceChange: number;
  symbol: string;
}

interface TokenData {
  basicInfo: TokenBasicInfo[];
  detailedInfo: any[]; // Change this to an array
}

export default function Modal() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');

  const initialIds =
    'D6NdKrKNQPmRZCCnG1GqXtF7MMoHB7qR6GU5TkG59Qz1,zcdAw3jpcqEY8JYVxNVMqs2cU35cyDdy4ot7V8edNhz,3ne4mWqdYuNiYrYZC9TrA3FcfuFdErghH97vNPbjicr1,AHTTzwf3GmVMJdxWM8v2MSxyjZj8rQR6hyAC3g9477Yj,5o9kGvozArYNWfbYTZD1WDRkPkkDr6LdpQbUUqM57nFJ,6DowxaYxUdjNJknq9Cjfc5dy4Mq8Vv4BHXXY4zn6LTQy,5eLRsN6qDQTQSBF8KdW4B8mVpeeAzHCCwaDptzMyszxH,9uWW4C36HiCTGr6pZW9VFhr9vdXktZ8NA8jVnzQU35pJ,E4ubbJDXU9y9FoAtSbfynJSbgiZzr4rgaGCCf6Mi4ki2';
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

    fetchMetadata(initialIds);
  }, []);

  useEffect(() => {
    if (query === '') return;

    async function fetchSearchResults(query: string) {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching data with query:', query);

        const response = await fetch(
          `https://sushi.cheddar-io.workers.dev/api/data/fetchquery?query=${query}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data: TokenData = await response.json();
        console.log('Fetched data from search:', data);
        setTokenData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    }

    const timeoutId = setTimeout(() => {
      fetchSearchResults(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

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
        value={query}
        onChangeText={setQuery}
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {loading && <Text style={{ color: '#FFFFFF' }}>Loading...</Text>}
        {error && <Text style={{ color: '#FF0000' }}>Error: {error}</Text>}
        {tokenData?.basicInfo && tokenData.basicInfo.length > 0 ? (
          tokenData.basicInfo.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => {
                const detailedInfo = tokenData.detailedInfo.find(
                  (detail: any) => detail.baseAddress === item.baseAddress
                );
                if (detailedInfo) {
                  const detailedInfoString = JSON.stringify(detailedInfo);
                  router.push({
                    //@ts-ignore
                    pathname: `/crypto/${item.baseAddress}`,
                    params: { detailedInfo: detailedInfoString },
                  });
                } else {
                  console.log(`No detailed info found for ${item.baseAddress}`);
                }
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
          ))
        ) : (
          <Text style={{ color: '#FFFFFF' }}>No data available</Text>
        )}
      </ScrollView>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </YStack>
  );
}

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Input, Card, Avatar, YStack, XStack, ZStack } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { ThisLoader } from '~/components/LgSkeleton';
import FilterIcon from '../../assets/svg/slider.svg';
import MagIcon from '../../assets/svg/search.svg';
import { transcode } from 'buffer';

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
  'GfihScsf95v8G4TR73k2EcwXM2DrX63J7GX1i79GNbGs,FpjYwNjCStVE2Rvk9yVZsV46YwgNTFjp7ktJUDcZdyyk,HQQrpzTmt7KcGMf5E7RYgbDmz5izRxtHFCU9sZK6XANQ,HcPgh6B2yHNvT6JsEmkrHYT8pVHu9Xiaoxm4Mmn2ibWw,4xxM4cdb6MEsCxM52xvYqkNbzvdeWWsPDZrBcTqVGUar,zcdAw3jpcqEY8JYVxNVMqs2cU35cyDdy4ot7V8edNhz,6DowxaYxUdjNJknq9Cjfc5dy4Mq8Vv4BHXXY4zn6LTQy,5eLRsN6qDQTQSBF8KdW4B8mVpeeAzHCCwaDptzMyszxH,9uWW4C36HiCTGr6pZW9VFhr9vdXktZ8NA8jVnzQU35pJ,FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E,H6fxtvWLFYSJ66mPJqoz7cg6tk32Pcgc9vXrywu4LEWk,2M8mTcrAMf7nrBbex2SNzzUfiBd8YXs7t3yS1dRvheyA';
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

        setTokenData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    }

    fetchMetadata(initialIds);


    const intervalId = setInterval(()=>{
      fetchMetadata(initialIds);
    }, 300000 )


    return () => clearInterval(intervalId);
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
    <YStack flex={1} backgroundColor="#111314" padding={16}>
      <LinearGradient
        // Background Linear Gradient
        colors={['transparent', 'rgba(63,43,150,0.6)']} // Transparent to violet
        style={styles.background}
      />

      {/* width: 293px;height: 42px;top: 24px;left: 26px;padding: 9px 129px 9px 12px;gap:
      10px;border-radius: 20px 0px 0px 0px;border: 1px 0px 0px 0px;opacity: 0px; */}
      <XStack marginTop={35}>
        <ZStack>
          <Input
            left={10}
            width={293}
            height={42}
            paddingHorizontal={37}
            borderWidth={1}
            paddingVertical={9}
            placeholder="Search item here"
            borderRadius={20}
            color="#FFFFFF"
            backgroundColor="#18191B"
            borderColor="rgba(255, 255, 255, 0.1)"
            value={query}
            onChangeText={setQuery}
          />
          <XStack left={12} padding={9}>
            <MagIcon />
          </XStack>
        </ZStack>
        <XStack
          height={42}
          width={42}
          left={300}
          padding={9}
          marginLeft={8}
          alignContent="center"
          alignItems="center"
          justifyContent="center"
          borderWidth={1}
          borderRadius={50}
          backgroundColor={'#18191B'}
          borderColor="rgba(255, 255, 255, 0.1)">
          <FilterIcon />
        </XStack>
      </XStack>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {loading && (
          <YStack paddingTop={10}>
            <ThisLoader />
            <ThisLoader />
            <ThisLoader />
          </YStack>
        )}
        {error && (
          <Text fontFamily={'Goldman'} style={{ color: '#FF0000' }}>
            Error: {error}
          </Text>
        )}
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
                  console.log('detailedInfoString', detailedInfoString);
                  router.push({
                    //@ts-ignore
                    pathname: `/crypto/${item.baseAddress}`,
                    params: { detailedInfo: detailedInfoString },
                  });
                } else {
                  console.log(`No detailed info found for ${item.baseAddress}`);
                }
              }}>
              <Card
                elevate
                paddingVertical={20}
                borderRadius={0}
                style={{ backgroundColor: 'transparent' }}>
                <XStack alignItems="center" alignContent="center" justifyContent="space-between">
                  <XStack gap={10}>
                    <Avatar circular height={100}>
                      <Avatar.Image accessibilityLabel={`Token ${index + 1}`} src={item.imageUrl} />
                      <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
                    </Avatar>
                    <YStack gap={4}>
                      <Text
                        fontFamily='Goldman'
                        color={'white'}
                        fontWeight={700}
                        fontSize={16}>
                        {item.symbol}
                      </Text>
                      <Text
                        fontFamily='Goldman'
                        color={'#5D5D5D'}
                        fontWeight={400}
                        fontSize={14}>
                        {item.baseAddress.slice(0, 4)}...${item.baseAddress.slice(-4)}
                      </Text>
                    </YStack>
                  </XStack>
                  <YStack gap={4}>
                    <Text
                      fontFamily='Goldman'
                      color={'white'}
                      fontWeight={700}
                      fontSize={14}
                      alignSelf="flex-end">
                      ${item.priceUsd}
                    </Text>
                    {/* style={{
                        fontSize: 14,
                        color: item.priceChange >= 0 ? '#00FF00' : '#FF0000',
                      }} */}
                    <Text
                      fontFamily='Goldman'
                      color={item.priceChange >= 0 ? '#00FF00' : '#FF0000'}
                      fontSize={14}
                      fontWeight={400}
                      alignSelf="flex-end">
                      {item.priceChange.toFixed(2)}%
                    </Text>
                  </YStack>
                </XStack>
              </Card>
            </Pressable>
          ))
        ) : (
          // <Text fontFamily={"Goldman"} style={{ color: '#FFFFFF' }}>No data available</Text>
          <YStack>
            <ThisLoader />
          </YStack>
        )}
      </ScrollView>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </YStack>
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1500,
  },
});

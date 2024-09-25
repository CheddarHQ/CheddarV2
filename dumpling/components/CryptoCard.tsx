import { Dimensions, Pressable } from 'react-native';
import { TokenBasicInfo } from '~/app/crypto/[id]';

import { Text, SizableText, Tabs, XStack, YStack, Button, Card, CardHeader, Avatar } from 'tamagui';

interface CryptoCardProps {
    item: TokenBasicInfo;
    onPress: () => void;
    input: string;
  }

  const CryptoCard = ({ item, onPress, input }: CryptoCardProps) => (
    <Pressable onPress={onPress}>
      <XStack
        alignSelf="center"
        justifyContent="center"
        width="100%"
        maxHeight={100}
        maxWidth={360}
        paddingBottom={'$5'}>
        <Card borderRadius={'$12'} scale={0.8} alignSelf="center">
          <CardHeader>
            <XStack alignItems="center">
              <Avatar circular size="$3">
                <Avatar.Image accessibilityLabel={item.name} src={item.imageUrl} />
                <Avatar.Fallback backgroundColor="$blue10" />
              </Avatar>
              <YStack space={8} flex={1} paddingLeft={'$5'}>
                <Text color={'white'} alignSelf="center" fontSize={18} fontWeight="bold">
                  {item.name}
                </Text>
                <Text style={{ fontSize: 14, color: '#fff' }}>${item.priceUsd}</Text>
              </YStack>
              <Text
                style={{
                  fontSize: 20,
                  color: item.priceChange >= 0 ? '#00FF00' : '#FF0000',
                }}>
                {(parseFloat(input) / parseFloat(item.priceUsd)).toFixed(2)} {item.symbol}
              </Text>
            </XStack>
          </CardHeader>
        </Card>
      </XStack>
    </Pressable>
  );



  export default CryptoCard;
  
 
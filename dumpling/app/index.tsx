import { Link, Stack } from 'expo-router';
//@ts-ignore
import { TamaguiProvider, Text, YStack, XStack, Button, Image } from 'tamagui';
import { AnimatedBackground } from '~/components/AnimatedBackground';
import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function Home() {
  return (
    <YStack f={1} jc="center" ai="center" backgroundColor="#000000" padding="$4">
      <AnimatedBackground />
      <Link href={'/thing'} asChild>
        <Image
          source={require('../assets/cheese-svgrepo-com.png')}
          width={300}
          height={300}
          resizeMode="contain"
        />
      </Link>
      <Link href={'/thing'} asChild>
        <Text
          fontSize="$10"
          fontWeight="bold"
          textDecorationColor={'#ffffff'}
          color={'#ffffff'}
          //@ts-ignore
          fontFamily="Jersey10">
          Cheddar
        </Text>
      </Link>
    </YStack>
  );
}

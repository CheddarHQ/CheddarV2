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
      <Image
        source={require('../assets/cheese-svgrepo-com.png')}
        width={200}
        height={200}
        resizeMode="contain"
      />
      <Text fontSize="$8" fontWeight="bold">
        Cheddar
      </Text>
      {/* @ts-ignore */}
      <Link href={'/thing'} asChild>
        <Button size="$4" theme="active">
          Get Started
        </Button>
      </Link>
    </YStack>
  );
}

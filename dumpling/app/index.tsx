//@ts-ignore
import { Link, Stack } from 'expo-router';
//@ts-ignore
import { TamaguiProvider, Text, YStack, XStack, Button } from 'tamagui';
import { AnimatedBackground } from '~/components/AnimatedBackground';
import Auth from '~/components/Auth';
import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Image } from 'tamagui';


export default function Home() {
  return (
    <YStack
      f={1}
      backgroundColor="#0a0b0f"
      padding="$4"
      justifyContent="space-between"
      alignContent="center"
      alignItems="center">
      <AntDesign name="right" size={30} color="#0a0b0f" />
      <XStack paddingTop="$5">
        <Image
          source={{
            uri: require('../assets/CheddarLogo.png'),
            width: 380,
            height: 380,
          }}
        />
      </XStack>
      <Link href={'/loginPage'}>
        <XStack
          borderWidth="$1"
          borderColor={'#ffffff'}
          borderRadius={'$5'}
          backgroundColor={'#ffffff'}
          padding={'$4'}
          alignSelf="center"
          marginBottom="$13">
          <AntDesign name="right" size={30} color="black" />
        </XStack>
      </Link>
    </YStack>
  );
}

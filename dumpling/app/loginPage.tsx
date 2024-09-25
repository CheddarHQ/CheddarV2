import React from 'react';
import { Text, XStack, YStack } from 'tamagui';
import Auth from '~/components/Auth';
import Slider from '~/components/Slider';

const loginPage = () => {
  return (
    <YStack
      backgroundColor={'#0a0b0f'}
      f={1}
      alignContent="center"
      alignItems="center"
      justifyContent="flex-end">
      <Slider />
      <YStack marginBottom="$6" gap="$10">
        <Auth />
        <Text color={'#333333'} textAlign="center" marginHorizontal="$3">
          By logging in or signing up, you agree to our Terms of Use and have read and agreed our
          Privacy Policy
        </Text>
      </YStack>
    </YStack>
  );
};

export default loginPage;

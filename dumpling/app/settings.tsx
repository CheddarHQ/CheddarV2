import { View } from 'react-native';
import React, { useState } from 'react';
import { ToggleGroup, Heading, XStack, YStack, Text, Input, Slider } from 'tamagui';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import { Pop } from '~/components/Popover';

const Settings = () => {
  const [value, setValue] = useState(null);

  const onPressHandler = () => {};
  //@ts-ignore
  const handleCustomInputChange = (e) => {
    // Handle the custom input change, making sure the value is a number and not more than 100
    const newValue = Math.min(Math.max(parseFloat(e.nativeEvent.text) || 0, 0), 100);
    //@ts-ignore
    setValue(newValue);
  };

  return (
    <YStack backgroundColor={'#000000'} fullscreen>
      {/* @ts-ignore */}
      <Heading fontFamily={'Press2P'} alignSelf="center" color="white">
        SETTINGS
      </Heading>
      <XStack alignItems="center" marginTop={'$6'} marginBottom={'$2'} marginHorizontal={'$2'}>
        <MaterialIcons name="speed" size={24} color="white" />
        <Text color={'white'} paddingLeft={'$2'} fontWeight={'bold'}>
          Secure Speed
        </Text>
      </XStack>
      <XStack alignSelf="center">
        <ToggleGroup
          marginTop={'$3'}
          orientation={'horizontal'}
          type={'single'}
          size={'$7'}
          disableDeactivation={true}>
          <ToggleGroup.Item value="Medium" aria-label="Medium Speed">
            <Text color={'white'}>Med</Text>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="High" aria-label="High Speed">
            <Text color={'white'}>High</Text>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="VeryHigh" aria-label="Very High Speed">
            <Text color={'white'}>Ultra</Text>
          </ToggleGroup.Item>
        </ToggleGroup>
      </XStack>
      <XStack alignItems="center" marginTop={'$6'} marginBottom={'$2'} marginHorizontal={'$2'}>
        <Fontisto name="beach-slipper" size={24} color="white" />
        <Text color={'white'} paddingLeft={'$2'} fontWeight={'bold'}>
          Slippage
        </Text>
      </XStack>
      <XStack alignSelf="center">
        <ToggleGroup
          marginTop={'$3'}
          orientation={'horizontal'}
          type={'single'}
          size={'$5'}
          disableDeactivation={true}>
          <ToggleGroup.Item value="0.1" aria-label="0.1% Slippage">
            <Text color={'white'}>0.1%</Text>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="1" aria-label="1% Slippage">
            <Text color={'white'}>1%</Text>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="custom" aria-label="Custom Slippage">
            <Pop
              placement="top"
              Icon={<MaterialIcons name="dashboard-customize" size={24} color="white" />}
              Name="top-popover"
            />
          </ToggleGroup.Item>
        </ToggleGroup>
      </XStack>
      <XStack alignSelf={'center'} marginTop={'$10'}>
        <Slider size="$4" width={200} defaultValue={[50]} max={100} step={20}>
          <Slider.Track>
            <Slider.TrackActive />
          </Slider.Track>
          <Slider.Thumb circular index={0} />
        </Slider>
      </XStack>
    </YStack>
  );
};

export default Settings;

{
  /* <Input
              keyboardType="numeric"
              onChange={handleCustomInputChange}
              placeholder="Custom"
              //@ts-ignore
              value={value !== null ? value.toString() : ''}
              returnKeyType="done" // Shows a 'Done' button on the keyboard
              textAlign="center" // Center the text in the input field
            /> */
}

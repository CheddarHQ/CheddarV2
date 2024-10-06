import React, { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback, Linking } from 'react-native';
import { XStack, YStack, Text, Input, Theme, ScrollView, Button } from 'tamagui';
import { Buttonv } from '~/components/Button';

const AddMoneyUpi = () => {
  const [amount, setAmount] = useState('');

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleSubmit = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Replace these with your actual UPI details
    const upiId = 'yourupiid@upi';
    const name = 'Your Name';
    const merchantCode = '12345';
    const transactionId = Date.now().toString(); // Generate a unique transaction ID

    // Construct the UPI payment link
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&mc=${merchantCode}&tid=${transactionId}&am=${amount}&cu=INR`;

    // Open the UPI payment link
    Linking.openURL(upiLink).catch((err) => console.error('An error occurred', err));

    dismissKeyboard();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ScrollView flex={1} backgroundColor="#0a0b0f">
        <YStack
          flex={1}
          padding="$6"
          space="$6"
          justifyContent="center"
          alignItems="center"
          minHeight={700}>
          <Text fontSize={30} fontWeight="bold" color="$color" textAlign="center">
            Add Money via UPI
          </Text>

          <YStack space="$4" width="100%">
            <XStack
              borderBottomWidth={2}
              borderColor="$borderColor"
              paddingBottom="$3"
              alignItems="center"
              justifyContent="center"
              width="100%">
              <Text fontSize={20} color="$color" marginRight="$3">
                ₹
              </Text>
              <Input
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount"
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="$colorFocus"
                fontSize={20}
                borderWidth={0}
                backgroundColor="transparent"
                height="auto"
                color="$color"
                textAlign="center"
              />
            </XStack>

            <Text fontSize="$5" color="$colorFocus" textAlign="center">
              Enter the amount you want to add via UPI
            </Text>
          </YStack>

          <Buttonv title="Pay with UPI" onPress={handleSubmit} />
        </YStack>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default AddMoneyUpi;

{
  /* <Button
size="$5"
theme="active"
backgroundColor="$blue10"
width="85%"
bordered
pressStyle={{ scale: 0.97 }}
onPress={handleSubmit}
marginTop="$6">
<Text color="white" fontSize="$7" fontWeight="bold">
  Pay with UPI
</Text>
</Button> */
}

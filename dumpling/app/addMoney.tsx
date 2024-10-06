import React from 'react';
import { useEffect } from 'react';
import { StyleSheet, Image, TouchableOpacity, Text as RNText } from 'react-native';
import { YStack, Text, XStack } from 'tamagui';
import { useDynamic } from '~/client';
import * as Linking from 'expo-linking';
import { createSessionFromUrl } from '~/components/Auth';
import { useRecoilState } from 'recoil';

// gonna work on this page later
const PaymentScreen = () => {
  const { auth, wallets, ui } = useDynamic();
  // const [userProfile, setUserProfile] = useRecoilState(userProfile);
  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      createSessionFromUrl(url)
        .then((response) => {
          console.log('User Profile:', response);
          if (response) {
            // setUserProfile(response.profile);
          }
        })
        .catch((error) => console.error(error));
    }
  }, [url]);

  const showUserProfile = () => {
    ui.userProfile.show();
  };
  return (
    <YStack
      flex={1}
      justifyContent="space-around"
      paddingTop={60}
      alignItems="center"
      space={20}
      backgroundColor="#000">
      <YStack alignItems="center" gap={20} marginTop={20}>
        <Text fontSize={24} fontWeight="700" color="white">
          Credit/Debit CARD
        </Text>

        {/* Description */}
        <Text fontSize={16} color="gray" textAlign="center">
          Pay securely using Debit or Credit card.
        </Text>
      </YStack>
      <XStack marginVertical={'$-10'}>
        <Image
          source={require('../assets/cardProof.png')} // Use the path to your image
          style={styles.image}
        />
      </XStack>

      {/* Pay Button */}
      <TouchableOpacity
        style={styles.payButton}
        onPress={() => {
          showUserProfile(); // Correctly calling the function
          console.log('Wallet icon pressed');
        }}>
        <RNText style={styles.payButtonText}>Pay Now</RNText>
      </TouchableOpacity>
    </YStack>
  );
};

const styles = StyleSheet.create({
  payButton: {
    backgroundColor: '#28a745', // A cool green button
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 30,
  },
  payButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  image: {
    width: 400, // Set image width
    resizeMode: 'contain', // Adjust this based on how you want to display the image
  },
});

export default PaymentScreen;

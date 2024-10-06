import React from 'react';
import { View, Button, Alert } from 'react-native';
import RNUpiPayment from 'react-native-upi-payment';

const UpiPaymentExample = () => {

  // Success callback function
  const successCallback = (response) => {
    console.log('Success:', response);
    // Parse the response to get useful info
    const result = response.split('&').reduce((acc, item) => {
      const [key, value] = item.split('=');
      acc[key] = value;
      return acc;
    }, {});

    // Example: Handle the result
    if (result.Status === 'SUCCESS') {
      Alert.alert('Payment Success', `Transaction ID: ${result.txnId}`);
    } else {
      Alert.alert('Payment Failed', `Reason: ${result.Status}`);
    }
  };

  // Failure callback function
  const failureCallback = (error) => {
    console.log('Failure:', error);
    Alert.alert('Payment Error', 'The transaction failed or was canceled.');
  };

  // Function to initialize UPI payment
  const initiatePayment = () => {
    RNUpiPayment.initializePayment({
      vpa: 'someone@somewhere', // UPI ID of the payee
      payeeName: 'Payee Name', // Payee's name
      amount: '1', // Amount to be paid (as string)
      transactionRef: 'some-random-id' // Unique transaction reference ID
    }, successCallback, failureCallback);
  };

  return (
    <View style={{ marginTop: 100 }}>
      <Button title="Pay Now" onPress={initiatePayment} />
    </View>
  );
};

export default UpiPaymentExample;

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Button } from './Button';

const Wallet = ({ wallets }) => {
  const wallet = wallets.userWallets[0];

  console.log("Wallet : ", wallet);
  console.log("Embedded wallet : ", wallets.embedded.hasWallet);

  return (
    <View>
      {wallet && wallets.embedded.hasWallet ? (
        <View>
          {/* Optionally show wallet address or balance */}
          {/* <Text style={{color: 'white'}}>Logged in as: {wallet.address}</Text> */}
        </View>
      ) : (
        <Button onPress={() => wallets.embedded.createWallet()}>
          <Text style={{ color: 'white' }}>Create Wallet</Text>
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Add any specific styling here if needed
});

export default Wallet;

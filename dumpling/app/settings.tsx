import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecoilState } from 'recoil';
import { slippageAtom } from '~/state/atoms';

const Settings = () => {
  const [secureSpeed, setSecureSpeed] = useState('Normal');
  const [slippage, setSlippage] = useRecoilState(slippageAtom);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SETTINGS</Text>
      
      {/* <View style={styles.settingItem}>
        <View style={styles.settingIcon}>
          <Ionicons name="reload-circle-outline" size={24} color="white" />
        </View>
        <Text style={styles.settingText}>Secure Speed</Text>
      </View> */}
      
      {/* <TouchableOpacity 
        style={[styles.speedButton, { backgroundColor: '#FFFF00' }]}
        onPress={() => setSecureSpeed('Normal')}
      >
        <Text style={styles.buttonText}>Normal</Text>
      </TouchableOpacity> */}

      <View style={styles.settingItem}>
        <View style={styles.settingIcon}>
          <Ionicons name="swap-horizontal-outline" size={24} color="white" />
        </View>
        <Text style={styles.settingText}>Slippage</Text>
      </View>
      
      <View style={styles.slippageContainer}>
        {['0.3%', '0.5%', '1%'].map((value) => {
          
          let slip = 50;
          if(value == '0.3%'){
            slip = 30;
          }
          if(value == '1%'){
            slip = 100
          }

          return <TouchableOpacity 
            key={value}
            style={[
              styles.slippageButton, 
              slippage === slip && styles.slippageButtonActive

            ]}
            onPress={() => setSlippage(slip)}
          >
            <Text style={slippage == slip ? styles.slippageButtonActiveText : styles.slippageButtonText}>{value}</Text>
          </TouchableOpacity>
})}
      </View>

      {/* <View style={styles.settingItem}>
        <View style={styles.settingIcon}>
          <Ionicons name="notifications-outline" size={24} color="white" />
        </View>
        <Text style={styles.settingText}>Subscribed to...</Text>
      </View> */}

      <View style={styles.settingItem}>
        <View style={styles.settingIcon}>
          <Ionicons name="flag-outline" size={24} color="white" />
        </View>
        <Text style={styles.settingText}>Report Bugs & Errors</Text>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingIcon}>
          <Ionicons name="help-circle-outline" size={24} color="white" />
        </View>
        <Text style={styles.settingText}>I need help</Text>
      </View>

      {/* <View style={styles.settingItem}>
        <View style={styles.settingIcon}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </View>
        <Text style={styles.settingText}>Logout</Text>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  settingText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  speedButton: {
    backgroundColor: '#FFFF00',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  slippageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    color: '#000000',
  },
  slippageButton: {
    backgroundColor: '#333333',
    padding: 10,
    borderRadius: 20,
    width: '30%',
    alignItems: 'center',
  },
  slippageButtonActive: {
    backgroundColor: '#FFFF00',

 
  },
  slippageButtonText: {
    color: '#FFFFFF',
  },
  slippageButtonActiveText: {
    color : '#010409'
  }

});

export default Settings;
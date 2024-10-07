import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { VersionedTransaction, Connection, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import * as ImagePicker from 'expo-image-picker';

const RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=b7ff1b34-84d3-44de-a638-9b99150febc8";
const web3Connection = new Connection(RPC_ENDPOINT, 'confirmed');

const CreateCoinForm = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    description: '',
    image: null,
    twitterLink: '',
    telegramLink: '',
    website: '',
  });
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const handleInputChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData(prevState => ({
        ...prevState,
        image: result.assets[0]
      }));
    }
  };

  const handleSubmit = async () => {
    // Implementation remains the same as before
    console.log('Form submitted:', formData);
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
      </TouchableOpacity>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>name</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
          placeholderTextColor="#808080"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>ticker</Text>
        <TextInput
          style={styles.input}
          value={formData.ticker}
          onChangeText={(text) => handleInputChange('ticker', text)}
          placeholderTextColor="#808080"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => handleInputChange('description', text)}
          multiline
          placeholderTextColor="#808080"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>image</Text>
        <View style={styles.fileInputContainer}>
          <TouchableOpacity style={styles.chooseFileButton} onPress={handleImagePick}>
            <Text style={styles.chooseFileText}>Choose File</Text>
          </TouchableOpacity>
          <Text style={styles.noFileChosenText}>
            {formData.image ? formData.image.fileName : 'No file chosen'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity onPress={() => setShowMoreOptions(!showMoreOptions)}>
        <Text style={styles.hideMoreOptions}>
          {showMoreOptions ? 'Hide more options ▲' : 'Show more options ▼'}
        </Text>
      </TouchableOpacity>
      
      {showMoreOptions && (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>twitter link</Text>
            <TextInput
              style={styles.input}
              value={formData.twitterLink}
              onChangeText={(text) => handleInputChange('twitterLink', text)}
              placeholder="(optional)"
              placeholderTextColor="#808080"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>telegram link</Text>
            <TextInput
              style={styles.input}
              value={formData.telegramLink}
              onChangeText={(text) => handleInputChange('telegramLink', text)}
              placeholder="(optional)"
              placeholderTextColor="#808080"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>website</Text>
            <TextInput
              style={styles.input}
              value={formData.website}
              onChangeText={(text) => handleInputChange('website', text)}
              placeholder="(optional)"
              placeholderTextColor="#808080"
            />
          </View>
        </>
      )}
      
      <Text style={styles.tip}>Tip: coin data cannot be changed after creation</Text>
      
      <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
        <Text style={styles.createButtonText}>Create coin</Text>
      </TouchableOpacity>
      
      <Text style={styles.rewardText}>
        When your coin completes its bonding curve you receive 0.5 SOL
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1E1E1E',
  },
  goBack: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#FFEF00',
  },
  input: {
    borderWidth: 1,
    borderColor: '#3d3d3d',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#2C2C2C',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  fileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chooseFileButton: {
    backgroundColor: '#2C2C2C',
    padding: 10,
    borderRadius: 5,
  },
  chooseFileText: {
    color: '#FFFFFF',
  },
  noFileChosenText: {
    color: '#808080',
    marginLeft: 10,
  },
  hideMoreOptions: {
    color: '#FFEF00',
    fontSize: 16,
    marginVertical: 10,
  },
  tip: {
    color: '#FFFFFF',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: '#FFEF00',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  createButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rewardText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default CreateCoinForm;
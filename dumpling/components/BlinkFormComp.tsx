import React, { useState } from 'react';
import {
  ScrollView,
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { YStack } from 'tamagui';

interface FormData {
  title: string;
  imageURL?: string;
  description?: string;
  label: string;
  amount?: string;
  tokenName?: string;
  tokenSymbol?: string;
  price?: string;
  supply?: string;
}

interface FormErrors {
  title?: string;
  imageURL?: string;
  description?: string;
  label?: string;
  amount?: string;
  tokenName?: string;
  tokenSymbol?: string;
  price?: string;
  supply?: string;
}

interface FormProps {
  formData: FormData;
  formErrors: FormErrors;
  handleInputChange: (field: string, value: string) => void;
}

export const DonationForm: React.FC<FormProps> = ({ formData, formErrors, handleInputChange }) => {
  return (
    <KeyboardAvoidingView
      style={{}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80} // Adjust based on header or other factors
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled">
        <YStack space="$4">
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Campaign Title</Text>
            <TextInput
              style={[styles.input, formErrors.title ? styles.inputError : null]}
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              placeholder="Enter campaign title"
              placeholderTextColor="#666"
            />
            {formErrors.title && <Text style={styles.errorText}>{formErrors.title}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Target Amount (SOL)</Text>
            <TextInput
              style={[styles.input, formErrors.label ? styles.inputError : null]}
              value={formData.label}
              onChangeText={(text) => handleInputChange('label', text)}
              placeholder="Enter target amount"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
            {formErrors.label && <Text style={styles.errorText}>{formErrors.label}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Campaign Image URL</Text>
            <TextInput
              style={[styles.input, formErrors.imageURL ? styles.inputError : null]}
              value={formData.imageURL}
              onChangeText={(text) => handleInputChange('imageURL', text)}
              placeholder="Enter image URL"
              placeholderTextColor="#666"
            />
            {formErrors.imageURL && <Text style={styles.errorText}>{formErrors.imageURL}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                formErrors.description ? styles.inputError : null,
              ]}
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder="Enter campaign description"
              placeholderTextColor="#666"
              multiline={true}
              numberOfLines={4}
            />
            {formErrors.description && (
              <Text style={styles.errorText}>{formErrors.description}</Text>
            )}
          </View>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export const TokenSaleForm: React.FC<FormProps> = ({ formData, formErrors, handleInputChange }) => (
  <YStack space="$4">
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>Token Name</Text>
      <TextInput
        style={[styles.input, formErrors.title ? styles.inputError : null]}
        value={formData.title}
        onChangeText={(text) => handleInputChange('title', text)}
        placeholder="Enter token name"
        placeholderTextColor="#666"
      />
      {formErrors.title && <Text style={styles.errorText}>{formErrors.title}</Text>}
    </View>

    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>Token Symbol</Text>
      <TextInput
        style={[styles.input, formErrors.tokenSymbol ? styles.inputError : null]}
        value={formData.tokenSymbol}
        onChangeText={(text) => handleInputChange('tokenSymbol', text)}
        placeholder="Enter token symbol"
        placeholderTextColor="#666"
      />
      {formErrors.tokenSymbol && <Text style={styles.errorText}>{formErrors.tokenSymbol}</Text>}
    </View>

    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>Price per Token (SOL)</Text>
      <TextInput
        style={[styles.input, formErrors.label ? styles.inputError : null]}
        value={formData.label}
        onChangeText={(text) => handleInputChange('label', text)}
        placeholder="Enter price per token"
        placeholderTextColor="#666"
        keyboardType="numeric"
      />
      {formErrors.label && <Text style={styles.errorText}>{formErrors.label}</Text>}
    </View>

    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>Token Supply</Text>
      <TextInput
        style={[styles.input, formErrors.supply ? styles.inputError : null]}
        value={formData.supply}
        onChangeText={(text) => handleInputChange('supply', text)}
        placeholder="Enter total supply"
        placeholderTextColor="#666"
        keyboardType="numeric"
      />
      {formErrors.supply && <Text style={styles.errorText}>{formErrors.supply}</Text>}
    </View>

    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea, formErrors.description ? styles.inputError : null]}
        value={formData.description}
        onChangeText={(text) => handleInputChange('description', text)}
        placeholder="Enter token description"
        placeholderTextColor="#666"
        multiline={true}
        numberOfLines={4}
      />
      {formErrors.description && <Text style={styles.errorText}>{formErrors.description}</Text>}
    </View>
  </YStack>
);

export const NFTMintForm: React.FC<FormProps> = ({ formData, formErrors, handleInputChange }) => (
  <YStack space="$4">
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>NFT Collection Name</Text>
      <TextInput
        style={[styles.input, formErrors.title ? styles.inputError : null]}
        value={formData.title}
        onChangeText={(text) => handleInputChange('title', text)}
        placeholder="Enter collection name"
        placeholderTextColor="#666"
      />
      {formErrors.title && <Text style={styles.errorText}>{formErrors.title}</Text>}
    </View>

    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>Mint Price (SOL)</Text>
      <TextInput
        style={[styles.input, formErrors.label ? styles.inputError : null]}
        value={formData.label}
        onChangeText={(text) => handleInputChange('label', text)}
        placeholder="Enter mint price"
        placeholderTextColor="#666"
        keyboardType="numeric"
      />
      {formErrors.label && <Text style={styles.errorText}>{formErrors.label}</Text>}
    </View>

    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>Collection Image URL</Text>
      <TextInput
        style={[styles.input, formErrors.imageURL ? styles.inputError : null]}
        value={formData.imageURL}
        onChangeText={(text) => handleInputChange('imageURL', text)}
        placeholder="Enter collection image URL"
        placeholderTextColor="#666"
      />
      {formErrors.imageURL && <Text style={styles.errorText}>{formErrors.imageURL}</Text>}
    </View>

    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea, formErrors.description ? styles.inputError : null]}
        value={formData.description}
        onChangeText={(text) => handleInputChange('description', text)}
        placeholder="Enter collection description"
        placeholderTextColor="#666"
        multiline={true}
        numberOfLines={4}
      />
      {formErrors.description && <Text style={styles.errorText}>{formErrors.description}</Text>}
    </View>
  </YStack>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    color: 'white',
    marginBottom: 8,
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Poppins',
    borderWidth: 1,
    borderColor: '#444',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Poppins',
  },
});

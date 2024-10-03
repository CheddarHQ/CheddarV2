import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Dimensions, StyleSheet, Modal } from 'react-native';
import { YStack, XStack, Button, Separator } from 'tamagui';
import { Picker } from '~/components/Picker';
import Entypo from '@expo/vector-icons/Entypo';
// import { DonationForm, TokenSaleForm } from './BlinkFormComponents';
import { DonationForm, TokenSaleForm, NFTMintForm } from './BlinkFormComp';
import * as Clipboard from 'expo-clipboard';

interface BlinkModalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  selectedItem?: { id: number; name: string };
  setSelectedItem: (item: any) => void;
  formData: any;
  formErrors: any;
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: () => void;
  previousPage: () => void;
  nextPage: () => void;
}

export const BlinkModal: React.FC<BlinkModalProps> = ({
  modalOpen,
  setModalOpen,
  currentPage,
  setCurrentPage,
  selectedItem,
  setSelectedItem,
  formData,
  formErrors,
  handleInputChange,
  handleSubmit,
  previousPage,
  nextPage,
}) => {
  const windowHeight = Dimensions.get('window').height;
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState('Copy');

  const generateBlinkUrl = () => {
    const baseUrl = 'https://dial.to/?action=solana-action%3A';
    const apiUrl = 'https://sushi.cheddar-io.workers.dev/api/actions/memo/info';

    const params = new URLSearchParams({
      userName: 'JohnDoe', // This could be dynamic
      imageURI: formData.imageURL || 'https://example.com/default.jpg',
      title: formData.title,
      description: formData.description || '',
      label: formData.label,
    });

    const fullApiUrl = `${apiUrl}?${params.toString()}`;
    const encodedApiUrl = encodeURIComponent(fullApiUrl);
    const finalUrl = `${baseUrl}${encodedApiUrl}&cluster=mainnet`;

    setGeneratedUrl(finalUrl);
    return finalUrl;
  };

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(generatedUrl);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleFormSubmit = () => {
    const isSuccess = handleSubmit(); // Now isSuccess will be true or false

    if (isSuccess) {
      const url = generateBlinkUrl();
      setCurrentPage(2); // Move to success page
    } else {
      console.error('Form submission failed'); // Handle error case if needed
    }
  };
  const renderFormByCategory = () => {
    switch (selectedItem?.id) {
      case 0:
        return (
          <DonationForm
            formData={formData}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
          />
        );
      case 1:
        return (
          <TokenSaleForm
            formData={formData}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
          />
        );
      case 2:
        return (
          <NFTMintForm
            formData={formData}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
          />
        );
      default:
        return null;
    }
  };

  const renderSuccessPage = () => (
    <YStack space="$4">
      <Text style={styles.modalTitle}>Blink Generated Successfully!</Text>
      <YStack space="$2">
        <Text style={styles.urlLabel}>Your Blink URL:</Text>
        <View style={styles.urlContainer}>
          <Text style={styles.urlText} numberOfLines={3}>
            {generatedUrl}
          </Text>
        </View>
        <Button onPress={copyToClipboard} style={styles.copyButton}>
          <Text style={styles.copyButtonText}>{copyStatus}</Text>
        </Button>
      </YStack>
      <Button
        onPress={() => {
          setModalOpen(false);
          setCurrentPage(0);
        }}
        style={styles.closeModalButton}>
        <Text style={styles.closeModalButtonText}>Close</Text>
      </Button>
    </YStack>
  );

  return (
    <Modal
      visible={modalOpen}
      animationType="slide"
      onRequestClose={() => setModalOpen(false)}
      transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {currentPage === 0 && (
            <YStack>
              <XStack>
                <Text style={styles.modalTitle}>Blink Generator</Text>
              </XStack>
              <YStack marginTop={windowHeight / 4}>
                <XStack alignSelf="center">
                  <Text style={styles.categoryText}>Please choose your blink category</Text>
                </XStack>
                <Separator marginVertical={2} />
                <YStack
                  justifyContent="center"
                  alignItems="center"
                  alignContent="center"
                  alignSelf="center">
                  <Picker
                    data={blinkCategories}
                    onChange={setSelectedItem}
                    initialSelectedItem={blinkCategories[0]}
                  />
                </YStack>
                <Separator marginVertical={2} />
              </YStack>
            </YStack>
          )}

          {currentPage === 1 && (
            <YStack>
              <Text style={styles.modalTitle}>Blink Generator</Text>
              {renderFormByCategory()}
            </YStack>
          )}

          {currentPage === 2 && renderSuccessPage()}

          {currentPage < 2 && (
            <View style={styles.paginationButtons}>
              {currentPage > 0 && (
                <Button onPress={previousPage} style={styles.pageButton}>
                  Previous
                </Button>
              )}
              {currentPage === 1 ? (
                <Button onPress={handleFormSubmit} style={styles.pageButton}>
                  Generate Blink
                </Button>
              ) : (
                <Button onPress={nextPage} style={styles.pageButton}>
                  Next
                </Button>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setModalOpen(false);
              setCurrentPage(0);
            }}>
            <Entypo name="cross" size={40} color="white" marginTop={5} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const blinkCategories = [
  { id: 0, name: 'Donation' },
  { id: 1, name: 'Token Sale' },
  { id: 2, name: 'NFT Mint' },
  { id: 3, name: 'Lottery' },
];

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 1)',
    paddingTop: 50,
  },
  modalContent: {
    backgroundColor: 'black',
    padding: 20,
    borderRadius: 10,
    flex: 1,
  },
  modalTitle: {
    color: 'white',
    fontSize: 30,
    marginBottom: 30,
    fontFamily: 'Goldman',
  },
  categoryText: {
    color: '#808080',
    padding: 10,
    fontFamily: 'Poppins',
    fontSize: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'transparent',
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  pageButton: {
    padding: 10,
    backgroundColor: '#6200EE',
    borderRadius: 5,
  },
  urlLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  urlContainer: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  urlText: {
    color: 'white',
    fontSize: 14,
  },
  copyButton: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyButtonText: {
    color: 'white',
    fontSize: 16,
  },
  closeModalButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

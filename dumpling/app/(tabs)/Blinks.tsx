import React, { useState, useEffect } from 'react';
import { ScrollView, YStack, XStack, ZStack, Button, Separator } from 'tamagui';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { NavigationProp } from '@react-navigation/native';
import { PhantomBlinkIntegration } from '~/components/Blinksdemo';
import { FlatList, View, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { Dimensions, Modal } from 'react-native';
import { Text, StyleSheet } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import * as Clipboard from 'expo-clipboard';
import { actionsRegistry } from '~/data/BlinksData';
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { Picker } from '~/components/Picker';

interface PhantomAdapterProps {
  dappKeyPair: {
    publicKey: Uint8Array;
    secretKey: Uint8Array;
  };
  sharedSecret: Uint8Array | null;
  setSharedSecret: (secret: Uint8Array) => void;
  setSession: (session: string) => void;
  phantomWalletPublicKey: PublicKey | null;
  setPhantomWalletPublicKey: (key: PublicKey) => void;
  decryptPayload: (data: string, nonce: string, sharedSecret: Uint8Array) => any;
  encryptPayload: (payload: any, sharedSecret: Uint8Array) => [Uint8Array, Uint8Array];
  onConnectRedirectLink: string;
  session: string;
  navigation: NavigationProp<any>;
}

const Blinks: React.FC = () => {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [orientation, setOrientation] = useState('portrait');
  const headerHeight = useHeaderHeight();
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0); // New state for page navigation
  const [formData, setFormData] = useState({
    title: '',
    imageURL: '',
    description: '',
    label: '',
  });
  const [formErrors, setFormErrors] = useState({
    title: '',
    imageURL: '',
    description: '',
    label: '',
  });

  const validateForm = () => {
    const errors: any = {};
    if (!formData.title) errors.title = 'Title is required';
    if (!formData.imageURL) errors.imageURL = 'Image URL is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.label) errors.label = 'Label is required';
    return errors;
  };

  const navigation = useNavigation();
  const [selectedItem, setSelectedItem] = useState<(typeof blinkCategories)[0] | undefined>(
    undefined
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => setModalOpen(true)} style={{ marginLeft: 15 }}>
          <AntDesign name="pluscircle" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedText('Copied!');
    setTimeout(() => setCopiedText(''), 2000);
  };

  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    Dimensions.addEventListener('change', updateOrientation);
    return () => {};
  }, []);

  const adapterProps: PhantomAdapterProps = {
    dappKeyPair: {
      publicKey: new Uint8Array(),
      secretKey: new Uint8Array(),
    },
    sharedSecret: null,
    setSharedSecret: (secret: Uint8Array) => {},
    setSession: (session: string) => {},
    phantomWalletPublicKey: null,
    setPhantomWalletPublicKey: (key: PublicKey) => {},
    decryptPayload: (data: string, nonce: string, sharedSecret: Uint8Array) => {
      return {};
    },
    encryptPayload: (payload: any, sharedSecret: Uint8Array) => {
      return [new Uint8Array(), new Uint8Array()];
    },
    onConnectRedirectLink: 'your-redirect-link',
    session: '',
    navigation: {} as NavigationProp<any>,
  };

  const handlePress = (index: number) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const numColumns = orientation === 'portrait' ? 2 : 3;
  const gap = 10;
  const boxSize = (windowWidth - (numColumns + 1) * gap) / numColumns;
  const collapsedSize = (windowWidth - (numColumns + 1) * gap) / numColumns;
  const expandedHeight = windowHeight * 0.6;

  // Navigation through pages in modal
  const handleSubmit = () => {
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      // Submit logic here
      console.log('Form submitted:', formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setFormErrors({ ...formErrors, [field]: '' }); // Clear error when field changes
  };

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const previousPage = () => {
    setCurrentPage((prevPage) => (prevPage > 0 ? prevPage - 1 : 0));
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <FlatList
        data={actionsRegistry}
        keyExtractor={(item, index) => index.toString()}
        numColumns={numColumns}
        columnWrapperStyle={{ justifyContent: 'flex-start' }}
        contentContainerStyle={{ paddingTop: headerHeight + 10, paddingHorizontal: 10 }}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity
              onPress={() => handlePress(index)}
              style={[
                styles.box,
                {
                  width: boxSize,
                  height: boxSize,
                  marginRight: (index + 1) % numColumns === 0 ? 0 : gap,
                  marginBottom: gap,
                },
              ]}>
              <ZStack style={[styles.boxContent, { backgroundColor: item.color }]}>
                <PhantomBlinkIntegration urls={[item.url]} adapterProps={adapterProps} />
                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>{item.name}</Text>
                </View>
              </ZStack>
            </TouchableOpacity>
          );
        }}
      />

      <Modal
        visible={expandedIndex !== null}
        animationType="slide"
        onRequestClose={() => setExpandedIndex(null)}>
        {expandedIndex !== null && (
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <XStack paddingTop="$10">
                <PhantomBlinkIntegration
                  urls={[actionsRegistry[expandedIndex].url]}
                  adapterProps={adapterProps}
                />
              </XStack>
              <TouchableOpacity style={styles.closeButton} onPress={() => setExpandedIndex(null)}>
                <Entypo name="cross" size={24} color="white" />
              </TouchableOpacity>
              <XStack justifyContent="center" paddingTop="$4">
                <Button
                  onPress={() => copyToClipboard(actionsRegistry[expandedIndex].url)}
                  style={styles.copyButton}>
                  {copiedText || 'Copy Blink'}
                </Button>
              </XStack>
            </ScrollView>
          </View>
        )}
      </Modal>

      <Modal
        visible={modalOpen}
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
        transparent={true}>
        <View style={styles.newModalContainer}>
          <View style={styles.newModalContent}>
            {/* Display content based on currentPage */}
            {currentPage === 0 && (
              <YStack>
                <XStack>
                  <Text style={styles.newModalTitle}>Blink Generator</Text>
                </XStack>
                <YStack marginTop={windowHeight / 4}>
                  <XStack alignSelf="center">
                    <Text
                      style={{
                        color: '#808080',
                        padding: 10,
                        fontFamily: 'Poppins',
                        fontSize: 15,
                      }}>
                      Please choose your blink category
                    </Text>
                  </XStack>
                  <Separator marginVertical={2} />
                  <YStack
                    justifyContent="center"
                    alignItems="center"
                    alignContent="center"
                    alignSelf="center">
                    <Picker
                      data={blinkCategories}
                      onChange={(item) => {
                        setSelectedItem(item);
                      }}
                      initialSelectedItem={blinkCategories[0]}
                    />
                  </YStack>
                  <Separator marginVertical={2} />
                </YStack>
              </YStack>
            )}
            {currentPage === 1 && (
              <YStack>
                <Text style={styles.newModalTitle}>Blink Generator</Text>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Title</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.title}
                    onChangeText={(text) => handleInputChange('title', text)}
                    placeholder="Enter title"
                    placeholderTextColor="gray"
                  />
                  {formErrors.title ? (
                    <Text style={styles.errorText}>{formErrors.title}</Text>
                  ) : null}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Image URL</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.imageURL}
                    onChangeText={(text) => handleInputChange('imageURL', text)}
                    placeholder="Enter image URL"
                    placeholderTextColor="gray"
                  />
                  {formErrors.imageURL ? (
                    <Text style={styles.errorText}>{formErrors.imageURL}</Text>
                  ) : null}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Description</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.description}
                    onChangeText={(text) => handleInputChange('description', text)}
                    placeholder="Enter description"
                    placeholderTextColor="gray"
                  />
                  {formErrors.description ? (
                    <Text style={styles.errorText}>{formErrors.description}</Text>
                  ) : null}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Label</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.label}
                    onChangeText={(text) => handleInputChange('label', text)}
                    placeholder="Enter label"
                    placeholderTextColor="gray"
                  />
                  {formErrors.label ? (
                    <Text style={styles.errorText}>{formErrors.label}</Text>
                  ) : null}
                </View>

                <Button onPress={handleSubmit} style={styles.submitButton}>
                  Submit
                </Button>
              </YStack>
            )}
            {currentPage === 2 && (
              <YStack>
                <Text style={styles.newModalTitle}>New Blink - Page {currentPage + 1}</Text>
                <Text style={styles.pageText}>Page 1 Content</Text>
              </YStack>
            )}

            <View style={styles.paginationButtons}>
              {currentPage > 0 && (
                <Button onPress={previousPage} style={styles.pageButton}>
                  Previous
                </Button>
              )}
              {currentPage < 2 && (
                <Button onPress={nextPage} style={styles.pageButton}>
                  Next
                </Button>
              )}
            </View>

            <TouchableOpacity style={styles.closeButtontwo} onPress={() => setModalOpen(false)}>
              <Entypo name="cross" size={40} color="white" marginTop={5} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 10,
  },
  box: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  boxContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'black',
    paddingHorizontal: 15,
    paddingTop: 50,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'transparent',
  },
  closeButtontwo: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'transparent',
  },
  copyButton: {
    backgroundColor: '#6200EE',
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
  },
  newModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 1)',
    paddingTop: 50,
  },
  newModalContent: {
    backgroundColor: 'black',
    padding: 20,
    borderRadius: 10,
  },
  newModalTitle: {
    color: 'white',
    fontSize: 30,
    marginBottom: 30,
    fontFamily: 'Goldman',
  },
  pageText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40, // Shift buttons downward
  },
  pageButton: {
    padding: 10,
    backgroundColor: '#6200EE',
    borderRadius: 5,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    color: 'white',
    marginBottom: 5,
    fontSize: 18,
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#6200EE',
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});

export default Blinks;

// const movieGenres = [
//   {
//     id: 28,
//     name: 'Action',
//   },
//   {
//     id: 12,
//     name: 'Adventure',
//   },
//   {
//     id: 16,
//     name:

const blinkCategories = [
  {
    id: 0,
    name: 'Donation',
  },
  {
    id: 1,
    name: 'Token Sale',
  },
  {
    id: 2,
    name: 'NFT Mint',
  },
  {
    id: 3,
    name: 'Lottery',
  },
];

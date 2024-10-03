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
import Toast from 'react-native-toast-message';
import { blinkCategories, BlinkModal } from '~/components/BlinkModalComp';

export interface PhantomAdapterProps {
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
    tokenSymbol: '',
    supply: '',
  });
  const [formErrors, setFormErrors] = useState({
    title: '',
    imageURL: '',
    description: '',
    label: '',
  });

  const validateForm = (category: number, formData: any) => {
    const errors: any = {};

    switch (category) {
      case 0: // Donation
        if (!formData.title?.trim()) errors.title = 'Campaign title is required';
        if (!formData.label?.trim()) errors.label = 'Target amount is required';
        if (formData.label && isNaN(Number(formData.label)))
          errors.label = 'Amount must be a number';
        if (!formData.imageURL?.trim()) errors.imageURL = 'Target amount is required';
        if (!formData.imageURL?.trim()) errors.description = 'Target amount is required';

        break;

      case 1: // Token Sale
        if (!formData.title?.trim()) errors.title = 'Token name is required';
        if (!formData.tokenSymbol?.im()) errors.tokenSymbol = 'Token symbol is required';
        if (!formData.label?.trim()) errors.label = 'Price per token is required';
        if (formData.label && isNaN(Number(formData.label)))
          errors.label = 'Price must be a number';
        if (!formData.supply?.trim()) errors.supply = 'Token supply is required';
        if (formData.supply && isNaN(Number(formData.supply)))
          errors.supply = 'Supply must be a number';
        break;

      case 2: // NFT Mint
        if (!formData.title?.trim()) errors.title = 'Collection name is required';
        if (!formData.label?.trim()) errors.label = 'Mint price is required';
        if (formData.label && isNaN(Number(formData.label)))
          errors.label = 'Price must be a number';
        if (!formData.imageURL?.trim()) errors.imageURL = 'Collection image URL is required';
        break;
    }

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
    const errors = validateForm(0, formData);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      // Submit logic here
      console.log('Form submitted:', formData);
      setFormData({
        title: '',
        imageURL: '',
        description: '',
        label: '',
        tokenSymbol: '',
        supply: '',
      });
      // Optional: Uncomment these if you need them
      // setCurrentPage((prevPage) => prevPage + 1);
      // showToast();

      return true; // Return true if submission was successful
    }

    return false; // Return false if there were errors
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

      <BlinkModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage} // Add this prop
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        formData={formData}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        previousPage={previousPage}
        nextPage={nextPage}
      />
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

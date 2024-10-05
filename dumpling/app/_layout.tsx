import { dynamicClient } from '../client';
import { useReactiveClient } from '@dynamic-labs/react-hooks';
import { Ionicons } from '@expo/vector-icons';
import { Stack, SplashScreen as ExpoRouterSplashScreen } from 'expo-router';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';
import { RecoilRoot } from 'recoil';

import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useCallback, useRef, useState } from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PolyfillCrypto from 'react-native-webview-crypto';
import { StatusBar } from 'expo-status-bar';
// import LogoImg from "../assets/logos/GoPilotToken_BG.png";
// import { Colors } from "@/constants/Colors";

export default function Layout() {
  const { auth, sdk, wallets } = useReactiveClient(dynamicClient);
  const [isModalVisible, setModalVisible] = useState(false);
  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  const navigation = useNavigation();
  const drawerRef = useRef(null);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const insets = useSafeAreaInsets();

  const handleNewProposal = () => {
    setShouldOpenModal(true);
    // @ts-ignore: Expo Router's types might not be up to date
    // navigation.closeDrawer();
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const handleProfile = useCallback(() => {
    dynamicClient.ui.userProfile.show();
  }, []);

  console.log(wallets);

  useFocusEffect(
    useCallback(() => {
      if (shouldOpenModal) {
        setModalVisible(true);
        setShouldOpenModal(false);
      }
    }, [shouldOpenModal])
  );
  const CustomDrawerContent = (props: any) => {
    return (
      <>
        <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
          <View style={[styles.drawerHeader, { paddingTop: 16 + insets.top }]}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userText}>Ramesha</Text>
            <Text style={styles.userIdText}>39G....ozcNj</Text>
          </View>
          <DrawerItemList {...props} />
        </DrawerContentScrollView>
        {/* <TouchableOpacity
          style={[
            styles.newProposalButton,
            { marginBottom: 16 + insets.bottom },
          ]}
          onPress={handleNewProposal}
        >
          <Text style={styles.buttonText}>New Proposal</Text>
        </TouchableOpacity> */}
      </>
    );
  };

  return (
    <View
      style={{
        flex: 1,
      }}>
      <dynamicClient.reactNative.WebView />
      {/* <PolyfillCrypto /> */}
      {!wallets.primary && (
        <View style={styles.LoginContainer}>
          <Text style={styles.HeaderLoginTxt}>Get started with $GO</Text>
          {/* <Text>The Governance framework for modern mobility</Text> */}
          <TouchableOpacity style={styles.loginButton} onPress={() => dynamicClient.ui.auth.show()}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      )}
      {wallets.primary && (
        <RecoilRoot>
          <TamaguiProvider config={config}>
            <StatusBar style="auto" />
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                  name="settings"
                  options={{ headerShown: false, presentation: 'modal' }}
                />
                <Stack.Screen name="thing" options={{ headerShown: false }} />
                <Stack.Screen name="loginPage" options={{ headerShown: false }} />
                <Stack.Screen
                  name="crypto"
                  options={{ headerShown: false, presentation: 'modal' }}
                />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="userPage" options={{ headerShown: false }} />
                <Stack.Screen
                  name="cryptoGraph"
                  options={{ headerShown: false, presentation: 'modal' }}
                />
              </Stack>
            </GestureHandlerRootView>
          </TamaguiProvider>
        </RecoilRoot>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
  },
  welcomeText: {
    fontSize: 14,
    color: '#888',
  },
  userText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  userIdText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  newProposalButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    margin: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeIconButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
  Profile: {
    color: 'black',
    fontSize: 16,
    marginLeft: 10,
  },
  LogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    marginBottom: 32,
  },
  LoginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // padding: 16,
    gap: 24,
  },
  loginButton: {
    paddingVertical: 12,
    color: '#000',
    backgroundColor: '#000',
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '50%',
    display: 'flex',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logo: {
    width: '100%',
    height: 200,
  },
  HeaderLoginTxt: {
    fontSize: 24,
    marginBottom: 0,
    paddingBottom: 0,
  },
});

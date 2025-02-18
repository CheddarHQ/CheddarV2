import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '~/lib/supabase';
import { Link, useNavigation } from 'expo-router';
import { Button } from './Button';
import { useRecoilState } from 'recoil';
import { userAtom } from '~/state/atoms';
import axios from "axios"
import { useDynamic } from '~/client';

export interface UserProfile {
  username: string;
  name: string;
  email: string;
  avatar_url: string;
  id: string;
  created_at: string;
  bio: string;
  last_login: string;
}

interface AuthResponse {
  session: any;
  profile: UserProfile;
}

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({
  scheme: 'cheddarchat',
  path: 'auth/callback',
});

export const createSessionFromUrl = async (url: string): Promise<AuthResponse | undefined> => {
  const params = new URLSearchParams(url.split('#')[1]);

  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');

  if (!access_token || !refresh_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;

  const tokenPayload = JSON.parse(atob(access_token.split('.')[1]));

  const userProfile: UserProfile = {
    username: tokenPayload.user_metadata.user_name,
    name: tokenPayload.user_metadata.full_name,
    email: tokenPayload.email,
    avatar_url: tokenPayload.user_metadata.avatar_url,
    id: tokenPayload.user_metadata.sub,
    created_at: "",
    last_login: new Date().toISOString(),
    bio: tokenPayload.user_metadata.full_name,
  };
  console.log('Extracted user profile:', userProfile);

  const createUser = async () => {
    try {
      const payload = {
        id: userProfile.id,
        username: userProfile.username,
        bio: userProfile.bio,
        pub_address: "",
        last_login: userProfile.last_login,
        profile_image_url: userProfile.avatar_url,
        created_at: userProfile.created_at,
      };

      console.log('Creating user:', payload);

      const response = await axios.post('https://wasabi.cheddar-io.workers.dev/api/user', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("User created successfully");
      console.log('Response:', response.data);
    } catch (error) {
      console.log("User might already exist");
      console.log('Error creating user:', error);
    }
  };

  createUser();

  return { session: data.session, profile: userProfile };
};

const performOAuth = async () => {
  console.log('Redirect URL:', redirectTo);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'twitter',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  console.log('Auth URL:', data?.url);

  const res = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectTo);

  if (res.type === 'success' && res.url) {
    return res.url;
  }
  return null;
};

export default function Auth() {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useRecoilState(userAtom);

  console.log("User Profile: ", userProfile);

  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      createSessionFromUrl(url)
        .then((response) => {
          console.log('User Profile:', response);
          if (response) {
            setUserProfile(response.profile);
          }
        })
        .catch((error) => console.error(error));
    }
  }, [url]);

  const handleSignIn = async () => {
    try {
      const response = await performOAuth();
      if (response) {
        const sessionData = await createSessionFromUrl(response);
        if (sessionData && sessionData.profile) {
          setUserProfile(sessionData.profile);
        }
      }
    } catch (error) {
      console.error('Error during sign in:', error);
    }
  };

  // const fetchBalance = async () => {
  //   if (wallet && wallet.getBalance()) {
  //     try {
  //       const walletBalance = await wallet.getBalance();
  //       console.log("Balance :", walletBalance)// Update state with the balance
  //     } catch (error) {
  //       console.error('Error fetching balance:', error);
  //     }
  //   }
  // };

  const { auth, wallets, ui } = useDynamic();

const showUserProfile = ()=> {
    ui.userProfile.show()
  }
  const wallet = wallets.userWallets[0];
  console.log("Wallet : ", wallet)

  console.log("Embedded wallet : ", wallets.embedded.hasWallet)

  // useEffect(()=>{
  //   if(wallet.chain){
  //     fetchBalance()
      
  //   }
  // })

  // useEffect(() => {
  //   const fetchBalance = async () => {
  //     if (wallet && wallet.getBalance) {
  //       try {
  //         const walletBalance = await wallet.getBalance();
  //         setBalance(walletBalance); // Update the state with the balance
  //       } catch (error) {
  //         console.error('Error fetching balance:', error);
  //       }
  //     }
  //   };

  //   fetchBalance(); // Call the function to fetch balance when the component mounts
  // }, [wallet]);



  return (
    <View>
      {userProfile ? (
        <View style={styles.container}>
          <View>
            {wallet && wallets.embedded.hasWallet ? (
              <View>
                {/* <Text style={{color : "white"}}>Logged in as: {wallet.address}</Text> */}
             </View>
            ) : (
              <Button onPress={() => wallets.embedded.createWallet()}>
                <Text  style={{color : "white"}}>Create Wallet</Text>
              </Button>
            )}
          </View>
          <Text style={styles.title}>Welcome! {userProfile.name}</Text>
          <Link
            href={{
              pathname: '/(tabs)/analytics',
              params: { username: userProfile.username },
            }}
            asChild>
            <Button title="Enter" color="#007AFF" />
          </Link>
          <Button title= "showProfile" onPress={showUserProfile}/>
        </View>
      ) : (
        <Button onPress={handleSignIn} title="Sign in" color="#007AFF" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Goldman',
  },
});

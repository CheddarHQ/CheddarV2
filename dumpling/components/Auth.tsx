import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '~/lib/supabase';
import { Link, useNavigation } from 'expo-router';
import { Image } from 'tamagui';
import { Button } from './Button';
import { useRecoilState } from 'recoil';
import { userAtom } from '~/state/atoms';
import { MyButton } from '~/app/cryptoGraph/[id]';
import axios from "axios"

export interface UserProfile {
  username: string;
  name: string;
  email: string;
  avatar_url: string;
  id: string;
  created_at : string;
  bio : string;
  last_login : string

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

const createSessionFromUrl = async (url: string): Promise<AuthResponse | undefined> => {
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
    // created_at : tokenPayload.user.app_metadata.created_at,
    // last_login : tokenPayload.user.app_metadata.last_sign_in_at,
    created_at : "",
    last_login : new Date().toISOString(),
    bio : tokenPayload.user_metadata.full_name  //setting fullname as the bio for now
    

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

      console.log("User created successfully")
      console.log('Response:', response.data);
    } catch (error) {
      console.log("User might already exist")
      console.log('Error creating user:', error);
    }
  }

  createUser();

  // Extract info from this
  /*
Extracted user profile: {"avatar_url": "https://pbs.twimg.com/profile_images/1809189990599127040/mti8M7jE_normal.jpg", "email": "sarthakkapila27x@gmail.com", "id": "4c75869e-1204-41f1-a051-d40861e855e3", "name": "Sarthak Kapila", "username": "sarthakkapila0"}
*/


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

  console.log("User Profile : ", userProfile);

  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      createSessionFromUrl(url)
        .then((response) => {
          console.log('User Profile :', response);
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
        //@ts-ignore
      }
    } catch (error) {
      console.error('Error during sign in:', error);
    }
  };
  return (
    <View>
      {userProfile.name ? (
        <View style={styles.container}>
          <Text style={styles.title}>Welcome! {userProfile.name}</Text>
          <Link
            href={{
              pathname: '/(tabs)/Chat',
              params: { username: userProfile.username },
            }}
            asChild>
            <Button title="Enter chat" color="#007AFF" />
          </Link>
        </View>
      ) : (
        <View>
          <Button onPress={handleSignIn} title="Sign in with Twitter" color="#007AFF" />
        </View>
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
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Goldman',
  },
  profileContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
});

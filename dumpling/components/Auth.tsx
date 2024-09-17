import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '~/lib/supabase';
import { Link } from 'expo-router';
import { Image } from 'tamagui';
import { Button } from './Button';
interface UserProfile {
  username: string;
  name: string;
  email: string;
  avatar_url: string;
  id: string;
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

  // Set session in Supabase
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;

  // Extract user profile data from the JWT token
  const tokenPayload = JSON.parse(atob(access_token.split('.')[1]));
  const userProfile: UserProfile = {
    username: tokenPayload.user_metadata.user_name,
    name: tokenPayload.user_metadata.full_name,
    email: tokenPayload.email,
    avatar_url: tokenPayload.user_metadata.avatar_url,
    id: tokenPayload.sub,
  };
  console.log("Extracted user profile:", userProfile);

  return { session: data.session, profile: userProfile };
};

const performOAuth = async () => {
  console.log("Redirect URL:", redirectTo);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "twitter",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  console.log("Auth URL:", data?.url);

  const res = await WebBrowser.openAuthSessionAsync(
    data?.url ?? "",
    redirectTo
  );
  console.log("Auth session result:", res);

  if (res.type === "success" && res.url) {
    return res.url;
  }
  return null;
};

export default function Auth() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Handle linking into app from email app.
  const url = Linking.useURL();
  useEffect(() => {
    if (url) {
      createSessionFromUrl(url)
        .then((response) => {
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
      console.error("Error during sign in:", error);
    }
  };

  return (
    <View>
  {userProfile ? (
        <View style={styles.container}>
          <Image 
            source={{ uri: userProfile.avatar_url }} 
            style={styles.avatar}
          />
        <Text style={styles.title}>Welcome! {userProfile.name}</Text>
          <Link 
            href={{
              pathname: '/thing',
              params: { username: userProfile.username }
            }} 
            asChild
          >
            <Button title="Enter chat" color="#007AFF" />
          </Link>
        </View>
      ) : (
        <Button 
          onPress={handleSignIn} 
          title="Sign in with Twitter" 
          color="#007AFF"
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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
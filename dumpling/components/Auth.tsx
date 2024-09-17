import React, { useState, useEffect } from "react";
import { Button, Text, View, StyleSheet } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "~/lib/supabase";
import { Link } from 'expo-router';
import {Image } from 'tamagui';
import ForwardedButton from "./ForwardedButton";

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
  scheme: "cheddarchat",
  path: "auth/callback",
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
    id: tokenPayload.sub,
  };

  console.log("Extracted user profile:", userProfile);
// Extract info from this 
/*
Extracted user profile: {"avatar_url": "https://pbs.twimg.com/profile_images/1809189990599127040/mti8M7jE_normal.jpg", "email": "sarthakkapila27x@gmail.com", "id": "4c75869e-1204-41f1-a051-d40861e855e3", "name": "Sarthak Kapila", "username": "sarthakkapila0"}
*/
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
    const response = await createSessionFromUrl(res.url);
    if (response) {
      return response.profile.username;
    }
  }
  return null;
};
export default function Auth() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const url = Linking.useURL();
  useEffect(() => {
    if (url) {
      createSessionFromUrl(url).then(response => {
        console.log('User Profile:', response?.profile);
        if (response) {
          setUserProfile(response.profile);
        }
      }).catch(error => console.error(error));
    }
  }, [url]);

  const handleSignIn = async () => {
    try {
      const response = await performOAuth();
      if (response) {
        setUserProfile(response.profile);
      }
    } catch (error) {
      console.error("Error during sign in:", error);
    }
  };

  return (
    <View>
      {userProfile ? (
        <View>
          <Image source={{ uri: userProfile.avatar_url }} style={{ width: 100, height: 100 }} />
          <Text>Welcome, {userProfile.name}!</Text>
          <Text>Username: {userProfile.username}</Text>
          <Text>Email: {userProfile.email}</Text>
          <Text>User ID: {userProfile.id}</Text>
          <Link href={{
            pathname: '/thing',
            params: { username: userProfile.username }
          }} asChild>
            <Button title="Enter the chat" />
          </Link>
        </View>
      ) : (
        <Button onPress={handleSignIn} title="Sign in with Twitter" />
      )}
    </View>
  );
}
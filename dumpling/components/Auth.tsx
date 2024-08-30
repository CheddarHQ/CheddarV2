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

  // Set session in Supabase
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;

  // Extract user profile data from the JWT token
  const tokenPayload = JSON.parse(atob(access_token.split('.')[1]));
  const userProfile = {
    username: tokenPayload.user_metadata.user_name,
    // Add other profile fields as needed
  };

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
      console.log('User Profile:', response.profile);
      return response.profile.username;
    }
  }
  return null;
};

export default function Auth() {
  const [userName, setUserName] = useState<string | null>(null);
  
  // Handle linking into app from email app.
  const url = Linking.useURL();
  useEffect(() => {
    if (url) {
      createSessionFromUrl(url).then(response => {
        if (response) {
          setUserName(response.profile.username); 
        }
      }).catch(error => console.error(error));
    }
  }, [url]);

  const handleSignIn = async () => {
    try {
      const username = await performOAuth();
      if (username) {
        setUserName(username);
      }
    } catch (error) {
      console.error("Error during sign in:", error);
    }
  };

  return (
    <View>
            {userName ? (
                 <Link href={{
                  pathname : '/thing',
                  params : {username : userName}
                  }} asChild>
                <Button title="Enter the chat"  />
               </Link>
            ) : (
                <Button onPress={handleSignIn} title="Sign in with Twitter" />
            )}
    </View>
  );
}


const styles = StyleSheet.create({
  welcomeText: {
      color: 'white', // Set the text color to white
  },
});
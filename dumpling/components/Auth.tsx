import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, Text } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button } from '@rneui/themed';
import { Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest, ResponseType } from 'expo-auth-session';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://twitter.com/i/oauth2/authorize',
  tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
  revocationEndpoint: 'https://api.twitter.com/2/oauth2/revoke',
};

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const redirectUri = makeRedirectUri({
    scheme: 'dumpling'
  });

  console.log("Redirect URI: ", redirectUri);
  

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'TjBQcnk5RVU2aHdLZVFmdkFRcW46MTpjaQ',
      redirectUri,
      usePKCE: true,
      responseType: ResponseType.Token,
    },
    discovery
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error('Error fetching session:', error);
      setSession(session);
      console.log('Session:', session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      console.log('Session:', session);
    });
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      handleSignInWithToken(access_token);
    }
  }, [response]);

  async function handleSignInWithToken(token: string) {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: redirectUri,
      },
    });

    setLoading(false);

    if (error) {
      console.error('Error during sign-in:', error);
      Alert.alert('Error', 'Unable to sign in with Twitter');
    } else {
      console.log('Signed in with Twitter:', data);
    }
  }

  async function signInWithTwitter() {
    setLoading(true);
    const result = await promptAsync();
    if (result.type !== 'success') {
      Alert.alert('Error', 'Unable to sign in with Twitter');
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);

    if (error) {
      console.error('Error during sign out:', error);
      Alert.alert('Error', 'Unable to sign out');
    }
  }

  return (
    <View style={styles.container}>
      {session ? (
        <>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Button
            title={loading ? 'Signing out...' : 'Sign Out'}
            onPress={signOut}
            loading={loading}
            buttonStyle={styles.signOutButton}
          />
        </>
      ) : (
        <>
          <Text style={styles.welcomeText}>Sign in with Twitter</Text>
          <Button
            title={loading ? 'Signing in...' : 'Sign In with Twitter'}
            onPress={signInWithTwitter}
            loading={loading}
            buttonStyle={styles.signInButton}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: '#1DA1F2',
  },
  signOutButton: {
    backgroundColor: '#d9534f',
  },
});
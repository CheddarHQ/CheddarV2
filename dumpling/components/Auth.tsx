import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button } from '@rneui/themed'

export default function Auth() {
  const [loading, setLoading] = useState(false)

  async function signInWithTwitter() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: 'https://byyfnvlykcydmyailevw.supabase.co/auth/v1/callback',
      },
    });

    setLoading(false);

    if (error) {
      console.error('Error during sign in:', error);
      Alert.alert('Error', 'Unable to sign in with Twitter');
    } else {
      console.log('Signed in with Twitter:', data);
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
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Signing in...' : 'Sign in with Twitter'}
          onPress={signInWithTwitter}
          icon={{
            type: 'font-awesome',
            name: 'twitter',
            color: 'white',
            size: 20,
          }}
          buttonStyle={{ backgroundColor: '#f6d535' }}
          loading={loading}
          disabled={loading}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})


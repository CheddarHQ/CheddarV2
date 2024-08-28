import { Button, Text, View } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "~/lib/supabase";
import React from "react";

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

const createSessionFromUrl = async (url: string): Promise<{ session: any; profile: any } | undefined> => {
  const params = new URLSearchParams(url.split('?')[1]);

  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');

  if (!access_token || !refresh_token) return;

  // Set session in Supabase
  const { data, error } = await supabase.auth.setSession({
    access_token: access_token, // Ensure access_token is a string
    refresh_token: refresh_token, // Ensure refresh_token is a string
  });
  if (error) throw error;

  // Fetch user profile data from Twitter
  const userProfileResponse = await fetch('https://api.twitter.com/2/me', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  const userProfile = await userProfileResponse.json();

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

  if (res.type === "success") {
    const { url } = res;
    const response = await createSessionFromUrl(url);
    if (response) {
      console.log('User Profile:', response.profile);
    }
  }
};

export default function Auth() {
  const [userName, setUserName] = React.useState<string | null>(null);
  
  // Handle linking into app from email app.
  const url = Linking.useURL();
  React.useEffect(() => {
    if (url) {
      createSessionFromUrl(url).then(response => {
        if (response) {
          setUserName(response.profile.username); 
        }
      }).catch(error => console.error(error));
    }
  }, [url]);

  return (
    <View>
      <Button onPress={performOAuth} title="Sign in with Twitter" />
      {userName ? <Text>Welcome, {userName}!</Text> : null}
    </View>
  );
}

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import {
    useOkto,
    type OktoContextType,
} from 'okto-sdk-react-native';
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

// Your OAuth2 config
const CLIENT_ID = "172666057504-do9d56pkshq0i4htdbq7bicrpq89bbft.apps.googleusercontent.com";
const DISCOVERY = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

const LoginScreen = () => {
    const navigation = useNavigation();
    const [loggedIn, setLoggedIn] = useState(false);
    const { authenticate } = useOkto() as OktoContextType;

    // Disable proxy and use custom scheme for standalone app
    const redirectUri = AuthSession.makeRedirectUri({
        useProxy: false,
        scheme: 'cheddarchat',  
    });
    console.log("Redirect URI:", redirectUri);

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: CLIENT_ID,
            redirectUri: redirectUri,
            scopes: ['openid', 'profile', 'email'],
            responseType: 'id_token',
        },
        DISCOVERY
    );

    useEffect(() => {
        if (response?.type === 'success') {
            const id_token = response.params.id_token;

            // Authenticate using Okto SDK
            authenticate(id_token, (result, error) => {
                if (result) {
                    console.log('Authentication successful');
                    setLoggedIn(true);
                } else if (error) {
                    console.error('Authentication error:', error);
                }
            });
        }
    }, [response]);

    return (
        <View style={styles.container}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: 'center' }}>
                <Text>Welcome to</Text>
                {/* <Image
                    source={require('../assets/okto.png')}
                    style={{ width: 200, height: 100 }}
                    resizeMode="contain"
                /> */}
            </View>
            <View style={{ flex: 1 }}>
                {loggedIn ? (
                    <Link
                        href={{
                            pathname: '/UserProfileScreen',
                        }}
                        asChild>
                        <Button title="Enter chat" color="#007AFF" />
                    </Link>
                ) : (
                    <Button
                        title="Sign in with Google"
                        disabled={!request}
                        onPress={() => promptAsync()}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default LoginScreen;

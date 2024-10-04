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

const LoginScreen = () => {
    const navigation = useNavigation();
    const [loggedIn, setLoggedIn] = useState(false);
    const { authenticate } = useOkto() as OktoContextType;
    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
    console.log("redirectUri :", redirectUri)
;
    const CLIENT_ID = "172666057504-do9d56pkshq0i4htdbq7bicrpq89bbft.apps.googleusercontent.com";
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSignIn = async () => {
        setIsLoading(true);
        const id_token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjI4YTQyMWNhZmJlM2RkODg5MjcxZGY5MDBmNGJiZjE2ZGI1YzI0ZDQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDg0ODY5NjI0OTczMTA1NTk2NjQiLCJlbWFpbCI6Inl0LmFybW52cm1hMTBAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJFbXVobHlVZEZrZmxwY2tKN3RkYTJRIiwiaWF0IjoxNzI4MDM4MjM5LCJleHAiOjE3MjgwNDE4Mzl9.z2JJuNk1hQzqcvPtT1_un6XobP_sGtzp1bjE4UqayVUgDMrdxVBdRtAbD1ErfT2439JAAmcKFyKCR0Gm_wFFYH-axiRC9PmMUXj9bbt53FMW2c39WYwNWRzp502_M0V0xedEsO_s-9ukn8JXLazmaLvthxWy8dcEsKnQaNtnh2zUVa_iOXOTosyzIwjzdWsFhzjd66MGWu8TD74i4gEoUOQl3pZKa2WrnivipJgAkCaB4bfXE2bW9x9jXoAjMixOdfTlNIBWb5gE93NMe2lFrMVDuBohSgyc3jaxCpZDARcKGv-afihPy1ZYhW-_pB__mV3pzCvjVu9kZc387WS9LA"; // Use the actual ID token

        authenticate(id_token, (result, error) => {
            setIsLoading(false);
            if (result) {
                console.log('Authentication successful');
                setLoggedIn(true);
            } else if (error) {
                console.error('Authentication error:', error);
            }
        });
    };

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
                {isLoading ? (
                    <View>
                        <Text>Trying to login...</Text>
                    </View>
                ) : loggedIn ? (
                    <Link
                        href={{
                        pathname: '/UserProfileScreen'

                        }}
                        asChild>
                        <Button title="Enter chat" color="#007AFF" />
                    </Link>
                ) : (
                    <Button title="Sign in with Google" onPress={handleSignIn} />
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

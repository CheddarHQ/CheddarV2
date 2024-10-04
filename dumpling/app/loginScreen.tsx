import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';
import { useOkto, type OktoContextType, type User,type Wallet } from 'okto-sdk-react-native';



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
    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
    console.log("redirectUri :", redirectUri)
    const [isLoading, setIsLoading] = useState<boolean>(false);


    const { getUserDetails } = useOkto() as OktoContextType;
    const [userDetails, setUserDetails] = useState<User | null>(null);

    const { getWallets } = useOkto() as OktoContextType;
    const [userWallets, setUserWallets] = useState<Wallet[]>([]);

    const { showWidgetSheet, closeBottomSheet } = useOkto() as OktoContextType;
;
    // // Disable proxy and use custom scheme for standalone app
    // const redirectUri = AuthSession.makeRedirectUri({
    //     useProxy: false,
    //     scheme: 'cheddarchat',  
    // });
    // console.log("Redirect URI:", redirectUri);

    // const [request, response, promptAsync] = AuthSession.useAuthRequest(
    //     {
    //         clientId: CLIENT_ID,
    //         redirectUri: redirectUri,
    //         scopes: ['openid', 'profile', 'email'],
    //         responseType: 'id_token',
    //     },
    //     DISCOVERY
    // );

    // useEffect(() => {
    //     if (response?.type === 'success') {
    //         const id_token = response.params.id_token;

    //         // Authenticate using Okto SDK
    //         authenticate(id_token, (result, error) => {
    //             if (result) {
    //                 console.log('Authentication successful');
    //                 setLoggedIn(true);
    //             } else if (error) {
    //                 console.error('Authentication error:', error);
    //             }
    //         });
    //     }
    // }, [response]);

    const handleSignIn = async () => {
        setIsLoading(true);
        const id_token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjI4YTQyMWNhZmJlM2RkODg5MjcxZGY5MDBmNGJiZjE2ZGI1YzI0ZDQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDg0ODY5NjI0OTczMTA1NTk2NjQiLCJlbWFpbCI6Inl0LmFybW52cm1hMTBAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiI1dUhuVk5kMWZBdnRlS09EY3U2QUdRIiwiaWF0IjoxNzI4MDQyNTg2LCJleHAiOjE3MjgwNDYxODZ9.kAhrMOJ8znntsg4G96AHyegzIOzi-2zAjLtm_XoMp843C0xJVaXK6XY5NYRHQ_ELpOykdzIQaICxgYE_in4bEIsI43ytA1dXJh0N_Wos_kmcAJe2NNQT2RxUKy2rIhTwpCKv2yNw5DfR1r9fqF1QmqEtaH-0qWJIZ2ti7KXh8_5mKSbZBXQkR9FU1NQpUPiBWNlPL-EItER5FJ5frnCHaS7eI8jK3kgDl5bA0ueYpCQrzO-uNR6yP2wmNxMzo4Bra9PYK__OR-TYRbYh7ozQSAw7G196OKtFo2W-dSg9_ULj7QjqjO4H8eGHlFhVZLpOzkeelzi8mUGSYQfaErOB7w"; 
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
                {loggedIn ? (
                    <View>
                    <Link
                        href={{
                            pathname: '/UserProfileScreen',
                        }}
                        asChild>
                        <Button title="Enter chat" color="#007AFF" />
                    </Link>

                    <Button
                    title="Open Okto Profile"
                    onPress={() => {
                    showWidgetSheet();
                    }}
                    />
                </View>
                    
                ) : (
                    <Button
                        title="Sign in with Google"
                        
                        onPress={() => handleSignIn()}
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

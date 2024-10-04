import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import {
    init,
    authenticate,
    getPortfolio,
    getSupportedNetworks,
    getSupportedTokens,
    getUserDetails,
    getWallets,
    logout,
    orderHistory,
    transferFunds,
    getNFTOrderDetails,
    transferNFT,
  } from "rn-okto-sdk";


// Make sure to replace with your own values
 // Your client ID
const REDIRECT_URI = AuthSession.makeRedirectUri({ useProxy: true });

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
    const CLIENT_ID ="172666057504-do9d56pkshq0i4htdbq7bicrpq89bbft.apps.googleusercontent.com";

    console.log("clientID :",CLIENT_ID )
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSignIn = async () => {
        setIsLoading(true);

        // Create a new auth request
        // const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        //     `client_id=${CLIENT_ID}&` +
        //     `redirect_uri=${REDIRECT_URI}&` +
        //     `response_type=id_token&` +
        //     `scope=email`;

        // const result = await AuthSession.startAsync({ authUrl });

   
            const  id_token  = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjI4YTQyMWNhZmJlM2RkODg5MjcxZGY5MDBmNGJiZjE2ZGI1YzI0ZDQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDg0ODY5NjI0OTczMTA1NTk2NjQiLCJlbWFpbCI6Inl0LmFybW52cm1hMTBAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJGVDVJRTNVbnFmaTJ0bEU3VEQ3UkRnIiwiaWF0IjoxNzI4MDMyNDMwLCJleHAiOjE3MjgwMzYwMzB9.WxGiF-6DvB3r0RhU0twQYVng2KXmHH2a7dq-uAOY60KZnlZ72DYMGijUniTW5bFde0woS5F3NG243ZqGZRViByc2G2f9Vix-PzXFGzPh29jp74hutivo1GXR1E72IbG7qITIxKAcpyujaAldxNDNoKKqsOTQ0q6K8mS4J2yDtGkxsAoOkJKfnAsUrhu41EQBX0A6xLGNByiRCzjA5_UEC8-2XMpCD78GWv5kLWvwcquqwouetZ3ZYWIShMxDF3dOhkzy5pcHjBLoy0XtzY_AHJJH1Nsny_xucEB8BZhbZnBu_mCERo6Htf25afKG9LAoDOjexeyo5J8uyFZzuCmpzA"

            // Authenticate with your SDK
            authenticate(id_token, (result, error) => {
                setIsLoading(false);
                if (error) {
                    console.error("Authentication error", error);
                    return;
                }

                if (result) {
                    navigation.navigate("UserProfile");
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

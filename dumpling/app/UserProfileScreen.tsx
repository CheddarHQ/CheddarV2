import { useOkto, type OktoContextType, type User,type Wallet } from 'okto-sdk-react-native';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from "react-native";


import { NavigationProp } from "@react-navigation/native";


const UserProfileScreen = () => {

    const { getUserDetails } = useOkto() as OktoContextType;
    const [userDetails, setUserDetails] = useState<User | null>(null);

    const { getWallets } = useOkto() as OktoContextType;
    const [userWallets, setUserWallets] = useState<Wallet[]>([]);

    const { showWidgetSheet, closeBottomSheet } = useOkto() as OktoContextType;

    useEffect(() => {
        getUserDetails()
              .then((result) => {
                setUserDetails(result);
              })
              .catch((error) => {
                console.error(`error:`, error);
              });
    }, []);

    useEffect(() => {
        getWallets()
              .then((result) => {
                setUserWallets(result);
              })
              .catch((error) => {
                console.error(`error:`, error);
              });
    }, []);
   
   

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <Text>User Details</Text>
            {userDetails && <View>
                <Text>{userDetails.user_id}</Text>
                <Text>{userDetails.email}</Text>
            </View>}

            <Button
                title="Open Okto Profile"
                onPress={() => {
                showWidgetSheet();
                }}
            />

            <Text>User Wallets</Text>
            <View>
                {userWallets.map((wallet, index) => (
                    <View key={index} style={{ marginVertical: 10 }}>
                        <Text>{wallet.network_name}</Text>
                        <Text>{wallet.address}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingTop: 8
    },
    profileHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center'
    },
    header: {
        fontSize: 18,
        fontWeight: '700',
    },
    walletsContainer: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30
    },
    walletList: {
        marginTop: 10,
        flex: 1
    },
    walletContainer: {
        marginVertical: 5,
        padding: 5,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    networkName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    walletAddress: {
        fontSize: 12,
        color: '#555',
    },
})

export default UserProfileScreen;
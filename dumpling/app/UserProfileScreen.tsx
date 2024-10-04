import { useEffect, useState } from "react";
import { View, StyleSheet, Text, Pressable, Button, FlatList } from "react-native";
import { getUserDetails, getWallets, logout, openOktoBottomsheet } from "rn-okto-sdk";
// import { User } from "../types/user";
// import { Wallet } from "../types/wallet";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { NavigationProp } from "@react-navigation/native";


const UserProfileScreen = () => {


   
   

    return (
        <View style={styles.container}>
            
            <View style={styles.walletsContainer}>
                <Text style={styles.header}>My Wallets</Text>
                <Pressable onPress={() => openOktoBottomsheet()}>
                    <Text style={{ color: "#468cd1", fontSize: 14 }}>Open Okto Widget</Text>
                </Pressable>
            </View>
            
            <View style={{ flex: 1, paddingHorizontal: 25 }}>
                
                <View style={{ gap: 10, flexDirection: 'row', justifyContent: "space-between" }}>
                   
                </View>
                
            </View>
        </View>
    )
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
import React, { useState } from "react";
import {View, Text, TextInput, Button, SafeAreaView, StyleSheet}  from "react-native"
import phonePeSDK from "react-native-phonepe-pg"
import Base64 from "react-native-base64"
import sha256 from "sha256"

const Payments = ()=>{

    const [data, setData] = useState({
        mobile : "",
        amount:""
    })

    const [environment, setEnvironment ] = useState("SANDBOX")
    const [merchantID, setMerchantID] = useState("PGTESTPAYUAT86")
    const [appId, setAppId] = useState(null)
    const [enableLogging, setEnableLogging] = useState(true)


    const generateTransactionId = ()=>{
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        const merchantPrefix = "T";
        return `${merchantPrefix}${timestamp}${random}`
    }

    const submitHandler = ()=>{
        phonePeSDK.init(environment, merchantID, appId, enableLogging)
            .then(response=>{
                const requestBody = {
                    merchantId : merchantID,
                    merchantTransactionId : generateTransactionId(),
                    merchantUserId : "",
                    amount : (data.amount*100),
                    mobileNumber: data.mobile,
                    calbackUrl : "",
                    paymentInstrument : {
                        type : "PAY_PAGE"
                    }
                }

                const salt_key = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
                const salt_Index = 1;
                const payload = JSON.stringify(requestBody);
                const payload_main =  Base64.encode(payload);
                const string = payload_main+"/pg/v1/pay"+salt_key;
                const checksum  = sha256(string)+"###"+salt_Index

                phonePeSDK.startTransaction(
                    payload_main,
                    checksum,
                    null,
                    null
                )
                .then(response=>{
                    console.log("Transaction ended")
                })
                .catch(error=>{
                    console.log("error : ", error)
                })


            })
            .catch(error=>{
                console.log("Error : ",error)
            })
    }

    return(
        <View>
            <SafeAreaView>
                <View>
                    <TextInput placeholder = "enter mobile number" onChangeText={(txt)=>setData({...data,mobile : txt})} style = {styles.textField}/>
                    <TextInput placeholder = "enter amount" onChangeText={(txt)=>setData({...data, amount : txt})} style = {styles.textField}/>
                    <Button title = "pay" onPress={submitHandler}/>
                </View>
            </SafeAreaView>
        </View>
    )
}


const styles = StyleSheet.create({
    container : {
        display : "flex",
        justifyContent : "center",
        alignItems : "center",
        height : "100%",
        gap : 10
    },
    textField :{
        paddingLeft: 15 , 
        borderColor: "gray",
        borderWidth :1,
        width : "70%"
    }
})

export default Payments
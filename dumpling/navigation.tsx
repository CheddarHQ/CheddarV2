import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./app/loginScreen";
// import UserProfileScreen from "./screens/user-profile";
// import SupportedChainScreen from "./screens/supported-chains";
// import TransferTokensScreen from "./screens/transfer-tokens";
// import TransferNFTScreen from "./screens/transfer-nft";
// import OrderDetailsScreen from "./screens/order-details";
// import NftOrderDetailsScreen from "./screens/nft-order-details";
// import UserPortfolioScreen from "./screens/user-portfolio";

export type RootStackParamList = {
    Login: undefined;
    UserProfile: undefined;
    UserPortfolio: undefined;
    SupportedChains: undefined;
    TransferTokens: undefined;
    TransferNFT: undefined;
    OrderDetails: {
        orderId: string;
    };
    NftOrderDetails: {
        orderId: string;
    };
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation(){
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} />
            {/* <Stack.Screen name="UserProfile" component={UserProfileScreen} /> */}
            {/* <Stack.Screen name="UserPortfolio" component={UserPortfolioScreen} />
            <Stack.Screen name="SupportedChains" component={SupportedChainScreen} />
            <Stack.Screen name="TransferTokens" component={TransferTokensScreen} />
            <Stack.Screen name="TransferNFT" component={TransferNFTScreen} />
            <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
            <Stack.Screen name="NftOrderDetails" component={NftOrderDetailsScreen} /> */}
        </Stack.Navigator>
    )
}
import { Buffer } from 'buffer';
import 'react-native-get-random-values';
import 'react-native-crypto';
import 'react-native-randombytes';

import { registerRootComponent } from 'expo';


import { TextDecoder, TextEncoder } from 'text-encoding';
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

global.Buffer = Buffer;


import App from './App';
import Home from "./app/index"

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Home);

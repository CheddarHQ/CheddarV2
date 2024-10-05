import { createClient } from '@dynamic-labs/client';
import { ReactNativeExtension } from '@dynamic-labs/react-native-extension';
import { SolanaExtension } from '@dynamic-labs/solana-extension';

export const dynamicClient = createClient({
  environmentId: '0673ae5a-5cbb-4d60-8b13-5edb62181b0a',
  // Optional:
  appLogoUrl: 'https://demo.dynamic.xyz/favicon-32x32.png',
  appName: 'GoPilot APP',
  // }).extend(SolanaExtension());
}).extend(ReactNativeExtension());

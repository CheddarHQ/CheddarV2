import { createClient } from "@dynamic-labs/client";
import { ReactNativeExtension } from "@dynamic-labs/react-native-extension";
import { SolanaExtension } from "@dynamic-labs/solana-extension";
import { useReactiveClient } from '@dynamic-labs/react-hooks'



export const dynamicClient = createClient({
  environmentId: "0673ae5a-5cbb-4d60-8b13-5edb62181b0a",
  // Optional:
  appLogoUrl: "https://demo.dynamic.xyz/favicon-32x32.png",
  appName: "Cheddar 🧀",
}).extend(ReactNativeExtension())
  .extend(SolanaExtension())

export const useDynamic = () => useReactiveClient(dynamicClient)
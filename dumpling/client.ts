import { createClient } from "@dynamic-labs/client";
import { ReactNativeExtension } from "@dynamic-labs/react-native-extension";
import { SolanaExtension } from "@dynamic-labs/solana-extension";
import { useReactiveClient } from '@dynamic-labs/react-hooks'


export const dynamicClient = createClient({
  environmentId: "329c33c2-f35f-428c-89b8-32c4c36c2cd6",
  // Optional:
  appLogoUrl: "https://demo.dynamic.xyz/favicon-32x32.png",
  appName: "GoPilot APP",
  // }).extend(SolanaExtension());
}).extend(ReactNativeExtension());

export const useDynamic = () => useReactiveClient(dynamicClient)
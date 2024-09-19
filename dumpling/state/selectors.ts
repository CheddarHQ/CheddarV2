import { selector } from "recoil"
import { phantomPublicKey, phantomSessionAtom, sharedSecretAtom, chainIdAtom, detailedInfoAtom } from "./atoms"


export const phantomSelector = selector({
    key : "sharedSecretAndSessionSelector",
    get: ({get})=>{
        const sharedSecret = get(sharedSecretAtom)
        const session = get(phantomSessionAtom)
        const phantomWalletPublicKey = get(phantomPublicKey)
        const chainId = get(chainIdAtom)
        const detailedInfoRecoil = get(detailedInfoAtom)
        return {sharedSecret, session, phantomWalletPublicKey, chainId, detailedInfoRecoil}
    }
})


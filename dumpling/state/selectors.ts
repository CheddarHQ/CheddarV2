import { selector } from "recoil"
import { phantomPublicKey, phantomSessionoAtom, sharedSecretAtom } from "./atoms"


export const phantomSelector = selector({
    key : "sharedSecretAndSessionSelector",
    get: ({get})=>{
        const sharedSecret = get(sharedSecretAtom)
        const session = get(phantomSessionoAtom)
        const phantomWalletPublicKey = get(phantomPublicKey)
        return {sharedSecret, session, phantomWalletPublicKey}
    }
})


import {atom} from "recoil"
import { MessageProps } from "~/app/thing"


export const userAtom = atom({
    key : "userAtom",
    default : ""
})

export const messagesAtom = atom({
    key : "messages",
    default : [] as MessageProps[]
})


export const phantomStatus = atom({
    key : "phantomStatus",
    default : "disconnected"
})

export const phantomPublicKey = atom({
    key:"phantomId",
    default : ""
})

export const outputMintAtom = atom({
    key : "outputMint",
    default : ""
})

export const chainIdAtom = atom({
    key : "chainId",
    default : "solana"
})


export const inputMintAtom = atom({
    key  : "inputMint",
    default : "So11111111111111111111111111111111111111112"
})
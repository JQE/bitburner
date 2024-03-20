import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the slice state
export interface ServerManagerState {
    CurrentRam: number;
    MaxRam: number;
    Count: number;
    MaxServers: number;
    Buying: boolean;
    AtRam: number;
    HackType: number;
    Hacking: boolean;
    Target: string;
}

// Define the initial state using that type
const initialState: ServerManagerState = {
    CurrentRam: 0,
    MaxRam: 8,
    Count: 0,
    AtRam: 0,
    MaxServers: 0,
    Buying: false,
    HackType: 0,
    Hacking: false,
    Target: "n00dles",
};

export const serverManagerSlice = createSlice({
    name: "ServerManager",
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        setCurrentRam: (state, action: PayloadAction<number>) => {
            state.CurrentRam = action.payload;
        },
        setMaxRam: (state, action: PayloadAction<number>) => {
            state.MaxRam = action.payload;
        },
        setCount: (state, action: PayloadAction<number>) => {
            state.Count = action.payload;
        },
        setMaxServers: (state, action: PayloadAction<number>) => {
            state.MaxServers = action.payload;
        },
        setAtRam: (state, action: PayloadAction<number>) => {
            state.AtRam = action.payload;
        },
        setBuying: (state, action: PayloadAction<boolean>) => {
            state.Buying = action.payload;
        },
        setHackType: (state, action: PayloadAction<number>) => {
            state.HackType = action.payload;
        },
        setHacking: (state, action: PayloadAction<boolean>) => {
            state.Hacking = action.payload;
        },
        setTarget: (state, action: PayloadAction<string>) => {
            state.Target = action.payload;
        },
    },
});

export const {
    setMaxRam,
    setCount,
    setMaxServers,
    setCurrentRam,
    setAtRam,
    setBuying,
    setHackType,
    setHacking,
    setTarget,
} = serverManagerSlice.actions;

export default serverManagerSlice.reducer;

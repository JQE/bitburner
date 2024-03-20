import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the slice state
export interface ServerManagerState {
    CurrentRam: number;
    MaxRam: number;
    Count: number;
    Max: number;
    AtRam: number;
    Target: string;
    HackType: number;
    Buying: boolean;
    Hacking: boolean;
    ShareValue: number;
}

// Define the initial state using that type
const initialState: ServerManagerState = {
    CurrentRam: 0,
    MaxRam: 8,
    Count: 0,
    Max: 0,
    AtRam: 0,
    Target: "n00dles",
    HackType: 0,
    Buying: false,
    Hacking: false,
    ShareValue: 1,
};

export const serverManagerSlice = createSlice({
    name: "ServerManager",
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        SetCurrentRam: (state, action: PayloadAction<number>) => {
            state.CurrentRam = action.payload;
        },
        SetMaxRam: (state, action: PayloadAction<number>) => {
            state.MaxRam = action.payload;
        },
        SetServerCount: (state, action: PayloadAction<number>) => {
            state.Count = action.payload;
        },
        SetMaxServers: (state, action: PayloadAction<number>) => {
            state.Max = action.payload;
        },
        SetAtRam: (state, action: PayloadAction<number>) => {
            state.AtRam = action.payload;
        },
        SetTarget: (state, action: PayloadAction<string>) => {
            state.Target = action.payload;
        },
        SetHackType: (state, action: PayloadAction<number>) => {
            state.HackType = action.payload;
        },
        SetBuying: (state, action: PayloadAction<boolean>) => {
            state.Buying = action.payload;
        },
        SetHacking: (state, action: PayloadAction<boolean>) => {
            state.Hacking = action.payload;
        },
        SetShareValue: (state, action: PayloadAction<number>) => {
            state.ShareValue = action.payload;
        },
    },
});

export const {
    SetMaxRam,
    SetServerCount,
    SetMaxServers,
    SetCurrentRam,
    SetAtRam,
    SetTarget,
    SetHackType,
    SetBuying,
    SetHacking,
    SetShareValue,
} = serverManagerSlice.actions;

export default serverManagerSlice.reducer;

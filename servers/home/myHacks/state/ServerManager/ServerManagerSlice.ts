import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the slice state
export interface ServerManagerState {
    CurrentRam: number;
    MaxRam: number;
    ServerCount: number;
    MaxServers: number;
}

// Define the initial state using that type
const initialState: ServerManagerState = {
    CurrentRam: 0,
    MaxRam: 8,
    ServerCount: 0,
    MaxServers: 0,
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
        setServerCount: (state, action: PayloadAction<number>) => {
            state.ServerCount = action.payload;
        },
        setMaxServers: (state, action: PayloadAction<number>) => {
            state.MaxServers = action.payload;
        },
    },
});

export const { setMaxRam, setServerCount, setMaxServers, setCurrentRam } =
    serverManagerSlice.actions;

export default serverManagerSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the slice state
export interface HacknetManagerState {
    Count: number;
    Purchased: number;
    MaxNodes: number;
}

// Define the initial state using that type
const initialState: HacknetManagerState = {
    Count: 0,
    Purchased: 0,
    MaxNodes: 0,
};

export const hacknetManagerSlice = createSlice({
    name: "HacknetManager",
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        setCount: (state, action: PayloadAction<number>) => {
            state.Count = action.payload;
        },
        setPurchased: (state, action: PayloadAction<number>) => {
            state.Purchased = action.payload;
        },
        setMaxNodes: (state, action: PayloadAction<number>) => {
            state.MaxNodes = action.payload;
        },
    },
});

export const { setCount, setPurchased, setMaxNodes } =
    hacknetManagerSlice.actions;

export default hacknetManagerSlice.reducer;

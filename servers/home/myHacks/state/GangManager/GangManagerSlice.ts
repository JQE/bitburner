import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum ActivityFocus {
    Money = 1,
    Respect = 2,
    Warfare = 3,
    Balance = 4,
}

// Define a type for the slice state
export interface GangManagerState {
    Buy: boolean;
    BaseJob: string;
    Activity: ActivityFocus;
    BuyAugs: boolean;
}

// Define the initial state using that type
const initialState: GangManagerState = {
    Buy: false,
    BaseJob: "Mug People",
    Activity: ActivityFocus.Money,
    BuyAugs: false,
};

export const GangManagerSlice = createSlice({
    name: "GangManager",
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        SetBuyEquipment: (state, action: PayloadAction<boolean>) => {
            state.Buy = action.payload;
        },
        SetBuyAugs: (state, action: PayloadAction<boolean>) => {
            state.BuyAugs = action.payload;
        },
        SetBaseJob: (state, action: PayloadAction<string>) => {
            state.BaseJob = action.payload;
        },
        SetActivity: (state, action: PayloadAction<ActivityFocus>) => {
            state.Activity = action.payload;
        },
    },
});

export const { SetBuyEquipment, SetBuyAugs, SetBaseJob, SetActivity } =
    GangManagerSlice.actions;

export default GangManagerSlice.reducer;

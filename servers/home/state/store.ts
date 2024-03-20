import { configureStore } from "@reduxjs/toolkit";
import serverManagerReducer from "./ServerManager/ServerManagerSlice";
import hacknetManagerReducer from "./HacknetManager/HacknetManagerSlice";

export const store = configureStore({
    reducer: {
        servermanager: serverManagerReducer,
        hacknetmanager: hacknetManagerReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

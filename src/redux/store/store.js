
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

//custom-Imports
import authSlice from "../slices/authSlice"
import AsyncStorage from "@react-native-async-storage/async-storage";



const rootReducer = combineReducers({
    authSlice
});

const persistedReducer = persistReducer({ key: "root", storage: AsyncStorage, whitelist: ["authSlice"] }, rootReducer)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                ignoredPaths: ['some.nonSerializable.path'],
            }
        }),
})

export default store;
export const persistor = persistStore(store);
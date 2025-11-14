
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

//custom-Imports
import authSlice from "../slices/authSlice";
import taskSlice from "../slices/taskSlice"


const rootReducer = combineReducers({
    authSlice,
    taskSlice
});

const persistedReducer = persistReducer({ key: "root", storage: AsyncStorage, whitelist: ["authSlice", 'taskSlice'] }, rootReducer)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})

export default store;
export const persistor = persistStore(store);
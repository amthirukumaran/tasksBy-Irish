
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

//custom-Imports
import authSlice from "../slices/authSlice";
import taskSlice from "../slices/taskSlice"
import { storage } from "../../shared/config";


const rootReducer = combineReducers({
    authSlice,
    taskSlice
});

const secureStorage = {
    setItem: (key, value) => {
        storage.set(key, value);
        return Promise.resolve(true);
    },
    getItem: (key) => {
        const value = storage.getString(key);
        return Promise.resolve(value);
    },
    removeItem: (key) => {
        storage.delete(key);
        return Promise.resolve();
    },
};

const persistedReducer = persistReducer({ key: "root", storage: secureStorage, whitelist: ["authSlice", 'taskSlice'] }, rootReducer)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})

export default store;
export const persistor = persistStore(store);
import { createSlice } from "@reduxjs/toolkit"


const initialState = {
    isLoggedIn: false,
    userInfo: {},
    token: "",
    notificationAllowed: false
}

const authSlice = createSlice({
    name: "AuthSlice",
    initialState,
    reducers: {
        setUserSessionInfo: (state, { payload }) => {
            state.isLoggedIn = payload.isLoggedIn
            state.userInfo = payload.userInfo
            state.token = payload.token
        },
        setNotificationAllowed: (state, { payload }) => {
            state.notificationAllowed = payload
        }
    }
})

export const { setUserSessionInfo, setNotificationAllowed } = authSlice.actions
export default authSlice.reducer
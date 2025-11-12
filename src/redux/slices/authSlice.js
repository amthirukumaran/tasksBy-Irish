import { createSlice } from "@reduxjs/toolkit"


const initialState = {
    isLoggedIn: false,
    userInfo: {},
    token: ""
}

const authSlice = createSlice({
    name: "AuthSlice",
    initialState,
    reducers: {
        setUserSessionInfo: (state, { payload }) => {
            state.isLoggedIn = payload.isLoggedIn
            state.userInfo = payload.userInfo
            state.token = payload.token
        }
    }
})

export const { setUserSessionInfo } = authSlice.actions
export default authSlice.reducer
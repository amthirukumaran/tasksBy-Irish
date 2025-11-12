import { useEffect } from "react";
import SplashScreen from "react-native-splash-screen";
import { createStackNavigator } from "@react-navigation/stack";

import AppStacks from "./appStacks"
import AuthStacks from "./authStacks"
import { useSelector } from "react-redux";

const RootStacks = () => {

    const RootStack = createStackNavigator()

    const { isLoggedIn } = useSelector(state => state.authSlice)

    useEffect(() => {
        SplashScreen?.hide()
        console.log("root stack mounted");
    }, [])

    return (
        <RootStack.Navigator screenOptions={{ headerShown: false, cardOverlayEnabled: false }}>
            {isLoggedIn ?
                <RootStack.Screen name="AppStacks" component={AppStacks} />
                :
                <RootStack.Screen name="AuthStacks" component={AuthStacks} />
            }
        </RootStack.Navigator>
    )

}


export default RootStacks;
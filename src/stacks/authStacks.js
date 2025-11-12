import { createStackNavigator } from "@react-navigation/stack";

//custom-Imports
import signIn from "../screens/authStack/signIn";
import signUp from "../screens/authStack/signUp";

const AuthStacks = () => {
    const AuthStack = createStackNavigator();

    console.log("auth stack mounted");

    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false, cardOverlayEnabled: false }}>
            <AuthStack.Screen name="SignIn" component={signIn} />
            <AuthStack.Screen name="signUp" component={signUp} />
        </AuthStack.Navigator>
    )
}
export default AuthStacks;
import { createStackNavigator } from "@react-navigation/stack";

import Dashboard from "../screens/appStack/dashboard";

const AppStacks = () => {

    const AppStack = createStackNavigator();

    console.log("app stack mounted");

    return (
        <AppStack.Navigator screenOptions={{ headerShown: false, cardOverlayEnabled: false }} initialRouteName="Dashboard">
            <AppStack.Screen name="Dashboard" component={Dashboard} />
        </AppStack.Navigator>
    )
}
export default AppStacks;
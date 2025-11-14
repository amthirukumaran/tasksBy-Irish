import { createStackNavigator } from "@react-navigation/stack";

//custom-Importss
import AddTask from "../screens/appStack/addTask";
import Dashboard from "../screens/appStack/dashboard";
import SearchScreen from "../screens/appStack/searchTasks";

const AppStacks = () => {

    const AppStack = createStackNavigator();

    console.log("app stack mounted");

    return (
        <AppStack.Navigator screenOptions={{ headerShown: false, cardOverlayEnabled: false }} initialRouteName="Dashboard">
            <AppStack.Screen name="Dashboard" component={Dashboard} />
            <AppStack.Screen name="AddTask" component={AddTask} />
            <AppStack.Screen name="SearchTask" component={SearchScreen} />
        </AppStack.Navigator>
    )
}
export default AppStacks;
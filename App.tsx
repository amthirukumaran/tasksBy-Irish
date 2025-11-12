import { LogBox } from "react-native";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { PersistGate } from "redux-persist/lib/integration/react";
import { SafeAreaProvider } from "react-native-safe-area-context";

//custom-Imports
import RootStacks from "./src/stacks/rootStacks";
import store, { persistor } from "./src/redux/store/store"

LogBox.ignoreLogs([
  'InteractionManager has been deprecated',
]);

function App() {

  return (
    <SafeAreaProvider  >
      <NavigationContainer>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <RootStacks />
          </PersistGate>
        </Provider>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
export default App;
import { useEffect } from "react";
import { View } from "react-native";
import SplashScreen from "react-native-splash-screen";

function App() {
  useEffect(() => {
    SplashScreen?.hide()
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "red" }}>

    </View>
  )
}
export default App;
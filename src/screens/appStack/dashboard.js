import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { setUserSessionInfo } from "../../redux/slices/authSlice";

const Dashboard = () => {

    const dispatch = useDispatch()
    return (
        <View style={{ flex: 1, justifyContent: "center" }}>
            <Text onPress={() => { GoogleSignin.signOut(); dispatch(setUserSessionInfo({ isLoggedIn: false, userInfo: {}, token: "" })) }}>Dashboard</Text>
        </View>
    )
}
export default Dashboard;

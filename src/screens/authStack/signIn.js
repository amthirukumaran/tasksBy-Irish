import * as Yup from 'yup';
import { useFormik } from "formik";
import { Input } from "@rneui/base";
import { useDispatch } from 'react-redux';
import { useEffect, useState } from "react";
import Snackbar from "react-native-snackbar";
import FastImage from 'react-native-fast-image';
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

//custom-Imports
import { appFonts } from "../../shared/appFonts";
import { appColors } from "../../shared/appColors";
import { setUserSessionInfo } from '../../redux/slices/authSlice';
import { auth, parseFirebaseUser, webClientId } from "../../shared/config";


const SignIn = () => {

    console.log("SignInScreen mounted");

    //variable used for dispatch an action
    const dispatch = useDispatch()
    //handles the safeArea
    const { top, bottom } = useSafeAreaInsets();
    //Variable used to handle the navigation
    const navigation = useNavigation();
    //Variable used to handle the mainScreen loader
    const [isLoad, setIsLoad] = useState(true);
    //Variable used to handle the transparentLoader
    const [transparentLoader, setTransparentLoader] = useState(false);
    //Variable used to disable ui thread while api call
    const [buttonLoader, setButtonLoader] = useState(false);



    //Images
    const googleIcon = require("../../assets/images/googleIcon.png");

    useEffect(() => {
        GoogleSignin?.configure({ webClientId })
        setIsLoad(false)
    }, [])

    const validationSchema = Yup.object().shape({
        email: Yup.string().required(""),
        password: Yup.string().required(""),
    })


    const formik = useFormik({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema: validationSchema,
        onSubmit: () => {
            setButtonLoader(true);
            setTimeout(() => {
                loginWithEmailAndPassword(formik?.values?.email, formik?.values?.password)
            }, 400);
        }
    })

    const loginWithEmailAndPassword = (email, password) => {

        signInWithEmailAndPassword(auth, email, password).then((res) => {
            console.log("Email/Password Sign-In Response: ", JSON.stringify(res, null, 4));
            const { multiFactor, metadata, uid, ...rest } = res?.user;
            dispatch(setUserSessionInfo({
                isLoggedIn: true,
                userInfo: rest,
                token: uid
            }))
        }).catch((e) => {
            console.log("E.code--->", e.code)
            if (e?.code === "auth/wrong-password") {
                setIncorrectPassword(true)
                Snackbar.show({
                    text: "Incorrect password. Please try again.",
                    duration: Snackbar?.LENGTH_LONG,
                    fontFamily: appFonts?.medium
                })
            } else if (e?.code === "auth/user-not-found") {
                Snackbar.show({
                    text: `We couldn’t find a user with this email.`,
                    duration: Snackbar?.LENGTH_LONG,
                    fontFamily: appFonts?.medium
                })
            } else if (e?.code === "auth/invalid-email") {
                Snackbar.show({
                    text: "Email is invalid. Please enter a valid email address.",
                    duration: Snackbar?.LENGTH_LONG,
                    fontFamily: appFonts?.medium
                })
            } else if (e?.code === "auth/too-many-requests") {
                Snackbar.show({
                    text: "Too many requests. Please try again later.",
                    duration: Snackbar?.LENGTH_LONG,
                    fontFamily: appFonts?.medium
                })
            } else {
                Snackbar.show({
                    text: "An error occurred. Please try again.",
                    duration: Snackbar?.LENGTH_LONG,
                    fontFamily: appFonts?.medium
                })
            }
        }).finally(() => {
            setButtonLoader(false)
        })

    }

    const signInWithGoogle = () => {
        setTransparentLoader(true)
        GoogleSignin?.signIn().then(async (res) => {
            // console.log("Google Sign-In Response: ", res);
            if (res?.type === "success") {
                const credential = await GoogleAuthProvider.credential(res?.data?.idToken);
                signInWithCredential(auth, credential).then(userCredential => {
                    // console.log("Firebase Sign-In Credential: ", JSON.stringify(userCredential?.user, null, 4));
                    const data = parseFirebaseUser(userCredential?.user);
                    // console.log("Firebase Sign-In User: ", JSON.stringify(data, null, 4));
                    dispatch(setUserSessionInfo({
                        isLoggedIn: true,
                        userInfo: data,
                        token: data.uid
                    }))
                }).catch(error => {
                    console.log("Firebase Sign-In Error: ", error);
                    setTimeout(() => {
                        Snackbar.show({
                            text: "Something went wrong. Please try again later.",
                            duration: Snackbar.LENGTH_LONG,
                            fontFamily: appFonts?.medium
                        })
                    }, 400);
                }).finally(() => {
                    setTransparentLoader(false)
                })
            } else {
                setTransparentLoader(false)
                setTimeout(() => {
                    Snackbar.show({
                        text: "Something went wrong. Please try again later.",
                        duration: Snackbar.LENGTH_LONG,
                        fontFamily: appFonts?.medium
                    })
                }, 400);
            }
        }).catch((e) => {
            console.log("Google Sign-In Error: ", e);
        }).finally(() => {
            setTransparentLoader(false)
        })
    }

    return (
        <KeyboardAvoidingView onStartShouldSetResponder={() => { Keyboard?.dismiss(); return false; }} style={{ flex: 1, backgroundColor: appColors?.lightBackground, paddingTop: top, paddingBottom: bottom }}>
            <StatusBar barStyle={"dark-content"} />
            {isLoad ?
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size={30} color={appColors?.lightDark} />
                </View>
                :
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={{ flex: 1, justifyContent: "center" }}>
                        <View style={{ alignItems: "center" }}>
                            <Text style={{ fontFamily: appFonts?.bold, fontSize: 20, textAlign: "left", color: appColors?.dark, paddingVertical: 10 }}>Where thoughts become tasks</Text>
                            <Text style={{ fontFamily: appFonts?.bold, fontSize: 16, color: appColors?.lightDark }}>Log in to your account</Text>
                        </View>
                        <View style={{ paddingHorizontal: 20, paddingVertical: 30 }}>
                            <Input
                                label={"Email"}
                                value={formik?.values?.email}
                                onChangeText={(text) => formik?.setFieldValue("email", text)}
                                disabled={buttonLoader}
                                errorStyle={{ margin: 0 }}
                                inputStyle={{ paddingHorizontal: 10, paddingStart: 15, color: appColors?.lightGrey, fontFamily: appFonts?.medium, fontSize: 14 }}
                                labelStyle={{ fontFamily: appFonts?.medium, paddingBottom: 7, paddingLeft: 5, fontWeight: undefined, color: appColors?.lightDark, fontSize: 14 }}
                                inputContainerStyle={{ borderWidth: 1, borderRadius: 8, borderColor: appColors?.borderColor }}
                            />
                            <Input
                                label={"Password"}
                                value={formik?.values?.password}
                                onChangeText={(text) => formik?.setFieldValue("password", text)}
                                disabled={buttonLoader}
                                textContentType="password"
                                errorStyle={{ margin: 0, height: 0 }}
                                inputStyle={{ paddingHorizontal: 10, paddingStart: 15, color: appColors?.lightGrey, fontFamily: appFonts?.medium, fontSize: 14 }}
                                labelStyle={{ fontFamily: appFonts?.medium, paddingBottom: 7, paddingLeft: 5, fontWeight: undefined, color: appColors?.lightDark, fontSize: 14 }}
                                inputContainerStyle={{ borderWidth: 1, borderRadius: 8, borderColor: appColors?.borderColor }}
                            />
                            <View style={{ paddingHorizontal: 10, paddingVertical: 15, paddingTop: 32 }}>
                                <TouchableOpacity disabled={buttonLoader || !formik?.isValid} onPress={() => { formik?.handleSubmit() }} activeOpacity={0.7} style={{ alignItems: "center", backgroundColor: appColors?.lightGrey, borderRadius: 8 }}>
                                    {buttonLoader ?
                                        <ActivityIndicator style={{ paddingVertical: 13 }} size={"small"} color={appColors?.light} />
                                        :
                                        <Text style={{ color: appColors?.light, fontFamily: appFonts?.bold, paddingVertical: 13 }}>LOGIN</Text>
                                    }
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: "row", gap: 10, paddingVertical: 15, paddingHorizontal: 20, alignItems: "center" }}>
                                <View style={{ borderBottomWidth: 0.5, flex: 1, borderColor: appColors?.borderColor }} />
                                <Text style={{ color: appColors?.lightDark, fontFamily: appFonts?.medium, fontSize: 14 }}>OR</Text>
                                <View style={{ borderBottomWidth: 0.5, flex: 1, borderColor: appColors?.borderColor }} />
                            </View>
                            <View style={{ paddingHorizontal: 10, paddingVertical: 15 }}>
                                <TouchableOpacity disabled={buttonLoader} onPress={() => { formik?.resetForm(); signInWithGoogle() }} activeOpacity={0.7} style={{ alignItems: "center", backgroundColor: appColors?.lightBackground, borderRadius: 8, paddingHorizontal: 15, borderWidth: 0.2, elevation: 1 }}>
                                    <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                                        <FastImage
                                            source={googleIcon}
                                            style={{ height: 22, width: 22, /* backgroundColor: appColors?.lightBackground, overlayColor: appColors?.lightBackground */ }}
                                        />
                                        <Text style={{ color: appColors?.dark, fontFamily: appFonts?.medium, paddingVertical: 14 }}>Continue With Google</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{ height: 70, justifyContent: "center", alignItems: "center", backgroundColor: "", paddingHorizontal: 20 }}>
                        <View style={{ flexDirection: "row", gap: 5 }}>
                            <Text style={{ fontFamily: appFonts?.medium, color: appColors?.lightDark, fontSize: 14 }}>{`Don't have an account?`}</Text>
                            <TouchableOpacity disabled={buttonLoader} onPress={() => { formik?.resetForm(); navigation?.navigate("signUp") }}>
                                <Text style={{ color: appColors?.dark, fontFamily: appFonts?.bold, textDecorationLine: "underline", fontSize: 14 }}>Sign up</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={{ color: appColors?.lightDark, fontFamily: appFonts?.medium, fontSize: 13, paddingTop: 7 }}>© 2025 IrishTaylor, Inc.</Text>
                    </View>
                </ScrollView>
            }
            <Modal navigationBarTranslucent={true} statusBarTranslucent={true} transparent visible={transparentLoader}>
                <StatusBar barStyle={"light-content"} backgroundColor={appColors?.transparentBackground} />
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: appColors?.transparentBackground }}>
                    < ActivityIndicator size={25} color={appColors?.light} />
                </View>
            </Modal>
        </KeyboardAvoidingView>
    )
}
export default SignIn;

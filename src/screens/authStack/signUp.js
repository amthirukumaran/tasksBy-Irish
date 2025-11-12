import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from "formik";
import { Input } from '@rneui/base';
import { useDispatch } from 'react-redux';
import Snackbar from 'react-native-snackbar';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { createUserWithEmailAndPassword, updateProfile, reload, getAuth } from '@react-native-firebase/auth';

//custom-Imports
import { appFonts } from "../../shared/appFonts";
import { appColors } from "../../shared/appColors";
import { auth, parseFirebaseUser } from '../../shared/config';
import { setUserSessionInfo } from '../../redux/slices/authSlice';

const SignUp = () => {


    //variable used for dispatch an action
    const dispatch = useDispatch()
    //handles the safeArea
    const { top, bottom } = useSafeAreaInsets();
    //Variable used to disable ui thread while api call
    const [buttonLoader, setButtonLoader] = useState(false);


    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Name is required')
            .min(2, 'Name must be at least 2 characters'),
        email: Yup.string()
            .email('Please enter a valid email')
            .required('Email is required'),

        password: Yup.string()
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters'),

        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Please re-enter your password'),
    });


    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
        validationSchema: validationSchema,
        onSubmit: () => {
            setButtonLoader(true);
            setTimeout(() => {
                createAccount(formik?.values?.name, formik?.values?.email, formik?.values?.password)
            }, 400);
        }
    })

    const createAccount = (name, email, password) => {

        createUserWithEmailAndPassword(auth, email, password).then(async (res) => {
            const data = res?.user
            await updateProfile(data, { displayName: name })
            await reload(data)
            const updatedData = getAuth().currentUser
            const { uid, } = getAuth().currentUser
            dispatch(setUserSessionInfo({
                isLoggedIn: true,
                userInfo: parseFirebaseUser(updatedData),
                token: uid
            }))
        }).catch((e) => {
            console.log("Error creating user account:", "code---", e.code, "message", e.message);
            if (e?.code == "auth/email-already-in-use") {
                setTimeout(() => {
                    Snackbar.show({
                        text: "This email address is already exists..",
                        duration: Snackbar.LENGTH_LONG,
                        textColor: appColors.light,
                    });
                }, 400);
            } else if (e?.code === "auth/too-many-requests") {
                setTimeout(() => {
                    Snackbar.show({
                        text: "Too many requests. Please try again later.",
                        duration: Snackbar?.LENGTH_LONG,
                        fontFamily: appFonts?.medium
                    })
                }, 400);
            } else if (e?.code === "auth/invalid-email") {
                setTimeout(() => {
                    Snackbar.show({
                        text: "Invalid email address. Please enter a valid email.",
                        duration: Snackbar?.LENGTH_LONG,
                        fontFamily: appFonts?.medium
                    })
                }, 400);
            } else {
                setTimeout(() => {
                    Snackbar.show({
                        text: "Something went wrong. please try again later",
                        duration: Snackbar.LENGTH_LONG,
                        textColor: appColors.light,
                    });
                }, 400);
            }
        }).finally(() => {
            setButtonLoader(false)
        })
    }

    return (
        <KeyboardAvoidingView onStartShouldSetResponder={() => { Keyboard?.dismiss(); return false; }} style={{ flex: 1, backgroundColor: appColors?.lightBackground, paddingTop: top, paddingBottom: bottom }}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 15, paddingTop: 120 }}>
                <View style={{ alignItems: "center" }}>
                    <Text style={{ fontFamily: appFonts?.bold, fontSize: 20, textAlign: "left", color: appColors?.dark, paddingVertical: 10 }}>Turn ideas into action</Text>
                    <Text style={{ fontFamily: appFonts?.bold, fontSize: 16, color: appColors?.lightDark }}>Create your account to get Started</Text>
                </View>
                <View style={{ paddingTop: 50 }}>
                    <Input
                        label={"Name *"}
                        value={formik?.values?.name}
                        onChangeText={(text) => { formik?.setFieldTouched("name", true); formik?.setFieldValue("name", text) }}
                        disabled={buttonLoader}
                        onBlur={() => formik.setFieldTouched("name", true)}
                        errorStyle={[formik?.errors?.name ? { margin: 0, left: 7, paddingVertical: 4 } : { margin: 0 }]}
                        inputStyle={{ paddingHorizontal: 10, paddingStart: 15, color: appColors?.lightGrey, fontFamily: appFonts?.medium, fontSize: 14 }}
                        labelStyle={{ fontFamily: appFonts?.medium, paddingBottom: 7, paddingLeft: 5, fontWeight: undefined, color: appColors?.lightDark, fontSize: 14 }}
                        inputContainerStyle={{ borderWidth: 1, borderRadius: 8, borderColor: appColors?.borderColor }}
                        errorMessage={formik?.touched?.name && formik?.errors?.name ? formik?.errors?.name : ""}
                    />
                    <Input
                        label={"Email *"}
                        value={formik?.values?.email}
                        onChangeText={(text) => { formik?.setFieldTouched("email", true); formik?.setFieldValue("email", text) }}
                        disabled={buttonLoader}
                        onBlur={() => formik.setFieldTouched("email", true)}
                        errorStyle={[formik?.errors?.email ? { margin: 0, left: 7, paddingVertical: 4 } : { margin: 0 }]}
                        inputStyle={{ paddingHorizontal: 10, paddingStart: 15, color: appColors?.lightGrey, fontFamily: appFonts?.medium, fontSize: 14 }}
                        labelStyle={{ fontFamily: appFonts?.medium, paddingBottom: 7, paddingLeft: 5, fontWeight: undefined, color: appColors?.lightDark, fontSize: 14 }}
                        inputContainerStyle={{ borderWidth: 1, borderRadius: 8, borderColor: appColors?.borderColor }}
                        errorMessage={formik?.touched?.email && formik?.errors?.email ? formik?.errors?.email : ""}
                    />
                    <Input
                        label={"Password *"}
                        value={formik?.values?.password}
                        onChangeText={(text) => { formik?.setFieldTouched("password", true); formik?.setFieldValue("password", text) }}
                        onBlur={() => formik?.setFieldTouched("password", true)}
                        disabled={buttonLoader}
                        textContentType="password"
                        errorStyle={[formik?.errors?.password ? { margin: 0, left: 7, paddingVertical: 4 } : { margin: 0 }]}
                        inputStyle={{ paddingHorizontal: 10, paddingStart: 15, color: appColors?.lightGrey, fontFamily: appFonts?.medium, fontSize: 14 }}
                        labelStyle={{ fontFamily: appFonts?.medium, paddingBottom: 7, paddingLeft: 5, fontWeight: undefined, color: appColors?.lightDark, fontSize: 14 }}
                        inputContainerStyle={{ borderWidth: 1, borderRadius: 8, borderColor: appColors?.borderColor }}
                        errorMessage={formik?.touched?.password && formik?.errors?.password ? formik?.errors?.password : ""}
                    />
                    <Input
                        label={"Confirm Password *"}
                        value={formik?.values?.confirmPassword}
                        onChangeText={(text) => { formik?.setFieldTouched("confirmPassword", true); formik?.setFieldValue("confirmPassword", text) }}
                        disabled={buttonLoader}
                        textContentType="password"
                        onBlur={() => formik.setFieldTouched("confirmPassword", true)}
                        errorStyle={[formik?.errors?.confirmPassword ? { margin: 0, left: 7, paddingVertical: 4 } : { margin: 0 }]}
                        inputStyle={{ paddingHorizontal: 10, paddingStart: 15, color: appColors?.lightGrey, fontFamily: appFonts?.medium, fontSize: 14 }}
                        labelStyle={{ fontFamily: appFonts?.medium, paddingBottom: 7, paddingLeft: 5, fontWeight: undefined, color: appColors?.lightDark, fontSize: 14 }}
                        inputContainerStyle={{ borderWidth: 1, borderRadius: 8, borderColor: appColors?.borderColor }}
                        errorMessage={formik?.touched?.confirmPassword && formik?.errors?.confirmPassword ? formik?.errors?.confirmPassword : ""}
                    />
                </View>
                <View style={{ paddingHorizontal: 11, paddingTop: 20 }}>
                    <TouchableOpacity disabled={buttonLoader || !formik?.isValid} onPress={() => { formik?.handleSubmit() }} activeOpacity={0.7} style={{ alignItems: "center", backgroundColor: appColors?.lightGrey, borderRadius: 8 }}>
                        {buttonLoader ?
                            <ActivityIndicator style={{ paddingVertical: 13 }} size={"small"} color={appColors?.light} />
                            :
                            <Text style={{ color: appColors?.light, fontFamily: appFonts?.bold, paddingVertical: 13 }}>CREATE ACCOUNT</Text>
                        }
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )

}
export default SignUp
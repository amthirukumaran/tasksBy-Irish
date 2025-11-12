import { getAuth } from "@react-native-firebase/auth";

//for googleSignIn configure
export const webClientId = "857439258515-h6cfhl7nk0te4relfaga098kva755a0o.apps.googleusercontent.com";

//for email/password signIn configure
export const auth = getAuth()


export const parseFirebaseUser = (user) => ({
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
    providerId: user.providerId,
    providerData: user.providerData,
});
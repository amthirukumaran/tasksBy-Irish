import { getAuth } from "@react-native-firebase/auth";
import { appColors } from "./appColors";

//for googleSignIn configure
export const webClientId = "857439258515-h6cfhl7nk0te4relfaga098kva755a0o.apps.googleusercontent.com";

//for email/password signIn configure
export const auth = getAuth()

//
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

export const getBackgroundColor = (item) => {
    if (!item.selected) return appColors.greyLight;

    switch (item.status) {
        case "Low":
            return "#8BC34A";
        case "Medium":
            return "#FFC107";
        case "High":
            return "#F44336";
        default:
            return appColors.greyDark;
    }
};

export const formatTimeforUI = (date) => {
    if (!(date instanceof Date)) return "";
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

export const formatDateforUI = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return "";
    const parts = new Date(date)
        .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        .split(" ");
    return `${parts[0]} ${parts[1]}, ${parts[2]}`;
};

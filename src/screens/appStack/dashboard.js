import { Divider } from "@rneui/base";
import RBSheet from "react-native-raw-bottom-sheet";
import Popover from 'react-native-popover-view';
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityIndicator, FlatList, Pressable, StatusBar, Text, View } from "react-native";

//icon-Imports
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

//custom-Imports
import Dialog from "../../shared/dialogProp"
import { appFonts } from "../../shared/appFonts";
import { appColors } from "../../shared/appColors";
import { setNotificationAllowed, setUserSessionInfo } from "../../redux/slices/authSlice";
import { formatTimeforUI } from "../../shared/config";
import { addFav } from "../../redux/slices/taskSlice";

const Dashboard = () => {

    const dispatch = useDispatch();
    const { tasks } = useSelector(state => state?.taskSlice)
    const { userInfo, notificationAllowed } = useSelector(state => state.authSlice);

    const noRecord = require("../../assets/images/no_record.png")

    const refRBSheet = useRef(null)


    const flatListRef = useRef(null);

    const [week, setWeek] = useState([])

    //handles the safeArea
    const { bottom } = useSafeAreaInsets();

    //Variable used to handle the navigation
    const navigation = useNavigation();
    //Variable used to handle the mainScreen loader
    const [isLoad, setIsLoad] = useState(true);

    const [selectedDate, setSelectedDate] = useState("");

    const [filteredTaskData, setFilteredTaskData] = useState([])

    const [isVisible, setIsVisible] = useState({ popOver: false, notification: false, logOut: false })

    const notificationDialog = {
        content: notificationAllowed ? "Are you sure you want to snooze notifications" : "Are you sure you want to resume notifications",
        button: [{ id: 1, label: "No", color: appColors.dark, backgroundColor: appColors.light }, { id: 2, label: "Yes", color: appColors.light, backgroundColor: appColors.lightDark }],
        image: {
            iconName: notificationAllowed ? "notifications-off" : "notifications-on",
            color: notificationAllowed ? appColors?.red : appColors?.green,
            iconType: "MaterialIcons"
        }
    }
    const logOutDialog = {
        content: "Are you sure you want to logout?",
        button: [{ id: 1, label: "No", color: appColors.dark, backgroundColor: appColors.light }, { id: 2, label: "Yes", color: appColors.light, backgroundColor: appColors.lightDark }],
        image: { iconName: 'run', color: appColors.dark }
    }

    useEffect(() => {
        setIsLoad(false)
        calculateWeekDays()
        formatDateWithSuffix(new Date())
    }, [])

    useEffect(() => {
        if (week.length > 0) {
            const todayIndex = week.findIndex((item) => item.today);
            if (todayIndex !== -1) {
                setTimeout(() => {
                    flatListRef.current?.scrollToIndex({
                        index: todayIndex,
                        animated: true, // Smooth scrolling
                        viewPosition: 0.5 // Centers the item
                    });
                }, 0); // Small delay for better UI experience
            }
        }
    }, [week]);

    const calculateWeekDays = () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

        const temp = [...Array(7)].map((_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            return {
                date: date.getDate(),
                today: i === today.getDay(),
                day: days[i],
                month: date.toLocaleString("en-US", { month: "long" }),
                monthInNumber: date?.getMonth()
            };
        });
        setWeek(temp);
    };

    const formatDateWithSuffix = (date) => {
        const day = date.getDate();
        const month = date.toLocaleString("en-US", { month: "long" });

        // Get ordinal suffix
        const getOrdinalSuffix = (day) => {
            if (day > 3 && day < 21) return "th"; // Covers 11th-20th
            switch (day % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };
        let formatted = `${month} ${day}${getOrdinalSuffix(day)}`
        console.log(formatted, "date--", date)
        setSelectedDate(formatted);
        if (tasks?.length) {
            const targetDate = new Date(date).getDate()
            const data = tasks?.filter(item => new Date(item?.dueDate).getDate() == targetDate)
            setFilteredTaskData(data)
        }
    };

    const changeColor = (index) => {
        setWeek(prev => prev.map((item, ind) => ({ ...item, today: ind === index })))
        const today = new Date();
        const clickedDate = week[index];
        today.setMonth(Number(clickedDate.monthInNumber));
        today.setDate(Number(clickedDate.date));
        formatDateWithSuffix(today)
    }


    const handleLogout = () => {
        if (userInfo?.providerData[0]?.providerId === "google.com") {
            GoogleSignin?.signOut()
        }
        dispatch(setUserSessionInfo({
            isLoggedIn: false,
            userInfo: {},
            token: "",
        }))
    }

    const handleNotification = () => {
        setIsVisible(prev => ({ ...prev, popOver: true, notification: true }))
        setTimeout(() => refRBSheet.current.close())
    }

    const handleConfirmation = (value) => {
        if (value === "Yes") {
            if (isVisible?.notification) {
                setTimeout(() => {
                    dispatch(setNotificationAllowed(!notificationAllowed))
                }, 400)
            } else if (isVisible?.logOut) {
                handleLogout()
            }
        }
        setIsVisible({ logOut: false, notification: false, popOver: false })
    }

    const handleFav = (id) => {
        dispatch(addFav(id))
        setFilteredTaskData(prev => prev.map(item => item?.createdAt == id ? { ...item, favourite: !item.favourite } : item))
    }

    const weeksRenderItem = ({ item, index }) => {
        return (
            <View style={{ marginRight: 15, alignItems: "center", gap: 10 }}>
                <Text>{item?.day}</Text>
                <Pressable onPress={() => changeColor(index)} style={{ backgroundColor: item?.today ? "pink" : "rgba(24,24,24,0.2)", borderRadius: 999, padding: item?.today ? 10 : 15, aspectRatio: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text style={item?.today ? { aspectRatio: 1, borderRadius: 999, padding: 5, textAlign: "center", textAlignVertical: "center", backgroundColor: "rgba(24,24,24,0.2)" } : {}}>{item?.date}</Text>
                </Pressable>
            </View >
        )
    }

    const getBackgroundColor = (item) => {
        switch (item) {
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

    const taskRenderItem = useCallback(({ item }) => {
        return (
            <Pressable onPress={() => navigation.navigate("AddTask", { ...item })} style={{ borderWidth: 1, borderColor: appColors?.borderColor, borderRadius: 8, marginBottom: 10, paddingLeft: 15, paddingRight: 20, }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
                    <View style={{ flex: 1, paddingVertical: 10 }}>
                        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Text numberOfLines={1} style={{ color: appColors?.dark, fontFamily: appFonts?.bold, fontSize: 15, maxWidth: 250 }}>{item?.title}</Text>
                            <Text style={{ fontFamily: appFonts?.medium, color: getBackgroundColor(item.priority) }}>{item?.priority}</Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 10, alignItems: "center", paddingTop: 5 }}>
                            <FontAwesome6 name="clock" size={16} color={appColors?.dark} />
                            <Text style={{ fontFamily: appFonts?.medium, color: appColors?.grey }}>{formatTimeforUI(new Date(item?.dueTime))}</Text>
                        </View>
                    </View>
                    <Pressable onPress={() => { handleFav(item?.createdAt) }}>
                        <Ionicons name={item?.favourite ? "heart" : "heart-outline"} size={20} color={item?.favourite ? "pink" : appColors?.dark} />
                    </Pressable>
                </View>
            </Pressable>
        )
    }, [])

    const taskEmptyComponent = useCallback(() => {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: -130 }}>
                <FastImage
                    source={noRecord}
                    style={{ width: 200, height: 200 }}
                />
                <Text style={{ fontFamily: appFonts?.medium, color: appColors?.dark, fontSize: 15, paddingTop: 20 }}>{`No Tasks for ${selectedDate.slice(0, -2)}`}</Text>
            </View>
        )
    }, [selectedDate])

    return (
        <SafeAreaView onStartShouldSetResponder={() => { setIsVisible(prev => ({ ...prev, popOver: false })); return false }} style={{ flex: 1, backgroundColor: appColors?.lightBackground }}>
            <StatusBar barStyle={"dark-content"} />
            {isLoad ?
                <View style={{ flex: 1, backgroundColor: appColors?.lightBackground, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size={30} color={appColors?.lightDark} />
                </View>
                :
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingLeft: 20, paddingRight: 25, paddingVertical: 10, paddingTop: 15, gap: 15 }}>
                        <View style={{ flex: 0.75 }}>
                            <Text style={{ fontFamily: appFonts?.medium, fontSize: 16 }}>Hi {userInfo?.displayName}</Text>
                            <Text style={{ fontFamily: appFonts?.medium, fontSize: 16 }}>Welcome Back!</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 25, flex: 0.25, justifyContent: "flex-end" }}>
                            <Pressable onPress={() => {/*  handleSearch() */ navigation.navigate("SearchTask") }}>
                                <Octicons name="search" size={24} color={appColors?.lightGrey} />
                            </Pressable>
                            <Pressable onPress={() => { refRBSheet?.current?.open() }}>
                                <Ionicons name="settings-sharp" size={24} color={appColors?.lightGrey} />
                            </Pressable>
                        </View>
                    </View>
                    <View style={{ marginTop: 15, paddingHorizontal: 15 }}>
                        <FlatList
                            ref={flatListRef}
                            data={week}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={weeksRenderItem}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                    <View style={{ paddingVertical: 15, paddingHorizontal: 15 }}>
                        <Text style={{ fontSize: 15, fontFamily: appFonts?.bold, color: "grey" }}>{`${selectedDate} Remainders`}</Text>
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 15 }}>
                        <FlatList
                            data={filteredTaskData}
                            keyExtractor={(_, ind) => ind.toString()}
                            renderItem={taskRenderItem}
                            ListEmptyComponent={taskEmptyComponent}
                            contentContainerStyle={{ flex: filteredTaskData?.length ? undefined : 1 }}
                        />
                    </View>
                    <Pressable onPress={() => { navigation?.navigate('AddTask') }} style={{ aspectRatio: 1, position: "absolute", borderRadius: 999, right: 35, bottom: 45, width: 50, backgroundColor: "pink", justifyContent: "center", alignItems: "center" }}>
                        <Octicons name='plus' size={24} color={"black"} />
                    </Pressable>
                </View>
            }
            <RBSheet customModalProps={{ statusBarTranslucent: true, navigationBarTranslucent: true }} ref={refRBSheet} draggable={true} closeOnPressMask={true} height={270} customStyles={{ container: { borderTopEndRadius: 20, borderTopStartRadius: 20, backgroundColor: appColors?.light } }}>
                <View style={{ flex: 1, paddingBottom: bottom, backgroundColor: appColors?.light }}>
                    <View style={{ alignItems: "center" }}>
                        <Text style={{ fontFamily: appFonts?.medium, fontSize: 16, color: appColors?.lightGrey }}>Accounts</Text>
                    </View>
                    <Divider style={{ marginHorizontal: 15, marginTop: 13, backgroundColor: appColors?.dark }} />
                    <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 15 }}>
                        <Pressable style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: appColors?.lightBackground, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 8 }}>
                            <View style={{ flex: 0.8, flexDirection: "row", gap: 10, alignItems: "center" }}>
                                <View style={{ backgroundColor: appColors?.secondary, borderRadius: 99, aspectRatio: 1 }}>
                                    <Text style={{ fontFamily: appFonts?.bold, padding: 10, paddingVertical: 5, fontSize: 16, color: appColors?.dark }}>{((userInfo?.displayName && userInfo?.displayName[0]?.toUpperCase()) ?? userInfo?.email[0]?.toUpperCase()) || "N/A"}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text numberOfLines={1} style={{ fontFamily: appFonts?.bold, fontSize: 13, color: appColors?.dark }}>{userInfo?.email ?? "N/A"}</Text>
                                </View>
                            </View>
                            <View style={{ flex: 0.2, backgroundColor: "", alignItems: "flex-end" }}>
                                <FontAwesome6 name="user-check" size={20} color={appColors?.lightGrey} />
                            </View>
                        </Pressable>
                        <View style={{ marginTop: 5, }}>
                            <Pressable onPress={() => { handleNotification() }} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: appColors?.lightBackground, paddingVertical: 10, paddingHorizontal: 15, borderTopStartRadius: 8, borderTopEndRadius: 8 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: appFonts?.bold, color: appColors?.dark }}>{notificationAllowed ? "Task Notifications Active" : "Task Notifications Snoozed"}</Text>
                                    </View>
                                    <View style={{ alignSelf: "flex-end" }}>
                                        <MaterialIcons name={notificationAllowed ? "notifications-on" : "notifications-off"} size={23} color={notificationAllowed ? appColors?.green : appColors?.red} />
                                    </View>
                                </View>
                            </Pressable>
                            <Divider style={{ borderWidth: 0.1, backgroundColor: appColors?.dark }} />
                            <Pressable onPress={() => { refRBSheet?.current?.close(); setTimeout(() => setIsVisible({ logOut: true, popOver: true, notification: false })) }} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingBottom: 12, paddingHorizontal: 15, backgroundColor: appColors?.lightBackground, borderBottomStartRadius: 8, borderBottomEndRadius: 8 }}>
                                <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                                    <Feather name="share" size={23} color={appColors?.red} style={{ transform: [{ rotate: "90deg" }] }} />
                                    <Text style={{ fontFamily: appFonts?.bold, color: appColors?.red, fontSize: 14 }}>Log Out</Text>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </RBSheet>
            <Popover onRequestClose={() => setIsVisible(prev => ({ ...prev, popOver: false }))} isVisible={isVisible?.popOver} popoverStyle={{ borderRadius: 10, paddingBottom: 35, width: 330 }} >
                <Dialog dialogProps={isVisible?.notification ? notificationDialog : logOutDialog} confirmation={handleConfirmation} />
            </Popover>
        </SafeAreaView>
    )
}
export default Dashboard;

import * as Yup from 'yup';
import { useFormik } from "formik";
import { useEffect, useState } from 'react';
import Popover from 'react-native-popover-view';
import DatePicker from 'react-native-date-picker';
import { Calendar } from 'react-native-calendars';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from "react-native-safe-area-context";
import notifee, { TriggerType, AndroidImportance } from '@notifee/react-native';
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { ActivityIndicator, BackHandler, Keyboard, Linking, Pressable, ScrollView, Text, TextInput, View } from "react-native"

//icon-Imports
import Entypo from 'react-native-vector-icons/Entypo';
import CloseIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

//custom-Imports
import Dialog from '../../shared/dialogProp';
import { appFonts } from "../../shared/appFonts";
import { appColors } from "../../shared/appColors";
import { addTasks, editTasks } from '../../redux/slices/taskSlice';
import { setNotificationAllowed } from '../../redux/slices/authSlice';
import { formatDateforUI, formatTimeforUI, getBackgroundColor } from '../../shared/config';
import { color } from '@rneui/base';

const AddTask = () => {

    //variable holds the focus of the screen
    const isFocused = useIsFocused()
    //variable helps to navigate
    const navigation = useNavigation();
    //holds route value
    const { params } = useRoute()
    //controls the main loader
    const [isLoad, setIsLoad] = useState(true)
    //control the visibility of calendar and timer
    const [isVisible, setIsVisible] = useState({ calendar: false, timer: false })
    //controls the visibility of popover
    const [openPopover, setOpenPopover] = useState(false)
    //variable control the secondPopover
    const [isOpen, setIsOpen] = useState(false)
    //variables used to map the values
    const [taskPriority, setTaskPriority] = useState([{ status: "Low", selected: false }, { status: "Medium", selected: false }, { status: "High", selected: false }])
    //redux-hooks
    const dispatch = useDispatch();
    //redux-kook
    const { notificationAllowed } = useSelector(state => state?.authSlice)

    //leaveDialog message for popover
    const leaveDialogProps = {
        content: "You have unsaved changes. Are you sure you want to leave this page?",
        button: [{ id: 1, label: "No", color: appColors.dark, backgroundColor: appColors.light }, { id: 2, label: "Yes", color: appColors.light, backgroundColor: appColors.lightDark }],
        image: { iconName: 'alert-outline', color: appColors?.warning }
    }

    //dueTime Expires popover
    const dueDateProps = {
        content: "It looks like the due time is in the past. Please pick a future time instead",
        image: { iconName: 'alert-outline', color: appColors?.warning },
        button: [{ id: 1, label: "Okay", color: appColors?.light, backgroundColor: appColors.lightDark }]
    }

    useEffect(() => {
        getInitiate()
        console.log("params--", JSON.stringify(params, null, 4))
    }, [])

    //renders while component mounts
    const getInitiate = () => {
        if (params?.priority) {
            setTaskPriority((prev) =>
                prev.map((p) => ({
                    ...p,
                    selected: p.status === params.priority,
                }))
            );
        }
        setTimeout(() => {
            setIsLoad(false)
        }, 400);
    }

    //validation schema
    const validationSchema = Yup.object().shape({
        title: Yup.string().required(),
        description: Yup.string().required(),
    })

    //handles formik
    const formik = useFormik({
        initialValues: {
            title: params?.title ?? "",
            description: params?.description ?? "",
            dueDate: params?.dueDate ?? new Date().toISOString().split("T")[0],
            dueTime: params?.dueTime ? new Date(params?.dueTime) : (() => { const date = new Date(); date.setHours(date.getHours() + 2); return date })(),
            priority: params?.priority ? params?.priority : "",
            favourite: params?.favourite ?? false,
            notifyThisTask: params?.notifyThisTask ?? false,
            taskStatus: "",
            createdAt: params?.createdAt ?? "",
            modifyAt: params?.modifyAt ?? "",
            apiSync: params?.apiSync ?? false
        },
        validationSchema: validationSchema,
        onSubmit: () => {
            setTimeout(() => {
                taskCreation()
            }, 400);
        }
    })

    //handles the hardware backPress
    useEffect(() => {
        const onBackPress = () => {
            if (formik?.dirty) {
                setOpenPopover(true)
                return true
            }
            return false
        };

        const backHandle = BackHandler.addEventListener("hardwareBackPress", onBackPress);
        return () => backHandle.remove();
    }, [formik?.dirty, isFocused]);

    //handle whiles the screen in edit 
    const handleTaskPriority = (status) => {
        formik?.setFieldValue("priority", status)
        setTaskPriority(prev => prev.map(item => ({ ...item, selected: item?.status === status })))
    }

    //task Creation method
    const taskCreation = async () => {
        //if notification enabled schedule notifications
        const data = formik?.values

        const getTaskTimestamp = (dueDate, dueTime) => {
            const dDate = new Date(dueDate);
            const dTime = new Date(dueTime);
            dDate.setHours(dTime.getHours());
            dDate.setMinutes(dTime.getMinutes());
            dDate.setSeconds(dTime.getSeconds());
            return dDate.getTime();
        };

        const timestamp = getTaskTimestamp(data.dueDate, data.dueTime);
        console.log("Final Timestamp:", timestamp, " Now:", Date.now())
        if (timestamp < Date.now()) {
            console.log("insidw---")
            setIsOpen(true)
            return
        }

        if (data?.notifyThisTask && notificationAllowed) {

            await notifee.createTriggerNotification({
                title: data?.title,
                body: "Your Task Reaches Deadline",
                android: {
                    channelId: "default",
                    sound: 'default',
                    importance: AndroidImportance.HIGH,
                }
            }, {
                type: TriggerType.TIMESTAMP,
                timestamp: timestamp,
            })
        }

        data.createdAt = new Date().getTime()
        data.modifyAt = new Date().getTime()
        data.apiSync = false

        if (params) {
            dispatch(editTasks(data))
        } else {
            dispatch(addTasks(data))
        }
        setTimeout(() => {
            formik?.resetForm();
            navigation.navigate("Dashboard")
        });


    }

    //handler backHandler
    const handleBackHandler = () => {
        if (formik?.dirty) {
            setOpenPopover(true)
        } else {
            navigation.goBack()
        }
    }
    //handles the confirmation message of popover
    const confirmation = (value) => {
        if (value === "Yes") {
            setOpenPopover(false)
            setTimeout(() => {
                navigation.goBack()
            });
        } else {
            setOpenPopover(false)
        }
    }

    //checks for notificationEnables otherwise redirect enable notification
    const checkForNotificationEnabled = async () => {
        const settings = await notifee.getNotificationSettings();

        if (settings.authorizationStatus === notifee.AuthorizationStatus.AUTHORIZED) {
            await notifee.createChannel({
                id: 'default',
                name: 'Default Channel',
                sound: 'default',
                importance: AndroidImportance.HIGH,
            });

            dispatch(setNotificationAllowed(true))
            return true;
        }
        else {
            Linking.openSettings()
        }
    }


    return (
        <SafeAreaView onStartShouldSetResponder={() => { Keyboard.dismiss(); return false }} style={{ flex: 1, backgroundColor: appColors?.lightBackground }}>
            <View style={{ paddingTop: 15, flexDirection: "row", alignItems: "center", gap: 15, paddingLeft: 15, paddingRight: 20, justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", gap: 15, alignItems: "center" }}>
                    <Pressable onPress={() => handleBackHandler()}>
                        <CloseIcon name='arrow-back' size={26} color={appColors?.grey} />
                    </Pressable>
                    <View>
                        <Text style={{ fontSize: 17, fontFamily: appFonts?.bold, color: appColors?.grey }}>{params ? "Edit Tasks" : "Add Tasks"}</Text>
                    </View>
                </View>
                <Pressable disabled={notificationAllowed} onPress={() => checkForNotificationEnabled()} style={{ alignSelf: "flex-end" }}>
                    <MaterialIcons name={notificationAllowed ? "notifications-on" : "notifications-off"} size={23} color={notificationAllowed ? appColors?.green : appColors?.red} />
                </Pressable>
            </View>
            {isLoad ?
                <View style={{ flex: 1, backgroundColor: appColors?.lightBackground, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size={30} color={appColors?.lightDark} />
                </View>
                :
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingVertical: 20, marginHorizontal: 15, paddingTop: 30 }}>
                    <View style={{ paddingVertical: 10, backgroundColor: appColors?.secondary, borderRadius: 8 }}>
                        <Text style={{ fontFamily: appFonts?.bold, color: appColors?.dark, fontSize: 15, paddingLeft: 10 }}>Title</Text>
                        <TextInput
                            value={formik?.values?.title}
                            onChangeText={(txt) => formik?.setFieldValue("title", txt)}
                            style={{
                                fontFamily: appFonts.medium,
                                height: 30,
                                textAlignVertical: 'top',
                                justifyContent: "flex-start",
                                paddingHorizontal: 11,
                                fontSize: 15,
                                paddingTop: 3,
                                color: appColors?.grey
                            }}
                        />
                    </View>
                    <View style={{ marginTop: 20, paddingVertical: 10, backgroundColor: appColors?.secondary, borderRadius: 8 }}>
                        <Text style={{ fontFamily: appFonts?.bold, color: appColors?.dark, fontSize: 15, paddingLeft: 10 }}>Description</Text>
                        <TextInput
                            value={formik?.values?.description}
                            multiline
                            onChangeText={(txt) => formik?.setFieldValue("description", txt)}
                            style={{
                                fontFamily: appFonts.medium,
                                height: 100,
                                textAlignVertical: 'top',
                                justifyContent: "flex-start",
                                paddingHorizontal: 11,
                                fontSize: 15,
                                paddingTop: 3,
                                color: appColors?.grey
                            }}
                        />
                    </View>
                    <View style={{ marginTop: 20, backgroundColor: appColors?.secondary, paddingVertical: 13, borderRadius: 8 }}>
                        <Pressable onPress={() => setIsVisible({ calendar: true, timer: false })} style={{ paddingHorizontal: 12, flexDirection: "row", gap: 15, alignItems: "center" }}>
                            <Entypo name='calendar' size={26} />
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <Text style={{ fontFamily: appFonts?.bold, color: appColors?.dark, fontSize: 14 }}>Due Date :</Text>
                                <Text style={{ fontFamily: appFonts?.medium, color: appColors?.grey, fontSize: 15 }}>{formatDateforUI(formik?.values?.dueDate)}</Text>
                            </View>
                        </Pressable>
                    </View>
                    <View style={{ marginTop: 20, backgroundColor: appColors?.secondary, paddingVertical: 10, borderRadius: 8 }}>
                        <View style={{ paddingHorizontal: 12 }}>
                            <Text style={{ fontFamily: appFonts?.bold, color: appColors?.dark }}>Task Priority</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "space-around", paddingTop: 10, paddingBottom: 7 }}>
                                {taskPriority?.map((item, index) => {
                                    return (
                                        <Pressable key={index} onPress={() => handleTaskPriority(item?.status)} style={{ backgroundColor: getBackgroundColor(item), paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, flex: 1, justifyContent: "center", alignItems: "center" }}>
                                            <Text style={{ fontFamily: appFonts?.medium, fontSize: 15, color: item?.selected ? appColors?.light : appColors?.dark }}>{item?.status}</Text>
                                        </Pressable>
                                    )
                                })}
                            </View>
                        </View>
                    </View>
                    <View style={{ marginTop: 20, backgroundColor: appColors?.secondary, paddingVertical: 13, borderRadius: 8 }}>
                        <Pressable onPress={() => setIsVisible({ calendar: false, timer: true })} style={{ paddingHorizontal: 12, flexDirection: "row", gap: 15, alignItems: "center" }}>
                            <MaterialIcons name='timer' size={27} />
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <Text style={{ fontFamily: appFonts?.bold, color: appColors?.dark, fontSize: 14 }}>Due Time :</Text>
                                <Text style={{ fontFamily: appFonts?.medium, color: appColors?.grey, fontSize: 15 }}>{formatTimeforUI(formik?.values?.dueTime)}</Text>
                            </View>
                        </Pressable>
                    </View>
                    <View style={{ marginTop: 20, backgroundColor: appColors?.secondary, paddingVertical: 10, borderRadius: 8 }}>
                        <Pressable disabled={!notificationAllowed} onPress={() => formik?.setFieldValue("notifyThisTask", !formik?.values?.notifyThisTask)} style={{ paddingHorizontal: 12, paddingVertical: 5, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Text style={{ fontFamily: appFonts?.bold, color: appColors?.dark }}>{formik?.values?.notifyThisTask ? "Notification Enabled" : "Notification Off"}</Text>
                            <MaterialIcons name={formik?.values?.notifyThisTask ? "notifications-on" : "notifications-off"} size={23} color={formik?.values?.notifyThisTask ? appColors?.green : appColors?.red} />
                        </Pressable>
                    </View>
                    <Pressable disabled={!formik?.isValid || !formik?.dirty} onPress={() => { formik?.handleSubmit() }} style={{ marginTop: 40, backgroundColor: appColors?.grey, paddingVertical: 15, borderRadius: 8, justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ color: appColors?.light, fontFamily: appFonts?.medium }}>{params ? "SAVE TASK" : "CREATE TASK"}</Text>
                    </Pressable>
                </ScrollView>
            }
            <Popover onRequestClose={() => setIsVisible({ calendar: false, timer: false })} isVisible={isVisible?.calendar} popoverStyle={{ borderRadius: 10, paddingBottom: 35, width: 330 }} >
                <Calendar
                    minDate={new Date().toISOString().split("T")[0]}
                    current={formik?.values?.dueDate}
                    markedDates={{
                        [formik.values.dueDate]: {
                            selected: true,
                            selectedColor: "pink",
                            selectedTextColor: "black",
                        },
                    }}
                    onDayPress={(day) => {
                        formik.setFieldValue("dueDate", day.dateString);
                        setIsVisible({ calendar: false, timer: false })
                    }}
                />
            </Popover>
            <Popover onRequestClose={() => setOpenPopover(false)} isVisible={openPopover} popoverStyle={{ borderRadius: 10, paddingBottom: 35, width: 330 }}>
                <Dialog dialogProps={leaveDialogProps} confirmation={confirmation} />
            </Popover>
            <Popover onRequestClose={() => setIsOpen(false)} isVisible={isOpen} popoverStyle={{ borderRadius: 10, paddingBottom: 35, width: 330 }}>
                <Dialog dialogProps={dueDateProps} confirmation={() => setIsOpen(false)} />
            </Popover>
            <DatePicker
                modal
                minimumDate={new Date()}
                open={isVisible.timer}
                date={formik?.values?.dueTime}
                mode="time"
                onConfirm={(time) => {
                    setIsVisible({ calendar: false, timer: false })
                    formik?.setFieldValue("dueTime", time)
                }}
                onCancel={() => setIsVisible({ calendar: false, timer: false })}
            />
        </SafeAreaView >
    )
}

export default AddTask;
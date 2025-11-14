import * as Yup from 'yup';
import { useFormik } from "formik";
import { useEffect, useState } from 'react';
import Popover from 'react-native-popover-view';
import DatePicker from 'react-native-date-picker';
import { Calendar } from 'react-native-calendars';
import NetInfo from "@react-native-community/netinfo";
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, BackHandler, Keyboard, Pressable, ScrollView, Text, TextInput, View } from "react-native"

//icon-Imports
import Entypo from 'react-native-vector-icons/Entypo';
import CloseIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

//custom-Imports
import Dialog from '../../shared/dialogProp';
import { appFonts } from "../../shared/appFonts";
import { appColors } from "../../shared/appColors";
import { addTasks } from '../../redux/slices/taskSlice';
import { formatDateforUI, formatTimeforUI, getBackgroundColor } from '../../shared/config';

const AddTask = () => {

    let isNetworkConnected = false

    const isFocused = useIsFocused()

    const navigation = useNavigation();

    const { params } = useRoute()

    const [isLoad, setIsLoad] = useState(true)

    const [isVisible, setIsVisible] = useState({ calendar: false, timer: false })

    const [openPopover, setOpenPopover] = useState(false)

    const [isClicked, setIsClicked] = useState(false)

    const [taskPriority, setTaskPriority] = useState([{ status: "Low", selected: false }, { status: "Medium", selected: false }, { status: "High", selected: false }])

    const dispatch = useDispatch();

    const { tasks } = useSelector(state => state?.taskSlice)

    const leaveDialogProps = {
        content: "You have unsaved changes. Are you sure you want to leave this page?",
        button: [{ id: 1, label: "No", color: appColors.dark, backgroundColor: appColors.light }, { id: 2, label: "Yes", color: appColors.light, backgroundColor: appColors.lightDark }],
        image: { iconName: 'alert-outline', color: appColors?.warning }
    }

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            isNetworkConnected = state?.isConnected
        })
        // Cleanup subscription
        return () => unsubscribe();
    }, [])


    useEffect(() => {
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
    }, [])




    const validationSchema = Yup.object().shape({
        title: Yup.string().required(),
        description: Yup.string().required(),
    })

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

    const handleTaskPriority = (status) => {
        formik?.setFieldValue("priority", status)
        setTaskPriority(prev => prev.map(item => ({ ...item, selected: item?.status === status })))
    }

    const taskCreation = () => {
        const data = formik?.values
        data.createdAt = new Date().getTime()
        data.modifyAt = new Date().getTime()
        if (isNetworkConnected) {
            data.apiSync = true
        } else {
            data.apiSync = false
        }
        dispatch(addTasks(data))
        if (data?.notifyThisTask) {

        }
        formik?.resetForm();
        navigation.navigate("Dashboard")
    }

    const handleBackHandler = () => {
        if (formik?.dirty) {
            setOpenPopover(true)
        } else {
            navigation.goBack()
        }
    }

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


    return (
        <SafeAreaView onStartShouldSetResponder={() => { Keyboard.dismiss(); return false }} style={{ flex: 1, backgroundColor: appColors?.lightBackground }}>
            <View style={{ paddingTop: 15, flexDirection: "row", gap: 15, paddingHorizontal: 15 }}>
                <Pressable onPress={() => handleBackHandler()}>
                    <CloseIcon name='arrow-back' size={26} color={appColors?.grey} />
                </Pressable>
                <Text style={{ fontSize: 17, fontFamily: appFonts?.bold, color: appColors?.grey }}>{params ? "Edit Tasks" : "Add Tasks"}</Text>
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
                        <Pressable onPress={() => formik?.setFieldValue("notifyThisTask", !formik?.values?.notifyThisTask)} style={{ paddingHorizontal: 12, paddingVertical: 5, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Text style={{ fontFamily: appFonts?.bold, color: appColors?.dark }}>{formik?.values?.notifyThisTask ? "Notification Enabled" : "Notification Off"}</Text>
                            <MaterialIcons name={formik?.values?.notifyThisTask ? "notifications-on" : "notifications-off"} size={23} color={formik?.values?.notifyThisTask ? appColors?.green : appColors?.red} />
                        </Pressable>
                    </View>
                    <Pressable disabled={!formik?.isValid || !formik?.dirty || isClicked} onPress={() => { setIsClicked(true); formik?.handleSubmit() }} style={{ marginTop: 40, backgroundColor: appColors?.grey, paddingVertical: 15, borderRadius: 8, justifyContent: "center", alignItems: "center" }}>
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
    )/*  */
}

export default AddTask;
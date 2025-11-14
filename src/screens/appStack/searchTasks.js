import { FlatList } from 'react-native';
import { Divider, SearchBar } from '@rneui/base';
import FastImage from "react-native-fast-image";
import RBSheet from "react-native-raw-bottom-sheet";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState, } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Pressable, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

//icon-Imports
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

//custom-Imports
import { appFonts } from "../../shared/appFonts";
import { appColors } from "../../shared/appColors";
import { addFav } from '../../redux/slices/taskSlice';
import { formatTimeforUI } from '../../shared/config';

const SearchScreen = () => {

    const dispatch = useDispatch();
    //variable handles the navigation
    const navigation = useNavigation()
    //handles the safeArea
    const { top, bottom } = useSafeAreaInsets();
    //ref control the Rbsheet
    const refRBSheet = useRef(null)
    //Variable used to control the loading state
    const [isload, setIsload] = useState(true);
    //Variable used to hold the searchText
    const [searchText, setSearchText] = useState("");
    //Variable used to store the selected sort option
    const [selectedSort, setSelectedSort] = useState({ id: null })
    //variables store searched Data
    const [data, setData] = useState([]);
    //reduc-hook
    const { tasks } = useSelector(state => state.taskSlice)
    //variables hold the image location
    const noRecord = require("../../assets/images/no_record.png")
    //holds the sorting option
    const sortby = [
        { id: 1, value: "Favourite Tasks", code: "true" },
        { id: 2, value: "Tasks Priority Low", code: "Low" },
        { id: 3, value: "Tasks Priority Medium", code: "Medium" },
        { id: 4, value: "Tasks Priority High", code: "High" },
    ]

    useEffect(() => {
        getInitiate()
    }, [])

    useEffect(() => {
        if (searchText) {
            const query = searchText?.trim().toLowerCase();
            if (query) {
                const filtered = tasks.filter(task =>
                    task.title?.toLowerCase().includes(query)
                );
                setData(filtered);
            }
        } else {
            setData(tasks)
        }
    }, [searchText])

    const getInitiate = () => {
        setData(tasks)
        setTimeout(() => {
            setIsload(false)
        }, 1000);
    }
    //adds fav in task data
    const handleFav = (id) => {
        dispatch(addFav(id))
        setData(prev => prev.map(itm => itm.createdAt == id ? { ...itm, favourite: !itm.favourite } : itm))
    }
    //handles sort method
    const handleSortOption = (item) => {
        setIsload(true);
        if (selectedSort.id === item?.id) {
            setData(tasks)
            setSelectedSort({ id: null })
        } else {
            setSelectedSort({ id: item?.id })
            if ([2, 3, 4].includes(item?.id)) {
                setData(tasks?.filter(tasks => tasks?.priority === item?.code))
            } else {
                setData(tasks?.filter(item => item.favourite))
            }
        }
        setTimeout(() => {
            setIsload(false)
        }, 1000);
    }

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
    //helper function
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

    const taskEmptyComponent = useCallback(() => {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: -130 }}>
                <FastImage
                    source={noRecord}
                    style={{ width: 200, height: 200 }}
                />
                <Text style={{ fontFamily: appFonts?.medium, color: appColors?.dark, fontSize: 15, paddingTop: 20 }}>{`No Tasks Found`}</Text>
            </View>
        )
    }, [])

    return (
        <KeyboardAvoidingView onStartShouldSetResponder={() => { Keyboard.dismiss(); return false }} style={{ flex: 1, backgroundColor: appColors?.light, paddingTop: top, paddingBottom: bottom }}>
            <StatusBar barStyle={"dark-content"} />
            <View style={{ paddingHorizontal: 15, paddingTop: 15, flexDirection: "row", gap: 10, alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                    <SearchBar
                        value={searchText}
                        placeholder="Search by title.."
                        searchIcon={{ size: 25, color: appColors?.lightDark, style: { padding: 0, marginLeft: 5 } }}
                        allowFontScaling
                        inputMode="search"
                        placeholderTextColor={appColors?.lightDark}
                        verticalAlign="middle"
                        textAlignVertical="center"
                        onChangeText={(text) => setSearchText(text)}
                        clearIcon={searchText?.length ? true : false}
                        inputStyle={{ fontSize: 15, fontFamily: appFonts?.medium, color: appColors?.dark }}
                        inputContainerStyle={{ backgroundColor: appColors?.secondary, borderRadius: 13, height: 48, paddingHorizontal: 0, paddingVertical: 0 }}
                        containerStyle={{ backgroundColor: appColors?.light, borderTopColor: appColors?.light, borderBottomColor: appColors?.light, paddingHorizontal: 0, paddingVertical: 0, }}
                    />
                </View>
                <TouchableOpacity onPress={() => { Keyboard.dismiss(); setTimeout(() => { refRBSheet?.current?.open() }, 200); }} style={{ aspectRatio: 1, backgroundColor: appColors?.lightGrey, padding: 8, borderRadius: 99 }}>
                    <Ionicons name="filter" size={23} color={appColors?.light} />
                </TouchableOpacity>
            </View>
            {isload ?
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: -100 }}>
                    <ActivityIndicator size={30} color={appColors?.lightDark} />
                </View>
                :
                <View style={{ flex: 1, paddingVertical: 20, paddingHorizontal: 15 }}>
                    <FlatList
                        data={data}
                        keyExtractor={(_, ind) => ind.toString()}
                        renderItem={taskRenderItem}
                        ListEmptyComponent={taskEmptyComponent}
                        contentContainerStyle={{ flex: data?.length ? undefined : 1 }}
                    />
                </View>
            }
            <RBSheet ref={refRBSheet} draggable customModalProps={{ statusBarTranslucent: true }} height={265} customStyles={{ container: { borderTopEndRadius: 20, borderTopStartRadius: 20 } }}>
                <View style={{ flex: 1, backgroundColor: appColors?.light, paddingHorizontal: 20, paddingBottom: bottom }}>
                    <View style={{ alignSelf: "center", marginTop: 5, marginBottom: 12 }}>
                        <Text style={{ fontFamily: appFonts?.medium, color: appColors?.dark, fontSize: 14 }}>Sort by</Text>
                    </View>
                    <Divider style={{ marginTop: 1, marginBottom: 8 }} />
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, backgroundColor: appColors?.light, justifyContent: "center", overflow: "hidden" }}>
                        {sortby?.map((itm, ind) =>
                            <TouchableOpacity key={ind} onPress={() => { refRBSheet?.current?.close(); setTimeout(() => handleSortOption(itm)); }} >
                                <View style={{ paddingVertical: 10, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                    <Text style={{ fontFamily: appFonts?.medium, color: appColors?.lightGrey }}>{itm?.value}</Text>
                                    <MaterialIcons name='check' color={(selectedSort?.id === itm?.id) ? appColors?.lightGrey : appColors?.light} size={22} />
                                </View>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
            </RBSheet >
        </KeyboardAvoidingView >
    )
}

export default SearchScreen
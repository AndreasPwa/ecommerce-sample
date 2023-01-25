import React, { useEffect, useState, useRef } from "react";
import {
    StyleSheet,
    View,
    ScrollView,
    SafeAreaView,
    Text,
    TextInput,
    Image,
    Alert,
    Keyboard,
    Pressable,
    Modal,
    BackHandler,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView
} from "react-native";
import { Appbar, RadioButton, Button, } from "react-native-paper";
import { Icon } from "react-native-elements";
import SelectDropdown from "react-native-select-dropdown";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Moment from "moment";
Moment.locale("en");
import { api_url, error } from "../Global";

export default function StudentProfile({ route, navigation }) {

    const [edit, setEdit] = useState(false);
    const [userData, setUserData] = useState({});

    useEffect(() => {
        navigation.addListener("focus", () => {
            AsyncStorage.getItem("token").then((value) => {
                const token = JSON.parse(value);
                NetInfo.fetch().then((state) => {
                    state.isConnected
                        ? AsyncStorage.getItem("userData").then((value) => {
                            const userData = JSON.parse(value);
                            userInformation(userData);
                        })
                        : Alert.alert("", "Please check your internet connection", [
                            {
                                text: "OK",
                            },
                        ]);
                });
            });

            const backAction = () => {
                if (navigation.isFocused()) {
                    navigation.goBack(setEdit(false));
                    return true;
                }
            };
            BackHandler.addEventListener("hardwareBackPress", backAction);
            return () =>
                BackHandler.removeEventListener("hardwareBackPress", backAction);
        });
    }, [navigation]);

    const [state, setState] = useState([]);
    const [city, setCity] = useState([]);

    function userInformation(userData) {
        // console.log('Profile', userData.id);

        fetch(api_url + "users/" + userData.id)
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
                setUserData(userData);

                setName(userData.username);
                setEmail(userData.email);
                setPhone(userData?.phone ? userData?.phone : json.phone);
                setAddress(userData?.address ? userData?.address.address : json.address.address);
                setState(userData?.address ? userData?.address.state : json.address.state);
                setCity(userData?.address ? userData?.address.city : json.address.city);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const [showError, setShowError] = useState({
        name: false,
        email: false,
        phone: false,
        state: false,
        city: false,
        address: false,
    });

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [isLoading, setisLoading] = useState(false);

    const [existEmail, setExistEmail] = useState(false);

    const emailregex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
    const phoneregex = /\+[0-9]|0?9+[0-9]{4,10}$/;

    function submitPressed() {
        setShowError({
            name: name == "" || name.length > 100,
            email: email == "" || !emailregex.test(email),
            phone: phone == "" || !phoneregex.test(phone),
            state: state == "",
            city: city == "",
            address: address == "" || address.length > 200,
        });

        Keyboard.dismiss();

        name == "" ||
            name.length > 100 ||
            email == "" ||
            !emailregex.test(email) ||
            phone == "" ||
            !phoneregex.test(phone) ||
            state == "" ||
            city == "" ||
            address == "" ||
            address.length > 200
            ? null
            : NetInfo.fetch().then((state) => {
                state.isConnected
                    ? userUpdate()
                    : Alert.alert("", "Please check your internet connection", [
                        {
                            text: "OK",
                        },
                    ]);
            });
    }

    function userUpdate() {
        setisLoading(true);

        let updateData = {
            username: name,
            email: email,
            phone: phone,
            address: {
                address: address,
                city: city,
                state: state
            },
        };

        AsyncStorage.getItem("userData").then((value) => {
            const userData = JSON.parse(value);

            fetch(api_url + 'users/' + userData.id, {
                method: 'PUT', /* or PATCH */
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            }).then((response) => response.json())
                .then((json) => {
                    console.log('user update', json);
                    AsyncStorage.setItem("userData", JSON.stringify(json));
                    (Alert.alert("Profile Update", 'Success', [
                        { text: "OK" },
                    ]),
                        setEdit(false),
                        setExistEmail(false),
                        navigation.navigate("ProfileSetting"))

                    setisLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                    setisLoading(false);
                });
        });
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <Appbar style={styles.topBar}>
                    <Appbar.Action
                        icon="arrow-left"
                        onPress={() => {
                            navigation.goBack();
                            setEdit(false);
                        }}
                    />
                    <Appbar.Content
                        title={"Profile"}
                        titleStyle={styles.headerTitle}
                        style={styles.headers}
                    />
                    <Appbar.Action
                        icon="square-edit-outline"
                        onPress={() => {
                            userData.id < 100 ? setEdit(true) : Alert.alert("", 'The registered user cannot edit the reason why it is not saved in the database!', [{ text: "OK" },]);
                        }}
                    />
                </Appbar>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps={"handled"}
                >
                    <SafeAreaView style={styles.container}>
                        <View style={styles.logoBG}>
                            {userData.image ? (
                                <Image source={{ uri: userData.image }} style={styles.logoImg} />
                            ) : (
                                <View style={styles.profile}>
                                    <Icon name={"person"} size={45} />
                                </View>
                            )}
                        </View>

                        <View style={{ marginVertical: 15 }}>
                            <Text style={styles.fontLexend}>Name</Text>
                            {edit ? (
                                <View>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholderTextColor="#888888"
                                        placeholder="Name"
                                        value={name}
                                        onChangeText={(value) => setName(value)}
                                    />
                                    {showError.name ? (
                                        name == "" ? (
                                            <Text style={styles.errorTextStyle}>
                                                Name {error.require_error}
                                            </Text>
                                        ) : name.length > 100 ? (
                                            <Text style={styles.errorTextStyle}>
                                                Name {error.maximum_length_100_error}
                                            </Text>
                                        ) : null
                                    ) : null}
                                </View>
                            ) : (
                                <Text style={styles.userdata}>{userData.username}</Text>
                            )}
                        </View>

                        <View style={{ marginVertical: 15 }}>
                            <Text style={styles.fontLexend}>Email</Text>
                            {edit ? (
                                <View>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholderTextColor="#888888"
                                        placeholder="Email"
                                        keyboardType="email-address"
                                        value={email}
                                        onChangeText={(value) => {
                                            setEmail(value);
                                            setExistEmail(false);
                                        }}
                                    />
                                    {showError.email ? (
                                        email == "" ? (
                                            <Text style={styles.errorTextStyle}>
                                                Email {error.require_error}
                                            </Text>
                                        ) : !emailregex.test(email) ? (
                                            <Text style={styles.errorTextStyle}>
                                                Email {error.pattern_error}
                                            </Text>
                                        ) : null
                                    ) : existEmail ? (
                                        <Text style={styles.errorTextStyle}>
                                            {"Email already exist."}
                                        </Text>
                                    ) : null}
                                </View>
                            ) : (
                                <Text style={styles.userdata}>{userData.email}</Text>
                            )}
                        </View>

                        <View style={{ marginVertical: 15 }}>
                            <Text style={styles.fontLexend}>Phone Number</Text>
                            {edit ? (
                                <View>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholderTextColor="#888888"
                                        placeholder="Phone Number"
                                        keyboardType="numeric"
                                        maxLength={20}
                                        value={phone}
                                        onChangeText={(value) => setPhone(value)}
                                    />
                                    {showError.phone ? (
                                        phone == "" ? (
                                            <Text style={styles.errorTextStyle}>
                                                Phone Number {error.require_error}
                                            </Text>
                                        ) : !phoneregex.test(phone) ? (
                                            <Text style={styles.errorTextStyle}>
                                                Phone Number {error.pattern_error}
                                            </Text>
                                        ) : null
                                    ) : null}
                                </View>
                            ) : (
                                <Text style={styles.userdata}>
                                    {userData.phone}
                                </Text>
                            )}
                        </View>

                        <View style={{ marginVertical: 15 }}>
                            <Text style={styles.fontLexend}>State</Text>
                            {edit ? (
                                <View>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholderTextColor="#888888"
                                        placeholder="State"
                                        value={state}
                                        onChangeText={(value) => setState(value)}
                                    />
                                    {showError.state ? (
                                        state == "" ? (
                                            <Text style={styles.errorTextStyle}>
                                                State {error.require_error}
                                            </Text>
                                        ) : state.length > 100 ? (
                                            <Text style={styles.errorTextStyle}>
                                                State {error.maximum_length_100_error}
                                            </Text>
                                        ) : null
                                    ) : null}
                                </View>
                            ) : (
                                <Text style={styles.userdata}>{state}</Text>
                            )}
                        </View>
                        <View style={{ marginVertical: 15 }}>
                            <Text style={styles.fontLexend}>City</Text>
                            {edit ? (
                                <View>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholderTextColor="#888888"
                                        placeholder="City"
                                        value={city}
                                        onChangeText={(value) => setCity(value)}
                                    />
                                    {showError.city ? (
                                        city == "" ? (
                                            <Text style={styles.errorTextStyle}>
                                                City {error.require_error}
                                            </Text>
                                        ) : city.length > 100 ? (
                                            <Text style={styles.errorTextStyle}>
                                                City {error.maximum_length_100_error}
                                            </Text>
                                        ) : null
                                    ) : null}
                                </View>
                            ) : (
                                <Text style={styles.userdata}>{city}</Text>
                            )}
                        </View>

                        <View style={{ marginVertical: 15 }}>
                            <Text style={styles.fontLexend}>Address</Text>
                            {edit ? (
                                <View>
                                    <TextInput
                                        style={[styles.textInput, styles.textarea]}
                                        placeholderTextColor="#888888"
                                        placeholder="Address"
                                        multiline={true}
                                        value={address}
                                        onChangeText={(value) => setAddress(value)}
                                    />
                                    {showError.address ? (
                                        address == "" ? (
                                            <Text style={styles.errorTextStyle}>
                                                Address {error.require_error}
                                            </Text>
                                        ) : address.length > 200 ? (
                                            <Text style={styles.errorTextStyle}>
                                                Address {error.maximum_length_200_error}
                                            </Text>
                                        ) : null
                                    ) : null}
                                </View>
                            ) : (
                                <Text style={styles.userdata}>{address}, {city}, {state}</Text>
                            )}
                        </View>

                        {edit ? (
                            <View style={{ marginVertical: 15 }}>
                                <Button
                                    mode="contained"
                                    color={"#262c76"}
                                    onPress={() => submitPressed()}
                                >
                                    Update
                                </Button>
                            </View>
                        ) : null}
                    </SafeAreaView>
                </ScrollView>

                <Modal visible={isLoading} transparent={true}>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            backgroundColor: "rgba(1,1,1,0.3)",
                        }}
                    >
                        <View style={styles.loading}>
                            <ActivityIndicator size="large" color="#262c76" />
                            <Text style={{ marginTop: 8, marginLeft: 20, fontFamily: "Lexend" }}>
                                Please Wait
                            </Text>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: "center",
        margin: 20,
    },
    topBar: {
        backgroundColor: "#262c76",
    },
    fontLexend: {
        fontFamily: "Lexend",
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: "Lexend",
        color: "#fff",
        textAlign: "center",
        padding: 0,
    },
    logoBG: {
        alignItems: "center",
        marginBottom: 40,
    },
    logoImg: {
        width: 120,
        height: 120,
        zIndex: 1,
        borderRadius: 100,
    },
    profile: {
        backgroundColor: "#ccc",
        borderRadius: 100,
        padding: 40,
    },
    chooseProfile: {
        marginTop: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: "#aaa",
        borderRadius: 15,
    },
    textInput: {
        marginTop: 5,
        paddingHorizontal: 10,
        paddingBottom: 2,
        height: 40,
        color: "#262c76",
        borderColor: "#262c76",
        borderWidth: 1,
        borderRadius: 5,
        fontFamily: "Lexend"
    },
    textarea: {
        padding: 10,
        height: 100,
        textAlignVertical: "top",
    },
    errorTextStyle: {
        fontSize: 12,
        fontFamily: "Lexend",
        color: "#ff0000",
        padding: 2,
        marginTop: 8,
        alignSelf: "flex-start",
    },

    dropdownBtnStyle: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#aaa",
        marginTop: 5,
        borderRadius: 5,
        width: "100%",
        height: 40,
    },
    dropdownBtnTextStyle: {
        fontSize: 16,
        fontFamily: "Lexend",
        textAlign: "left",
        marginLeft: 0,
        paddingBottom: 2
    },
    dropdownRowTextStyle: {
        fontSize: 16,
        fontFamily: "Lexend",
    },
    dropdownDropdownStyle: {
        backgroundColor: "#ffffff",
        borderRadius: 10,
    },
    loading: {
        flexDirection: "row",
        backgroundColor: "white",
        alignSelf: "center",
        padding: 20,
        width: 170,
        borderRadius: 5
    },
    userdata: {
        color: "#262c76",
        marginTop: 5,
        fontSize: 16,
        fontFamily: "Lexend"
    },
});

import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    ScrollView,
    SafeAreaView,
    Text,
    Dimensions,
    Image,
    Alert,
    Keyboard,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    BackHandler,
} from "react-native";
import { Button } from "react-native-paper";
import { Icon } from "react-native-elements";
import { FloatingLabelInput } from 'react-native-floating-label-input';
import { api_url, error } from "./Global";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from 'expo-device';

export default function Login({ route, navigation }) {
    const params = route.params;

    useEffect(() => {
        navigation.addListener("focus", () => {
            NetInfo.fetch().then((state) => {
                state.isConnected
                    ? null
                    : Alert.alert("", "Please check your internet connection", [
                        {
                            text: "OK",
                        },
                    ]);
            });
            const routeIndex = navigation.getState().index;
            const params = navigation.getState().routes[routeIndex].params;
            params ? setUserEmail(params.userID) : (setUserEmail(""), setPassword(""));

            setShowError({
                userEmail: false,
                password: false,
            });

            const backAction = () => {
                if (navigation.isFocused()) {
                    setExist(true);
                    return true;
                }
            };

            BackHandler.addEventListener("hardwareBackPress", backAction);
            return () =>
                BackHandler.removeEventListener("hardwareBackPress", backAction);
        });
    }, [navigation]);

    const [home, setHome] = useState(false);

    const [userEmail, setUserEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);

    const [userData, setUserData] = useState({});
    const [userType, setUserType] = useState("student");

    const [isLoading, setisLoading] = useState(false);

    const [exist, setExist] = useState(false);

    const [showError, setShowError] = useState({
        userEmail: false,
        password: false,
    });

    function submitPressed() {
        setShowError({
            userEmail: userEmail == "",
            password: password == "" || password.length < 7 || password.length > 12,
        });

        Keyboard.dismiss();

        userEmail == "" ||
            password == "" ||
            password.length < 7 ||
            password.length > 12
            ? null
            : NetInfo.fetch().then((state) => {
                state.isConnected
                    ? login()
                    : Alert.alert("", "Please check your internet connection", [
                        {
                            text: "OK",
                        },
                    ]);
            });
    }

    function login() {
        setisLoading(true);
        let bodyData = {
            username: userEmail,
            password: password,
        };
        //         username: 'kminchelle',
        //         password: '0lelplR',
        console.log('call login', bodyData);

        fetch(api_url + "auth/login", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                // "User-Agent": Device.brand + " " + Device.modelName + "; " + Device.osName + " " + Device.osVersion
            },
            body: JSON.stringify(bodyData),
        })
            .then((response) => response.json())
            .then((json) => {
                console.log('auth/login', json);
                json.message
                    ? Alert.alert("", json.message)
                    : (AsyncStorage.setItem("token", JSON.stringify(json.token)),
                        AsyncStorage.setItem("userData", JSON.stringify(json)),
                        AsyncStorage.setItem("usertype", json?.user?.is_staff ? JSON.stringify("staff") : JSON.stringify("user")),
                        navigation.navigate(params ? params.previousScreen : "Products"));

                setisLoading(false);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function exitApp() {
        setExist(false);
        setUserEmail("");
        setPassword("");
        setShowError({
            userEmail: false,
            password: false,
        });
    }

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps={"handled"}
                >
                    <SafeAreaView style={styles.container}>
                        <View style={styles.logoBG}>
                            <Image
                                source={require("../assets/ecommerce.png")}
                                style={styles.logoImg}
                            />
                        </View>
                        <View>
                            <View style={{ marginVertical: 10 }}>
                                <FloatingLabelInput
                                    containerStyles={styles.inputBorder}
                                    label={"User Name"}
                                    // keyboardType="email-address"
                                    customLabelStyles={{
                                        colorFocused: "#262c76",
                                        colorBlurred: "#262c76",
                                    }}
                                    labelStyles={{ fontFamily: "Lexend" }}
                                    inputStyles={{
                                        color: "#262c76",
                                        paddingTop: 15,
                                        fontFamily: "Lexend",
                                        fontSize: 16,
                                    }}
                                    value={userEmail}
                                    onChangeText={(value) => setUserEmail(value)}
                                />
                                {showError.userEmail ? (
                                    userEmail == "" ? (
                                        <Text style={styles.errorTextStyle}>
                                            User Name {error.require_error}
                                        </Text>
                                    ) : null
                                ) : null}
                            </View>

                            <View style={{ marginVertical: 10 }}>
                                <FloatingLabelInput
                                    containerStyles={styles.inputBorder}
                                    label={"Password"}
                                    customLabelStyles={{
                                        colorFocused: "#262c76",
                                        colorBlurred: "#262c76",
                                    }}
                                    labelStyles={{ fontFamily: "Lexend" }}
                                    inputStyles={{
                                        color: "#262c76",
                                        paddingTop: 15,
                                        fontFamily: "Lexend",
                                        fontSize: 16,
                                    }}
                                    isPassword
                                    togglePassword={show}
                                    value={password}
                                    onChangeText={(value) => setPassword(value)}
                                    customShowPasswordComponent={
                                        <Icon name={"visibility-off"} size={20} color="#262c76" />
                                    }
                                    customHidePasswordComponent={
                                        <Icon name={"visibility"} size={20} color="#262c76" />
                                    }
                                />
                                {showError.password ? (
                                    password == "" ? (
                                        <Text style={styles.errorTextStyle}>
                                            Password {error.require_error}
                                        </Text>
                                    ) : password.length < 8 || password.length > 12 ? (
                                        <Text style={styles.errorTextStyle}>
                                            {error.at_least_8_or_most_20_error}
                                        </Text>
                                    ) : null
                                ) : null}
                            </View>

                            <Button
                                mode="contained"
                                color={"#262c76"}
                                style={{ marginTop: 15 }}
                                labelStyle={{ fontFamily: "Lexend" }}
                                onPress={() => submitPressed()}
                            >
                                Login
                            </Button>

                            <View style={styles.textCenter}>
                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate("ForgetPassword");
                                        exitApp();
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: "#262c76",
                                            textAlign: "center",
                                            margin: 20,
                                            fontSize: 16,
                                            fontFamily: "Lexend",
                                        }}
                                    >
                                        {"Forget Password?"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.textCenter}>
                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate("Register");
                                        exitApp();
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: "#262c76",
                                            textAlign: "center",
                                            marginBottom: 20,
                                            fontSize: 16,
                                            fontFamily: "Lexend",
                                        }}
                                    >
                                        {"Register / Sign Up"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.textCenter}>
                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.navigate("Products");
                                        setUserEmail("");
                                        setPassword("");
                                        AsyncStorage.setItem("usertype", JSON.stringify("guest"));
                                    }}
                                >
                                    <Text
                                        style={styles.textGuest}
                                    >
                                        {"Guest User"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
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

                <Modal visible={exist} transparent={true}>
                    <View style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(1,1,1,0.3)" }}>
                        <View style={{ backgroundColor: "white", margin: 30, borderRadius: 5 }}>
                            <View style={{ paddingHorizontal: 20, paddingVertical: 15 }}>
                                <Text style={{ fontSize: 18, fontFamily: "LexendBold" }}>Exit App</Text>
                                <Text style={{ fontSize: 14, fontFamily: "Lexend", paddingBottom: 20 }}>Do you want to exit the app?</Text>
                                <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
                                    <Text onPress={() => setExist(false)} style={{ fontFamily: "Lexend", color: "#262c76", paddingRight: 40 }}>Cancel</Text>
                                    <Text onPress={() => BackHandler.exitApp(exitApp())} style={{ fontFamily: "Lexend", color: "#262c76", paddingRight: 10 }}>OK</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: "center",
        margin: 20,
    },
    logoBG: {
        alignItems: "center",
        marginBottom: 40,
    },
    logoImg: {
        width: 120,
        height: 120,
        zIndex: 1,
    },
    inputBorder: {
        flexDirection: "row",
        borderBottomColor: "#262c76",
        borderBottomWidth: 1,
        marginBottom: 10,
    },
    textInput: {
        width: "90%",
        height: 50,
        color: "#262c76",
    },
    pwdIcon: { position: "absolute", right: 10, paddingTop: 15 },
    fixToText: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    textCenter: {
        alignItems: "center",
    },
    textGuest: {
        backgroundColor: "#262c76",
        paddingTop: 2,
        paddingBottom: 4,
        paddingHorizontal: 10,
        color: "#fff",
        borderRadius: 4,
        fontSize: 16,
        fontFamily: "Lexend",
    },
    errorTextStyle: {
        fontSize: 12,
        color: "#fff",
        backgroundColor: "#e60012",
        padding: 4,
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    loading: {
        flexDirection: "row",
        backgroundColor: "white",
        alignSelf: "center",
        padding: 20,
        width: 170,
        borderRadius: 5
    },
});

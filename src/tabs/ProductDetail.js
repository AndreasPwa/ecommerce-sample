import React, { useState, useEffect, useRef } from "react";
import { Appbar, List, Avatar, Button, Snackbar, Provider } from "react-native-paper";
import {
    StyleSheet,
    Text, TextInput,
    View,
    Image, Keyboard,
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
    Dimensions,
    BackHandler,
    TouchableOpacity,
    KeyboardAvoidingView
} from "react-native";
import { Icon } from "react-native-elements";
import SelectDropdown from "react-native-select-dropdown";
import { ImageSlider } from "react-native-image-slider-banner";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { convertEng2Mm, api_url, img_url } from "../Global";
import PriceFormat from "../components/PriceFormat";

export default function NewDetail({ route, navigation }) {
    const productID = route.params.productID;

    const attriListDropdownRef = useRef({});
    const [data, setData] = useState({});
    const [stock, setStock] = useState('');
    const [attributes, setAttributes] = useState({});
    const [colorAttributs, setColorAttributes] = useState({});
    const [chooseAttri, SetChooseAttri] = useState({});
    const [quantityCount, SetQuantityCount] = useState(1);
    const [othercode, SetOtherCode] = useState("");
    const [otherError, SetOtherError] = useState("");

    const [images, setImages] = useState([]);
    const [cartCount, SetCartCount] = useState("");
    const [isLoading, setLoading] = useState(true);
    const [showToast, setshowToast] = useState(false);
    const [showErrorToast, setshowErrorToast] = useState(false)

    useEffect(() => {
        navigation.addListener("focus", () => {
            const routeIndex = navigation.getState().index;
            const productID = navigation.getState().routes[routeIndex].params.productID;

            fetchProductDetail(productID);

            AsyncStorage.getItem("cart").then((cartLists) => {
                var cartList = JSON.parse(cartLists);

                cartList ? SetCartCount(cartList.map(x => x.quantity).reduce((a, b) => a + b, 0)) : SetCartCount("");
            })

            const backAction = () => {
                if (navigation.isFocused()) {
                    navigation.goBack(setLoading(true), SetQuantityCount(1), SetOtherError(""));
                    return true;
                }
            };
            BackHandler.addEventListener("hardwareBackPress", backAction);
            return () =>
                BackHandler.removeEventListener("hardwareBackPress", backAction);
        });
    }, [navigation]);

    function fetchProductDetail(productID) {
        setLoading(true);
        fetch(api_url + "products/" + productID)
            .then((response) => response.json())
            .then((responseJson) => {
                console.log('fetchProductDetail', responseJson);
                setData(responseJson);

                AsyncStorage.getItem("cart").then((cartLists) => {
                    var cartList = JSON.parse(cartLists);
                    var result = cartList.find(c => c.id == productID);
                    console.log('left',result);
                    if (result) {
                        let left = responseJson.stock - result.quantity;
                        setStock(left);
                    } else {
                        setStock(responseJson.stock);
                    }
                });

                let imgArray = [];
                (responseJson.images.length != 0)
                    ? (
                        responseJson.images.map(img => imgArray.push({ img: img })),
                        setImages(imgArray)
                    )
                    : (setImages([{ img: responseJson.images }]));
                setLoading(false);
            })
            .catch((error) => {
                console.error("Data fetching failed");
            });
    }

    function addToCart(item) {
        AsyncStorage.getItem("cart").then((cartLists) => {
            var cart = [];
            var cartList = JSON.parse(cartLists);
            if (cartList) {
                for (var i = 0; i < cartList.length; i++) {
                    cart.push(cartList[i]);
                }
            }

            var result = cart.find(c => c.id == item.id);
            if (result) {
                result.quantity = result.quantity + quantityCount;
                item.quantity = result.quantity;
                setStock(stock - quantityCount);
            } else {
                item.quantity = quantityCount;
                setStock(stock - quantityCount);
                cart.push(item);
            }
            console.log('addToCart', item.quantity);

            item.quantity < item.stock
                ? (SetCartCount(cart.map(x => x.quantity).reduce((a, b) => a + b, 0)),
                    AsyncStorage.setItem("cart", JSON.stringify(cart)),
                    setshowToast(true))
                : (setshowErrorToast(true),
                    SetOtherError("Product does not have enough stock to proceed requested order quantity"))
        });
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView behavior='height' style={{ flex: 1 }}>
                <Appbar style={styles.topBar}>
                    <Appbar.Action
                        icon="arrow-left"
                        onPress={() => {
                            navigation.goBack();
                            setLoading(true);
                            SetQuantityCount(1);
                            SetOtherError("");
                        }}
                    />
                    <Appbar.Content
                        title={"Product Detail"}
                        titleStyle={styles.headerTitle}
                        style={styles.headers}
                    />
                    <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
                        <Appbar.Action icon="cart" color="#fff" onPress={() => navigation.navigate("Cart")} />
                        {cartCount ? (
                            <View style={{
                                position: "absolute",
                                backgroundColor: "red",
                                borderRadius: 50,
                                top: 5,
                                right: 5,
                                minWidth: 16,
                                minHeight: 16,
                            }}>
                                <Text
                                    style={{
                                        fontFamily: "Lexend",
                                        paddingBottom: 2,
                                        fontSize: 11,
                                        color: "#fff",
                                        textAlign: "center",
                                        paddingHorizontal: 2
                                    }}
                                >
                                    {cartCount > 99 ? "99+" : cartCount}
                                </Text>
                            </View>
                        ) : null}
                    </TouchableOpacity>
                </Appbar>

                <ScrollView showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'>
                    {isLoading ? (
                        <View style={styles.container}>
                            <View
                                style={[
                                    styles.container,
                                    { height: Dimensions.get("window").height },
                                ]}
                            >
                                <ActivityIndicator color="#262c76" size="large" />
                            </View>
                        </View>
                    ) : (
                        <View style={styles.container}>
                            <View>
                                <ImageSlider
                                    data={images}
                                    autoPlay={true}
                                    previewImageContainerStyle={{ backgroundColor: "#f2f2f2" }}
                                    closeIconColor="#262c76"
                                    activeIndicatorStyle={{ backgroundColor: "#262c76", top: 65 }}
                                    inActiveIndicatorStyle={{ backgroundColor: "#ccc", top: 65 }}
                                />

                                <Text
                                    style={{
                                        fontSize: 20,
                                        fontFamily: "Lexend",
                                        lineHeight: 35,
                                        color: "#262c76",
                                        marginTop: 30,
                                    }}
                                >
                                    {data.title}
                                </Text>


                                <View>
                                    <Text style={{ fontFamily: "Lexend" }}>{"(Brand: " + data.brand + ")"}</Text>
                                </View>

                                <View style={{ marginVertical: 10 }}>
                                    {(data.has_attribute) ?
                                        <PriceFormat price={chooseAttri.price} other={chooseAttri.display_name == "Other"}></PriceFormat>
                                        :
                                        <PriceFormat price={data.price}></PriceFormat>
                                    }
                                </View>

                                <View style={{ marginBottom: 10, flexDirection: "row" }}>
                                    <Text style={{ fontFamily: "Lexend" }}>{data.description}</Text>
                                </View>
                                <View style={{ marginBottom: 10, flexDirection: "row" }}>
                                    <Text style={{ fontFamily: "Lexend" }}>Stock: {stock} Left</Text>
                                </View>

                                {(otherError !== "") ? <Text style={styles.errorTextStyle}>{otherError}</Text> : null}
                                <View style={{ flexDirection: "row", marginTop: 10, justifyContent: "space-between" }}>

                                    <View style={{ flexDirection: "row" }}>
                                        <TouchableOpacity onPress={() => SetQuantityCount(quantityCount - 1)} disabled={quantityCount < 2}>
                                            <Image
                                                style={{ height: 30, width: 30 }}
                                                source={require("../../assets/photos/minus.png")}
                                            />
                                        </TouchableOpacity>
                                        <Text style={{ alignSelf: "center", paddingHorizontal: 15, fontSize: 18, color: "#262c76", fontFamily: "Lexend" }}>{quantityCount}</Text>
                                        <TouchableOpacity onPress={() => SetQuantityCount(quantityCount + 1)}>
                                            <Image
                                                style={{ height: 30, width: 30 }}
                                                source={require("../../assets/photos/plus.png")}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <Button
                                        mode="contained"
                                        color={"#262c76"}
                                        style={{
                                            height: 30,
                                        }}
                                        labelStyle={{
                                            color: "#fff",
                                            fontFamily: "Lexend",
                                            fontSize: 12,
                                            top: -2,
                                            height: 30
                                        }}
                                        onPress={() => addToCart(data)}
                                    >
                                        Add to cart
                                    </Button>
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>
                <Snackbar visible={showToast} duration={1000} style={{ backgroundColor: "#233762", height: 70 }}
                    onDismiss={() => setshowToast(false)}>
                    <Text style={{ fontFamily: "Lexend" }}>Product added to cart successfully.</Text>
                </Snackbar>
                <Snackbar visible={showErrorToast} duration={1000} style={{ backgroundColor: "#f75252", height: 70 }}
                    onDismiss={() => setshowErrorToast(false)}>
                    <Text style={{ fontFamily: "Lexend" }}>Product does not have enough stock to proceed requested order quantity.</Text>
                </Snackbar>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        margin: 10,
    },
    topBar: {
        backgroundColor: "#262c76",
        shadowColor: "#262c76",
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: "Lexend",
        color: "#fff",
        textAlign: "center",
        padding: 0,
    },
    headers: {
        // height: 100,
        // justifyContent: "center",
        // backgroundColor: "yellow",
    },
    fixToText: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    border: {
        borderColor: "#D8D8D8",
        borderWidth: 1,
        color: "grey",
        padding: 15,
        marginTop: 15,
    },

    listText: {
        fontSize: 16,
        fontFamily: "Lexend",
    },
    listItem: {
        paddingHorizontal: 20,
        paddingVertical: 0,
        borderBottomColor: "#f2f2f2",
        borderBottomWidth: 3
    },
    textInput: {
        width: "40%",
        paddingHorizontal: 10,
        height: 30,
        color: "#262c76",
        borderColor: "#262c76",
        borderWidth: 1,
        borderRadius: 5,
        fontFamily: "Lexend",
    },
    hashStyle: {
        width: 30,
        height: 30,
        textAlign: 'center',
        backgroundColor: '#e9ecef',
        borderColor: '#ced4da',
        borderWidth: 1,
        borderRadius: 5,
        fontSize: 14,
        fontFamily: "Lexend",
        paddingVertical: 5,
        marginLeft: 10
    },
    errorTextStyle: {
        fontSize: 12,
        fontFamily: "Lexend",
        color: "#ff0000",
        padding: 2,
        padding: 0,
        marginBottom: 10,
        alignSelf: "center",
    },
});

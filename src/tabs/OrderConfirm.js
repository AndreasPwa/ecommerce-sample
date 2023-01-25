import React from "react";
import {
    View,
    ScrollView,
    SafeAreaView,
    StyleSheet,
    ActivityIndicator,
    Keyboard,
    Alert,
    Text,
    TextInput,
    BackHandler,
} from "react-native";
import { Appbar, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api_url, error } from "../Global";

class OrderConfirm extends React.Component {
    constructor(props) {
        super(props);
        this.navigation = this.props.navigation;
        this.order = this.props.route.params.order;
        this.customerEmail = this.props.route.params.email;
        this.state = {
            loading: true,
            token: '',
        }
    }

    async componentDidMount() {
        AsyncStorage.getItem("token").then((value) => {
            const token = JSON.parse(value);
            this.setState({ token: token })
        });
    }

    placeOrder() {
        Alert.alert("", "There is no order API!", [{ text: "OK" },]);
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View>
                    <Appbar style={styles.header}>
                        <Appbar.Action
                            icon="arrow-left"
                            onPress={() => {
                                this.navigation.goBack();
                            }}
                        />
                        <Appbar.Content
                            title="Order Confirm"
                            titleStyle={styles.headerTitle}
                        />
                        <Appbar.Action />
                    </Appbar>
                </View>
                <View style={{ flex: 1 }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps={"handled"}
                        style={{ paddingTop: 10 }}>
                        <View>
                            <Text style={styles.title}>Your Order List</Text>
                            <View style={{ borderWidth: 1, borderRadius: 4, margin: 10 }}>
                                {this.props.route.params.order.map((item, index) =>
                                    <View key={index} style={{ padding: 5 }}>
                                        <Text
                                            numberOfLines={2}
                                            ellipsizeMode="tail"
                                            style={{ fontFamily: "Lexend" }}
                                        >
                                            {item.title}
                                        </Text>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                            <Text style={{ color: "#262c76", fontFamily: "Lexend" }}>{"$ "}{item.price + " x " + item.quantity}</Text>
                                            <Text style={{ color: "#262c76", fontFamily: "Lexend" }}>{"$ "}{(item.price * item.quantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
                                        </View>
                                    </View>
                                )}
                                <View style={{ borderStyle: "dashed", borderRadius: 1, borderWidth: 0.7 }}></View>
                                <View style={styles.fixToText}>
                                    <Text style={styles.leftText}>{"Sub-Total:  "}</Text>
                                    <Text style={styles.rightText}>{"$ "}{this.props.route.params.subTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
                                </View>
                                <View style={styles.fixToText}>
                                    <Text style={styles.leftText}>{"Discount:  "}</Text>
                                    <Text style={styles.rightText}>{"$ "}{this.props.route.params.tax.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
                                </View>
                                <View style={{ borderStyle: "dashed", borderRadius: 1, borderWidth: 0.7 }}></View>
                                <View style={styles.fixToText}>
                                    <Text style={styles.leftText}>{"Total:  "}</Text>
                                    <Text style={styles.rightText}>{"$ "}{(this.props.route.params.subTotal - this.props.route.params.tax).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ marginHorizontal: 10, marginVertical: 30 }}>
                            <Button
                                mode="contained"
                                color={"#262c76"}
                                style={{
                                    height: 30,
                                    width: 150,
                                    alignSelf: 'flex-end'
                                }}
                                labelStyle={{
                                    color: "#fff",
                                    fontFamily: "Lexend",
                                    fontSize: 12,
                                    top: -2,
                                    height: 30
                                }}
                                onPress={() => this.placeOrder()}
                            >
                                Place Order
                            </Button>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        flex: 1
    },
    header: {
        backgroundColor: "#262c76",
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: "Lexend",
        color: "#fff",
        textAlign: "center",
    },
    title: {
        fontFamily: "LexendBold",
        fontSize: 18,
        color: "#707070",
        marginLeft: 10
    },
    fixToText: {
        flexDirection: "row",
        overflow: "hidden",
        padding: 5
    },
    leftText: {
        width: "50%",
        // fontSize: 16,
        fontFamily: "Lexend"
    },
    rightText: {
        width: "50%",
        // fontSize: 16,
        fontFamily: "Lexend",
        textAlign: "right"
    },
});

export default OrderConfirm
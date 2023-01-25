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
    KeyboardAvoidingView,
} from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { Appbar, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api_url, error } from "../Global";
import { ButtonGroup } from "react-native-elements";
import { Icon } from "react-native-elements";

class Checkout extends React.Component {
    constructor(props) {
        super(props);
        this.townshipDropdownRef = React.createRef();
        this.navigation = this.props.navigation;
        this.saveOrder = this.props.route.params
        this.emailregex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
        this.phoneregex = /\+?95|0?9+[0-9]{7,10}$/;
        this.state = {
            package: [],
            tax: "",
            subTotal: "",

            // contactEmail: "",
            name: "",
            email: "",
            phone: "",
            address: "",
            district: '',
            township: '',

            showError: {
                // contactEmail: "",
                name: "",
                email: "",
                phone: "",
                address: "",
                district: '',
                township: '',
            },

            tokenValid: false,
            token: "",

            profileData: {
                name: '',
                email: '',
                phone: '',
                district: '',
                township: '',
                address: '',
            },

            staffCustomerInfo: {
                name: '',
                email: '',
                phone: '',
                district: '',
                township: '',
                address: '',
            },

            foundedCustomer: false,
            customerEmail: '',
            is_staff: false,
            selectedIndex: 0,

            districts: [],
            localTown: [],

            townshipList: [],
            township: '',
            districtName: '',
            townshipListEnable: true,
        };
        this.navigation.addListener(
            'didBlur',
            (obj) => { console.log('DetailsScreen didBlur start') }
        );
    }

    async componentDidMount() {
        this.setState({ package: [], refreshing: true });

        AsyncStorage.getItem("token").then((value) => {
            const token = JSON.parse(value);
            this.setState({ token: token })

            this.draftCarts()
        })
    }

    draftCarts() {
        AsyncStorage.getItem("cart").then((cartLists) => {
            var cartList = JSON.parse(cartLists);
            console.log('cartList', cartList);
            if (cartList) {
                var priceArray = [];
                var disArray = [];
                // var qtyArray = [];
                cartList.map((cart) => {
                    let itemprice = cart.price
                    priceArray.push(itemprice * cart.quantity);
                    disArray.push((itemprice * (cart.discountPercentage / 100)) * cart.quantity);

                })
                var sum = priceArray.reduce((a, b) => a + b, 0);
                var dis = disArray.reduce((a, b) => a + b, 0);
                var qty = cartList.map(x => x.quantity).reduce((a, b) => a + b, 0);
                this.setState({ subTotal: sum });
                this.setState({ discount: dis });
                this.setState({ totalQTY: qty });
            }

            this.setState({
                package: cartList,
                refreshing: false,
            });
        });
    }

    backAction = () => {
        if (this.navigation.isFocused()) {
            this.navigation.goBack();
            return true;
        }
    };

    customerEmailCheck(email) {
        Keyboard.dismiss()
        fetch(api_url + "staff/check-email", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + this.state.token,
            },
            body: JSON.stringify({ email: email }),
        })
            .then((response) => response.json())
            .then((json) => {
                (json.hasOwnProperty("status")) ? (
                    this.setState({ foundedCustomer: false })
                ) : (
                    this.setState({
                        foundedCustomer: true,
                        staffCustomerInfo: json.user
                    })
                )

            })
            .catch((error) => {
                console.error("Data fetching failed");
            });
    }

    submitPressed(status) {
        this.setState({
            showError: {
                name: this.state.name == "" || this.state.name.length > 100,
                email: this.state.email == "" || !this.emailregex.test(this.state.email),
                phone: this.state.phone == "" || !this.phoneregex.test(this.state.phone),
                address: this.state.address == "" || this.state.address.length > 200,
            }
        });

        Keyboard.dismiss();

        this.state.email == "" ||
            !this.emailregex.test(this.state.email) ||
            this.state.name == "" ||
            this.state.name.length > 100 ||
            this.state.email == "" ||
            !this.emailregex.test(this.state.email) ||
            this.state.phone == "" ||
            !this.phoneregex.test(this.state.phone) ||
            this.state.address == "" ||
            this.state.address.length > 200
            ? null
            : this.guestOrder(status)
    }

    guestOrder(status) {
        let guestInfo = {
            customer_name: this.state.name,
            email: this.state.email,
            phone_no: this.state.phone,
            city: this.state.district,
            township: this.state.township,
            address: this.state.address
        }
        this.navigation.navigate("OrderConfirm", { customer_type: status, info: guestInfo, order: this.props.route.params.order, subTotal: this.props.route.params.subTotal, tax: this.props.route.params.tax, saved: this.props.route.params.saved, hasOther: this.props.route.params.hasOther })
    }

    customerOrderConfirmed() {
        this.navigation.navigate("OrderConfirm", { customer_type: '0', order: this.props.route.params.order, subTotal: this.props.route.params.subTotal, tax: this.props.route.params.tax, saved: this.props.route.params.saved, hasOther: this.props.route.params.hasOther })
    }

    staffCusOrderConfirmed() {
        console.log('staffCusOrderConfirmed');
        let customerInfo = this.state.staffCustomerInfo
        this.navigation.navigate("OrderConfirm", { customer_type: '1', email: customerInfo.email, order: this.props.route.params.order, subTotal: this.props.route.params.subTotal, tax: this.props.route.params.tax, saved: this.props.route.params.saved, hasOther: this.props.route.params.hasOther })
    }

    staffGuestOrderConfirmed() {
        console.log('staffGuestOrderConfirmed');
        this.submitPressed('2')
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
                            title="Checkout"
                            titleStyle={styles.headerTitle}
                            style={styles.headers}
                        />
                        <Appbar.Action />
                    </Appbar>
                </View>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                    {this.state.refreshing ? (
                        <ActivityIndicator color="#262c76" size="large" />
                    ) : (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps={"handled"}
                            style={{ paddingTop: 10, flex: 1, flexDirection: 'column' }}
                        >
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
                                                <Text style={{ color: "#262c76", fontFamily: "Lexend" }}>{"$" + item.price + " x " + item.quantity}</Text>
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

                            {this.state.tokenValid ?
                                <View>
                                    {this.state.is_staff ?
                                        <View style={styles.container}>
                                            <Text style={styles.title}>Select Customer</Text>
                                            <ButtonGroup
                                                buttonStyle={{}}
                                                buttonContainerStyle={{}}
                                                buttons={["Existing Customer", "Guest Customer"]}
                                                containerStyle={{ height: 40, borderRadius: 6 }}
                                                innerBorderStyle={{}}
                                                onPress={selectedIdx =>
                                                    this.setState({ selectedIndex: selectedIdx })
                                                }
                                                selectedButtonStyle={{ backgroundColor: '#262c76' }}
                                                selectedIndex={this.state.selectedIndex}
                                                textStyle={{ fontFamily: "Lexend" }}
                                            />
                                            {this.state.selectedIndex == 0 ?
                                                <View style={styles.exitingCustomer}>
                                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                                        <TextInput
                                                            style={[styles.textInput, styles.cusMail]}
                                                            placeholderTextColor="#888888"
                                                            placeholder="Enter register Email"
                                                            keyboardType="email-address"
                                                            value={this.state.customerEmail}
                                                            onChangeText={(value) => this.setState({ customerEmail: value })}
                                                        />
                                                        <Button
                                                            mode="contained"
                                                            color={"#262c76"}
                                                            style={{
                                                                height: 40,
                                                                alignSelf: 'flex-end',
                                                                // flex: 0.5
                                                                marginLeft: 10
                                                            }}
                                                            labelStyle={{
                                                                color: "#fff",
                                                                fontFamily: "Lexend",
                                                                fontSize: 12,
                                                                top: 2,
                                                                height: 40
                                                            }}
                                                            onPress={() => this.customerEmailCheck(this.state.customerEmail)}
                                                        >
                                                            Check
                                                        </Button>
                                                    </View>

                                                    {this.state.foundedCustomer ?
                                                        <View>
                                                            <Text style={styles.title}>Customer Information</Text>
                                                            <View style={{ margin: 10, flex: 1, flexDirection: 'column' }}>
                                                                <View style={styles.cusLblRow}>
                                                                    <Text style={styles.customerLabel}>Customer Name</Text>
                                                                    <Text style={styles.cusValLabel}>{this.state.staffCustomerInfo.name}</Text>
                                                                </View>
                                                                <View style={styles.cusLblRow}>
                                                                    <Text style={styles.customerLabel}>Email</Text>
                                                                    <Text style={styles.cusValLabel}>{this.state.staffCustomerInfo.email}</Text>
                                                                </View>
                                                                <View style={styles.cusLblRow}>
                                                                    <Text style={styles.customerLabel}>Phone Number</Text>
                                                                    <Text style={styles.cusValLabel}>{this.state.staffCustomerInfo.phone_no}</Text>
                                                                </View>
                                                                <View style={styles.cusLblRow}>
                                                                    <Text style={styles.customerLabel}>Address</Text>
                                                                    <Text style={styles.cusValLabel}>{this.state.staffCustomerInfo.address}</Text>
                                                                </View>
                                                                <View style={styles.cusLblRow}>
                                                                    <Text style={styles.customerLabel}>Region</Text>
                                                                    <Text style={styles.cusValLabel}>{this.state.staffCustomerInfo.city}</Text>
                                                                </View>
                                                                <View style={styles.cusLblRow}>
                                                                    <Text style={styles.customerLabel}>Township</Text>
                                                                    <Text style={styles.cusValLabel}>{this.state.staffCustomerInfo.township}</Text>
                                                                </View>
                                                            </View>
                                                            <View style={{ marginBottom: 40, marginHorizontal: 10, flex: 1, }}>
                                                                <Button
                                                                    mode="contained"
                                                                    color={"#262c76"}
                                                                    style={{
                                                                        height: 30,
                                                                        width: 180,
                                                                        alignSelf: 'flex-end'
                                                                    }}
                                                                    labelStyle={{
                                                                        color: "#fff",
                                                                        fontFamily: "Lexend",
                                                                        fontSize: 12,
                                                                        top: -2,
                                                                        height: 30
                                                                    }}
                                                                    onPress={() => this.staffCusOrderConfirmed()}
                                                                >
                                                                    Order Confirm
                                                                </Button>
                                                            </View>
                                                        </View>
                                                        : <Text style={styles.notfound}>This customer email cannot be found.</Text>
                                                    }
                                                </View>
                                                : <View>
                                                    <Text style={styles.title}>Contact Information</Text>
                                                    <View>
                                                        <View style={{ margin: 10 }}>
                                                            <View>
                                                                <Text>Customer Name</Text>
                                                                <View>
                                                                    <TextInput
                                                                        style={styles.textInput}
                                                                        placeholderTextColor="#888888"
                                                                        placeholder="Name"
                                                                        onChangeText={(value) => this.setState({ name: value })}
                                                                    />
                                                                    {this.state.showError.name ? (
                                                                        this.state.name == "" ? (
                                                                            <Text style={styles.errorTextStyle}>
                                                                                Name {error.require_error}
                                                                            </Text>
                                                                        ) : this.state.name.length > 100 ? (
                                                                            <Text style={styles.errorTextStyle}>
                                                                                Name {error.maximum_length_100_error}
                                                                            </Text>
                                                                        ) : null
                                                                    ) : null}
                                                                </View>
                                                            </View>

                                                            <View style={{ marginVertical: 15 }}>
                                                                <Text>Email</Text>
                                                                <View>
                                                                    <TextInput
                                                                        style={styles.textInput}
                                                                        placeholderTextColor="#888888"
                                                                        placeholder="Email"
                                                                        keyboardType="email-address"
                                                                        value={this.state.email}
                                                                        onChangeText={(value) => this.setState({ email: value })}
                                                                    />
                                                                    {this.state.showError.email ? (
                                                                        this.state.email == "" ? (
                                                                            <Text style={styles.errorTextStyle}>
                                                                                Email {error.require_error}
                                                                            </Text>
                                                                        ) : !this.emailregex.test(this.state.email) ? (
                                                                            <Text style={styles.errorTextStyle}>
                                                                                Email {error.pattern_error}
                                                                            </Text>
                                                                        ) : null
                                                                    ) : null}
                                                                </View>
                                                            </View>

                                                            <View style={{ marginBottom: 15 }}>
                                                                <Text>Phone Number</Text>
                                                                <View>
                                                                    <TextInput
                                                                        style={styles.textInput}
                                                                        placeholderTextColor="#888888"
                                                                        placeholder="Phone Number"
                                                                        keyboardType="numeric"
                                                                        maxLength={20}
                                                                        value={this.state.phone}
                                                                        onChangeText={(value) => this.setState({ phone: value })}
                                                                    />
                                                                    {this.state.showError.phone ? (
                                                                        this.state.phone == "" ? (
                                                                            <Text style={styles.errorTextStyle}>
                                                                                Phone Number {error.require_error}
                                                                            </Text>
                                                                        ) : !this.phoneregex.test(this.state.phone) ? (
                                                                            <Text style={styles.errorTextStyle}>
                                                                                Phone Number {error.pattern_error}
                                                                            </Text>
                                                                        ) : null
                                                                    ) : null}
                                                                </View>
                                                            </View>

                                                            <View style={{ marginBottom: 15 }}>
                                                                <Text>Address</Text>
                                                                <View>
                                                                    <TextInput
                                                                        style={[styles.textInput, styles.textarea]}
                                                                        placeholderTextColor="#888888"
                                                                        placeholder="Address"
                                                                        multiline={true}
                                                                        value={this.state.address}
                                                                        onChangeText={(value) => this.setState({ address: value })}
                                                                    />
                                                                    {this.state.showError.address ? (
                                                                        this.state.address == "" ? (
                                                                            <Text style={styles.errorTextStyle}>
                                                                                Address {error.require_error}
                                                                            </Text>
                                                                        ) : this.state.address.length > 200 ? (
                                                                            <Text style={styles.errorTextStyle}>
                                                                                Address {error.maximum_length_200_error}
                                                                            </Text>
                                                                        ) : null
                                                                    ) : null}
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </View>
                                                    <View style={{ marginBottom: 40, marginHorizontal: 10, flex: 1, }}>
                                                        <Button
                                                            mode="contained"
                                                            color={"#262c76"}
                                                            style={{
                                                                height: 30,
                                                                width: 180,
                                                                alignSelf: 'flex-end'
                                                            }}
                                                            labelStyle={{
                                                                color: "#fff",
                                                                fontFamily: "Lexend",
                                                                fontSize: 12,
                                                                top: -2,
                                                                height: 30
                                                            }}
                                                            onPress={() => this.staffGuestOrderConfirmed()}
                                                        >
                                                            Order Confirm
                                                        </Button>
                                                    </View>
                                                </View>
                                            }
                                        </View>
                                        :
                                        <View>
                                            <Text style={styles.title}>Customer Information</Text>
                                            <View style={{ margin: 10, flex: 1, flexDirection: 'column' }}>
                                                <View style={styles.cusLblRow}>
                                                    <Text style={styles.customerLabel}>Customer Name</Text>
                                                    <Text style={styles.cusValLabel}>{this.state.profileData.name}</Text>
                                                </View>
                                                <View style={styles.cusLblRow}>
                                                    <Text style={styles.customerLabel}>Email</Text>
                                                    <Text style={styles.cusValLabel}>{this.state.profileData.email}</Text>
                                                </View>
                                                <View style={styles.cusLblRow}>
                                                    <Text style={styles.customerLabel}>Phone Number</Text>
                                                    <Text style={styles.cusValLabel}>{this.state.profileData.phone_no}</Text>
                                                </View>
                                                <View style={styles.cusLblRow}>
                                                    <Text style={styles.customerLabel}>Address</Text>
                                                    <Text style={styles.cusValLabel}>{this.state.profileData.address}</Text>
                                                </View>
                                                <View style={styles.cusLblRow}>
                                                    <Text style={styles.customerLabel}>Region</Text>
                                                    <Text style={styles.cusValLabel}>{this.state.profileData.city}</Text>
                                                </View>
                                                <View style={styles.cusLblRow}>
                                                    <Text style={styles.customerLabel}>Township</Text>
                                                    <Text style={styles.cusValLabel}>{this.state.profileData.township}</Text>
                                                </View>
                                                <View style={styles.cusLblRow}>
                                                    <Text style={styles.customerLabel}>Available Payment Methods</Text>
                                                    <Text style={styles.item}>{'\u25A0' + ' '}CBPay</Text>
                                                    <Text style={styles.item}>{'\u25A0' + ' '}Kpay</Text>
                                                    <Text style={styles.item}>{'\u25A0' + ' '}AyaPay</Text>
                                                    <Text style={styles.item}>{'\u25A0' + ' '}Wave Money</Text>
                                                </View>
                                            </View>
                                            <View style={{ marginBottom: 40, marginHorizontal: 10, flex: 1, }}>
                                                <Button
                                                    mode="contained"
                                                    color={"#262c76"}
                                                    style={{
                                                        height: 30,
                                                        width: 180,
                                                        alignSelf: 'flex-end'
                                                    }}
                                                    labelStyle={{
                                                        color: "#fff",
                                                        fontFamily: "Lexend",
                                                        fontSize: 12,
                                                        top: -2,
                                                        height: 30
                                                    }}
                                                    onPress={() => this.customerOrderConfirmed()}
                                                >
                                                    Order Confirm
                                                </Button>
                                            </View>
                                        </View>
                                    }
                                </View>
                                :
                                <View>
                                    <Text style={styles.title}>Customer Information</Text>
                                    <View style={{ margin: 10 }}>
                                        <Text style={{ fontFamily: "Lexend" }}>
                                            {"Already have an account? "}
                                            <Text onPress={() => this.navigation.navigate("Login")} style={{ color: "#262c76", fontFamily: "Lexend" }}>
                                                Login
                                            </Text>
                                        </Text>
                                    </View>
                                    <View>
                                        <View style={{ margin: 10 }}>
                                            <View>
                                                <Text style={styles.fontLexend}>Customer Name</Text>
                                                <View>
                                                    <TextInput
                                                        style={styles.textInput}
                                                        placeholderTextColor="#888888"
                                                        placeholder="Name"
                                                        // value={name}
                                                        onChangeText={(value) => this.setState({ name: value })}
                                                    />
                                                    {this.state.showError.name ? (
                                                        this.state.name == "" ? (
                                                            <Text style={styles.errorTextStyle}>
                                                                Name {error.require_error}
                                                            </Text>
                                                        ) : this.state.name.length > 100 ? (
                                                            <Text style={styles.errorTextStyle}>
                                                                Name {error.maximum_length_100_error}
                                                            </Text>
                                                        ) : null
                                                    ) : null}
                                                </View>
                                            </View>

                                            <View style={{ marginVertical: 15 }}>
                                                <Text style={styles.fontLexend}>Email</Text>
                                                <View>
                                                    <TextInput
                                                        style={styles.textInput}
                                                        placeholderTextColor="#888888"
                                                        placeholder="Email"
                                                        keyboardType="email-address"
                                                        value={this.state.email}
                                                        onChangeText={(value) => this.setState({ email: value })}
                                                    />
                                                    {this.state.showError.email ? (
                                                        this.state.email == "" ? (
                                                            <Text style={styles.errorTextStyle}>
                                                                Email {error.require_error}
                                                            </Text>
                                                        ) : !this.emailregex.test(this.state.email) ? (
                                                            <Text style={styles.errorTextStyle}>
                                                                Email {error.pattern_error}
                                                            </Text>
                                                        ) : null
                                                    ) : null}
                                                </View>
                                            </View>

                                            <View style={{ marginBottom: 15 }}>
                                                <Text style={styles.fontLexend}>Phone Number</Text>
                                                <View>
                                                    <TextInput
                                                        style={styles.textInput}
                                                        placeholderTextColor="#888888"
                                                        placeholder="Phone Number"
                                                        keyboardType="numeric"
                                                        maxLength={20}
                                                        value={this.state.phone}
                                                        onChangeText={(value) => this.setState({ phone: value })}
                                                    />
                                                    {this.state.showError.phone ? (
                                                        this.state.phone == "" ? (
                                                            <Text style={styles.errorTextStyle}>
                                                                Phone Number {error.require_error}
                                                            </Text>
                                                        ) : !this.phoneregex.test(this.state.phone) ? (
                                                            <Text style={styles.errorTextStyle}>
                                                                Phone Number {error.pattern_error}
                                                            </Text>
                                                        ) : null
                                                    ) : null}
                                                </View>
                                            </View>

                                            <View style={{ marginBottom: 15 }}>
                                                <Text style={styles.fontLexend}>Address</Text>
                                                <View>
                                                    <TextInput
                                                        style={[styles.textInput, styles.textarea]}
                                                        placeholderTextColor="#888888"
                                                        placeholder="Address"
                                                        multiline={true}
                                                        value={this.state.address}
                                                        onChangeText={(value) => this.setState({ address: value })}
                                                    />
                                                    {this.state.showError.address ? (
                                                        this.state.address == "" ? (
                                                            <Text style={styles.errorTextStyle}>
                                                                Address {error.require_error}
                                                            </Text>
                                                        ) : this.state.address.length > 200 ? (
                                                            <Text style={styles.errorTextStyle}>
                                                                Address {error.maximum_length_200_error}
                                                            </Text>
                                                        ) : null
                                                    ) : null}
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ marginBottom: 40, marginHorizontal: 10, flex: 1, }}>
                                        <Button
                                            mode="contained"
                                            color={"#262c76"}
                                            style={{
                                                height: 30,
                                                width: 130,
                                                alignSelf: 'flex-end'
                                            }}
                                            labelStyle={{
                                                color: "#fff",
                                                fontFamily: "Lexend",
                                                fontSize: 12,
                                                top: -2,
                                                height: 30
                                            }}
                                            onPress={() => this.submitPressed('99')}
                                        >
                                            Check Out
                                        </Button>
                                    </View>
                                </View>}
                        </ScrollView>
                    )}
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        flex: 1,
        flexDirection: 'column'
    },
    header: {
        backgroundColor: "#262c76",
        // shadowColor: "#262c76",
        // height: 30,
        // top: -15,
        // paddingHorizontal: 0,
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: "Lexend",
        color: "#fff",
        // width: 100,
        textAlign: "center",
    },
    headers: {
        //   height: 60,
        //   justifyContent: "center",
        //   marginRight: -4,
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
        // marginTop: 8,
        alignSelf: "flex-start",
    },

    dropdownBtnStyle: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#aaa",
        marginTop: 5,
        borderRadius: 5,
        borderColor: "#262c76",
        borderWidth: 1,
        width: "100%",
        height: 40,
    },
    dropdownBtnTextStyle: {
        fontSize: 16,
        fontFamily: "Lexend",
        textAlign: "left",
        marginLeft: 0,
        paddingBottom: 2,
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
    customerLabel: {
        fontFamily: "LexendBold", marginBottom: 5,
        fontSize: 16,
        color: "#707070",

    },
    cusValLabel: {
        fontFamily: "Lexend", marginBottom: 5,
        fontSize: 14,
    },
    cusLblRow: { marginBottom: 10 },
    item: {
        fontFamily: "Lexend", marginBottom: 8,
    },
    exitingCustomer: {
        flex: 1,
        flexDirection: 'column',
        margin: 10
    },
    cusMail: {
        flex: 4
    },
    notfound: {
        fontFamily: "Lexend",
        fontSize: 14,
        color: "#707070",
        marginVertical: 20
    },
    fontLexend: {
        fontFamily: "Lexend",
    }
});

export default Checkout;

import React from "react";
import {
    View,
    ScrollView,
    SafeAreaView,
    StyleSheet,
    Text,
} from "react-native";
import { Appbar, Card, Button, Snackbar } from "react-native-paper";
import { download_prefix } from "../Global";
import * as MediaLibrary from 'expo-media-library';
import { format } from 'date-fns';
import { Icon } from "react-native-elements";
import * as WebBrowser from 'expo-web-browser';
class OrderComplete extends React.Component {
    constructor(props) {
        super(props);
        this.navigation = this.props.navigation;
        this.invoice = this.props.route.params.order_detail;
        this.state = {
            showToast: false,
        }
    }

    componentDidMount() {
        this.getMediaLibraryPermissions()
    }

    async getMediaLibraryPermissions() {
        await MediaLibrary.requestPermissionsAsync()
    }

    async download() {
        let fileName = "order_invoice_" + this.props.route.params.order_detail.invoice_number + ".pdf";
        WebBrowser.openBrowserAsync(download_prefix + this.props.route.params.order_detail.invoice_token);
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View>
                    <Appbar style={styles.header}>
                        <Appbar.Action
                            icon="arrow-left"
                            onPress={() => {
                                this.navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'Products' }]
                                })
                            }}
                        />
                        <Appbar.Content
                            title="Order Complete"
                            titleStyle={styles.headerTitle}
                        />
                        <Appbar.Action />
                    </Appbar>
                </View>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps={"handled"}
                    style={{ paddingTop: 30 }}>
                    <Icon
                        name="check-circle"
                        size={60}
                        color="#262c76"
                    />
                    <Text style={styles.thanks}>Thank you for your order</Text>
                    <Card
                        style={{ marginVertical: 5, marginHorizontal: 10 }}>
                        <Card.Content style={{ overflow: "hidden" }}>
                            <Text style={styles.title}>Order Detail</Text>
                            <View style={{ margin: 10, flex: 1, flexDirection: 'column' }}>
                                <View style={styles.cusLblRow}>
                                    <Text style={styles.customerLabel}>Invoice Number</Text>
                                    <Text style={styles.cusValLabel}>{this.props.route.params.order_detail.invoice_number}</Text>
                                </View>
                                <View style={styles.cusLblRow}>
                                    <Text style={styles.customerLabel}>Customer Name</Text>
                                    <Text style={styles.cusValLabel}>{this.props.route.params.order_detail.customer_name}</Text>
                                </View>
                                <View style={styles.cusLblRow}>
                                    <Text style={styles.customerLabel}>Order Date</Text>
                                    <Text style={styles.cusValLabel}>{format(new Date(this.props.route.params.order_detail.sale_datetime), 'yyyy-MM-dd HH:mm:ss')}</Text>
                                </View>
                                <View style={styles.cusLblRow}>
                                    <Text style={styles.customerLabel}>Items</Text>
                                    <Text style={styles.cusValLabel}>{this.props.route.params.order_detail.total_items}</Text>
                                </View>
                                <View style={styles.cusLblRow}>
                                    <Text style={styles.customerLabel}>Total</Text>
                                    <Text style={styles.cusValLabel}>{this.props.route.params.order_detail.otherAttr ? "~" : null}{this.props.route.params.order_detail.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" Ks"}</Text>
                                </View>
                                <View style={styles.cusLblRow}>
                                    <Text style={styles.customerLabel}>Payment Due Date</Text>
                                    <Text style={styles.cusValLabel}>{format(new Date(this.props.route.params.order_detail.payment_due_date), 'MM/dd/yyyy')}</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                    <View style={{ marginHorizontal: 10, marginVertical: 30 }}>
                        <Button
                            mode="contained"
                            color={"#262c76"}
                            style={{
                                height: 30,
                                width: 200,
                                alignSelf: 'center'
                            }}
                            labelStyle={{
                                color: "#fff",
                                fontFamily: "Lexend",
                                fontSize: 12,
                                top: -2,
                                height: 30
                            }}
                            onPress={() => this.download()}
                        >
                            Download Invoice
                        </Button>
                    </View>
                </ScrollView>

                <Snackbar visible={this.state.showToast} duration={1000} style={{ backgroundColor: "#233762", height: 70 }}
                    onDismiss={() => this.setState({ showToast: false })}>Downloading Invoice...</Snackbar>
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
        marginLeft: 10,
        marginBottom: 10,
        alignSelf: 'center',
    },
    customerLabel: {
        fontFamily: "LexendBold", marginBottom: 5,
        fontSize: 16,
        color: "#707070",

    },
    cusValLabel: {
        fontFamily: "Lexend", marginBottom: 5,
        fontSize: 14,
        alignSelf: 'flex-end',
        alignItems: 'flex-end'
    },
    cusLblRow: {
        marginBottom: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    item: {
        fontFamily: "Lexend", marginBottom: 8,
    },
    thanks: {
        fontFamily: "LexendBold",
        fontSize: 20,
        color: "#262c76",
        marginTop: 10,
        marginBottom: 30,
        alignSelf: 'center',
    }
})

export default OrderComplete
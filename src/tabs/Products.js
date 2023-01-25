import React from "react";
import {
    View,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    ActivityIndicator,
    Image,
    Alert,
    Dimensions,
    BackHandler,
    Text,
    TextInput,
    Modal,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    KeyboardAvoidingView
} from "react-native";
import { Appbar, Snackbar, Button, Card, Checkbox } from "react-native-paper";
import { Icon } from "react-native-elements";
import SelectDropdown from "react-native-select-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api_url, error } from "../Global";
import PriceFormat from "../components/PriceFormat";
import axios from 'axios';

class ProductList extends React.Component {
    constructor(props) {
        super(props);
        this.navigation = this.props.navigation;
        this.sortListDropdownRef = React.createRef();
        this.categoriesDropdownRef = React.createRef();
        this.subCategoriesDropdownRef = React.createRef();

        this.state = {
            package: [],
            allCategories: [],
            categories: [],
            allSubCategories: [],
            subCategories: [],

            category: "",
            categoryID: "",
            subCategoListEnable: true,
            subCategory: "",
            minprice: "",
            maxprice: "",
            promoProduct: false,
            newProduct: false,
            bestSellerProduct: false,

            refreshing: true,
            page: 1,
            disable: false,
            searchModalVisible: false,
            sortList: [
                // 'Name Ascending',
                // 'Name Descending',
                // 'Price Lowest',
                // 'Price Highest'
            ],
            sort: false,
            search: false,
            cancel: false,
            searchinput: "",
            searchCount: "",
            sortKey: "",
            exist: false,
            cartCount: "",
            showtoast: false,
            showErrorTost: false
        };
    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            this.backAction
        );
        this.navigation.addListener("focus", () => {
            const routeIndex = this.navigation.getState().index;
            const params = this.navigation.getState().routes[routeIndex].params;

            AsyncStorage.getItem("cart").then((cartLists) => {
                var cartList = JSON.parse(cartLists);
                cartList
                    ? this.setState({ cartCount: cartList.map(x => x.quantity).reduce((a, b) => a + b, 0) })
                    : AsyncStorage.getItem("userData").then((value) => {
                        const userData = JSON.parse(value);
                        userData && this.userCarts(userData);
                    })
            })
        });

        this.fetchCategories1();

        AsyncStorage.getItem("product").then((productLists) => {
            var productList = JSON.parse(productLists);
            if (productList == null) {
                this.fetchProducts1();
            } else {
                this.fetchProducts1();
            }
        });
    }

    backAction = () => {
        if (this.navigation.isFocused()) {
            this.setState({ exist: true })
            return true;
        }
    };

    fetchCategories1() {
        fetch(api_url + "products/categories")
            .then((response) => response.json())
            .then((responseJson) => {
                this.state.categories = responseJson;
                this.state.sortList = responseJson;
            })
            .catch((error) => {
                console.error("Data fetching failed");
            });
    }

    fetchProducts1() {
        var url = api_url + "products";
        var caturl = this.state.category ? url = url + "/category/" + this.state.category : null;

        var apiURL = this.state.searchinput
            ? api_url + "products/search?q=" + this.state.searchinput
            : this.state.category
                ? caturl + '?limit=' + this.state.page * 10
                : api_url + "products?limit=" + this.state.page * 10;
        console.log('call products', apiURL);

        fetch(apiURL).then(res => res.json())
            .then((responseJson) => {
                console.log('products', responseJson.limit);
                if (responseJson.total <= this.state.page * 10) {
                    this.setState({ disable: true, refreshing: false });
                } else {
                    this.setState({ disable: false });
                }
                this.state.package = responseJson.products;
                this.setState({ refreshing: false });
            })
            .catch((error) => {
                this.setState({ refreshing: false })
                console.error("Data fetching failed");
            });

    }

    userCarts(userData) {
        fetch(api_url + "carts/user/" + userData.id)
            .then((response) => response.json())
            .then((json) => {
                json ? this.setState({ cartCount: json.carts[0].totalQuantity }) : this.setState({ cartCount: "" });
                AsyncStorage.setItem("cart", JSON.stringify(json.carts[0].products));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    onRefresh = () => {
        this.setState({ refreshing: true, package: [] });
        this.state.page = 1;
        AsyncStorage.setItem("productPage", JSON.stringify(this.state.page));
        this.state.searchinput == "" &&
            this.state.categoryID == ""
            ? this.fetchProducts1()
            : this.productsSearch();
    };

    loadMore() {
        this.setState({ page: this.state.page + 1 }, () => {
            AsyncStorage.setItem("productPage", JSON.stringify(this.state.page));
            this.fetchProducts1();
        });
    }

    //change category
    onCategoriesChange(categoName, index) {
        this.setState({
            category: categoName,
        });
    }

    addToCart(item) {
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
                result.quantity = result.quantity + 1;
            } else {
                item.quantity = 1;
                cart.push(item);
            }
            console.log('addToCart', cart);

            this.setState({ cartCount: cart.map(x => x.quantity).reduce((a, b) => a + b, 0) });
            AsyncStorage.setItem("cart", JSON.stringify(cart));
            this.setState({ showtoast: true })
        });
    }

    originPriceRange(minPriceOrigin, maxPriceOrigin) {
        return minPriceOrigin === maxPriceOrigin ? minPriceOrigin : minPriceOrigin + '~' + maxPriceOrigin;
    }

    priceRange(minPrice, maxPrice) {
        return minPrice === maxPrice ? minPrice : minPrice + '~' + maxPrice;
    }

    renderListItem = ({ item }) => (
        <View key={item.id} style={{ width: '50%' }}>
            <Card
                style={{ marginVertical: 5, marginHorizontal: 10 }}
                onPress={() => {
                    this.navigation.navigate("ProductDetail", {
                        productID: item.id,
                    })
                }
                }
            >
                <Card.Content style={{ overflow: "hidden" }}>
                    {item.is_new ? <Text style={styles.rotatenew}>New</Text> : null}
                    {item.discountPercentage ?
                        <View style={styles.rotatepromo}>
                            <Text style={styles.rotatepromo1}></Text>
                            <Text style={styles.rotatepromo2}>{item.discountPercentage + "% OFF"}</Text>
                        </View> : null}
                    <View style={styles.fixToText}>
                        {item.thumbnail ? (
                            <View style={styles.leftText}>
                                <Image source={{ uri: item.thumbnail }} style={styles.logoImg} />
                            </View>
                        ) : (
                            <View style={styles.leftText}>
                                <Image
                                    source={require("../../assets/ecommerce.png")}
                                    style={styles.logoImg}
                                />
                            </View>
                        )}
                        <View style={styles.rightText}>
                            <Text
                                style={styles.titleText}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {item.title}
                            </Text>

                            {item.has_attribute
                                ? (
                                    <View>
                                        {this.originPriceRange(item.minPriceOrigin, item.maxPriceOrigin) != undefined
                                            ? <PriceFormat price="" minPrice={item.minPriceOrigin} maxPrice={item.maxPriceOrigin}></PriceFormat>
                                            : null
                                        }
                                        {<PriceFormat price="" minPrice={item.min_price} maxPrice={item.max_price}></PriceFormat>}
                                    </View>
                                )
                                : (
                                    <View>
                                        <PriceFormat price={item.price}></PriceFormat>
                                    </View>
                                )
                            }

                            {item.has_attribute
                                ? (
                                    <View style={{ flexDirection: "row", marginTop: 10, alignSelf: "flex-start" }}>
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
                                            onPress={() =>
                                                this.navigation.navigate("ProductDetail", {
                                                    productID: item.product_code,
                                                })
                                            }
                                        >
                                            View Detail
                                        </Button>
                                    </View>
                                )
                                : (

                                    <View style={{ flexDirection: "row", marginTop: 10, alignSelf: "flex-start" }}>
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
                                            onPress={() => this.addToCart(item)}
                                        >
                                            Add to cart
                                        </Button>
                                    </View>
                                )}
                        </View>
                    </View>
                </Card.Content>
            </Card>
        </View>
    );

    renderFooter() {
        return this.state.refreshing ? (
            <View style={{ margin: 5 }}></View>
        ) : this.state.disable ? (
            <View style={{ margin: 5 }}></View>
        ) : (
            <ActivityIndicator
                color="#262c76"
                size="large"
                style={{ margin: 10 }}
            />
        );
    }

    productsSearchFilter() {
        this.state.page = 1;

        this.state.searchinput == "" &&
            this.state.category == ""
            ? (this.setState({ refreshing: true, package: [] }),
                this.fetchProducts1())
            : this.productsSearch();
    }

    //change sortkey
    onSortChange(sortName, index) {
        this.state.page = 1;

        this.state.sortKey == sortName ? this.state.sort = false : this.state.sort = true;
        this.state.sortKey = sortName;

        this.state.sort
            ? (this.setState({ refreshing: true, package: [] }),
                this.fetchProducts1())
            : null;
    }

    productsSearch() {

        this.setState({ refreshing: true, package: [] });
        this.state.sortKey = '';
        this.fetchProducts1();

        this.state.searchinput != "" ||
            this.state.category != ""
            ? (this.state.cancel = true)
            : (this.state.cancel = false);
        this.setState({
            searchModalVisible: false
        });
    }

    clearSearch() {
        this.state.searchinput = "";
        this.state.categoryID = "";
        this.state.category = "";
        this.state.subCategory = "";
        this.state.minprice = "";
        this.state.maxprice = "";
        this.state.promoProduct = false;
        this.state.newProduct = false;
        this.state.bestSellerProduct = false;
        this.setState({
            cancel: false,
            searchModalVisible: false,
        });
        this.productsSearchFilter();
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <View>
                    <Appbar style={styles.header}>
                        <Appbar.Action icon="menu" color="#fff" onPress={() => this.navigation.openDrawer()} />
                        <Appbar.Content
                            title="Products"
                            titleStyle={styles.headerTitle}
                            style={styles.headers}
                        />
                        <TouchableOpacity onPress={() => this.navigation.navigate("Cart")}>
                            <Appbar.Action icon="cart" color="#fff" onPress={() => this.navigation.navigate("Cart")} />
                            {this.state.cartCount ? (
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
                                        {this.state.cartCount > 99 ? "99+" : this.state.cartCount}
                                    </Text>
                                </View>
                            ) : null}
                        </TouchableOpacity>
                    </Appbar>
                    <View style={{ height: 45, backgroundColor: "#262c76", flexDirection: "row", justifyContent: "center" }}>
                        <TouchableOpacity onPress={() => this.setState({ searchModalVisible: true })}
                            style={{
                                height: 30,
                                width: "92%",
                                alignSelf: "center",
                                backgroundColor: "#fff",
                                borderColor: "#aaa",
                                borderRadius: 50,
                                // marginRight: "2%"
                            }}>
                            <View style={{
                                height: 30,
                                paddingLeft: 10,
                                flexDirection: "row"
                            }}>
                                <Icon name={"search"} size={22} color="#262c76" style={{ alignItems: 'center', height: '100%', justifyContent: 'center' }} />
                                <Text style={{ fontFamily: "Lexend", paddingLeft: 5, alignSelf: 'center' }}>Search Filter</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.container}>
                    {this.state.refreshing ? (
                        <View>
                            <ActivityIndicator color="#262c76" size="large" />
                        </View>
                    ) : this.state.package.length == 0 ? (
                        <View>
                            <Text style={{ color: "#262c76", fontFamily: "LexendBold", fontSize: 30, textAlign: "center" }}>
                                Sorry.
                            </Text>
                            <Text style={{ color: "#d43434", fontFamily: "Lexend", textAlign: "center" }}>
                                No Products Available To Display.
                            </Text>
                            <Button
                                mode="contained"
                                color={"#262c76"}
                                style={{
                                    marginTop: 10,
                                    width: 140,
                                    alignSelf: "center"
                                }}
                                labelStyle={{
                                    color: "#fff",
                                    fontFamily: "Lexend",
                                }}
                                onPress={() => this.clearSearch()}
                            >
                                Refresh
                            </Button>
                        </View>
                    ) : (
                        <FlatList
                            data={this.state.package}
                            renderItem={this.renderListItem}
                            numColumns={2}
                            keyExtractor={(item, index) => index.toString()}
                            onEndReachedThreshold={0.1}
                            showsVerticalScrollIndicator={false}
                            onEndReached={() => this.loadMore()}
                            ListFooterComponent={() => this.renderFooter()}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this.onRefresh}
                                />
                            }
                        />
                    )}
                </View>

                <Modal
                    visible={this.state.searchModalVisible} transparent={true}
                    statusBarTranslucent
                    onRequestClose={() => this.setState({ searchModalVisible: false })}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View
                                style={{
                                    backgroundColor: "#262c76",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    // height: 55, width: '100%'
                                    width: '100%',
                                }}
                            >
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontSize: 20,
                                        paddingVertical: 15,
                                        paddingHorizontal: 20,
                                        fontFamily: "Lexend",
                                        marginTop: 30
                                    }}
                                >
                                    Search Filter
                                </Text>
                                <TouchableOpacity
                                    style={{ padding: 14, marginTop: 30 }}
                                    onPress={() => this.setState({ searchModalVisible: false })}
                                >
                                    <Icon name={"highlight-off"} color={"#fff"} size={25} />
                                </TouchableOpacity>
                            </View>

                            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} style={{ width: '100%', height: '100%' }} keyboardVerticalOffset={0}>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            width: "100%",
                                            alignSelf: "center",
                                            marginVertical: 20,
                                        }}
                                    >
                                        <TextInput
                                            placeholderTextColor="#888888"
                                            placeholder="Search"
                                            style={styles.searchInput}
                                            value={this.state.searchinput}
                                            onChangeText={(value) => {
                                                this.setState({ searchinput: value });
                                            }}
                                        />
                                        <View
                                            style={{
                                                position: "absolute",
                                                left: '7%',
                                                alignSelf: 'center',
                                            }}
                                        >
                                            <Icon name={"search"} size={25} />
                                        </View>
                                        {this.state.searchinput != "" ? (
                                            <Text
                                                style={{
                                                    position: "absolute",
                                                    right: 25,
                                                    marginTop: 8,
                                                }}
                                                onPress={() => {
                                                    this.setState({ searchinput: "", cancel: false });
                                                }}
                                            >
                                                <Icon name={"close"} size={25} />
                                            </Text>
                                        ) : null}
                                    </View>

                                    <View style={styles.inputBorder}>
                                        <View style={{ borderBottomWidth: 1, borderColor: "#ccc" }}>
                                            <Text style={{ fontFamily: "LexendBold", marginBottom: 5 }}>
                                                All Categories
                                            </Text>
                                        </View>
                                        <View style={{ marginTop: 10 }}>
                                            <Text style={{ fontFamily: "Lexend" }}>
                                                Category
                                            </Text>
                                            <SelectDropdown
                                                defaultValue={this.state.category}
                                                data={this.state.categories}
                                                ref={this.categoriesDropdownRef}
                                                onSelect={(selectedItem, index) => {
                                                    this.onCategoriesChange(selectedItem, index);
                                                }}
                                                defaultButtonText="Category"
                                                buttonStyle={styles.dropdownBtnStyle}
                                                buttonTextStyle={Object.assign({ color: this.state.category != "" ? "#262c76" : "#ccc" }, styles.dropdownBtnTextStyle)}
                                                dropdownIconPosition="right"
                                                rowTextStyle={styles.dropdownRowTextStyle}
                                                renderDropdownIcon={() => {
                                                    return (
                                                        <Icon name={"arrow-drop-down"} size={25} color="#aaa" />
                                                    );
                                                }}
                                                dropdownStyle={styles.dropdownDropdownStyle}
                                            />
                                        </View>
                                    </View>

                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: 'space-around',
                                            marginBottom: 70,
                                        }}
                                    >
                                        <Button
                                            mode="contained"
                                            color={"#262c76"}
                                            disabled={!this.state.cancel}
                                            style={{ borderColor: "white", borderRightWidth: 0.5, width: "40%" }}
                                            onPress={() => this.clearSearch()}
                                        >
                                            <Text style={{ fontFamily: "Lexend" }}>{"Clear"}</Text>
                                        </Button>
                                        <Button
                                            mode="contained"
                                            color={
                                                this.state.searchinput == "" &&
                                                    this.state.category == ""
                                                    ? "#a8aac8"
                                                    : "#262c76"
                                            }
                                            style={{
                                                width: "40%",
                                            }}
                                            onPress={() => {
                                                this.state.search = true;
                                                this.productsSearchFilter();
                                            }}
                                        >
                                            <Text style={{ fontFamily: "Lexend" }}>{"Search"}</Text>
                                        </Button>
                                    </View>
                                </ScrollView>
                            </KeyboardAvoidingView>
                        </View>
                    </View>
                </Modal>

                <Modal visible={this.state.exist} transparent={true}>
                    <View style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(1,1,1,0.3)" }}>
                        <View style={{ backgroundColor: "white", margin: 30, borderRadius: 5 }}>
                            <View style={{ paddingHorizontal: 20, paddingVertical: 15 }}>
                                <Text style={{ fontSize: 18, fontFamily: "LexendBold" }}>Exit App</Text>
                                <Text style={{ fontSize: 16, fontFamily: "Lexend", paddingBottom: 20 }}>Do you want to exit the app?</Text>
                                <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
                                    <Text onPress={() => this.setState({ exist: false })} style={{ fontFamily: "Lexend", color: "#262c76", paddingRight: 40 }}>Cancel</Text>
                                    <Text onPress={() => BackHandler.exitApp(this.setState({ exist: false }))} style={{ fontFamily: "Lexend", color: "#262c76", paddingRight: 10 }}>OK</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Snackbar visible={this.state.showtoast} duration={1000} style={{ backgroundColor: "#233762", height: 70 }}
                    onDismiss={() => this.setState({ showtoast: false })}>
                    <Text style={{ fontFamily: "Lexend" }}>Product added to cart successfully.</Text>
                </Snackbar>

                <Snackbar visible={this.state.showErrorTost} duration={1000} style={{ backgroundColor: "#f75252", height: 70 }}
                    onDismiss={() => this.setState({ showErrorTost: false })}>
                    <Text style={{ fontFamily: "Lexend" }}>This item is not available.</Text>
                </Snackbar>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        flex: 1,
        marginTop: 10,
    },
    header: {
        backgroundColor: "#262c76",
        shadowColor: "#262c76",
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: "Lexend",
        color: "#fff",
        textAlign: "center",
    },
    headers: {
        //   height: 60,
        //   justifyContent: "center",
        //   marginRight: -4,
    },

    logoImg: {
        width: 80,
        height: 80,
    },
    fixToText: {
        // flexDirection: "row",
        overflow: "hidden"
    },
    leftText: {
        alignSelf: 'center'
        // width: "30%",
    },
    rightText: {
        alignSelf: 'center'
        // width: "70%",
    },
    titleText: {
        fontSize: 16,
        marginTop: 8,
        fontFamily: "Lexend",
        height: 43
    },

    detailText: {
        marginTop: 8,
        fontSize: 13,
        lineHeight: 22,
        fontFamily: "Lexend",
    },
    calendar: {
        backgroundColor: "transparent",
        paddingRight: 10,
        paddingBottom: 8,
    },

    rotatenew: {
        backgroundColor: "#e60012",
        transform: [{ rotate: "-45deg" }],
        color: "#fff",
        fontSize: 11,
        paddingTop: 3,
        top: 8,
        width: 160,
        height: 24,
        textAlign: "center",
        left: -60,
        position: "absolute",
        zIndex: 1
    },
    rotatepromo: {
        height: 26,
        right: 0,
        position: "absolute",
        flexDirection: "row",
        zIndex: 1
    },
    rotatepromo1: {
        width: 0,
        height: 0,
        borderTopWidth: 13,
        borderBottomWidth: 13,
        borderRightWidth: 13,
        borderTopColor: 'transparent',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: "#269956",
    },
    rotatepromo2: {
        backgroundColor: "#269956",
        borderTopRightRadius: 5,
        color: "#fff",
        fontSize: 12,
        fontFamily: "Lexend",
        textAlign: "center",
        paddingTop: 5,
        paddingRight: 5,
    },
    searchInput: {
        width: "90%",
        marginHorizontal: '5%',
        backgroundColor: "white",
        paddingLeft: 40,
        paddingRight: 40,
        height: 40,
        color: "#262c76",
        borderColor: "#aaa",
        borderWidth: 1,
        borderRadius: 20,
        fontFamily: "Lexend",
    },


    border: {
        position: "absolute",
        right: 0,
        borderColor: "#ccc",
        borderWidth: 0.5,
        fontSize: 12,
        fontFamily: "Lexend",
        color: "grey",
        padding: 2,
    },
    searchBorder: {
        flexDirection: "row",
        width: "90%",
        alignSelf: "center",
        marginVertical: 20,
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#fff",
        borderColor: "#aaa",
        borderWidth: 1,
        borderRadius: 30,
        shadowColor: "#000",
        elevation: 3,
    },
    inputBorder: {
        width: "90%",
        alignSelf: "center",
        marginVertical: 20,
        borderWidth: 1,
        borderColor: "#aaa",
        borderRadius: 5,
        padding: 10,
        shadowColor: "transparent",
        shadowOpacity: 10,
    },
    typeInput: {
        width: "45%",
        backgroundColor: "white",
        paddingHorizontal: 10,
        paddingBottom: 2,
        height: 40,
        color: "#262c76",
        borderColor: "#aaa",
        borderWidth: 1,
        borderRadius: 5,
        fontFamily: "Lexend",
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
    centeredView: {
        flex: 1,
        // marginTop: 22
    },
    modalView: {
        // marginTop: 10,
        marginHorizontal: 0,
        backgroundColor: "white",
        alignItems: "center",
        elevation: 5
    },
});

export default ProductList;

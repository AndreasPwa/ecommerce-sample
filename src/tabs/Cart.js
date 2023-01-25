import React from "react";
import {
  View,
  FlatList,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  Text,
  Modal,
  TouchableOpacity,
  BackHandler
} from "react-native";
import { Appbar, Button, IconButton, Card } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { api_url } from "../Global";
import PriceFormat from "../components/PriceFormat";

class CartList extends React.Component {
  constructor(props) {
    super(props);

    this.navigation = this.props.navigation;
    this.row = [];
    this.prevOpenedRow = "";
    this.channelID = "absfu123"
    this.state = {
      package: [],
      carts: '',
      updatepackage: [],
      taxRate: "",
      tax: "",
      subTotal: "",
      discount: "",
      totalQTY: "",
      tokenValid: false,
      saveCart: false,
      refreshing: true,
      loading: false,
      savedCount: '',
      checkCart: false,
      flatRefresh: false,
      hasOtherAttr: false
    };
  }

  componentDidMount() {
    BackHandler.addEventListener(
      "hardwareBackPress",
      this.backAction
    );
    this.navigation.addListener("focus", () => {
      this.setState({ package: [], refreshing: true });
      AsyncStorage.getItem("userData").then((value) => {
        const userData = JSON.parse(value);
        userData ? this.userCarts(userData) : this.fetchCarts(true);
      })
    });
  }

  backAction = () => {
    if (this.navigation.isFocused()) {
      this.navigation.reset({
        index: 0,
        routes: [{ name: 'Products' }]
      })
      return true;
    }
  };

  userCarts(userData) {
    fetch(api_url + "carts/user/" + userData.id)
      .then((response) => response.json())
      .then((json) => {

        this.setState({
          carts: json.carts[0],
          // refreshing: false,
        });

        AsyncStorage.getItem("cart").then((value) => {
          const carts = JSON.parse(value);
          this.userCartsUpdate(carts);
        })
      })
      .catch((error) => {
        console.error(error);
      });
  }

  userCartsUpdate(product) {
    fetch(api_url + 'carts/' + this.state.carts.id, {
      method: 'PUT', /* or PATCH */
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merge: true, // this will include existing products in the cart
        products: product
      })
    })
      .then(res => res.json())
      .then((json) => {
        console.log('userCartsUpdate', json);

        this.setState({
          package: json.products,
          // updatepackage: json.products,
          carts: json,
          refreshing: false,
        });

        AsyncStorage.setItem("cart", JSON.stringify(json.products));
      })
      .catch((error) => {
        console.error(error);
      });
  }

  fetchCarts(enter) {
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
          // disArray.push(cart.quantity);
          // if (cart.product_attribute_id == "99999" && cart.hasOwnProperty("color_code")) {
          //   this.setState({ hasOtherAttr: true })
          // }
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

  checkOut() {
    this.navigation.navigate("Checkout", {
      order: this.state.package,
      subTotal: this.state.carts.total ? this.state.carts.total : this.state.subTotal,
      tax: this.state.carts.discountedTotal ? (this.state.carts.total - this.state.carts.discountedTotal) : this.state.discount.toFixed(0),
      saved: false,
      hasOther: this.state.hasOtherAttr
    })
  }

  async decreaseQuantity(i, item) {
    item.quantity < 2
      ? this.deleteItem(i)
      : this.state.package[i].quantity = item.quantity - 1;
    this.setState({ updatepackage: this.state.package });
    AsyncStorage.setItem("cart", JSON.stringify(this.state.package));

    AsyncStorage.getItem("userData").then((value) => {
      const userData = JSON.parse(value);
      userData ? this.userCartsUpdate(this.state.package) : this.fetchCarts(true);
    });
  }

  async increaseQuantity(i, item) {
    this.state.package[i].quantity = item.quantity + 1;
    this.setState({ updatepackage: this.state.package });
    AsyncStorage.setItem("cart", JSON.stringify(this.state.package));

    AsyncStorage.getItem("userData").then((value) => {
      const userData = JSON.parse(value);
      userData ? this.userCartsUpdate(this.state.package) : this.fetchCarts(true);
    });
  }

  removeItem(i) {
    Alert.alert("", "Can't delete the reason why it is not saved in the database!", [{ text: "OK" },]);
  }

  deleteItem(i) {
    Alert.alert("", "Can't delete the reason why it is not saved in the database!", [{ text: "OK" },]);
  };

  originPriceRange(minPriceOrigin, maxPriceOrigin) {
    return minPriceOrigin === maxPriceOrigin ? minPriceOrigin : minPriceOrigin + '~' + maxPriceOrigin;
  }

  priceRange(minPrice, maxPrice) {
    return minPrice === maxPrice ? minPrice : minPrice + '~' + maxPrice;
  }

  closeRow(index) {
    if (this.prevOpenedRow && this.prevOpenedRow !== this.row[index]) {
      this.prevOpenedRow.close();
    }
    this.prevOpenedRow = this.row[index];
  };

  renderRightActions = (progress, dragX, index) => {
    return (
      <View
        style={{
          marginVertical: 5,
          marginRight: 5,
          justifyContent: 'center',
        }}>
        <IconButton
          icon="delete"
          color="#fff"
          size={35}
          style={{
            height: "100%",
            width: 70,
            backgroundColor: '#cc444f',
            borderRadius: 5
          }}
          onPress={() => this.deleteItem(index)}
        />
      </View>
    );
  };

  renderListItem = ({ item, index }) => (
    <Swipeable
      renderRightActions={(progress, dragX) =>
        this.renderRightActions(progress, dragX, index)
      }
      onSwipeableOpen={() => this.closeRow(index)}
      ref={(ref) => this.row[index] = ref}
      rightOpenValue={-100}>
      <View key={index} style={{ marginVertical: 5, marginHorizontal: 10 }}>
        <Card>
          <Card.Content style={{
            overflow: "hidden",
            ...(item.error == true) ? {
              backgroundColor: "#FFE6E6"
            } : { backgroundColor: "white", borderRadius: 10 }
          }}>
            <View style={styles.fixToText}>
              {item.image ? (
                <View style={styles.leftText}>
                  <Image source={{ uri: item.image }} style={styles.logoImg} />
                </View>
              ) : (
                <View style={styles.leftText}>
                  <Image source={require("../../assets/ecommerce.png")} style={styles.logoImg} />
                </View>
              )}
              <View style={styles.rightTextTitle}>
                <Text
                  style={styles.titleText}
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>

                <View style={{ marginVertical: 10 }}>
                  <PriceFormat price={item.total ? item.total : item.price * item.quantity} other={item.product_attribute_id == "99999"}></PriceFormat>
                </View>

                <View style={{ flexDirection: "row" }}>
                  <Text style={{ alignSelf: "center", paddingRight: 5, fontSize: 18, fontFamily: "Lexend" }}>{"Quantity: "}</Text>
                  <TouchableOpacity onPress={() => this.decreaseQuantity(index, item)} disabled={item.quantity < 2}>
                    <Image
                      style={{ height: 25, width: 25 }}
                      source={require("../../assets/photos/minus.png")}
                    />
                  </TouchableOpacity>
                  <Text style={{ alignSelf: "center", paddingHorizontal: 15, fontSize: 18, color: "#262c76", fontFamily: "Lexend" }}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => this.increaseQuantity(index, item)}>
                    <Image
                      style={{ height: 25, width: 25 }}
                      source={require("../../assets/photos/plus.png")}
                    />
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </Card.Content>
        </Card>
        {item.error ? <Text style={styles.errorText}>Product does not have enough stock to proceed requested order quantity</Text> : null}
      </View>
    </Swipeable>
  );

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View>
          <Appbar style={styles.header}>
            <Appbar.Action
              icon="arrow-left"
              onPress={() => {
                this.state.tokenValid
                  ? this.navigation.navigate("Products")
                  : this.navigation.goBack();
              }}
            />
            <Appbar.Content
              title="Cart"
              titleStyle={styles.headerTitle}
              style={styles.headers}
            />
            <Appbar.Action />
          </Appbar>
        </View>
        <View style={styles.container}>
          {this.state.refreshing ? (
            <View>
              <ActivityIndicator color="#262c76" size="large" />
            </View>
          ) : this.state.package == null || this.state.package.length == 0 ? (
            <View>
              <Image
                source={require("../../assets/photos/clearcart-icon.png")}
                style={{ alignSelf: "center" }}
              />
              <Text style={{ color: "#d43434", textAlign: "center", fontFamily: "Lexend" }}>
                There is no product in the cart.
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
                onPress={() => this.navigation.navigate("Products")}
              >
                Go To Shop
              </Button>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <FlatList
                data={this.state.package}
                extraData={this.state.updatepackage}
                renderItem={this.renderListItem}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
              />
              <View style={styles.checkoutView}>
                <View style={styles.fixToText}>
                  <Text style={styles.leftText}>{"Products:  "}</Text>
                  <Text style={styles.rightText}>
                    {this.state.carts.totalProducts ? this.state.carts.totalProducts : this.state.package.length}
                  </Text>
                </View>
                <View style={styles.fixToText}>
                  <Text style={styles.leftText}>{"Quantity:  "}</Text>
                  <Text style={styles.rightText}>
                    {this.state.carts.totalQuantity ? this.state.carts.totalQuantity : this.state.totalQTY}
                  </Text>
                </View>
                <View style={styles.fixToText}>
                  <Text style={styles.leftText}>{"Sub-Total:  "}</Text>
                  <Text style={styles.rightText}>
                    $ {this.state.carts.total ? this.state.carts.total : this.state.subTotal}
                    {/* {this.state.hasOtherAttr ? "~" : null}{this.state.subTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" Ks"} */}
                  </Text>
                </View>
                <View style={styles.fixToText}>
                  <Text style={styles.leftText}>{"Discount:  "}</Text>
                  <Text style={styles.rightText}>
                    $ {this.state.carts.discountedTotal ? (this.state.carts.total - this.state.carts.discountedTotal) : this.state.discount.toFixed(0)}
                    {/* {this.state.hasOtherAttr ? "~" : null}{this.state.tax.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" Ks"} */}
                  </Text>
                </View>
                <View style={styles.fixToText}>
                  <Text style={styles.leftText}>{"Total:  "}</Text>
                  <Text style={styles.rightText}>
                    $ {this.state.carts.discountedTotal ? this.state.carts.discountedTotal : (this.state.subTotal - this.state.discount.toFixed(0))}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", marginTop: 10, justifyContent: "space-between" }}>
                  <Button />
                  <Button
                    mode="contained"
                    color={"#262c76"}
                    style={{
                      height: 30
                    }}
                    labelStyle={{
                      color: "#fff",
                      fontFamily: "Lexend",
                      fontSize: 12,
                      top: -2,
                      height: 30,
                      textTransform: 'capitalize'
                    }}
                    onPress={() => this.checkOut()}
                  >
                    {'Check Out'.toLowerCase()}
                  </Button>
                </View>
              </View>
            </View>
          )}
        </View>

        <Modal visible={this.state.loading} transparent={true}>
          <View style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(1,1,1,0.3)" }}          >
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#262c76" />
              <Text style={{ marginTop: 8, marginLeft: 20, fontFamily: "Lexend" }}>
                Please Wait
              </Text>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
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
    flexDirection: "row",
    overflow: "hidden"
  },
  leftText: {
    width: "30%",
    fontSize: 16,
    fontFamily: "Lexend"
  },
  rightTextTitle: {
    width: "70%",
    fontSize: 16,
    fontFamily: "Lexend",
  },
  rightText: {
    width: "30%",
    fontSize: 16,
    fontFamily: "Lexend",
    textAlign: 'right'
  },
  titleText: {
    fontSize: 16,
    fontFamily: "Lexend",
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Lexend",
    color: "red",
    marginTop: 1
  },
  checkoutView: {
    alignSelf: "center",
    marginTop: 10,
    padding: 20,
    backgroundColor: "#e9e9f1",
    width: "98%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
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

export default CartList;

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
  Text,
  TextInput,
  Modal, TouchableOpacity
} from "react-native";
import { Appbar, Button, Card, Snackbar } from "react-native-paper";
import { Icon } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PriceFormat from "../components/PriceFormat";

import { api_url, error } from "../Global";

class Brands extends React.Component {
  constructor(props) {
    super(props);

    this.navigation = this.props.navigation;
    this.brandID = this.props.route.params.brandID

    this.state = {
      package: [],
      refreshing: true,
      page: 1,
      disable: false,
      searchModalVisible: false,
      sortModalVisible: false,
      sort: false,
      search: false,
      cancel: false,
      searchinput: "",
      searchCount: "",
      sortKey: "newly",
      cartCount: "",
      showtoast: false,
    };
  }

  componentDidMount() {
    AsyncStorage.getItem("cart").then((cartLists) => {
      var cartList = JSON.parse(cartLists);
      cartList ? this.setState({ cartCount: cartList.map(x => x.quantity).reduce((a, b) => a + b, 0) }) : this.setState({ cartCount: "" });
    })
    this.fetchProducts();
    // AsyncStorage.getItem("new").then((productLists) => {
    //   var productList = JSON.parse(productLists);
    //   if (productList == null) {
    //   } else {
    //     fetch(api_url + "shop?page=" + this.state.page + "&brand=" + this.brandID)
    //       .then((response) => response.json())
    //       .then((responseJson) => {
    //         if (responseJson.data[0].id == productList[0].id) {
    //           AsyncStorage.getItem("newPage").then((pageno) => {
    //             if (responseJson.meta.current_page == responseJson.meta.last_page) {
    //               this.setState({ disable: true });
    //             } else {
    //               this.setState({ disable: false });
    //             }

    //             this.setState({
    //               page: JSON.parse(pageno),
    //               package: productList,
    //               refreshing: false,
    //             });
    //           });
    //         } else {
    //           this.onRefresh();
    //         }
    //       });
    //   }
    // });
  }

  fetchProducts() {
    fetch(api_url + "shop?page=" + this.state.page + "&brand=" + this.brandID)
      .then((response) => response.json())
      .then((responseJson) => {
        if (
          responseJson.meta.total <
          responseJson.meta.current_page * responseJson.meta.per_page
        ) {
          this.setState({ disable: true });
        } else {
          this.setState({ disable: false });
        }

        // if (responseJson.meta.current_page == responseJson.meta.last_page) {
        //   this.setState({ disable: true });
        // } else {
        //   this.setState({ disable: false });
        // }

        this.state.page == 1 ? (this.state.package = []) : null;
        for (var i = 0; i < responseJson.data.length; i++) {
          this.state.package.push(responseJson.data[i]);
          this.setState({ refreshing: false });
        }
        // AsyncStorage.setItem("new", JSON.stringify(this.state.package));
      })
      .catch((error) => {
        console.error("Data fetching failed");
      });
  }

  onRefresh = () => {
    this.setState({ refreshing: true, package: [] });
    this.state.page = 1;
    // AsyncStorage.setItem("newPage", JSON.stringify(this.state.page));
    this.state.searchinput == ""
      ? (this.fetchProducts(), this.setState({ sortModalVisible: false }))
      : this.newsSearch();
  };

  loadMore() {
    this.setState({ page: this.state.page + 1 }, () => {
      // AsyncStorage.setItem("newPage", JSON.stringify(this.state.page));
      this.state.sort
        ? this.newsSearch()
        : this.state.searchinput == ""
          ? (this.fetchProducts(), this.setState({ sortModalVisible: false }))
          : this.newsSearch();
    });
  }

  originPriceRange(minPriceOrigin, maxPriceOrigin) {
    return minPriceOrigin === maxPriceOrigin ? minPriceOrigin : minPriceOrigin + '~' + maxPriceOrigin;
  }

  addToCart(item) {
    var addItem = {
      product_id: item.id,
      product_attribute_id: null,
      product_name: item.product_name,
      code: item.product_code,
      image: item.image,
      price: item.price
      // price: item.has_attribute ? this.priceRange(item.minPrice, item.maxPrice) : (item.price2 != 0 ? item.price2 : item.price1)
    };

    // AsyncStorage.removeItem("cart");
    AsyncStorage.getItem("cart").then((cartLists) => {
      var cart = [];
      var cartList = JSON.parse(cartLists);

      if (cartList) {
        for (var i = 0; i < cartList.length; i++) {
          cart.push(cartList[i]);
        }
      }

      var result = cart.find(c => c.product_id == addItem.product_id);
      if (result) {
        result.quantity = result.quantity + 1;
      } else {
        addItem.quantity = 1;
        cart.push(addItem);
      }

      this.setState({ cartCount: cart.map(x => x.quantity).reduce((a, b) => a + b, 0) });
      AsyncStorage.setItem("cart", JSON.stringify(cart));
      this.setState({ showtoast: true })
    });
  }

  renderListItem = ({ item }) => (
    <View key={item.id}>
      <Card
        style={{ marginVertical: 5, marginHorizontal: 10 }}
        onPress={() => {
          this.navigation.navigate("ProductDetail", {
            productID: item.product_code,
          })
        }
        }
      >
        <Card.Content style={{ overflow: "hidden" }}>
          {item.is_new ? <Text style={styles.rotatenew}>New</Text> : null}
          {item.promo ?
            <View style={styles.rotatepromo}>
              <Text style={styles.rotatepromo1}></Text>
              <Text style={styles.rotatepromo2}>{item.promo + "% OFF"}</Text>
            </View> : null}
          <View style={styles.fixToText}>
            {item.image ? (
              <View style={styles.leftText}>
                <Image source={{ uri: item.image }} style={styles.logoImg} />
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
                {item.product_name}
              </Text>

              {item.has_attribute
                ? (
                  <View>
                    {this.originPriceRange(item.minPriceOrigin, item.maxPriceOrigin) != undefined
                      ? <PriceFormat price="" minPrice={item.minPriceOrigin} maxPrice={item.maxPriceOrigin}></PriceFormat>
                      // <Text style={{ color: "#262c76", fontFamily: "Lexend", textDecorationLine: "line-through" }}>{"Ks. " + this.originPriceRange(item.minPriceOrigin, item.maxPriceOrigin)}</Text>
                      : null
                    }
                    {/* <Text style={{ color: "#262c76", fontFamily: "Lexend" }}>{"Ks. " + this.priceRange(item.minPrice, item.maxPrice)}</Text> */
                      <PriceFormat price="" minPrice={item.min_price} maxPrice={item.max_price}></PriceFormat>}
                  </View>
                )
                : (
                  <View>
                    {/* {item.price2 != 0 ? <Text style={{ color: "#262c76", fontFamily: "Lexend", textDecorationLine: "line-through" }}>{"Ks. " + item.price1}</Text> : null}
                    <Text style={{ color: "#262c76", fontFamily: "Lexend" }}>{"Ks. " + (item.price2 != 0 ? item.price2 : item.price1)}</Text> */}
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
                          productID: item.id,
                        })
                      }
                    >
                      View Detail
                    </Button>
                  </View>
                )
                : (
                  <View style={{ flexDirection: "row", marginTop: 10, alignSelf: "flex-end" }}>
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

  newsSearchFilter(search) {
    this.state.page = 1;

    this.state.searchinput == "" ? this.fetchProducts() : this.newsSearch();
  }

  newsSortFilter(sort) {
    this.state.page = 1;

    this.state.sort
      ? this.newsSearch()
      : this.state.searchinput == ""
        ? (this.fetchProducts(), this.setState({ sortModalVisible: false }))
        : this.newsSearch();
  }

  newsSearch() {
    fetch(
      api_url +
      "news/sortBy?page=" +
      this.state.page +
      "&news_name=" +
      this.state.searchinput +
      "&orderBy=" +
      this.state.sortKey
    )
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.total == 0) {
          Alert.alert("သတိပေးခြင်း", error.not_found_class, [
            { text: "OK" },
          ]);
          this.state.searchinput = "";
          this.setState({
            searchinput: "",
            cancel: false,
            sort: false,
            searchModalVisible: false,
          });
          this.onRefresh();
        } else {
          this.state.searchinput != ""
            ? (this.state.searchCount = responseJson.total)
            : null;
          if (responseJson.meta.current_page == responseJson.meta.last_page) {
            this.setState({ disable: true });
          } else {
            this.setState({ disable: false });
          }

          this.state.page == 1 ? (this.state.package = []) : null;
          for (var i = 0; i < responseJson.data.length; i++) {
            this.state.package.push(responseJson.data[i]);
            this.setState({ refreshing: false });
          }
          // AsyncStorage.setItem("new", JSON.stringify(this.state.package));
        }
      })
      .catch((error) => {
        console.error("Data fetching failed");
        Alert.alert("သတိပေးခြင်း", "သင်ရှာဖွေလိုသော သင်တန်း မတွေ့ပါ", [
          { text: "OK" },
        ]);
        this.state.searchinput = "";
        this.setState({
          searchinput: "",
          cancel: false,
          sort: false,
          searchModalVisible: false,
        });
        this.onRefresh();
      });

    this.state.searchinput != ""
      ? (this.state.cancel = true)
      : (this.state.cancel = false);
    this.setState({ searchModalVisible: false, sortModalVisible: false });
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Snackbar visible={this.state.showtoast} duration={1000} style={{ backgroundColor: "#233762", height: 70 }}
          onDismiss={() => this.setState({ showtoast: false })}>Product added to cart successfully.</Snackbar>
        <View>
          <Appbar style={styles.header}>
            <Appbar.Action
              icon="arrow-left"
              onPress={() => {
                this.navigation.goBack();
              }}
            />
            <Appbar.Content
              title="Brands"
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
        </View>
        <View style={styles.container}>
          {this.state.refreshing ? (
            <ActivityIndicator color="#262c76" size="large" />
          ) : this.state.package.length == 0 ? (
            <Text style={{ color: "#d43434", textAlign: "center" }}>
              ပစ္စည်းများ မရှိသေးပါ။
            </Text>
          ) : (
            <FlatList
              data={this.state.package}
              renderItem={this.renderListItem}
              keyExtractor={(item, index) => item.id.toString()}
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
          visible={this.state.searchModalVisible}
          onRequestClose={() => this.setState({ searchModalVisible: false })}
        >
          <View
            style={{
              backgroundColor: "#262c76",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                paddingVertical: 15,
                paddingHorizontal: 20,
                fontFamily: "Lexend",
              }}
            >
              ရှာရန်
            </Text>
            <Text
              style={{ padding: 14 }}
              onPress={() => this.setState({ searchModalVisible: false })}
            >
              <Icon name={"highlight-off"} color={"#fff"} size={25} />
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              width: "90%",
              alignSelf: "center",
              marginVertical: 20,
            }}
          >
            <TextInput
              placeholderTextColor="#888888"
              placeholder="စကားလုံးဖြင့်ရှာရန်"
              style={styles.searchInput}
              value={this.state.searchinput}
              onChangeText={(value) => {
                this.setState({ searchinput: value });
              }}
            />
            <Text
              style={{
                position: "absolute",
                left: 10,
                marginTop: 8,
              }}
            >
              <Icon name={"search"} size={25} />
            </Text>
            {this.state.searchinput != "" ? (
              <Text
                style={{
                  position: "absolute",
                  right: 10,
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

          <View
            style={{
              position: "absolute",
              bottom: 0,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Button
              mode="contained"
              color={"#19a654"}
              disabled={!this.state.cancel}
              style={{
                borderRadius: 0,
                borderColor: "white",
                borderRightWidth: 0.5,
                width: "50%",
              }}
              onPress={() => {
                this.state.searchinput = "";
                this.setState({
                  searchinput: "",
                  cancel: false,
                  searchModalVisible: false,
                });
                this.newsSearchFilter(3);
              }}
            >
              <Text style={{ fontFamily: "Lexend" }}>{"Cancel "}</Text>
            </Button>
            <Button
              mode="contained"
              color={this.state.searchinput == "" ? "#a8aac8" : "#262c76"}
              style={{
                borderRadius: 0,
                width: "50%",
              }}
              onPress={() => {
                this.state.search = true;
                this.newsSearchFilter(3);
              }}
            >
              <Text style={{ fontFamily: "Lexend" }}>{"Search"}</Text>
            </Button>
          </View>
        </Modal>
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
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Lexend",
    color: "#fff",
    textAlign: "center",
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
  },
  rightText: {
    width: "70%",
  },
  titleText: {
    fontSize: 14,
    fontFamily: "Lexend",
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

  searchInput: {
    width: "100%",
    backgroundColor: "white",
    paddingLeft: 40,
    paddingRight: 40,
    height: 40,
    color: "#000",
    borderColor: "#aaa",
    borderWidth: 1,
    borderRadius: 20,
    fontFamily: "Lexend",
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
    color: "#fff",
    fontSize: 12,
    fontFamily: "Lexend",
    textAlign: "center",
    paddingTop: 5,
    paddingRight: 5,
  },
});

export default Brands;

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
  Text,
  TextInput,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Appbar, Avatar, Button, Card } from "react-native-paper";
import { Icon } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";

// import Moment from "moment";
// Moment.locale("en");
import { api_url, error } from "../Global";

class ProductList extends React.Component {
  constructor(props) {
    super(props);

    this.navigation = this.props.navigation;

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
    };
  }

  componentDidMount() {
    AsyncStorage.getItem("new").then((productLists) => {
      var productList = JSON.parse(productLists);
      if (productList == null) {
        this.fetchProducts();
      } else {
        fetch(api_url + "shop")
          .then((response) => response.json())
          .then((responseJson) => {
            if (responseJson.data[0].id == productList[0].id) {
              AsyncStorage.getItem("newPage").then((pageno) => {
                if (responseJson.total < responseJson.current_page * responseJson.per_page) {
                  this.setState({ disable: true });
                } else {
                  this.setState({ disable: false });
                }

                this.setState({
                  page: JSON.parse(pageno),
                  package: productList,
                  refreshing: false,
                });
              });
            } else {
              this.onRefresh();
            }
          });
      }
    });
  }

  fetchProducts() {
    fetch(api_url + "shop?page=" + this.state.page)
      .then((response) => response.json())
      .then((responseJson) => {
        if (
          responseJson.total <
          responseJson.current_page * responseJson.per_page
        ) {
          this.setState({ disable: true });
        } else {
          this.setState({ disable: false });
        }

        this.state.page == 1 ? (this.state.package = []) : null;
        for (var i = 0; i < responseJson.data.length; i++) {
          this.state.package.push(responseJson.data[i]);
          this.setState({ refreshing: false });
        }
        AsyncStorage.setItem("new", JSON.stringify(this.state.package));
      })
      .catch((error) => {
        console.error("Data fetching failed");
      });
  }

  onRefresh = () => {
    this.setState({ refreshing: true, package: [] });
    this.state.page = 1;
    AsyncStorage.setItem("newPage", JSON.stringify(this.state.page));
    // this.fetchProducts();
    this.state.searchinput == ""
      ? (this.fetchProducts(), this.setState({ sortModalVisible: false }))
      : this.newsSearch();
  };

  loadMore() {
    this.setState({ page: this.state.page + 1 }, () => {
      AsyncStorage.setItem("newPage", JSON.stringify(this.state.page));
      // this.fetchProducts();
      this.state.sort
        ? this.newsSearch()
        : this.state.searchinput == ""
          ? (this.fetchProducts(), this.setState({ sortModalVisible: false }))
          : this.newsSearch();
    });
  }

  renderListItem = ({ item }) => (
    <View key={item.id}>
      {/* <CardList newlist={item} /> */}
      <Card
        style={{ marginVertical: 5, marginHorizontal: 10 }}
        onPress={() =>
          this.navigation.navigate("ProductDetail", {
            productID: item.id,
          })
        }
      >
        <Card.Content>
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
              // numberOfLines={2}
              // ellipsizeMode="middle"
              >
                {item.product_name}
              </Text>

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
                  onPress={() => console.log("Add To Cart")}
                >
                  Add To Cart
                </Button>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  renderFooter() {
    // if (this.state.refreshing) return <View style={{ margin: 5 }}></View>;
    return this.state.refreshing ? (
      <View style={{ margin: 5 }}></View>
    ) : this.state.disable ? (
      <View style={{ margin: 5 }}></View>
    ) : (
      <ActivityIndicator
        color="#262c76"
        size="large"
        style={{ margin: 10 }}
      // style={{ margin: 10, marginBottom: 60 }}
      />
    );
  }

  newsSearchFilter(search) {
    this.state.page = 1;

    // this.setState({ refreshing: true, package: [] });
    this.state.searchinput == "" ? this.fetchProducts() : this.newsSearch();
  }

  newsSortFilter(sort) {
    this.state.page = 1;

    // this.setState({ refreshing: true, package: [] });
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
          // this.fetchProducts();
        } else {
          this.state.searchinput != ""
            ? (this.state.searchCount = responseJson.total)
            : null;
          if (
            responseJson.total <
            responseJson.current_page * responseJson.per_page
          ) {
            this.setState({ disable: true });
          } else {
            this.setState({ disable: false });
          }

          this.state.page == 1 ? (this.state.package = []) : null;
          for (var i = 0; i < responseJson.data.length; i++) {
            this.state.package.push(responseJson.data[i]);
            this.setState({ refreshing: false });
          }
          AsyncStorage.setItem("new", JSON.stringify(this.state.package));
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
      <SafeAreaView style={{ flex: 1 }}>
        <View>
          <Appbar style={styles.header}>
            <Appbar.Action icon="menu" color="#fff" onPress={() => this.navigation.openDrawer()} />
            <Appbar.Content
              title="Suppliers"
              titleStyle={styles.headerTitle}
              style={styles.headers}
            />
            <Appbar.Action icon="cart" color="#fff" onPress={() => this.navigation.openDrawer()} />
            {/* {notiCount ? ( */}
            <View style={{
              position: "absolute",
              backgroundColor: "red",
              borderRadius: 50,
              top: 12,
              right: 12,
              width: 15,
              height: 15,
              justifyContent: "center"
            }}>
              <Text
                style={{
                  fontFamily: "Lexend",
                  fontSize: 11,
                  color: "#fff",
                  textAlign: "center"
                }}
              >
                {'7'}
              </Text>
            </View>
            {/* ) : null} */}
          </Appbar>
          {/* <View style={{ height: 45, backgroundColor: "#262c76" }}>
            <Text onPress={() => this.setState({ searchModalVisible: true })}
              style={{
                width: "90%",
                alignSelf: "center",
                backgroundColor: "#fff",
                borderRadius: 50
              }}>
              <View style={{
                height: 30,
                paddingLeft: 10,
                paddingTop: 4,
                flexDirection: "row"
              }}>
                <Icon name={"search"} size={22} color="#262c76" />
                <Text style={{ fontFamily: "Lexend", paddingLeft: 5 }}>ရှာရန်</Text>
              </View>
            </Text>
          </View> */}
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
              <Text style={{ fontFamily: "Lexend" }}>{"Cancel"}</Text>
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
    // shadowColor: "#262c76",
    // height: 30,
    // top: -15,
    // paddingHorizontal: 0,
  },
  headerTitle: {
    fontSize: 14,
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

  logoImg: {
    width: 80,
    height: 80,
    // alignSelf: "center"
    // borderRadius: 100,
  },
  fixToText: {
    flexDirection: "row",
    overflow: "hidden"
    // justifyContent: "space-between",
  },
  leftText: {
    width: "30%",
  },
  rightText: {
    // marginHorizontal: 10,
    width: "70%",
  },
  titleText: {
    fontSize: 14,
    // lineHeight: 22,
    fontFamily: "Lexend",
  },

  // fixToText: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   marginTop: 5,
  // },
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
});

export default ProductList;

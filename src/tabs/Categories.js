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
import { Appbar, Avatar, Button, Card, List } from "react-native-paper";
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
      expanded: true,
    };
  }

  componentDidMount() {
    this.navigation.addListener("focus", () => {
      this.setState({ package: [], refreshing: true });
      this.fetchCategories();
    });
  }

  fetchCategories() {
    fetch(api_url + "d/categories")
      .then((response) => response.json())
      .then((responseJson) => {
        for (var i = 0; i < responseJson.data.length; i++) {
          this.state.package.push(responseJson.data[i]);
          this.setState({ refreshing: false });
        }
      })
      .catch((error) => {
        console.error("Data fetching failed");
      });
  }

  renderListItem = ({ item }) => (
    <View key={item.id} style={{ margin: -8 }}>
      <List.Section>
        <List.Accordion
          title={item.category_name}
          id={item.id}
          // expanded={this.state.expanded}
          // onPress={() => { this.setState({ expanded: !this.state.expanded }) }}
          left={() => (
            <View style={{ justifyContent: "center" }}>
              <Image source={{ uri: item.image }} style={{ width: 50, height: 50, }} />
            </View>
          )}
          titleStyle={styles.listText}
          style={styles.listItem}
        >
          <List.Item
            onPress={() =>
              this.navigation.navigate("Products", {
                categoryID: item.id,
              })
            }
            title={item.category_name}
            left={() => (
              <View style={{ justifyContent: "center" }}>
                <Image style={{ width: 50, height: 50, }} />
              </View>
            )}
            right={() => (
              <List.Icon
                color="#000"
                icon="chevron-right"
                style={{ marginRight: -2 }}
              />
            )}
            titleStyle={[styles.listText]}
            style={[styles.appListItem]}
          />
          {item.children.map((child) =>
            <List.Item
              key={child.id}
              onPress={() =>
                this.navigation.navigate("Products", {
                  categoryID: child.id,
                })
              }
              title={child.category_name}
              left={() => (
                <View style={{ justifyContent: "center" }}>
                  <Image source={{ uri: child.image }} style={{ width: 50, height: 50, }} />
                </View>
              )}
              right={() => (
                <List.Icon
                  color="#000"
                  icon="chevron-right"
                  style={{ marginRight: -2 }}
                />
              )}
              titleStyle={[styles.listText]}
              style={[styles.appListItem]}
            />
          )}
        </List.Accordion>
      </List.Section>
    </View>
  );

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
              title="Categories"
              titleStyle={styles.headerTitle}
              style={styles.headers}
            />
            <Appbar.Action />
          </Appbar>
        </View>
        <View style={styles.container}>
          {this.state.refreshing ? (
            <ActivityIndicator color="#262c76" size="large" />
          ) : (
            <FlatList
              data={this.state.package}
              renderItem={this.renderListItem}
              keyExtractor={(item, index) => item.id.toString()}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
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

  appList: {
    backgroundColor: "#24b65b",
  },
  listItem: {
    backgroundColor: "#fff",
    borderStyle: "solid",
    borderColor: "#d4cfcf91",
    borderBottomWidth: 1,
  },
  appListItem: {
    // paddingLeft: 60,
    paddingVertical: 5,
    backgroundColor: "#e9e9f1",
    borderStyle: "solid",
    borderColor: "#d4cfcf91",
    borderBottomWidth: 1,
  },
  listText: {
    fontSize: 14,
    fontFamily: "Lexend",
    color: "#000",
  },
});

export default ProductList;

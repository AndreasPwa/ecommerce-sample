import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Image,
  Linking,
} from "react-native";
import { ListItem, Icon } from "react-native-elements";
import { Avatar, List } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NavigationActions } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Drawer() {
  const navigation = useNavigation();
  const currentRoute = navigation.getCurrentRoute();
  const params = currentRoute ? currentRoute.params ? currentRoute.params.userName ? currentRoute.params : null : null : null;

  const [login, setLogin] = useState(true);
  const [register, setRegister] = useState(true);
  const [isUser, setIsUser] = useState(false);
  const [notiCount, setNotiCount] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("notiCount").then((count) => {
      count == 0
        ? setNotiCount("")
        : count > 9
          ? setNotiCount("9+")
          : setNotiCount(count);
    });

    AsyncStorage.getItem("usertype").then((usertype) => {
      const user_type = JSON.parse(usertype);
      if (user_type == "user") {
        setLogin(false)
        setRegister(false)
        setIsUser(true)
      }
      else if (user_type == "staff") {
        setLogin(false)
        setRegister(false)
        setIsUser(false)
      } else {
        setLogin(true)
        setRegister(true)
        setIsUser(false)
      }
    });
  });

  const logout = () => {
    navigation.goBack();
    Alert.alert("", "Logout", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          AsyncStorage.getItem("token").then((value) => {
            const token = JSON.parse(value);
            AsyncStorage.getItem("usertype").then((value) => {
              const usertype = JSON.parse(value);

              (usertype == "user" || usertype == "staff")
                ? AsyncStorage.clear().then(() => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }]
                  })
                })
                : null;
            });
          });
        },
      },
    ]);
  };

  const resetAction = (routeName) => {
    const reset = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: routeName })],
    });
    navigation.dispatch(reset);
  }

  return (
    <View style={{ display: "flex" }}>
      <ListItem containerStyle={{ backgroundColor: "#262c76" }}>
        <Image
          source={require("../assets/ecommerce.png")}
          style={{ width: 50, height: 50 }}
        />
        <ListItem.Content>
          <Text
            style={{
              fontSize: 16,
              color: "#FFF",
              fontFamily: "Lexend",
            }}
          >
            {"Ecommerce Sample"}
          </Text>
        </ListItem.Content>
      </ListItem>
      {params ?
        <View style={{ backgroundColor: "#262c76" }}>
          <Text
            onPress={() => {
              navigation.navigate("ProfileSetting");
            }}
            style={{ padding: 20, color: "#fff", fontFamily: "Lexend", fontSize: 16 }}
          >
            {params.userName}
          </Text>
        </View>
        : null}

      <List.AccordionGroup>

        <List.Item
          onPress={() => {
            navigation.navigate("Products");
          }}
          title="Products"
          left={() => (
            <View style={{ justifyContent: "center" }}>
              <Image
                style={{ height: 32, width: 32 }}
                source={require("../assets/photos/brand-icon.png")}
              // tintColor="#262c76"
              />
            </View>
          )}
          right={() => (
            <List.Icon
              color="#000"
              icon="chevron-right"
              style={{ marginRight: -2 }}
            />
          )}
          titleStyle={[styles.listText, { width: 200 }]}
          style={[styles.listItem, { paddingVertical: 0 }]}
        />
        
        {register ? (
          <List.Item
            onPress={() => {
              navigation.navigate("Register");
            }}
            title="Register/Sign Up"
            left={() => (
              <View style={{ justifyContent: "center" }}>
                <Image
                  style={{ height: 32, width: 32 }}
                  source={require("../assets/photos/register-icon.png")}
                  tintColor="#262c76"
                />
              </View>
            )}
            right={() => (
              <List.Icon
                color="#000"
                icon="chevron-right"
                style={{ marginRight: -2 }}
              />
            )}
            titleStyle={[styles.listText, { width: 200 }]}
            style={[styles.listItem, { paddingVertical: 0 }]}
          />
        ) : (
          <List.Item
            onPress={() => {
              navigation.navigate("ProfileSetting");
            }}
            title="Profile Setting"
            left={() => (
              <View style={{ justifyContent: "center" }}>
                <Image
                  style={{ height: 32, width: 32 }}
                  source={require("../assets/photos/setting-icon.png")}
                  tintColor="#262c76"
                />
              </View>
            )}
            right={() => (
              <List.Icon
                color="#000"
                icon="chevron-right"
                style={{ marginRight: -2 }}
              />
            )}
            titleStyle={[styles.listText, { width: 200 }]}
            style={[styles.listItem, { paddingVertical: 0 }]}
          />
        )}

        {login ? (
          <List.Item
            onPress={() => navigation.navigate("Login")}
            title="Login"
            left={() => (
              <View style={{ justifyContent: "center" }}>
                <Image
                  style={{ height: 32, width: 32 }}
                  source={require("../assets/photos/login-icon.png")}
                  tintColor="#262c76"
                />
              </View>
            )}
            right={() => (
              <List.Icon
                color="#000"
                icon="chevron-right"
                style={{ marginRight: -2 }}
              />
            )}
            titleStyle={[styles.listText, { width: 200 }]}
            style={[styles.listItem, { paddingVertical: 0 }]}
          />
        ) : (
          <List.Item
            onPress={() => logout()}
            title="Logout"
            left={() => (
              <View style={{ justifyContent: "center" }}>
                <Image
                  style={{ height: 32, width: 32 }}
                  source={require("../assets/photos/logout-icon.png")}
                  tintColor="#262c76"
                />
              </View>
            )}
            right={() => (
              <List.Icon
                color="#000"
                icon="chevron-right"
                style={{ marginRight: -2 }}
              />
            )}
            titleStyle={[styles.listText, { width: 200 }]}
            style={[styles.listItem, { paddingVertical: 0 }]}
          />
        )}
      </List.AccordionGroup>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#24b65b",
    height: 30,
    top: -15,
  },
  headerText: {
    fontSize: 16,
    fontFamily: "Lexend",
    color: "#fff",
    width: 200,
    paddingLeft: "10%",
  },
  text: {
    fontSize: 25,
    color: "#000",
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
    paddingLeft: 50,
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
    paddingBottom: 2
  },
});

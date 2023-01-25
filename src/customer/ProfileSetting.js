import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  Text,
  Image,
  ActivityIndicator,
  Modal,
  BackHandler
} from "react-native";
import { Appbar, List } from "react-native-paper";
import { Icon } from "react-native-elements";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Moment from "moment";
Moment.locale("en");
import { api_url, error } from "../Global";

export default function StudentSetting({ route, navigation }) {

  const [profile, setProfile] = useState("");
  const [name, setName] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.addListener("focus", () => {
      setRefreshing({})
      AsyncStorage.getItem("userData").then((value) => {
        const userData = JSON.parse(value);
        userInformation(userData);
      });

      const backAction = () => {
        if (navigation.isFocused()) {
          navigation.navigate("Products");
          return true;
        }
      };

      BackHandler.addEventListener("hardwareBackPress", backAction);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", backAction);
    });
  }, [navigation]);

  function userInformation(userData) {
    console.log('Profile', userData.id);

    fetch(api_url + "users/" + userData.id)
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setProfile(json.image);
        setName(userData.username);
        setRefreshing(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  const [isLoading, setisLoading] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar style={styles.topBar}>
        <Appbar.Action
          icon="arrow-left"
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Products' }]
            })
          }}
        />
        <Appbar.Content
          title={"Profile Setting"}
          titleStyle={styles.headerTitle}
          style={styles.headers}
        />
        <Appbar.Action />
      </Appbar>

      {refreshing ? (
        <View style={styles.container02}>
          <ActivityIndicator color="#262c76" size="large" />
        </View>
      ) : (
        <View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps={"handled"}
          >
            <SafeAreaView style={styles.container}>
              <View style={styles.logoBG}>
                {profile ? (
                  <Image source={{ uri: profile }} style={styles.logoImg} />
                ) : (
                  <View style={styles.profile}>
                    <Icon name={"person"} size={45} />
                  </View>
                )}

                <Text style={{ fontSize: 17, marginTop: 10, fontFamily: "Lexend" }}>{name}</Text>
              </View>
              <View>
                <List.Item
                  title="Profile"
                  onPress={() => navigation.navigate("Profile")}
                  right={(props) => <List.Icon icon="chevron-right" />}
                  titleStyle={styles.listText}
                  style={styles.appListItem}
                />
                <List.Item
                  title="Change Password"
                  onPress={() => navigation.navigate("ChangePassword")}
                  right={(props) => <List.Icon icon="chevron-right" />}
                  titleStyle={styles.listText}
                  style={styles.appListItem}
                />
              </View>
            </SafeAreaView>
          </ScrollView>

          <Modal visible={isLoading} transparent={true}>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                backgroundColor: "rgba(1,1,1,0.3)",
              }}
            >
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#262c76" />
                <Text style={{ marginTop: 8, marginLeft: 20, fontFamily: "Lexend" }}>
                  Please Wait
                </Text>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // margin: 20,
  },
  // loading view
  container02: {
    flex: 1,
    justifyContent: "center",
    marginTop: 10,
  },
  topBar: {
    backgroundColor: "#262c76",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Lexend",
    color: "#fff",
    textAlign: "center",
    padding: 0,
  },
  logoBG: {
    alignItems: "center",
    margin: 30,
  },
  logoImg: {
    width: 125,
    height: 125,
    zIndex: 1,
    borderRadius: 100,
  },
  profile: {
    backgroundColor: "#ccc",
    borderRadius: 100,
    padding: 40,
  },
  listItem: {
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  appListItem: {
    paddingHorizontal: 20,
    paddingVertical: 0,
    backgroundColor: "#e9e9f1",
    borderBottomColor: "#f2f2f2",
    borderBottomWidth: 3
  },
  listText: {
    fontSize: 16,
    fontFamily: "Lexend",
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

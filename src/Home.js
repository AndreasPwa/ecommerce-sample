import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  BackHandler,
  Modal,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Appbar, Button } from "react-native-paper";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api_url, error } from "./Global";

export default function Home({ route, navigation }) {
  const [home, setHome] = useState(false);
  const [exist, setExist] = useState(false);

  useEffect(() => {
    navigation.addListener("focus", () => {
      NetInfo.fetch().then((state) => {
        state.isConnected
          ? AsyncStorage.getItem("userData").then((value) => {
            const token = JSON.parse(value);
            // token ? checkToken(value) : AsyncStorage.clear().then(() => { setHome(true); })
            token
              ? (setHome(false),
                // AsyncStorage.setItem("userData", JSON.stringify(json)),
                AsyncStorage.setItem("usertype", JSON.stringify("user")),
                setTimeout(function () { navigation.navigate("Products") }, 1000))
              : AsyncStorage.clear().then(() => { setHome(true); })
          })
          : Alert.alert("", "Please check your internet connection", [
            {
              text: "OK",
            },
          ]);
      });

      const backAction = () => {
        if (navigation.isFocused()) {
          setExist(true);
          return true;
        }
      };

      BackHandler.addEventListener("hardwareBackPress", backAction);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", backAction);
    });
  }, [navigation]);

  function checkToken(token) {
    console.log('call auth', "Bearer " + token);

    fetch(api_url + "auth/RESOURCE", {
      headers: {
        // Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        console.log('auth/RESOURCE', json);
        json.message
          ? AsyncStorage.clear().then(() => { setHome(true); })
          : (setHome(false),
            AsyncStorage.setItem("userData", JSON.stringify(json)),
            AsyncStorage.setItem("usertype", JSON.stringify("user")),
            setTimeout(function () { navigation.navigate("Products") }, 1000));
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoBG}>
        <Image
          source={require("../assets/ecommerce.png")}
          style={styles.logoImg}
        />
      </View>
      <View style={{ alignItems: "center" }}>
        <Text style={styles.welcomeText}>{'Welcome To'}</Text>
        <Text style={styles.welcomeText}>
          <Text style={{ fontFamily: "LexendBold" }}>{'Ecommerce Sample'}</Text>
          <Text>{' Shopping'}</Text>
        </Text>
      </View>
      {home ? null : <ActivityIndicator color="#262c76" size="large" />}
      <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 150 }}>
        <View style={{ flexDirection: "row" }}>
          {home ?
            <Button
              mode="contained"
              color={"#262c76"}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              onPress={() => navigation.navigate("Login")}
            >
              Sign In
            </Button> : null}
          {home ?
            <Button
              mode="contained"
              color={"#262c76"}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              onPress={() => navigation.navigate("Register")}
            >
              Sign Up
            </Button> : null}
        </View>
        <View style={{ flexDirection: "row" }}>
          {home ? <TouchableOpacity
            onPress={() => {
              navigation.navigate("Products");
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Text
                style={{
                  color: "#262c76",
                  textAlign: "center",
                  fontSize: 18,
                  fontFamily: "LexendBold",
                  marginTop: 20,
                  marginRight: 3
                }}
              >
                {"Go To Shop"}
              </Text>
              <Image
                source={require("../assets/photos/next.png")}
                style={{ width: 11, height: 11, marginTop: 27 }}
              />
            </View>
          </TouchableOpacity> : null}
        </View>
      </View>
      <Image
        source={require("../assets/shopping-footer-big.png")}
        style={styles.footer}
      />
      <Text style={styles.footerbg}></Text>

      <Modal visible={exist} transparent={true}>
        <View style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(1,1,1,0.3)" }}>
          <View style={{ backgroundColor: "white", margin: 30, borderRadius: 5 }}>
            <View style={{ paddingHorizontal: 20, paddingVertical: 15 }}>
              <Text style={{ fontSize: 18, fontFamily: "LexendBold" }}>Exit App</Text>
              <Text style={{ fontSize: 14, fontFamily: "Lexend", paddingBottom: 20 }}>Do you want to exit the app?</Text>
              <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
                <Text onPress={() => setExist(false)} style={{ fontFamily: "Lexend", color: "#262c76", paddingRight: 40 }}>Cancel</Text>
                <Text onPress={() => BackHandler.exitApp(setExist(false))} style={{ fontFamily: "Lexend", color: "#262c76", paddingRight: 10 }}>OK</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  },
  logoBG: {
    alignItems: "center",
    marginBottom: 80,
  },
  logoImg: {
    width: 125,
    height: 125,
    zIndex: 1,
  },
  welcomeText: {
    color: "#262c76",
    fontSize: 30,
    textAlign: "center",
    fontFamily: "Lexend"
  },
  button: {
    marginTop: 20,
    marginHorizontal: 10,
  },
  buttonLabel: {
    fontSize: 16,
    fontFamily: "LexendBold"
  },
  footer: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
    position: "absolute",
    bottom: 0,
    zIndex: 1
  },
  footerbg: {
    position: "absolute", bottom: 0,
    backgroundColor: "#262c76",
    height: 65,
    width: "100%",
  }
});

import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  Text,
  Image,
  Alert,
  Keyboard,
  ActivityIndicator,
  Modal,
  BackHandler
} from "react-native";
import { Appbar, Button } from "react-native-paper";
import { FloatingLabelInput } from "react-native-floating-label-input";
import NetInfo from "@react-native-community/netinfo";

import Moment from "moment";
Moment.locale("en");
import { api_url, error } from "../Global";

export default function ForgetPassword({ route, navigation }) {

  useEffect(() => {
    navigation.addListener("focus", () => {
      const backAction = () => {
        if (navigation.isFocused()) {
          navigation.goBack(back());
          return true;
        }
      };

      BackHandler.addEventListener("hardwareBackPress", backAction);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", backAction);
    });
  }, [navigation]);

  const [showError, setShowError] = useState({ email: false });

  const [email, setEmail] = useState("");
  const [isLoading, setisLoading] = useState(false);

  const emailregex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;

  function submitPressed() {
    setShowError({ email: email == "" || !emailregex.test(email) });

    Keyboard.dismiss();

    email == "" || !emailregex.test(email)
      ? null
      : NetInfo.fetch().then((state) => {
        state.isConnected
          ? forgetPassword()
          : Alert.alert("", "Please check your internet connection", [
            {
              text: "OK",
            },
          ]);
      });
  }

  function forgetPassword() {
    Alert.alert("", `There is no api.`, [
      { text: "OK" },
    ]);
  }

  function back() {
    setEmail("");
    setShowError({
      email: false,
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar style={styles.topBar}>
        <Appbar.Action
          icon="arrow-left"
          onPress={() => {
            {
              navigation.goBack();
              back();
            }
          }}
        />
        <Appbar.Content
          title={"Forget Password?"}
          titleStyle={styles.headerTitle}
          style={styles.headers}
        />
        <Appbar.Action />
      </Appbar>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={"handled"}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.logoBG}>
            <Image
              source={require("../../assets/ecommerce.png")}
              style={styles.logoImg}
            />
          </View>
          <View>
            <View style={{ margin: 5, alignSelf: "center" }}>
              <Text
                style={{ lineHeight: 22, color: "#262c76", textAlign: "center", fontFamily: "Lexend"}}
              >
                {"To reset your password, please enter your sign-up email.\nWe will send the password reset instructions to your email address."}
              </Text>
            </View>
            <View style={{ margin: 20 }}>
              <FloatingLabelInput
                containerStyles={styles.inputBorder}
                label={"Email"}
                keyboardType="email-address"
                customLabelStyles={{
                  colorFocused: "#262c76",
                  colorBlurred: "#262c76",
                }}
                inputStyles={{
                  color: "#262c76",
                  paddingTop: 10,
                }}
                value={email}
                onChangeText={(value) => setEmail(value)}
              />
              {showError.email ? (
                email == "" ? (
                  <Text style={styles.errorTextStyle}>
                    Email {error.require_error}
                  </Text>
                ) : !emailregex.test(email) ? (
                  <Text style={styles.errorTextStyle}>
                    Email {error.pattern_error}
                  </Text>
                ) : null
              ) : null}
            </View>

            <View style={{ marginHorizontal: 20 }}>
              <Button
                mode="contained"
                color={"#262c76"}
                onPress={() => submitPressed()}
              >
                Reset Password
              </Button>
            </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // margin: 20,
  },
  topBar: {
    backgroundColor: "#262c76",
    // shadowColor: "#262c76",
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
  },
  inputBorder: {
    flexDirection: "row",
    borderBottomColor: "#262c76",
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  errorTextStyle: {
    fontSize: 12,
    color: "#fff",
    backgroundColor: "#e60012",
    padding: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
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

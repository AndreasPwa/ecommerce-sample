import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  Text,
  TextInput,
  Image,
  Alert,
  Keyboard,
  ActivityIndicator,
  Modal,
  BackHandler
} from "react-native";
import { Appbar, Button } from "react-native-paper";
import { Icon } from "react-native-elements";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Moment from "moment";
Moment.locale("en");
import { api_url, error } from "../Global";

export default function ChangePassword({ route, navigation }) {

  useEffect(() => {
    navigation.addListener("focus", () => {
      AsyncStorage.getItem("usertype").then((value) => {
        const usertype = JSON.parse(value);
        setUserType(usertype);
        AsyncStorage.getItem("student_id").then((value) => {
          const studentID = JSON.parse(value);
          AsyncStorage.getItem("teacher_id").then((value) => {
            const teacherID = JSON.parse(value);

            usertype == "student" ? setUserID(studentID) : null;
            usertype == "teacher" ? setUserID(teacherID) : null;
          });
        });
      });

      const backAction = () => {
        if (navigation.isFocused()) {
          goBack();
          return true;
        }
      };
      BackHandler.addEventListener("hardwareBackPress", backAction);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", backAction);
    });
  }, [navigation]);

  const [showError, setShowError] = useState({
    password: false,
    newPassword: false,
    confirmpassword: false,
  });

  const [userType, setUserType] = useState("");
  const [userID, setUserID] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmpassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setisLoading] = useState(false);

  const emailregex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;

  function submitPressed() {
    setShowError({
      password: password == "" || password.length < 8 || password.length > 12,
      newPassword:
        newPassword == "" || newPassword.length < 8 || newPassword.length > 12,
      confirmpassword: confirmpassword == "" || confirmpassword != newPassword,
    });

    Keyboard.dismiss();

    password == "" ||
      password.length < 8 ||
      password.length > 12 ||
      newPassword == "" ||
      newPassword.length < 8 ||
      newPassword.length > 12 ||
      confirmpassword == "" ||
      confirmpassword != newPassword
      ? null
      : NetInfo.fetch().then((state) => {
        state.isConnected
          ? changePassword()
          : Alert.alert("", "Please check your internet connection", [
            {
              text: "OK",
            },
          ]);
      });
  }

  function goBack() {
    navigation.goBack();
    setPassword("");
    setShowPassword(false);
    setNewPassword("");
    setShowNewPassword(false);
    setConfirmPassword("");
    setShowConfirmPassword(false);
    setShowError({
      password: false,
      newPassword: false,
      confirmpassword: false,
    });
  }

  function changePassword() {
    Alert.alert("", `There is no api.`, [
      { text: "OK" },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar style={styles.topBar}>
        <Appbar.Action
          icon="arrow-left"
          onPress={() => {
            goBack();
          }}
        />
        <Appbar.Content
          title={"Change Password"}
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
          <View>
            <View style={{}}>
              <Text
                style={{
                  lineHeight: 22,
                  color: "#000",
                  fontSize: 16,
                  fontFamily: "Lexend",
                }}
              >
                Enter your new password to change the current password.
              </Text>
            </View>

            <View style={{ marginVertical: 20 }}>
              <Text style={{ fontFamily: "Lexend", marginBottom: 5 }}>Current Password</Text>

              <View style={{ flexDirection: "row" }}>
                <TextInput
                  placeholderTextColor="#888888"
                  placeholder="Current Password"
                  secureTextEntry={!showPassword}
                  maxLength={12}
                  style={styles.textInput}
                  value={password}
                  onChangeText={(value) => setPassword(value)}
                />
                <Text
                  style={{
                    position: "absolute",
                    right: 10,
                    marginTop: 8,
                  }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color="#262c76"
                  />
                </Text>
              </View>
              {showError.password ? (
                password == "" ? (
                  <Text style={styles.errorTextStyle}>
                    Current Password {error.require_error}
                  </Text>
                ) : password.length < 8 || password.length > 12 ? (
                  <Text style={styles.errorTextStyle}>
                    Current Password {error.at_least_8_or_most_20_error}
                  </Text>
                ) : null
              ) : null}
            </View>

            <View>
              <Text style={{ fontFamily: "Lexend", marginBottom: 5 }}>
                New Password
              </Text>

              <View style={{ flexDirection: "row" }}>
                <TextInput
                  placeholderTextColor="#888888"
                  placeholder="New Password"
                  secureTextEntry={!showNewPassword}
                  maxLength={12}
                  style={styles.textInput}
                  value={newPassword}
                  onChangeText={(value) => setNewPassword(value)}
                />
                <Text
                  style={{
                    position: "absolute",
                    right: 10,
                    marginTop: 8,
                  }}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Icon
                    name={showNewPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color="#262c76"
                  />
                </Text>
              </View>
              {showError.newPassword ? (
                newPassword == "" ? (
                  <Text style={styles.errorTextStyle}>
                    New Password {error.require_error}
                  </Text>
                ) : newPassword.length < 8 || newPassword.length > 12 ? (
                  <Text style={styles.errorTextStyle}>
                    New Password {error.at_least_8_or_most_20_error}
                  </Text>
                ) : null
              ) : null}
            </View>

            <View style={{ marginVertical: 20 }}>
              <Text style={{ fontFamily: "Lexend", marginBottom: 5 }}>
                Confirm New Password
              </Text>

              <View style={{ flexDirection: "row" }}>
                <TextInput
                  placeholderTextColor="#888888"
                  placeholder="Confirm New Password"
                  secureTextEntry={!showConfirmPassword}
                  maxLength={12}
                  style={styles.textInput}
                  value={confirmpassword}
                  onChangeText={(value) => setConfirmPassword(value)}
                />
                <Text
                  style={{
                    position: "absolute",
                    right: 10,
                    marginTop: 8,
                  }}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon
                    name={showConfirmPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color="#262c76"
                  />
                </Text>
              </View>
              {showError.confirmpassword ? (
                confirmpassword == "" ? (
                  <Text style={styles.errorTextStyle}>
                    Confirm New Password {error.require_error}
                  </Text>
                ) : confirmpassword != newPassword ? (
                  <Text style={styles.errorTextStyle}>
                    Confirm New Password {error.password_do_not_match_error}
                  </Text>
                ) : null
              ) : null}
            </View>

            <View style={{ marginTop: 10 }}>
              <Button
                mode="contained"
                color={"#262c76"}
                labelStyle={{ fontFamily: "Lexend" }}
                onPress={() => submitPressed()}
              >
                Change Password
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    margin: 20,
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
  textInput: {
    width: "100%",
    paddingHorizontal: 10,
    height: 40,
    color: "#262c76",
    borderColor: "#262c76",
    borderWidth: 1,
    borderRadius: 5,
    fontFamily: "Lexend",
  },
  errorTextStyle: {
    fontSize: 12,
    fontFamily: "Lexend",
    color: "#ff0000",
    padding: 2,
    marginTop: 8,
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

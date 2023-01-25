import React from "react";
import {
  AppRegistry,
  StyleSheet,
  View,
  Text,
  StatusBar,
} from "react-native";
// import "react-native-gesture-handler";
import { useFonts } from "expo-font";

import Lists from "./src/navigation/List";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

const CustomStatusBar = (
  {
    backgroundColor,
    barStyle = "light-content",
  }
) => {

  const insets = useSafeAreaInsets();

  return (
    <View style={{ height: insets.top, backgroundColor }}>
      <StatusBar
        animated={true}
        backgroundColor={backgroundColor}
        barStyle={barStyle} />
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({
    Lexend: require("./assets/fonts/Lexend-Regular.ttf"),
    LexendBold: require("./assets/fonts/Lexend-Bold.ttf"),
    Pyidaungsu: require("./assets/fonts/Pyidaungsu.ttf"),
    PyidaungsuBold: require("./assets/fonts/PyidaungsuBold.ttf"),
    Roboto: require("./assets/fonts/Roboto-Regular.ttf"),
  });

  if (!loaded) {
    return <></>;
  } else {
    return (
      <SafeAreaProvider>
        <CustomStatusBar backgroundColor="#262c76" />
        <View style={styles.container}>
          <Lists />
          {/* <Text style={{ fontFamily: 'LexendBold' }}>Open up App.js to start working on your app!</Text> */}
          {/* <StatusBar style="light" backgroundColor="#262c76" /> */}
        </View>
      </SafeAreaProvider>
    );
  }
}

AppRegistry.registerComponent("ecommerce", () => App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

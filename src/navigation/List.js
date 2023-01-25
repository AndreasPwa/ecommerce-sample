import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import { NavigationContainer, getFocusedRouteNameFromRoute } from "@react-navigation/native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";

import Drawers from "../Drawer";
import Home from "../Home";
import Login from "../Login";
import ForgetPassword from "../customer/ForgetPassword";
import Register from "../customer/Register";
import ProfileSetting from "../customer/ProfileSetting";
import Profile from "../customer/Profile";
import ChangePassword from "../customer/ChangePassword";
import Products from "../tabs/Products";
import ProductDetail from "../tabs/ProductDetail";
import Cart from "../tabs/Cart";
import Checkout from "../tabs/Checkout";
import Suppliers from "../tabs/Suppliers";
import Brands from "../tabs/Brands";
import OrderConfirm from "../tabs/OrderConfirm";
import OrderComplete from "../tabs/OrderComplete";

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView
      contentContainerStyle={{
        paddingTop: 0,
      }}
      {...props}
    >
      <SafeAreaView forceInset={{ bottom: 'never' }}>
        <Drawers />
      </SafeAreaView>
    </DrawerContentScrollView>
  );
}

const Drawer = createDrawerNavigator();

function MyDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        swipeEnabled: false,
        // drawerActiveTintColor: "red",
        // drawerActiveBackgroundColor: "green",
        drawerStyle: { padding: 0, width: "75%" },
        sceneContainerStyle: {
          // padding: 0,
          // margin: 0,
          // backgroundColor: "#636363",
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Login" component={Login} />
      <Drawer.Screen name="ForgetPassword" component={ForgetPassword} />
      <Drawer.Screen name="Register" component={Register} />
      <Drawer.Screen name="ProfileSetting" component={ProfileSetting} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="ChangePassword" component={ChangePassword} />
      <Drawer.Screen name="Products" component={Products} options={{ swipeEnabled: true }} />
      <Drawer.Screen name="ProductDetail" component={ProductDetail} />
      <Drawer.Screen name="Cart" component={Cart} />
      <Drawer.Screen name="Checkout" component={Checkout} />
      <Drawer.Screen name="Suppliers" component={Suppliers} />
      <Drawer.Screen name="Brands" component={Brands} />
      <Drawer.Screen name="OrderConfirm" component={OrderConfirm}/>
      <Drawer.Screen name="OrderComplete" component={OrderComplete}/>
    </Drawer.Navigator>
  );
}

export default function Lists() {
  return (
    <NavigationContainer>
      <MyDrawer />
    </NavigationContainer>
  );
}

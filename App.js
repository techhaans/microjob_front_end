import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Screens
import RoleSelect from "./screens/RoleSelect";

// Doer Screens
import LoginPage from "./screens/LoginPage";
import RegisterPage from "./screens/RegisterPage"; // <-- Added
import Dashboard from "./screens/Dashboard";
import ProfileScreen from "./screens/DoerProfile";
import KYCPage from "./screens/KYCPage";

// Admin Screens
import AdminRegister from "./screens/AdminRegister";
import AdminLogin from "./screens/AdminLogin";
import AdminDashboard from "./screens/AdminDashboard";
import AdminKycScreen from "./screens/AdminKycScreen";

// Super Admin Screens
import SuperAdminLogin from "./screens/SuperAdminLogin";
import SuperAdminDashboard from "./screens/SuperAdminDashboard";

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const superAdminToken = await AsyncStorage.getItem("superAdminToken");
        const adminToken = await AsyncStorage.getItem("adminToken");
        const doerToken = await AsyncStorage.getItem("authToken");

        if (superAdminToken) setInitialRoute("SuperAdminDashboard");
        else if (adminToken) setInitialRoute("AdminDashboard");
        else if (doerToken) setInitialRoute("Dashboard");
        else setInitialRoute("RoleSelect");
      } catch (err) {
        console.error(err);
        setInitialRoute("RoleSelect");
      }
    };
    checkLogin();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: true }}
      >
        {/* Role Selection */}
        <Stack.Screen
          name="RoleSelect"
          component={RoleSelect}
          options={{ title: "Select Role" }}
        />

        {/* Doer */}
        <Stack.Screen
          name="LoginPage"
          component={LoginPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RegisterPage"
          component={RegisterPage}
          options={{ title: "Register as Doer" }}
        />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen
          name="KYCPage"
          component={KYCPage}
          options={{ title: "Upload KYC" }}
        />

        {/* Admin */}
        <Stack.Screen name="AdminRegister" component={AdminRegister} />
        <Stack.Screen
          name="AdminLogin"
          component={AdminLogin}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="AdminKycScreen" component={AdminKycScreen} />

        {/* Super Admin */}
        <Stack.Screen
          name="SuperAdminLogin"
          component={SuperAdminLogin}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SuperAdminDashboard"
          component={SuperAdminDashboard}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

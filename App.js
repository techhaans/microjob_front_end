

import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View, Text } from "react-native";

// Screens
import RoleSelect from "./screens/RoleSelect";

// Doer
import LoginPage from "./screens/LoginPage";
import Dashboard from "./screens/Dashboard";
import EditProfile from "./screens/EditProfile";
import DoerProfile from "./screens/DoerProfile";
import KYCPage from "./screens/KYCPage";

// Poster
import PosterLogin from "./screens/PosterLogin";
import PosterDashboard from "./screens/PosterDashboard";
import PosterProfileView from "./screens/PosterProfileView";
import PosterProfileEdit from "./screens/PosterProfileEdit";
import EditAddress from "./screens/EditAddress";
import PosterKycUpload from "./screens/PosterKycUpload";
import AddressList from "./screens/AddressList";

// Admin
import AdminLogin from "./screens/AdminLogin";
import AdminDashboard from "./screens/AdminDashboard";
import AdminKycDetail from "./screens/AdminKycDetail";

// Super Admin
import SuperAdminLogin from "./screens/SuperAdminLogin";
import SuperAdminDashboard from "./screens/SuperAdminDashboard";

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [initialParams, setInitialParams] = useState(null);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const role = await AsyncStorage.getItem("userRole");

      if (token && role) {
        switch (role) {
          case "DOER":
            const profile = await AsyncStorage.getItem("doerProfile");
            const parsedProfile = profile ? JSON.parse(profile) : null;

            if (parsedProfile?.isNew) {
              // New user → can optionally redirect to EditProfile
              setInitialRoute("Dashboard");
              setInitialParams({ showEditProfilePrompt: true });
            } else {
              setInitialRoute("Dashboard");
              setInitialParams(null);
            }
            break;

          case "POSTER":
            setInitialRoute("PosterDashboard");
            break;

          case "ADMIN":
            setInitialRoute("AdminDashboard");
            break;

          case "SUPERADMIN":
            setInitialRoute("SuperAdminDashboard");
            break;

          default:
            setInitialRoute("RoleSelect");
        }
      } else {
        setInitialRoute("RoleSelect");
      }
    } catch (err) {
      console.error("Login check error:", err);
      setInitialRoute("RoleSelect");
    }
  };

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Checking session...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="RoleSelect" component={RoleSelect} />

        {/* Doer Screens */}
        <Stack.Screen name="LoginPage" component={LoginPage} />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          initialParams={initialParams} // pass params to Dashboard
        />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="DoerProfile" component={DoerProfile} />
        <Stack.Screen name="KYCPage" component={KYCPage} />

        {/* Poster Screens */}
        <Stack.Screen name="PosterLogin" component={PosterLogin} />
        <Stack.Screen name="PosterDashboard" component={PosterDashboard} />
        <Stack.Screen name="PosterProfileView" component={PosterProfileView} />
        <Stack.Screen name="PosterProfileEdit" component={PosterProfileEdit} />
        <Stack.Screen name="EditAddress" component={EditAddress} />
        <Stack.Screen name="PosterKycUpload" component={PosterKycUpload} />
        <Stack.Screen name="AddressList" component={AddressList} />

        {/* Admin Screens */}
        <Stack.Screen name="AdminLogin" component={AdminLogin} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="AdminKycDetail" component={AdminKycDetail} />

        {/* Super Admin Screens */}
        <Stack.Screen name="SuperAdminLogin" component={SuperAdminLogin} />
        <Stack.Screen
          name="SuperAdminDashboard"
          component={SuperAdminDashboard}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

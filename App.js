import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  View,
  Text,
  UIManager,
  Platform,
  LogBox,
} from "react-native";

// ⚙️ Optional: hide warnings
LogBox.ignoreLogs([
  "setLayoutAnimationEnabledExperimental is currently a no-op in the New Architecture",
]);

// ✅ Optional old-architecture check
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental &&
  !global.nativeFabricUIManager
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Screens
import RoleSelect from "./screens/RoleSelect";
import LoginPage from "./screens/LoginPage";
import Dashboard from "./screens/Dashboard";
import EditProfile from "./screens/EditProfile";
import DoerProfile from "./screens/DoerProfile";
import KYCPage from "./screens/KYCPage";
import PosterDashboard from "./screens/PosterDashboard";
import PosterProfileView from "./screens/PosterProfileView";
import PosterProfileEdit from "./screens/PosterProfileEdit";
import EditAddress from "./screens/EditAddress";
import PosterKycUpload from "./screens/PosterKycUpload";
import AddressList from "./screens/AddressList";
import AdminDashboard from "./screens/AdminDashboard";
import AdminKycDetail from "./screens/AdminKycDetail";
import SuperAdminDashboard from "./screens/SuperAdminDashboard";
import AddressForm from "./screens/AddressForm";
import AdminLogin from "./screens/AdminLogin";

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState("LoginPage");
  const [initialParams, setInitialParams] = useState(null);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const role = await AsyncStorage.getItem("userRole");

      if (token && role) {
        // If user is already logged in, skip RoleSelect
        switch (role) {
          case "DOER":
            const profile = await AsyncStorage.getItem("doerProfile");
            const parsedProfile = profile ? JSON.parse(profile) : null;
            if (parsedProfile?.isNew) {
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
            setInitialRoute("LoginPage");
        }
      } else {
        setInitialRoute("LoginPage"); // Default first screen
      }
    } catch (err) {
      console.error("Login check error:", err);
      setInitialRoute("LoginPage");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
        {/* Login and Role Select */}
        <Stack.Screen name="LoginPage" component={LoginPage} />
        <Stack.Screen name="RoleSelect" component={RoleSelect} />

        {/* Doer */}
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          initialParams={initialParams}
        />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="DoerProfile" component={DoerProfile} />
        <Stack.Screen name="KYCPage" component={KYCPage} />

        {/* Poster */}
        <Stack.Screen name="PosterDashboard" component={PosterDashboard} />
        <Stack.Screen name="PosterProfileView" component={PosterProfileView} />
        <Stack.Screen name="PosterProfileEdit" component={PosterProfileEdit} />
        <Stack.Screen name="EditAddress" component={EditAddress} />
        <Stack.Screen name="PosterKycUpload" component={PosterKycUpload} />
        <Stack.Screen name="AddressList" component={AddressList} />
        <Stack.Screen name="AddressForm" component={AddressForm} />

        {/* Admin */}
        <Stack.Screen name="AdminLogin" component={AdminLogin} />

        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="AdminKycDetail" component={AdminKycDetail} />

        {/* Super Admin */}
        <Stack.Screen
          name="SuperAdminDashboard"
          component={SuperAdminDashboard}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

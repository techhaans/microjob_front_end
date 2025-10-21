// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";

// // Axios instance
// const api = axios.create({
//   baseURL: "http://192.168.156.218:8080/api", // use your machine IP
//   headers: { "Content-Type": "application/json" },
// });

// export default function AdminLogin({ navigation }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     if (!email || !password)
//       return Alert.alert("Error", "Enter email & password");

//     setLoading(true);

//     try {
//       // Trim inputs
//       const payload = { email: email.trim(), password: password.trim() };

//       // Call login API
//       const res = await api.post("/auth/admin/login", payload);
//       const { token, refreshToken, role, adminId } = res.data.data;

//       if (!token) return Alert.alert("Error", "Login failed");

//       // Save tokens based on role
//       if (role === "SUPER_ADMIN" || adminId === 1) {
//         await AsyncStorage.setItem("superAdminToken", token);
//         await AsyncStorage.setItem("superAdminRefreshToken", refreshToken);
//         Alert.alert("Success", "Super Admin Logged In");
//         navigation.replace("SuperAdminDashboard");
//       } else {
//         await AsyncStorage.setItem("adminToken", token);
//         await AsyncStorage.setItem("adminRefreshToken", refreshToken);
//         Alert.alert("Success", "Admin Logged In");
//         navigation.replace("AdminDashboard");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert(
//         "Error",
//         err.response?.data?.message || err.message || "Login failed"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Admin / Super Admin Login</Text>
//       <TextInput
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//         autoCapitalize="none"
//         style={styles.input}
//       />
//       <TextInput
//         placeholder="Password"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//         style={styles.input}
//       />
//       <TouchableOpacity
//         style={styles.button}
//         onPress={handleLogin}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.btnText}>Login</Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#f2f2f2",
//   },
//   title: { fontSize: 24, fontWeight: "bold", marginBottom: 30 },
//   input: {
//     width: "100%",
//     padding: 15,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     marginBottom: 20,
//     backgroundColor: "#fff",
//   },
//   button: {
//     backgroundColor: "#2196f3",
//     padding: 15,
//     width: "100%",
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
// });

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Axios instance
const api = axios.create({
  baseURL: "http://192.168.156.218:8080/api", // 🧠 use your backend machine IP
  headers: { "Content-Type": "application/json" },
});

export default function AdminLogin({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: email.trim(),
        password: password.trim(),
      };

      const res = await api.post("/auth/admin/login", payload);
      const { token, refreshToken, role, adminId } = res.data.data;

      if (!token) {
        Alert.alert("Error", "Login failed. Please try again.");
        return;
      }

      // ✅ Save tokens based on role
      if (role === "SUPER_ADMIN" || adminId === 1) {
        await AsyncStorage.setItem("superAdminToken", token);
        await AsyncStorage.setItem("superAdminRefreshToken", refreshToken);
        Alert.alert("Success", "Super Admin Logged In Successfully");
        navigation.replace("SuperAdminDashboard");
      } else {
        await AsyncStorage.setItem("adminToken", token);
        await AsyncStorage.setItem("adminRefreshToken", refreshToken);
        Alert.alert("Success", "Admin Logged In Successfully");
        navigation.replace("AdminDashboard");
      }
    } catch (err) {
      console.error("Login error:", err);

      // ✅ Extract backend message safely
      const serverMessage = err.response?.data?.message?.toLowerCase() || "";

      // 🧠 Custom error handling for invalid credentials
      if (
        serverMessage.includes("invalid") ||
        serverMessage.includes("unauthorized") ||
        serverMessage.includes("bad credentials")
      ) {
        Alert.alert("Login Failed", "Email or password incorrect. Try again.");
      } else if (serverMessage.includes("user not found")) {
        Alert.alert("Error", "Account not found. Please check your email.");
      } else if (serverMessage.includes("disabled")) {
        Alert.alert(
          "Error",
          "Your account has been disabled. Contact support."
        );
      } else {
        Alert.alert(
          "Error",
          err.response?.data?.message ||
            err.message ||
            "Something went wrong. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin / Super Admin Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#2196f3",
    padding: 15,
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

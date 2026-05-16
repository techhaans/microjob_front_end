import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Axios Base URL
const api = axios.create({
  baseURL: "http://192.168.1.40:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Email must end with @microjob.com
const isValidMicroJobEmail = (email) => {
  const pattern = /^[A-Za-z0-9._%+-]+@microjob\.com$/;
  return pattern.test(email);
};

export default function AdminLogin({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Error States
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    let hasError = false;

    // Reset errors
    setEmailError("");
    setPasswordError("");

    // Email validation
    if (!email.trim()) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!isValidMicroJobEmail(email.trim())) {
      setEmailError("Email must end with @microjob.com");
      hasError = true;
    }

    // Password validation
    if (!password.trim()) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const res = await api.post("/auth/admin/login", {
        email: email.trim(),
        password: password.trim(),
      });

      const { token, refreshToken, role, adminId } = res.data.data;

      // SUPER ADMIN
      if (role === "SUPER_ADMIN" || adminId === 1) {
        await AsyncStorage.setItem("superAdminToken", token);
        await AsyncStorage.setItem("superAdminRefreshToken", refreshToken);
        navigation.replace("SuperAdminDashboard");
      }
      // NORMAL ADMIN
      else {
        await AsyncStorage.setItem("adminToken", token);
        await AsyncStorage.setItem("adminRefreshToken", refreshToken);
        navigation.replace("AdminDashboard");
      }
    } catch (err) {
      const serverMsg =
        err.response?.data?.message?.toLowerCase() ||
        err.response?.data?.error?.toLowerCase() ||
        "";

      // Map server errors to UI
      if (
        serverMsg.includes("invalid") ||
        serverMsg.includes("unauthorized") ||
        serverMsg.includes("bad credentials")
      ) {
        setPasswordError("Incorrect email or password");
      } else if (serverMsg.includes("user not found")) {
        setEmailError("Account not found");
      } else if (serverMsg.includes("disabled")) {
        setEmailError("Your account is disabled");
      } else {
        setPasswordError("Email or password incorrect");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin / Super Admin Login</Text>

      {/* Email Field */}
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          setEmailError("");

          if (v.length > 0 && !isValidMicroJobEmail(v.trim())) {
            setEmailError("Email must end with @microjob.com");
          }
        }}
        style={[styles.input, emailError ? { borderColor: "red" } : null]}
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      {/* Password Field */}
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          setPasswordError("");
        }}
        style={[styles.input, passwordError ? { borderColor: "red" } : null]}
      />
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}

      {/* Login Button */}
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

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 25,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: "#fff",
  },
  errorText: {
    color: "red",
    width: "100%",
    marginBottom: 10,
    marginTop: -2,
    fontSize: 13,
  },
  button: {
    backgroundColor: "#1e88e5",
    padding: 15,
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

import React, { useEffect, useState } from "react";
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
import { registerAdmin } from "../api/admin.js";

export default function AdminRegister({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [superAdminToken, setSuperAdminToken] = useState(null);
  const [loadingToken, setLoadingToken] = useState(true);

  useEffect(() => {
    const getToken = async () => {
      const token = await AsyncStorage.getItem("superAdminToken");
      if (!token) {
        Alert.alert("Access Denied", "Super Admin must login first", [
          { text: "OK", onPress: () => navigation.replace("SuperAdminLogin") },
        ]);
      } else setSuperAdminToken(token);
      setLoadingToken(false);
    };
    getToken();
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      return Alert.alert("Error", "Enter all fields");
    }
    if (!superAdminToken) return;

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        phone_e164: phone,
        password,
      };
      await registerAdmin(payload, superAdminToken);

      Alert.alert("Success", "Admin Registered Successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingToken)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text>Checking Super Admin login...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register Admin</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Phone (+91xxxxxxxxxx)"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Register</Text>
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
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30 },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2196f3",
    padding: 15,
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});

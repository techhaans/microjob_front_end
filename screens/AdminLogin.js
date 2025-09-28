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
import { loginAdmin } from "../api/admin.js";

export default function AdminLogin({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password)
      return Alert.alert("Error", "Enter email & password");

    setLoading(true);
    try {
      await loginAdmin(email, password); // ✅ Admin can login independently
      Alert.alert("Success", "Admin Logged In");
      navigation.replace("AdminDashboard");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
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
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Login</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.registerBtn}
        onPress={() => navigation.navigate("AdminRegister")}
      >
        <Text style={styles.registerText}>New Admin? Register</Text>
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
  registerBtn: { marginTop: 15 },
  registerText: {
    color: "#2196f3",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

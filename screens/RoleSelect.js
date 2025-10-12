
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { selectRole } from "../api/auth";
import { Ionicons } from "@expo/vector-icons"; // make sure expo/vector-icons installed

export default function RoleSelect({ navigation }) {
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (role) => {
    setLoading(true);
    try {
      const res = await selectRole(role);
      if (res.status !== "SUCCESS") throw new Error(res.message);

      if (role === "DOER") navigation.replace("Dashboard");
      else navigation.replace("PosterDashboard");
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back arrow */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.replace("LoginPage")} // Use replace
      >
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <Image
        source={require("../images/mjlogo.jpg")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Select Your Role</Text>

      <TouchableOpacity
        style={[styles.button, styles.doerButton]}
        onPress={() => handleRoleSelect("DOER")}
      >
        <Text style={styles.buttonText}>Continue as DOER</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.posterButton]}
        onPress={() => handleRoleSelect("POSTER")}
      >
        <Text style={styles.buttonText}>Continue as POSTER</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#fff" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071A52",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  logo: { width: 100, height: 100, marginBottom: 20 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 30 },
  button: {
    width: "90%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  doerButton: { backgroundColor: "#1E90FF" },
  posterButton: { backgroundColor: "#28A745" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

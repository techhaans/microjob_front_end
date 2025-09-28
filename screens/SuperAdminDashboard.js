import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://192.168.1.6:8080/api";

export default function SuperAdminDashboard({ navigation }) {
  const [doers, setDoers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoers();
  }, []);

  const fetchDoers = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("superAdminToken");
      if (!token) return navigation.replace("SuperAdminLogin");

      const doerRes = await axios.get(`${BASE_URL}/superadmin/doers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDoers(doerRes.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch doers");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("superAdminToken");
    navigation.replace("RoleSelect");
  };

  const handleRegisterNavigation = async () => {
    const token = await AsyncStorage.getItem("superAdminToken");
    if (!token) {
      Alert.alert("Access Denied", "Super Admin must login first");
      return navigation.replace("SuperAdminLogin");
    }
    navigation.navigate("AdminRegister");
  };

  if (loading)
    return (
      <ActivityIndicator size="large" style={{ flex: 1 }} color="#2196f3" />
    );

  return (
    <ScrollView style={styles.container}>
      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* 🔹 Admin Register Navigation */}
      <TouchableOpacity
        style={styles.registerBtn}
        onPress={handleRegisterNavigation}
      >
        <Text style={styles.registerText}> Register New Admin</Text>
      </TouchableOpacity>

      <Text style={styles.title}>All Doers</Text>
      {doers.length === 0 ? (
        <Text style={styles.empty}>No doers found</Text>
      ) : (
        doers.map((d) => (
          <View key={d.id} style={styles.card}>
            <Text style={styles.name}>{d.name}</Text>
            <Text>Email: {d.email}</Text>
            <Text>Phone: {d.phone}</Text>
            <Text>KYC: {d.kycVerified ? "✅ Verified" : "❌ Pending"}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f0f4f7" },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 15 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  name: { fontSize: 18, fontWeight: "600" },
  empty: { fontSize: 16, color: "gray", marginVertical: 10 },
  logoutBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#ff3b30",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  registerBtn: {
    backgroundColor: "#4caf50",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  registerText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});

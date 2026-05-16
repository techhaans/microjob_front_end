import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://192.168.60.218:8080/api";

export default function AdminDashboard({ navigation }) {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingKyc();
  }, []);

  const fetchPendingKyc = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("adminToken");
      if (!token) return navigation.replace("AdminLogin");

      const res = await axios.get(`${BASE_URL}/admin/kyc/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Safely extract array
      const list = res.data?.data?.content || [];
      setKycList(list);
    } catch (err) {
      console.error("Fetch KYC Error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch KYC requests");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("adminToken");
    navigation.replace("RoleSelect");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Pending KYC Requests</Text>

      {kycList.length === 0 ? (
        <Text style={styles.empty}>No pending KYC requests</Text>
      ) : (
        kycList.map((kyc) => (
          <TouchableOpacity
            key={kyc?.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("AdminKycDetail", { kycId: kyc?.id })
            }
          >
            <Text style={styles.name}>Name: {kyc?.userName || "N/A"}</Text>
            <Text>Phone: {kyc?.userPhone || "N/A"}</Text>
            <Text>Document Type: {kyc?.docType || "N/A"}</Text>
            <Text>Status: {kyc?.status || "N/A"}</Text>
            <Text style={styles.viewText}>Tap to view details</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f0f4f7" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 15 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  name: { fontSize: 18, fontWeight: "600" },
  empty: { fontSize: 16, color: "gray", marginVertical: 10 },
  viewText: { marginTop: 10, color: "#2196f3", fontWeight: "600" },
  logoutBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#ff3b30",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  logoutText: { color: "#fff", fontWeight: "bold" },
});

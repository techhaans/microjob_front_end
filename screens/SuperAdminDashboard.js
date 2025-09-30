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

const BASE_URL = "http://10.90.169.218:8080/api";

export default function SuperAdminDashboard({ navigation }) {
  const [doers, setDoers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchDoers(1, true);
  }, []);

  // 🔹 Fetch Doers API
  const fetchDoers = async (pageNum = 1, reset = false) => {
    if (pageNum > totalPages && !reset) return;

    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const token = await AsyncStorage.getItem("superAdminToken");
      if (!token) return navigation.replace("SuperAdminLogin");

      const res = await axios.get(
        `${BASE_URL}/admin/all_doers?page=${pageNum}&size=5&sort=createdAt&sort=asc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data?.data;
      if (reset) {
        setDoers(data?.content || []);
      } else {
        setDoers((prev) => [...prev, ...(data?.content || [])]);
      }

      setPage(data?.page || 1);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch doers");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 🔹 Logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem("superAdminToken");
    navigation.replace("RoleSelect");
  };

  // 🔹 Navigate to Register Admin
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
          <View key={d.userId} style={styles.card}>
            <Text style={styles.name}>{d.name}</Text>
            <Text>Bio: {d.bio}</Text>
            <Text>Skills: {d.skills?.join(", ")}</Text>
            <Text>KYC Level: {d.kycLevel}</Text>
            <Text>Status: {d.verificationStatus}</Text>
            <Text>Verified: {d.isVerified ? "✅ Yes" : "❌ No"}</Text>
          </View>
        ))
      )}

      {/* 🔹 Load More Pagination */}
      {page < totalPages && (
        <TouchableOpacity
          style={styles.loadMoreBtn}
          onPress={() => fetchDoers(page + 1)}
          disabled={loadingMore}
        >
          <Text style={styles.loadMoreText}>
            {loadingMore ? "Loading..." : "Load More"}
          </Text>
        </TouchableOpacity>
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
  loadMoreBtn: {
    backgroundColor: "#2196f3",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  loadMoreText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

import React, { useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ Added

const BASE_URL = "http://192.168.60.218:8080/api";

export default function AdminDashboard({ navigation }) {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("DOER");
  const [viewMode, setViewMode] = useState("KYC");
  const [activityList, setActivityList] = useState([]);

  const fetchKyc = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("adminToken");
      if (!token) return navigation.replace("AdminLogin");

      const res = await axios.get(`${BASE_URL}/admin/kyc/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allKyc = res.data?.data?.content || [];
      const filteredList = allKyc
        .filter((item) => item.status === "PENDING" && item.roleType === selectedType)
        .map((item) => ({
          ...item,
          role: item.roleType === "DOER" ? "Doer" : "Poster",
        }));

      setKycList(filteredList);
    } catch (err) {
      console.error("Fetch KYC Error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch KYC requests");
      setKycList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminActivity = async (type) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("adminToken");
      if (!token) return navigation.replace("AdminLogin");

      const endpoint =
        type === "DOER"
          ? `${BASE_URL}/admin/kyc/all_doers`
          : `${BASE_URL}/admin/kyc/all_posters`;

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = res.data?.data?.content || [];
      setActivityList(list);
      setViewMode("ACTIVITY");
    } catch (err) {
      console.error("Admin activity fetch error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch admin activities.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (viewMode === "KYC") fetchKyc();
    }, [selectedType, viewMode])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem("adminToken");
    navigation.replace("RoleSelect");
  };

  const renderKycItem = (kyc) => (
    <TouchableOpacity
      key={kyc.id}
      style={styles.card}
      onPress={() =>
        navigation.navigate("AdminKycDetail", {
          kycId: kyc.id,
          role: kyc.role,
        })
      }
    >
      <Text style={styles.name}>Name: {kyc.userName || "N/A"}</Text>
      <Text>Phone: {kyc.userPhone || "N/A"}</Text>
      <Text>Role: {kyc.role}</Text>
      {kyc.docType && <Text>Document Type: {kyc.docType}</Text>}
      <Text>Status: {kyc.status}</Text>
      <Text style={styles.viewText}>Tap to view details</Text>
    </TouchableOpacity>
  );

  const renderActivityItem = (item) => (
    <View key={item.userId || item.email} style={styles.card}>
      <Text style={styles.name}>Name: {item.name || "N/A"}</Text>
      <Text>Phone: {item.phone || "N/A"}</Text>
      {item.email && <Text>Email: {item.email}</Text>}
      {item.bio && <Text>Bio: {item.bio}</Text>}
      {item.about && <Text>About: {item.about}</Text>}
      {item.skills && <Text>Skills: {item.skills.join(", ")}</Text>}
      {item.KycStatus !== undefined && (
        <Text>
          KYC Status: {item.KycStatus ? "✅ Verified" : "⏳ Pending"}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );
  }

  return (
    <>
      {/* ✅ Fixed Safe Header */}
      <SafeAreaView style={{ backgroundColor: "#2196f3" }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Content */}
      <ScrollView style={styles.container}>
        <Text style={styles.title}>
          {viewMode === "KYC" ? "Pending KYC Requests" : "Admin Activities"}
        </Text>

        {/* 🔹 KYC Toggle */}
        {viewMode === "KYC" && (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, selectedType === "DOER" && styles.selectedBtn]}
              onPress={() => setSelectedType("DOER")}
            >
              <Text
                style={[styles.toggleText, selectedType === "DOER" && styles.selectedText]}
              >
                Doers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, selectedType === "POSTER" && styles.selectedBtn]}
              onPress={() => setSelectedType("POSTER")}
            >
              <Text
                style={[styles.toggleText, selectedType === "POSTER" && styles.selectedText]}
              >
                Posters
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 🔹 KYC List */}
        {viewMode === "KYC" && (
          <>
            {kycList.length === 0 ? (
              <Text style={styles.empty}>
                No pending {selectedType.toLowerCase()} KYC requests
              </Text>
            ) : (
              kycList.map((kyc) => renderKycItem(kyc))
            )}
          </>
        )}

        {/* 🔹 Admin Activity List */}
        {viewMode === "ACTIVITY" && (
          <>
            {activityList.length === 0 ? (
              <Text style={styles.empty}>No profiles found</Text>
            ) : (
              activityList.map((item) => renderActivityItem(item))
            )}
          </>
        )}

        {/* 🔹 Admin Activity Buttons */}
        <View style={styles.activityContainer}>
          <Text style={styles.activityTitle}>Admin Activities</Text>

          <TouchableOpacity
            style={styles.activityBtn}
            onPress={() => fetchAdminActivity("DOER")}
          >
            <Text style={styles.activityText}>View All Doers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.activityBtn}
            onPress={() => fetchAdminActivity("POSTER")}
          >
            <Text style={styles.activityText}>View All Posters</Text>
          </TouchableOpacity>

          {viewMode === "ACTIVITY" && (
            <TouchableOpacity
              style={[styles.activityBtn, { backgroundColor: "#777" }]}
              onPress={() => setViewMode("KYC")}
            >
              <Text style={styles.activityText}>← Back to KYC Requests</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f0f4f7" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // ✅ Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2196f3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 4,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  logoutBtn: {
    backgroundColor: "#ff3b30",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  logoutText: { color: "#fff", fontWeight: "bold" },

  title: { fontSize: 22, fontWeight: "bold", marginVertical: 15 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: { fontSize: 17, fontWeight: "600" },
  empty: { fontSize: 16, color: "gray", marginVertical: 10 },
  viewText: { marginTop: 10, color: "#2196f3", fontWeight: "600" },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  toggleBtn: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
  },
  selectedBtn: { backgroundColor: "#2196f3" },
  toggleText: { fontWeight: "600", color: "#333" },
  selectedText: { color: "#fff" },
  activityContainer: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#0b4da0",
  },
  activityBtn: {
    backgroundColor: "#2196f3",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  activityText: { color: "#fff", fontWeight: "700" },
});

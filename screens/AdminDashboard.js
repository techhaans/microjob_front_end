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

const BASE_URL = "http://192.168.60.218:8080/api";

export default function AdminDashboard({ navigation }) {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("DOER"); // default toggle

  const fetchKyc = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("adminToken");
      if (!token) return navigation.replace("AdminLogin");

      // Fetch only pending KYC
      const res = await axios.get(`${BASE_URL}/admin/kyc/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Pending KYC API Response:", JSON.stringify(res.data, null, 2));

      // Filter pending KYC by selectedType
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

  // Refresh whenever screen is focused or toggle changes
  useFocusEffect(
    useCallback(() => {
      fetchKyc();
    }, [selectedType])
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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

      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, selectedType === "DOER" && styles.selectedBtn]}
          onPress={() => setSelectedType("DOER")}
        >
          <Text style={[styles.toggleText, selectedType === "DOER" && styles.selectedText]}>
            Doers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, selectedType === "POSTER" && styles.selectedBtn]}
          onPress={() => setSelectedType("POSTER")}
        >
          <Text style={[styles.toggleText, selectedType === "POSTER" && styles.selectedText]}>
            Posters
          </Text>
        </TouchableOpacity>
      </View>

      {/* KYC List */}
      {kycList.length === 0 ? (
        <Text style={styles.empty}>No pending {selectedType.toLowerCase()} KYC requests</Text>
      ) : (
        kycList.map((kyc) => renderKycItem(kyc))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f0f4f7" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 15 },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 15 },
  name: { fontSize: 18, fontWeight: "600" },
  empty: { fontSize: 16, color: "gray", marginVertical: 10 },
  viewText: { marginTop: 10, color: "#2196f3", fontWeight: "600" },
  logoutBtn: { alignSelf: "flex-end", backgroundColor: "#ff3b30", padding: 10, borderRadius: 8, marginBottom: 10 },
  logoutText: { color: "#fff", fontWeight: "bold" },
  toggleContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 15 },
  toggleBtn: { flex: 1, padding: 10, marginHorizontal: 5, backgroundColor: "#ddd", borderRadius: 8, alignItems: "center" },
  selectedBtn: { backgroundColor: "#2196f3" },
  toggleText: { fontWeight: "600", color: "#333" },
  selectedText: { color: "#fff" },
});


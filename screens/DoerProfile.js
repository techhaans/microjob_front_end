import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchProfile } from "../api/doer";

export default function DoerProfile({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        navigation.replace("RoleSelect");
        return;
      }

      const res = await fetchProfile(token);
      setProfile(res.data.data);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );

  // Profile options including KYC status and rejection reason
  const profileOptions = [
    { title: "Name", value: profile.name || "Not set" },
    { title: "Bio", value: profile.bio || "Not set" },
    { title: "Skills", value: profile.skills?.join(", ") || "No skills" },
    {
      title: "KYC Status",
      value:
        profile.verificationStatus === "VERIFIED"
          ? "✅ Verified"
          : profile.verificationStatus === "KYC_REJECTED"
          ? "❌ Rejected"
          : "⏳ Pending",
      color:
        profile.verificationStatus === "VERIFIED"
          ? "green"
          : profile.verificationStatus === "KYC_REJECTED"
          ? "red"
          : "orange",
    },
    // Show rejection reason if KYC rejected
    ...(profile.verificationStatus === "KYC_REJECTED"
      ? [
          {
            title: "Rejection Reason",
            value: profile.rejectionReason ?? "No reason provided",
            color: "red",
          },
        ]
      : []),
    { title: "KYC Level", value: profile.kycLevel ?? "Not verified" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerText}>Profile Details</Text>

      <View style={styles.grid}>
        {profileOptions.map((item, index) => (
          <View key={index} style={styles.gridButton}>
            <Text style={styles.gridTitle}>{item.title}</Text>
            <Text style={[styles.gridValue, { color: item.color || "#555" }]}>
              {item.value}
            </Text>
          </View>
        ))}

        {/* Upload KYC button if not verified or rejected */}
        {profile.verificationStatus !== "VERIFIED" && (
          <TouchableOpacity
            style={[styles.gridButton, styles.kycGridBtn]}
            onPress={() => navigation.navigate("KYCPage")}
          >
            <Text style={styles.gridTitle}>Upload KYC</Text>
            <Text style={styles.gridValue}>
              {profile.verificationStatus === "KYC_REJECTED"
                ? "Re-upload after rejection"
                : "Click here"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          await AsyncStorage.removeItem("authToken");
          navigation.replace("RoleSelect");
        }}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f4f6fa",
    alignItems: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridButton: {
    width: "47%",
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kycGridBtn: { backgroundColor: "#2196f3" },
  gridTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
    textAlign: "center",
  },
  gridValue: { fontSize: 14, textAlign: "center" },
  logoutBtn: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 30,
    width: "100%",
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

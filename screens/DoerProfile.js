
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchDoerProfile } from "../api/doer"; // ✅ import your API helper

export default function DoerProfile({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      console.log("🔄 Refreshing DoerProfile screen...");
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      setLoading(true);

      // ✅ Fetch profile using your helper
      const res = await fetchDoerProfile();
      console.log("✅ API Profile Response:", res);

      const profileData = res?.data || {};

      const normalizedProfile = {
        name: profileData.name || "N/A",
        bio: profileData.bio || "No bio available",
        phone: profileData.phone || "N/A",
        email: profileData.email || "N/A",
        skills: profileData.skills || [],
        isVerified: profileData.isVerified ?? false,
        isPhoneVerified: profileData.isPhoneVerified ?? false,
        verificationStatus: profileData.verificationStatus || "NOT_VERIFIED",
        rejectionReason: profileData.rejectionReason || null,
        kycLevel: profileData.kycLevel ?? 0,
        createdAt: profileData.createdAt || null,
        updatedAt: profileData.updatedAt || null,
      };

      setProfile(normalizedProfile);
      await AsyncStorage.setItem(
        "doerProfile",
        JSON.stringify(normalizedProfile)
      );
    } catch (err) {
      console.error("❌ Failed to load profile", err);
      Alert.alert("Error", "Failed to fetch profile. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={{ marginTop: 10, color: "#555" }}>Loading profile...</Text>
      </View>
    );

  if (!profile)
    return (
      <View style={styles.center}>
        <Text style={{ color: "#555", fontSize: 16 }}>No profile found</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity
        style={{ marginBottom: 20 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={26} color="#000" />
      </TouchableOpacity>

      <Text style={styles.headerText}>Doer Profile</Text>

      {/* 🧍 Basic Info */}
      <View style={styles.card}>
        <Text style={styles.label}>👤 Name</Text>
        <Text style={styles.value}>{profile.name}</Text>

        <Text style={styles.label}>📞 Phone</Text>
        <Text style={styles.value}>{profile.phone}</Text>

        <Text style={styles.label}>📧 Email</Text>
        <Text style={styles.value}>{profile.email}</Text>

        <Text style={styles.label}>📝 Bio</Text>
        <Text style={styles.value}>{profile.bio}</Text>

        <Text style={styles.label}>🧠 Skills</Text>
        <Text style={styles.value}>
          {profile.skills.length
            ? profile.skills.join(", ")
            : "No skills added"}
        </Text>
      </View>

      {/* 🔒 Verification Info */}
      <View style={styles.card}>
        <Text style={styles.label}>📞 Phone Verified</Text>
        <Text
          style={[
            styles.value,
            { color: profile.isPhoneVerified ? "green" : "red" },
          ]}
        >
          {profile.isPhoneVerified ? "Yes ✅" : "No ❌"}
        </Text>

        <Text style={styles.label}>🪪 KYC Level</Text>
        <Text style={styles.value}>{profile.kycLevel}</Text>

        <Text style={styles.label}>✅ Verified Profile</Text>
        <Text
          style={[
            styles.value,
            { color: profile.isVerified ? "green" : "red" },
          ]}
        >
          {profile.isVerified ? "Verified" : "Not Verified"}
        </Text>

        <Text style={styles.label}>📋 Verification Status</Text>
        <Text style={styles.value}>{profile.verificationStatus}</Text>

        {profile.rejectionReason ? (
          <>
            <Text style={styles.label}>❌ Rejection Reason</Text>
            <Text style={[styles.value, { color: "red" }]}>
              {profile.rejectionReason}
            </Text>
          </>
        ) : null}
      </View>

      {/* 🔄 Manual Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={loadProfile}>
        <Text style={styles.refreshText}>🔄 Refresh Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f2f6fc", paddingBottom: 30 },
  headerText: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    color: "#4a90e2",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  label: { fontWeight: "700", color: "#555", marginTop: 10, fontSize: 14 },
  value: { fontSize: 16, marginTop: 3, color: "#333" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  refreshButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  refreshText: { color: "white", fontSize: 16, fontWeight: "600" },
});

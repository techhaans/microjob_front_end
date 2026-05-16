import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import API
import { fetchDoerProfile, getUserProfileAPI } from "../api/doer";

export default function DoerProfile({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  const loadProfile = async () => {
    try {
      setLoading(true);

      const doerRes = await fetchDoerProfile();
      const userRes = await getUserProfileAPI();

      const doerData = doerRes?.data || {};
      const userData = userRes?.data || {};
      console.log("PHOTO URL:", userData.photoUrl);

      /**
       *  IMPORTANT FIX FOR IMAGE URL
       *  Convert "localhost" → your local IP
       */
      let fixedUrl = null;
      if (userData.photoUrl) {
        fixedUrl = userData.photoUrl.replace(
          "localhost",
          "192.168.1.40", // ⬅️ replace with your PC IP
        );
      }

      const normalizedProfile = {
        // Doer info
        name: doerData.name || "N/A",
        bio: doerData.bio || "No bio available",
        phone: doerData.phone || "N/A",
        email: doerData.email || "N/A",
        skills: doerData.skills || [],
        isVerified: doerData.isVerified ?? false,
        isPhoneVerified: doerData.isPhoneVerified ?? false,
        verificationStatus: doerData.verificationStatus || "NOT_VERIFIED",
        rejectionReason: doerData.rejectionReason || null,
        kycLevel: doerData.kycLevel ?? 0,

        // User info
        gender: userData.gender || "N/A",
        dob: userData.dob || "N/A",
        photoUrl: fixedUrl, // 👈 FIXED URL USED HERE
        languagePref: userData.languagePref || "N/A",
        createdAt: userData.createdAt || null,
        updatedAt: userData.updatedAt || null,
      };

      setProfile(normalizedProfile);
      await AsyncStorage.setItem(
        "doerProfile",
        JSON.stringify(normalizedProfile),
      );
    } catch (err) {
      console.error(err);
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
      {/* Back */}
      <TouchableOpacity
        style={{ marginBottom: 20 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={26} color="#000" />
      </TouchableOpacity>

      <Text style={styles.headerText}>Doer Profile</Text>

      {/* Profile Picture */}
      {profile.photoUrl && (
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Image
            source={{ uri: profile.photoUrl }}
            style={{ width: 120, height: 120, borderRadius: 60 }}
          />
        </View>
      )}

      {/* Basic Info */}
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

        <Text style={styles.label}>🧬 Gender</Text>
        <Text style={styles.value}>{profile.gender}</Text>

        <Text style={styles.label}>🎂 Date of Birth</Text>
        <Text style={styles.value}>{profile.dob}</Text>

        <Text style={styles.label}>🌐 Language Preference</Text>
        <Text style={styles.value}>{profile.languagePref}</Text>
      </View>

      {/* Verification Info */}
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

        {profile.rejectionReason && (
          <>
            <Text style={styles.label}>❌ Rejection Reason</Text>
            <Text style={[styles.value, { color: "red" }]}>
              {profile.rejectionReason}
            </Text>
          </>
        )}

        <Text style={styles.label}>🕒 Created At</Text>
        <Text style={styles.value}>{profile.createdAt}</Text>

        <Text style={styles.label}>🕒 Updated At</Text>
        <Text style={styles.value}>{profile.updatedAt}</Text>
      </View>

      {/* Refresh Button */}
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

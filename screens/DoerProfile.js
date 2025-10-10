import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DoerProfile({ route }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem("doerProfile");
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        // Safely handle nested backend response
        const profileData = parsed?.data?.data || parsed?.data || parsed;

        setProfile({
          name: profileData.name,
          phone: profileData.phone,
          email: profileData.email || "N/A",
          bio: profileData.bio,
          skills: profileData.skills || [],
          isVerified: profileData.isVerified,
          verificationStatus: profileData.verificationStatus,
          kycLevel: profileData.kycLevel,
        });
      }
    } catch (err) {
      console.log("Failed to load profile", err);
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
      <Text style={styles.headerText}>Doer Profile</Text>

      {/* Basic Info Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{profile.name}</Text>

        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{profile.phone || "N/A"}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{profile.email}</Text>

        <Text style={styles.label}>Bio</Text>
        <Text style={styles.value}>{profile.bio || "No bio available"}</Text>

        <Text style={styles.label}>Skills</Text>
        <Text style={styles.value}>
          {profile.skills.length ? profile.skills.join(", ") : "No skills added"}
        </Text>
      </View>

      {/* Verification Card */}
      <View style={styles.card}>
        <Text style={styles.label}>KYC Level</Text>
        <Text style={styles.value}>{profile.kycLevel || "N/A"}</Text>

        <Text style={styles.label}>Verification Status</Text>
        <Text style={styles.value}>{profile.verificationStatus || "Pending"}</Text>

        <Text style={styles.label}>Verified</Text>
        <Text
          style={[
            styles.value,
            profile.isVerified ? styles.verified : styles.notVerified,
          ]}
        >
          {profile.isVerified ? "Yes" : "No"}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f2f6fc",
    paddingBottom: 30,
  },
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
  label: {
    fontWeight: "700",
    color: "#555",
    marginTop: 10,
    fontSize: 14,
  },
  value: {
    fontSize: 16,
    marginTop: 3,
    color: "#333",
  },
  verified: {
    color: "#4caf50",
    fontWeight: "700",
  },
  notVerified: {
    color: "#f44336",
    fontWeight: "700",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

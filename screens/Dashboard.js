import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchProfile } from "../api/doer";

export default function Dashboard({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        navigation.reset({ index: 0, routes: [{ name: "ProfileScreen" }] });
        return;
      }
      const res = await fetchProfile(token);
      setProfile(res.data?.data || null);
    } catch (err) {
      console.error(err.message);
      Alert.alert("Error", "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("authToken");
    navigation.reset({ index: 0, routes: [{ name: "ProfileScreen" }] });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  // Dummy job posts for Doer
  const dummyJobs = [
    {
      id: 1,
      work: "Document Delivery",
      cost: 200,
      distance: 3,
      fromLocation: "Nellore",
      toLocation: "Vijayawada",
      status: "Pending",
    },
    {
      id: 2,
      work: "Furniture Moving",
      cost: 500,
      distance: 5,
      fromLocation: "Hyderabad",
      toLocation: "Secunderabad",
      status: "Pending",
    },
    {
      id: 3,
      work: "Grocery Delivery",
      cost: 150,
      distance: 2,
      fromLocation: "Chennai",
      toLocation: "Tambaram",
      status: "Pending",
    },
    {
      id: 4,
      work: "Parcel Pickup",
      cost: 100,
      distance: 4,
      fromLocation: "Bangalore",
      toLocation: "Whitefield",
      status: "Pending",
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>Hi, {profile?.name || "User"}</Text>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate("ProfileScreen")}
        >
          <Text style={styles.profileBtnText}>PROFILE</Text>
        </TouchableOpacity>
      </View>

      {/* Bio Section */}
      <View style={styles.bioSection}>
        <Text style={styles.bioText}>{profile?.bio || "No bio available"}</Text>
      </View>

      {/* Customer Posts */}
      <Text style={styles.sectionTitle}>Available Delivery</Text>
      {dummyJobs.map((job) => (
        <View key={job.id} style={styles.jobCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle}>{job.work}</Text>
            <Text style={styles.jobInfo}>💰 Cost: ₹{job.cost}</Text>
            <Text style={styles.jobInfo}>📍 Distance: {job.distance} km</Text>
            <Text style={styles.jobInfo}>
              🏠 From: {job.fromLocation} → To: {job.toLocation}
            </Text>
            <Text style={styles.jobInfo}>📝 Status: {job.status}</Text>
          </View>
        </View>
      ))}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>LOGOUT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f7fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  name: { fontSize: 22, fontWeight: "700", color: "#333" },
  profileBtn: {
    backgroundColor: "#2196f3",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  profileBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  bioSection: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  bioText: { fontSize: 16, color: "#555" },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#333", marginBottom: 10 },
  jobCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  jobTitle: { fontSize: 16, fontWeight: "600", marginBottom: 5, color: "#333" },
  jobInfo: { fontSize: 14, color: "#555", marginBottom: 2 },
  logoutBtn: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  logoutBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

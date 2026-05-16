// // corret code............................................................................................................................
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchProfile } from "../api/doer";

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Not logged in");
        navigation.goBack();
        return;
      }
      const res = await fetchProfile(token);
      setProfile(res.data.data);
    } catch (err) {
      console.error("Profile Fetch Error:", err.response?.data || err.message);
      Alert.alert("Error", "Unable to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsWrapper}>
        <TouchableOpacity
          style={styles.optionBtn}
          onPress={() => Alert.alert("Bank Details", "Bank info screen")}
        >
          <Text style={styles.optionText}>🏦 Bank Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionBtn}
          onPress={() => Alert.alert("Address", "Address info screen")}
        >
          <Text style={styles.optionText}>📍 Address</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionBtn}
          onPress={() => Alert.alert("History", "Service history screen")}
        >
          <Text style={styles.optionText}>📜 History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 25,
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  name: { fontSize: 26, fontWeight: "700", color: "#222", marginBottom: 5 },
  email: { fontSize: 16, color: "#555" },
  optionsWrapper: { paddingHorizontal: 20 },
  optionBtn: {
    backgroundColor: "#2196f3",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  optionText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});


import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { fetchPosterProfile, logoutPoster } from "../api/poster";
import { Ionicons } from "@expo/vector-icons";

export default function PosterDashboard({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Post Job States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Delivery");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState(null);
  const [deadline, setDeadline] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Poster Dashboard",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => setSidebarVisible(true)}
          style={{ marginLeft: 12 }}
        >
          <Ionicons name="menu" size={26} color="#000" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => loadProfile());
    return unsub;
  }, [navigation]);

  useEffect(() => {
    getLocation();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await fetchPosterProfile();
      if (res.status === "SUCCESS" && res.data) setProfile(res.data);
      else setProfile(null);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: Number(loc.coords.latitude.toFixed(5)),
        longitude: Number(loc.coords.longitude.toFixed(5)),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logoutPoster();
    navigation.replace("RoleSelect");
  };

  const handlePostJob = async () => {
    // Validation
    if (title.length < 5 || title.length > 80) {
      return Alert.alert("Error", "Title must be 5-80 characters");
    }
    if (description.length < 10 || description.length > 300) {
      return Alert.alert("Error", "Description must be 10-300 characters");
    }
    const priceNum = Number(price);
    if (!priceNum || priceNum < 30 || priceNum > 5000) {
      return Alert.alert("Error", "Price must be between ₹30 and ₹5000");
    }
    if (!location) return Alert.alert("Error", "Location is required");

    try {
      // Simulate POST /jobs API
      Alert.alert("Success", "Job posted successfully");
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("Delivery");
      setPrice("");
      setDeadline("");
    } catch (err) {
      Alert.alert("Error", "Failed to post job");
    }
  };

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0b78ff" />
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#f7fbff" }}>
      {/* Sidebar */}
      <Modal
        visible={sidebarVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sidebar}>
            <TouchableOpacity
              onPress={() => setSidebarVisible(false)}
              style={{ marginBottom: 12 }}
            >
              <Ionicons name="close" size={26} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setSidebarVisible(false);
                navigation.navigate("PosterProfileView");
              }}
            >
              <Text style={styles.menuText}>👤 View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setSidebarVisible(false);
                navigation.navigate("PosterProfileEdit", { isEdit: true });
              }}
            >
              <Text style={styles.menuText}>✏️ Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setSidebarVisible(false);
                navigation.navigate("AddressList");
              }}
            >
              <Text style={styles.menuText}>📍 Manage Addresses</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setSidebarVisible(false);
                navigation.navigate("PosterKycUpload");
              }}
            >
              <Text style={styles.menuText}>🪪 Upload KYC</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>
          Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""} 👋
        </Text>

        {/* Post Job Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Post Job</Text>

          <TextInput
            placeholder="Title e.g., Collect medicine from pharmacy"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { height: 80 }]}
            multiline
          />
          <TextInput
            placeholder="Category (Delivery / Queueing / Help at home / Other)"
            value={category}
            onChangeText={setCategory}
            style={styles.input}
          />
          <TextInput
            placeholder="Price (₹)"
            value={price}
            onChangeText={setPrice}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder={`Location ${
              location ? `(Lat: ${location.latitude}, Lon: ${location.longitude})` : ""
            }`}
            editable={false}
            style={styles.input}
          />
          <TextInput
            placeholder="Deadline (optional)"
            value={deadline}
            onChangeText={setDeadline}
            style={styles.input}
          />

          <TouchableOpacity style={styles.btn} onPress={handlePostJob}>
            <Text style={styles.btnText}>POST JOB</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", flexDirection: "row" },
  sidebar: {
    backgroundColor: "#fff",
    width: "70%",
    padding: 20,
    paddingTop: 36,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  menuItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
  menuText: { fontSize: 16, color: "#333" },
  container: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 12, color: "#0b4da0" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0b4da0", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: "#f7f7f7",
  },
  btn: {
    backgroundColor: "#0b78ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  logoutBtn: { backgroundColor: "#e74c3c", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 10 },
});

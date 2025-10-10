import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { fetchPosterProfile, deleteAddress } from "../api/poster";
import { Ionicons } from "@expo/vector-icons";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PosterProfileView({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileDetails, setShowProfileDetails] = useState(true);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await fetchPosterProfile();
      if (res.status === "SUCCESS" && res.data) setProfile(res.data);
      else setProfile(null);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch profile.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAddress(id);
            loadProfile();
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to delete address");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const toggleProfileDetails = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowProfileDetails(!showProfileDetails);
  };

  const kycBadge = () => {
    if (profile.KycStatus === true)
      return <Text style={[styles.badge, { backgroundColor: "#4caf50" }]}>Verified</Text>;
    if (profile.KycStatus === false)
      return <Text style={[styles.badge, { backgroundColor: "#ff9800" }]}>Pending</Text>;
    if (profile.KycStatus === "KYC_REJECTED")
      return <Text style={[styles.badge, { backgroundColor: "#f44336" }]}>Rejected</Text>;
    return <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>-</Text>;
  };

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1877f2" />
      </View>
    );

  if (!profile)
    return (
      <View style={styles.loader}>
        <Text style={{ color: "#555" }}>No profile found.</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1877f2" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      {/* Collapsible Profile Details Header */}
      <TouchableOpacity style={styles.sectionHeader} onPress={toggleProfileDetails}>
        <Text style={styles.sectionHeaderText}>Profile Details</Text>
        <Ionicons
          name={showProfileDetails ? "chevron-up" : "chevron-down"}
          size={22}
          color="#1877f2"
        />
      </TouchableOpacity>

      {showProfileDetails && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Name</Text>
          <Text style={styles.cardText}>{profile.name || "-"}</Text>

          <Text style={styles.cardTitle}>Email</Text>
          <Text style={styles.cardText}>{profile.email || "-"}</Text>

          <Text style={styles.cardTitle}>Phone</Text>
          <Text style={styles.cardText}>{profile.phone || "-"}</Text>

          <Text style={styles.cardTitle}>KYC Status</Text>
          <View style={{ marginTop: 4 }}>{kycBadge()}</View>
        </View>
      )}

      {/* About */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        <Text style={styles.cardText}>{profile.about || "-"}</Text>
      </View>

      {/* Addresses */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Addresses</Text>

        {profile.addresses && profile.addresses.length > 0 ? (
          profile.addresses.map((addr) => (
            <View key={addr.id} style={styles.addressCard}>
              <Text style={styles.cardText}>Label: {addr.label}</Text>
              <Text style={styles.cardText}>Area: {addr.area}</Text>
              <Text style={styles.cardText}>Pin Code: {addr.pinCode}</Text>
              <Text style={styles.cardText}>
                Added On: {new Date(addr.createdAt).toLocaleDateString()}
              </Text>

              <View style={{ flexDirection: "row", marginTop: 6 }}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    navigation.navigate("PosterProfileEdit", { address: addr, isEdit: true })
                  }
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(addr.id)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ color: "#555", marginTop: 8 }}>No addresses added.</Text>
        )}

        <TouchableOpacity
          style={styles.addAddressBtn}
          onPress={() => navigation.navigate("PosterProfileEdit")}
        >
          <Text style={styles.addAddressText}>+ Add New Address</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f2f5" },
  container: { padding: 16, paddingBottom: 40, backgroundColor: "#f0f2f5" },
  topHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  headerText: { fontSize: 22, fontWeight: "700", color: "#1877f2", marginLeft: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e8f0fe",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  sectionHeaderText: { fontSize: 16, fontWeight: "700", color: "#1877f2" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#1877f2", marginBottom: 4 },
  cardText: { fontSize: 14, color: "#333", marginBottom: 8 },
  badge: {
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  addressCard: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#f0f2f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d3d6db",
  },
  editBtn: { backgroundColor: "#0b78ff", padding: 6, borderRadius: 6, marginRight: 8 },
  editText: { color: "#fff", fontWeight: "600" },
  deleteBtn: { backgroundColor: "#f44336", padding: 6, borderRadius: 6 },
  deleteText: { color: "#fff", fontWeight: "600" },
  addAddressBtn: {
    backgroundColor: "#00b894",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  addAddressText: { color: "#fff", fontWeight: "700" },
});

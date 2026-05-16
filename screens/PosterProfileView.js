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
  Image,
} from "react-native";
import {
  fetchPosterProfile,
  fetchUserProfile,
  deleteAddress,
} from "../api/poster";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

// Enable layout animation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PosterProfileView({ navigation, route }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const isFocused = useIsFocused();

  const emailFromLogin = route?.params?.email || null;

  // Load combined profile
  const loadProfile = async () => {
    try {
      setLoading(true);

      // Fetch Poster profile
      const posterRes = await fetchPosterProfile();
      // Fetch User profile
      const userRes = await fetchUserProfile();

      const poster = posterRes?.data || {};
      const user = userRes?.data || {};

      setProfile({
        name: poster.name || "",
        email: poster.email || emailFromLogin,
        phone: poster.phone || "",
        about: poster.about || "",
        addresses: poster.addresses || [],
        kycStatus: poster.KycStatus ?? false,
        isPhoneVerified: poster.isPhoneVerified ?? false,

        // From user/profile API
        gender: user.gender || "-",
        dob: user.dob || "-",
        photoUrl: user.photoUrl || "",
        languagePref: user.languagePref || "-",
      });
    } catch (err) {
      console.error("Profile error:", err);
      Alert.alert("Error", "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) loadProfile();
  }, [isFocused]);

  const handleDelete = async (id) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteAddress(id);
          await loadProfile();
        },
      },
    ]);
  };

  const display = (v) => (v ? v : "-");

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1877f2" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loader}>
        <Text>No profile found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#1877f2" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      {/* Profile Section */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => {
          LayoutAnimation.easeInEaseOut();
          setShowDetails(!showDetails);
        }}
      >
        <Text style={styles.sectionHeaderText}>Profile Details</Text>
        <Ionicons
          name={showDetails ? "chevron-up" : "chevron-down"}
          size={22}
          color="#1877f2"
        />
      </TouchableOpacity>

      {showDetails && (
        <View style={styles.card}>
          {profile.photoUrl ? (
            <Image
              source={{ uri: profile.photoUrl }}
              style={styles.profileImage}
            />
          ) : null}

          <Text style={styles.title}>Name</Text>
          <Text style={styles.value}>{display(profile.name)}</Text>

          <Text style={styles.title}>Email</Text>
          <Text style={styles.value}>{display(profile.email)}</Text>

          <Text style={styles.title}>Phone</Text>
          <Text style={styles.value}>{display(profile.phone)}</Text>

          <Text style={styles.title}>Gender</Text>
          <Text style={styles.value}>{display(profile.gender)}</Text>

          <Text style={styles.title}>Date of Birth</Text>
          <Text style={styles.value}>
            {profile.dob ? new Date(profile.dob).toLocaleDateString() : "-"}
          </Text>

          <Text style={styles.title}>Language</Text>
          <Text style={styles.value}>{display(profile.languagePref)}</Text>

          <Text style={styles.title}>Phone Verification</Text>
          <Text
            style={[
              styles.badge,
              {
                backgroundColor: profile.isPhoneVerified
                  ? "#4CAF50"
                  : "#FF9800",
              },
            ]}
          >
            {profile.isPhoneVerified ? "Completed" : "Pending"}
          </Text>

          <Text style={styles.title}>KYC Status</Text>
          <Text
            style={[
              styles.badge,
              { backgroundColor: profile.kycStatus ? "#4CAF50" : "#FF9800" },
            ]}
          >
            {profile.kycStatus ? "Verified" : "Pending"}
          </Text>

          <Text style={styles.title}>About</Text>
          <Text style={styles.value}>{display(profile.about)}</Text>
        </View>
      )}

      {/* Address Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Addresses</Text>

        {profile.addresses?.length > 0 ? (
          profile.addresses.map((a) => (
            <View key={a.id} style={styles.addressCard}>
              <Text style={styles.value}>Label: {a.label}</Text>
              <Text style={styles.value}>Area: {a.area}</Text>
              <Text style={styles.value}>Pincode: {a.pinCode}</Text>

              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    navigation.navigate("EditAddress", {
                      address: a,
                      isEdit: true,
                    })
                  }
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(a.id)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No addresses added.</Text>
        )}

        <TouchableOpacity
          style={styles.addAddressBtn}
          onPress={() => navigation.navigate("EditAddress")}
        >
          <Text style={styles.addAddressText}>+ Add New Address</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 16 },
  topHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 10,
    color: "#1877f2",
  },
  sectionHeader: {
    backgroundColor: "#e8f0fe",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionHeaderText: { fontSize: 16, fontWeight: "700", color: "#1877f2" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  title: { fontSize: 13, color: "#1877f2", fontWeight: "700" },
  value: { color: "#333", marginBottom: 8 },
  badge: {
    color: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: "center",
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: "#f5f6fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  editBtn: {
    backgroundColor: "#2d98da",
    padding: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  editText: { color: "#fff" },
  deleteBtn: { backgroundColor: "#eb3b5a", padding: 6, borderRadius: 6 },
  deleteText: { color: "#fff" },
  addAddressBtn: {
    backgroundColor: "#20bf6b",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  addAddressText: { color: "#fff", fontWeight: "700" },
  emptyText: { color: "#777", marginTop: 10 },
});

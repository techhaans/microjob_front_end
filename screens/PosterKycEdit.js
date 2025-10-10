import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { updatePosterKyc } from "../api/poster"; // <-- you'll create this API

export default function PosterKycEdit({ navigation, route }) {
  const { profile } = route.params || {};

  const [address, setAddress] = useState(profile?.address || "");
  const [kycId, setKycId] = useState(profile?.kycId || "");
  const [kycType, setKycType] = useState(profile?.kycType || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!address.trim() || !kycId.trim() || !kycType.trim()) {
      Alert.alert("Missing Info", "Please fill all KYC fields.");
      return;
    }

    try {
      setLoading(true);
      const data = { address, kycId, kycType };
      const res = await updatePosterKyc(data);
      if (res.status === "SUCCESS") {
        Alert.alert("Success", "Profile updated with KYC!");
        navigation.goBack();
      } else {
        Alert.alert("Error", res.message || "Failed to update KYC.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not update KYC. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Address"
        multiline
        value={address}
        onChangeText={setAddress}
      />

      <TextInput
        style={styles.input}
        placeholder="KYC Type (e.g., Aadhar, PAN)"
        value={kycType}
        onChangeText={setKycType}
      />

      <TextInput
        style={styles.input}
        placeholder="KYC ID Number"
        value={kycId}
        onChangeText={setKycId}
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "Saving..." : "Save Details"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fc",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007bff",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f1f3f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

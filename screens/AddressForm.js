import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { addAddress, updateAddress } from "../api/poster";

export default function AddressForm({ route, navigation }) {
  const { mode, address } = route.params || {};

  const [label, setLabel] = useState(address?.label || "");
  const [pinCode, setPinCode] = useState(address?.pinCode || "");
  const [areaText, setAreaText] = useState(address?.areaText || "");
  const [lat, setLat] = useState(address?.lat?.toString() || "");
  const [lon, setLon] = useState(address?.lon?.toString() || "");
  const [loading, setLoading] = useState(false);

  // Fetch current GPS location
  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLat(location.coords.latitude.toString());
      setLon(location.coords.longitude.toString());
      Alert.alert("Location Set", "Latitude and Longitude updated from GPS");
    } catch (err) {
      console.error("❌ Location error:", err);
      Alert.alert("Error", "Failed to get current location");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!label || !pinCode || !areaText || !lat || !lon) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const payload = {
      label,
      pinCode,
      areaText,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
    };

    try {
      if (mode === "add") {
        await addAddress(payload);
        Alert.alert("Success", "Address added successfully");
      } else if (mode === "edit") {
        await updateAddress(address.id, payload);
        Alert.alert("Success", "Address updated successfully");
      }
      navigation.goBack();
    } catch (err) {
      console.error("❌ AddressForm error:", err);
      Alert.alert("Error", "Failed to save address");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{mode === "add" ? "Add New Address" : "Edit Address"}</Text>

      <TouchableOpacity style={styles.locationBtn} onPress={handleUseCurrentLocation}>
        <Text style={styles.locationText}>📍 Use Current Location (GPS)</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#6EB5FF" />}

      <TextInput
        style={styles.input}
        placeholder="Label"
        placeholderTextColor="#fff"
        value={label}
        onChangeText={setLabel}
      />
      <TextInput
        style={styles.input}
        placeholder="PIN Code"
        placeholderTextColor="#fff"
        keyboardType="numeric"
        value={pinCode}
        onChangeText={setPinCode}
      />
      <TextInput
        style={styles.input}
        placeholder="Area Text"
        placeholderTextColor="#fff"
        value={areaText}
        onChangeText={setAreaText}
      />
      <TextInput
        style={styles.input}
        placeholder="Latitude"
        placeholderTextColor="#fff"
        keyboardType="numeric"
        value={lat}
        onChangeText={setLat}
      />
      <TextInput
        style={styles.input}
        placeholder="Longitude"
        placeholderTextColor="#fff"
        keyboardType="numeric"
        value={lon}
        onChangeText={setLon}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{mode === "add" ? "Add Address" : "Update Address"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#121212" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20, color: "#6EB5FF", textAlign: "center" },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#6EB5FF",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#6EB5FF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 8,
  },
  buttonText: { color: "#000", fontWeight: "700", fontSize: 16 },
  cancelBtn: { padding: 12, borderRadius: 10, alignItems: "center", marginTop: 10 },
  cancelText: { color: "#fff", fontWeight: "700" },
  locationBtn: {
    backgroundColor: "#28A745",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

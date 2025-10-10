// screens/EditAddress.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { savePosterAddress } from "../api/poster";

export default function EditAddress({ route, navigation }) {
  const address = route.params?.address || {};
  const isEdit = !!address.id;
  const [label, setLabel] = useState(address.label || "");
  const [pinCode, setPinCode] = useState(address.pinCode || "");
  const [areaText, setAreaText] = useState(address.area || address.areaText || "");
  const [lat, setLat] = useState(address.lat || "");
  const [lon, setLon] = useState(address.lon || "");
  const [loading, setLoading] = useState(false);

  const useCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return Alert.alert("Permission denied");
      const loc = await Location.getCurrentPositionAsync({});
      setLat(loc.coords.latitude);
      setLon(loc.coords.longitude);
      const addr = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (addr?.length) {
        setAreaText(`${addr[0].name || ""}, ${addr[0].city || addr[0].region || ""}`.trim());
        setPinCode(addr[0].postalCode || "");
      }
    } catch (err) {
      console.error(err); Alert.alert("Error", "Failed to get location");
    }
  };

  const handleSave = async () => {
    if (!label || !pinCode || !areaText) return Alert.alert("Validation", "Fill all fields");
    setLoading(true);
    try {
      const payload = { id: address.id, label, pinCode, areaText, lat: parseFloat(lat) || 0, lon: parseFloat(lon) || 0 };
      const res = await savePosterAddress(payload);
      if (res.status === "SUCCESS") {
        Alert.alert("Success", isEdit ? "Address updated" : "Address added");
        navigation.goBack();
      } else {
        Alert.alert("Error", res.message || "Failed to save");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save address");
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isEdit ? "Edit Address" : "Add Address"}</Text>
      <TextInput style={styles.input} placeholder="Label (Home / Office)" value={label} onChangeText={setLabel} />
      <TextInput style={styles.input} placeholder="Pin code" keyboardType="numeric" value={pinCode} onChangeText={setPinCode} />
      <TextInput style={[styles.input, { height: 90 }]} placeholder="Area / Street / Landmark" multiline value={areaText} onChangeText={setAreaText} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Lat" value={String(lat)} onChangeText={setLat} keyboardType="numeric" />
        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Lon" value={String(lon)} onChangeText={setLon} keyboardType="numeric" />
      </View>

      <TouchableOpacity style={styles.locBtn} onPress={useCurrentLocation}>
        <Text style={styles.locText}>📍 Use Current Location</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>{isEdit ? "Update Address" : "Save Address"}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f2f6fb" },
  title: { fontSize: 20, fontWeight: "700", color: "#0b4da0", marginBottom: 12 },
  input: { backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e6eefb", marginBottom: 10 },
  locBtn: { marginVertical: 8, alignItems: "center" },
  locText: { color: "#0b78ff", fontWeight: "700" },
  saveBtn: { backgroundColor: "#0b78ff", padding: 14, borderRadius: 12, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "700" },
});

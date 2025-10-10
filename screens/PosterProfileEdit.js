import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons"; // ✅ Added import
import {
  updatePosterProfile,
  fetchPosterProfile,
  addAddress,
  updateAddress,
} from "../api/poster";

export default function PosterProfileEdit({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  // Profile states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [about, setAbout] = useState("");
  const [imageUri, setImageUri] = useState(null);

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [label, setLabel] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [areaText, setAreaText] = useState("");
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);

  const [isExistingUser, setIsExistingUser] = useState(false);

  // Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchPosterProfile();
        if (res.status === "SUCCESS" && res.data) {
          const profile = res.data;
          setName(profile.name || "");
          setEmail(profile.email || "");
          setAbout(profile.about || "");
          setImageUri(profile.imageUrl || null);
          setAddresses(profile.addresses || []);
          setIsExistingUser(true);
        } else {
          setIsExistingUser(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Pick profile image
  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert("Permission", "Please allow photo access.");
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  // Use current location
  const useLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted")
        return Alert.alert("Permission denied", "Location permission needed.");
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setLat(loc.coords.latitude);
      setLon(loc.coords.longitude);
      Alert.alert(
        "Location fetched",
        `Lat: ${loc.coords.latitude}, Lon: ${loc.coords.longitude}`
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch location.");
    } finally {
      setLocating(false);
    }
  };

  // Save profile
  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim())
      return Alert.alert("Validation", "Name and Email are required.");
    const payload = {
      Name: name.trim(),
      email: email.trim(),
      about: about.trim(),
      imageUrl: imageUri,
    };
    try {
      setSaving(true);
      const res = await updatePosterProfile(payload);
      if (res.status === "SUCCESS") {
        Alert.alert(
          "Success",
          isExistingUser ? "Profile updated." : "Profile created."
        );
        setIsExistingUser(true);
      } else {
        Alert.alert("Error", res.message || "Failed to save profile.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  // Add or update address
  const handleSaveAddress = async () => {
    if (!label.trim() || !pinCode.trim() || !areaText.trim())
      return Alert.alert("Validation", "Address fields are required.");
    const payload = { label, pinCode, areaText, lat, lon };
    try {
      setSaving(true);
      if (addresses.length > 0) {
        const addrId = addresses[0].id;
        await updateAddress(addrId, payload);
        Alert.alert("Success", "Address updated.");
      } else {
        const res = await addAddress(payload);
        setAddresses([...addresses, res.data]);
        Alert.alert("Success", "Address added.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0b78ff" />
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ✅ Back Arrow at Top */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={26} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>
        {isExistingUser ? "Edit Profile" : "Create Profile"}
      </Text>

      {/* Profile Image */}
      <View style={styles.imageRow}>
        <Image
          source={{
            uri:
              imageUri ||
              "https://cdn-icons-png.flaticon.com/512/847/847969.png",
          }}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
          <Text style={styles.imageBtnText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Fields */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter name"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
        keyboardType="email-address"
      />

      <Text style={styles.label}>About</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={about}
        onChangeText={setAbout}
        placeholder="Short bio"
        multiline
      />

      {/* Address Fields */}
      <Text style={[styles.label, { marginTop: 12 }]}>Address Label</Text>
      <TextInput
        style={styles.input}
        value={label}
        onChangeText={setLabel}
        placeholder="Home / Office"
      />

      <Text style={styles.label}>Pin Code</Text>
      <TextInput
        style={styles.input}
        value={pinCode}
        onChangeText={setPinCode}
        placeholder="Enter pin code"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Area / Street</Text>
      <TextInput
        style={styles.input}
        value={areaText}
        onChangeText={setAreaText}
        placeholder="Area or Street"
      />

      {/* Location */}
      <TouchableOpacity
        style={styles.locationBtn}
        onPress={useLocation}
        disabled={locating}
      >
        {locating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.locationBtnText}>Use Current Location</Text>
        )}
      </TouchableOpacity>

      {/* Save Buttons */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSaveProfile}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>
            {isExistingUser ? "Update Profile" : "Create Profile"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: "#00b894", marginTop: 8 }]}
        onPress={handleSaveAddress}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>
            {addresses.length > 0 ? "Update Address" : "Add Address"}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f2f6fb", paddingBottom: 50 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f6fb",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0b4da0",
    marginBottom: 12,
    textAlign: "center",
    marginTop: 40,
  },
  imageRow: { alignItems: "center", marginBottom: 12 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#0b78ff",
  },
  imageBtn: {
    marginTop: 8,
    backgroundColor: "#0b78ff",
    padding: 8,
    borderRadius: 8,
  },
  imageBtnText: { color: "#fff", fontWeight: "600" },
  label: { color: "#4b5563", marginTop: 8, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e6eefb",
  },
  locationBtn: {
    backgroundColor: "#00b894",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },
  locationBtnText: { color: "#fff", fontWeight: "700" },
  saveBtn: {
    backgroundColor: "#0b78ff",
    padding: 14,
    borderRadius: 10,
    marginTop: 14,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },
});

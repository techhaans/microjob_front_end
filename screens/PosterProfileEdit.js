import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  fetchPosterProfile,
  updatePosterProfile,
  sendPosterPhoneOtp,
  verifyPosterPhoneOtp,
} from "../api/poster";

// ====================== CONFIG ======================
const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.1.40:8080/api"
    : "http://192.168.1.40:8080/api";
const STATIC_URL =
  Platform.OS === "android"
    ? "http://192.168.1.40:8082"
    : "http://192.168.1.40:8082"; // backend static files
const AUTH_KEY = "authToken";

// Convert server path (C:/..., relative filename) to public URL
// const normalizePhotoUrl = (url) => {
//   if (!url) return "";
//   const s = String(url).trim();
//   if (!s) return "";
//   if (/^https?:\/\//i.test(s)) return s; // already absolute
//   const parts = s.split(/[\\/]/);
//   const filename = parts[parts.length - 1];
//   return `${STATIC_URL}/uploads/kyc/${filename}`;
// };
const normalizePhotoUrl = (url) => {
  if (!url) return "";
  let s = String(url).trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) {
    // Replace localhost with LAN IP for emulator/device
    return s.replace("localhost", "192.168.1.40");
  }
  return s;
};

// ====================== COMPONENT ======================
export default function PosterProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "+91",
    about: "",
    isPhoneVerified: false,
    gender: "",
    dob: "",
    languagePref: "",
    photoUrl: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSessionId, setOtpSessionId] = useState(null);

  const [localImageUri, setLocalImageUri] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ====================== LOAD PROFILE ======================
  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetchPosterProfile();
      const data = res?.data || res || {};

      let userData = {};
      try {
        const token = await AsyncStorage.getItem(AUTH_KEY);
        const r = await fetch(`${BASE_URL}/user/profile`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        const j = await r.json();
        userData = j?.data ?? j ?? {};
      } catch (e) {
        console.warn("user profile fetch failed:", e);
      }

      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone
          ? data.phone.startsWith("+91")
            ? data.phone
            : `+91${data.phone}`
          : "+91",
        about: data.about || "",
        isPhoneVerified: data.isPhoneVerified || false,
        gender: userData.gender ?? data.gender ?? "",
        dob: userData.dob ?? data.dob ?? "",
        languagePref: userData.languagePref ?? data.languagePref ?? "",
        photoUrl: normalizePhotoUrl(
          userData.photoUrl ?? data.photoUrl ?? data.pic ?? "",
        ),
      });
    } catch (err) {
      console.log("❌ Fetch Error:", err);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ====================== IMAGE PICKER ======================
  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permission required",
          "Allow gallery access to pick a photo.",
        );
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      const canceled = res?.canceled ?? res?.cancelled ?? false;
      if (!canceled) {
        const uri = res.assets ? res.assets[0].uri : res.uri;
        setLocalImageUri(uri);
      }
    } catch (err) {
      console.warn("pickImage error:", err);
      Alert.alert("Error", "Unable to pick image.");
    }
  };

  const uploadImageToServer = async () => {
    if (!localImageUri) return null;
    try {
      const token = await AsyncStorage.getItem(AUTH_KEY);
      const formData = new FormData();
      const filename = localImageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image/jpeg";
      const uriToSend =
        Platform.OS === "android" && !localImageUri.startsWith("file://")
          ? `file://${localImageUri}`
          : localImageUri;

      formData.append("file", {
        uri: uriToSend,
        name: filename,
        type,
      });

      const res = await fetch(`${BASE_URL}/user/profile/photo/upload`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        console.warn("uploadImageToServer failed:", json);
        Alert.alert("Upload failed", json?.message || "Photo upload failed");
        return null;
      }

      const raw = json?.data;
      const newUrl =
        raw && typeof raw === "string"
          ? raw
          : (raw?.photoUrl ?? raw?.url ?? raw?.image ?? "");
      const normalized = normalizePhotoUrl(newUrl);
      if (normalized) {
        setProfile((p) => ({ ...p, photoUrl: normalized }));
        setLocalImageUri(null);
        return normalized;
      } else {
        Alert.alert(
          "Uploaded",
          "Photo uploaded, but server didn't return URL.",
        );
        return null;
      }
    } catch (err) {
      console.warn("uploadImageToServer error:", err);
      Alert.alert("Error", "Failed to upload image.");
      return null;
    }
  };

  // ====================== SAVE PROFILE ======================
  const handleSave = async () => {
    if (!profile.name.trim()) return Alert.alert("Error", "Name is required");
    if (!profile.phone || profile.phone.length < 10)
      return Alert.alert("Error", "Valid phone number is required");

    setSaving(true);
    try {
      let uploadedPhoto = profile.photoUrl;
      if (localImageUri) {
        const url = await uploadImageToServer();
        if (url) uploadedPhoto = url;
      }

      // PATCH user profile
      try {
        const token = await AsyncStorage.getItem(AUTH_KEY);
        const body = {
          gender: profile.gender || undefined,
          dob: profile.dob || undefined,
          photoUrl: uploadedPhoto || undefined,
          languagePref: profile.languagePref || undefined,
        };
        await fetch(`${BASE_URL}/user/profile/update`, {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify(body),
        });
      } catch (e) {
        console.warn("PATCH user profile failed (non-fatal):", e);
      }

      // Poster-specific fields
      const payload = {
        Name: profile.name.trim(),
        phone: profile.phone.trim(),
        about: profile.about?.trim() || "",
      };
      await updatePosterProfile(payload);

      Alert.alert("Success", "Profile updated successfully");
    } catch (err) {
      console.log("❌ Update Error:", err);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
      loadProfile();
    }
  };

  // ====================== OTP ======================
  const handleSendOtp = async () => {
    if (!profile.phone || profile.phone.length < 10)
      return Alert.alert("Error", "Enter valid phone number");
    setSendingOtp(true);
    try {
      const res = await sendPosterPhoneOtp(profile.phone);
      setOtpSessionId(res.data.sessionId);
      Alert.alert("OTP Sent", res.data.message || "OTP sent");
    } catch (err) {
      console.log("OTP error:", err);
      Alert.alert("Error", "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpSessionId || !otp) return Alert.alert("Enter OTP");
    setVerifyingOtp(true);
    try {
      const res = await verifyPosterPhoneOtp(otpSessionId, otp);
      if (res.status === "SUCCESS" || res?.data?.status === "SUCCESS") {
        Alert.alert("Success", "Phone Verified");
        setProfile((prev) => ({ ...prev, isPhoneVerified: true }));
      } else {
        Alert.alert("Error", "Verification failed");
      }
    } catch (err) {
      Alert.alert("Error", "Verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ====================== DOB ======================
  const onDOBChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event?.type === "dismissed") return;
    const d = selectedDate || new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setProfile((p) => ({ ...p, dob: `${yyyy}-${mm}-${dd}` }));
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  // ====================== UI ======================
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Poster Profile</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* PHOTO */}
        <View style={{ alignItems: "center", marginBottom: 12 }}>
          {localImageUri || profile.photoUrl ? (
            <Image
              source={{ uri: localImageUri || profile.photoUrl }}
              style={styles.photo}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={{ color: "#666" }}>Add Photo</Text>
            </View>
          )}

          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <TouchableOpacity
              style={[styles.smallBtn, { marginRight: 8 }]}
              onPress={pickImage}
            >
              <Text style={styles.smallBtnText}>Pick Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: "#1976D2" }]}
              onPress={async () => {
                if (!localImageUri) return Alert.alert("No photo selected");
                setSaving(true);
                try {
                  await uploadImageToServer();
                  Alert.alert("Uploaded", "Photo uploaded");
                } catch (e) {
                  console.warn(e);
                  Alert.alert("Upload failed");
                } finally {
                  setSaving(false);
                }
              }}
            >
              <Text style={[styles.smallBtnText, { color: "#fff" }]}>
                Upload
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FORM FIELDS */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: "#eee" }]}
          value={profile.email}
          editable={false}
        />

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={profile.name}
          onChangeText={(text) => setProfile({ ...profile, name: text })}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={profile.phone}
          onChangeText={(text) => {
            const clean = text.replace(/^\+91/, "");
            setProfile({ ...profile, phone: `+91${clean}` });
          }}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>About You</Text>
        <TextInput
          style={[styles.input, { height: 90 }]}
          value={profile.about}
          multiline
          onChangeText={(t) => setProfile({ ...profile, about: t })}
        />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.row}>
          {["MALE", "FEMALE", "OTHER"].map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.option,
                profile.gender === g && styles.optionActive,
              ]}
              onPress={() => setProfile((p) => ({ ...p, gender: g }))}
            >
              <Text
                style={
                  profile.gender === g
                    ? styles.optionTextActive
                    : styles.optionText
                }
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>DOB</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={profile.dob}
            placeholder="YYYY-MM-DD"
            onChangeText={(text) => setProfile((p) => ({ ...p, dob: text }))}
          />
          <TouchableOpacity
            style={[styles.smallBtn, { marginLeft: 8 }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.smallBtnText}>Pick</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={profile.dob ? new Date(profile.dob) : new Date(1990, 0, 1)}
            mode="date"
            display="default"
            onChange={onDOBChange}
            maximumDate={new Date()}
          />
        )}

        <Text style={styles.label}>Language</Text>
        <TextInput
          style={styles.input}
          value={profile.languagePref}
          onChangeText={(t) => setProfile((p) => ({ ...p, languagePref: t }))}
          placeholder="e.g. ENG"
        />

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#ff6b6b" }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Saving..." : "Save Profile"}
          </Text>
        </TouchableOpacity>

        {/* OTP */}
        {!profile.isPhoneVerified ? (
          <View style={{ marginTop: 25 }}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#007bff" }]}
              onPress={handleSendOtp}
              disabled={sendingOtp}
            >
              <Text style={styles.buttonText}>
                {sendingOtp ? "Sending OTP..." : "Send OTP"}
              </Text>
            </TouchableOpacity>

            {otpSessionId && (
              <>
                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter OTP"
                />

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#28a745" }]}
                  onPress={handleVerifyOtp}
                  disabled={verifyingOtp}
                >
                  <Text style={styles.buttonText}>
                    {verifyingOtp ? "Verifying..." : "Verify OTP"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <Text style={styles.verifiedText}>✅ Phone Verified</Text>
        )}
      </ScrollView>
    </View>
  );
}

// ====================== STYLES ======================
const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: { marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  container: { padding: 20 },
  label: { fontWeight: "600", marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 18,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  verifiedText: {
    color: "green",
    textAlign: "center",
    marginTop: 15,
    fontSize: 16,
    fontWeight: "bold",
  },
  row: { flexDirection: "row", marginTop: 8 },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#777",
    marginRight: 8,
    borderRadius: 20,
  },
  optionActive: { backgroundColor: "#000", borderColor: "#000" },
  optionText: { color: "#555" },
  optionTextActive: { color: "#fff" },
  photo: { width: 120, height: 120, borderRadius: 60 },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#eee",
  },
  smallBtnText: { color: "#333" },
});

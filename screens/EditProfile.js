import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchDoerProfile,
  fetchDoerCategories,
  updateDoerProfile,
  updateUserProfileAPI,
  sendPhoneOtp,
  verifyPhoneOtp,
} from "../api/doer";

const BASE_URL = "http://192.168.1.40:8080/api";

export default function EditProfile({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [languagePref, setLanguagePref] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);

  const [localImageUri, setLocalImageUri] = useState(null);

  const [otpSent, setOtpSent] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const catsRes = await fetchDoerCategories();
      const catArray = Array.isArray(catsRes?.data)
        ? catsRes.data
        : Array.isArray(catsRes)
        ? catsRes
        : [];
      setCategories(catArray);

      // Fetch profile
      const profileRes = await fetchDoerProfile();
      const p = profileRes?.data ?? profileRes ?? {};

      setName(p?.name ?? "");
      setEmail(p?.email ?? "");
      setBio(p?.bio ?? "");
      setPhone(String(p?.phone ?? ""));
      setOriginalPhone(String(p?.phone ?? ""));
      setGender(p?.gender ?? "");
      setDob(p?.dob ?? "");
      setLanguagePref(p?.languagePref ?? p?.language ?? "");
      setPhotoUrl(p?.photoUrl ?? p?.pic ?? "");

      const incomingSkills = Array.isArray(p?.skills) ? p.skills : [];
      const codeByName = new Map();
      for (const c of catArray) {
        const code = String(c.code ?? c.id ?? "");
        if (!code) continue;
        if (c.skillName) codeByName.set(String(c.skillName).toLowerCase(), code);
        if (c.name) codeByName.set(String(c.name).toLowerCase(), code);
        if (c.displayName) codeByName.set(String(c.displayName).toLowerCase(), code);
      }

      const normalized = incomingSkills
        .map((s) => {
          if (typeof s === "object") {
            const maybe = String(s.code ?? s.id ?? s.value ?? "").trim();
            if (maybe) return maybe;
            const name = String(s.skillName ?? s.name ?? s.displayName ?? "")
              .trim()
              .toLowerCase();
            return codeByName.get(name) ?? null;
          }
          const str = String(s).trim();
          if (!str) return null;
          if (catArray.some((c) => String(c.code) === str)) return str;
          return codeByName.get(str.toLowerCase()) ?? null;
        })
        .filter(Boolean);

      setSkills(normalized);
    } catch (err) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission denied", "Enable gallery permission.");
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
      Alert.alert("Error", "Could not pick image");
    }
  };

  const uploadProfilePhoto = async () => {
    if (!localImageUri) return photoUrl;

    try {
      const token = await AsyncStorage.getItem("authToken");
      const formData = new FormData();
      const filename = localImageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("file", {
        uri: localImageUri,
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
      if (res.ok) {
        const newUrl = json?.data?.photoUrl || json?.data?.url || photoUrl;
        setPhotoUrl(newUrl);
        setLocalImageUri(null);
        return newUrl;
      } else {
        Alert.alert("Upload error", json?.message || "Photo upload failed");
        return photoUrl;
      }
    } catch (err) {
      Alert.alert("Error", "Failed to upload photo");
      return photoUrl;
    }
  };

  const toggleSkill = (code) => {
    setSkills((prev) => {
      const s = String(code);
      if (prev.includes(s)) return prev.filter((x) => x !== s);
      return [...prev, s];
    });
  };

  const sendOtpToPhone = async () => {
    if (!phone.trim()) return Alert.alert("Validation", "Enter phone number");

    try {
      const res = await sendPhoneOtp(phone);
      const sid = res?.data?.sessionId ?? res?.sessionId ?? res?.session_id ?? "";
      setSessionId(String(sid));
      setOtpSent(true);
      Alert.alert("OTP Sent", "Please check your phone.");
    } catch (err) {
      Alert.alert("Error", "Failed to send OTP");
    }
  };

  const verifyOtpNow = async () => {
    if (!otp.trim()) return Alert.alert("Validation", "Enter OTP");

    try {
      const res = await verifyPhoneOtp(sessionId, otp);
      const ok =
        res?.status === "SUCCESS" ||
        res?.data?.status === "SUCCESS" ||
        res?.verified === true ||
        res?.data?.verified === true;

      if (ok) {
        Alert.alert("Success", "Phone verified");
        setOtpSent(false);
        setSessionId("");
      } else {
        Alert.alert("Invalid OTP", res?.message || "Try again");
      }
    } catch (err) {
      Alert.alert("Error", "OTP verification failed");
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      return Alert.alert("Validation", "Name and phone required");
    }

    try {
      setSaving(true);

      let uploadedPhotoUrl = photoUrl;
      if (localImageUri) {
        uploadedPhotoUrl = await uploadProfilePhoto();
      }

      // Update user profile
      await updateUserProfileAPI({
        gender,
        dob,
        photoUrl: uploadedPhotoUrl,
        languagePref,
      });

      // Update doer profile
      await updateDoerProfile({
        name,
        phone,
        bio,
        email,
        skills: skills.map(String),
      });

      Alert.alert("Success", "Profile updated");
      setOriginalPhone(phone);

      // Show OTP field after save (manual send)
      setOtpSent(true);
    } catch (err) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.photoWrap}>
        {localImageUri || photoUrl ? (
          <Image
            source={{ uri: localImageUri || photoUrl }}
            style={styles.photo}
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.row}>
        {["MALE", "FEMALE", "OTHER"].map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.option, gender === g && styles.optionActive]}
            onPress={() => setGender(g)}
          >
            <Text
              style={gender === g ? styles.optionTextActive : styles.optionText}
            >
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="DOB (YYYY-MM-DD)"
        value={dob}
        onChangeText={setDob}
      />
      <TextInput
        style={styles.input}
        placeholder="Language (e.g. ENG)"
        value={languagePref}
        onChangeText={setLanguagePref}
      />

      {/* Categories / Skills */}
      <Text style={styles.label}>Skills / Categories</Text>
      <View style={styles.skillsWrap}>
        {categories.map((cat) => {
          const code = String(cat.code ?? cat.id ?? "");
          const selected = skills.includes(code);
          return (
            <TouchableOpacity
              key={code}
              onPress={() => toggleSkill(code)}
              style={[styles.skillBox, selected && styles.skillBoxSelected]}
            >
              <Text style={{ color: selected ? "#fff" : "#333" }}>
                {cat.skillName || cat.name || cat.displayName || code}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Save button */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Save Profile</Text>
        )}
      </TouchableOpacity>

      {/* OTP Section */}
      {otpSent && (
        <View style={{ marginTop: 20 }}>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.verifyBtn} onPress={verifyOtpNow}>
            <Text style={styles.verifyText}>Verify OTP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sendOtpBtn} onPress={sendOtpToPhone}>
            <Text style={styles.sendOtpText}>Send OTP</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  photoWrap: { alignSelf: "center", marginBottom: 20 },
  photo: { width: 120, height: 120, borderRadius: 60 },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  label: { fontWeight: "700", marginTop: 10 },
  row: { flexDirection: "row", marginVertical: 8 },
  option: {
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#888",
  },
  optionActive: { backgroundColor: "#000" },
  optionText: { color: "#333" },
  optionTextActive: { color: "#fff" },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  skillBox: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 8,
    margin: 5,
  },
  skillBoxSelected: { backgroundColor: "#000" },
  saveBtn: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  saveText: { color: "white", fontWeight: "700" },
  verifyBtn: {
    backgroundColor: "#228B22",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  verifyText: { color: "white", fontWeight: "700" },
  sendOtpBtn: {
    backgroundColor: "#FF8C00",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  sendOtpText: { color: "white", fontWeight: "700" },
});

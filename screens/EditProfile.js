
import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  UIManager,
  LayoutAnimation,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchDoerProfile,
  updateDoerProfile,
  sendPhoneOtp,
  verifyPhoneOtp,
} from "../api/doer";

// Enable smooth animations for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EditProfile({ navigation, route }) {
  const { isNewUser = false } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  // State flags
  const [profileSaved, setProfileSaved] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [kycVisible, setKycVisible] = useState(false);
  const [kycUploaded, setKycUploaded] = useState(false); // permanent KYC flag

  // Header with Back Arrow and Logout
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: isNewUser ? "Complete Profile" : "Edit Profile",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Dashboard")}
          style={{ marginLeft: 15 }}
        >
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={logoutUser} style={{ marginRight: 15 }}>
          <Ionicons name="log-out-outline" size={24} color="red" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Load Profile Data
  const loadProfile = async () => {
    try {
      const res = await fetchDoerProfile();
      if (res?.status === "SUCCESS" && res.data) {
        const p = res.data;

        setName(p.name || "");
        setEmail(p.email || "");
        setBio(p.bio || "");
        setPhone(p.phone || "");
        setSkills(p.skills || []);

        // ✅ Use phone verified from users table
        setPhoneVerified(!!p.isPhoneVerified);
        // KYC uploaded if kyc_level > 0
        const kycDone = p.kycLevel > 0;
        setKycUploaded(kycDone);
        setKycVisible(phoneVerified || kycDone);

        setProfileSaved(true);
        console.log("Profile loaded:", p);
      }
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      Alert.alert("Error", "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Logout user
  const logoutUser = async () => {
    await AsyncStorage.multiRemove([
      "authToken",
      "userRole",
      "doerProfile",
      "userEmail",
    ]);
    navigation.replace("LoginPage");
  };

  // Save or Update Profile
  const submitProfile = async () => {
    if (!name.trim()) return Alert.alert("Validation", "Name is required");
    if (!phone.trim())
      return Alert.alert("Validation", "Phone number is required");

    try {
      setSaving(true);
      const payload = { name, email, bio, phone, skills };
      const res = await updateDoerProfile(payload);

      if (res.status === "SUCCESS") {
        await loadProfile(); // reload updated info
        Alert.alert("✅ Profile Updated", "Your changes have been saved.");
        setProfileSaved(true);
      } else {
        Alert.alert("Error", res.message || "Failed to save profile");
      }
    } catch (err) {
      console.error("Update Error:", err);
      Alert.alert("Error", "Something went wrong while saving profile");
    } finally {
      setSaving(false);
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!profileSaved)
      return Alert.alert(
        "Save Profile First",
        "Please save your profile before verifying phone."
      );
    if (phoneVerified) return Alert.alert("Info", "Phone already verified");

    try {
      const res = await sendPhoneOtp();
      if (res?.status === "SUCCESS") {
        setSessionId(res?.data?.sessionId || "");
        setOtpSent(true);
        Alert.alert("OTP Sent", "Check your phone for OTP.");
      } else {
        Alert.alert("Error", res?.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP Error:", err);
      Alert.alert("Error", "Failed to send OTP");
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim()) return Alert.alert("Enter OTP");
    if (!sessionId) return Alert.alert("No session ID found, resend OTP");

    try {
      const res = await verifyPhoneOtp(sessionId, otp);
      if (res?.status === "SUCCESS") {
        Alert.alert("✅ Phone Verified", "Your phone number is verified.");
        setPhoneVerified(true);
        setOtpSent(false);
        setKycVisible(true);
      } else {
        Alert.alert("Error", res?.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("OTP Verify Error:", err);
      Alert.alert("Error", "Verification failed");
    }
  };

  // Manage Skills
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSkills(skills.filter((s) => s !== skill));
  };

  // Loading state
  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );

  // UI Render
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Full Name */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      {/* Bio */}
      <TextInput
        style={[styles.input, { height: 90 }]}
        placeholder="Bio"
        multiline
        value={bio}
        onChangeText={setBio}
      />

      {/* Phone Number */}
      <View>
        <TextInput
          style={[
            styles.input,
            phoneVerified && { backgroundColor: "#f2f2f2", color: "#666" },
          ]}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          editable={!phoneVerified}
        />
        {phoneVerified && <Text style={styles.verifiedText}>✅ Phone Verified</Text>}
      </View>

      {/* Skills */}
      <Text style={{ fontWeight: "700", marginTop: 10 }}>Skills:</Text>
      {skills.map((skill, i) => (
        <View key={i} style={styles.skillItem}>
          <Text>{skill}</Text>
          <TouchableOpacity onPress={() => removeSkill(skill)}>
            <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Add Skill */}
      <View style={{ flexDirection: "row", marginBottom: 15 }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Add Skill"
          value={skillInput}
          onChangeText={setSkillInput}
        />
        <TouchableOpacity
          style={[styles.btn, { paddingHorizontal: 12 }]}
          onPress={addSkill}
        >
          <Text style={styles.btnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Save Profile */}
      <TouchableOpacity
        style={styles.btn}
        onPress={submitProfile}
        disabled={saving}
      >
        <Text style={styles.btnText}>
          {saving ? "Saving..." : "Save Profile"}
        </Text>
      </TouchableOpacity>

      {/* OTP Section */}
      {!phoneVerified && profileSaved && !otpSent && (
        <TouchableOpacity
          style={[styles.btnSmall, { backgroundColor: "#2196f3" }]}
          onPress={handleSendOtp}
        >
          <Text style={styles.btnSmallText}>Send OTP to Verify Phone</Text>
        </TouchableOpacity>
      )}

      {otpSent && !phoneVerified && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity style={styles.btnSmall} onPress={handleVerifyOtp}>
            <Text style={styles.btnSmallText}>Verify OTP</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* KYC Section */}
      {kycVisible && (
        <TouchableOpacity
          style={[
            styles.btn,
            { backgroundColor: kycUploaded ? "#4CAF50" : "#FF9800", marginTop: 15 },
          ]}
          onPress={() => navigation.navigate("KYCPage")}
        >
          <Text style={styles.btnText}>
            {kycUploaded ? "KYC Uploaded" : "Upload KYC Documents"}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  btn: {
    backgroundColor: "#1976D2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  btnSmall: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  btnSmallText: { color: "#fff", fontWeight: "700" },
  skillItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    marginBottom: 5,
  },
  verifiedText: {
    color: "green",
    fontWeight: "bold",
    marginLeft: 5,
    marginBottom: 10,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

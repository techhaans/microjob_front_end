
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchDoerProfile, updateDoerProfile } from "../api/doer";

export default function EditProfile({ navigation, route }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState([]);
  const [kycUrl, setKycUrl] = useState(null);

  // Temporary skill input
  const [skillInput, setSkillInput] = useState("");

  // Load existing profile
  const loadProfile = async () => {
    try {
      const res = await fetchDoerProfile();
      if (res?.status === "SUCCESS") {
        const data = res.data?.data || {};
        setName(data.name || "");
        setEmail(data.email || "");
        setBio(data.bio || "");
        setPhone(data.phone || "");
        setSkills(data.skills || []);
        setKycUrl(data.kycUrl || null);
      }
    } catch (err) {
      console.error("Fetch Profile Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Save profile
  const submitProfile = async () => {
    if (!name || !email || !phone) {
      return Alert.alert(
        "Validation Error",
        "Name, Email, and Phone are required"
      );
    }

    try {
      setSaving(true);
      const payload = { name, email, bio, phone, skills, kycUrl };
      const res = await updateDoerProfile(payload);

      if (res.status === "SUCCESS") {
        Alert.alert("Success", "Profile updated successfully");

        // Save to AsyncStorage
        await AsyncStorage.setItem("doerProfile", JSON.stringify(payload));

        // Go back to Dashboard (Dashboard will auto-fetch)
        navigation.goBack();
      } else {
        Alert.alert("Error", res.message || "Update failed");
      }
    } catch (err) {
      console.error("Update Error:", err);
      Alert.alert("Error", err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // Add skill
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  // Remove skill
  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Bio"
        multiline
        value={bio}
        onChangeText={setBio}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Skills */}
      <Text style={{ fontWeight: "700", marginBottom: 5 }}>Skills:</Text>
      {skills.map((skill, index) => (
        <View key={index} style={styles.skillItem}>
          <Text>{skill}</Text>
          <TouchableOpacity onPress={() => removeSkill(skill)}>
            <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
          </TouchableOpacity>
        </View>
      ))}
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

      {/* KYC */}
      <View style={{ marginVertical: 10 }}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#FF9800" }]}
          onPress={() => navigation.navigate("KYCPage", { setKycUrl })}
        >
          <Text style={styles.btnText}>Upload KYC</Text>
        </TouchableOpacity>
        {kycUrl && (
          <Text style={{ marginTop: 5, color: "green" }}>
            Uploaded: {kycUrl}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={submitProfile}
        disabled={saving}
      >
        <Text style={styles.btnText}>
          {saving ? "Saving..." : "Save Profile"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 15 },
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
    marginBottom: 10,
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  skillItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    marginBottom: 5,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});


import React, { useState, useEffect, useLayoutEffect } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchDoerProfile, updateDoerProfile } from "../api/doer";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EditProfile({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState([]);
  const [kycUrl, setKycUrl] = useState(null);
  const [skillInput, setSkillInput] = useState("");

  // Back button and Logout in header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.replace("Dashboard")}
          style={{ marginLeft: 15 }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={logoutUser} style={{ marginRight: 15 }}>
          <Ionicons name="log-out-outline" size={24} color="red" />
        </TouchableOpacity>
      ),
      title: "Edit Profile",
    });
  }, [navigation, skills, name, email, bio, phone, kycUrl]);

  // Fetch profile
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

  // Logout function
  const logoutUser = async () => {
    await AsyncStorage.multiRemove([
      "authToken",
      "userRole",
      "tempToken",
      "doerProfile",
    ]);
    navigation.replace("LoginPage");
  };

  // Submit profile update
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
        await AsyncStorage.setItem("doerProfile", JSON.stringify(payload));
        navigation.replace("Dashboard");
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

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
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


import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons"; // ✅ Import for back arrow icon
import { sendDoerOtp, verifyDoerOtp, fetchDoerProfile } from "../api/doer";

export default function LoginPage({ navigation }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  const requestOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      return Alert.alert("Invalid", "Enter a valid 10-digit phone number");
    }

    try {
      setLoading(true);
      const res = await sendDoerOtp(phone);

      if (res?.data?.sessionId) {
        setSessionId(res.data.sessionId);
        Alert.alert("OTP Sent", "Check your phone for OTP");
      } else {
        Alert.alert("Error", res?.message || "Failed to send OTP");
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and fetch profile
  const verify = async () => {
    if (!sessionId) return Alert.alert("Error", "Request OTP first");

    try {
      setLoading(true);
      const res = await verifyDoerOtp(sessionId, otp);

      if (res?.status === "SUCCESS" && res?.data?.token) {
        await AsyncStorage.setItem("authToken", res.data.token);
        let profileData = await fetchDoerProfile(res.data.token);
        if (!profileData) profileData = { phone, isNew: true };
        await AsyncStorage.setItem("doerProfile", JSON.stringify(profileData));

        navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
      } else {
        Alert.alert("OTP Failed", res?.message || "Invalid OTP");
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ✅ Top Back Arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Doer Login</Text>

      <TextInput
        placeholder="Phone (10 digits)"
        keyboardType="phone-pad"
        style={styles.input}
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
      />

      <TouchableOpacity style={styles.btn} onPress={requestOtp} disabled={loading}>
        <Text style={styles.btnText}>{loading ? "Sending..." : "Send OTP"}</Text>
      </TouchableOpacity>

      {sessionId && (
        <>
          <TextInput
            placeholder="OTP"
            keyboardType="number-pad"
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity style={styles.btn} onPress={verify} disabled={loading}>
            <Text style={styles.btnText}>{loading ? "Verifying..." : "Verify OTP"}</Text>
          </TouchableOpacity>
        </>
      )}

      {loading && <ActivityIndicator size="large" color="#1976D2" style={{ marginTop: 20 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f8f9fa" },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
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
  },
  btnText: { color: "#fff", fontWeight: "600" },
});

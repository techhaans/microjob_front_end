import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; // 👈 for glow gradient
import { sendPosterOtp, verifyPosterOtp } from "../api/poster";

export default function PosterLogin({ navigation }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [errorMessage, setErrorMessage] = useState("");

  const isValidPhone = (num) => /^[6-9]\d{9}$/.test(num);

  const handleSendOtp = async () => {
    if (!phone) return setErrorMessage("Enter phone number");
    if (!isValidPhone(phone)) return setErrorMessage("Enter valid number");

    try {
      setLoading(true);
      setErrorMessage("");
      const res = await sendPosterOtp(phone);

      if (res.status === "SUCCESS") {
        setSessionId(res.data.sessionId);
        setOtpSent(true);
        setAttemptsLeft(3);
      } else {
        setErrorMessage(res.message || "Failed to send OTP");
      }
    } catch (err) {
      setErrorMessage(err.message || "Network Error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return setErrorMessage("Enter OTP");
    if (attemptsLeft <= 0)
      return setErrorMessage("Too many wrong attempts. Resend OTP.");

    try {
      setLoading(true);
      setErrorMessage("");
      const res = await verifyPosterOtp(sessionId, otp);

      if (res.status === "SUCCESS") {
        navigation.replace("PosterDashboard");
      } else {
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);
        setErrorMessage(
          res.details?.otp === "OTP does not match"
            ? `OTP does not match. ${remaining} attempt(s) remaining.`
            : res.message || "OTP Verification Failed"
        );
      }
    } catch (err) {
      setErrorMessage(err.message || "Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#AFCBFF" />
      </TouchableOpacity>

      {/* Glowing Logo */}
      <View style={styles.logoContainer}>
        <LinearGradient
          colors={["#0B1F4A", "#0B1F4A"]}
          style={styles.logoWrapper}
        >
          <View style={styles.logoGlow}>
            <Image
              source={require("../images/mjlogo.jpg")} // 👈 your logo path
              style={styles.logoRound}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
        <Text style={styles.appName}>Micro Job</Text>
      </View>

      <Text style={styles.title}>Login</Text>

      {!otpSent ? (
        <>
          <TextInput
            style={[styles.input, errorMessage ? styles.inputError : null]}
            placeholder="Enter your phone"
            placeholderTextColor="#AFCBFF"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity style={styles.btn} onPress={handleSendOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={[styles.input, errorMessage ? styles.inputError : null]}
            placeholder="Enter OTP"
            placeholderTextColor="#AFCBFF"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
            editable={attemptsLeft > 0}
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <Text style={styles.attemptsText}>Attempts left: {attemptsLeft}</Text>

          <TouchableOpacity
            style={[styles.btn, attemptsLeft <= 0 && { backgroundColor: "#555" }]}
            onPress={handleVerifyOtp}
            disabled={loading || attemptsLeft <= 0}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify OTP</Text>}
          </TouchableOpacity>

          {attemptsLeft <= 0 && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#1877F2", marginTop: 10 }]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              <Text style={styles.btnText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <TouchableOpacity onPress={() => navigation.navigate("AdminLogin")}>
        <Text style={styles.adminLink}>Admin Login</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>Powered by : TechHaans PVT LTD</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1F4A",
    padding: 20,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  logoWrapper: {
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 65,
    backgroundColor: "#0B1F4A",
    shadowColor: "#00C6FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 25,
  },
  logoGlow: {
    width: 110,
    height: 110,
    backgroundColor: "#132A60",
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00C6FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 20,
  },
  logoRound: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  appName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#AFCBFF",
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#132A60",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#1E90FF",
    marginBottom: 15,
  },
  inputError: {
    borderColor: "#FF4C4C",
  },
  btn: {
    backgroundColor: "#1877F2",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#00C6FF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  errorText: {
    color: "#FF4C4C",
    marginBottom: 10,
    textAlign: "center",
  },
  attemptsText: {
    color: "#FF4C4C",
    textAlign: "center",
    marginBottom: 10,
  },
  adminLink: {
    color: "#AFCBFF",
    textAlign: "center",
    textDecorationLine: "underline",
    marginTop: 10,
    fontSize: 14,
  },
  footerText: {
    color: "#AFCBFF",
    textAlign: "center",
    marginTop: 30,
    fontSize: 12,
  },
});

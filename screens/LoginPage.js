// // // import React, { useState } from "react";
// // // import {
// // //   View,
// // //   Text,
// // //   TextInput,
// // //   TouchableOpacity,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // //   ScrollView,
// // // } from "react-native";
// // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // import { sendOtp, verifyOtp } from "../api/auth";
// // // import RoleSelect from "./RoleSelect";

// // // export default function LoginPage({ navigation }) {
// // //   const [email, setEmail] = useState("");
// // //   const [otp, setOtp] = useState("");
// // //   const [otpSent, setOtpSent] = useState(false);
// // //   const [showRoleSelect, setShowRoleSelect] = useState(false);
// // //   const [loading, setLoading] = useState(false);

// // //   const handleSendOtp = async () => {
// // //     if (!email) return Alert.alert("Error", "Please enter your email");
// // //     setLoading(true);

// // //     try {
// // //       const res = await sendOtp(email);
// // //       console.log("Send OTP response:", res);

// // //       if (res.status === "SUCCESS") {
// // //         setOtpSent(true);
// // //         Alert.alert("Success", "OTP sent to your email");
// // //       } else {
// // //         Alert.alert("Error", res.message);
// // //       }
// // //     } catch (err) {
// // //       console.error("Send OTP Error:", err);
// // //       Alert.alert("Error", "Network error. Try again.");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const handleVerifyOtp = async () => {
// // //     if (!otp) return Alert.alert("Error", "Please enter the OTP");
// // //     setLoading(true);

// // //     try {
// // //       const res = await verifyOtp(otp);
// // //       console.log("Verify OTP response:", res);

// // //       const tempToken = res?.data?.accessToken;

// // //       if (res.status === "SUCCESS" && tempToken) {
// // //         await AsyncStorage.setItem("tempToken", tempToken);
// // //         setShowRoleSelect(true);
// // //       } else {
// // //         Alert.alert("Error", res.message || "OTP verification failed");
// // //       }
// // //     } catch (err) {
// // //       console.error("Verify OTP Error:", err);
// // //       Alert.alert("Error", "Network error. Try again.");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   if (showRoleSelect) return <RoleSelect navigation={navigation} />;

// // //   return (
// // //     <ScrollView contentContainerStyle={styles.container}>
// // //       <Text style={styles.title}>Micro Job Login</Text>

// // //       <TextInput
// // //         style={styles.input}
// // //         placeholder={otpSent ? "Enter OTP" : "Enter Email"}
// // //         placeholderTextColor="#aaa"
// // //         value={otpSent ? otp : email}
// // //         onChangeText={otpSent ? setOtp : setEmail}
// // //         keyboardType={otpSent ? "numeric" : "email-address"}
// // //       />

// // //       {!otpSent ? (
// // //         <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
// // //           <Text style={styles.buttonText}>Send OTP</Text>
// // //         </TouchableOpacity>
// // //       ) : (
// // //         <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
// // //           <Text style={styles.buttonText}>Verify OTP</Text>
// // //         </TouchableOpacity>
// // //       )}

// // //       {otpSent && (
// // //         <TouchableOpacity
// // //           style={styles.backButton}
// // //           onPress={() => {
// // //             setOtpSent(false);
// // //             setOtp("");
// // //           }}
// // //         >
// // //           <Text style={styles.backButtonText}>← Back to Email</Text>
// // //         </TouchableOpacity>
// // //       )}

// // //       {/* ✅ Admin Login Navigation */}
// // //       <TouchableOpacity
// // //         style={styles.adminButton}
// // //         onPress={() => navigation.navigate("AdminLogin")}
// // //       >
// // //         <Text style={styles.adminButtonText}>Admin Login</Text>
// // //       </TouchableOpacity>

// // //       {loading && <ActivityIndicator size="large" color="#1E90FF" />}
// // //     </ScrollView>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flexGrow: 1,
// // //     justifyContent: "center",
// // //     alignItems: "center",
// // //     padding: 20,
// // //     backgroundColor: "#071A52",
// // //   },
// // //   title: { fontSize: 24, color: "#fff", fontWeight: "bold", marginBottom: 20 },
// // //   input: {
// // //     width: "90%",
// // //     borderWidth: 1,
// // //     borderColor: "#1E90FF",
// // //     borderRadius: 10,
// // //     padding: 12,
// // //     color: "#fff",
// // //     marginBottom: 10,
// // //   },
// // //   button: {
// // //     width: "90%",
// // //     backgroundColor: "#1E90FF",
// // //     padding: 14,
// // //     borderRadius: 10,
// // //     alignItems: "center",
// // //     marginVertical: 10,
// // //   },
// // //   buttonText: { color: "#fff", fontWeight: "600" },
// // //   backButton: { marginTop: 10 },
// // //   backButtonText: { color: "#28A745", fontSize: 16 },
// // //   adminButton: {
// // //     marginTop: 20,
// // //     padding: 12,
// // //     backgroundColor: "#FF4500",
// // //     borderRadius: 10,
// // //   },
// // //   adminButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
// // // });

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendOtp, verifyOtp } from "../api/auth";
import RoleSelect from "./RoleSelect";

export default function LoginPage({ navigation }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");

  const MAX_ATTEMPTS = 3;

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // ---------------------- SEND OTP ----------------------
  const handleSendOtp = async () => {
    setEmailError("");
    if (!email.trim()) {
      return setEmailError("Please enter your email");
    }
    if (!isValidEmail(email)) {
      return setEmailError("Enter a valid email address");
    }
    if (attempts >= MAX_ATTEMPTS) {
      setEmailError("You have exceeded 3 attempts. Try again later.");
      setEmail("");
      setOtpSent(false);
      setAttempts(0);
      return;
    }

    setLoading(true);

    try {
      const res = await sendOtp(email);
      if (res.status === "SUCCESS") {
        setOtpSent(true);
        setAttempts(0);
      } else {
        setAttempts((prev) => prev + 1);
        setEmailError(
          `${res.message || "Failed to send OTP"} (Attempt ${attempts + 1}/3)`
        );
      }
    } catch (error) {
      console.log("Send OTP Error:", error?.response?.data || error.message);
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        "Network error. Try again.";
      setEmailError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------- VERIFY OTP ----------------------
  const handleVerifyOtp = async () => {
    setOtpError("");
    if (!otp.trim()) return setOtpError("Please enter the OTP");

    if (attempts >= MAX_ATTEMPTS) {
      setOtpError("You have exceeded 3 attempts. Try again later.");
      setOtp("");
      setOtpSent(false);
      setAttempts(0);
      return;
    }

    setLoading(true);

    try {
      const res = await verifyOtp(otp);
      const tempToken = res?.data?.accessToken;

      if (res.status === "SUCCESS" && tempToken) {
        await AsyncStorage.setItem("tempToken", tempToken);
        setShowRoleSelect(true);
      } else {
        setAttempts((prev) => prev + 1);
        setOtpError(
          `${res.message || "OTP verification failed"} (Attempt ${
            attempts + 1
          }/3)`
        );
      }
    } catch (error) {
      console.log("Verify OTP Error:", error?.response?.data || error.message);

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        "OTP verification failed";

      setOtpError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------- MAIN UI ----------------------
  if (showRoleSelect) return <RoleSelect navigation={navigation} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Micro Job Login</Text>

      {/* ---------- Email / OTP Input ---------- */}
      <TextInput
        style={styles.input}
        placeholder={otpSent ? "Enter OTP" : "Enter Email"}
        placeholderTextColor="#aaa"
        value={otpSent ? otp : email}
        onChangeText={(text) => {
          otpSent ? setOtp(text) : setEmail(text);
          otpSent ? setOtpError("") : setEmailError("");
        }}
        keyboardType={otpSent ? "numeric" : "email-address"}
      />

      {/* ---------- Error Messages ---------- */}
      {!otpSent && emailError ? (
        <Text style={styles.errorText}>{emailError}</Text>
      ) : null}
      {otpSent && otpError ? (
        <Text style={styles.errorText}>{otpError}</Text>
      ) : null}

      {/* ---------- Buttons ---------- */}
      {!otpSent ? (
        <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
          <Text style={styles.buttonText}>Send OTP</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
          <Text style={styles.buttonText}>Verify OTP</Text>
        </TouchableOpacity>
      )}

      {otpSent && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setOtpSent(false);
            setOtp("");
            setEmailError("");
            setOtpError("");
            setAttempts(0);
          }}
        >
          <Text style={styles.backButtonText}>← Back to Email</Text>
        </TouchableOpacity>
      )}

      {/* ---------- Admin Login Navigation ---------- */}
      <TouchableOpacity
        style={styles.adminButton}
        onPress={() => navigation.navigate("AdminLogin")}
      >
        <Text style={styles.adminButtonText}>Admin Login</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#1E90FF" />}
    </ScrollView>
  );
}

// ---------------------- STYLES ----------------------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#071A52",
  },
  title: { fontSize: 24, color: "#fff", fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#1E90FF",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    marginBottom: 5,
  },
  errorText: { color: "#FF4136", marginBottom: 10, fontSize: 14 },
  button: {
    width: "90%",
    backgroundColor: "#1E90FF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  backButton: { marginTop: 10 },
  backButtonText: { color: "#28A745", fontSize: 16 },
  adminButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#FF4500",
    borderRadius: 10,
  },
  adminButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

// import React, { useState } from "react";
// import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
// import { sendPosterOtp, verifyPosterOtp } from "../api/poster";

// export default function PosterLogin({ navigation }) {
//   const [phone, setPhone] = useState("");
//   const [otp, setOtp] = useState("");
//   const [sessionId, setSessionId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);

//   const handleSendOtp = async () => {
//     if (!phone) return Alert.alert("Error", "Enter phone number");

//     try {
//       setLoading(true);
//       const res = await sendPosterOtp(phone);
//       if (res.status === "SUCCESS") {
//         setSessionId(res.data.sessionId);
//         setOtpSent(true);
//         Alert.alert("OTP Sent", res.data.message || "OTP has been sent");
//       } else {
//         Alert.alert("Error", res.message || "Failed to send OTP");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", err.message || "Network Error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOtp = async () => {
//     if (!otp) return Alert.alert("Error", "Enter OTP");

//     try {
//       setLoading(true);
//       const res = await verifyPosterOtp(sessionId, otp);
//       if (res.status === "SUCCESS") {
//         Alert.alert("Login Success", res.message || "OTP Verified", [
//           { text: "OK", onPress: () => navigation.replace("PosterDashboard") }
//         ]);
//       } else {
//         Alert.alert("Error", res.message || "OTP Verification Failed");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", err.message || "Network Error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Poster Login</Text>

//       {!otpSent ? (
//         <>
//           <TextInput
//             style={styles.input}
//             placeholder="Phone (+91XXXXXXXXXX)"
//             keyboardType="phone-pad"
//             value={phone}
//             onChangeText={setPhone}
//           />
//           <TouchableOpacity style={styles.btn} onPress={handleSendOtp} disabled={loading}>
//             {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP</Text>}
//           </TouchableOpacity>
//         </>
//       ) : (
//         <>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter OTP"
//             keyboardType="numeric"
//             value={otp}
//             onChangeText={setOtp}
//           />
//           <TouchableOpacity style={styles.btn} onPress={handleVerifyOtp} disabled={loading}>
//             {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify OTP</Text>}
//           </TouchableOpacity>
//         </>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, justifyContent: "center" },
//   title: { fontSize: 22, fontWeight: "700", marginBottom: 20, textAlign: "center" },
//   input: { backgroundColor: "#fff", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#ddd", marginBottom: 15 },
//   btn: { backgroundColor: "#2196f3", padding: 15, borderRadius: 8, alignItems: "center" },
//   btnText: { color: "#fff", fontWeight: "700" },
// });
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { sendPosterOtp, verifyPosterOtp } from "../api/poster";

export default function PosterLogin({ navigation }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3); 
  const [errorMessage, setErrorMessage] = useState(""); 

  // ✅ Validate phone number
  const isValidPhone = (num) => {
    const regex = /^[6-9]\d{9}$/; // Indian 10-digit number starting with 6-9
    return regex.test(num);
  };

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
    if (attemptsLeft <= 0) return setErrorMessage("Too many wrong attempts. Resend OTP.");

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
      <Text style={styles.title}>Poster Login</Text>

      {!otpSent ? (
        <>
          <TextInput
            style={[styles.input, errorMessage ? styles.inputError : null]}
            placeholder="Phone (10 digits)"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <TouchableOpacity
            style={styles.btn}
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={[styles.input, errorMessage ? styles.inputError : null]}
            placeholder="Enter OTP"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
            editable={attemptsLeft > 0}
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <Text style={{ marginBottom: 10, color: "red" }}>
            Attempts left: {attemptsLeft}
          </Text>
          <TouchableOpacity
            style={[styles.btn, attemptsLeft <= 0 && { backgroundColor: "#ccc" }]}
            onPress={handleVerifyOtp}
            disabled={loading || attemptsLeft <= 0}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          {attemptsLeft <= 0 && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#2196f3", marginTop: 10 }]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              <Text style={styles.btnText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
  },
  inputError: {
    borderColor: "red",
  },
  btn: {
    backgroundColor: "#2196f3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  errorText: { color: "red", marginBottom: 10, textAlign: "center" },
});


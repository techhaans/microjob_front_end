// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Import functions from API
// import { requestOtp, verifyOtp } from "../api/doer";

// export default function LoginPage({ navigation }) {
//   const [phone, setPhone] = useState("");
//   const [otp, setOtp] = useState("");
//   const [status, setStatus] = useState("");
//   const [sessionId, setSessionId] = useState("");

//   // Request OTP
//   const handleRequestOtp = async () => {
//     if (!/^\d{10}$/.test(phone)) {
//       Alert.alert("Invalid", "Enter a valid 10-digit phone number!");
//       return;
//     }

//     try {
//       setStatus("Sending OTP...");
//       const res = await requestOtp(phone);

//       // If phone is not registered, navigate to registration
//       if (res.data.status === "NOT_REGISTERED") {
//         Alert.alert(
//           "Phone Not Registered",
//           "Doer not found. Redirecting to registration...",
//           [{ text: "OK", onPress: () => navigation.navigate("RegisterPage", { phone }) }]
//         );
//         setStatus("");
//         return;
//       }

//       setSessionId(res.data.data?.sessionId);
//       setStatus("✅ OTP sent successfully!");
//     } catch (err) {
//       console.error("OTP Request Error:", err.response?.data || err.message);
//       setStatus("❌ Failed to send OTP");
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (!otp.trim()) {
//       Alert.alert("Invalid", "Enter the OTP received!");
//       return;
//     }
//     if (!sessionId) {
//       Alert.alert("Error", "No sessionId found. Please request OTP first.");
//       return;
//     }

//     try {
//       setStatus("Verifying OTP...");
//       const res = await verifyOtp(phone, otp, sessionId);

//       if (res.data.status === "SUCCESS") {
//         const token = res.data.data.token;
//         await AsyncStorage.setItem("authToken", token);

//         setStatus("✅ OTP Verified! Login successful");

//         // Navigate to Dashboard
//         navigation.navigate("Dashboard", { token });
//       } else {
//         setStatus("❌ OTP Verification failed");
//       }
//     } catch (err) {
//       console.error("OTP Verify Error:", err.response?.data || err.message);
//       setStatus("❌ OTP Verification failed");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Login with OTP</Text>

//       <View style={styles.phoneContainer}>
//         <Text style={styles.prefix}>+91</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter Phone Number"
//           keyboardType="phone-pad"
//           maxLength={10}
//           value={phone}
//           onChangeText={setPhone}
//         />
//       </View>

//       <TouchableOpacity style={styles.button} onPress={handleRequestOtp}>
//         <Text style={styles.buttonText}>Request OTP</Text>
//       </TouchableOpacity>

//       <TextInput
//         style={styles.otpInput}
//         placeholder="Enter OTP"
//         keyboardType="number-pad"
//         maxLength={6}
//         value={otp}
//         onChangeText={setOtp}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
//         <Text style={styles.buttonText}>Verify OTP</Text>
//       </TouchableOpacity>

//       {/* Redirect to Registration */}
//       <TouchableOpacity
//         style={styles.registerBtn}
//         onPress={() => navigation.navigate("RegisterPage", { phone })}
//       >
//         <Text style={styles.registerText}>Not Registered? Register Here</Text>
//       </TouchableOpacity>

//       {status !== "" && (
//         <Text
//           style={[
//             styles.status,
//             { color: status.includes("✅") ? "green" : "red" },
//           ]}
//         >
//           {status}
//         </Text>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     justifyContent: "center",
//     backgroundColor: "#E3F2FD",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 25,
//     color: "#1565C0",
//   },
//   phoneContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#90CAF9",
//     marginBottom: 15,
//     paddingHorizontal: 10,
//   },
//   prefix: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#1565C0",
//     marginRight: 6,
//   },
//   input: { flex: 1, padding: 12, fontSize: 16 },
//   otpInput: {
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: "#90CAF9",
//     borderRadius: 10,
//     padding: 12,
//     fontSize: 16,
//     marginTop: 15,
//     marginBottom: 10,
//   },
//   button: {
//     backgroundColor: "#1565C0",
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
//   status: {
//     marginTop: 20,
//     fontSize: 18,
//     textAlign: "center",
//     fontWeight: "bold",
//   },
//   registerBtn: {
//     marginTop: 15,
//     alignItems: "center",
//   },
//   registerText: {
//     color: "#1565C0",
//     fontSize: 16,
//     fontWeight: "bold",
//     textDecorationLine: "underline",
//   },
// });

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestOtp, verifyOtp } from "../api/doer";

export default function LoginPage({ navigation }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState(""); // Inline status message
  const [sessionId, setSessionId] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3); // Max 3 attempts
  const MAX_ATTEMPTS = 3;

  // Request OTP
  const handleRequestOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      setStatus(" Enter a valid 10-digit phone number!");
      return;
    }

    try {
      setStatus("Sending OTP...");
      const res = await requestOtp(phone);

      if (res.data.status === "NOT_REGISTERED") {
        setStatus(" Phone not registered. Redirecting to registration...");
        setTimeout(() => {
          navigation.navigate("RegisterPage", { phone });
        }, 1000);
        return;
      }

      setSessionId(res.data.data?.sessionId);
      setStatus("✅ OTP sent successfully!");
      setAttemptsLeft(MAX_ATTEMPTS);
      setOtp("");
    } catch (err) {
      const backendMessage =
        err.response?.data?.details?.otp ||
        err.response?.data?.error ||
        err.message;
      setStatus(` Failed to send OTP: ${backendMessage}`);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setStatus(" Enter the OTP received!");
      return;
    }
    if (!sessionId) {
      setStatus(" Please request OTP first.");
      return;
    }

    if (attemptsLeft <= 0) {
      setStatus(" Maximum attempts reached. Request a new OTP.");
      return;
    }

    try {
      setStatus("Verifying OTP...");
      const res = await verifyOtp(phone, otp, sessionId);

      if (res.data.status === "SUCCESS") {
        const token = res.data.data.token;
        await AsyncStorage.setItem("authToken", token);
        setStatus("✅ OTP Verified! Login successful");
        setAttemptsLeft(MAX_ATTEMPTS);
        navigation.navigate("Dashboard", { token });
      } else {
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);
        setStatus(
          ` OTP Verification failed. Attempts left: ${
            remaining > 0 ? remaining : 0
          }`
        );
      }
    } catch (err) {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      const backendMessage =
        err.response?.data?.details?.otp ||
        err.response?.data?.error ||
        err.message;
      setStatus(
        ` ${backendMessage}. Attempts left: ${remaining > 0 ? remaining : 0}`
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Login with OTP</Text>

        <View style={styles.phoneContainer}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Phone Number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRequestOtp}>
          <Text style={styles.buttonText}>Request OTP</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.otpInput}
          placeholder="Enter OTP"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />

        {attemptsLeft > 0 ? (
          <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "gray" }]}
            onPress={handleRequestOtp}
          >
            <Text style={styles.buttonText}>Request New OTP</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => navigation.navigate("RegisterPage", { phone })}
        >
          <Text style={styles.registerText}>Not Registered? Register Here</Text>
        </TouchableOpacity>

        {/* Status message */}
        {status !== "" && (
          <Text
            style={[
              styles.status,
              { color: status.includes("✅") ? "green" : "red" },
            ]}
          >
            {status}
          </Text>
        )}

        {/* Attempts display */}
        {attemptsLeft > 0 && status.includes("❌") && (
          <Text style={styles.attempts}>Attempts left: {attemptsLeft}</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#E3F2FD",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    color: "#1565C0",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#90CAF9",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  prefix: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1565C0",
    marginRight: 6,
  },
  input: { flex: 1, padding: 12, fontSize: 16 },
  otpInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#90CAF9",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginTop: 15,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#1565C0",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  status: {
    marginTop: 20,
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  attempts: {
    marginTop: 5,
    fontSize: 16,
    textAlign: "center",
    color: "orange",
    fontWeight: "600",
  },
  registerBtn: {
    marginTop: 15,
    alignItems: "center",
  },
  registerText: {
    color: "#1565C0",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

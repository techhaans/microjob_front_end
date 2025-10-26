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

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { sendOtp, verifyOtp } from "../api/auth";
// import RoleSelect from "./RoleSelect";

// export default function LoginPage({ navigation }) {
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [otpSent, setOtpSent] = useState(false);
//   const [showRoleSelect, setShowRoleSelect] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [attempts, setAttempts] = useState(0);
//   const [emailError, setEmailError] = useState("");
//   const [otpError, setOtpError] = useState("");

//   const MAX_ATTEMPTS = 3;

//   const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

//   // ---------------------- SEND OTP ----------------------
//   const handleSendOtp = async () => {
//     setEmailError("");
//     if (!email.trim()) {
//       return setEmailError("Please enter your email");
//     }
//     if (!isValidEmail(email)) {
//       return setEmailError("Enter a valid email address");
//     }
//     if (attempts >= MAX_ATTEMPTS) {
//       setEmailError("You have exceeded 3 attempts. Try again later.");
//       setEmail("");
//       setOtpSent(false);
//       setAttempts(0);
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await sendOtp(email);
//       if (res.status === "SUCCESS") {
//         setOtpSent(true);
//         setAttempts(0);
//       } else {
//         setAttempts((prev) => prev + 1);
//         setEmailError(
//           `${res.message || "Failed to send OTP"} (Attempt ${attempts + 1}/3)`
//         );
//       }
//     } catch (error) {
//       console.log("Send OTP Error:", error?.response?.data || error.message);
//       const backendMessage =
//         error?.response?.data?.message ||
//         error?.response?.data?.error ||
//         error.message ||
//         "Network error. Try again.";
//       setEmailError(backendMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------------------- VERIFY OTP ----------------------
//   const handleVerifyOtp = async () => {
//     setOtpError("");
//     if (!otp.trim()) return setOtpError("Please enter the OTP");

//     if (attempts >= MAX_ATTEMPTS) {
//       setOtpError("You have exceeded 3 attempts. Try again later.");
//       setOtp("");
//       setOtpSent(false);
//       setAttempts(0);
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await verifyOtp(otp);
//       const tempToken = res?.data?.accessToken;

//       if (res.status === "SUCCESS" && tempToken) {
//         await AsyncStorage.setItem("tempToken", tempToken);
//         setShowRoleSelect(true);
//       } else {
//         setAttempts((prev) => prev + 1);
//         setOtpError(
//           `${res.message || "OTP verification failed"} (Attempt ${
//             attempts + 1
//           }/3)`
//         );
//       }
//     } catch (error) {
//       console.log("Verify OTP Error:", error?.response?.data || error.message);

//       const backendMessage =
//         error?.response?.data?.message ||
//         error?.response?.data?.error ||
//         error.message ||
//         "OTP verification failed";

//       setOtpError(backendMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------------------- MAIN UI ----------------------
//   if (showRoleSelect) return <RoleSelect navigation={navigation} />;

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Micro Job Login</Text>

//       {/* ---------- Email / OTP Input ---------- */}
//       <TextInput
//         style={styles.input}
//         placeholder={otpSent ? "Enter OTP" : "Enter Email"}
//         placeholderTextColor="#aaa"
//         value={otpSent ? otp : email}
//         onChangeText={(text) => {
//           otpSent ? setOtp(text) : setEmail(text);
//           otpSent ? setOtpError("") : setEmailError("");
//         }}
//         keyboardType={otpSent ? "numeric" : "email-address"}
//       />

//       {/* ---------- Error Messages ---------- */}
//       {!otpSent && emailError ? (
//         <Text style={styles.errorText}>{emailError}</Text>
//       ) : null}
//       {otpSent && otpError ? (
//         <Text style={styles.errorText}>{otpError}</Text>
//       ) : null}

//       {/* ---------- Buttons ---------- */}
//       {!otpSent ? (
//         <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
//           <Text style={styles.buttonText}>Send OTP</Text>
//         </TouchableOpacity>
//       ) : (
//         <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
//           <Text style={styles.buttonText}>Verify OTP</Text>
//         </TouchableOpacity>
//       )}

//       {otpSent && (
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => {
//             setOtpSent(false);
//             setOtp("");
//             setEmailError("");
//             setOtpError("");
//             setAttempts(0);
//           }}
//         >
//           <Text style={styles.backButtonText}>← Back to Email</Text>
//         </TouchableOpacity>
//       )}

//       {/* ---------- Admin Login Navigation ---------- */}
//       <TouchableOpacity
//         style={styles.adminButton}
//         onPress={() => navigation.navigate("AdminLogin")}
//       >
//         <Text style={styles.adminButtonText}>Admin Login</Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator size="large" color="#1E90FF" />}
//     </ScrollView>
//   );
// }

// // ---------------------- STYLES ----------------------
// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#071A52",
//   },
//   title: { fontSize: 24, color: "#fff", fontWeight: "bold", marginBottom: 20 },
//   input: {
//     width: "90%",
//     borderWidth: 1,
//     borderColor: "#1E90FF",
//     borderRadius: 10,
//     padding: 12,
//     color: "#fff",
//     marginBottom: 5,
//   },
//   errorText: { color: "#FF4136", marginBottom: 10, fontSize: 14 },
//   button: {
//     width: "90%",
//     backgroundColor: "#1E90FF",
//     padding: 14,
//     borderRadius: 10,
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   buttonText: { color: "#fff", fontWeight: "600" },
//   backButton: { marginTop: 10 },
//   backButtonText: { color: "#28A745", fontSize: 16 },
//   adminButton: {
//     marginTop: 20,
//     padding: 12,
//     backgroundColor: "#FF4500",
//     borderRadius: 10,
//   },
//   adminButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
// });
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { sendOtp, verifyOtp } from "../api/auth";
// import RoleSelect from "./RoleSelect";

// export default function LoginPage({ navigation }) {
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [otpSent, setOtpSent] = useState(false);
//   const [showRoleSelect, setShowRoleSelect] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [attempts, setAttempts] = useState(0);
//   const [emailError, setEmailError] = useState("");
//   const [otpError, setOtpError] = useState("");

//   const MAX_ATTEMPTS = 3;

//   const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

//   // ---------------------- SEND OTP ----------------------
//   const handleSendOtp = async () => {
//     setEmailError("");

//     if (!email.trim()) {
//       return setEmailError("Please enter your email");
//     }
//     if (!isValidEmail(email)) {
//       return setEmailError("Enter a valid email address");
//     }

//     if (attempts >= MAX_ATTEMPTS) {
//       setEmailError("You have exceeded 3 attempts. Try again later.");
//       setEmail("");
//       setOtpSent(false);
//       setAttempts(0);
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await sendOtp(email);

//       if (res.status === "SUCCESS") {
//         setOtpSent(true);
//         setAttempts(0);
//       } else {
//         setAttempts((prev) => prev + 1);
//         setEmailError(
//           `${res.message || "Failed to send OTP"} (Attempt ${attempts + 1}/3)`
//         );
//       }
//     } catch (error) {
//       console.log("Send OTP Error:", error?.response?.data || error.message);

//       const backendMsg =
//         error?.response?.data?.details?.message ||
//         error?.response?.data?.message ||
//         error?.response?.data?.error ||
//         error.message ||
//         "Failed to send OTP. Try again.";

//       if (backendMsg.toLowerCase().includes("already registered")) {
//         setEmailError("This email is already registered.");
//       } else if (backendMsg.toLowerCase().includes("not found")) {
//         setEmailError("Email not found. Please check again.");
//       } else {
//         setEmailError(backendMsg);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------------------- VERIFY OTP ----------------------
//   const handleVerifyOtp = async () => {
//     setOtpError("");

//     if (!otp.trim()) return setOtpError("Please enter the OTP");

//     if (attempts >= MAX_ATTEMPTS) {
//       setOtpError("You have exceeded 3 attempts. Try again later.");
//       setOtp("");
//       setOtpSent(false);
//       setAttempts(0);
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await verifyOtp(otp);
//       const tempToken = res?.data?.accessToken;

//       if (res.status === "SUCCESS" && tempToken) {
//         await AsyncStorage.setItem("tempToken", tempToken);
//         setShowRoleSelect(true);
//       } else {
//         setAttempts((prev) => prev + 1);
//         setOtpError(
//           `${res.message || "OTP verification failed"} (Attempt ${
//             attempts + 1
//           }/3)`
//         );
//       }
//     } catch (error) {
//       console.log("Veriy OTP Error:");

//       const backendMsg =
//         error?.response?.data?.details?.message ||
//         error?.response?.data?.message ||

//         error.message ||
//         "OTP verification failed.";

//       if (backendMsg.toLowerCase().includes("otp mismatch")) {
//         setOtpError("Invalid OTP. Please try again.");
//       } else if (backendMsg.toLowerCase().includes("expired")) {
//         setOtpError("OTP has expired. Please request a new one.");
//       } else {
//         setOtpError(backendMsg);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------------------- MAIN UI ----------------------
//   if (showRoleSelect) return <RoleSelect navigation={navigation} />;

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Micro Job Login</Text>

//       {/* ---------- Email / OTP Input ---------- */}
//       <TextInput
//         style={styles.input}
//         placeholder={otpSent ? "Enter OTP" : "Enter Email"}
//         placeholderTextColor="#aaa"
//         value={otpSent ? otp : email}
//         onChangeText={(text) => {
//           otpSent ? setOtp(text) : setEmail(text);
//           otpSent ? setOtpError("") : setEmailError("");
//         }}
//         keyboardType={otpSent ? "numeric" : "email-address"}
//       />

//       {/* ---------- Error Messages ---------- */}
//       {!otpSent && emailError ? (
//         <Text style={styles.errorText}>{emailError}</Text>
//       ) : null}
//       {otpSent && otpError ? (
//         <Text style={styles.errorText}>{otpError}</Text>
//       ) : null}

//       {/* ---------- Buttons ---------- */}
//       {!otpSent ? (
//         <TouchableOpacity
//           style={[styles.button, loading && { opacity: 0.6 }]}
//           onPress={handleSendOtp}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={styles.buttonText}>Send OTP</Text>
//           )}
//         </TouchableOpacity>
//       ) : (
//         <TouchableOpacity
//           style={[styles.button, loading && { opacity: 0.6 }]}
//           onPress={handleVerifyOtp}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={styles.buttonText}>Verify OTP</Text>
//           )}
//         </TouchableOpacity>
//       )}

//       {otpSent && (
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => {
//             setOtpSent(false);
//             setOtp("");
//             setEmailError("");
//             setOtpError("");
//             setAttempts(0);
//           }}
//         >
//           <Text style={styles.backButtonText}>← Back to Email</Text>
//         </TouchableOpacity>
//       )}

//       {/* ---------- Admin Login Navigation ---------- */}
//       <TouchableOpacity
//         style={styles.adminButton}
//         onPress={() => navigation.navigate("AdminLogin")}
//       >
//         <Text style={styles.adminButtonText}>Admin Login</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// // ---------------------- STYLES ----------------------
// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#071A52",
//   },
//   title: { fontSize: 24, color: "#fff", fontWeight: "bold", marginBottom: 20 },
//   input: {
//     width: "90%",
//     borderWidth: 1,
//     borderColor: "#1E90FF",
//     borderRadius: 10,
//     padding: 12,
//     color: "#fff",
//     marginBottom: 5,
//   },
//   errorText: { color: "#FF4136", marginBottom: 10, fontSize: 14 },
//   button: {
//     width: "90%",
//     backgroundColor: "#1E90FF",
//     padding: 14,
//     borderRadius: 10,
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   buttonText: { color: "#fff", fontWeight: "600" },
//   backButton: { marginTop: 10 },
//   backButtonText: { color: "#28A745", fontSize: 16 },
//   adminButton: {
//     marginTop: 20,
//     padding: 12,
//     backgroundColor: "#FF4500",
//     borderRadius: 10,
//   },
//   adminButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
// });
import React, { useState, useRef } from "react";
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
  const otpInputs = useRef([]);

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // ---------------------- SEND OTP ----------------------
  const handleSendOtp = async () => {
    setEmailError("");

    if (!email.trim()) return setEmailError("Please enter your email");
    if (!isValidEmail(email))
      return setEmailError("Enter a valid email address");

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
      const backendMsg =
        error?.response?.data?.details?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        "Failed to send OTP. Try again.";

      if (backendMsg.toLowerCase().includes("already registered")) {
        setEmailError("This email is already registered.");
      } else if (backendMsg.toLowerCase().includes("not found")) {
        setEmailError("Email not found. Please check again.");
      } else {
        setEmailError(backendMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------------- VERIFY OTP ----------------------
  const handleVerifyOtp = async () => {
    setOtpError("");

    if (otp.length !== 6) return setOtpError("Please enter all 6 digits");

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
      const backendMsg =
        error?.response?.data?.details?.message ||
        error?.response?.data?.message ||
        error.message ||
        "OTP verification failed.";

      if (
        backendMsg.toLowerCase().includes("otp mismatch") ||
        backendMsg.toLowerCase().includes("otp does not match")
      ) {
        setOtpError("Invalid OTP. Please try again.");
      } else if (backendMsg.toLowerCase().includes("expired")) {
        setOtpError("OTP has expired. Please request a new one.");
      } else {
        setOtpError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------------- OTP INPUT HANDLER ----------------------
  const handleOtpChange = (value, index) => {
    if (/^\d*$/.test(value)) {
      const otpArray = otp.split("");
      otpArray[index] = value;
      const newOtp = otpArray.join("");
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        otpInputs.current[index + 1]?.focus();
      }

      setOtpError("");
    }
  };

  // ---------------------- MAIN UI ----------------------
  if (showRoleSelect) return <RoleSelect navigation={navigation} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Micro Job Login</Text>

      {/* ---------- Email or OTP Input ---------- */}
      {!otpSent ? (
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError("");
          }}
          keyboardType="email-address"
        />
      ) : (
        <View style={styles.otpContainer}>
          {Array.from({ length: 6 }).map((_, index) => (
            <TextInput
              key={index}
              ref={(ref) => (otpInputs.current[index] = ref)}
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={1}
              value={otp[index] || ""}
              onChangeText={(value) => handleOtpChange(value, index)}
            />
          ))}
        </View>
      )}

      {/* ---------- Error Messages ---------- */}
      {!otpSent && emailError ? (
        <Text style={styles.errorText}>{emailError}</Text>
      ) : null}
      {otpSent && otpError ? (
        <Text style={styles.errorText}>{otpError}</Text>
      ) : null}

      {/* ---------- Buttons ---------- */}
      {!otpSent ? (
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSendOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleVerifyOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify OTP</Text>
          )}
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

      {/* ---------- Admin Login ---------- */}
      <TouchableOpacity
        style={styles.adminButton}
        onPress={() => navigation.navigate("AdminLogin")}
      >
        <Text style={styles.adminButtonText}>Admin Login</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#1E90FF",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    marginBottom: 5,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 10,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: "#1E90FF",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 18,
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.1)",
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

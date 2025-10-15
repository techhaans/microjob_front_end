// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons"; // ✅ Import for back arrow icon
// import { sendDoerOtp, verifyDoerOtp, fetchDoerProfile } from "../api/doer";

// export default function LoginPage({ navigation }) {
//   const [phone, setPhone] = useState("");
//   const [otp, setOtp] = useState("");
//   const [sessionId, setSessionId] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Step 1: Request OTP
//   const requestOtp = async () => {
//     if (!/^\d{10}$/.test(phone)) {
//       return Alert.alert("Invalid", "Enter a valid 10-digit phone number");
//     }

//     try {
//       setLoading(true);
//       const res = await sendDoerOtp(phone);

//       if (res?.data?.sessionId) {
//         setSessionId(res.data.sessionId);
//         Alert.alert("OTP Sent", "Check your phone for OTP");
//       } else {
//         Alert.alert("Error", res?.message || "Failed to send OTP");
//       }
//     } catch (err) {
//       Alert.alert("Error", err.message || "Network error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Step 2: Verify OTP and fetch profile
//   const verify = async () => {
//     if (!sessionId) return Alert.alert("Error", "Request OTP first");

//     try {
//       setLoading(true);
//       const res = await verifyDoerOtp(sessionId, otp);

//       if (res?.status === "SUCCESS" && res?.data?.token) {
//         await AsyncStorage.setItem("authToken", res.data.token);
//         let profileData = await fetchDoerProfile(res.data.token);
//         if (!profileData) profileData = { phone, isNew: true };
//         await AsyncStorage.setItem("doerProfile", JSON.stringify(profileData));

//         navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
//       } else {
//         Alert.alert("OTP Failed", res?.message || "Invalid OTP");
//       }
//     } catch (err) {
//       Alert.alert("Error", err.message || "Network error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* ✅ Top Back Arrow */}
//       <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//         <Ionicons name="arrow-back" size={24} color="#000" />
//       </TouchableOpacity>

//       <Text style={styles.title}>Doer Login</Text>

//       <TextInput
//         placeholder="Phone (10 digits)"
//         keyboardType="phone-pad"
//         style={styles.input}
//         maxLength={10}
//         value={phone}
//         onChangeText={setPhone}
//       />

//       <TouchableOpacity style={styles.btn} onPress={requestOtp} disabled={loading}>
//         <Text style={styles.btnText}>{loading ? "Sending..." : "Send OTP"}</Text>
//       </TouchableOpacity>

//       {sessionId && (
//         <>
//           <TextInput
//             placeholder="OTP"
//             keyboardType="number-pad"
//             style={styles.input}
//             value={otp}
//             onChangeText={setOtp}
//           />
//           <TouchableOpacity style={styles.btn} onPress={verify} disabled={loading}>
//             <Text style={styles.btnText}>{loading ? "Verifying..." : "Verify OTP"}</Text>
//           </TouchableOpacity>
//         </>
//       )}

//       {loading && <ActivityIndicator size="large" color="#1976D2" style={{ marginTop: 20 }} />}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f8f9fa" },
//   backButton: {
//     position: "absolute",
//     top: 50,
//     left: 20,
//     zIndex: 10,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   input: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   btn: {
//     backgroundColor: "#1976D2",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "600" },
// });
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { sendOtp, verifyOtp, selectRole } from "../api/auth";

// export default function UnifiedLoginScreen({ navigation }) {
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [sessionId, setSessionId] = useState("");
//   const [role, setRole] = useState("DOER"); // default role
//   const [otpSent, setOtpSent] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // Send OTP
//   const handleSendOtp = async () => {
//     if (!email) return Alert.alert("Error", "Enter your email");

//     setLoading(true);
//     const res = await sendOtp(email);
//     setLoading(false);

//     if (res.status === "SUCCESS") {
//       setSessionId(res.data.sessionId);
//       setOtpSent(true);
//       Alert.alert("Success", res.data.message || "OTP sent successfully");
//     } else {
//       Alert.alert("Error", res.message || "Failed to send OTP");
//     }
//   };

//   // Verify OTP + select role
//   const handleVerifyOtp = async () => {
//     if (!otp || !sessionId) return Alert.alert("Error", "Enter OTP");

//     setLoading(true);
//     const verifyRes = await verifyOtp(sessionId, otp);

//     if (verifyRes.status !== "SUCCESS") {
//       setLoading(false);
//       return Alert.alert("Error", verifyRes.message || "OTP verification failed");
//     }

//     const roleRes = await selectRole(role);
//     setLoading(false);

//     if (roleRes.status === "SUCCESS") {
//       Alert.alert("Login Success", `Logged in as ${role}`);
//       navigation.replace(role === "DOER" ? "DoerDashboard" : "PosterDashboard");
//     } else {
//       Alert.alert("Error", roleRes.message || "Role selection failed");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Unified Login</Text>

//       <TextInput
//         placeholder="Email"
//         style={styles.input}
//         value={email}
//         onChangeText={setEmail}
//         editable={!otpSent} // lock email input after OTP sent
//       />

//       <TouchableOpacity style={styles.btn} onPress={handleSendOtp} disabled={loading || otpSent}>
//         <Text style={styles.btnText}>{loading ? "Sending..." : "Send OTP"}</Text>
//       </TouchableOpacity>

//       {otpSent && (
//         <>
//           <TextInput
//             placeholder="Enter OTP"
//             style={styles.input}
//             value={otp}
//             onChangeText={setOtp}
//             keyboardType="number-pad"
//           />

//           <View style={styles.roleContainer}>
//             <TouchableOpacity
//               style={[styles.roleBtn, role === "DOER" && styles.selectedRole]}
//               onPress={() => setRole("DOER")}
//             >
//               <Text>Doer</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.roleBtn, role === "POSTER" && styles.selectedRole]}
//               onPress={() => setRole("POSTER")}
//             >
//               <Text>Poster</Text>
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity style={styles.btn} onPress={handleVerifyOtp} disabled={loading}>
//             <Text style={styles.btnText}>{loading ? "Verifying..." : "Verify OTP & Login"}</Text>
//           </TouchableOpacity>
//         </>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, justifyContent: "center" },
//   title: { fontSize: 22, fontWeight: "700", marginBottom: 20, textAlign: "center" },
//   input: { borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8, marginBottom: 15 },
//   btn: { backgroundColor: "#1976D2", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 15 },
//   btnText: { color: "#fff", fontWeight: "700" },
//   roleContainer: { flexDirection: "row", marginBottom: 15 },
//   roleBtn: {
//     flex: 1,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     alignItems: "center",
//     marginRight: 5,
//     borderRadius: 6,
//   },
//   selectedRole: { backgroundColor: "#e3f2fd", borderColor: "#1976D2" },
// });
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { sendOtp, verifyOtp, selectRole } from "../api/auth";

// export default function Log({ navigation }) {
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSendOtp = async () => {
//     if (!email) {
//       Alert.alert("Error", "Please enter your email");
//       return;
//     }
//     setLoading(true);
//     const res = await sendOtp(email);
//     setLoading(false);
//     if (res.status === "SUCCESS") Alert.alert("Success", res.data.message);
//     else Alert.alert("Error", res.message);
//   };

//   const handleVerifyOtp = async (role) => {
//     if (!otp) {
//       Alert.alert("Error", "Please enter OTP");
//       return;
//     }
//     setLoading(true);
//     try {
//       const sessionId = await AsyncStorage.getItem("tempSessionId");
//       const otpRes = await verifyOtp(sessionId, otp);
//       if (otpRes.status !== "SUCCESS") throw new Error(otpRes.message);

//       const roleRes = await selectRole(role);
//       if (roleRes.status !== "SUCCESS") throw new Error(roleRes.message);

//       if (role === "DOER") navigation.replace("Dashboard");
//       else navigation.replace("PosterDashboard");
//     } catch (err) {
//       Alert.alert("Error", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Logo Section */}
//       <Image
//         source={require("../images/mjlogo.jpg")}
//         style={styles.logo}
//         resizeMode="contain"
//       />

//       <Text style={styles.title}>Micro Job</Text>
//       <Text style={styles.subtitle}>Select Your Role</Text>

//       {/* Email Field */}
//       <TextInput
//         value={email}
//         onChangeText={setEmail}
//         placeholder="Enter your email"
//         placeholderTextColor="#aaa"
//         style={styles.input}
//         keyboardType="email-address"
//       />

//       <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
//         <Text style={styles.buttonText}>Send OTP</Text>
//       </TouchableOpacity>

//       {/* OTP Field */}
//       <TextInput
//         value={otp}
//         onChangeText={setOtp}
//         placeholder="Enter OTP"
//         placeholderTextColor="#aaa"
//         keyboardType="numeric"
//         style={styles.input}
//       />

//       {/* Role Buttons */}
//       <TouchableOpacity
//         style={[styles.button, styles.doerButton]}
//         onPress={() => handleVerifyOtp("DOER")}
//       >
//         <Text style={styles.buttonText}>Login as DOER</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.button, styles.posterButton]}
//         onPress={() => handleVerifyOtp("POSTER")}
//       >
//         <Text style={styles.buttonText}>Login as POSTER</Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator size="large" color="#fff" />}

//       <Text style={styles.footer}>Powered by: TechHaans PVT LTD</Text>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     backgroundColor: "#071A52", // dark blue background
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 20,
//   },
// //   logo: {
// //     width: 100,
// //     height: 100,
// //     marginBottom: 10,
// //   },
// //   title: {
// //     color: "#fff",
// //     fontSize: 22,
// //     fontWeight: "bold",
// //     marginBottom: 5,
// //   },
// //   subtitle: {
// //     color: "#aaa",
// //     fontSize: 16,
// //     marginBottom: 20,
// //   },
// //   input: {
// //     width: "90%",
// //     borderWidth: 1,
// //     borderColor: "#1E90FF",
// //     borderRadius: 10,
// //     padding: 10,
// //     color: "#fff",
// //     marginVertical: 8,
// //   },
// //   button: {
// //     width: "90%",
// //     backgroundColor: "#1E90FF",
// //     padding: 12,
// //     borderRadius: 10,
// //     alignItems: "center",
// //     marginVertical: 8,
// //   },
// //   buttonText: {
// //     color: "#fff",
// //     fontWeight: "600",
// //     fontSize: 16,
// //   },
// //   doerButton: {
// //     backgroundColor: "#1E90FF",
// //   },
// //   posterButton: {
// //     backgroundColor: "#28A745",
// //   },
// //   footer: {
// //     color: "#aaa",
// //     fontSize: 12,
// //     marginTop: 30,
// //   },
// // });

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { sendOtp, verifyOtp } from "../api/auth";

// export default function LoginPage({ navigation }) {
//   const [inputValue, setInputValue] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [sessionId, setSessionId] = useState(null);
//   const [attemptsLeft, setAttemptsLeft] = useState(3);
//   const [otpExpiry, setOtpExpiry] = useState(null);

//   // 🔹 OTP expiry timer
//   useEffect(() => {
//     let timer;
//     if (otpExpiry) {
//       timer = setInterval(() => {
//         const now = new Date().getTime();
//         if (now > otpExpiry) {
//           Alert.alert(
//             "OTP Expired",
//             "Your OTP has expired. Please resend OTP."
//           );
//           setOtpSent(false);
//           setInputValue("");
//           setOtpExpiry(null);
//           clearInterval(timer);
//         }
//       }, 1000);
//     }
//     return () => clearInterval(timer);
//   }, [otpExpiry]);

//   // 🔹 Send OTP
//   const handleSendOtp = async () => {
//     if (!inputValue) {
//       Alert.alert("Error", "Please enter your email");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await sendOtp(inputValue);

//       if (res.status === "SUCCESS") {
//         setSessionId(res.data.sessionId);
//         setOtpSent(true);
//         setAttemptsLeft(3);
//         setOtpExpiry(new Date().getTime() + 5 * 60 * 1000); // 5 min expiry
//         Alert.alert(
//           "Success",
//           `OTP sent to ${inputValue}. Valid for 5 minutes.`
//         );
//         setInputValue("");
//       } else {
//         throw new Error(res.message || "Failed to send OTP");
//       }
//     } catch (err) {
//       Alert.alert("Error", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

  // 🔹 Verify OTP
  // const handleVerifyOtp = async () => {
  //   if (!inputValue) {
  //     Alert.alert("Error", "Please enter OTP");
  //     return;
  //   }

  //   if (!sessionId) {
  //     Alert.alert("Error", "Please send OTP first");
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const res = await verifyOtp(sessionId, inputValue);

  //     if (res.status !== "SUCCESS") throw new Error(res.message);

  //     // ✅ OTP verified successfully — save both access & refresh tokens
  //     await AsyncStorage.setItem("accessToken", res.data.accessToken);
  //     if (res.data.refreshToken) {
  //       await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
  //     }

  //     navigation.replace("RoleSelect");
  //   } catch (err) {
  //     const remaining = attemptsLeft - 1;
  //     setAttemptsLeft(remaining);

  //     if (remaining <= 0) {
  //       Alert.alert(
  //         "OTP Failed",
  //         "Maximum attempts reached. Please resend OTP."
  //       );
  //       setOtpSent(false);
  //       setInputValue("");
  //     } else {
  //       Alert.alert(
  //         "OTP Failed",
  //         `Incorrect OTP. Attempts remaining: ${remaining}`
  //       );
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };
//   const handleVerifyOtp = async () => {
//     if (!inputValue) {
//       Alert.alert("Error", "Please enter OTP");
//       return;
//     }

//     if (!sessionId) {
//       Alert.alert("Error", "Please send OTP first");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Ensure OTP is string
//       const res = await verifyOtp(sessionId, inputValue);

//       if (res.status !== "SUCCESS")
//         throw new Error(res.message || "OTP failed");

//       // ✅ Save tokens
//       await AsyncStorage.setItem("accessToken", res.data.accessToken);
//       if (res.data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
//       }

//       navigation.replace("RoleSelect");
//     } catch (err) {
//       const remaining = attemptsLeft - 1;
//       setAttemptsLeft(remaining);

//       if (remaining <= 0) {
//         Alert.alert(
//           "OTP Failed",
//           "Maximum attempts reached. Please resend OTP."
//         );
//         setOtpSent(false);
//         setInputValue("");
//       } else {
//         Alert.alert(
//           "OTP Failed",
//           `Incorrect OTP. Attempts remaining: ${remaining}`
//         );
//       }
//       console.log("[ERROR] OTP Verification:", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 Resend OTP
//   const handleResendOtp = () => {
//     setOtpSent(false);
//     setInputValue("");
//   };

//   // 🔹 Admin login redirect
//   const handleAdminLogin = () => {
//     navigation.navigate("AdminLogin");
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Image
//         source={require("../images/mjlogo.jpg")}
//         style={styles.logo}
//         resizeMode="contain"
//       />

//       <Text style={styles.title}>Micro Job</Text>
//       <Text style={styles.subtitle}>Login to Continue</Text>

//       <TextInput
//         value={inputValue}
//         onChangeText={setInputValue}
//         placeholder={otpSent ? "Enter OTP" : "Enter Email"}
//         placeholderTextColor="#aaa"
//         keyboardType={otpSent ? "numeric" : "email-address"}
//         style={styles.input}
//       />

//       {!otpSent ? (
//         <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
//           <Text style={styles.buttonText}>Send OTP</Text>
//         </TouchableOpacity>
//       ) : (
//         <>
//           <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
//             <Text style={styles.buttonText}>Verify OTP</Text>
//           </TouchableOpacity>

//           <Text style={styles.attempts}>Attempts left: {attemptsLeft}</Text>

//           <TouchableOpacity
//             style={styles.resendButton}
//             onPress={handleResendOtp}
//           >
//             <Text style={styles.resendText}>Resend OTP</Text>
//           </TouchableOpacity>
//         </>
//       )}

//       <TouchableOpacity style={styles.adminButton} onPress={handleAdminLogin}>
//         <Text style={styles.adminText}>Admin Login</Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator size="large" color="#fff" />}

//       <Text style={styles.footer}>Powered by: TechHaans PVT LTD</Text>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     backgroundColor: "#071A52",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 20,
//     paddingTop: 60,
//   },
//   logo: { width: 100, height: 100, marginBottom: 20 },
//   title: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 5 },
//   subtitle: { color: "#aaa", fontSize: 16, marginBottom: 20 },
//   input: {
//     width: "90%",
//     borderWidth: 1,
//     borderColor: "#1E90FF",
//     borderRadius: 10,
//     padding: 12,
//     color: "#fff",
//     marginVertical: 10,
//   },
//   button: {
//     width: "90%",
//     backgroundColor: "#1E90FF",
//     padding: 14,
//     borderRadius: 10,
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
//   resendButton: { marginTop: 10 },
//   resendText: {
//     color: "#28A745",
//     fontSize: 14,
//     textDecorationLine: "underline",
//   },
//   attempts: { color: "#FF6347", marginTop: 5, fontSize: 14 },
//   adminButton: { marginTop: 30, padding: 10 },
//   adminText: {
//     color: "#FFD700",
//     fontSize: 16,
//     textDecorationLine: "underline",
//   },
//   footer: { color: "#aaa", fontSize: 12, marginTop: 40 },
// })



import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendOtp, verifyOtp } from "../api/auth";

export default function LoginPage({ navigation }) {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [otpExpiry, setOtpExpiry] = useState(null);

  // 🔹 OTP expiry timer
  useEffect(() => {
    let timer;
    if (otpExpiry) {
      timer = setInterval(() => {
        const now = new Date().getTime();
        if (now > otpExpiry) {
          Alert.alert(
            "OTP Expired",
            "Your OTP has expired. Please resend OTP."
          );
          console.log("[DEBUG] OTP expired");
          setOtpSent(false);
          setInputValue("");
          setOtpExpiry(null);
          clearInterval(timer);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpExpiry]);

  // 🔹 Send OTP
  const handleSendOtp = async () => {
    if (!inputValue) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    setLoading(true);
    try {
      console.log("[DEBUG] Sending OTP to:", inputValue);
      const res = await sendOtp(inputValue);
      console.log("[DEBUG] sendOtp response:", res);

      if (res.status === "SUCCESS") {
        setSessionId(res.data.sessionId);
        console.log("[DEBUG] OTP sessionId:", res.data.sessionId);

        setOtpSent(true);
        setAttemptsLeft(3);
        setOtpExpiry(new Date().getTime() + 5 * 60 * 1000); // 5 min expiry
        Alert.alert(
          "Success",
          `OTP sent to ${inputValue}. Valid for 5 minutes.`
        );
        setInputValue("");
      } else {
        throw new Error(res.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("[ERROR] sendOtp:", err);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Verify OTP
  const handleVerifyOtp = async () => {
    if (!inputValue) {
      Alert.alert("Error", "Please enter OTP");
      return;
    }

    if (!sessionId) {
      Alert.alert("Error", "Please send OTP first");
      return;
    }

    setLoading(true);
    try {
      console.log("[DEBUG] Verifying OTP:", inputValue, "SessionId:", sessionId);
      const res = await verifyOtp(sessionId, inputValue);
      console.log("[DEBUG] verifyOtp response:", res);

      if (res.status !== "SUCCESS")
        throw new Error(res.message || "OTP failed");

      // ✅ Save tokens
      await AsyncStorage.setItem("accessToken", res.data.accessToken);
      console.log("[DEBUG] Access token saved:", res.data.accessToken);

      if (res.data.refreshToken) {
        await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
        console.log("[DEBUG] Refresh token saved:", res.data.refreshToken);
      }

      navigation.replace("RoleSelect");
    } catch (err) {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);

      if (remaining <= 0) {
        Alert.alert(
          "OTP Failed",
          "Maximum attempts reached. Please resend OTP."
        );
        setOtpSent(false);
        setInputValue("");
      } else {
        Alert.alert(
          "OTP Failed",
          `Incorrect OTP. Attempts remaining: ${remaining}`
        );
      }
      console.error("[ERROR] OTP Verification:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Resend OTP
  const handleResendOtp = () => {
    console.log("[DEBUG] Resend OTP clicked");
    setOtpSent(false);
    setInputValue("");
  };

  // 🔹 Admin login redirect
  const handleAdminLogin = () => {
    console.log("[DEBUG] Navigate to AdminLogin");
    navigation.navigate("AdminLogin");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require("../images/mjlogo.jpg")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Micro Job</Text>
      <Text style={styles.subtitle}>Login to Continue</Text>

      <TextInput
        value={inputValue}
        onChangeText={setInputValue}
        placeholder={otpSent ? "Enter OTP" : "Enter Email"}
        placeholderTextColor="#aaa"
        keyboardType={otpSent ? "numeric" : "email-address"}
        style={styles.input}
      />

      {!otpSent ? (
        <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
          <Text style={styles.buttonText}>Send OTP</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>

          <Text style={styles.attempts}>Attempts left: {attemptsLeft}</Text>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendOtp}
          >
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.adminButton} onPress={handleAdminLogin}>
        <Text style={styles.adminText}>Admin Login</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#fff" />}

      <Text style={styles.footer}>Powered by: TechHaans PVT LTD</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#071A52",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingTop: 60,
  },
  logo: { width: 100, height: 100, marginBottom: 20 },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  subtitle: { color: "#aaa", fontSize: 16, marginBottom: 20 },
  input: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#1E90FF",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    marginVertical: 10,
  },
  button: {
    width: "90%",
    backgroundColor: "#1E90FF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  resendButton: { marginTop: 10 },
  resendText: {
    color: "#28A745",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  attempts: { color: "#FF6347", marginTop: 5, fontSize: 14 },
  adminButton: { marginTop: 30, padding: 10 },
  adminText: {
    color: "#FFD700",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  footer: { color: "#aaa", fontSize: 12, marginTop: 40 },
});

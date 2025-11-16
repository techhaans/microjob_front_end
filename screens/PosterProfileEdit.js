// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   fetchPosterProfile,
//   updatePosterProfile,
//   sendPosterPhoneOtp,
//   verifyPosterPhoneOtp,
// } from "../api/poster";

// export default function PosterProfileScreen() {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [profile, setProfile] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     about: "",
//     isPhoneVerified: false,
//   });

//   const [otpSessionId, setOtpSessionId] = useState(null);
//   const [otp, setOtp] = useState("");
//   const [sendingOtp, setSendingOtp] = useState(false);
//   const [verifyingOtp, setVerifyingOtp] = useState(false);

//   // Load profile on mount
//   const loadProfile = async () => {
//     setLoading(true);
//     try {
//       const data = await fetchPosterProfile();
//       setProfile({
//         name: data.name || "",
//         email: data.email || "",
//         phone: data.phone || "",
//         about: data.about || "",
//         isPhoneVerified: data.isPhoneVerified || false,
//       });
//     } catch (err) {
//       console.error("Fetch Profile Error:", err);
//       // Handle new user
//       if (err.response?.status === 400) {
//         // Optionally prefill email from JWT or AsyncStorage
//         const token = await AsyncStorage.getItem("authToken");
//         let email = "";
//         if (token) {
//           const payload = JSON.parse(atob(token.split(".")[1]));
//           email = payload.email || "";
//         }
//         setProfile({
//           name: "",
//           email,
//           phone: "",
//           about: "",
//           isPhoneVerified: false,
//         });
//       } else {
//         Alert.alert("Error", "Failed to fetch profile");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   // Save profile
//   const handleSave = async () => {
//     if (!profile.name || !profile.phone) {
//       return Alert.alert("Error", "Name and Phone are required");
//     }
//     setSaving(true);
//     try {
//       const res = await updatePosterProfile({
//         Name: profile.name,
//         phone: profile.phone,
//         about: profile.about,
//       });
//       Alert.alert("Success", "Profile saved successfully");
//       setProfile((prev) => ({ ...prev, isPhoneVerified: false }));
//     } catch (err) {
//       console.error("Save Profile Error:", err);
//       Alert.alert("Error", "Failed to save profile");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const handleSendOtp = async () => {
//     if (!profile.phone) return Alert.alert("Error", "Phone number is required");
//     setSendingOtp(true);
//     try {
//       const res = await sendPosterPhoneOtp();
//       if (res.status === "SUCCESS") {
//         setOtpSessionId(res.data.sessionId);
//         Alert.alert("OTP Sent", res.data.message || "OTP sent successfully");
//       } else {
//         Alert.alert("Error", res.message || "Failed to send OTP");
//       }
//     } catch (err) {
//       console.error("Send OTP Error:", err);
//       Alert.alert("Error", "Failed to send OTP");
//     } finally {
//       setSendingOtp(false);
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (!otpSessionId || !otp) return Alert.alert("Error", "Enter OTP first");
//     setVerifyingOtp(true);
//     try {
//       const res = await verifyPosterPhoneOtp(otpSessionId, otp);
//       if (res.status === "SUCCESS") {
//         Alert.alert("Success", res.message || "Phone verified successfully");
//         setProfile((prev) => ({ ...prev, isPhoneVerified: true }));
//       } else {
//         Alert.alert("Error", res.message || "OTP verification failed");
//       }
//     } catch (err) {
//       console.error("Verify OTP Error:", err);
//       Alert.alert("Error", "OTP verification failed");
//     } finally {
//       setVerifyingOtp(false);
//     }
//   };

//   if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.label}>Email</Text>
//       <TextInput
//         style={[styles.input, { backgroundColor: "#eee" }]}
//         value={profile.email}
//         editable={false}
//       />

//       <Text style={styles.label}>Name</Text>
//       <TextInput
//         style={styles.input}
//         value={profile.name}
//         onChangeText={(text) => setProfile({ ...profile, name: text })}
//       />

//       <Text style={styles.label}>Phone</Text>
//       <TextInput
//         style={styles.input}
//         value={profile.phone}
//         onChangeText={(text) => setProfile({ ...profile, phone: text })}
//         placeholder="+919876543210"
//       />

//       <Text style={styles.label}>About</Text>
//       <TextInput
//         style={styles.input}
//         value={profile.about}
//         onChangeText={(text) => setProfile({ ...profile, about: text })}
//         multiline
//       />

//       <TouchableOpacity
//         style={styles.button}
//         onPress={handleSave}
//         disabled={saving}
//       >
//         <Text style={styles.buttonText}>
//           {saving ? "Saving..." : "Save Profile"}
//         </Text>
//       </TouchableOpacity>

//       {!profile.isPhoneVerified && profile.phone ? (
//         <>
//           <TouchableOpacity
//             style={[styles.button, { backgroundColor: "#007bff" }]}
//             onPress={handleSendOtp}
//             disabled={sendingOtp}
//           >
//             <Text style={styles.buttonText}>
//               {sendingOtp ? "Sending OTP..." : "Send OTP"}
//             </Text>
//           </TouchableOpacity>

//           {otpSessionId && (
//             <>
//               <TextInput
//                 style={styles.input}
//                 value={otp}
//                 onChangeText={setOtp}
//                 placeholder="Enter OTP"
//                 keyboardType="number-pad"
//               />
//               <TouchableOpacity
//                 style={[styles.button, { backgroundColor: "#28a745" }]}
//                 onPress={handleVerifyOtp}
//                 disabled={verifyingOtp}
//               >
//                 <Text style={styles.buttonText}>
//                   {verifyingOtp ? "Verifying..." : "Verify OTP"}
//                 </Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </>
//       ) : (
//         profile.phone && (
//           <Text style={{ color: "green", marginTop: 10 }}>
//             Phone Verified ✅
//           </Text>
//         )
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#fff", flex: 1 },
//   label: { fontWeight: "bold", marginTop: 10 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//     padding: 10,
//     marginTop: 5,
//   },
//   button: {
//     backgroundColor: "#ff6b6b",
//     padding: 15,
//     borderRadius: 5,
//     marginTop: 15,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "bold" },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   fetchPosterProfile,
//   updatePosterProfile,
//   sendPosterPhoneOtp,
//   verifyPosterPhoneOtp,
// } from "../api/poster";

// export default function PosterProfileScreen() {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [profile, setProfile] = useState({
//     name: "",
//     email: "",
//     phone: "+91",
//     about: "",
//     isPhoneVerified: false,
//   });

//   const [otpSessionId, setOtpSessionId] = useState(null);
//   const [otp, setOtp] = useState("");
//   const [sendingOtp, setSendingOtp] = useState(false);
//   const [verifyingOtp, setVerifyingOtp] = useState(false);

//   // Load profile on mount
//   const loadProfile = async () => {
//     setLoading(true);
//     try {
//       const data = await fetchPosterProfile();
//       setProfile({
//         name: data.name || "",
//         email: data.email || "",
//         phone: data.phone?.startsWith("+91") ? data.phone : `+91${data.phone || ""}`,
//         about: data.about || "",
//         isPhoneVerified: data.isPhoneVerified || false,
//       });
//     } catch (err) {
//       console.error("Fetch Profile Error:", err);
//       if (err.response?.status === 400 || err.details?.message === "No Data") {
//         // Prefill email from token if available
//         const token = await AsyncStorage.getItem("authToken");
//         let email = "";
//         if (token) {
//           try {
//             const payload = JSON.parse(atob(token.split(".")[1]));
//             email = payload.email || "";
//           } catch {}
//         }
//         setProfile({
//           name: "",
//           email,
//           phone: "+91",
//           about: "",
//           isPhoneVerified: false,
//         });
//       } else {
//         Alert.alert("Error", "Failed to fetch profile");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   // Save or Update profile
//   const handleSave = async () => {
//     if (!profile.name.trim()) {
//       return Alert.alert("Error", "Name is required");
//     }
//     if (!profile.phone || profile.phone.length < 10) {
//       return Alert.alert("Error", "Valid phone number is required");
//     }

//     setSaving(true);
//     try {
//       // Make sure API field names match backend expectations
//       const payload = {
//         name: profile.name.trim(),
//         phone: profile.phone.trim(),
//         about: profile.about.trim(),
//       };

//       const res = await updatePosterProfile(payload);

//       Alert.alert("Success", "Profile saved successfully");
//       setProfile((prev) => ({
//         ...prev,
//         isPhoneVerified: false,
//       }));
//     } catch (err) {
//       console.error("Save Profile Error:", err);
//       const msg =
//         err.response?.data?.details?.phone ||
//         err.response?.data?.error ||
//         "Failed to save profile";
//       Alert.alert("Error", msg);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const handleSendOtp = async () => {
//     if (!profile.phone || profile.phone.length < 10)
//       return Alert.alert("Error", "Enter a valid phone number");
//     setSendingOtp(true);
//     try {
//       const res = await sendPosterPhoneOtp(profile.phone);
//       if (res.status === "SUCCESS") {
//         setOtpSessionId(res.data.sessionId);
//         Alert.alert("OTP Sent", res.data.message || "OTP sent successfully");
//       } else {
//         Alert.alert("Error", res.message || "Failed to send OTP");
//       }
//     } catch (err) {
//       console.error("Send OTP Error:", err);
//       Alert.alert("Error", "Failed to send OTP");
//     } finally {
//       setSendingOtp(false);
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (!otpSessionId || !otp) return Alert.alert("Error", "Enter OTP first");
//     setVerifyingOtp(true);
//     try {
//       const res = await verifyPosterPhoneOtp(otpSessionId, otp);
//       if (res.status === "SUCCESS") {
//         Alert.alert("Success", res.message || "Phone verified successfully");
//         setProfile((prev) => ({ ...prev, isPhoneVerified: true }));
//       } else {
//         Alert.alert("Error", res.message || "OTP verification failed");
//       }
//     } catch (err) {
//       console.error("Verify OTP Error:", err);
//       Alert.alert("Error", "OTP verification failed");
//     } finally {
//       setVerifyingOtp(false);
//     }
//   };

//   if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.label}>Email</Text>
//       <TextInput
//         style={[styles.input, { backgroundColor: "#eee" }]}
//         value={profile.email}
//         editable={false}
//       />

//       <Text style={styles.label}>Name</Text>
//       <TextInput
//         style={styles.input}
//         value={profile.name}
//         onChangeText={(text) => setProfile({ ...profile, name: text })}
//         placeholder="Enter your name"
//       />

//       <Text style={styles.label}>Phone</Text>
//       <TextInput
//         style={styles.input}
//         value={profile.phone}
//         onChangeText={(text) => {
//           // Auto-prefix with +91 if missing
//           let newPhone = text.startsWith("+91") ? text : `+91${text.replace(/^(\+91)?/, "")}`;
//           setProfile({ ...profile, phone: newPhone });
//         }}
//         placeholder="+919876543210"
//         keyboardType="phone-pad"
//       />

//       <Text style={styles.label}>About</Text>
//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         value={profile.about}
//         onChangeText={(text) => setProfile({ ...profile, about: text })}
//         multiline
//         placeholder="Tell something about yourself"
//       />

//       <TouchableOpacity
//         style={styles.button}
//         onPress={handleSave}
//         disabled={saving}
//       >
//         <Text style={styles.buttonText}>
//           {saving ? "Saving..." : "Save Profile"}
//         </Text>
//       </TouchableOpacity>

//       {!profile.isPhoneVerified && profile.phone ? (
//         <>
//           <TouchableOpacity
//             style={[styles.button, { backgroundColor: "#007bff" }]}
//             onPress={handleSendOtp}
//             disabled={sendingOtp}
//           >
//             <Text style={styles.buttonText}>
//               {sendingOtp ? "Sending OTP..." : "Send OTP"}
//             </Text>
//           </TouchableOpacity>

//           {otpSessionId && (
//             <>
//               <TextInput
//                 style={styles.input}
//                 value={otp}
//                 onChangeText={setOtp}
//                 placeholder="Enter OTP"
//                 keyboardType="number-pad"
//               />
//               <TouchableOpacity
//                 style={[styles.button, { backgroundColor: "#28a745" }]}
//                 onPress={handleVerifyOtp}
//                 disabled={verifyingOtp}
//               >
//                 <Text style={styles.buttonText}>
//                   {verifyingOtp ? "Verifying..." : "Verify OTP"}
//                 </Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </>
//       ) : (
//         profile.phone && (
//           <Text style={{ color: "green", marginTop: 10 }}>
//             Phone Verified ✅
//           </Text>
//         )
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#fff", flex: 1 },
//   label: { fontWeight: "bold", marginTop: 10 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//     padding: 10,
//     marginTop: 5,
//   },
//   button: {
//     backgroundColor: "#ff6b6b",
//     padding: 15,
//     borderRadius: 5,
//     marginTop: 15,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "bold" },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   fetchPosterProfile,
//   updatePosterProfile,
//   sendPosterPhoneOtp,
//   verifyPosterPhoneOtp,
// } from "../api/poster";

// export default function PosterProfileScreen() {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [sendingOtp, setSendingOtp] = useState(false);
//   const [verifyingOtp, setVerifyingOtp] = useState(false);

//   const [profile, setProfile] = useState({
//     Name: "",
//     email: "",
//     phone: "+91",
//     about: "",
//     isPhoneVerified: false,
//   });

//   const [otp, setOtp] = useState("");
//   const [otpSessionId, setOtpSessionId] = useState(null);

//   // Fetch existing profile on mount
//   const loadProfile = async () => {
//     setLoading(true);
//     try {
//       const data = await fetchPosterProfile();
//       setProfile({
//         Name: data.Name || "",
//         email: data.email || "",
//         phone: data.phone?.startsWith("+91")
//           ? data.phone
//           : `+91${data.phone || ""}`,
//         about: data.about || "",
//         isPhoneVerified: data.isPhoneVerified || false,
//       });
//     } catch (err) {
//       console.error("❌ Fetch Profile Error:", err);

//       // Handle new user (no profile yet)
//       if (err.response?.data?.details?.message === "No Data") {
//         const token = await AsyncStorage.getItem("authToken");
//         let email = "";
//         if (token) {
//           try {
//             const payload = JSON.parse(atob(token.split(".")[1]));
//             email = payload.email || "";
//           } catch {}
//         }
//         setProfile({
//           Name: "",
//           email,
//           phone: "+91",
//           about: "",
//           isPhoneVerified: false,
//         });
//       } else {
//         Alert.alert("Error", "Failed to load profile");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   // Save or update profile
//   const handleSave = async () => {
//     if (!profile.Name.trim()) {
//       return Alert.alert("Error", "Name is required");
//     }
//     if (!profile.phone || profile.phone.length < 10) {
//       return Alert.alert("Error", "Valid phone number is required");
//     }

//     setSaving(true);
//     try {
//       const payload = {
//         Name: profile.Name.trim(), // Backend expects capital N
//         phone: profile.phone.trim(),
//         about: profile.about.trim(),
//       };

//       const res = await updatePosterProfile(payload);

//       if (res?.status === "ERROR") {
//         Alert.alert("Error", res.message || "Failed to update profile");
//       } else {
//         Alert.alert("Success", "Profile saved successfully");
//         setProfile((prev) => ({
//           ...prev,
//           isPhoneVerified: false,
//         }));
//       }
//     } catch (err) {
//       console.error("❌ updatePosterProfile Error:", err.response?.data || err);
//       const msg =
//         err.response?.data?.details?.Name ||
//         err.response?.data?.details?.phone ||
//         "Failed to update profile";
//       Alert.alert("Error", msg);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const handleSendOtp = async () => {
//     if (!profile.phone || profile.phone.length < 10)
//       return Alert.alert("Error", "Enter a valid phone number");

//     setSendingOtp(true);
//     try {
//       const res = await sendPosterPhoneOtp(profile.phone);
//       if (res.status === "SUCCESS") {
//         setOtpSessionId(res.data.sessionId);
//         Alert.alert("OTP Sent", res.data.message || "OTP sent successfully");
//       } else {
//         Alert.alert("Error", res.message || "Failed to send OTP");
//       }
//     } catch (err) {
//       console.error("Send OTP Error:", err);
//       Alert.alert("Error", "Failed to send OTP");
//     } finally {
//       setSendingOtp(false);
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (!otpSessionId || !otp) {
//       return Alert.alert("Error", "Enter OTP first");
//     }

//     setVerifyingOtp(true);
//     try {
//       const res = await verifyPosterPhoneOtp(otpSessionId, otp);
//       if (res.status === "SUCCESS") {
//         Alert.alert("Success", "Phone verified successfully");
//         setProfile((prev) => ({ ...prev, isPhoneVerified: true }));
//       } else {
//         Alert.alert("Error", res.message || "OTP verification failed");
//       }
//     } catch (err) {
//       console.error("Verify OTP Error:", err);
//       Alert.alert("Error", "OTP verification failed");
//     } finally {
//       setVerifyingOtp(false);
//     }
//   };

//   if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.label}>Email</Text>
//       <TextInput
//         style={[styles.input, { backgroundColor: "#eee" }]}
//         value={profile.email}
//         editable={false}
//       />

//       <Text style={styles.label}>Name</Text>
//       <TextInput
//         style={styles.input}
//         value={profile.Name}
//         onChangeText={(text) => setProfile({ ...profile, Name: text })}
//         placeholder="Enter your name"
//       />

//       <Text style={styles.label}>Phone</Text>
//       <TextInput
//         style={styles.input}
//         value={profile.phone}
//         onChangeText={(text) => {
//           let newPhone = text.startsWith("+91")
//             ? text
//             : `+91${text.replace(/^(\+91)?/, "")}`;
//           setProfile({ ...profile, phone: newPhone });
//         }}
//         keyboardType="phone-pad"
//         placeholder="+919876543210"
//       />

//       <Text style={styles.label}>About</Text>
//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         value={profile.about}
//         onChangeText={(text) => setProfile({ ...profile, about: text })}
//         multiline
//         placeholder="Tell something about yourself"
//       />

//       <TouchableOpacity
//         style={styles.button}
//         onPress={handleSave}
//         disabled={saving}
//       >
//         <Text style={styles.buttonText}>
//           {saving ? "Saving..." : "Save Profile"}
//         </Text>
//       </TouchableOpacity>

//       {!profile.isPhoneVerified && profile.phone ? (
//         <>
//           <TouchableOpacity
//             style={[styles.button, { backgroundColor: "#007bff" }]}
//             onPress={handleSendOtp}
//             disabled={sendingOtp}
//           >
//             <Text style={styles.buttonText}>
//               {sendingOtp ? "Sending OTP..." : "Send OTP"}
//             </Text>
//           </TouchableOpacity>

//           {otpSessionId && (
//             <>
//               <TextInput
//                 style={styles.input}
//                 value={otp}
//                 onChangeText={setOtp}
//                 placeholder="Enter OTP"
//                 keyboardType="number-pad"
//               />
//               <TouchableOpacity
//                 style={[styles.button, { backgroundColor: "#28a745" }]}
//                 onPress={handleVerifyOtp}
//                 disabled={verifyingOtp}
//               >
//                 <Text style={styles.buttonText}>
//                   {verifyingOtp ? "Verifying..." : "Verify OTP"}
//                 </Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </>
//       ) : (
//         profile.phone && (
//           <Text style={{ color: "green", marginTop: 10 }}>
//             Phone Verified ✅
//           </Text>
//         )
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#fff", flex: 1 },
//   label: { fontWeight: "bold", marginTop: 10 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//     padding: 10,
//     marginTop: 5,
//   },
//   button: {
//     backgroundColor: "#ff6b6b",
//     padding: 15,
//     borderRadius: 5,
//     marginTop: 15,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "bold" },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   fetchPosterProfile,
//   updatePosterProfile,
//   sendPosterPhoneOtp,
//   verifyPosterPhoneOtp,
// } from "../api/poster";

// export default function PosterProfileScreen({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [sendingOtp, setSendingOtp] = useState(false);
//   const [verifyingOtp, setVerifyingOtp] = useState(false);

//   const [profile, setProfile] = useState({
//     Name: "",
//     email: "",
//     phone: "+91",
//     about: "",
//     isPhoneVerified: false,
//   });

//   const [otp, setOtp] = useState("");
//   const [otpSessionId, setOtpSessionId] = useState(null);

//   // Fetch existing profile
//   const loadProfile = async () => {
//     setLoading(true);
//     try {
//       const data = await fetchPosterProfile();
//       setProfile({
//         Name: data.Name || "",
//         email: data.email || "",
//         phone: data.phone?.startsWith("+91")
//           ? data.phone
//           : `+91${data.phone || ""}`,
//         about: data.about || "",
//         isPhoneVerified: data.isPhoneVerified || false,
//       });
//     } catch (err) {
//       console.error("❌ Fetch Profile Error:", err);

//       // Handle new user
//       if (err.response?.data?.details?.message === "No Data") {
//         const token = await AsyncStorage.getItem("authToken");
//         let email = "";
//         if (token) {
//           try {
//             const payload = JSON.parse(atob(token.split(".")[1]));
//             email = payload.email || "";
//           } catch {}
//         }
//         setProfile({
//           Name: "",
//           email,
//           phone: "+91",
//           about: "",
//           isPhoneVerified: false,
//         });
//       } else {
//         Alert.alert("Error", "Failed to load profile");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   // Save profile
//   const handleSave = async () => {
//     if (!profile.Name.trim()) {
//       return Alert.alert("Error", "Name is required");
//     }
//     if (!profile.phone || profile.phone.length < 10) {
//       return Alert.alert("Error", "Valid phone number is required");
//     }

//     setSaving(true);
//     try {
//       const payload = {
//         Name: profile.Name.trim(),
//         phone: profile.phone.trim(),
//         about: profile.about.trim(),
//       };

//       const res = await updatePosterProfile(payload);

//       if (res?.status === "ERROR") {
//         Alert.alert("Error", res.message || "Failed to update profile");
//       } else {
//         Alert.alert("Success", "Profile saved successfully");
//       }
//     } catch (err) {
//       console.error("❌ updatePosterProfile Error:", err);
//       const msg =
//         err.response?.data?.details?.Name ||
//         err.response?.data?.details?.phone ||
//         "Failed to update profile";
//       Alert.alert("Error", msg);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const handleSendOtp = async () => {
//     if (!profile.phone || profile.phone.length < 10)
//       return Alert.alert("Error", "Enter a valid phone number");

//     setSendingOtp(true);
//     try {
//       const res = await sendPosterPhoneOtp(profile.phone);
//       if (res.status === "SUCCESS") {
//         setOtpSessionId(res.data.sessionId);
//         Alert.alert("OTP Sent", res.data.message || "OTP sent successfully");
//       } else {
//         Alert.alert("Error", res.message || "Failed to send OTP");
//       }
//     } catch (err) {
//       console.error("Send OTP Error:", err);
//       Alert.alert("Error", "Failed to send OTP");
//     } finally {
//       setSendingOtp(false);
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (!otpSessionId || !otp) {
//       return Alert.alert("Error", "Enter OTP first");
//     }

//     setVerifyingOtp(true);
//     try {
//       const res = await verifyPosterPhoneOtp(otpSessionId, otp);
//       if (res.status === "SUCCESS") {
//         Alert.alert("Success", "Phone verified successfully");
//         setProfile((prev) => ({ ...prev, isPhoneVerified: true }));
//       } else {
//         Alert.alert("Error", res.message || "OTP verification failed");
//       }
//     } catch (err) {
//       console.error("Verify OTP Error:", err);
//       Alert.alert("Error", "OTP verification failed");
//     } finally {
//       setVerifyingOtp(false);
//     }
//   };

//   if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

//   return (
//     <View style={styles.wrapper}>
//       {/* Header with back button */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.navigate("PosterDashboard")}
//         >
//           <Ionicons name="arrow-back" size={24} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Poster Profile</Text>
//       </View>

//       <ScrollView style={styles.container}>
//         <Text style={styles.label}>Email</Text>
//         <TextInput
//           style={[styles.input, { backgroundColor: "#f2f2f2" }]}
//           value={profile.email}
//           editable={false}
//         />

//         <Text style={styles.label}>Full Name</Text>
//         <TextInput
//           style={styles.input}
//           value={profile.Name}
//           onChangeText={(text) => setProfile({ ...profile, Name: text })}
//           placeholder="Enter your full name"
//         />

//         <Text style={styles.label}>Phone Number</Text>
//         <TextInput
//           style={styles.input}
//           value={profile.phone}
//           onChangeText={(text) => {
//             let newPhone = text.startsWith("+91")
//               ? text
//               : `+91${text.replace(/^(\+91)?/, "")}`;
//             setProfile({ ...profile, phone: newPhone });
//           }}
//           keyboardType="phone-pad"
//           placeholder="+919876543210"
//         />

//         <Text style={styles.label}>About You</Text>
//         <TextInput
//           style={[styles.input, { height: 90, textAlignVertical: "top" }]}
//           value={profile.about}
//           onChangeText={(text) => setProfile({ ...profile, about: text })}
//           multiline
//           placeholder="Write something about yourself..."
//         />

//         {/* Save Profile */}
//         <TouchableOpacity
//           style={[styles.button, { backgroundColor: "#ff6b6b" }]}
//           onPress={handleSave}
//           disabled={saving}
//         >
//           <Text style={styles.buttonText}>
//             {saving ? "Saving..." : "Save Profile"}
//           </Text>
//         </TouchableOpacity>

//         {/* OTP Section */}
//         {!profile.isPhoneVerified && profile.phone ? (
//           <View style={styles.otpSection}>
//             <TouchableOpacity
//               style={[styles.button, { backgroundColor: "#007bff" }]}
//               onPress={handleSendOtp}
//               disabled={sendingOtp}
//             >
//               <Text style={styles.buttonText}>
//                 {sendingOtp ? "Sending OTP..." : "Send OTP"}
//               </Text>
//             </TouchableOpacity>

//             {otpSessionId && (
//               <>
//                 <TextInput
//                   style={styles.input}
//                   value={otp}
//                   onChangeText={setOtp}
//                   placeholder="Enter OTP"
//                   keyboardType="number-pad"
//                 />
//                 <TouchableOpacity
//                   style={[styles.button, { backgroundColor: "#28a745" }]}
//                   onPress={handleVerifyOtp}
//                   disabled={verifyingOtp}
//                 >
//                   <Text style={styles.buttonText}>
//                     {verifyingOtp ? "Verifying..." : "Verify OTP"}
//                   </Text>
//                 </TouchableOpacity>
//               </>
//             )}
//           </View>
//         ) : (
//           profile.phone && (
//             <Text style={styles.verifiedText}>✅ Phone Verified</Text>
//           )
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ddd",
//   },
//   backButton: {
//     marginRight: 10,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   container: {
//     padding: 20,
//   },
//   label: {
//     fontWeight: "600",
//     marginTop: 15,
//     color: "#333",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginTop: 5,
//     fontSize: 15,
//   },
//   button: {
//     borderRadius: 8,
//     paddingVertical: 14,
//     marginTop: 18,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   otpSection: {
//     marginTop: 25,
//   },
//   verifiedText: {
//     color: "green",
//     textAlign: "center",
//     marginTop: 15,
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   fetchPosterProfile,
//   updatePosterProfile,
//   sendPosterPhoneOtp,
//   verifyPosterPhoneOtp,
// } from "../api/poster";

// export default function PosterProfileScreen({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [sendingOtp, setSendingOtp] = useState(false);
//   const [verifyingOtp, setVerifyingOtp] = useState(false);

//   // ---------- PROFILE STATE ----------
//   const [profile, setProfile] = useState({
//     name: "",
//     email: "",
//     phone: "+91",
//     about: "",
//     isPhoneVerified: false,
//   });

//   const [otp, setOtp] = useState("");
//   const [otpSessionId, setOtpSessionId] = useState(null);

//   // ---------- FETCH PROFILE ----------
//   const loadProfile = async () => {
//     setLoading(true);
//     try {
//       const data = await fetchPosterProfile();

//       setProfile({
//         name: data.name || "",
//         email: data.email || "",
//         phone: data.phone?.startsWith("+91")
//           ? data.phone
//           : `+91${data.phone || ""}`,
//         about: data.about || "",
//         isPhoneVerified: data.isPhoneVerified || false,
//       });
//     } catch (err) {
//       console.log("❌ Fetch Error:", err);

//       // --- No profile found (FIRST TIME USER) ---
//       if (err.response?.data?.details?.message === "No Data") {
//         const token = await AsyncStorage.getItem("authToken");
//         let email = "";

//         if (token) {
//           try {
//             const payload = JSON.parse(atob(token.split(".")[1]));
//             email = payload.email || "";
//           } catch {}
//         }

//         setProfile({
//           name: "",
//           email,
//           phone: "+91",
//           about: "",
//           isPhoneVerified: false,
//         });
//       } else {
//         Alert.alert("Error", "Failed to load profile");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   // ---------- SAVE PROFILE ----------
//   const handleSave = async () => {
//     if (!profile.name.trim()) {
//       return Alert.alert("Error", "Name is required");
//     }
//     if (!profile.phone || profile.phone.length < 10) {
//       return Alert.alert("Error", "Valid phone number is required");
//     }

//     const payload = {
//       name: profile.name.trim(),
//       phone: profile.phone.trim(),
//       about: profile.about.trim(),
//     };

//     setSaving(true);
//     try {
//       const res = await updatePosterProfile(payload);

//       if (res?.status === "ERROR") {
//         Alert.alert("Error", res.message || "Failed to update profile");
//       } else {
//         Alert.alert("Success", "Profile saved successfully");
//       }
//     } catch (err) {
//       console.error("❌ Update Error:", err);

//       const msg =
//         err.response?.data?.details?.name ||
//         err.response?.data?.details?.phone ||
//         "Failed to update profile";

//       Alert.alert("Error", msg);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ---------- SEND OTP ----------
//   const handleSendOtp = async () => {
//     if (!profile.phone || profile.phone.length < 10)
//       return Alert.alert("Error", "Enter valid phone number");

//     setSendingOtp(true);
//     try {
//       const res = await sendPosterPhoneOtp(profile.phone);
//       if (res.status === "SUCCESS") {
//         setOtpSessionId(res.data.sessionId);
//         Alert.alert("OTP Sent", res.data.message || "OTP sent successfully");
//       } else {
//         Alert.alert("Error", res.message || "Failed to send OTP");
//       }
//     } catch (err) {
//       console.log("OTP Error:", err);
//       Alert.alert("Error", "Failed to send OTP");
//     } finally {
//       setSendingOtp(false);
//     }
//   };

//   // ---------- VERIFY OTP ----------
//   const handleVerifyOtp = async () => {
//     if (!otpSessionId || !otp)
//       return Alert.alert("Error", "Enter OTP first");

//     setVerifyingOtp(true);
//     try {
//       const res = await verifyPosterPhoneOtp(otpSessionId, otp);

//       if (res.status === "SUCCESS") {
//         Alert.alert("Success", "Phone verified successfully");
//         setProfile(prev => ({ ...prev, isPhoneVerified: true }));
//       } else {
//         Alert.alert("Error", res.message || "OTP verification failed");
//       }
//     } catch (err) {
//       console.log("Verify Error:", err);
//       Alert.alert("Error", "OTP verification failed");
//     } finally {
//       setVerifyingOtp(false);
//     }
//   };

//   if (loading)
//     return <ActivityIndicator size="large" style={{ flex: 1 }} />;

//   return (
//     <View style={styles.wrapper}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.navigate("PosterDashboard")}
//         >
//           <Ionicons name="arrow-back" size={24} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Poster Profile</Text>
//       </View>

//       {/* BODY */}
//       <ScrollView style={styles.container}>
//         {/* EMAIL */}
//         <Text style={styles.label}>Email</Text>
//         <TextInput
//           style={[styles.input, { backgroundColor: "#eee" }]}
//           value={profile.email}
//           editable={false}
//         />

//         {/* NAME */}
//         <Text style={styles.label}>Full Name</Text>
//         <TextInput
//           style={styles.input}
//           value={profile.name}
//           onChangeText={(text) =>
//             setProfile({ ...profile, name: text })
//           }
//           placeholder="Enter your full name"
//         />

//         {/* PHONE */}
//         <Text style={styles.label}>Phone Number</Text>
//         <TextInput
//           style={styles.input}
//           value={profile.phone}
//           onChangeText={(text) => {
//             let p = text.startsWith("+91")
//               ? text
//               : `+91${text.replace(/^(\+91)?/, "")}`;
//             setProfile({ ...profile, phone: p });
//           }}
//           keyboardType="phone-pad"
//         />

//         {/* ABOUT */}
//         <Text style={styles.label}>About You</Text>
//         <TextInput
//           style={[styles.input, { height: 90, textAlignVertical: "top" }]}
//           value={profile.about}
//           onChangeText={(text) =>
//             setProfile({ ...profile, about: text })
//           }
//           multiline
//           placeholder="Say something about yourself..."
//         />

//         {/* SAVE BUTTON */}
//         <TouchableOpacity
//           style={[styles.button, { backgroundColor: "#ff6b6b" }]}
//           onPress={handleSave}
//           disabled={saving}
//         >
//           <Text style={styles.buttonText}>
//             {saving ? "Saving..." : "Save Profile"}
//           </Text>
//         </TouchableOpacity>

//         {/* OTP SECTION */}
//         {!profile.isPhoneVerified ? (
//           <View style={styles.otpSection}>
//             <TouchableOpacity
//               style={[styles.button, { backgroundColor: "#007bff" }]}
//               onPress={handleSendOtp}
//               disabled={sendingOtp}
//             >
//               <Text style={styles.buttonText}>
//                 {sendingOtp ? "Sending OTP..." : "Send OTP"}
//               </Text>
//             </TouchableOpacity>

//             {otpSessionId && (
//               <>
//                 <TextInput
//                   style={styles.input}
//                   value={otp}
//                   onChangeText={setOtp}
//                   placeholder="Enter OTP"
//                   keyboardType="number-pad"
//                 />
//                 <TouchableOpacity
//                   style={[styles.button, { backgroundColor: "#28a745" }]}
//                   onPress={handleVerifyOtp}
//                   disabled={verifyingOtp}
//                 >
//                   <Text style={styles.buttonText}>
//                     {verifyingOtp ? "Verifying..." : "Verify OTP"}
//                   </Text>
//                 </TouchableOpacity>
//               </>
//             )}
//           </View>
//         ) : (
//           <Text style={styles.verifiedText}>✅ Phone Verified</Text>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { flex: 1, backgroundColor: "#fff" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ddd",
//   },
//   backButton: { marginRight: 10 },
//   headerTitle: { fontSize: 18, fontWeight: "bold" },
//   container: { padding: 20 },
//   label: { fontWeight: "600", marginTop: 15 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginTop: 5,
//     fontSize: 15,
//   },
//   button: {
//     borderRadius: 8,
//     paddingVertical: 14,
//     marginTop: 18,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   otpSection: { marginTop: 25 },
//   verifiedText: {
//     color: "green",
//     textAlign: "center",
//     marginTop: 15,
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import {
//   fetchPosterProfile,
//   updatePosterProfile,
//   sendPosterPhoneOtp,
//   verifyPosterPhoneOtp,
// } from "../api/poster";

// export default function PosterProfileScreen({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [sendingOtp, setSendingOtp] = useState(false);
//   const [verifyingOtp, setVerifyingOtp] = useState(false);

//   const [profile, setProfile] = useState({
//     name: "",
//     email: "",
//     phone: "+91",
//     about: "",
//     isPhoneVerified: false,
//   });

//   const [otp, setOtp] = useState("");
//   const [otpSessionId, setOtpSessionId] = useState(null);

//   // =====================================================
//   // 🔹 LOAD PROFILE (Option B backend format)
//   // =====================================================
//   const loadProfile = async () => {
//     setLoading(true);
//     try {
//       const data = await fetchPosterProfile(); // <-- returns Option B format

//       console.log("Fetched backend data:", data);

//       setProfile({
//         name: data.name || "",
//         email: data.email || "",
//         phone: data.phone
//           ? data.phone.startsWith("+91")
//             ? data.phone
//             : `+91${data.phone}`
//           : "+91",
//         about: data.about || "",
//         isPhoneVerified: data.isPhoneVerified || false,
//       });
//     } catch (err) {
//       console.log("❌ Fetch Error:", err);

//       // IF backend sends "No Data"
//       const backendMsg = err?.response?.data?.details?.message;

//       if (backendMsg === "No Data") {
//         // Extract email from token (first login)
//         const token = await AsyncStorage.getItem("authToken");
//         let email = "";

//         if (token) {
//           try {
//             const payload = JSON.parse(atob(token.split(".")[1]));
//             email = payload.email || "";
//           } catch {}
//         }

//         setProfile({
//           name: "",
//           email,
//           phone: "+91",
//           about: "",
//           isPhoneVerified: false,
//         });
//       } else {
//         Alert.alert("Error", "Failed to load profile");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   // =====================================================
//   // 🔹 UPDATE PROFILE (send only changed fields)
//   // =====================================================
//   const handleSave = async () => {
//     if (!profile.name.trim()) {
//       return Alert.alert("Error", "Name is required");
//     }

//     if (!profile.phone || profile.phone.length < 10) {
//       return Alert.alert("Error", "Valid phone number is required");
//     }

//     const payload = {
//       name: profile.name.trim(),
//       phone: profile.phone.trim(),
//       about: profile.about.trim(),
//     };

//     console.log("Sending FINAL payload:", payload);

//     setSaving(true);
//     try {
//       const res = await updatePosterProfile(payload);

//       Alert.alert("Success", "Profile updated successfully");
//     } catch (err) {
//       console.log("❌ Update Error:", err);

//       const msg =
//         err.response?.data?.details?.name ||
//         err.response?.data?.details?.phone ||
//         err.response?.data?.details?.about ||
//         "Failed to update profile";

//       Alert.alert("Error", msg);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // =====================================================
//   // 🔹 SEND OTP
//   // =====================================================
//   const handleSendOtp = async () => {
//     if (!profile.phone || profile.phone.length < 10)
//       return Alert.alert("Error", "Enter valid phone number");

//     setSendingOtp(true);
//     try {
//       const res = await sendPosterPhoneOtp(profile.phone);
//       setOtpSessionId(res.data.sessionId);

//       Alert.alert("OTP Sent", res.data.message);
//     } catch (err) {
//       console.log("OTP error:", err);
//       Alert.alert("Error", "Failed to send OTP");
//     } finally {
//       setSendingOtp(false);
//     }
//   };

//   // =====================================================
//   // 🔹 VERIFY OTP
//   // =====================================================
//   const handleVerifyOtp = async () => {
//     if (!otpSessionId || !otp) return Alert.alert("Enter OTP");

//     setVerifyingOtp(true);
//     try {
//       const res = await verifyPosterPhoneOtp(otpSessionId, otp);

//       if (res.status === "SUCCESS") {
//         Alert.alert("Success", "Phone Verified");
//         setProfile((prev) => ({ ...prev, isPhoneVerified: true }));
//       } else {
//         Alert.alert("Error", "Verification failed");
//       }
//     } catch (err) {
//       Alert.alert("Error", "Verification failed");
//     } finally {
//       setVerifyingOtp(false);
//     }
//   };

//   // =====================================================
//   // 🔹 UI
//   // =====================================================
//   if (loading) {
//     return <ActivityIndicator size="large" style={{ flex: 1 }} />;
//   }

//   return (
//     <View style={styles.wrapper}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.navigate("PosterDashboard")}
//         >
//           <Ionicons name="arrow-back" size={24} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Poster Profile</Text>
//       </View>

//       <ScrollView style={styles.container}>
//         {/* EMAIL */}
//         <Text style={styles.label}>Email</Text>
//         <TextInput
//           style={[styles.input, { backgroundColor: "#eee" }]}
//           value={profile.email}
//           editable={false}
//         />

//         {/* NAME */}
//         <Text style={styles.label}>Full Name</Text>
//         <TextInput
//           style={styles.input}
//           value={profile.name}
//           onChangeText={(text) => setProfile({ ...profile, name: text })}
//         />

//         {/* PHONE */}
//         <Text style={styles.label}>Phone Number</Text>
//         <TextInput
//           style={styles.input}
//           value={profile.phone}
//           onChangeText={(text) => {
//             let p = text.startsWith("+91")
//               ? text
//               : `+91${text.replace(/^(\+91)?/, "")}`;
//             setProfile({ ...profile, phone: p });
//           }}
//           keyboardType="phone-pad"
//         />

//         {/* ABOUT */}
//         <Text style={styles.label}>About You</Text>
//         <TextInput
//           style={[styles.input, { height: 90 }]}
//           value={profile.about}
//           multiline
//           onChangeText={(t) => setProfile({ ...profile, about: t })}
//         />

//         {/* SAVE BUTTON */}
//         <TouchableOpacity
//           style={[styles.button, { backgroundColor: "#ff6b6b" }]}
//           onPress={handleSave}
//           disabled={saving}
//         >
//           <Text style={styles.buttonText}>
//             {saving ? "Saving..." : "Save Profile"}
//           </Text>
//         </TouchableOpacity>

//         {/* OTP SECTION */}
//         {!profile.isPhoneVerified ? (
//           <View style={{ marginTop: 25 }}>
//             <TouchableOpacity
//               style={[styles.button, { backgroundColor: "#007bff" }]}
//               onPress={handleSendOtp}
//               disabled={sendingOtp}
//             >
//               <Text style={styles.buttonText}>
//                 {sendingOtp ? "Sending OTP..." : "Send OTP"}
//               </Text>
//             </TouchableOpacity>

//             {otpSessionId && (
//               <>
//                 <TextInput
//                   style={styles.input}
//                   value={otp}
//                   onChangeText={setOtp}
//                   placeholder="Enter OTP"
//                 />

//                 <TouchableOpacity
//                   style={[styles.button, { backgroundColor: "#28a745" }]}
//                   onPress={handleVerifyOtp}
//                   disabled={verifyingOtp}
//                 >
//                   <Text style={styles.buttonText}>
//                     {verifyingOtp ? "Verifying..." : "Verify OTP"}
//                   </Text>
//                 </TouchableOpacity>
//               </>
//             )}
//           </View>
//         ) : (
//           <Text style={styles.verifiedText}>✅ Phone Verified</Text>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { flex: 1, backgroundColor: "#fff" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ddd",
//   },
//   backButton: { marginRight: 10 },
//   headerTitle: { fontSize: 18, fontWeight: "bold" },
//   container: { padding: 20 },
//   label: { fontWeight: "600", marginTop: 15 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginTop: 5,
//     fontSize: 15,
//   },
//   button: {
//     borderRadius: 8,
//     paddingVertical: 14,
//     marginTop: 18,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   verifiedText: {
//     color: "green",
//     textAlign: "center",
//     marginTop: 15,
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  fetchPosterProfile,
  updatePosterProfile,
  sendPosterPhoneOtp,
  verifyPosterPhoneOtp,
} from "../api/poster";

export default function PosterProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "+91",
    about: "",
    isPhoneVerified: false,
  });

  const [otp, setOtp] = useState("");
  const [otpSessionId, setOtpSessionId] = useState(null);

  // =====================================================
  // 🔹 LOAD PROFILE (Option B backend format)
  // =====================================================
  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetchPosterProfile();

      const data = res?.data || res || {}; // <-- backend sometimes sends { data: {...} }

      console.log("Fetched backend data:", data);

      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone
          ? data.phone.startsWith("+91")
            ? data.phone
            : `+91${data.phone}`
          : "+91",
        about: data.about || "",
        isPhoneVerified: data.isPhoneVerified || false,
      });
    } catch (err) {
      console.log("❌ Fetch Error:", err);

      const backendMsg = err?.response?.data?.details?.message;

      if (backendMsg === "No Data") {
        // Extract email from token
        const token = await AsyncStorage.getItem("authToken");
        let email = "";

        if (token) {
          try {
            const payload = JSON.parse(
              Buffer.from(token.split(".")[1], "base64").toString()
            );
            email = payload.email || "";
          } catch {}
        }

        setProfile({
          name: "",
          email: email,
          phone: "+91",
          about: "",
          isPhoneVerified: false,
        });
      } else {
        Alert.alert("Error", "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // =====================================================
  // 🔹 UPDATE PROFILE
  // =====================================================
  const handleSave = async () => {
    if (!profile.name.trim()) {
      return Alert.alert("Error", "Name is required");
    }

    if (!profile.phone || profile.phone.length < 10) {
      return Alert.alert("Error", "Valid phone number is required");
    }

    // Final payload
    const payload = {
      Name: profile.name.trim(),
      phone: profile.phone.trim(),
      about: profile.about.trim(),
    };

    console.log("Sending FINAL payload:", payload);

    setSaving(true);
    try {
      await updatePosterProfile(payload);
      Alert.alert("Success", "Profile updated successfully");
    } catch (err) {
      console.log("❌ Update Error:", err);

      const msg =
        err.response?.data?.details?.name ||
        err.response?.data?.details?.phone ||
        err.response?.data?.details?.about ||
        "Failed to update profile";

      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // 🔹 SEND OTP
  // =====================================================
  const handleSendOtp = async () => {
    if (!profile.phone || profile.phone.length < 10)
      return Alert.alert("Error", "Enter valid phone number");

    setSendingOtp(true);
    try {
      const res = await sendPosterPhoneOtp(profile.phone);

      setOtpSessionId(res.data.sessionId);
      Alert.alert("OTP Sent", res.data.message);
    } catch (err) {
      console.log("OTP error:", err);
      Alert.alert("Error", "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // =====================================================
  // 🔹 VERIFY OTP
  // =====================================================
  const handleVerifyOtp = async () => {
    if (!otpSessionId || !otp) return Alert.alert("Enter OTP");

    setVerifyingOtp(true);
    try {
      const res = await verifyPosterPhoneOtp(otpSessionId, otp);

      if (res.status === "SUCCESS") {
        Alert.alert("Success", "Phone Verified");
        setProfile((prev) => ({ ...prev, isPhoneVerified: true }));
      } else {
        Alert.alert("Error", "Verification failed");
      }
    } catch (err) {
      Alert.alert("Error", "Verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // =====================================================
  // 🔹 UI
  // =====================================================
  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.wrapper}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Poster Profile</Text>
      </View>

      <ScrollView style={styles.container}>
        {/* EMAIL */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: "#eee" }]}
          value={profile.email}
          editable={false}
        />

        {/* NAME */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={profile.name}
          onChangeText={(text) => setProfile({ ...profile, name: text })}
        />

        {/* PHONE */}
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={profile.phone}
          onChangeText={(text) => {
            const clean = text.replace(/^\+91/, "");
            setProfile({ ...profile, phone: `+91${clean}` });
          }}
          keyboardType="phone-pad"
        />

        {/* ABOUT */}
        <Text style={styles.label}>About You</Text>
        <TextInput
          style={[styles.input, { height: 90 }]}
          value={profile.about}
          multiline
          onChangeText={(t) => setProfile({ ...profile, about: t })}
        />

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#ff6b6b" }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Saving..." : "Save Profile"}
          </Text>
        </TouchableOpacity>

        {/* OTP SECTION */}
        {!profile.isPhoneVerified ? (
          <View style={{ marginTop: 25 }}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#007bff" }]}
              onPress={handleSendOtp}
              disabled={sendingOtp}
            >
              <Text style={styles.buttonText}>
                {sendingOtp ? "Sending OTP..." : "Send OTP"}
              </Text>
            </TouchableOpacity>

            {otpSessionId && (
              <>
                <TextInput
                  style={styles.input}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter OTP"
                />

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#28a745" }]}
                  onPress={handleVerifyOtp}
                  disabled={verifyingOtp}
                >
                  <Text style={styles.buttonText}>
                    {verifyingOtp ? "Verifying..." : "Verify OTP"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <Text style={styles.verifiedText}>✅ Phone Verified</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: { marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  container: { padding: 20 },
  label: { fontWeight: "600", marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    fontSize: 15,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 18,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  verifiedText: {
    color: "green",
    textAlign: "center",
    marginTop: 15,
    fontSize: 16,
    fontWeight: "bold",
  },
});

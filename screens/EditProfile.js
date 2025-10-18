// import React, { useEffect, useState, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   Platform,
//   UIManager,
//   LayoutAnimation,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import {
//   fetchDoerProfile,
//   updateDoerProfile,
//   sendPhoneOtp,
//   verifyPhoneOtp,
// } from "../api/doer";

// // Enable Layout Animation for Android
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation, route }) {
//   const { isNewUser = false, onProfileSaved } = route.params || {};

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]);
//   const [skillInput, setSkillInput] = useState("");

//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [profileSaved, setProfileSaved] = useState(false);
//   const [sessionId, setSessionId] = useState("");

//   // Header
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={24} color="#000" />
//         </TouchableOpacity>
//       ),
//       headerRight: () => (
//         <TouchableOpacity onPress={logoutUser} style={{ marginRight: 15 }}>
//           <Ionicons name="log-out-outline" size={24} color="red" />
//         </TouchableOpacity>
//       ),
//       title: isNewUser ? "Complete Profile" : "Edit Profile",
//     });
//   }, [navigation]);

//   // Fetch Profile
//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         const res = await fetchDoerProfile();
//         if (res?.status === "SUCCESS" && res.data) {
//           const p = res.data;
//           setName(p.fullName || "");
//           setEmail(p.email || "");
//           setBio(p.bio || "");
//           setPhone(p.phone || "");
//           setSkills(p.skills || []);
//           setPhoneVerified(!!p.phoneVerified);
//         } else {
//           Alert.alert("Error", res?.message || "Failed to fetch profile");
//         }
//       } catch (err) {
//         console.error("Profile Fetch Error:", err);
//         Alert.alert("Error", "Unable to load profile data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadProfile();
//   }, []);

//   // Logout
//   const logoutUser = async () => {
//     await AsyncStorage.multiRemove([
//       "authToken",
//       "userRole",
//       "doerProfile",
//       "userEmail",
//     ]);
//     navigation.replace("LoginPage");
//   };

//   // Save Profile
//   const submitProfile = async () => {
//     if (!name) return Alert.alert("Validation Error", "Name is required");
//     if (!phone)
//       return Alert.alert("Validation Error", "Phone number is required");

//     try {
//       setSaving(true);
//       const payload = { name, email, bio, phone, skills };
//       const res = await updateDoerProfile(payload);

//       if (res.status === "SUCCESS") {
//         Alert.alert(
//           "✅ Profile Saved",
//           "Now please verify your phone number using the 'Send OTP' button."
//         );
//         await AsyncStorage.setItem("doerProfile", JSON.stringify(payload));
//         setProfileSaved(true);
//         if (onProfileSaved) onProfileSaved();
//       } else {
//         Alert.alert("Error", res.message || "Update failed");
//       }
//     } catch (err) {
//       console.error("Update Error:", err);
//       Alert.alert("Error", "Update failed. Try again later.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const handleSendOtp = async () => {
//     if (!profileSaved)
//       return Alert.alert(
//         "Save Profile First",
//         "Please save your profile before verifying phone."
//       );

//     try {
//       const res = await sendPhoneOtp();
//       if (res?.status === "SUCCESS") {
//         setSessionId(res?.data?.sessionId || "");
//         setOtpSent(true);
//         Alert.alert("OTP Sent", "Check your registered phone for the OTP.");
//       } else {
//         Alert.alert("Error", res?.message || "Failed to send OTP");
//       }
//     } catch (err) {
//       console.error("OTP Send Error:", err);
//       Alert.alert("Error", "Could not send OTP");
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (!otp) return Alert.alert("Enter OTP first");
//     if (!sessionId)
//       return Alert.alert("Error", "No session ID found. Please resend OTP.");

//     try {
//       const res = await verifyPhoneOtp(sessionId, otp);
//       if (res?.status === "SUCCESS") {
//         Alert.alert("✅ Verified", "Phone verified successfully!");
//         setPhoneVerified(true);
//         setOtpSent(false);
//         if (isNewUser) navigation.replace("Dashboard");
//       } else {
//         Alert.alert("Error", res?.message || "Invalid OTP");
//       }
//     } catch (err) {
//       console.error("OTP Verify Error:", err);
//       Alert.alert("Error", "Verification failed");
//     }
//   };

//   // Skills
//   const addSkill = () => {
//     if (skillInput.trim() && !skills.includes(skillInput.trim())) {
//       LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//       setSkills([...skills, skillInput.trim()]);
//       setSkillInput("");
//     }
//   };
//   const removeSkill = (skill) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setSkills(skills.filter((s) => s !== skill));
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#4a90e2" />
//         <Text style={{ marginTop: 10 }}>Loading profile...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <TextInput
//         style={styles.input}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//       />
//       <TextInput
//         style={[styles.input, { backgroundColor: "#f3f4f6" }]}
//         placeholder="Email"
//         value={email}
//         editable={false}
//       />
//       <TextInput
//         style={[styles.input, { height: 90 }]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Phone Number"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//         editable={!phoneVerified}
//       />

//       {!phoneVerified && !otpSent && (
//         <TouchableOpacity
//           style={[
//             styles.btnSmall,
//             { backgroundColor: profileSaved ? "#2196f3" : "gray" },
//           ]}
//           onPress={handleSendOtp}
//           disabled={!profileSaved}
//         >
//           <Text style={styles.btnSmallText}>
//             {profileSaved ? "Send OTP to Verify Phone" : "Save Profile First"}
//           </Text>
//         </TouchableOpacity>
//       )}

//       {otpSent && (
//         <View>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter OTP"
//             keyboardType="numeric"
//             value={otp}
//             onChangeText={setOtp}
//           />
//           <TouchableOpacity style={styles.btnSmall} onPress={handleVerifyOtp}>
//             <Text style={styles.btnSmallText}>Verify OTP</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {phoneVerified && (
//         <Text style={{ color: "green", fontWeight: "700" }}>
//           ✅ Phone Verified
//         </Text>
//       )}

//       <Text style={{ fontWeight: "700", marginBottom: 5, marginTop: 15 }}>
//         Skills:
//       </Text>
//       {skills.map((skill, index) => (
//         <View key={index} style={styles.skillItem}>
//           <Text>{skill}</Text>
//           <TouchableOpacity onPress={() => removeSkill(skill)}>
//             <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
//           </TouchableOpacity>
//         </View>
//       ))}

//       <View style={{ flexDirection: "row", marginBottom: 15 }}>
//         <TextInput
//           style={[styles.input, { flex: 1 }]}
//           placeholder="Add Skill"
//           value={skillInput}
//           onChangeText={setSkillInput}
//         />
//         <TouchableOpacity
//           style={[styles.btn, { paddingHorizontal: 12 }]}
//           onPress={addSkill}
//         >
//           <Text style={styles.btnText}>Add</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity
//         style={styles.btn}
//         onPress={submitProfile}
//         disabled={saving}
//       >
//         <Text style={styles.btnText}>
//           {saving
//             ? "Saving..."
//             : isNewUser
//             ? "Save & Continue"
//             : "Save Changes"}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, paddingBottom: 50 },
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
//     justifyContent: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
//   btnSmall: {
//     padding: 8,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 8,
//   },
//   btnSmallText: { color: "#fff", fontWeight: "700" },
//   skillItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 8,
//     backgroundColor: "#f1f5f9",
//     borderRadius: 8,
//     marginBottom: 5,
//   },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
// });

// import React, { useEffect, useState, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   Platform,
//   UIManager,
//   LayoutAnimation,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import {
//   fetchDoerProfile,
//   updateDoerProfile,
//   sendPhoneOtp,
//   verifyPhoneOtp,
// } from "../api/doer";

// // Enable Layout Animation for Android
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation, route }) {
//   const { isNewUser = false, onProfileSaved } = route.params || {};

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]);
//   const [skillInput, setSkillInput] = useState("");

//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [profileSaved, setProfileSaved] = useState(false);
//   const [sessionId, setSessionId] = useState("");

//   // Header
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={24} color="#000" />
//         </TouchableOpacity>
//       ),
//       headerRight: () => (
//         <TouchableOpacity onPress={logoutUser} style={{ marginRight: 15 }}>
//           <Ionicons name="log-out-outline" size={24} color="red" />
//         </TouchableOpacity>
//       ),
//       title: isNewUser ? "Complete Profile" : "Edit Profile",
//     });
//   }, [navigation]);

//   // Fetch Profile
//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         const res = await fetchDoerProfile();
//         if (res?.status === "SUCCESS" && res.data) {
//           const p = res.data;
//           setName(p.fullName || "");
//           setEmail(p.email || "");
//           setBio(p.bio || "");
//           setPhone(p.phone || "");
//           setSkills(p.skills || []);
//           setPhoneVerified(!!p.phoneVerified);
//         } else {
//           Alert.alert("Error", res?.message || "Failed to fetch profile");
//         }
//       } catch (err) {
//         console.error("Profile Fetch Error:", err);
//         Alert.alert("Error", "Unable to load profile data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadProfile();
//   }, []);

//   // Logout
//   const logoutUser = async () => {
//     await AsyncStorage.multiRemove([
//       "authToken",
//       "userRole",
//       "doerProfile",
//       "userEmail",
//     ]);
//     navigation.replace("LoginPage");
//   };

//   // Save Profile
//   const submitProfile = async () => {
//     if (!name) return Alert.alert("Validation Error", "Name is required");
//     if (!phone)
//       return Alert.alert("Validation Error", "Phone number is required");

//     try {
//       setSaving(true);
//       const payload = { name, email, bio, phone, skills };
//       const res = await updateDoerProfile(payload);

//       if (res.status === "SUCCESS") {
//         Alert.alert(
//           "✅ Profile Saved",
//           "Now please verify your phone number using the 'Send OTP' button."
//         );
//         await AsyncStorage.setItem("doerProfile", JSON.stringify(payload));
//         setProfileSaved(true);
//         if (onProfileSaved) onProfileSaved();
//       } else {
//         Alert.alert("Error", res.message || "Update failed");
//       }
//     } catch (err) {
//       console.error("Update Error:", err);
//       Alert.alert("Error", "Update failed. Try again later.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const handleSendOtp = async () => {
//     if (!profileSaved)
//       return Alert.alert(
//         "Save Profile First",
//         "Please save your profile before verifying phone."
//       );

//     try {
//       const res = await sendPhoneOtp();
//       if (res?.status === "SUCCESS") {
//         setSessionId(res?.data?.sessionId || "");
//         setOtpSent(true);
//         Alert.alert("OTP Sent", "Check your registered phone for the OTP.");
//       } else {
//         Alert.alert("Error", res?.message || "Failed to send OTP");
//       }
//     } catch (err) {
//       console.error("OTP Send Error:", err);
//       Alert.alert("Error", "Could not send OTP");
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (!otp) return Alert.alert("Enter OTP first");
//     if (!sessionId)
//       return Alert.alert("Error", "No session ID found. Please resend OTP.");

//     try {
//       const res = await verifyPhoneOtp(sessionId, otp);
//       if (res?.status === "SUCCESS") {
//         Alert.alert("✅ Verified", "Phone verified successfully!");
//         setPhoneVerified(true);
//         setOtpSent(false);
//         if (isNewUser) navigation.replace("Dashboard");
//       } else {
//         Alert.alert("Error", res?.message || "Invalid OTP");
//       }
//     } catch (err) {
//       console.error("OTP Verify Error:", err);
//       Alert.alert("Error", "Verification failed");
//     }
//   };

//   // Skills
//   const addSkill = () => {
//     if (skillInput.trim() && !skills.includes(skillInput.trim())) {
//       LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//       setSkills([...skills, skillInput.trim()]);
//       setSkillInput("");
//     }
//   };
//   const removeSkill = (skill) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setSkills(skills.filter((s) => s !== skill));
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#4a90e2" />
//         <Text style={{ marginTop: 10 }}>Loading profile...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <TextInput
//         style={styles.input}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//       />
//       <TextInput
//         style={[styles.input, { backgroundColor: "#f3f4f6" }]}
//         placeholder="Email"
//         value={email}
//         editable={false}
//       />
//       <TextInput
//         style={[styles.input, { height: 90 }]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Phone Number"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//         editable={!phoneVerified}
//       />

//       {!phoneVerified && !otpSent && (
//         <TouchableOpacity
//           style={[
//             styles.btnSmall,
//             { backgroundColor: profileSaved ? "#2196f3" : "gray" },
//           ]}
//           onPress={handleSendOtp}
//           disabled={!profileSaved}
//         >
//           <Text style={styles.btnSmallText}>
//             {profileSaved ? "Send OTP to Verify Phone" : "Save Profile First"}
//           </Text>
//         </TouchableOpacity>
//       )}

//       {otpSent && (
//         <View>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter OTP"
//             keyboardType="numeric"
//             value={otp}
//             onChangeText={setOtp}
//           />
//           <TouchableOpacity style={styles.btnSmall} onPress={handleVerifyOtp}>
//             <Text style={styles.btnSmallText}>Verify OTP</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {phoneVerified && (
//         <View style={{ marginVertical: 15 }}>
//           <Text style={{ color: "green", fontWeight: "700", marginBottom: 10 }}>
//             ✅ Phone Verified
//           </Text>

//           <TouchableOpacity
//             style={[styles.btn, { backgroundColor: "#4CAF50" }]}
//             onPress={() => navigation.navigate("KYCPage")}
//           >
//             <Text style={styles.btnText}>Upload KYC Documents</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       <Text style={{ fontWeight: "700", marginBottom: 5, marginTop: 15 }}>
//         Skills:
//       </Text>
//       {skills.map((skill, index) => (
//         <View key={index} style={styles.skillItem}>
//           <Text>{skill}</Text>
//           <TouchableOpacity onPress={() => removeSkill(skill)}>
//             <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
//           </TouchableOpacity>
//         </View>
//       ))}

//       <View style={{ flexDirection: "row", marginBottom: 15 }}>
//         <TextInput
//           style={[styles.input, { flex: 1 }]}
//           placeholder="Add Skill"
//           value={skillInput}
//           onChangeText={setSkillInput}
//         />
//         <TouchableOpacity
//           style={[styles.btn, { paddingHorizontal: 12 }]}
//           onPress={addSkill}
//         >
//           <Text style={styles.btnText}>Add</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity
//         style={styles.btn}
//         onPress={submitProfile}
//         disabled={saving}
//       >
//         <Text style={styles.btnText}>
//           {saving
//             ? "Saving..."
//             : isNewUser
//             ? "Save & Continue"
//             : "Save Changes"}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, paddingBottom: 50 },
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
//     justifyContent: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
//   btnSmall: {
//     padding: 8,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 8,
//   },
//   btnSmallText: { color: "#fff", fontWeight: "700" },
//   skillItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 8,
//     backgroundColor: "#f1f5f9",
//     borderRadius: 8,
//     marginBottom: 5,
//   },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
// });

// import React, { useEffect, useState, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   Platform,
//   UIManager,
//   LayoutAnimation,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import {
//   fetchDoerProfile,
//   updateDoerProfile,
//   sendPhoneOtp,
//   verifyPhoneOtp,
//   fetchKycStatus, // ✅ Added
// } from "../api/doer";

// // Enable Layout Animation for Android
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation, route }) {
//   const { isNewUser = false, onProfileSaved } = route.params || {};

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]);
//   const [skillInput, setSkillInput] = useState("");

//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [profileSaved, setProfileSaved] = useState(false);
//   const [sessionId, setSessionId] = useState("");

//   const [kycStatus, setKycStatus] = useState("pending"); // pending | verified | failed
//   const [kycReason, setKycReason] = useState("");

//   // Header
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={24} color="#000" />
//         </TouchableOpacity>
//       ),
//       headerRight: () => (
//         <TouchableOpacity onPress={logoutUser} style={{ marginRight: 15 }}>
//           <Ionicons name="log-out-outline" size={24} color="red" />
//         </TouchableOpacity>
//       ),
//       title: isNewUser ? "Complete Profile" : "Edit Profile",
//     });
//   }, [navigation]);

//   // Fetch Profile & KYC
//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchDoerProfile();
//       if (res?.status === "SUCCESS" && res.data) {
//         const p = res.data;
//         setName(p.fullName || "");
//         setEmail(p.email || "");
//         setBio(p.bio || "");
//         setPhone(p.phone || "");
//         setSkills(p.skills || []);
//         setPhoneVerified(!!p.phoneVerified);
//         setProfileSaved(true);

//         // Fetch KYC Status (fallback if API undefined)
//         if (typeof fetchKycStatus === "function") {
//           try {
//             const kycRes = await fetchKycStatus(p.userId);
//             if (kycRes?.status === "SUCCESS" && kycRes.data) {
//               setKycStatus(kycRes.data.status || "pending");
//               setKycReason(kycRes.data.reason || "");
//             }
//           } catch (err) {
//             console.warn("KYC Fetch failed:", err);
//           }
//         }
//       } else {
//         Alert.alert("Error", res?.message || "Failed to fetch profile");
//       }
//     } catch (err) {
//       console.error("Profile Fetch Error:", err);
//       Alert.alert("Error", "Unable to load profile data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   // Logout
//   const logoutUser = async () => {
//     await AsyncStorage.multiRemove([
//       "authToken",
//       "userRole",
//       "doerProfile",
//       "userEmail",
//     ]);
//     navigation.replace("LoginPage");
//   };

//   // Save Profile
//   const submitProfile = async () => {
//     if (!name) return Alert.alert("Validation Error", "Name is required");
//     if (!phone)
//       return Alert.alert("Validation Error", "Phone number is required");

//     try {
//       setSaving(true);
//       const payload = { name, email, bio, phone, skills };
//       const res = await updateDoerProfile(payload);

//       if (res.status === "SUCCESS") {
//         Alert.alert(
//           "✅ Profile Saved",
//           "Now please verify your phone number if not verified."
//         );
//         await AsyncStorage.setItem("doerProfile", JSON.stringify(payload));
//         setProfileSaved(true);
//         if (onProfileSaved) onProfileSaved();

//         // Auto-fetch profile again
//         await loadProfile();
//       } else {
//         Alert.alert("Error", res.message || "Update failed");
//       }
//     } catch (err) {
//       console.error("Update Error:", err);
//       Alert.alert("Error", "Update failed. Try again later.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const handleSendOtp = async () => {
//     if (!profileSaved)
//       return Alert.alert(
//         "Save Profile First",
//         "Please save your profile before verifying phone."
//       );

//     try {
//       const res = await sendPhoneOtp();
//       if (res?.status === "SUCCESS") {
//         setSessionId(res?.data?.sessionId || "");
//         setOtpSent(true);
//         Alert.alert("OTP Sent", "Check your registered phone for the OTP.");
//       } else {
//         Alert.alert("Error", res?.message || "Failed to send OTP");
//       }
//     } catch (err) {
//       console.error("OTP Send Error:", err);
//       Alert.alert("Error", "Could not send OTP");
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (!otp) return Alert.alert("Enter OTP first");
//     if (!sessionId)
//       return Alert.alert("Error", "No session ID found. Please resend OTP.");

//     try {
//       const res = await verifyPhoneOtp(sessionId, otp);
//       if (res?.status === "SUCCESS") {
//         Alert.alert("✅ Verified", "Phone verified successfully!");
//         setPhoneVerified(true);
//         setOtpSent(false);
//         await loadProfile(); // refresh profile & KYC after verification
//         if (isNewUser) navigation.replace("Dashboard");
//       } else {
//         Alert.alert("Error", res?.message || "Invalid OTP");
//       }
//     } catch (err) {
//       console.error("OTP Verify Error:", err);
//       Alert.alert("Error", "Verification failed");
//     }
//   };

//   // Skills
//   const addSkill = () => {
//     if (skillInput.trim() && !skills.includes(skillInput.trim())) {
//       LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//       setSkills([...skills, skillInput.trim()]);
//       setSkillInput("");
//     }
//   };
//   const removeSkill = (skill) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setSkills(skills.filter((s) => s !== skill));
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#4a90e2" />
//         <Text style={{ marginTop: 10 }}>Loading profile...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <TextInput
//         style={styles.input}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//       />
//       <TextInput
//         style={[styles.input, { backgroundColor: "#f3f4f6" }]}
//         placeholder="Email"
//         value={email}
//         editable={false}
//       />
//       <TextInput
//         style={[styles.input, { height: 90 }]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Phone Number"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//         editable={!phoneVerified}
//       />

//       {!phoneVerified && !otpSent && (
//         <TouchableOpacity
//           style={[
//             styles.btnSmall,
//             { backgroundColor: profileSaved ? "#2196f3" : "gray" },
//           ]}
//           onPress={handleSendOtp}
//           disabled={!profileSaved}
//         >
//           <Text style={styles.btnSmallText}>
//             {profileSaved ? "Send OTP to Verify Phone" : "Save Profile First"}
//           </Text>
//         </TouchableOpacity>
//       )}

//       {otpSent && (
//         <View>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter OTP"
//             keyboardType="numeric"
//             value={otp}
//             onChangeText={setOtp}
//           />
//           <TouchableOpacity style={styles.btnSmall} onPress={handleVerifyOtp}>
//             <Text style={styles.btnSmallText}>Verify OTP</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {phoneVerified && (
//         <View style={{ marginVertical: 15 }}>
//           <Text style={{ color: "green", fontWeight: "700", marginBottom: 10 }}>
//             ✅ Phone Verified
//           </Text>

//           {kycStatus === "pending" && (
//             <TouchableOpacity
//               style={[styles.btn, { backgroundColor: "#4CAF50" }]}
//               onPress={() => navigation.navigate("KYCPage")}
//             >
//               <Text style={styles.btnText}>Upload KYC Documents</Text>
//             </TouchableOpacity>
//           )}

//           {kycStatus === "verified" && (
//             <Text style={{ color: "green", fontWeight: "700" }}>
//               ✅ KYC Verified
//             </Text>
//           )}

//           {kycStatus === "failed" && (
//             <View>
//               <Text style={{ color: "red", fontWeight: "700" }}>
//                 ❌ KYC Failed: {kycReason}
//               </Text>
//               <TouchableOpacity
//                 style={[
//                   styles.btn,
//                   { backgroundColor: "#4CAF50", marginTop: 5 },
//                 ]}
//                 onPress={() => navigation.navigate("KYCPage")}
//               >
//                 <Text style={styles.btnText}>Re-upload KYC</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       )}

//       <Text style={{ fontWeight: "700", marginBottom: 5, marginTop: 15 }}>
//         Skills:
//       </Text>
//       {skills.map((skill, index) => (
//         <View key={index} style={styles.skillItem}>
//           <Text>{skill}</Text>
//           <TouchableOpacity onPress={() => removeSkill(skill)}>
//             <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
//           </TouchableOpacity>
//         </View>
//       ))}

//       <View style={{ flexDirection: "row", marginBottom: 15 }}>
//         <TextInput
//           style={[styles.input, { flex: 1 }]}
//           placeholder="Add Skill"
//           value={skillInput}
//           onChangeText={setSkillInput}
//         />
//         <TouchableOpacity
//           style={[styles.btn, { paddingHorizontal: 12 }]}
//           onPress={addSkill}
//         >
//           <Text style={styles.btnText}>Add</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity
//         style={styles.btn}
//         onPress={submitProfile}
//         disabled={saving}
//       >
//         <Text style={styles.btnText}>
//           {saving
//             ? "Saving..."
//             : isNewUser
//             ? "Save & Continue"
//             : "Save Changes"}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, paddingBottom: 50 },
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
//     justifyContent: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
//   btnSmall: {
//     padding: 8,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 8,
//   },
//   btnSmallText: { color: "#fff", fontWeight: "700" },
//   skillItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 8,
//     backgroundColor: "#f1f5f9",
//     borderRadius: 8,
//     marginBottom: 5,
//   },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
// });
// import React, { useEffect, useState, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
  //TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   Platform,
//   UIManager,
//   LayoutAnimation,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import {
//   fetchDoerProfile,
//   updateDoerProfile,
//   sendPhoneOtp,
//   verifyPhoneOtp,
// } from "../api/doer";

// // Enable Layout Animation for Android
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation, route }) {
//   const { isNewUser = false, onProfileSaved } = route.params || {};

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]);
//   const [skillInput, setSkillInput] = useState("");

//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [profileSaved, setProfileSaved] = useState(false);
//   const [sessionId, setSessionId] = useState("");

//   // KYC states
//   const [kycVerified, setKycVerified] = useState(false);
//   const [kycRejected, setKycRejected] = useState(false);
//   const [kycRejectReason, setKycRejectReason] = useState("");

//   // Header
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={24} color="#000" />
//         </TouchableOpacity>
//       ),
//       headerRight: () => (
//         <TouchableOpacity onPress={logoutUser} style={{ marginRight: 15 }}>
//           <Ionicons name="log-out-outline" size={24} color="red" />
//         </TouchableOpacity>
//       ),
//       title: isNewUser ? "Complete Profile" : "Edit Profile",
//     });
//   }, [navigation]);

//   // Fetch profile + KYC
//   const loadProfile = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchDoerProfile();
//       if (res?.status === "SUCCESS" && res.data) {
//         const p = res.data;
//         setName(p.name || "");
//         setEmail(p.email || "");
//         setBio(p.bio || "");
//         setPhone(p.phone || "");
//         setSkills(p.skills || []);
//         setPhoneVerified(!!p.isVerified);

//         // KYC status
//         if (p.verificationStatus === "VERIFIED") {
//           setKycVerified(true);
//           setKycRejected(false);
//         } else if (p.verificationStatus === "PENDING") {
//           setKycVerified(false);
//           setKycRejected(false);
//         } else if (p.verificationStatus === "KYC_REJECTED") {
//           setKycVerified(false);
//           setKycRejected(true);
//           setKycRejectReason(p.rejectionReason || "Please re-upload documents");
//         }
//       } else {
//         Alert.alert("Error", res?.message || "Failed to fetch profile");
//       }
//     } catch (err) {
//       console.error("Profile Fetch Error:", err);
//       Alert.alert("Error", "Unable to load profile data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   // Logout
//   const logoutUser = async () => {
//     await AsyncStorage.multiRemove([
//       "authToken",
//       "userRole",
//       "doerProfile",
//       "userEmail",
//     ]);
//     navigation.replace("LoginPage");
//   };

//   // Save profile
//   const submitProfile = async () => {
//     if (!name) return Alert.alert("Validation Error", "Name is required");
//     if (!phone)
//       return Alert.alert("Validation Error", "Phone number is required");

//     try {
//       setSaving(true);
//       const payload = { name, email, bio, phone, skills };
//       const res = await updateDoerProfile(payload);

//       if (res.status === "SUCCESS") {
//         Alert.alert(
//           "✅ Profile Saved",
//           "Now please verify your phone number using the 'Send OTP' button."
//         );
//         await AsyncStorage.setItem("doerProfile", JSON.stringify(payload));
//         setProfileSaved(true);
//         if (onProfileSaved) onProfileSaved();
//         await loadProfile(); // Auto-refresh profile after save
//       } else {
//         Alert.alert("Error", res.message || "Update failed");
//       }
//     } catch (err) {
//       console.error("Update Error:", err);
//       Alert.alert("Error", "Update failed. Try again later.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const handleSendOtp = async () => {
//     if (!profileSaved)
//       return Alert.alert(
//         "Save Profile First",
//         "Please save your profile before verifying phone."
//       );
//     try {
//       const res = await sendPhoneOtp();
//       if (res?.status === "SUCCESS") {
//         setSessionId(res?.data?.sessionId || "");
//         setOtpSent(true);
//         Alert.alert("OTP Sent", "Check your registered phone for the OTP.");
//       } else {
//         Alert.alert("Error", res?.message || "Failed to send OTP");
//       }
//     } catch (err) {
//       console.error("OTP Send Error:", err);
//       Alert.alert("Error", "Could not send OTP");
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (!otp) return Alert.alert("Enter OTP first");
//     if (!sessionId)
//       return Alert.alert("Error", "No session ID found. Please resend OTP.");
//     try {
//       const res = await verifyPhoneOtp(sessionId, otp);
//       if (res?.status === "SUCCESS") {
//         Alert.alert("✅ Verified", "Phone verified successfully!");
//         setPhoneVerified(true);
//         setOtpSent(false);
//         await loadProfile(); // Refresh profile including KYC
//         if (isNewUser) navigation.replace("Dashboard");
//       } else {
//         Alert.alert("Error", res?.message || "Invalid OTP");
//       }
//     } catch (err) {
//       console.error("OTP Verify Error:", err);
//       Alert.alert("Error", "Verification failed");
//     }
//   };

//   // Skills
//   const addSkill = () => {
//     if (skillInput.trim() && !skills.includes(skillInput.trim())) {
//       LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//       setSkills([...skills, skillInput.trim()]);
//       setSkillInput("");
//     }
//   };
//   const removeSkill = (skill) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setSkills(skills.filter((s) => s !== skill));
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#4a90e2" />
//         <Text style={{ marginTop: 10 }}>Loading profile...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <TextInput
//         style={styles.input}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//       />
//       <TextInput
//         style={[styles.input, { backgroundColor: "#f3f4f6" }]}
//         placeholder="Email"
//         value={email}
//         editable={false}
//       />
//       <TextInput
//         style={[styles.input, { height: 90 }]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Phone Number"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//         editable={!phoneVerified}
//       />

//       {!phoneVerified && !otpSent && (
//         <TouchableOpacity
//           style={[
//             styles.btnSmall,
//             { backgroundColor: profileSaved ? "#2196f3" : "gray" },
//           ]}
//           onPress={handleSendOtp}
//           disabled={!profileSaved}
//         >
//           <Text style={styles.btnSmallText}>
//             {profileSaved ? "Send OTP to Verify Phone" : "Save Profile First"}
//           </Text>
//         </TouchableOpacity>
//       )}

//       {otpSent && (
//         <View>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter OTP"
//             keyboardType="numeric"
//             value={otp}
//             onChangeText={setOtp}
//           />
//           <TouchableOpacity style={styles.btnSmall} onPress={handleVerifyOtp}>
//             <Text style={styles.btnSmallText}>Verify OTP</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {phoneVerified && (
//         <View style={{ marginVertical: 15 }}>
//           <Text style={{ color: "green", fontWeight: "700", marginBottom: 10 }}>
//             ✅ Phone Verified
//           </Text>

//           {/* KYC Buttons */}
//           {!kycVerified && !kycRejected && (
//             <TouchableOpacity
//               style={[styles.btn, { backgroundColor: "#4CAF50" }]}
//               onPress={() => navigation.navigate("KYCPage")}
//             >
//               <Text style={styles.btnText}>Upload KYC Documents</Text>
//             </TouchableOpacity>
//           )}

//           {kycVerified && (
//             <Text style={{ color: "green", fontWeight: "700" }}>
//               ✅ KYC Verified
//             </Text>
//           )}

//           {kycRejected && (
//             <View>
//               <Text style={{ color: "red", fontWeight: "700" }}>
//                 ❌ KYC Rejected: {kycRejectReason}
//               </Text>
//               <TouchableOpacity
//                 style={[styles.btn, { backgroundColor: "#f44336" }]}
//                 onPress={() => navigation.navigate("KYCPage")}
//               >
//                 <Text style={styles.btnText}>Re-upload KYC Documents</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       )}

//       <Text style={{ fontWeight: "700", marginBottom: 5, marginTop: 15 }}>
//         Skills:
//       </Text>
//       {skills.map((skill, index) => (
//         <View key={index} style={styles.skillItem}>
//           <Text>{skill}</Text>
//           <TouchableOpacity onPress={() => removeSkill(skill)}>
//             <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
//           </TouchableOpacity>
//         </View>
//       ))}

//       <View style={{ flexDirection: "row", marginBottom: 15 }}>
//         <TextInput
//           style={[styles.input, { flex: 1 }]}
//           placeholder="Add Skill"
//           value={skillInput}
//           onChangeText={setSkillInput}
//         />
//         <TouchableOpacity
//           style={[styles.btn, { paddingHorizontal: 12 }]}
//           onPress={addSkill}
//         >
//           <Text style={styles.btnText}>Add</Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity
//         style={styles.btn}
//         onPress={submitProfile}
//         disabled={saving}
//       >
//         <Text style={styles.btnText}>
//           {saving
//             ? "Saving..."
//             : isNewUser
//             ? "Save & Continue"
//             : "Save Changes"}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, paddingBottom: 50 },
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
//     justifyContent: "center",
//     marginVertical: 5,
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
//   btnSmall: {
//     padding: 8,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 8,
//   },
//   btnSmallText: { color: "#fff", fontWeight: "700" },
//   skillItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 8,
//     backgroundColor: "#f1f5f9",
//     borderRadius: 8,
//     marginBottom: 5,
//   },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
// });
import React, { useEffect, useState, useLayoutEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchDoerProfile,
  updateDoerProfile,
  sendPhoneOtp,
  verifyPhoneOtp,
} from "../api/doer";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EditProfile({ navigation, route }) {
  const { isNewUser = false } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  const [profileSaved, setProfileSaved] = useState(false);

  // Phone OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sessionId, setSessionId] = useState("");

  // KYC
  const [kycVisible, setKycVisible] = useState(false);

  // Header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
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
      title: isNewUser ? "Complete Profile" : "Edit Profile",
    });
  }, [navigation]);

  // Fetch profile from backend (if existing user)
  const loadProfile = async () => {
    try {
      const res = await fetchDoerProfile();
      if (res?.status === "SUCCESS" && res.data) {
        const p = res.data;
        setName(p.name || "");
        setEmail(p.email || "");
        setBio(p.bio || "");
        setPhone(p.phone || "");
        setSkills(p.skills || []);
        setPhoneVerified(!!p.phoneVerified);
        if (!!p.phoneVerified) setKycVisible(true);
      }
    } catch (err) {
      console.error("Profile Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Logout
  const logoutUser = async () => {
    await AsyncStorage.multiRemove([
      "authToken",
      "userRole",
      "doerProfile",
      "userEmail",
    ]);
    navigation.replace("LoginPage");
  };

  // Save profile
  const submitProfile = async () => {
    if (!name) return Alert.alert("Validation", "Name is required");
    if (!phone) return Alert.alert("Validation", "Phone number is required");

    try {
      setSaving(true);
      const payload = { name, email, bio, phone, skills };
      const res = await updateDoerProfile(payload);

      if (res.status === "SUCCESS") {
        Alert.alert("✅ Profile Saved", "Proceed to verify phone.");
        setProfileSaved(true);
      } else {
        Alert.alert("Error", res.message || "Failed to save profile");
      }
    } catch (err) {
      console.error("Update Error:", err);
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!profileSaved)
      return Alert.alert("Save Profile First", "Save profile before OTP");
    try {
      const res = await sendPhoneOtp();
      if (res?.status === "SUCCESS") {
        setSessionId(res?.data?.sessionId || "");
        setOtpSent(true);
        Alert.alert("OTP Sent", "Check your phone for OTP.");
      } else {
        Alert.alert("Error", res?.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP Error:", err);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) return Alert.alert("Enter OTP");
    if (!sessionId) return Alert.alert("No session ID, resend OTP");

    try {
      const res = await verifyPhoneOtp(sessionId, otp);
      if (res?.status === "SUCCESS") {
        Alert.alert("✅ Phone Verified");
        setPhoneVerified(true);
        setOtpSent(false);
        setKycVisible(true); // now KYC button visible
      } else {
        Alert.alert("Error", res?.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("OTP Verify Error:", err);
      Alert.alert("Error", "Verification failed");
    }
  };

  // Skills
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
      {/* ---------------- Step 1: Profile ---------------- */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { height: 90 }]}
        placeholder="Bio"
        multiline
        value={bio}
        onChangeText={setBio}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        editable={!phoneVerified}
      />

      <Text style={{ fontWeight: "700", marginTop: 10 }}>Skills:</Text>
      {skills.map((skill, i) => (
        <View key={i} style={styles.skillItem}>
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
        <TouchableOpacity style={[styles.btn, { paddingHorizontal: 12 }]} onPress={addSkill}>
          <Text style={styles.btnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btn} onPress={submitProfile} disabled={saving}>
        <Text style={styles.btnText}>
          {saving ? "Saving..." : "Save Profile"}
        </Text>
      </TouchableOpacity>

      {/* ---------------- Step 2: Phone OTP ---------------- */}
      {profileSaved && !phoneVerified && !otpSent && (
        <TouchableOpacity style={[styles.btnSmall, { backgroundColor: "#2196f3" }]} onPress={handleSendOtp}>
          <Text style={styles.btnSmallText}>Send OTP to Verify Phone</Text>
        </TouchableOpacity>
      )}

      {otpSent && !phoneVerified && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity style={styles.btnSmall} onPress={handleVerifyOtp}>
            <Text style={styles.btnSmallText}>Verify OTP</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ---------------- Step 3: KYC ---------------- */}
      {kycVisible && (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#4CAF50", marginTop: 15 }]}
          onPress={() => navigation.navigate("KYCPage")}
        >
          <Text style={styles.btnText}>Upload KYC Documents</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50 },
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
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  btnSmall: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  btnSmallText: { color: "#fff", fontWeight: "700" },
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

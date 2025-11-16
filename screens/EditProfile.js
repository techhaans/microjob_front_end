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

// // Enable smooth animations for Android
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation, route }) {
//   const { isNewUser = false } = route.params || {};

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   // Profile fields
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]);
//   const [skillInput, setSkillInput] = useState("");

//   // State flags
//   const [profileSaved, setProfileSaved] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [kycVisible, setKycVisible] = useState(false);
//   const [kycUploaded, setKycUploaded] = useState(false); // permanent KYC flag

//   // Header with Back Arrow and Logout
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: isNewUser ? "Complete Profile" : "Edit Profile",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.navigate("Dashboard")}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//       headerRight: () => (
//         <TouchableOpacity onPress={logoutUser} style={{ marginRight: 15 }}>
//           <Ionicons name="log-out-outline" size={24} color="red" />
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // Load Profile Data
//   const loadProfile = async () => {
//     try {
//       const res = await fetchDoerProfile();
//       if (res?.status === "SUCCESS" && res.data) {
//         const p = res.data;

//         setName(p.name || "");
//         setEmail(p.email || "");
//         setBio(p.bio || "");
//         setPhone(p.phone || "");
//         setSkills(p.skills || []);

//         // ✅ Use phone verified from users table
//         setPhoneVerified(!!p.isPhoneVerified);
//         // KYC uploaded if kyc_level > 0
//         const kycDone = p.kycLevel > 0;
//         setKycUploaded(kycDone);
//         setKycVisible(phoneVerified || kycDone);

//         setProfileSaved(true);
//         console.log("Profile loaded:", p);
//       }
//     } catch (err) {
//       console.error("Profile Fetch Error:", err);
//       Alert.alert("Error", "Unable to load your profile.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   // Logout user
//   const logoutUser = async () => {
//     await AsyncStorage.multiRemove([
//       "authToken",
//       "userRole",
//       "doerProfile",
//       "userEmail",
//     ]);
//     navigation.replace("LoginPage");
//   };

//   // Save or Update Profile
//   const submitProfile = async () => {
//     if (!name.trim()) return Alert.alert("Validation", "Name is required");
//     if (!phone.trim())
//       return Alert.alert("Validation", "Phone number is required");

//     try {
//       setSaving(true);
//       const payload = { name, email, bio, phone, skills };
//       const res = await updateDoerProfile(payload);

//       if (res.status === "SUCCESS") {
//         await loadProfile(); // reload updated info
//         Alert.alert("✅ Profile Updated", "Your changes have been saved.");
//         setProfileSaved(true);
//       } else {
//         Alert.alert("Error", res.message || "Failed to save profile");
//       }
//     } catch (err) {
//       console.error("Update Error:", err);
//       Alert.alert("Error", "Something went wrong while saving profile");
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
//     if (phoneVerified) return Alert.alert("Info", "Phone already verified");

//     try {
//       const res = await sendPhoneOtp();
//       if (res?.status === "SUCCESS") {
//         setSessionId(res?.data?.sessionId || "");
//         setOtpSent(true);
//         Alert.alert("OTP Sent", "Check your phone for OTP.");
//       } else {
//         Alert.alert("Error", res?.message || "Failed to send OTP");
//       }
//     } catch (err) {
//       console.error("Send OTP Error:", err);
//       Alert.alert("Error", "Failed to send OTP");
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (!otp.trim()) return Alert.alert("Enter OTP");
//     if (!sessionId) return Alert.alert("No session ID found, resend OTP");

//     try {
//       const res = await verifyPhoneOtp(sessionId, otp);
//       if (res?.status === "SUCCESS") {
//         Alert.alert("✅ Phone Verified", "Your phone number is verified.");
//         setPhoneVerified(true);
//         setOtpSent(false);
//         setKycVisible(true);
//       } else {
//         Alert.alert("Error", res?.message || "Invalid OTP");
//       }
//     } catch (err) {
//       console.error("OTP Verify Error:", err);
//       Alert.alert("Error", "Verification failed");
//     }
//   };

//   // Manage Skills
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

//   // Loading state
//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#4a90e2" />
//         <Text style={{ marginTop: 10 }}>Loading profile...</Text>
//       </View>
//     );

//   // UI Render
//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Full Name */}
//       <TextInput
//         style={styles.input}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//       />

//       {/* Bio */}
//       <TextInput
//         style={[styles.input, { height: 90 }]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//       />

//       {/* Phone Number */}
//       <View>
//         <TextInput
//           style={[
//             styles.input,
//             phoneVerified && { backgroundColor: "#f2f2f2", color: "#666" },
//           ]}
//           placeholder="Phone Number"
//           keyboardType="phone-pad"
//           value={phone}
//           onChangeText={setPhone}
//           editable={!phoneVerified}
//         />
//         {phoneVerified && <Text style={styles.verifiedText}>✅ Phone Verified</Text>}
//       </View>

//       {/* Skills */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>Skills:</Text>
//       {skills.map((skill, i) => (
//         <View key={i} style={styles.skillItem}>
//           <Text>{skill}</Text>
//           <TouchableOpacity onPress={() => removeSkill(skill)}>
//             <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
//           </TouchableOpacity>
//         </View>
//       ))}

//       {/* Add Skill */}
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

//       {/* Save Profile */}
//       <TouchableOpacity
//         style={styles.btn}
//         onPress={submitProfile}
//         disabled={saving}
//       >
//         <Text style={styles.btnText}>
//           {saving ? "Saving..." : "Save Profile"}
//         </Text>
//       </TouchableOpacity>

//       {/* OTP Section */}
//       {!phoneVerified && profileSaved && !otpSent && (
//         <TouchableOpacity
//           style={[styles.btnSmall, { backgroundColor: "#2196f3" }]}
//           onPress={handleSendOtp}
//         >
//           <Text style={styles.btnSmallText}>Send OTP to Verify Phone</Text>
//         </TouchableOpacity>
//       )}

//       {otpSent && !phoneVerified && (
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

//       {/* KYC Section */}
//       {kycVisible && (
//         <TouchableOpacity
//           style={[
//             styles.btn,
//             { backgroundColor: kycUploaded ? "#4CAF50" : "#FF9800", marginTop: 15 },
//           ]}
//           onPress={() => navigation.navigate("KYCPage")}
//         >
//           <Text style={styles.btnText}>
//             {kycUploaded ? "KYC Uploaded" : "Upload KYC Documents"}
//           </Text>
//         </TouchableOpacity>
//       )}
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
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 12,
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
//   verifiedText: {
//     color: "green",
//     fontWeight: "bold",
//     marginLeft: 5,
//     marginBottom: 10,
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

// // Enable smooth animations for Android
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation, route }) {
//   const { isNewUser = false } = route.params || {};

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   // Profile fields
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]);
//   const [skillInput, setSkillInput] = useState("");

//   // State flags
//   const [profileSaved, setProfileSaved] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [kycUploaded, setKycUploaded] = useState(false);
//   const [kycPending, setKycPending] = useState(false);

//   // Derived flag for KYC button
//   const kycVisible = phoneVerified || kycUploaded;

//   // Header buttons
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: isNewUser ? "Complete Profile" : "Edit Profile",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.navigate("Dashboard")}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//       headerRight: () => (
//         <TouchableOpacity onPress={logoutUser} style={{ marginRight: 15 }}>
//           <Ionicons name="log-out-outline" size={24} color="red" />
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // Load Profile
//   const loadProfile = async () => {
//     try {
//       const res = await fetchDoerProfile();
//       if (res?.status === "SUCCESS" && res.data) {
//         const p = res.data;

//         setName(p.name || "");
//         setEmail(p.email || "");
//         setBio(p.bio || "");
//         setPhone(p.phone || "");
//         setSkills(p.skills || []);
//         setPhoneVerified(p.isVerified === true); // ✅ Use backend value directly
//         setKycUploaded(p.kycLevel > 0);
//         setKycPending(p.kycLevel > 0 && !phoneVerified);
//         setProfileSaved(true);

//         console.log("Profile loaded:", p);
//       }
//     } catch (err) {
//       console.error("Profile Fetch Error:", err);
//       Alert.alert("Error", "Unable to load your profile.");
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

//   // Save or update profile
//   const submitProfile = async () => {
//     if (!name.trim()) return Alert.alert("Validation", "Name is required");
//     if (!phone.trim())
//       return Alert.alert("Validation", "Phone number is required");

//     try {
//       setSaving(true);
//       const payload = { name, email, bio, phone, skills };
//       const res = await updateDoerProfile(payload);

//       if (res.status === "SUCCESS") {
//         await loadProfile();
//         Alert.alert("✅ Profile Updated", "Your changes have been saved.");
//       } else {
//         Alert.alert("Error", res.message || "Failed to save profile");
//       }
//     } catch (err) {
//       console.error("Update Error:", err);
//       Alert.alert("Error", "Something went wrong while saving profile");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const handleSendOtp = async () => {
//     if (!profileSaved) {
//       return Alert.alert(
//         "Save Profile First",
//         "Please save your profile before verifying phone."
//       );
//     }
//     if (phoneVerified) return; // Hide button if already verified

//     try {
//       const res = await sendPhoneOtp();
//       if (res?.status === "SUCCESS") {
//         setSessionId(res?.data?.sessionId || "");
//         setOtpSent(true);
//         Alert.alert("OTP Sent", "Check your phone for OTP.");
//       } else {
//         Alert.alert("Error", res?.message || "Failed to send OTP");
//       }
//     } catch (err) {
//       console.error("Send OTP Error:", err);
//       Alert.alert("Error", "Failed to send OTP");
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (!otp.trim()) return Alert.alert("Enter OTP");
//     if (!sessionId) return Alert.alert("No session ID found, resend OTP");

//     try {
//       const res = await verifyPhoneOtp(sessionId, otp);
//       if (res?.status === "SUCCESS") {
//         Alert.alert("✅ Phone Verified", "Your phone number is verified.");
//         setPhoneVerified(true);
//         setOtpSent(false);
//       } else {
//         Alert.alert("Error", res?.message || "Invalid OTP");
//       }
//     } catch (err) {
//       console.error("OTP Verify Error:", err);
//       Alert.alert("Error", "Verification failed");
//     }
//   };

//   // Manage skills
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
//       {/* Name */}
//       <TextInput
//         style={styles.input}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//       />

//       {/* Bio */}
//       <TextInput
//         style={[styles.input, { height: 90 }]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//       />

//       {/* Phone Number */}
//       <View>
//         <TextInput
//           style={[
//             styles.input,
//             phoneVerified && { backgroundColor: "#f2f2f2", color: "#666" },
//           ]}
//           placeholder="Phone Number"
//           keyboardType="phone-pad"
//           value={phone}
//           onChangeText={setPhone}
//           editable={!phoneVerified}
//         />
//         {phoneVerified && (
//           <Text style={styles.verifiedText}>✅ Phone Verified</Text>
//         )}
//       </View>

//       {/* Skills */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>Skills:</Text>
//       {skills.map((skill, i) => (
//         <View key={i} style={styles.skillItem}>
//           <Text>{skill}</Text>
//           <TouchableOpacity onPress={() => removeSkill(skill)}>
//             <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
//           </TouchableOpacity>
//         </View>
//       ))}

//       {/* Add Skill */}
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

//       {/* Save Profile */}
//       <TouchableOpacity
//         style={styles.btn}
//         onPress={submitProfile}
//         disabled={saving}
//       >
//         <Text style={styles.btnText}>
//           {saving ? "Saving..." : "Save Profile"}
//         </Text>
//       </TouchableOpacity>

//       {/* OTP Section */}
//       {!phoneVerified && profileSaved && !otpSent && (
//         <TouchableOpacity
//           style={[styles.btnSmall, { backgroundColor: "#2196f3" }]}
//           onPress={handleSendOtp}
//         >
//           <Text style={styles.btnSmallText}>Send OTP to Verify Phone</Text>
//         </TouchableOpacity>
//       )}

//       {otpSent && !phoneVerified && (
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

//       {/* KYC Section */}
//       {kycVisible && (
//         <TouchableOpacity
//           style={[
//             styles.btn,
//             {
//               backgroundColor: kycPending ? "#FF9800" : "#4CAF50",
//               marginTop: 15,
//             },
//           ]}
//           onPress={() => {
//             if (kycPending)
//               Alert.alert(
//                 "Pending Review",
//                 "Your KYC document is under review."
//               );
//             else navigation.navigate("KYCPage");
//           }}
//         >
//           <Text style={styles.btnText}>
//             {kycPending ? "KYC Pending Review" : "KYC Uploaded"}
//           </Text>
//         </TouchableOpacity>
//       )}
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
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 12,
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
//   verifiedText: {
//     color: "green",
//     fontWeight: "bold",
//     marginLeft: 5,
//     marginBottom: 10,
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

// // Enable smooth animations for Android
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]);
//   const [skillInput, setSkillInput] = useState("");

//   const [profileSaved, setProfileSaved] = useState(false);
//   const [editing, setEditing] = useState(true);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [kycUploaded, setKycUploaded] = useState(false);
//   const [kycPending, setKycPending] = useState(false);

//   const kycVisible = phoneVerified; // Only visible if phone verified

//   // Header setup
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Edit Profile",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.navigate("Dashboard")}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // Load profile
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
//         setPhoneVerified(p.is_phone_verified === true);
//         setKycUploaded(p.kycLevel > 0);
//         setKycPending(p.kycStatus === "PENDING");
//         setProfileSaved(true);

//         // Allow editing only if phone not verified
//         setEditing(!p.is_phone_verified);

//         setOtpSent(false);
//         setOtp("");

//         // Save locally
//         await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//       }
//     } catch (err) {
//       Alert.alert("Error", "Please Register");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Refresh profile on screen focus
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", loadProfile);
//     return unsubscribe;
//   }, [navigation]);

//   const submitProfile = async () => {
//     if (!name.trim() || !phone.trim()) {
//       return Alert.alert("Validation", "Name and Phone are required");
//     }
//     setSaving(true);
//     try {
//       const payload = { name, email, bio, phone, skills };
//       const res = await updateDoerProfile(payload);
//       if (res.status === "SUCCESS") {
//         await loadProfile();
//         Alert.alert("Success", "Profile saved");
//         setEditing(false);
//       } else {
//         Alert.alert("Error", res.message || "Failed to save profile");
//       }
//     } catch (err) {
//       console.error("Update error:", err);
//       Alert.alert("Error", "Something went wrong");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const handleSendOtp = async () => {
//     if (phoneVerified) return; // Already verified
//     if (!phone.trim())
//       return Alert.alert("Enter Phone", "Please enter a valid phone number");

//     try {
//       const res = await sendPhoneOtp(phone);
//       if (res?.status === "SUCCESS") {
//         setSessionId(res?.data?.sessionId || "");
//         setOtpSent(true);
//         Alert.alert("OTP Sent", "Check your phone for OTP.");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to send OTP");
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (!otp.trim()) return Alert.alert("Enter OTP");
//     if (!sessionId) return Alert.alert("Session expired. Resend OTP");

//     try {
//       const res = await verifyPhoneOtp(sessionId, otp);
//       if (res?.status === "SUCCESS") {
//         Alert.alert("Phone Verified", "Your phone is verified successfully!");
//         setPhoneVerified(true);
//         setOtpSent(false);
//         setEditing(false);

//         // Refresh profile and save
//         await loadProfile();
//         const updatedProfile = JSON.parse(
//           await AsyncStorage.getItem("doerProfile")
//         );
//         updatedProfile.is_phone_verified = true;
//         await AsyncStorage.setItem(
//           "doerProfile",
//           JSON.stringify(updatedProfile)
//         );
//       } else {
//         Alert.alert("Error", res?.message || "Invalid OTP");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Verification failed");
//     }
//   };

//   // Add skill
//   const addSkill = () => {
//     if (skillInput.trim() && !skills.includes(skillInput.trim())) {
//       LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//       setSkills([...skills, skillInput.trim()]);
//       setSkillInput("");
//     }
//   };

//   // Remove skill
//   const removeSkill = (skill) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setSkills(skills.filter((s) => s !== skill));
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text>Loading profile...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Name & Bio */}
//       <TextInput
//         style={[styles.input, !editing && styles.readOnly]}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//         editable={editing}
//       />
//       <TextInput
//         style={[styles.input, { height: 80 }, !editing && styles.readOnly]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//         editable={editing}
//       />

//       {/* Phone */}
//       <View>
//         <TextInput
//           style={[styles.input, !editing && styles.readOnly]}
//           placeholder="Phone Number"
//           keyboardType="phone-pad"
//           value={phone}
//           onChangeText={setPhone}
//           editable={editing && !phoneVerified}
//         />
//         {phoneVerified && (
//           <Text style={styles.verified}>✅ Phone Verified</Text>
//         )}
//       </View>

//       {/* Skills */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>Skills:</Text>
//       {skills.map((skill, i) => (
//         <View key={i} style={styles.skillItem}>
//           <Text>{skill}</Text>
//           {editing && (
//             <TouchableOpacity onPress={() => removeSkill(skill)}>
//               <Text style={{ color: "red" }}>X</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       ))}
//       {editing && (
//         <View style={{ flexDirection: "row", marginBottom: 15 }}>
//           <TextInput
//             style={[styles.input, { flex: 1 }]}
//             placeholder="Add Skill"
//             value={skillInput}
//             onChangeText={setSkillInput}
//           />
//           <TouchableOpacity
//             style={[styles.btn, { paddingHorizontal: 12 }]}
//             onPress={addSkill}
//           >
//             <Text style={styles.btnText}>Add</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Save / Update */}
//       <TouchableOpacity style={styles.btn} onPress={submitProfile}>
//         <Text style={styles.btnText}>
//           {saving ? "Saving..." : "Save Profile"}
//         </Text>
//       </TouchableOpacity>

//       {/* OTP Section */}
//       {!phoneVerified && profileSaved && !otpSent && (
//         <TouchableOpacity
//           style={[styles.btnSmall, { backgroundColor: "#2196f3" }]}
//           onPress={handleSendOtp}
//         >
//           <Text style={styles.btnSmallText}>Send OTP to Verify Phone</Text>
//         </TouchableOpacity>
//       )}
//       {!phoneVerified && otpSent && (
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

//       {/* KYC Section */}
//       {kycVisible && (
//         <TouchableOpacity
//           style={[
//             styles.btn,
//             {
//               backgroundColor: kycPending ? "#FF9800" : "#4CAF50",
//               marginTop: 15,
//             },
//           ]}
//           onPress={() => {
//             if (kycPending)
//               Alert.alert("Pending Review", "Your KYC is under review");
//             else navigation.navigate("KYCPage");
//           }}
//         >
//           <Text style={styles.btnText}>
//             {kycUploaded
//               ? kycPending
//                 ? "KYC Pending Review"
//                 : "KYC Uploaded"
//               : "Upload KYC"}
//           </Text>
//         </TouchableOpacity>
//       )}
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
//   readOnly: { backgroundColor: "#f2f2f2", color: "#666" },
//   btn: {
//     backgroundColor: "#1976D2",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
//   btnSmall: {
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 12,
//     backgroundColor: "#1976D2",
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
//   verified: {
//     color: "green",
//     fontWeight: "bold",
//     marginLeft: 5,
//     marginBottom: 10,
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
// import { fetchAllCategories } from "../api/admin"; // <-- new import

// // Enable smooth animations for Android
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]); // holds selected category codes
//   const [categories, setCategories] = useState([]);
//   const [showCategories, setShowCategories] = useState(false);

//   const [profileSaved, setProfileSaved] = useState(false);
//   const [editing, setEditing] = useState(true);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [kycUploaded, setKycUploaded] = useState(false);
//   const [kycPending, setKycPending] = useState(false);

//   const kycVisible = phoneVerified; // Only visible if phone verified

//   // Header setup
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Edit Profile",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.navigate("Dashboard")}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // Load profile
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
//         setSkills(p.skills || []); // expected ["101", "104"]
//         setPhoneVerified(p.is_phone_verified === true);
//         setKycUploaded(p.kycLevel > 0);
//         setKycPending(p.kycStatus === "PENDING");
//         setProfileSaved(true);

//         setEditing(!p.is_phone_verified);
//         setOtpSent(false);
//         setOtp("");

//         await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//       }
//     } catch (err) {
//       Alert.alert("Error", "Please Register");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Refresh profile on screen focus
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", loadProfile);
//     return unsubscribe;
//   }, [navigation]);

//   // Fetch all categories
//   useEffect(() => {
//     const fetchCategoriesData = async () => {
//       try {
//         const res = await fetchAllCategories();
//         if (res?.status === "SUCCESS" && Array.isArray(res.data)) {
//           setCategories(res.data);
//         }
//       } catch (err) {
//         console.error("Category fetch failed:", err);
//       }
//     };
//     fetchCategoriesData();
//   }, []);

//   // Save Profile
//   const submitProfile = async () => {
//     if (!name.trim() || !phone.trim()) {
//       return Alert.alert("Validation", "Name and Phone are required");
//     }
//     setSaving(true);
//     try {
//       const payload = { name, email, bio, phone, skills };
//       const res = await updateDoerProfile(payload);
//       if (res.status === "SUCCESS") {
//         await loadProfile();
//         Alert.alert("Success", "Profile saved");
//         setEditing(false);
//       } else {
//         Alert.alert("Error", res.message || "Failed to save profile");
//       }
//     } catch (err) {
//       console.error("Update error:", err);
//       Alert.alert("Error", "Something went wrong");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const handleSendOtp = async () => {
//     if (phoneVerified) return;
//     if (!phone.trim())
//       return Alert.alert("Enter Phone", "Please enter a valid phone number");

//     try {
//       const res = await sendPhoneOtp(phone);
//       if (res?.status === "SUCCESS") {
//         setSessionId(res?.data?.sessionId || "");
//         setOtpSent(true);
//         Alert.alert("OTP Sent", "Check your phone for OTP.");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to send OTP");
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (!otp.trim()) return Alert.alert("Enter OTP");
//     if (!sessionId) return Alert.alert("Session expired. Resend OTP");

//     try {
//       const res = await verifyPhoneOtp(sessionId, otp);
//       if (res?.status === "SUCCESS") {
//         Alert.alert("Phone Verified", "Your phone is verified successfully!");
//         setPhoneVerified(true);
//         setOtpSent(false);
//         setEditing(false);
//         await loadProfile();

//         const updatedProfile = JSON.parse(
//           await AsyncStorage.getItem("doerProfile")
//         );
//         updatedProfile.is_phone_verified = true;
//         await AsyncStorage.setItem(
//           "doerProfile",
//           JSON.stringify(updatedProfile)
//         );
//       } else {
//         Alert.alert("Error", res?.message || "Invalid OTP");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Verification failed");
//     }
//   };

//   // Remove skill
//   const removeSkill = (code) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setSkills(skills.filter((s) => s !== code));
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text>Loading profile...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Name & Bio */}
//       <TextInput
//         style={[styles.input, !editing && styles.readOnly]}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//         editable={editing}
//       />
//       <TextInput
//         style={[styles.input, { height: 80 }, !editing && styles.readOnly]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//         editable={editing}
//       />

//       {/* Phone */}
//       <View>
//         <TextInput
//           style={[styles.input, !editing && styles.readOnly]}
//           placeholder="Phone Number"
//           keyboardType="phone-pad"
//           value={phone}
//           onChangeText={setPhone}
//           editable={editing && !phoneVerified}
//         />
//         {phoneVerified && (
//           <Text style={styles.verified}>✅ Phone Verified</Text>
//         )}
//       </View>

//       {/* Skills */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>
//         Skills (Select Categories):
//       </Text>

//       {skills.length > 0 ? (
//         skills.map((code, i) => {
//           const category = categories.find((c) => c.code === code);
//           return (
//             <View key={i} style={styles.skillItem}>
//               <Text>
//                 {category ? `${category.name} (${category.code})` : code}
//               </Text>
//               {editing && (
//                 <TouchableOpacity onPress={() => removeSkill(code)}>
//                   <Text style={{ color: "red" }}>X</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           );
//         })
//       ) : (
//         <Text style={{ color: "#666", marginVertical: 8 }}>
//           No skills selected
//         </Text>
//       )}

//       {editing && (
//         <>
//           <TouchableOpacity
//             style={[styles.btnSmall, { backgroundColor: "#009688" }]}
//             onPress={() => setShowCategories(!showCategories)}
//           >
//             <Text style={styles.btnSmallText}>
//               {showCategories ? "Hide Categories" : "Choose Categories"}
//             </Text>
//           </TouchableOpacity>

//           {showCategories && (
//             <View style={styles.categoryList}>
//               {categories.map((cat) => (
//                 <TouchableOpacity
//                   key={cat.code}
//                   style={[
//                     styles.skillItem,
//                     {
//                       backgroundColor: skills.includes(cat.code)
//                         ? "#C8E6C9"
//                         : "#f1f5f9",
//                     },
//                   ]}
//                   onPress={() => {
//                     if (skills.includes(cat.code)) {
//                       removeSkill(cat.code);
//                     } else {
//                       setSkills([...skills, cat.code]);
//                     }
//                   }}
//                 >
//                   <Text>{cat.name}</Text>
//                   <Text style={{ color: "#888" }}>{cat.code}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           )}
//         </>
//       )}

//       {/* Save Profile */}
//       <TouchableOpacity style={styles.btn} onPress={submitProfile}>
//         <Text style={styles.btnText}>
//           {saving ? "Saving..." : "Save Profile"}
//         </Text>
//       </TouchableOpacity>

//       {/* OTP Section */}
//       {!phoneVerified && profileSaved && !otpSent && (
//         <TouchableOpacity
//           style={[styles.btnSmall, { backgroundColor: "#2196f3" }]}
//           onPress={handleSendOtp}
//         >
//           <Text style={styles.btnSmallText}>Send OTP to Verify Phone</Text>
//         </TouchableOpacity>
//       )}
//       {!phoneVerified && otpSent && (
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

//       {/* KYC Section */}
//       {kycVisible && (
//         <TouchableOpacity
//           style={[
//             styles.btn,
//             {
//               backgroundColor: kycPending ? "#FF9800" : "#4CAF50",
//               marginTop: 15,
//             },
//           ]}
//           onPress={() => {
//             if (kycPending)
//               Alert.alert("Pending Review", "Your KYC is under review");
//             else navigation.navigate("KYCPage");
//           }}
//         >
//           <Text style={styles.btnText}>
//             {kycUploaded
//               ? kycPending
//                 ? "KYC Pending Review"
//                 : "KYC Uploaded"
//               : "Upload KYC"}
//           </Text>
//         </TouchableOpacity>
//       )}
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
//   readOnly: { backgroundColor: "#f2f2f2", color: "#666" },
//   btn: {
//     backgroundColor: "#1976D2",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
//   btnSmall: {
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 12,
//     backgroundColor: "#1976D2",
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
//   verified: {
//     color: "green",
//     fontWeight: "bold",
//     marginLeft: 5,
//     marginBottom: 10,
//   },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryList: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     marginTop: 10,
//     padding: 8,
//   },
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
// import { fetchAllCategories } from "../api/admin";

// // Enable smooth animations for Android
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]); // selected skill codes
//   const [categories, setCategories] = useState([]);
//   const [showCategories, setShowCategories] = useState(false);

//   const [profileSaved, setProfileSaved] = useState(false);
//   const [editing, setEditing] = useState(true);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [kycUploaded, setKycUploaded] = useState(false);
//   const [kycPending, setKycPending] = useState(false);

//   const kycVisible = phoneVerified;

//   // Header setup
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Edit Profile",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.navigate("Dashboard")}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // Load profile
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
//         setSkills(Array.isArray(p.skills) ? p.skills : []);
//         setPhoneVerified(p.is_phone_verified === true);
//         setKycUploaded(p.kycLevel > 0);
//         setKycPending(p.kycStatus === "PENDING");
//         setProfileSaved(true);

//         setEditing(!p.is_phone_verified);
//         setOtpSent(false);
//         setOtp("");

//         await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//       }
//     } catch (err) {
//       Alert.alert("Error", "Please Register");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Refresh on focus
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", loadProfile);
//     return unsubscribe;
//   }, [navigation]);

//   // Fetch all categories (skills)
//   useEffect(() => {
//     const fetchCategoriesData = async () => {
//       try {
//         const res = await fetchAllCategories();
//         if (res?.status === "SUCCESS" && Array.isArray(res.data)) {
//           setCategories(res.data);
//         }
//       } catch (err) {
//         console.error("Category fetch failed:", err);
//       }
//     };
//     fetchCategoriesData();
//   }, []);

//   // Save Profile
//   const submitProfile = async () => {
//     if (!name.trim() || !phone.trim())
//       return Alert.alert("Validation", "Name and Phone are required");
//     setSaving(true);
//     try {
//       const payload = { name, email, bio, phone, skills }; // skills = codes
//       const res = await updateDoerProfile(payload);
//       if (res.status === "SUCCESS") {
//         await loadProfile();
//         Alert.alert("Success", "Profile saved");
//         setEditing(false);
//       } else {
//         Alert.alert("Error", res.message || "Failed to save profile");
//       }
//     } catch (err) {
//       console.error("Update error:", err);
//       Alert.alert("Error", "Something went wrong");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Remove skill
//   const removeSkill = (code) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setSkills(skills.filter((s) => s !== code));
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text>Loading profile...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Name & Bio */}
//       <TextInput
//         style={[styles.input, !editing && styles.readOnly]}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//         editable={editing}
//       />
//       <TextInput
//         style={[styles.input, { height: 80 }, !editing && styles.readOnly]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//         editable={editing}
//       />

//       {/* Phone */}
//       <TextInput
//         style={[styles.input, !editing && styles.readOnly]}
//         placeholder="Phone Number"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//         editable={editing && !phoneVerified}
//       />
//       {phoneVerified && <Text style={styles.verified}>✅ Phone Verified</Text>}

//       {/* Selected Skills */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>Selected Skills:</Text>
//       {skills.length > 0 ? (
//         skills.map((code, i) => {
//           const cat = categories.find((c) => c.code === code);
//           return (
//             <View key={i} style={styles.skillItem}>
//               <Text style={{ fontWeight: "600" }}>
//                 {cat ? cat.skillName || cat.name : code}
//               </Text>
//               {editing && (
//                 <TouchableOpacity onPress={() => removeSkill(code)}>
//                   <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           );
//         })
//       ) : (
//         <Text style={{ color: "#666", marginVertical: 8 }}>
//           No skills selected
//         </Text>
//       )}

//       {/* Skill Picker */}
//       {editing && (
//         <>
//           <TouchableOpacity
//             style={[styles.btnSmall, { backgroundColor: "#009688" }]}
//             onPress={() => setShowCategories(!showCategories)}
//           >
//             <Text style={styles.btnSmallText}>
//               {showCategories ? "Hide Skill List" : "Choose Skills"}
//             </Text>
//           </TouchableOpacity>

//           {showCategories && (
//             <View style={styles.categoryList}>
//               {categories.map((cat) => {
//                 const selected = skills.includes(cat.code);
//                 return (
//                   <TouchableOpacity
//                     key={cat.code}
//                     style={[
//                       styles.skillItem,
//                       { backgroundColor: selected ? "#C8E6C9" : "#f1f5f9" },
//                     ]}
//                     onPress={() => {
//                       if (selected) removeSkill(cat.code);
//                       else setSkills([...skills, cat.code]);
//                     }}
//                   >
//                     <View
//                       style={{ flexDirection: "row", alignItems: "center" }}
//                     >
//                       <Ionicons
//                         name={selected ? "checkmark-circle" : "ellipse-outline"}
//                         size={20}
//                         color={selected ? "#2e7d32" : "#888"}
//                         style={{ marginRight: 8 }}
//                       />
//                       <View>
//                         <Text style={{ fontWeight: "600" }}>
//                           {cat.skillName || cat.name}
//                         </Text>
//                         <Text style={{ color: "#777", fontSize: 12 }}>
//                           Code: {cat.code}
//                         </Text>
//                       </View>
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>
//           )}
//         </>
//       )}

//       {/* Save Profile */}
//       <TouchableOpacity style={styles.btn} onPress={submitProfile}>
//         <Text style={styles.btnText}>
//           {saving ? "Saving..." : "Save Profile"}
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
//   readOnly: { backgroundColor: "#f2f2f2", color: "#666" },
//   btn: {
//     backgroundColor: "#1976D2",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
//   btnSmall: {
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 12,
//     backgroundColor: "#1976D2",
//   },
//   btnSmallText: { color: "#fff", fontWeight: "700" },
//   skillItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 10,
//     backgroundColor: "#f1f5f9",
//     borderRadius: 8,
//     marginBottom: 6,
//     alignItems: "center",
//   },
//   verified: { color: "green", fontWeight: "bold", marginBottom: 10 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryList: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     marginTop: 10,
//     padding: 8,
//   },
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
//   fetchDoerCategories, // ✅ new import
// } from "../api/doer"; // ✅ only from doer.js

// // Enable smooth animations for Android
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [showCategories, setShowCategories] = useState(false);

//   const [editing, setEditing] = useState(true);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [kycUploaded, setKycUploaded] = useState(false);
//   const [kycPending, setKycPending] = useState(false);

//   const kycVisible = phoneVerified;

//   // Header setup
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Edit Profile",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.navigate("Dashboard")}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // Load profile
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
//         setSkills(Array.isArray(p.skills) ? p.skills : []);
//         setPhoneVerified(p.is_phone_verified === true);
//         setKycUploaded(p.kycLevel > 0);
//         setKycPending(p.kycStatus === "PENDING");
//         setEditing(!p.is_phone_verified);
//         setOtpSent(false);
//         setOtp("");

//         await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//       }
//     } catch (err) {
//       Alert.alert("Error", "Please Register");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Refresh on focus
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", loadProfile);
//     return unsubscribe;
//   }, [navigation]);

//   // ✅ Fetch categories for Doer
//   useEffect(() => {
//     const fetchCategoriesData = async () => {
//       try {
//         const res = await fetchDoerCategories();
//         if (res?.status === "SUCCESS" && Array.isArray(res.data)) {
//           setCategories(res.data);
//         } else {
//           console.warn("No categories returned:", res);
//         }
//       } catch (err) {
//         console.error("Category fetch failed:", err);
//       }
//     };
//     fetchCategoriesData();
//   }, []);

//   // Save Profile
//   const submitProfile = async () => {
//     if (!name.trim() || !phone.trim())
//       return Alert.alert("Validation", "Name and Phone are required");
//     setSaving(true);
//     try {
//       const payload = { name, email, bio, phone, skills };
//       const res = await updateDoerProfile(payload);
//       if (res.status === "SUCCESS") {
//         await loadProfile();
//         Alert.alert("Success", "Profile saved");
//         setEditing(false);
//       } else {
//         Alert.alert("Error", res.message || "Failed to save profile");
//       }
//     } catch (err) {
//       console.error("Update error:", err);
//       Alert.alert("Error", "Something went wrong");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Remove skill
//   const removeSkill = (code) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setSkills(skills.filter((s) => s !== code));
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text>Loading profile...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Name & Bio */}
//       <TextInput
//         style={[styles.input, !editing && styles.readOnly]}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//         editable={editing}
//       />
//       <TextInput
//         style={[styles.input, { height: 80 }, !editing && styles.readOnly]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//         editable={editing}
//       />

//       {/* Phone */}
//       <TextInput
//         style={[styles.input, !editing && styles.readOnly]}
//         placeholder="Phone Number"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//         editable={editing && !phoneVerified}
//       />
//       {phoneVerified && <Text style={styles.verified}>✅ Phone Verified</Text>}

//       {/* Selected Skills */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>Selected Skills:</Text>
//       {skills.length > 0 ? (
//         skills.map((code, i) => {
//           const cat = categories.find((c) => c.code === code);
//           return (
//             <View key={i} style={styles.skillItem}>
//               <Text style={{ fontWeight: "600" }}>
//                 {cat ? cat.skillName || cat.name : code}
//               </Text>
//               {editing && (
//                 <TouchableOpacity onPress={() => removeSkill(code)}>
//                   <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           );
//         })
//       ) : (
//         <Text style={{ color: "#666", marginVertical: 8 }}>
//           No skills selected
//         </Text>
//       )}

//       {/* Skill Picker */}
//       {editing && (
//         <>
//           <TouchableOpacity
//             style={[styles.btnSmall, { backgroundColor: "#009688" }]}
//             onPress={() => setShowCategories(!showCategories)}
//           >
//             <Text style={styles.btnSmallText}>
//               {showCategories ? "Hide Skill List" : "Choose Skills"}
//             </Text>
//           </TouchableOpacity>

//           {showCategories && (
//             <View style={styles.categoryList}>
//               {categories.map((cat) => {
//                 const selected = skills.includes(cat.code);
//                 return (
//                   <TouchableOpacity
//                     key={cat.code}
//                     style={[
//                       styles.skillItem,
//                       { backgroundColor: selected ? "#C8E6C9" : "#f1f5f9" },
//                     ]}
//                     onPress={() => {
//                       if (selected) removeSkill(cat.code);
//                       else setSkills([...skills, cat.code]);
//                     }}
//                   >
//                     <View
//                       style={{ flexDirection: "row", alignItems: "center" }}
//                     >
//                       <Ionicons
//                         name={selected ? "checkmark-circle" : "ellipse-outline"}
//                         size={20}
//                         color={selected ? "#2e7d32" : "#888"}
//                         style={{ marginRight: 8 }}
//                       />
//                       <View>
//                         <Text style={{ fontWeight: "600" }}>
//                           {cat.skillName || cat.name}
//                         </Text>
//                         <Text style={{ color: "#777", fontSize: 12 }}>
//                           Code: {cat.code}
//                         </Text>
//                       </View>
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>
//           )}
//         </>
//       )}

//       {/* Save Profile */}
//       <TouchableOpacity style={styles.btn} onPress={submitProfile}>
//         <Text style={styles.btnText}>
//           {saving ? "Saving..." : "Save Profile"}
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
//   readOnly: { backgroundColor: "#f2f2f2", color: "#666" },
//   btn: {
//     backgroundColor: "#1976D2",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
//   btnSmall: {
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 12,
//     backgroundColor: "#1976D2",
//   },
//   btnSmallText: { color: "#fff", fontWeight: "700" },
//   skillItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 10,
//     backgroundColor: "#f1f5f9",
//     borderRadius: 8,
//     marginBottom: 6,
//     alignItems: "center",
//   },
//   verified: { color: "green", fontWeight: "bold", marginBottom: 10 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryList: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     marginTop: 10,
//     padding: 8,
//   },
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
//   fetchDoerCategories, // ✅ new import
// } from "../api/doer"; // ✅ only from doer.js

// // Enable smooth animations for Android
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [showCategories, setShowCategories] = useState(false);

//   const [editing, setEditing] = useState(true);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [kycUploaded, setKycUploaded] = useState(false);
//   const [kycPending, setKycPending] = useState(false);

//   const kycVisible = phoneVerified;

//   // Header setup
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Edit Profile",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.navigate("Dashboard")}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // Load profile
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
//         setSkills(Array.isArray(p.skills) ? p.skills : []);
//         setPhoneVerified(p.is_phone_verified === true);
//         setKycUploaded(p.kycLevel > 0);
//         setKycPending(p.kycStatus === "PENDING");
//         setEditing(!p.is_phone_verified);
//         setOtpSent(false);
//         setOtp("");

//         await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//       }
//     } catch (err) {
//       Alert.alert("Error", "Please Register");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Refresh on focus
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", loadProfile);
//     return unsubscribe;
//   }, [navigation]);

//   // ✅ Fetch categories for Doer
//   useEffect(() => {
//     const fetchCategoriesData = async () => {
//       try {
//         const res = await fetchDoerCategories();
//         if (res?.status === "SUCCESS" && Array.isArray(res.data)) {
//           setCategories(res.data);
//         } else {
//           console.warn("No categories returned:", res);
//         }
//       } catch (err) {
//         console.error("Category fetch failed:", err);
//       }
//     };
//     fetchCategoriesData();
//   }, []);

//   // Save Profile
//   const submitProfile = async () => {
//     if (!name.trim() || !phone.trim())
//       return Alert.alert("Validation", "Name and Phone are required");
//     setSaving(true);
//     try {
//       const payload = { name, email, bio, phone, skills };
//       const res = await updateDoerProfile(payload);
//       if (res.status === "SUCCESS") {
//         await loadProfile();
//         Alert.alert("Success", "Profile saved");
//         setEditing(false);
//       } else {
//         Alert.alert("Error", res.message || "Failed to save profile");
//       }
//     } catch (err) {
//       console.error("Update error:", err);
//       Alert.alert("Error", "Something went wrong");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Remove skill
//   const removeSkill = (code) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setSkills(skills.filter((s) => s !== code));
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text>Loading profile...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Name & Bio */}
//       <TextInput
//         style={[styles.input, !editing && styles.readOnly]}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//         editable={editing}
//       />
//       <TextInput
//         style={[styles.input, { height: 80 }, !editing && styles.readOnly]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//         editable={editing}
//       />

//       {/* Phone */}
//       <TextInput
//         style={[styles.input, !editing && styles.readOnly]}
//         placeholder="Phone Number"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//         editable={editing && !phoneVerified}
//       />

//       {phoneVerified && <Text style={styles.verified}>✅ Phone Verified</Text>}

//       {/* 🔐 OTP Verification Section */}
//       {!phoneVerified && (
//         <View style={{ marginTop: 10 }}>
//           {!otpSent ? (
//             <TouchableOpacity
//               style={[styles.btnSmall, { backgroundColor: "#4CAF50" }]}
//               onPress={async () => {
//                 try {
//                   const res = await sendPhoneOtp();
//                   if (res?.status === "SUCCESS") {
//                     setSessionId(res.data?.sessionId);
//                     setOtpSent(true);
//                     Alert.alert(
//                       "OTP Sent",
//                       "Check your phone for the verification code."
//                     );
//                   } else {
//                     Alert.alert("Error", res?.message || "Failed to send OTP");
//                   }
//                 } catch (err) {
//                   Alert.alert("Error", "Failed to send OTP. Please try again.");
//                   console.error("Send OTP Error:", err);
//                 }
//               }}
//             >
//               <Text style={styles.btnSmallText}>Send OTP</Text>
//             </TouchableOpacity>
//           ) : (
//             <>
//               <TextInput
//                 style={[styles.input, { marginTop: 10 }]}
//                 placeholder="Enter OTP"
//                 keyboardType="numeric"
//                 value={otp}
//                 onChangeText={setOtp}
//               />
//               <TouchableOpacity
//                 style={[styles.btnSmall, { backgroundColor: "#009688" }]}
//                 onPress={async () => {
//                   if (!otp.trim()) {
//                     return Alert.alert("Error", "Please enter the OTP");
//                   }
//                   try {
//                     const res = await verifyPhoneOtp(sessionId, otp);
//                     if (res?.status === "SUCCESS") {
//                       Alert.alert(
//                         "Success",
//                         "Phone number verified successfully!"
//                       );
//                       setPhoneVerified(true);
//                       setOtpSent(false);
//                       setOtp("");
//                       await loadProfile();
//                     } else {
//                       Alert.alert("Error", res?.message || "Invalid OTP");
//                     }
//                   } catch (err) {
//                     Alert.alert("Error", "Failed to verify OTP");
//                     console.error("Verify OTP Error:", err);
//                   }
//                 }}
//               >
//                 <Text style={styles.btnSmallText}>Verify OTP</Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       )}

//       {/* Selected Skills */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>Selected Skills:</Text>
//       {skills.length > 0 ? (
//         skills.map((code, i) => {
//           const cat = categories.find((c) => c.code === code);
//           return (
//             <View key={i} style={styles.skillItem}>
//               <Text style={{ fontWeight: "600" }}>
//                 {cat ? cat.skillName || cat.name : code}
//               </Text>
//               {editing && (
//                 <TouchableOpacity onPress={() => removeSkill(code)}>
//                   <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           );
//         })
//       ) : (
//         <Text style={{ color: "#666", marginVertical: 8 }}>
//           No skills selected
//         </Text>
//       )}

//       {/* Skill Picker */}
//       {editing && (
//         <>
//           <TouchableOpacity
//             style={[styles.btnSmall, { backgroundColor: "#009688" }]}
//             onPress={() => setShowCategories(!showCategories)}
//           >
//             <Text style={styles.btnSmallText}>
//               {showCategories ? "Hide Skill List" : "Choose Skills"}
//             </Text>
//           </TouchableOpacity>

//           {showCategories && (
//             <View style={styles.categoryList}>
//               {categories.map((cat) => {
//                 const selected = skills.includes(cat.code);
//                 return (
//                   <TouchableOpacity
//                     key={cat.code}
//                     style={[
//                       styles.skillItem,
//                       { backgroundColor: selected ? "#C8E6C9" : "#f1f5f9" },
//                     ]}
//                     onPress={() => {
//                       if (selected) removeSkill(cat.code);
//                       else setSkills([...skills, cat.code]);
//                     }}
//                   >
//                     <View
//                       style={{ flexDirection: "row", alignItems: "center" }}
//                     >
//                       <Ionicons
//                         name={selected ? "checkmark-circle" : "ellipse-outline"}
//                         size={20}
//                         color={selected ? "#2e7d32" : "#888"}
//                         style={{ marginRight: 8 }}
//                       />
//                       <View>
//                         <Text style={{ fontWeight: "600" }}>
//                           {cat.skillName || cat.name}
//                         </Text>
//                         <Text style={{ color: "#777", fontSize: 12 }}>
//                           Code: {cat.code}
//                         </Text>
//                       </View>
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>
//           )}
//         </>
//       )}

//       {/* Save Profile */}
//       <TouchableOpacity style={styles.btn} onPress={submitProfile}>
//         <Text style={styles.btnText}>
//           {saving ? "Saving..." : "Save Profile"}
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
//   readOnly: { backgroundColor: "#f2f2f2", color: "#666" },
//   btn: {
//     backgroundColor: "#1976D2",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
//   btnSmall: {
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 12,
//     backgroundColor: "#1976D2",
//   },
//   btnSmallText: { color: "#fff", fontWeight: "700" },
//   skillItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 10,
//     backgroundColor: "#f1f5f9",
//     borderRadius: 8,
//     marginBottom: 6,
//     alignItems: "center",
//   },
//   verified: { color: "green", fontWeight: "bold", marginBottom: 10 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryList: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     marginTop: 10,
//     padding: 8,
//   },
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
//   fetchDoerCategories,
// } from "../api/doer";

// // Enable smooth animations for Android
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [showCategories, setShowCategories] = useState(false);

//   const [editing, setEditing] = useState(true);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [kycUploaded, setKycUploaded] = useState(false);
//   const [kycPending, setKycPending] = useState(false);

//   const kycVisible = phoneVerified;

//   // Header setup
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Edit Profile",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.navigate("Dashboard")}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // Load profile
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
//         setSkills(Array.isArray(p.skills) ? p.skills : []);
//         setPhoneVerified(p.is_phone_verified === true);
//         setKycUploaded(p.kycLevel > 0);
//         setKycPending(p.kycStatus === "PENDING");
//         setEditing(!p.is_phone_verified);
//         setOtpSent(false);
//         setOtp("");

//         await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//       }
//     } catch (err) {
//       Alert.alert("Error", "Please Register");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Refresh on focus
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", loadProfile);
//     return unsubscribe;
//   }, [navigation]);

//   // ✅ Fetch categories for Doer
//   useEffect(() => {
//     const fetchCategoriesData = async () => {
//       try {
//         const res = await fetchDoerCategories();
//         if (res?.status === "SUCCESS" && Array.isArray(res.data)) {
//           setCategories(res.data);
//         } else {
//           console.warn("No categories returned:", res);
//         }
//       } catch (err) {
//         console.error("Category fetch failed:", err);
//       }
//     };
//     fetchCategoriesData();
//   }, []);

//   // Save Profile
//   const submitProfile = async () => {
//     if (!name.trim() || !phone.trim())
//       return Alert.alert("Validation", "Name and Phone are required");
//     setSaving(true);
//     try {
//       const payload = { name, email, bio, phone, skills };
//       const res = await updateDoerProfile(payload);
//       if (res.status === "SUCCESS") {
//         await loadProfile();
//         Alert.alert("Success", "Profile saved");
//         setEditing(false);
//       } else {
//         Alert.alert("Error", res.message || "Failed to save profile");
//       }
//     } catch (err) {
//       console.error("Update error:", err);
//       Alert.alert("Error", "Something went wrong");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Remove skill
//   const removeSkill = (code) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setSkills(skills.filter((s) => s !== code));
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text>Loading profile...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Name & Bio */}
//       <TextInput
//         style={[styles.input, !editing && styles.readOnly]}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//         editable={editing}
//       />
//       <TextInput
//         style={[styles.input, { height: 80 }, !editing && styles.readOnly]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//         editable={editing}
//       />

//       {/* Phone */}
//       <TextInput
//         style={[styles.input, !editing && styles.readOnly]}
//         placeholder="Phone Number"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//         editable={editing && !phoneVerified}
//       />

//       {phoneVerified && <Text style={styles.verified}>✅ Phone Verified</Text>}

//       {/* 🔐 OTP Verification Section */}
//       {!phoneVerified && (
//         <View style={{ marginTop: 10 }}>
//           {!otpSent ? (
//             <TouchableOpacity
//               style={[styles.btnSmall, { backgroundColor: "#4CAF50" }]}
//               onPress={async () => {
//                 try {
//                   const res = await sendPhoneOtp();
//                   if (res?.status === "SUCCESS") {
//                     setSessionId(res.data?.sessionId);
//                     setOtpSent(true);
//                     Alert.alert(
//                       "OTP Sent",
//                       "Check your phone for the verification code."
//                     );
//                   } else {
//                     Alert.alert("Error", res?.message || "Failed to send OTP");
//                   }
//                 } catch (err) {
//                   Alert.alert("Error", "Failed to send OTP. Please try again.");
//                   console.error("Send OTP Error:", err);
//                 }
//               }}
//             >
//               <Text style={styles.btnSmallText}>Send OTP</Text>
//             </TouchableOpacity>
//           ) : (
//             <>
//               <TextInput
//                 style={[styles.input, { marginTop: 10 }]}
//                 placeholder="Enter OTP"
//                 keyboardType="numeric"
//                 value={otp}
//                 onChangeText={setOtp}
//               />
//               <TouchableOpacity
//                 style={[styles.btnSmall, { backgroundColor: "#009688" }]}
//                 onPress={async () => {
//                   if (!otp.trim()) {
//                     return Alert.alert("Error", "Please enter the OTP");
//                   }
//                   try {
//                     const res = await verifyPhoneOtp(sessionId, otp);
//                     if (res?.status === "SUCCESS") {
//                       LayoutAnimation.configureNext(
//                         LayoutAnimation.Presets.easeInEaseOut
//                       );
//                       setPhoneVerified(true);
//                       setOtpSent(false);
//                       setOtp("");
//                       Alert.alert(
//                         "Success",
//                         "Phone number verified successfully!"
//                       );

//                       // optional: reload profile after short delay
//                       setTimeout(() => {
//                         loadProfile();
//                       }, 2000);
//                     } else {
//                       Alert.alert("Error", res?.message || "Invalid OTP");
//                     }
//                   } catch (err) {
//                     Alert.alert("Error", "Failed to verify OTP");
//                     console.error("Verify OTP Error:", err);
//                   }
//                 }}
//               >
//                 <Text style={styles.btnSmallText}>Verify OTP</Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       )}

//       {/* Selected Skills */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>Selected Skills:</Text>
//       {skills.length > 0 ? (
//         skills.map((code, i) => {
//           const cat = categories.find((c) => c.code === code);
//           return (
//             <View key={i} style={styles.skillItem}>
//               <Text style={{ fontWeight: "600" }}>
//                 {cat ? cat.skillName || cat.name : code}
//               </Text>
//               {editing && (
//                 <TouchableOpacity onPress={() => removeSkill(code)}>
//                   <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           );
//         })
//       ) : (
//         <Text style={{ color: "#666", marginVertical: 8 }}>
//           No skills selected
//         </Text>
//       )}

//       {/* Skill Picker */}
//       {editing && (
//         <>
//           <TouchableOpacity
//             style={[styles.btnSmall, { backgroundColor: "#009688" }]}
//             onPress={() => setShowCategories(!showCategories)}
//           >
//             <Text style={styles.btnSmallText}>
//               {showCategories ? "Hide Skill List" : "Choose Skills"}
//             </Text>
//           </TouchableOpacity>

//           {showCategories && (
//             <View style={styles.categoryList}>
//               {categories.map((cat) => {
//                 const selected = skills.includes(cat.code);
//                 return (
//                   <TouchableOpacity
//                     key={cat.code}
//                     style={[
//                       styles.skillItem,
//                       { backgroundColor: selected ? "#C8E6C9" : "#f1f5f9" },
//                     ]}
//                     onPress={() => {
//                       if (selected) removeSkill(cat.code);
//                       else setSkills([...skills, cat.code]);
//                     }}
//                   >
//                     <View
//                       style={{ flexDirection: "row", alignItems: "center" }}
//                     >
//                       <Ionicons
//                         name={selected ? "checkmark-circle" : "ellipse-outline"}
//                         size={20}
//                         color={selected ? "#2e7d32" : "#888"}
//                         style={{ marginRight: 8 }}
//                       />
//                       <View>
//                         <Text style={{ fontWeight: "600" }}>
//                           {cat.skillName || cat.name}
//                         </Text>
//                         <Text style={{ color: "#777", fontSize: 12 }}>
//                           Code: {cat.code}
//                         </Text>
//                       </View>
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>
//           )}
//         </>
//       )}

//       {/* Save Profile */}
//       <TouchableOpacity style={styles.btn} onPress={submitProfile}>
//         <Text style={styles.btnText}>
//           {saving ? "Saving..." : "Save Profile"}
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
//   readOnly: { backgroundColor: "#f2f2f2", color: "#666" },
//   btn: {
//     backgroundColor: "#1976D2",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
//   btnSmall: {
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 12,
//     backgroundColor: "#1976D2",
//   },
//   btnSmallText: { color: "#fff", fontWeight: "700" },
//   skillItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 10,
//     backgroundColor: "#f1f5f9",
//     borderRadius: 8,
//     marginBottom: 6,
//     alignItems: "center",
//   },
//   verified: { color: "green", fontWeight: "bold", marginBottom: 10 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryList: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     marginTop: 10,
//     padding: 8,
//   },
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
//   fetchDoerCategories,
// } from "../api/doer";

// // Enable layout animation (Android)
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [showCategories, setShowCategories] = useState(false);

//   const [editing, setEditing] = useState(true);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [kycUploaded, setKycUploaded] = useState(false);
//   const [kycPending, setKycPending] = useState(false);

//   // NEW: Store original profile for merging
//   const [originalProfile, setOriginalProfile] = useState({});

//   const kycVisible = phoneVerified;

//   // Header
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Edit Profile",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.navigate("Dashboard")}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   /** Load profile */
//   const loadProfile = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchDoerProfile();

//       if (res?.status === "SUCCESS" && res.data) {
//         const p = res.data;

//         // Store for merging old + new values
//         setOriginalProfile(p);

//         setName(p.name || "");
//         setEmail(p.email || "");
//         setBio(p.bio || "");
//         setPhone(p.phone || "");
//         setSkills(Array.isArray(p.skills) ? p.skills : []);

//         setPhoneVerified(p.is_phone_verified === true);
//         setKycUploaded(p.kycLevel > 0);
//         setKycPending(p.kycStatus === "PENDING");
//         setEditing(!p.is_phone_verified);

//         setOtpSent(false);
//         setOtp("");

//         await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//       }
//     } catch (err) {
//       Alert.alert("Error", "Please Register");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Refresh on focus
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", loadProfile);
//     return unsubscribe;
//   }, [navigation]);

//   // Fetch categories (skills)
//   useEffect(() => {
//     const fetchCategoriesData = async () => {
//       try {
//         const res = await fetchDoerCategories();

//         if (res?.status === "SUCCESS" && Array.isArray(res.data)) {
//           setCategories(res.data);
//         }
//       } catch (err) {
//         console.error("Category fetch failed:", err);
//       }
//     };

//     fetchCategoriesData();
//   }, []);

//   /** Save profile — FIXED VERSION */
//   const submitProfile = async () => {
//     if (!name.trim() || !phone.trim())
//       return Alert.alert("Validation", "Name and Phone are required");

//     setSaving(true);

//     try {
//       // Merge ORIGINAL + UPDATED values
//       const payload = {
//         name: name || originalProfile.name,
//         email: email || originalProfile.email,
//         bio: bio || originalProfile.bio,
//         phone: phone || originalProfile.phone,
//         skills: skills.length > 0 ? skills : originalProfile.skills || [],
//       };

//       const res = await updateDoerProfile(payload);

//       if (res.status === "SUCCESS") {
//         await loadProfile();
//         Alert.alert("Success", "Profile updated successfully!");
//         setEditing(false);
//       } else {
//         Alert.alert("Error", res.message || "Failed to update");
//       }
//     } catch (err) {
//       console.error("Update error:", err);
//       Alert.alert("Error", "Something went wrong");
//     } finally {
//       setSaving(false);
//     }
//   };

//   /** Remove a skill */
//   const removeSkill = (code) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setSkills(skills.filter((s) => s !== code));
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text>Loading profile...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Name */}
//       <TextInput
//         style={[styles.input, !editing && styles.readOnly]}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//         editable={editing}
//       />

//       {/* Bio */}
//       <TextInput
//         style={[styles.input, { height: 80 }, !editing && styles.readOnly]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//         editable={editing}
//       />

//       {/* Phone */}
//       <TextInput
//         style={[styles.input, !editing && styles.readOnly]}
//         placeholder="Phone Number"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//         editable={editing && !phoneVerified}
//       />

//       {phoneVerified && <Text style={styles.verified}>✅ Phone Verified</Text>}

//       {/* ----- OTP Section ----- */}
//       {!phoneVerified && (
//         <View style={{ marginTop: 10 }}>
//           {!otpSent ? (
//             <TouchableOpacity
//               style={[styles.btnSmall, { backgroundColor: "#4CAF50" }]}
//               onPress={async () => {
//                 try {
//                   const res = await sendPhoneOtp();
//                   if (res?.status === "SUCCESS") {
//                     setSessionId(res.data?.sessionId);
//                     setOtpSent(true);
//                     Alert.alert("OTP Sent", "Check your phone");
//                   }
//                 } catch (err) {
//                   Alert.alert("Error", "Failed to send OTP");
//                 }
//               }}
//             >
//               <Text style={styles.btnSmallText}>Send OTP</Text>
//             </TouchableOpacity>
//           ) : (
//             <>
//               <TextInput
//                 style={[styles.input, { marginTop: 10 }]}
//                 placeholder="Enter OTP"
//                 keyboardType="numeric"
//                 value={otp}
//                 onChangeText={setOtp}
//               />

//               <TouchableOpacity
//                 style={[styles.btnSmall, { backgroundColor: "#009688" }]}
//                 onPress={async () => {
//                   if (!otp.trim()) return Alert.alert("Error", "Enter OTP");

//                   try {
//                     const res = await verifyPhoneOtp(sessionId, otp);
//                     if (res?.status === "SUCCESS") {
//                       LayoutAnimation.configureNext(
//                         LayoutAnimation.Presets.easeInEaseOut
//                       );
//                       setPhoneVerified(true);
//                       setOtpSent(false);
//                       setOtp("");
//                       Alert.alert("Success", "Phone verified");
//                       loadProfile();
//                     } else {
//                       Alert.alert("Error", res?.message || "Invalid OTP");
//                     }
//                   } catch {
//                     Alert.alert("Error", "Failed to verify OTP");
//                   }
//                 }}
//               >
//                 <Text style={styles.btnSmallText}>Verify OTP</Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       )}

//       {/* ----- Display Selected Skills ----- */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>Selected Skills:</Text>

//       {skills.length > 0 ? (
//         skills.map((code, i) => {
//           const cat = categories.find((c) => c.code === code);
//           return (
//             <View key={i} style={styles.skillItem}>
//               <Text style={{ fontWeight: "600" }}>
//                 {cat ? cat.skillName || cat.name : code}
//               </Text>

//               {editing && (
//                 <TouchableOpacity onPress={() => removeSkill(code)}>
//                   <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           );
//         })
//       ) : (
//         <Text style={{ color: "#666", marginVertical: 8 }}>
//           No skills selected
//         </Text>
//       )}

//       {/* ----- Skill Picker ----- */}
//       {editing && (
//         <>
//           <TouchableOpacity
//             style={[styles.btnSmall, { backgroundColor: "#009688" }]}
//             onPress={() => setShowCategories(!showCategories)}
//           >
//             <Text style={styles.btnSmallText}>
//               {showCategories ? "Hide Skill List" : "Choose Skills"}
//             </Text>
//           </TouchableOpacity>

//           {showCategories && (
//             <View style={styles.categoryList}>
//               {categories.map((cat) => {
//                 const selected = skills.includes(cat.code);
//                 return (
//                   <TouchableOpacity
//                     key={cat.code}
//                     style={[
//                       styles.skillItem,
//                       {
//                         backgroundColor: selected ? "#C8E6C9" : "#f1f5f9",
//                       },
//                     ]}
//                     onPress={() => {
//                       if (selected) removeSkill(cat.code);
//                       else setSkills([...skills, cat.code]);
//                     }}
//                   >
//                     <View
//                       style={{
//                         flexDirection: "row",
//                         alignItems: "center",
//                       }}
//                     >
//                       <Ionicons
//                         name={selected ? "checkmark-circle" : "ellipse-outline"}
//                         size={20}
//                         color={selected ? "#2e7d32" : "#888"}
//                         style={{ marginRight: 8 }}
//                       />

//                       <View>
//                         <Text style={{ fontWeight: "600" }}>
//                           {cat.skillName || cat.name}
//                         </Text>
//                         <Text style={{ color: "#777", fontSize: 12 }}>
//                           Code: {cat.code}
//                         </Text>
//                       </View>
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>
//           )}
//         </>
//       )}

//       {/* Save Button */}
//       <TouchableOpacity style={styles.btn} onPress={submitProfile}>
//         <Text style={styles.btnText}>
//           {saving ? "Saving..." : "Save Profile"}
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
//   readOnly: { backgroundColor: "#f2f2f2", color: "#666" },
//   btn: {
//     backgroundColor: "#1976D2",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
//   btnSmall: {
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 12,
//   },
//   btnSmallText: { color: "#fff", fontWeight: "700" },
//   skillItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 10,
//     backgroundColor: "#f1f5f9",
//     borderRadius: 8,
//     marginBottom: 6,
//     alignItems: "center",
//   },
//   verified: { color: "green", fontWeight: "bold", marginBottom: 10 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryList: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     marginTop: 10,
//     padding: 8,
//   },
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
//   fetchDoerCategories,
// } from "../api/doer";

// // Enable smooth animations for Android
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [showCategories, setShowCategories] = useState(false);

//   const [editing, setEditing] = useState(true);
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [kycUploaded, setKycUploaded] = useState(false);
//   const [kycPending, setKycPending] = useState(false);

//   const kycVisible = phoneVerified;

//   // Header setup
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Edit Profile",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.navigate("Dashboard")}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // Load profile
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
//         setSkills(Array.isArray(p.skills) ? p.skills : []);
//         setPhoneVerified(p.is_phone_verified === true);
//         setKycUploaded(p.kycLevel > 0);
//         setKycPending(p.kycStatus === "PENDING");
//         setEditing(!p.is_phone_verified);
//         setOtpSent(false);
//         setOtp("");

//         await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//       }
//     } catch (err) {
//       Alert.alert("Error", "Please Register");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Refresh on focus
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", loadProfile);
//     return unsubscribe;
//   }, [navigation]);

//   // ✅ Fetch categories for Doer
//   useEffect(() => {
//     const fetchCategoriesData = async () => {
//       try {
//         const res = await fetchDoerCategories();
//         if (res?.status === "SUCCESS" && Array.isArray(res.data)) {
//           setCategories(res.data);
//         } else {
//           console.warn("No categories returned:", res);
//         }
//       } catch (err) {
//         console.error("Category fetch failed:", err);
//       }
//     };
//     fetchCategoriesData();
//   }, []);

//   // Save Profile
//   const submitProfile = async () => {
//     if (!name.trim() || !phone.trim())
//       return Alert.alert("Validation", "Name and Phone are required");
//     setSaving(true);
//     try {
//       const payload = { name, email, bio, phone, skills };
//       const res = await updateDoerProfile(payload);
//       if (res.status === "SUCCESS") {
//         await loadProfile();
//         Alert.alert("Success", "Profile saved");
//         setEditing(false);
//       } else {
//         Alert.alert("Error", res.message || "Failed to save profile");
//       }
//     } catch (err) {
//       console.error("Update error:", err);
//       Alert.alert("Error", "Something went wrong");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Remove skill
//   const removeSkill = (code) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setSkills(skills.filter((s) => s !== code));
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text>Loading profile...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Name & Bio */}
//       <TextInput
//         style={[styles.input, !editing && styles.readOnly]}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//         editable={editing}
//       />
//       <TextInput
//         style={[styles.input, { height: 80 }, !editing && styles.readOnly]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//         editable={editing}
//       />

//       {/* Phone */}
//       <TextInput
//         style={[styles.input, !editing && styles.readOnly]}
//         placeholder="Phone Number"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//         editable={editing && !phoneVerified}
//       />

//       {phoneVerified && <Text style={styles.verified}>✅ Phone Verified</Text>}

//       {/* 🔐 OTP Verification Section */}
//       {!phoneVerified && (
//         <View style={{ marginTop: 10 }}>
//           {!otpSent ? (
//             <TouchableOpacity
//               style={[styles.btnSmall, { backgroundColor: "#4CAF50" }]}
//               onPress={async () => {
//                 try {
//                   const res = await sendPhoneOtp();
//                   if (res?.status === "SUCCESS") {
//                     setSessionId(res.data?.sessionId);
//                     setOtpSent(true);
//                     Alert.alert(
//                       "OTP Sent",
//                       "Check your phone for the verification code."
//                     );
//                   } else {
//                     Alert.alert("Error", res?.message || "Failed to send OTP");
//                   }
//                 } catch (err) {
//                   Alert.alert("Error", "Failed to send OTP. Please try again.");
//                   console.error("Send OTP Error:", err);
//                 }
//               }}
//             >
//               <Text style={styles.btnSmallText}>Send OTP</Text>
//             </TouchableOpacity>
//           ) : (
//             <>
//               <TextInput
//                 style={[styles.input, { marginTop: 10 }]}
//                 placeholder="Enter OTP"
//                 keyboardType="numeric"
//                 value={otp}
//                 onChangeText={setOtp}
//               />
//               <TouchableOpacity
//                 style={[styles.btnSmall, { backgroundColor: "#009688" }]}
//                 onPress={async () => {
//                   if (!otp.trim()) {
//                     return Alert.alert("Error", "Please enter the OTP");
//                   }
//                   try {
//                     const res = await verifyPhoneOtp(sessionId, otp);
//                     if (res?.status === "SUCCESS") {
//                       LayoutAnimation.configureNext(
//                         LayoutAnimation.Presets.easeInEaseOut
//                       );
//                       setPhoneVerified(true);
//                       setOtpSent(false);
//                       setOtp("");
//                       Alert.alert(
//                         "Success",
//                         "Phone number verified successfully!"
//                       );

//                       // optional: reload profile after short delay
//                       setTimeout(() => {
//                         loadProfile();
//                       }, 2000);
//                     } else {
//                       Alert.alert("Error", res?.message || "Invalid OTP");
//                     }
//                   } catch (err) {
//                     Alert.alert("Error", "Failed to verify OTP");
//                     console.error("Verify OTP Error:", err);
//                   }
//                 }}
//               >
//                 <Text style={styles.btnSmallText}>Verify OTP</Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       )}

//       {/* Selected Skills */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>Selected Skills:</Text>
//       {skills.length > 0 ? (
//         skills.map((code, i) => {
//           const cat = categories.find((c) => c.code === code);
//           return (
//             <View key={i} style={styles.skillItem}>
//               <Text style={{ fontWeight: "600" }}>
//                 {cat ? cat.skillName || cat.name : code}
//               </Text>
//               {editing && (
//                 <TouchableOpacity onPress={() => removeSkill(code)}>
//                   <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           );
//         })
//       ) : (
//         <Text style={{ color: "#666", marginVertical: 8 }}>
//           No skills selected
//         </Text>
//       )}

//       {/* Skill Picker */}
//       {editing && (
//         <>
//           <TouchableOpacity
//             style={[styles.btnSmall, { backgroundColor: "#009688" }]}
//             onPress={() => setShowCategories(!showCategories)}
//           >
//             <Text style={styles.btnSmallText}>
//               {showCategories ? "Hide Skill List" : "Choose Skills"}
//             </Text>
//           </TouchableOpacity>

//           {showCategories && (
//             <View style={styles.categoryList}>
//               {categories.map((cat) => {
//                 const selected = skills.includes(cat.code);
//                 return (
//                   <TouchableOpacity
//                     key={cat.code}
//                     style={[
//                       styles.skillItem,
//                       { backgroundColor: selected ? "#C8E6C9" : "#f1f5f9" },
//                     ]}
//                     onPress={() => {
//                       if (selected) removeSkill(cat.code);
//                       else setSkills([...skills, cat.code]);
//                     }}
//                   >
//                     <View
//                       style={{ flexDirection: "row", alignItems: "center" }}
//                     >
//                       <Ionicons
//                         name={selected ? "checkmark-circle" : "ellipse-outline"}
//                         size={20}
//                         color={selected ? "#2e7d32" : "#888"}
//                         style={{ marginRight: 8 }}
//                       />
//                       <View>
//                         <Text style={{ fontWeight: "600" }}>
//                           {cat.skillName || cat.name}
//                         </Text>
//                         <Text style={{ color: "#777", fontSize: 12 }}>
//                           Code: {cat.code}
//                         </Text>
//                       </View>
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>
//           )}
//         </>
//       )}

//       {/* Save Profile */}
//       <TouchableOpacity style={styles.btn} onPress={submitProfile}>
//         <Text style={styles.btnText}>
//           {saving ? "Saving..." : "Save Profile"}
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
//   readOnly: { backgroundColor: "#f2f2f2", color: "#666" },
//   btn: {
//     backgroundColor: "#1976D2",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
//   btnSmall: {
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 12,
//     backgroundColor: "#1976D2",
//   },
//   btnSmallText: { color: "#fff", fontWeight: "700" },
//   skillItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 10,
//     backgroundColor: "#f1f5f9",
//     borderRadius: 8,
//     marginBottom: 6,
//     alignItems: "center",
//   },
//   verified: { color: "green", fontWeight: "bold", marginBottom: 10 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryList: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     marginTop: 10,
//     padding: 8,
//   },
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
//   fetchDoerCategories,
// } from "../api/doer";

// // Enable layout animation (Android)
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]);

//   const [categories, setCategories] = useState([]);
//   const [showCategories, setShowCategories] = useState(false);
//   const [editing, setEditing] = useState(true);

//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [sessionId, setSessionId] = useState("");

//   const [originalProfile, setOriginalProfile] = useState({});

//   // Header
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Edit Profile",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.navigate("Dashboard")}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   /** Load profile */
//   const loadProfile = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchDoerProfile();
//       if (res?.status === "SUCCESS" && res.data) {
//         const p = res.data;

//         setOriginalProfile(p);

//         setName(p.name || "");
//         setEmail(p.email || "");
//         setBio(p.bio || "");
//         setPhone(p.phone || "");

//         // skills already array of codes
//         setSkills(Array.isArray(p.skills) ? p.skills : []);

//         setPhoneVerified(p.is_phone_verified === true);

//         setEditing(true);
//         setOtpSent(false);
//         setOtp("");

//         await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//       }
//     } catch (err) {
//       Alert.alert("Error", "Please Register");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Refresh on focus
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", loadProfile);
//     return unsubscribe;
//   }, [navigation]);

//   // Fetch categories (skills)
//   useEffect(() => {
//     const fetchCategoriesData = async () => {
//       try {
//         const res = await fetchDoerCategories();
//         if (res?.status === "SUCCESS" && Array.isArray(res.data)) {
//           setCategories(res.data);
//         }
//       } catch (err) {
//         console.error("Category fetch failed:", err);
//       }
//     };
//     fetchCategoriesData();
//   }, []);
//   const submitProfile = async () => {
//     if (!name.trim() || !phone.trim()) {
//       return Alert.alert("Validation", "Name and Phone are required");
//     }

//     setSaving(true);

//     try {
//       const payload = {
//         name,
//         email,
//         bio,
//         phone,
//         skills: skills.length ? skills : originalProfile.skills || [],
//       };

//       // ✅ LOG EXACT DATA SENDING TO BACKEND
//       console.log("========== SENDING TO BACKEND ==========");
//       console.log("Payload:", payload);
//       console.log("Skills:", payload.skills);
//       console.log("=========================================");

//       const res = await updateDoerProfile(payload);

//       if (res.status === "SUCCESS") {
//         await loadProfile();
//         Alert.alert("Success", "Profile updated successfully!");
//         setEditing(false);
//       } else {
//         Alert.alert("Error", res.message || "Failed to update");
//       }
//     } catch (err) {
//       console.error("Update error:", err);
//       Alert.alert("Error", "Something went wrong");
//     } finally {
//       setSaving(false);
//     }
//   };

//   /** Remove a skill */
//   const removeSkill = (code) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setSkills(skills.filter((s) => s !== code));
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text>Loading profile...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Name */}
//       <TextInput
//         style={[styles.input]}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//       />

//       {/* Bio */}
//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//       />

//       {/* Phone */}
//       <TextInput
//         style={[styles.input]}
//         placeholder="Phone Number"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//         editable={!phoneVerified}
//       />

//       {phoneVerified && <Text style={styles.verified}>✅ Phone Verified</Text>}

//       {/* Skills */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>Selected Skills:</Text>

//       {skills.length > 0 ? (
//         skills.map((code, i) => {
//           const cat = categories.find((c) => c.code == code);
//           return (
//             <View key={i} style={styles.skillItem}>
//               <Text style={{ fontWeight: "600" }}>
//                 {cat ? cat.skillName : code}
//               </Text>
//               <TouchableOpacity onPress={() => removeSkill(code)}>
//                 <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
//               </TouchableOpacity>
//             </View>
//           );
//         })
//       ) : (
//         <Text style={{ color: "#666", marginVertical: 8 }}>
//           No skills selected
//         </Text>
//       )}

//       <TouchableOpacity
//         style={[styles.btnSmall, { backgroundColor: "#009688" }]}
//         onPress={() => setShowCategories(!showCategories)}
//       >
//         <Text style={styles.btnSmallText}>
//           {showCategories ? "Hide Skill List" : "Choose Skills"}
//         </Text>
//       </TouchableOpacity>

//       {showCategories && (
//         <View style={styles.categoryList}>
//           {categories.map((cat) => {
//             const selected = skills.includes(cat.code);
//             return (
//               <TouchableOpacity
//                 key={cat.code}
//                 style={[
//                   styles.skillItem,
//                   { backgroundColor: selected ? "#C8E6C9" : "#f1f5f9" },
//                 ]}
//                 onPress={() => {
//                   if (selected) removeSkill(cat.code);
//                   else setSkills([...skills, cat.code]);
//                 }}
//               >
//                 <Text style={{ fontWeight: "600" }}>
//                   {cat.skillName || cat.name}
//                 </Text>
//                 <Text style={{ fontSize: 12 }}>Code: {cat.code}</Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       )}

//       {/* Save Button */}
//       <TouchableOpacity style={styles.btn} onPress={submitProfile}>
//         <Text style={styles.btnText}>
//           {saving ? "Saving..." : "Update Profile"}
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
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
//   btnSmall: {
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 12,
//   },
//   btnSmallText: { color: "#fff", fontWeight: "700" },
//   skillItem: {
//     padding: 10,
//     backgroundColor: "#f1f5f9",
//     borderRadius: 8,
//     marginBottom: 6,
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   verified: { color: "green", fontWeight: "bold", marginBottom: 10 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryList: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     padding: 8,
//     marginTop: 10,
//   },
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
//   fetchDoerCategories,
// } from "../api/doer";

// // Enable layout animation (Android)
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]);

//   const [categories, setCategories] = useState([]);
//   const [showCategories, setShowCategories] = useState(false);
//   const [editing, setEditing] = useState(true);

//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [sessionId, setSessionId] = useState("");

//   const [originalProfile, setOriginalProfile] = useState({});

//   // Header
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Edit Profile",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.navigate("Dashboard")}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   /** Load profile */
//   const loadProfile = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchDoerProfile();
//       if (res?.status === "SUCCESS" && res.data) {
//         const p = res.data;

//         setOriginalProfile(p);

//         setName(p.name || "");
//         setEmail(p.email || "");
//         setBio(p.bio || "");
//         setPhone(p.phone || "");

//         // Keep original skills (codes)
//         setSkills(Array.isArray(p.skills) ? p.skills : []);

//         setPhoneVerified(p.is_phone_verified === true);

//         setEditing(true);
//         setOtpSent(false);
//         setOtp("");

//         await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//       }
//     } catch (err) {
//       Alert.alert("Error", "Please Register");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Refresh on focus
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", loadProfile);
//     return unsubscribe;
//   }, [navigation]);

//   // Fetch categories (skills)
//   useEffect(() => {
//     const fetchCategoriesData = async () => {
//       try {
//         const res = await fetchDoerCategories();
//         if (res?.status === "SUCCESS" && Array.isArray(res.data)) {
//           setCategories(res.data);
//         }
//       } catch (err) {
//         console.error("Category fetch failed:", err);
//       }
//     };
//     fetchCategoriesData();
//   }, []);

//   /** Submit Profile */
//   const submitProfile = async () => {
//     if (!name.trim() || !phone.trim()) {
//       return Alert.alert("Validation", "Name and Phone are required");
//     }

//     setSaving(true);

//     try {
//       const payload = {
//         name,
//         email,
//         bio,
//         phone,
//         skills:
//           skills && skills.length > 0 ? skills : originalProfile.skills || [],
//       };

//       // LOG EXACT DATA
//       console.log("========== SENDING TO BACKEND ==========");
//       console.log("Payload:", payload);
//       console.log("Skills:", payload.skills);
//       console.log("=========================================");

//       const res = await updateDoerProfile(payload);

//       if (res.status === "SUCCESS") {
//         await loadProfile();
//         Alert.alert("Success", "Profile updated successfully!");
//         setEditing(false);
//       } else {
//         Alert.alert("Error", res.message || "Failed to update");
//       }
//     } catch (err) {
//       console.error("Update error:", err);
//       Alert.alert("Error", "Something went wrong");
//     } finally {
//       setSaving(false);
//     }
//   };

//   /** Remove a skill */
//   const removeSkill = (code) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setSkills(skills.filter((s) => s !== code));
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text>Loading profile...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Name */}
//       <TextInput
//         style={[styles.input]}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//       />

//       {/* Bio */}
//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//       />

//       {/* Phone */}
//       <TextInput
//         style={[styles.input]}
//         placeholder="Phone Number"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//         editable={!phoneVerified}
//       />

//       {phoneVerified && <Text style={styles.verified}>✅ Phone Verified</Text>}

//       {/* Skills */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>Selected Skills:</Text>

//       {skills.length > 0 ? (
//         skills.map((code, i) => {
//           const cat = categories.find((c) => c.code == code);
//           return (
//             <View key={i} style={styles.skillItem}>
//               <Text style={{ fontWeight: "600" }}>
//                 {cat ? cat.skillName : code}
//               </Text>
//               <TouchableOpacity onPress={() => removeSkill(code)}>
//                 <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
//               </TouchableOpacity>
//             </View>
//           );
//         })
//       ) : (
//         <Text style={{ color: "#666", marginVertical: 8 }}>
//           No skills selected
//         </Text>
//       )}

//       <TouchableOpacity
//         style={[styles.btnSmall, { backgroundColor: "#009688" }]}
//         onPress={() => setShowCategories(!showCategories)}
//       >
//         <Text style={styles.btnSmallText}>
//           {showCategories ? "Hide Skill List" : "Choose Skills"}
//         </Text>
//       </TouchableOpacity>

//       {showCategories && (
//         <View style={styles.categoryList}>
//           {categories.map((cat) => {
//             const selected = skills.includes(cat.code); // ✅ FIXED

//             return (
//               <TouchableOpacity
//                 key={cat.code}
//                 style={[
//                   styles.skillItem,
//                   { backgroundColor: selected ? "#C8E6C9" : "#f1f5f9" },
//                 ]}
//                 onPress={() => {
//                   if (selected) {
//                     removeSkill(cat.code); // ✅ remove CODE
//                   } else {
//                     setSkills([...skills, cat.code]); // ✅ add CODE
//                   }
//                 }}
//               >
//                 <Text style={{ fontWeight: "600" }}>
//                   {cat.skillName || cat.name}
//                 </Text>
//                 <Text style={{ fontSize: 12 }}>Code: {cat.code}</Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       )}

//       {/* Save / Update Button */}
//       <TouchableOpacity style={styles.btn} onPress={submitProfile}>
//         <Text style={styles.btnText}>
//           {saving
//             ? "Saving..."
//             : originalProfile?.userid
//             ? "Update Profile"
//             : "Save Profile"}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// // STYLES
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
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
//   btnSmall: {
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 12,
//   },
//   btnSmallText: { color: "#fff", fontWeight: "700" },
//   skillItem: {
//     padding: 10,
//     backgroundColor: "#f1f5f9",
//     borderRadius: 8,
//     marginBottom: 6,
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   verified: { color: "green", fontWeight: "bold", marginBottom: 10 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryList: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     padding: 8,
//     marginTop: 10,
//   },
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
//   fetchDoerCategories,
// } from "../api/doer";

// // Enable layout animation (Android)
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]); // array of codes: ["101","102"]

//   const [categories, setCategories] = useState([]);
//   const [showCategories, setShowCategories] = useState(false);
//   const [editing, setEditing] = useState(true);

//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [sessionId, setSessionId] = useState("");

//   const [originalProfile, setOriginalProfile] = useState({});

//   // Header
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Edit Profile",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.navigate("Dashboard")}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // Helper: normalize incoming profile skills -> array of codes
//   const normalizeSkillsToCodes = (incomingSkills = [], categoriesList = []) => {
//     if (!Array.isArray(incomingSkills) || incomingSkills.length === 0)
//       return [];

//     // build quick lookup maps
//     const codeSet = new Set(categoriesList.map((c) => String(c.code)));
//     const skillNameToCode = new Map();
//     const nameToCode = new Map();
//     const displayToCode = new Map();

//     for (const c of categoriesList) {
//       if (c.skillName)
//         skillNameToCode.set(String(c.skillName).toLowerCase(), String(c.code));
//       if (c.name) nameToCode.set(String(c.name).toLowerCase(), String(c.code));
//       if (c.displayName)
//         displayToCode.set(String(c.displayName).toLowerCase(), String(c.code));
//     }

//     const result = [];
//     for (const s of incomingSkills) {
//       if (s == null) continue;
//       // if object with code
//       if (typeof s === "object") {
//         const maybeCode = s.code ?? s.code?.toString?.();
//         if (maybeCode && codeSet.has(String(maybeCode)))
//           result.push(String(maybeCode));
//         else {
//           // try fields inside object
//           const lowerSkillName = (
//             s.skillName ||
//             s.name ||
//             s.displayName ||
//             ""
//           ).toLowerCase();
//           const mapped =
//             skillNameToCode.get(lowerSkillName) ||
//             nameToCode.get(lowerSkillName) ||
//             displayToCode.get(lowerSkillName);
//           if (mapped) result.push(mapped);
//         }
//         continue;
//       }

//       // if string
//       const str = String(s).trim();
//       if (codeSet.has(str)) {
//         result.push(str); // already a code
//         continue;
//       }
//       const lower = str.toLowerCase();
//       const mapped =
//         skillNameToCode.get(lower) ||
//         nameToCode.get(lower) ||
//         displayToCode.get(lower);
//       if (mapped) result.push(mapped);
//       // else skip invalid names
//     }

//     // dedupe while preserving order
//     return Array.from(new Set(result));
//   };

//   // Load categories first, then profile
//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       try {
//         const catRes = await fetchDoerCategories();
//         const cats = Array.isArray(catRes?.data)
//           ? catRes.data
//           : catRes?.data ?? catRes?.data ?? [];
//         // Some API wrappers return { status, data } and some return raw array - support both
//         const categoryArray = Array.isArray(catRes?.data)
//           ? catRes.data
//           : Array.isArray(catRes)
//           ? catRes
//           : [];
//         setCategories(categoryArray);

//         // now fetch profile
//         const profileRes = await fetchDoerProfile();
//         if (profileRes?.status === "SUCCESS" && profileRes.data) {
//           const p = profileRes.data;
//           setOriginalProfile(p);
//           setName(p.name || "");
//           setEmail(p.email || "");
//           setBio(p.bio || "");
//           setPhone(p.phone || "");
//           setPhoneVerified(p.is_phone_verified === true);

//           // Normalize profile skills to codes using categories we just loaded
//           const incomingSkills = Array.isArray(p.skills) ? p.skills : [];
//           const normalized = normalizeSkillsToCodes(
//             incomingSkills,
//             categoryArray
//           );
//           // If normalized empty but p.skills had values, try fallback: if p.skills are codes already, keep them
//           setSkills(
//             normalized.length > 0
//               ? normalized
//               : Array.isArray(p.skills)
//               ? p.skills
//               : []
//           );
//           await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//         } else {
//           // fallback: if profile failed but categories loaded, still set categories
//           setOriginalProfile({});
//         }
//       } catch (err) {
//         console.error("Init load error:", err);
//         Alert.alert("Error", "Failed to load profile or categories");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   // Refresh on focus: re-load profile only (categories already loaded)
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", async () => {
//       try {
//         const profileRes = await fetchDoerProfile();
//         if (profileRes?.status === "SUCCESS" && profileRes.data) {
//           const p = profileRes.data;
//           setOriginalProfile(p);
//           setName(p.name || "");
//           setEmail(p.email || "");
//           setBio(p.bio || "");
//           setPhone(p.phone || "");
//           setPhoneVerified(p.is_phone_verified === true);

//           const normalized = normalizeSkillsToCodes(
//             Array.isArray(p.skills) ? p.skills : [],
//             categories
//           );
//           setSkills(
//             normalized.length > 0
//               ? normalized
//               : Array.isArray(p.skills)
//               ? p.skills
//               : []
//           );
//           await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//         }
//       } catch (err) {
//         console.warn("Refresh profile error:", err);
//       }
//     });
//     return unsubscribe;
//   }, [navigation, categories]);

//   /** Submit Profile */
//   const submitProfile = async () => {
//     if (!name.trim() || !phone.trim()) {
//       return Alert.alert("Validation", "Name and Phone are required");
//     }

//     setSaving(true);

//     try {
//       // Build payload: ensure we always send existing fields,
//       // and ensure skills are valid codes (fallback to originalProfile.skills)
//       const finalSkills =
//         Array.isArray(skills) && skills.length > 0
//           ? skills
//           : Array.isArray(originalProfile.skills)
//           ? originalProfile.skills
//           : [];

//       const payload = {
//         name: name || originalProfile.name,
//         email: email || originalProfile.email,
//         bio: bio || originalProfile.bio,
//         phone: phone || originalProfile.phone,
//         skills: finalSkills,
//       };

//       // LOG for debugging
//       console.log("========== SENDING TO BACKEND ==========");
//       console.log("Payload:", payload);
//       console.log("Skills:", payload.skills);
//       console.log("=========================================");

//       const res = await updateDoerProfile(payload);

//       if (res?.status === "SUCCESS" || res?.data?.status === "SUCCESS") {
//         // refresh profile after update
//         await (async () => {
//           try {
//             const profileRes = await fetchDoerProfile();
//             if (profileRes?.status === "SUCCESS" && profileRes.data) {
//               const p = profileRes.data;
//               setOriginalProfile(p);
//               setName(p.name || "");
//               setEmail(p.email || "");
//               setBio(p.bio || "");
//               setPhone(p.phone || "");
//               const normalized = normalizeSkillsToCodes(
//                 Array.isArray(p.skills) ? p.skills : [],
//                 categories
//               );
//               setSkills(
//                 normalized.length > 0
//                   ? normalized
//                   : Array.isArray(p.skills)
//                   ? p.skills
//                   : []
//               );
//               await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//             }
//           } catch (e) {
//             console.warn("Post-update refresh failed:", e);
//           }
//         })();

//         Alert.alert("Success", "Profile updated successfully!");
//         setEditing(false);
//       } else {
//         const message =
//           res?.message || res?.data?.message || "Failed to update";
//         Alert.alert("Error", message);
//       }
//     } catch (err) {
//       console.error("Update error:", err);
//       // attempt to surface backend details if available
//       const backendMsg = err?.response?.data || err?.message || String(err);
//       console.error("Backend error details:", backendMsg);
//       Alert.alert("Error", "Something went wrong. See console for details.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   /** Remove a skill (by code) */
//   const removeSkill = (code) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setSkills((prev) => prev.filter((s) => s !== code));
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text>Loading profile...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Name */}
//       <TextInput
//         style={[styles.input]}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//       />

//       {/* Bio */}
//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//       />

//       {/* Phone */}
//       <TextInput
//         style={[styles.input]}
//         placeholder="Phone Number"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//         editable={!phoneVerified}
//       />
//       {/* OTP Section */}
//       {!phoneVerified && (
//         <>
//           <TouchableOpacity
//             style={[
//               styles.btnSmall,
//               { backgroundColor: "#1976D2", marginTop: 5 },
//             ]}
//             onPress={async () => {
//               if (!phone.trim()) {
//                 return Alert.alert("Error", "Please enter phone number");
//               }

//               try {
//                 const res = await sendPhoneOtp({ phone });
//                 if (res?.status === "SUCCESS") {
//                   setOtpSent(true);
//                   setSessionId(res.sessionId);
//                   Alert.alert("OTP Sent", "Check your phone for the OTP");
//                 } else {
//                   Alert.alert("Error", res?.message || "Failed to send OTP");
//                 }
//               } catch (e) {
//                 console.log("Send OTP error:", e);
//                 Alert.alert("Error", "Something went wrong");
//               }
//             }}
//           >
//             <Text style={styles.btnSmallText}>Send OTP</Text>
//           </TouchableOpacity>

//           {otpSent && (
//             <>
//               <TextInput
//                 style={[styles.input]}
//                 placeholder="Enter OTP"
//                 value={otp}
//                 onChangeText={setOtp}
//                 keyboardType="number-pad"
//               />

//               <TouchableOpacity
//                 style={[
//                   styles.btnSmall,
//                   { backgroundColor: "#388E3C", marginTop: 5 },
//                 ]}
//                 onPress={async () => {
//                   if (!otp.trim()) {
//                     return Alert.alert("Error", "Enter OTP");
//                   }

//                   try {
//                     const res = await verifyPhoneOtp({
//                       otp,
//                       sessionId,
//                       phone,
//                     });

//                     if (res?.status === "SUCCESS") {
//                       setPhoneVerified(true);
//                       setOtpSent(false);
//                       Alert.alert("Success", "Phone Verified Successfully!");
//                     } else {
//                       Alert.alert(
//                         "Error",
//                         res?.message || "OTP verification failed"
//                       );
//                     }
//                   } catch (e) {
//                     console.log("Verify error:", e);
//                     Alert.alert("Error", "Verification failed");
//                   }
//                 }}
//               >
//                 <Text style={styles.btnSmallText}>Verify OTP</Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </>
//       )}

//       {phoneVerified && <Text style={styles.verified}>✅ Phone Verified</Text>}

//       {/* Skills */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>Selected Skills:</Text>

//       {skills.length > 0 ? (
//         skills.map((code, i) => {
//           const cat = categories.find((c) => String(c.code) === String(code));
//           return (
//             <View key={i} style={styles.skillItem}>
//               <Text style={{ fontWeight: "600" }}>
//                 {cat ? cat.skillName || cat.name : code}
//               </Text>
//               <TouchableOpacity onPress={() => removeSkill(code)}>
//                 <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
//               </TouchableOpacity>
//             </View>
//           );
//         })
//       ) : (
//         <Text style={{ color: "#666", marginVertical: 8 }}>
//           No skills selected
//         </Text>
//       )}

//       <TouchableOpacity
//         style={[styles.btnSmall, { backgroundColor: "#009688" }]}
//         onPress={() => setShowCategories((s) => !s)}
//       >
//         <Text style={styles.btnSmallText}>
//           {showCategories ? "Hide Skill List" : "Choose Skills"}
//         </Text>
//       </TouchableOpacity>

//       {showCategories && (
//         <View style={styles.categoryList}>
//           {categories.map((cat) => {
//             const selected = skills.includes(String(cat.code));
//             return (
//               <TouchableOpacity
//                 key={cat.code}
//                 style={[
//                   styles.skillItem,
//                   { backgroundColor: selected ? "#C8E6C9" : "#f1f5f9" },
//                 ]}
//                 onPress={() => {
//                   if (selected) removeSkill(cat.code);
//                   else setSkills((prev) => [...prev, String(cat.code)]);
//                 }}
//               >
//                 <View>
//                   <Text style={{ fontWeight: "600" }}>
//                     {cat.skillName || cat.name}
//                   </Text>
//                   <Text style={{ fontSize: 12 }}>Code: {cat.code}</Text>
//                 </View>
//                 <View />
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       )}

//       {/* Save / Update Button */}
//       <TouchableOpacity style={styles.btn} onPress={submitProfile}>
//         <Text style={styles.btnText}>
//           {saving
//             ? "Saving..."
//             : originalProfile?.userid
//             ? "Update Profile"
//             : "Save Profile"}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// // STYLES
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
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
//   btnSmall: {
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 12,
//   },
//   btnSmallText: { color: "#fff", fontWeight: "700" },
//   skillItem: {
//     padding: 10,
//     backgroundColor: "#f1f5f9",
//     borderRadius: 8,
//     marginBottom: 6,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   verified: { color: "green", fontWeight: "bold", marginBottom: 10 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryList: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     padding: 8,
//     marginTop: 10,
//   },
// });

// // EditProfile.js (minimal fixes applied)
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
//   fetchDoerCategories,
// } from "../api/doer";

// // Enable layout animation (Android)
// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [skills, setSkills] = useState([]); // array of codes: ["101","102"]

//   const [categories, setCategories] = useState([]);
//   const [showCategories, setShowCategories] = useState(false);
//   const [editing, setEditing] = useState(true);

//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [sessionId, setSessionId] = useState("");

//   const [originalProfile, setOriginalProfile] = useState({});

//   // Header
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Edit Profile",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.navigate("Dashboard")}
//           style={{ marginLeft: 15 }}
//         >
//           <Ionicons name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // Helper: normalize incoming profile skills -> array of codes
//   const normalizeSkillsToCodes = (incomingSkills = [], categoriesList = []) => {
//     if (!Array.isArray(incomingSkills) || incomingSkills.length === 0)
//       return [];

//     // build quick lookup maps
//     const codeSet = new Set(categoriesList.map((c) => String(c.code)));
//     const skillNameToCode = new Map();
//     const nameToCode = new Map();
//     const displayToCode = new Map();

//     for (const c of categoriesList) {
//       if (c.skillName)
//         skillNameToCode.set(String(c.skillName).toLowerCase(), String(c.code));
//       if (c.name) nameToCode.set(String(c.name).toLowerCase(), String(c.code));
//       if (c.displayName)
//         displayToCode.set(String(c.displayName).toLowerCase(), String(c.code));
//     }

//     const result = [];
//     for (const s of incomingSkills) {
//       if (s == null) continue;
//       // if object with code
//       if (typeof s === "object") {
//         const maybeCode = s.code ?? s.code?.toString?.();
//         if (maybeCode && codeSet.has(String(maybeCode)))
//           result.push(String(maybeCode));
//         else {
//           // try fields inside object
//           const lowerSkillName = (
//             s.skillName ||
//             s.name ||
//             s.displayName ||
//             ""
//           ).toLowerCase();
//           const mapped =
//             skillNameToCode.get(lowerSkillName) ||
//             nameToCode.get(lowerSkillName) ||
//             displayToCode.get(lowerSkillName);
//           if (mapped) result.push(mapped);
//         }
//         continue;
//       }

//       // if string
//       const str = String(s).trim();
//       if (codeSet.has(str)) {
//         result.push(str); // already a code
//         continue;
//       }
//       const lower = str.toLowerCase();
//       const mapped =
//         skillNameToCode.get(lower) ||
//         nameToCode.get(lower) ||
//         displayToCode.get(lower);
//       if (mapped) result.push(mapped);
//       // else skip invalid names
//     }

//     // dedupe while preserving order
//     return Array.from(new Set(result));
//   };

//   // Load categories first, then profile
//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       try {
//         const catRes = await fetchDoerCategories();
//         const categoryArray = Array.isArray(catRes?.data)
//           ? catRes.data
//           : Array.isArray(catRes)
//           ? catRes
//           : [];

//         setCategories(categoryArray);

//         // now fetch profile
//         const profileRes = await fetchDoerProfile();
//         if (profileRes?.status === "SUCCESS" && profileRes.data) {
//           const p = profileRes.data;
//           setOriginalProfile(p);
//           setName(p.name || "");
//           setEmail(p.email || "");
//           setBio(p.bio || "");
//           setPhone(p.phone || "");
//           setPhoneVerified(p.is_phone_verified === true);

//           // Normalize profile skills to codes using categories we just loaded
//           const incomingSkills = Array.isArray(p.skills) ? p.skills : [];
//           const normalized = normalizeSkillsToCodes(
//             incomingSkills,
//             categoryArray
//           );
//           setSkills(
//             normalized.length > 0
//               ? normalized
//               : Array.isArray(p.skills)
//               ? p.skills
//               : []
//           );
//           await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//         } else {
//           // fallback: if profile failed but categories loaded, still set categories
//           setOriginalProfile({});
//           // don't show raw backend errors to users; keep silent
//         }
//       } catch (err) {
//         // Minimal handling: log, don't show raw backend error to user
//         console.warn("Init load error:", err);
//         // optional: show friendly message
//         // Alert.alert("Error", "Failed to load profile or categories");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   // Refresh on focus: re-load profile only (categories already loaded)
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", async () => {
//       try {
//         const profileRes = await fetchDoerProfile();
//         if (profileRes?.status === "SUCCESS" && profileRes.data) {
//           const p = profileRes.data;
//           setOriginalProfile(p);
//           setName(p.name || "");
//           setEmail(p.email || "");
//           setBio(p.bio || "");
//           setPhone(p.phone || "");
//           setPhoneVerified(p.is_phone_verified === true);

//           const normalized = normalizeSkillsToCodes(
//             Array.isArray(p.skills) ? p.skills : [],
//             categories
//           );
//           setSkills(
//             normalized.length > 0
//               ? normalized
//               : Array.isArray(p.skills)
//               ? p.skills
//               : []
//           );
//           await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//         }
//       } catch (err) {
//         console.warn("Refresh profile error:", err);
//       }
//     });
//     return unsubscribe;
//   }, [navigation, categories]);

//   /** Submit Profile (minimal fix: only send non-empty or changed fields) */
//   const submitProfile = async () => {
//     if (!name.trim() || !phone.trim()) {
//       return Alert.alert("Validation", "Name and Phone are required");
//     }

//     setSaving(true);

//     try {
//       // Build payload: only include fields that are non-empty and/or changed.
//       const finalSkills =
//         Array.isArray(skills) && skills.length > 0
//           ? skills
//           : Array.isArray(originalProfile.skills)
//           ? originalProfile.skills
//           : [];

//       const payload = {};

//       // Only add field if it's non-empty AND different from original (when available)
//       if (name && name.trim() !== (originalProfile.name || ""))
//         payload.name = name.trim();
//       if (email && email.trim() !== (originalProfile.email || ""))
//         payload.email = email.trim();
//       if (bio && bio.trim() !== (originalProfile.bio || ""))
//         payload.bio = bio.trim();
//       if (phone && phone.trim() !== (originalProfile.phone || ""))
//         payload.phone = phone.trim();
//       if (Array.isArray(finalSkills) && finalSkills.length > 0)
//         payload.skills = finalSkills;

//       // If nothing changed, inform user
//       if (Object.keys(payload).length === 0) {
//         setSaving(false);
//         return Alert.alert(
//           "Nothing changed",
//           "Please update a field before saving."
//         );
//       }

//       // LOG for debugging (kept minimal)
//       console.log("Sending payload:", payload);

//       const res = await updateDoerProfile(payload);

//       if (res?.status === "SUCCESS" || res?.data?.status === "SUCCESS") {
//         // refresh profile after update
//         try {
//           const profileRes = await fetchDoerProfile();
//           if (profileRes?.status === "SUCCESS" && profileRes.data) {
//             const p = profileRes.data;
//             setOriginalProfile(p);
//             setName(p.name || "");
//             setEmail(p.email || "");
//             setBio(p.bio || "");
//             setPhone(p.phone || "");
//             const normalized = normalizeSkillsToCodes(
//               Array.isArray(p.skills) ? p.skills : [],
//               categories
//             );
//             setSkills(
//               normalized.length > 0
//                 ? normalized
//                 : Array.isArray(p.skills)
//                 ? p.skills
//                 : []
//             );
//             await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//           }
//         } catch (e) {
//           console.warn("Post-update refresh failed:", e);
//         }

//         Alert.alert("Success", "Profile updated successfully!");
//         setEditing(false);
//       } else {
//         // show generic message, don't surface raw backend object
//         const message =
//           res?.message || res?.data?.message || "Failed to update";
//         Alert.alert("Error", message);
//       }
//     } catch (err) {
//       console.warn("Update error:", err);
//       // Show a friendly error to user, avoid raw backend dump
//       Alert.alert(
//         "Error",
//         "Something went wrong while updating. Please try again."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   /** Remove a skill (by code) */
//   const removeSkill = (code) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setSkills((prev) => prev.filter((s) => s !== code));
//   };

//   // ----------------- OTP / Phone helpers (minimal, ensure payloads are simple values) -----------------

//   const handleSendOtp = async () => {
//     if (!phone || !phone.trim()) {
//       return Alert.alert("Error", "Please enter phone number");
//     }

//     try {
//       // Ensure we pass a simple object with phone as string
//       const res = await sendPhoneOtp({ phone: String(phone).trim() });

//       // Support different wrapper shapes (res.status or res.data.status)
//       const ok =
//         res?.status === "SUCCESS" ||
//         res?.data?.status === "SUCCESS" ||
//         res?.data?.status === "OTP_SENT" ||
//         res?.status === "OK";

//       if (ok) {
//         // sessionId could be in res.sessionId or res.data.sessionId
//         const sId = res?.sessionId ?? res?.data?.sessionId ?? "";
//         setSessionId(String(sId));
//         setOtpSent(true);
//         // friendly message
//         Alert.alert("OTP Sent", "Check your phone for the OTP.");
//       } else {
//         // show friendly error
//         const msg = res?.message || res?.data?.message || "Failed to send OTP";
//         Alert.alert("Error", msg);
//       }
//     } catch (err) {
//       console.warn("Send OTP error:", err);
//       Alert.alert("Error", "Failed to send OTP. Please try again.");
//     }
//   };

//   const handleVerifyOtp = async () => {
//     if (!otp || !otp.trim()) {
//       return Alert.alert("Error", "Enter OTP");
//     }

//     try {
//       // Send a flat simple payload that backend expects: otp as string (and sessionId/phone if needed)
//       const payload = {
//         otp: String(otp).trim(),
//       };
//       if (sessionId) payload.sessionId = String(sessionId);
//       if (phone) payload.phone = String(phone).trim();

//       const res = await verifyPhoneOtp(payload);

//       const ok =
//         res?.status === "SUCCESS" ||
//         res?.data?.status === "SUCCESS" ||
//         res?.data?.status === "VERIFIED";

//       if (ok) {
//         setPhoneVerified(true);
//         setOtpSent(false);
//         setSessionId("");
//         setOtp("");
//         Alert.alert("Success", "Phone Verified Successfully!");
//       } else {
//         const msg =
//           res?.message || res?.data?.message || "OTP verification failed";
//         Alert.alert("Error", msg);
//       }
//     } catch (err) {
//       console.warn("Verify OTP error:", err);
//       Alert.alert("Error", "OTP verification failed. Please try again.");
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text>Loading profile...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Name */}
//       <TextInput
//         style={[styles.input]}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//       />

//       {/* Bio */}
//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Bio"
//         multiline
//         value={bio}
//         onChangeText={setBio}
//       />

//       {/* Phone */}
//       <TextInput
//         style={[styles.input]}
//         placeholder="Phone Number"
//         keyboardType="phone-pad"
//         value={phone}
//         onChangeText={setPhone}
//         editable={!phoneVerified}
//       />

//       {/* OTP Section */}
//       {!phoneVerified && (
//         <>
//           <TouchableOpacity
//             style={[
//               styles.btnSmall,
//               { backgroundColor: "#1976D2", marginTop: 5 },
//             ]}
//             onPress={handleSendOtp}
//           >
//             <Text style={styles.btnSmallText}>Send OTP</Text>
//           </TouchableOpacity>

//           {otpSent && (
//             <>
//               <TextInput
//                 style={[styles.input]}
//                 placeholder="Enter OTP"
//                 value={otp}
//                 onChangeText={setOtp}
//                 keyboardType="number-pad"
//               />

//               <TouchableOpacity
//                 style={[
//                   styles.btnSmall,
//                   { backgroundColor: "#388E3C", marginTop: 5 },
//                 ]}
//                 onPress={handleVerifyOtp}
//               >
//                 <Text style={styles.btnSmallText}>Verify OTP</Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </>
//       )}

//       {phoneVerified && <Text style={styles.verified}>✅ Phone Verified</Text>}

//       {/* Skills */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>Selected Skills:</Text>

//       {skills.length > 0 ? (
//         skills.map((code, i) => {
//           const cat = categories.find((c) => String(c.code) === String(code));
//           return (
//             <View key={i} style={styles.skillItem}>
//               <Text style={{ fontWeight: "600" }}>
//                 {cat ? cat.skillName || cat.name : code}
//               </Text>
//               <TouchableOpacity onPress={() => removeSkill(code)}>
//                 <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
//               </TouchableOpacity>
//             </View>
//           );
//         })
//       ) : (
//         <Text style={{ color: "#666", marginVertical: 8 }}>
//           No skills selected
//         </Text>
//       )}

//       <TouchableOpacity
//         style={[styles.btnSmall, { backgroundColor: "#009688" }]}
//         onPress={() => setShowCategories((s) => !s)}
//       >
//         <Text style={styles.btnSmallText}>
//           {showCategories ? "Hide Skill List" : "Choose Skills"}
//         </Text>
//       </TouchableOpacity>

//       {showCategories && (
//         <View style={styles.categoryList}>
//           {categories.map((cat) => {
//             const selected = skills.includes(String(cat.code));
//             return (
//               <TouchableOpacity
//                 key={cat.code}
//                 style={[
//                   styles.skillItem,
//                   { backgroundColor: selected ? "#C8E6C9" : "#f1f5f9" },
//                 ]}
//                 onPress={() => {
//                   if (selected) removeSkill(cat.code);
//                   else setSkills((prev) => [...prev, String(cat.code)]);
//                 }}
//               >
//                 <View>
//                   <Text style={{ fontWeight: "600" }}>
//                     {cat.skillName || cat.name}
//                   </Text>
//                   <Text style={{ fontSize: 12 }}>Code: {cat.code}</Text>
//                 </View>
//                 <View />
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       )}

//       {/* Save / Update Button */}
//       <TouchableOpacity style={styles.btn} onPress={submitProfile}>
//         <Text style={styles.btnText}>
//           {saving
//             ? "Saving..."
//             : originalProfile?.userid
//             ? "Update Profile"
//             : "Save Profile"}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// // STYLES
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
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700" },
//   btnSmall: {
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 12,
//   },
//   btnSmallText: { color: "#fff", fontWeight: "700" },
//   skillItem: {
//     padding: 10,
//     backgroundColor: "#f1f5f9",
//     borderRadius: 8,
//     marginBottom: 6,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   verified: { color: "green", fontWeight: "bold", marginBottom: 10 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryList: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 8,
//     padding: 8,
//     marginTop: 10,
//   },
// });
// EditProfile.js (fixed OTP send + verify, cleaned error handling)
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
  fetchDoerCategories,
} from "../api/doer";

// Enable layout animation (Android)
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
  const [skills, setSkills] = useState([]); // array of codes: ["101","102"]

  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [editing, setEditing] = useState(true);

  const [otpSent, setOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const [otp, setOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sessionId, setSessionId] = useState("");

  const [originalProfile, setOriginalProfile] = useState({});

  // Header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Edit Profile",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Dashboard")}
          style={{ marginLeft: 15 }}
        >
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Helper: normalize incoming profile skills -> array of codes
  const normalizeSkillsToCodes = (incomingSkills = [], categoriesList = []) => {
    if (!Array.isArray(incomingSkills) || incomingSkills.length === 0)
      return [];

    const codeSet = new Set(categoriesList.map((c) => String(c.code)));
    const skillNameToCode = new Map();
    const nameToCode = new Map();
    const displayToCode = new Map();

    for (const c of categoriesList) {
      if (c.skillName)
        skillNameToCode.set(String(c.skillName).toLowerCase(), String(c.code));
      if (c.name) nameToCode.set(String(c.name).toLowerCase(), String(c.code));
      if (c.displayName)
        displayToCode.set(String(c.displayName).toLowerCase(), String(c.code));
    }

    const result = [];
    for (const s of incomingSkills) {
      if (s == null) continue;
      if (typeof s === "object") {
        const maybeCode = s.code ?? s.code?.toString?.();
        if (maybeCode && codeSet.has(String(maybeCode)))
          result.push(String(maybeCode));
        else {
          const lowerSkillName = (
            s.skillName ||
            s.name ||
            s.displayName ||
            ""
          ).toLowerCase();
          const mapped =
            skillNameToCode.get(lowerSkillName) ||
            nameToCode.get(lowerSkillName) ||
            displayToCode.get(lowerSkillName);
          if (mapped) result.push(mapped);
        }
        continue;
      }

      const str = String(s).trim();
      if (codeSet.has(str)) {
        result.push(str);
        continue;
      }
      const lower = str.toLowerCase();
      const mapped =
        skillNameToCode.get(lower) ||
        nameToCode.get(lower) ||
        displayToCode.get(lower);
      if (mapped) result.push(mapped);
    }

    return Array.from(new Set(result));
  };

  // Load categories first, then profile
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const catRes = await fetchDoerCategories();
        const categoryArray = Array.isArray(catRes?.data)
          ? catRes.data
          : Array.isArray(catRes)
          ? catRes
          : [];

        if (!mounted) return;
        setCategories(categoryArray);

        // now fetch profile
        const profileRes = await fetchDoerProfile();
        if (profileRes?.status === "SUCCESS" && profileRes.data) {
          const p = profileRes.data;
          setOriginalProfile(p);
          setName(p.name || "");
          setEmail(p.email || "");
          setBio(p.bio || "");
          setPhone(p.phone || "");
          setPhoneVerified(p.is_phone_verified === true);

          const incomingSkills = Array.isArray(p.skills) ? p.skills : [];
          const normalized = normalizeSkillsToCodes(
            incomingSkills,
            categoryArray
          );
          setSkills(
            normalized.length > 0
              ? normalized
              : Array.isArray(p.skills)
              ? p.skills
              : []
          );
          await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
        } else {
          setOriginalProfile({});
        }
      } catch (err) {
        console.warn("Init load error:", err);
        // keep UI friendly, do not surface raw error
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Refresh on focus: re-load profile only (categories already loaded)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const profileRes = await fetchDoerProfile();
        if (profileRes?.status === "SUCCESS" && profileRes.data) {
          const p = profileRes.data;
          setOriginalProfile(p);
          setName(p.name || "");
          setEmail(p.email || "");
          setBio(p.bio || "");
          setPhone(p.phone || "");
          setPhoneVerified(p.is_phone_verified === true);

          const normalized = normalizeSkillsToCodes(
            Array.isArray(p.skills) ? p.skills : [],
            categories
          );
          setSkills(
            normalized.length > 0
              ? normalized
              : Array.isArray(p.skills)
              ? p.skills
              : []
          );
          await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
        }
      } catch (err) {
        console.warn("Refresh profile error:", err);
      }
    });
    return unsubscribe;
  }, [navigation, categories]);
  const submitProfile = async () => {
    if (!name.trim() || !phone.trim()) {
      return Alert.alert("Validation", "Name and Phone are required");
    }

    setSaving(true);

    try {
      // Prepare final skills
      const finalSkills =
        Array.isArray(skills) && skills.length > 0
          ? skills
          : Array.isArray(originalProfile.skills)
          ? originalProfile.skills
          : [];

      // Prepare payload: always include required fields, use existing if unchanged
      const payload = {
        name: name.trim() || originalProfile.name || "",
        email: email.trim() || originalProfile.email || "",
        bio: bio.trim() || originalProfile.bio || "",
        phone: phone.trim() || originalProfile.phone || "",
        skills: finalSkills,
      };

      console.log("Sending payload:", payload);

      const res = await updateDoerProfile(payload);

      const ok = res?.status === "SUCCESS" || res?.data?.status === "SUCCESS";
      if (ok) {
        // Refresh profile from server
        const profileRes = await fetchDoerProfile();
        if (profileRes?.status === "SUCCESS" && profileRes.data) {
          const p = profileRes.data;
          setOriginalProfile(p);
          setName(p.name || "");
          setEmail(p.email || "");
          setBio(p.bio || "");
          setPhone(p.phone || "");
          setPhoneVerified(p.is_phone_verified === true);

          const normalized = normalizeSkillsToCodes(
            Array.isArray(p.skills) ? p.skills : [],
            categories
          );
          setSkills(normalized.length > 0 ? normalized : []);
          await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
        }

        Alert.alert("Success", "Profile updated successfully!");
        setEditing(false);
      } else {
        const message =
          res?.message || res?.data?.message || "Failed to update";
        Alert.alert("Error", message);
      }
    } catch (err) {
      console.warn("Update error:", err);
      Alert.alert(
        "Error",
        "Something went wrong while updating. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /** Remove a skill (by code) */
  const removeSkill = (code) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSkills((prev) => prev.filter((s) => s !== code));
  };

  // ----------------- OTP / Phone helpers (robust and backend-friendly) -----------------
  const handleSendOtp = async () => {
    if (!phone || !phone.trim()) {
      return Alert.alert("Error", "Please enter phone number");
    }

    try {
      // sendPhoneOtp should accept { phone: "..." } and return server response
      const res = await sendPhoneOtp({ phone: String(phone).trim() });
      console.log("sendPhoneOtp response:", res);

      // many API wrappers return shape in res.data.data, res.data, or directly res
      const data = res?.data ?? res;
      const status = (res?.status || data?.status || "")
        .toString()
        .toUpperCase();

      if (
        status.includes("SUCCESS") ||
        status.includes("OTP") ||
        status.includes("OK")
      ) {
        // find sessionId in possible locations
        const sId =
          data?.data?.sessionId ?? data?.sessionId ?? data?.session_id ?? "";
        if (sId) setSessionId(String(sId));
        setOtpSent(true);
        Alert.alert("OTP Sent", "Check your phone for the OTP.");
      } else {
        const msg = data?.message || res?.message || "Failed to send OTP";
        Alert.alert("Error", msg);
      }
    } catch (err) {
      console.warn("Send OTP error:", err);
      // Friendly message only
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    }
  };

  // const handleVerifyOtp = async () => {
  //   if (!otp || !otp.trim()) {
  //     return Alert.alert("Error", "Enter OTP");
  //   }

  //   try {
  //     // Build payload expected by backend: sessionId + otp (as per swagger)
  //     const payload = { otp: String(otp).trim() };
  //     if (sessionId) payload.sessionId = String(sessionId);

  //     // call verify; verifyPhoneOtp should send the payload to the proper endpoint
  //     const res = await verifyPhoneOtp(payload);
  //     console.log("verifyPhoneOtp response:", res);

  //     const data = res?.data ?? res;
  //     const status = (res?.status || data?.status || "")
  //       .toString()
  //       .toUpperCase();

  //     if (
  //       status.includes("SUCCESS") ||
  //       status.includes("VERIFIED") ||
  //       (data?.data && (data.data.accessToken || data.data.mssg))
  //     ) {
  //       setPhoneVerified(true);
  //       setOtpSent(false);
  //       setSessionId("");
  //       setOtp("");
  //       Alert.alert("Success", "Phone Verified Successfully!");
  //     } else {
  //       const msg = data?.message || "OTP verification failed";
  //       Alert.alert("Error", msg);
  //     }
  //   } catch (err) {
  //     console.warn("Verify OTP error:", err);
  //     Alert.alert("Error", "OTP verification failed. Please try again.");
  //   }
  // };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return Alert.alert("Error", "Enter OTP");

    try {
      const res = await verifyPhoneOtp(sessionId, otp);

      if (res?.status === "SUCCESS") {
        setIsPhoneVerified(true);
        Alert.alert("Verified", "Your phone number is now verified.");
      } else {
        Alert.alert("Error", res?.message || "Invalid OTP");
      }
    } catch (err) {
      Alert.alert("Error", err?.message || "Verification failed");
    }
  };
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Name */}
      <TextInput
        style={[styles.input]}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      {/* Bio */}
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Bio"
        multiline
        value={bio}
        onChangeText={setBio}
      />

      {/* Phone */}
      <TextInput
        style={[styles.input]}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        editable={!phoneVerified}
      />

      {/* OTP Section */}
      {!phoneVerified && (
        <>
          <TouchableOpacity
            style={[
              styles.btnSmall,
              { backgroundColor: "#1976D2", marginTop: 5 },
            ]}
            onPress={handleSendOtp}
          >
            <Text style={styles.btnSmallText}>Send OTP</Text>
          </TouchableOpacity>

          {otpSent && (
            <>
              <TextInput
                style={[styles.input]}
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
              />

              <TouchableOpacity
                style={[
                  styles.btnSmall,
                  { backgroundColor: "#388E3C", marginTop: 5 },
                ]}
                onPress={handleVerifyOtp}
              >
                <Text style={styles.btnSmallText}>Verify OTP</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btnSmall,
                  { backgroundColor: "#aaa", marginTop: 8 },
                ]}
                onPress={() => {
                  // allow user to cancel OTP flow and try again
                  setOtpSent(false);
                  setOtp("");
                }}
              >
                <Text style={[styles.btnSmallText, { color: "#fff" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}

      {phoneVerified && <Text style={styles.verified}>✅ Phone Verified</Text>}

      {/* Skills */}
      <Text style={{ fontWeight: "700", marginTop: 10 }}>Selected Skills:</Text>

      {skills.length > 0 ? (
        skills.map((code, i) => {
          const cat = categories.find((c) => String(c.code) === String(code));
          return (
            <View key={i} style={styles.skillItem}>
              <Text style={{ fontWeight: "600" }}>
                {cat ? cat.skillName || cat.name : code}
              </Text>
              <TouchableOpacity onPress={() => removeSkill(code)}>
                <Text style={{ color: "red", fontWeight: "700" }}>X</Text>
              </TouchableOpacity>
            </View>
          );
        })
      ) : (
        <Text style={{ color: "#666", marginVertical: 8 }}>
          No skills selected
        </Text>
      )}

      <TouchableOpacity
        style={[styles.btnSmall, { backgroundColor: "#009688" }]}
        onPress={() => setShowCategories((s) => !s)}
      >
        <Text style={styles.btnSmallText}>
          {showCategories ? "Hide Skill List" : "Choose Skills"}
        </Text>
      </TouchableOpacity>

      {showCategories && (
        <View style={styles.categoryList}>
          {categories.map((cat) => {
            const selected = skills.includes(String(cat.code));
            return (
              <TouchableOpacity
                key={cat.code}
                style={[
                  styles.skillItem,
                  { backgroundColor: selected ? "#C8E6C9" : "#f1f5f9" },
                ]}
                onPress={() => {
                  if (selected) removeSkill(cat.code);
                  else setSkills((prev) => [...prev, String(cat.code)]);
                }}
              >
                <View>
                  <Text style={{ fontWeight: "600" }}>
                    {cat.skillName || cat.name}
                  </Text>
                  <Text style={{ fontSize: 12 }}>Code: {cat.code}</Text>
                </View>
                <View />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Save / Update Button */}
      <TouchableOpacity style={styles.btn} onPress={submitProfile}>
        <Text style={styles.btnText}>
          {saving
            ? "Saving..."
            : originalProfile?.userid
            ? "Update Profile"
            : "Save Profile"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// STYLES
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
    marginTop: 10,
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
    padding: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verified: { color: "green", fontWeight: "bold", marginBottom: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  categoryList: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
});

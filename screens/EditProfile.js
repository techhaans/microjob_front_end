// // EditProfile.js (fixed OTP send + verify, cleaned error handling)
// import React, { useEffect, useState, useLayoutEffect } from "react";
// import * as ImagePicker from "expo-image-picker";
// import { Image } from "react-native";

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
//   const [gender, setGender] = useState(""); // e.g. "MALE" / "FEMALE" / "OTHER"
//   const [dob, setDob] = useState(""); // "YYYY-MM-DD"
//   const [photoUrl, setPhotoUrl] = useState(""); // url returned by upload
//   const [languagePref, setLanguagePref] = useState(""); // optional

//   const [categories, setCategories] = useState([]);
//   const [showCategories, setShowCategories] = useState(false);
//   const [editing, setEditing] = useState(true);

//   const [otpSent, setOtpSent] = useState(false);
//   const [isPhoneVerified, setIsPhoneVerified] = useState(false);

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
//       if (typeof s === "object") {
//         const maybeCode = s.code ?? s.code?.toString?.();
//         if (maybeCode && codeSet.has(String(maybeCode)))
//           result.push(String(maybeCode));
//         else {
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

//       const str = String(s).trim();
//       if (codeSet.has(str)) {
//         result.push(str);
//         continue;
//       }
//       const lower = str.toLowerCase();
//       const mapped =
//         skillNameToCode.get(lower) ||
//         nameToCode.get(lower) ||
//         displayToCode.get(lower);
//       if (mapped) result.push(mapped);
//     }

//     return Array.from(new Set(result));
//   };

//   // Load categories first, then profile
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       setLoading(true);
//       try {
//         const catRes = await fetchDoerCategories();
//         const categoryArray = Array.isArray(catRes?.data)
//           ? catRes.data
//           : Array.isArray(catRes)
//           ? catRes
//           : [];

//         if (!mounted) return;
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
//           setOriginalProfile({});
//         }
//       } catch (err) {
//         console.warn("Init load error:", err);
//         // keep UI friendly, do not surface raw error
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
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
//   const submitProfile = async () => {
//     if (!name.trim() || !phone.trim()) {
//       return Alert.alert("Validation", "Name and Phone are required");
//     }

//     setSaving(true);

//     try {
//       // Prepare final skills
//       const finalSkills =
//         Array.isArray(skills) && skills.length > 0
//           ? skills
//           : Array.isArray(originalProfile.skills)
//           ? originalProfile.skills
//           : [];

//       // Prepare payload: always include required fields, use existing if unchanged
//       const payload = {
//         name: name.trim() || originalProfile.name || "",
//         email: email.trim() || originalProfile.email || "",
//         bio: bio.trim() || originalProfile.bio || "",
//         phone: phone.trim() || originalProfile.phone || "",
//         skills: finalSkills,
//       };

//       console.log("Sending payload:", payload);

//       const res = await updateDoerProfile(payload);

//       const ok = res?.status === "SUCCESS" || res?.data?.status === "SUCCESS";
//       if (ok) {
//         // Refresh profile from server
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
//           setSkills(normalized.length > 0 ? normalized : []);
//           await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//         }

//         Alert.alert("Success", "Profile updated successfully!");
//         setEditing(false);
//       } else {
//         const message =
//           res?.message || res?.data?.message || "Failed to update";
//         Alert.alert("Error", message);
//       }
//     } catch (err) {
//       console.warn("Update error:", err);
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

//   // ----------------- OTP / Phone helpers (robust and backend-friendly) -----------------
//   const handleSendOtp = async () => {
//     if (!phone || !phone.trim()) {
//       return Alert.alert("Error", "Please enter phone number");
//     }

//     try {
//       // sendPhoneOtp should accept { phone: "..." } and return server response
//       const res = await sendPhoneOtp({ phone: String(phone).trim() });
//       console.log("sendPhoneOtp response:", res);

//       // many API wrappers return shape in res.data.data, res.data, or directly res
//       const data = res?.data ?? res;
//       const status = (res?.status || data?.status || "")
//         .toString()
//         .toUpperCase();

//       if (
//         status.includes("SUCCESS") ||
//         status.includes("OTP") ||
//         status.includes("OK")
//       ) {
//         // find sessionId in possible locations
//         const sId =
//           data?.data?.sessionId ?? data?.sessionId ?? data?.session_id ?? "";
//         if (sId) setSessionId(String(sId));
//         setOtpSent(true);
//         Alert.alert("OTP Sent", "Check your phone for the OTP.");
//       } else {
//         const msg = data?.message || res?.message || "Failed to send OTP";
//         Alert.alert("Error", msg);
//       }
//     } catch (err) {
//       console.warn("Send OTP error:", err);
//       // Friendly message only
//       Alert.alert("Error", "Failed to send OTP. Please try again.");
//     }
//   };

//   // const handleVerifyOtp = async () => {
//   //   if (!otp || !otp.trim()) {
//   //     return Alert.alert("Error", "Enter OTP");
//   //   }

//   //   try {
//   //     // Build payload expected by backend: sessionId + otp (as per swagger)
//   //     const payload = { otp: String(otp).trim() };
//   //     if (sessionId) payload.sessionId = String(sessionId);

//   //     // call verify; verifyPhoneOtp should send the payload to the proper endpoint
//   //     const res = await verifyPhoneOtp(payload);
//   //     console.log("verifyPhoneOtp response:", res);

//   //     const data = res?.data ?? res;
//   //     const status = (res?.status || data?.status || "")
//   //       .toString()
//   //       .toUpperCase();

//   //     if (
//   //       status.includes("SUCCESS") ||
//   //       status.includes("VERIFIED") ||
//   //       (data?.data && (data.data.accessToken || data.data.mssg))
//   //     ) {
//   //       setPhoneVerified(true);
//   //       setOtpSent(false);
//   //       setSessionId("");
//   //       setOtp("");
//   //       Alert.alert("Success", "Phone Verified Successfully!");
//   //     } else {
//   //       const msg = data?.message || "OTP verification failed";
//   //       Alert.alert("Error", msg);
//   //     }
//   //   } catch (err) {
//   //     console.warn("Verify OTP error:", err);
//   //     Alert.alert("Error", "OTP verification failed. Please try again.");
//   //   }
//   // };

//   const handleVerifyOtp = async () => {
//     if (!otp.trim()) return Alert.alert("Error", "Enter OTP");

//     try {
//       const res = await verifyPhoneOtp(sessionId, otp);

//       if (res?.status === "SUCCESS") {
//         setIsPhoneVerified(true);
//         Alert.alert("Verified", "Your phone number is now verified.");
//       } else {
//         Alert.alert("Error", res?.message || "Invalid OTP");
//       }
//     } catch (err) {
//       Alert.alert("Error", err?.message || "Verification failed");
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
//       /* Gender (simple text) */
//       <TextInput
//         style={[styles.input]}
//         placeholder="Gender (MALE / FEMALE / OTHER)"
//         value={gender}
//         onChangeText={setGender}
//       />
//       /* DOB (YYYY-MM-DD) */
//       <TextInput
//         style={[styles.input]}
//         placeholder="Date of birth (YYYY-MM-DD)"
//         value={dob}
//         onChangeText={setDob}
//         keyboardType="numeric"
//       />
//       /* Language preference (optional) */
//       <TextInput
//         style={[styles.input]}
//         placeholder="Language preference (e.g. en, hi)"
//         value={languagePref}
//         onChangeText={setLanguagePref}
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

//               <TouchableOpacity
//                 style={[
//                   styles.btnSmall,
//                   { backgroundColor: "#aaa", marginTop: 8 },
//                 ]}
//                 onPress={() => {
//                   // allow user to cancel OTP flow and try again
//                   setOtpSent(false);
//                   setOtp("");
//                 }}
//               >
//                 <Text style={[styles.btnSmallText, { color: "#fff" }]}>
//                   Cancel
//                 </Text>
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
// // src/screens/EditProfile.js
// import React, { useEffect, useState, useLayoutEffect } from "react";
// import * as ImagePicker from "expo-image-picker";
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
//   Image,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";

// import {
//   fetchDoerProfile,
//   updateDoerProfile,
//   sendPhoneOtp,
//   verifyPhoneOtp,
//   fetchDoerCategories,
//   uploadProfilePhotoAPI,
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
//   const [gender, setGender] = useState(""); // "MALE" / "FEMALE" / "OTHER"
//   const [dob, setDob] = useState(""); // "YYYY-MM-DD"
//   const [photoUrl, setPhotoUrl] = useState(""); // URL returned by server
//   const [languagePref, setLanguagePref] = useState("");

//   const [categories, setCategories] = useState([]);
//   const [showCategories, setShowCategories] = useState(false);
//   const [editing, setEditing] = useState(true);

//   const [otpSent, setOtpSent] = useState(false);
//   const [phoneVerified, setPhoneVerified] = useState(false);

//   const [otp, setOtp] = useState("");
//   const [sessionId, setSessionId] = useState("");

//   const [originalProfile, setOriginalProfile] = useState({});

//   // Header (back button)
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
//       if (typeof s === "object") {
//         const maybeCode = s.code ?? s.code?.toString?.();
//         if (maybeCode && codeSet.has(String(maybeCode)))
//           result.push(String(maybeCode));
//         else {
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

//       const str = String(s).trim();
//       if (codeSet.has(str)) {
//         result.push(str);
//         continue;
//       }
//       const lower = str.toLowerCase();
//       const mapped =
//         skillNameToCode.get(lower) ||
//         nameToCode.get(lower) ||
//         displayToCode.get(lower);
//       if (mapped) result.push(mapped);
//     }

//     return Array.from(new Set(result));
//   };

//   // Load categories first, then profile
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       setLoading(true);
//       try {
//         const catRes = await fetchDoerCategories();
//         const categoryArray = Array.isArray(catRes?.data)
//           ? catRes.data
//           : Array.isArray(catRes)
//           ? catRes
//           : [];

//         if (!mounted) return;
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
//           setPhoneVerified(p.is_phone_verified === true || !!p.phoneVerified);

//           // new fields
//           setGender(p.gender || "");
//           setDob(p.dob || "");
//           setPhotoUrl(p.photoUrl || p.pic || "");
//           setLanguagePref(p.languagePref || "");

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
//           setOriginalProfile({});
//         }
//       } catch (err) {
//         console.warn("Init load error:", err);
//         // keep UI friendly, do not surface raw error
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
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
//           setPhoneVerified(p.is_phone_verified === true || !!p.phoneVerified);

//           setGender(p.gender || "");
//           setDob(p.dob || "");
//           setPhotoUrl(p.photoUrl || p.pic || "");
//           setLanguagePref(p.languagePref || "");

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

//   const submitProfile = async () => {
//     if (!name.trim() || !phone.trim()) {
//       return Alert.alert("Validation", "Name and Phone are required");
//     }

//     setSaving(true);

//     try {
//       // Prepare final skills
//       const finalSkills =
//         Array.isArray(skills) && skills.length > 0
//           ? skills
//           : Array.isArray(originalProfile.skills)
//           ? originalProfile.skills
//           : [];

//       // Prepare payload: include the new fields
//       const payload = {
//         name: name.trim() || originalProfile.name || "",
//         email: email.trim() || originalProfile.email || "",
//         bio: bio.trim() || originalProfile.bio || "",
//         phone: phone.trim() || originalProfile.phone || "",
//         skills: finalSkills,
//         gender: (gender && gender.trim()) || originalProfile.gender || "",
//         dob: (dob && dob.trim()) || originalProfile.dob || "",
//         photoUrl:
//           photoUrl || originalProfile.photoUrl || originalProfile.pic || "",
//         languagePref: languagePref || originalProfile.languagePref || "",
//       };

//       console.log("Sending payload:", payload);

//       const res = await updateDoerProfile(payload);

//       const ok =
//         res?.status === "SUCCESS" ||
//         res?.data?.status === "SUCCESS" ||
//         res?.success === true;
//       if (ok) {
//         // Refresh profile from server
//         const profileRes = await fetchDoerProfile();
//         if (profileRes?.status === "SUCCESS" && profileRes.data) {
//           const p = profileRes.data;
//           setOriginalProfile(p);
//           setName(p.name || "");
//           setEmail(p.email || "");
//           setBio(p.bio || "");
//           setPhone(p.phone || "");
//           setPhoneVerified(p.is_phone_verified === true || !!p.phoneVerified);

//           setGender(p.gender || "");
//           setDob(p.dob || "");
//           setPhotoUrl(p.photoUrl || p.pic || "");
//           setLanguagePref(p.languagePref || "");

//           const normalized = normalizeSkillsToCodes(
//             Array.isArray(p.skills) ? p.skills : [],
//             categories
//           );
//           setSkills(normalized.length > 0 ? normalized : []);
//           await AsyncStorage.setItem("doerProfile", JSON.stringify(p));
//         }

//         Alert.alert("Success", "Profile updated successfully!");
//         setEditing(false);
//       } else {
//         const message =
//           res?.message ||
//           res?.data?.message ||
//           res?.error ||
//           "Failed to update";
//         Alert.alert("Error", message);
//       }
//     } catch (err) {
//       console.warn("Update error:", err);
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

//   // ----------------- OTP / Phone helpers -----------------
//   const handleSendOtp = async () => {
//     if (!phone || !phone.trim()) {
//       return Alert.alert("Error", "Please enter phone number");
//     }

//     try {
//       const res = await sendPhoneOtp({ phone: String(phone).trim() });
//       console.log("sendPhoneOtp response:", res);

//       const data = res?.data ?? res;
//       const status = (res?.status || data?.status || "")
//         .toString()
//         .toUpperCase();

//       if (
//         status.includes("SUCCESS") ||
//         status.includes("OTP") ||
//         status.includes("OK")
//       ) {
//         const sId =
//           data?.data?.sessionId ?? data?.sessionId ?? data?.session_id ?? "";
//         if (sId) setSessionId(String(sId));
//         setOtpSent(true);
//         Alert.alert("OTP Sent", "Check your phone for the OTP.");
//       } else {
//         const msg = data?.message || res?.message || "Failed to send OTP";
//         Alert.alert("Error", msg);
//       }
//     } catch (err) {
//       console.warn("Send OTP error:", err);
//       Alert.alert("Error", "Failed to send OTP. Please try again.");
//     }
//   };

//   const handleVerifyOtp = async () => {
//     if (!otp.trim()) return Alert.alert("Error", "Enter OTP");

//     try {
//       // build payload that backend expects
//       const payload = { otp: String(otp).trim() };
//       if (sessionId) payload.sessionId = String(sessionId);

//       const res = await verifyPhoneOtp(payload);
//       console.log("verifyPhoneOtp response:", res);

//       const data = res?.data ?? res;
//       const status = (res?.status || data?.status || "")
//         .toString()
//         .toUpperCase();

//       if (
//         status.includes("SUCCESS") ||
//         status.includes("VERIFIED") ||
//         data?.data?.verified === true ||
//         data?.verified === true
//       ) {
//         setPhoneVerified(true);
//         setOtpSent(false);
//         setSessionId("");
//         setOtp("");
//         Alert.alert("Success", "Phone Verified Successfully!");
//       } else {
//         const msg = data?.message || "OTP verification failed";
//         Alert.alert("Error", msg);
//       }
//     } catch (err) {
//       console.warn("Verify OTP error:", err);
//       Alert.alert("Error", "OTP verification failed. Please try again.");
//     }
//   };

//   // ----------------- Image pick & upload (Expo) -----------------
//   const pickImage = async () => {
//     try {
//       const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (!perm.granted) {
//         Alert.alert(
//           "Permission required",
//           "Camera roll permission is required to select a photo."
//         );
//         return;
//       }

//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         quality: 0.7,
//         allowsEditing: true,
//       });

//       if (!result.cancelled) {
//         await uploadProfilePhoto(result);
//       }
//     } catch (err) {
//       console.warn("Pick image error", err);
//       Alert.alert("Error", "Could not select image.");
//     }
//   };

//   const uploadProfilePhoto = async (imageResult) => {
//     try {
//       setSaving(true);
//       const uri = imageResult.uri;
//       const filename = uri.split("/").pop();
//       const match = /\.(\w+)$/.exec(filename);
//       const type = match ? `image/${match[1]}` : `image`;

//       const formData = new FormData();
//       formData.append("file", {
//         uri,
//         name: filename,
//         type,
//       });

//       const json = await uploadProfilePhotoAPI(formData);

//       // many backends return url in json.data.photoUrl or json.data.url etc
//       const newUrl =
//         json?.data?.photoUrl || json?.data?.url || json?.data?.image || "";
//       if (newUrl) {
//         setPhotoUrl(newUrl);
//         Alert.alert("Uploaded", "Photo uploaded successfully.");
//       } else {
//         // no url - still set data if backend returned plain data
//         if (json?.data) {
//           console.log("upload response data:", json.data);
//         }
//         Alert.alert("Uploaded", "Photo uploaded (server did not return URL).");
//       }
//     } catch (err) {
//       console.warn("Upload error", err);
//       Alert.alert("Error", "Failed to upload photo");
//     } finally {
//       setSaving(false);
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
//       {/* Profile Photo */}
//       <TouchableOpacity onPress={pickImage} style={{ alignItems: "center" }}>
//         {photoUrl ? (
//           <Image source={{ uri: photoUrl }} style={styles.profileImage} />
//         ) : (
//           <View style={[styles.profileImage, styles.profilePlaceholder]}>
//             <Ionicons name="person" size={48} color="#777" />
//             <Text style={{ color: "#777", marginTop: 6 }}>Add Photo</Text>
//           </View>
//         )}
//       </TouchableOpacity>

//       {/* Name */}
//       <TextInput
//         style={[styles.input]}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//       />

//       {/* Email */}
//       <TextInput
//         style={[styles.input]}
//         placeholder="Email"
//         keyboardType="email-address"
//         value={email}
//         onChangeText={setEmail}
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

//       {/* Gender */}
//       <TextInput
//         style={[styles.input]}
//         placeholder="Gender (MALE / FEMALE / OTHER)"
//         value={gender}
//         onChangeText={setGender}
//       />

//       {/* DOB */}
//       <TextInput
//         style={[styles.input]}
//         placeholder="Date of birth (YYYY-MM-DD)"
//         value={dob}
//         onChangeText={setDob}
//         keyboardType="numeric"
//       />

//       {/* Language Pref */}
//       <TextInput
//         style={[styles.input]}
//         placeholder="Language preference (e.g. en, hi)"
//         value={languagePref}
//         onChangeText={setLanguagePref}
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

//               <TouchableOpacity
//                 style={[
//                   styles.btnSmall,
//                   { backgroundColor: "#aaa", marginTop: 8 },
//                 ]}
//                 onPress={() => {
//                   setOtpSent(false);
//                   setOtp("");
//                 }}
//               >
//                 <Text style={[styles.btnSmallText, { color: "#fff" }]}>
//                   Cancel
//                 </Text>
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
//   profileImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 10,
//     marginBottom: 14,
//   },
//   profilePlaceholder: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 8,
//     width: 120,
//     height: 120,
//     borderRadius: 10,
//     backgroundColor: "#fafafa",
//   },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   Image,
//   ActivityIndicator,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { Ionicons } from "@expo/vector-icons";

// import {
//   fetchDoerProfile,
//   updateDoerProfile,
//   sendPhoneOtp,
//   verifyPhoneOtp,
//   fetchDoerCategories,
//   uploadProfilePhotoAPI,
// } from "../api/doer";

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [gender, setGender] = useState("");
//   const [dob, setDob] = useState("");
//   const [languagePref, setLanguagePref] = useState("");
//   const [photoUrl, setPhotoUrl] = useState("");

//   const [skills, setSkills] = useState([]);
//   const [categories, setCategories] = useState([]);

//   const [otpSent, setOtpSent] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [otp, setOtp] = useState("");

//   // Load Profile + categories
//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       const cats = await fetchDoerCategories();
//       setCategories(cats?.data || []);

//       const res = await fetchDoerProfile();
//       const p = res.data;

//       setName(p.name || "");
//       setEmail(p.email || "");
//       setBio(p.bio || "");
//       setGender(p.gender || "");
//       setDob(p.dob || "");
//       setLanguagePref(p.languagePref || "");
//       setPhone(p.phone || "");
//       setPhotoUrl(p.photoUrl || "");

//       // skills → array of codes
//       setSkills((p.skills || []).map((s) => String(s.code)));
//     } catch (err) {
//       Alert.alert("Error", "Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Select photo
//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.7,
//     });

//     if (!result.cancelled) {
//       const uploaded = await uploadProfilePhotoAPI(result.assets[0].uri);
//       setPhotoUrl(uploaded?.data?.url);
//     }
//   };

//   // Toggle skills
//   const toggleSkill = (code) => {
//     setSkills((prev) =>
//       prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
//     );
//   };

//   // Save Profile
//   const handleSave = async () => {
//     try {
//       setSaving(true);

//       const body = {
//         name,
//         email,
//         bio,
//         phone,
//         gender,
//         dob,
//         languagePref,
//         skills,
//         photoUrl,
//       };

//       const res = await updateDoerProfile(body);

//       Alert.alert("Success", "Profile updated successfully");

//       if (!res.data.phoneVerified) {
//         sendOtpToPhone();
//       }
//     } catch (err) {
//       Alert.alert("Update Failed", "Please try again");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const sendOtpToPhone = async () => {
//     try {
//       const res = await sendPhoneOtp();
//       setOtpSent(true);
//       setSessionId(res?.data?.sessionId);
//       Alert.alert("OTP Sent", "Please check your phone");
//     } catch {
//       Alert.alert("Error", "Failed to send OTP");
//     }
//   };

//   // Verify OTP
//   const verifyOtpNow = async () => {
//     try {
//       const res = await verifyPhoneOtp(sessionId, otp);
//       Alert.alert("Phone Verified", "Your number is verified");
//     } catch {
//       Alert.alert("Invalid OTP", "Try again");
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#000" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       {/* Profile Photo */}
//       <TouchableOpacity style={styles.photoWrap} onPress={pickImage}>
//         {photoUrl ? (
//           <Image source={{ uri: photoUrl }} style={styles.photo} />
//         ) : (
//           <Ionicons name="camera" size={35} color="#666" />
//         )}
//       </TouchableOpacity>

//       {/* Input Fields */}
//       <TextInput
//         style={styles.input}
//         value={name}
//         onChangeText={setName}
//         placeholder="Name"
//       />
//       <TextInput
//         style={styles.input}
//         value={email}
//         onChangeText={setEmail}
//         placeholder="Email"
//       />
//       <TextInput
//         style={styles.input}
//         value={bio}
//         onChangeText={setBio}
//         placeholder="Bio"
//       />

//       {/* Skills section */}
//       <Text style={styles.label}>Skills</Text>
//       <View style={styles.skillsWrap}>
//         {categories.map((cat) => (
//           <TouchableOpacity
//             key={cat.code}
//             style={[
//               styles.skillBox,
//               skills.includes(String(cat.code)) && styles.skillActive,
//             ]}
//             onPress={() => toggleSkill(String(cat.code))}
//           >
//             <Text
//               style={
//                 skills.includes(String(cat.code))
//                   ? styles.skillTextActive
//                   : styles.skillText
//               }
//             >
//               {cat.displayName}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Save Button */}
//       <TouchableOpacity style={styles.btn} onPress={handleSave}>
//         {saving ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.btnText}>Save Profile</Text>
//         )}
//       </TouchableOpacity>

//       {/* OTP Field */}
//       {otpSent && (
//         <View style={{ marginTop: 20 }}>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter OTP"
//             value={otp}
//             onChangeText={setOtp}
//           />
//           <TouchableOpacity style={styles.btn} onPress={verifyOtpNow}>
//             <Text style={styles.btnText}>Verify OTP</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   photoWrap: {
//     width: 110,
//     height: 110,
//     borderRadius: 55,
//     backgroundColor: "#eee",
//     alignSelf: "center",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   photo: { width: 110, height: 110, borderRadius: 55 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 10,
//   },
//   label: { fontSize: 16, fontWeight: "bold", marginTop: 20 },
//   skillsWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
//   skillBox: {
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderWidth: 1,
//     borderColor: "#777",
//     borderRadius: 20,
//     marginRight: 8,
//     marginBottom: 10,
//   },
//   skillActive: {
//     backgroundColor: "#000",
//     borderColor: "#000",
//   },
//   skillText: { color: "#555" },
//   skillTextActive: { color: "#fff" },
//   btn: {
//     backgroundColor: "#000",
//     padding: 15,
//     borderRadius: 10,
//     marginTop: 20,
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "bold" },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   Image,
//   ActivityIndicator,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { Ionicons } from "@expo/vector-icons";

// import {
//   fetchDoerProfile,
//   updateDoerProfile,
//   sendPhoneOtp,
//   verifyPhoneOtp,
//   fetchDoerCategories,
//   uploadProfilePhotoAPI,
// } from "../api/doer";

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   // Profile fields
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [gender, setGender] = useState("");
//   const [dob, setDob] = useState(""); // YYYY-MM-DD
//   const [languagePref, setLanguagePref] = useState("");
//   const [photoUrl, setPhotoUrl] = useState("");

//   const [skills, setSkills] = useState([]);
//   const [categories, setCategories] = useState([]);

//   // OTP
//   const [otpSent, setOtpSent] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [otp, setOtp] = useState("");

//   // Load Profile + categories
//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       const cats = await fetchDoerCategories();
//       setCategories(cats?.data || []);

//       const res = await fetchDoerProfile();
//       const p = res.data;

//       setName(p.name || "");
//       setEmail(p.email || "");
//       setBio(p.bio || "");
//       setGender(p.gender || "");
//       setDob(p.dob || "");
//       setLanguagePref(p.languagePref || "");
//       setPhone(p.phone || "");
//       setPhotoUrl(p.photoUrl || "");

//       setSkills((p.skills || []).map((s) => String(s.code)));
//     } catch (err) {
//       Alert.alert("Error", "Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Pick Image
//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.7,
//     });

//     if (!result.canceled) {
//       const fileUri = result.assets[0].uri;
//       const uploaded = await uploadProfilePhotoAPI(fileUri);

//       if (uploaded?.data?.url) {
//         setPhotoUrl(uploaded.data.url);
//       }
//     }
//   };

//   // Toggle skill selected
//   const toggleSkill = (code) => {
//     setSkills((prev) =>
//       prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
//     );
//   };

//   // Save Profile
//   const handleSave = async () => {
//     try {
//       setSaving(true);

//       const body = {
//         name,
//         email,
//         bio,
//         phone,
//         gender,
//         dob,
//         languagePref,
//         skills,
//         photoUrl,
//       };

//       await updateDoerProfile(body);

//       Alert.alert("Success", "Profile updated successfully");

//       sendOtpToPhone();
//     } catch (err) {
//       Alert.alert("Update Failed", "Try again");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const sendOtpToPhone = async () => {
//     try {
//       const res = await sendPhoneOtp();
//       setOtpSent(true);
//       setSessionId(res?.data?.sessionId);
//       Alert.alert("OTP Sent", "Check your phone");
//     } catch (e) {
//       Alert.alert("Error", "Failed to send OTP");
//     }
//   };

//   // Verify OTP
//   const verifyOtpNow = async () => {
//     try {
//       await verifyPhoneOtp(sessionId, otp);
//       Alert.alert("Verified", "Your phone number is now verified");
//     } catch {
//       Alert.alert("Invalid OTP", "Try again");
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#000" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       {/* Profile Photo */}
//       <TouchableOpacity style={styles.photoWrap} onPress={pickImage}>
//         {photoUrl ? (
//           <Image source={{ uri: photoUrl }} style={styles.photo} />
//         ) : (
//           <Ionicons name="camera" size={40} color="#666" />
//         )}
//       </TouchableOpacity>

//       {/* INPUTS */}
//       <TextInput
//         style={styles.input}
//         value={name}
//         onChangeText={setName}
//         placeholder="Full Name"
//       />
//       <TextInput
//         style={styles.input}
//         value={email}
//         onChangeText={setEmail}
//         placeholder="Email"
//       />
//       <TextInput
//         style={styles.input}
//         value={bio}
//         onChangeText={setBio}
//         placeholder="Bio"
//       />
//       <TextInput
//         style={styles.input}
//         value={phone}
//         onChangeText={setPhone}
//         placeholder="Phone Number"
//       />

//       {/* GENDER */}
//       <Text style={styles.label}>Gender</Text>
//       <View style={styles.row}>
//         {["MALE", "FEMALE", "OTHER"].map((g) => (
//           <TouchableOpacity
//             key={g}
//             style={[styles.option, gender === g && styles.optionActive]}
//             onPress={() => setGender(g)}
//           >
//             <Text
//               style={gender === g ? styles.optionTextActive : styles.optionText}
//             >
//               {g}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* DOB */}
//       <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
//       <TextInput
//         style={styles.input}
//         value={dob}
//         onChangeText={setDob}
//         placeholder="1999-12-31"
//       />

//       {/* LANGUAGE */}
//       <Text style={styles.label}>Language Preference</Text>
//       <TextInput
//         style={styles.input}
//         value={languagePref}
//         onChangeText={setLanguagePref}
//         placeholder="Eg: English, Telugu, Hindi"
//       />

//       {/* Skills */}
//       <Text style={styles.label}>Skills</Text>
//       <View style={styles.skillsWrap}>
//         {categories.map((cat) => (
//           <TouchableOpacity
//             key={cat.code}
//             style={[
//               styles.skillBox,
//               skills.includes(String(cat.code)) && styles.skillActive,
//             ]}
//             onPress={() => toggleSkill(String(cat.code))}
//           >
//             <Text
//               style={
//                 skills.includes(String(cat.code))
//                   ? styles.skillTextActive
//                   : styles.skillText
//               }
//             >
//               {cat.displayName}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Save */}
//       <TouchableOpacity style={styles.btn} onPress={handleSave}>
//         {saving ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.btnText}>Save Profile</Text>
//         )}
//       </TouchableOpacity>

//       {/* OTP */}
//       {otpSent && (
//         <View style={{ marginTop: 20 }}>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter OTP"
//             value={otp}
//             onChangeText={setOtp}
//           />
//           <TouchableOpacity style={styles.btn} onPress={verifyOtpNow}>
//             <Text style={styles.btnText}>Verify OTP</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },

//   photoWrap: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: "#eee",
//     alignSelf: "center",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   photo: { width: 120, height: 120, borderRadius: 60 },

//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 10,
//   },

//   label: { fontSize: 16, marginTop: 15, fontWeight: "bold" },

//   row: { flexDirection: "row", marginTop: 10 },
//   option: {
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderWidth: 1,
//     borderColor: "#777",
//     borderRadius: 20,
//     marginRight: 10,
//   },
//   optionActive: { backgroundColor: "#000", borderColor: "#000" },

//   optionText: { color: "#444" },
//   optionTextActive: { color: "#fff", fontWeight: "bold" },

//   skillsWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
//   skillBox: {
//     padding: 8,
//     borderWidth: 1,
//     borderColor: "#666",
//     marginRight: 8,
//     marginBottom: 8,
//     borderRadius: 20,
//   },
//   skillActive: { backgroundColor: "#000" },
//   skillText: { color: "#444" },
//   skillTextActive: { color: "#fff" },

//   btn: {
//     backgroundColor: "#000",
//     padding: 15,
//     borderRadius: 10,
//     marginTop: 20,
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "bold" },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   Image,
//   ActivityIndicator,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { Ionicons } from "@expo/vector-icons";

// import {
//   fetchDoerProfile,
//   updateDoerProfile,
//   sendPhoneOtp,
//   verifyPhoneOtp,
//   fetchDoerCategories,
//   uploadProfilePhotoAPI,
// } from "../api/doer";

// export default function EditProfile() {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   // Profile fields
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [gender, setGender] = useState("");
//   const [dob, setDob] = useState("");
//   const [languagePref, setLanguagePref] = useState("");
//   const [photoUrl, setPhotoUrl] = useState("");

//   const [skills, setSkills] = useState([]);
//   const [categories, setCategories] = useState([]);

//   const [originalPhone, setOriginalPhone] = useState("");

//   // OTP
//   const [otpSent, setOtpSent] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [otp, setOtp] = useState("");

//   // Load all initial data
//   useEffect(() => {
//     loadEverything();
//   }, []);

//   const loadEverything = async () => {
//     try {
//       const cats = await fetchDoerCategories();
//       setCategories(cats?.data || []);

//       const res = await fetchDoerProfile();
//       const p = res?.data;

//       setName(p?.name || "");
//       setEmail(p?.email || "");
//       setBio(p?.bio || "");
//       setGender(p?.gender || "");
//       setDob(p?.dob || "");
//       setLanguagePref(p?.languagePref || "");
//       setPhone(p?.phone || "");
//       setOriginalPhone(p?.phone || "");
//       setPhotoUrl(p?.photoUrl || "");

//       setSkills((p?.skills || []).map((s) => String(s.code)));
//     } catch (err) {
//       Alert.alert("Error", "Unable to load profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Choose image from gallery
//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.7,
//     });

//     if (!result.canceled) {
//       let uri = result.assets[0].uri;

//       try {
//         const uploaded = await uploadProfilePhotoAPI(uri);
//         if (uploaded?.data?.url) {
//           setPhotoUrl(uploaded.data.url);
//         }
//       } catch (e) {
//         Alert.alert("Upload Failed", "Could not upload image");
//       }
//     }
//   };

//   // Toggle Skills
//   const toggleSkill = (code) => {
//     setSkills((prev) =>
//       prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
//     );
//   };

//   // Save Profile
//   const handleSave = async () => {
//     try {
//       setSaving(true);

//       const body = {
//         name,
//         email,
//         bio,
//         phone,
//         gender,
//         dob,
//         languagePref,
//         skills,
//         photoUrl,
//       };

//       await updateDoerProfile(body);

//       Alert.alert("Success", "Profile updated");

//       if (phone !== originalPhone) {
//         sendOtpToPhone();
//       }
//     } catch (err) {
//       Alert.alert("Update Failed", "Try again later");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const sendOtpToPhone = async () => {
//     try {
//       const res = await sendPhoneOtp(phone);
//       setSessionId(res?.data?.sessionId);
//       setOtpSent(true);
//       Alert.alert("OTP Sent", "Check your mobile");
//     } catch (e) {
//       Alert.alert("Error", "Failed to send OTP");
//     }
//   };

//   // Verify OTP
//   const verifyOtpNow = async () => {
//     try {
//       await verifyPhoneOtp(sessionId, otp);
//       Alert.alert("Verified", "Phone number verified");

//       setOriginalPhone(phone);
//       setOtpSent(false);
//       setOtp("");
//     } catch {
//       Alert.alert("Invalid OTP", "Try again");
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#000" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       {/* Profile Image */}
//       <TouchableOpacity style={styles.photoWrap} onPress={pickImage}>
//         {photoUrl ? (
//           <Image source={{ uri: photoUrl }} style={styles.photo} />
//         ) : (
//           <Ionicons name="camera" size={40} color="#666" />
//         )}
//       </TouchableOpacity>

//       {/* Name */}
//       <TextInput
//         style={styles.input}
//         value={name}
//         onChangeText={setName}
//         placeholder="Full Name"
//       />

//       {/* Email */}
//       <TextInput
//         style={styles.input}
//         value={email}
//         onChangeText={setEmail}
//         placeholder="Email"
//       />

//       {/* Bio */}
//       <TextInput
//         style={styles.input}
//         value={bio}
//         onChangeText={setBio}
//         placeholder="Bio"
//       />

//       {/* Phone */}
//       <TextInput
//         style={styles.input}
//         value={phone}
//         onChangeText={setPhone}
//         placeholder="Phone Number"
//       />

//       {/* Gender */}
//       <Text style={styles.label}>Gender</Text>
//       <View style={styles.row}>
//         {["MALE", "FEMALE", "OTHER"].map((g) => (
//           <TouchableOpacity
//             key={g}
//             style={[styles.option, gender === g && styles.optionActive]}
//             onPress={() => setGender(g)}
//           >
//             <Text
//               style={gender === g ? styles.optionTextActive : styles.optionText}
//             >
//               {g}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* DOB */}
//       <Text style={styles.label}>DOB (YYYY-MM-DD)</Text>
//       <TextInput
//         style={styles.input}
//         value={dob}
//         onChangeText={setDob}
//         placeholder="1999-05-20"
//       />

//       {/* Language */}
//       <Text style={styles.label}>Language Preference</Text>
//       <TextInput
//         style={styles.input}
//         value={languagePref}
//         onChangeText={setLanguagePref}
//         placeholder="English, Telugu"
//       />

//       {/* Skills */}
//       <Text style={styles.label}>Skills</Text>
//       <View style={styles.skillsWrap}>
//         {categories.map((cat) => (
//           <TouchableOpacity
//             key={cat.code}
//             style={[
//               styles.skillBox,
//               skills.includes(String(cat.code)) && styles.skillActive,
//             ]}
//             onPress={() => toggleSkill(String(cat.code))}
//           >
//             <Text
//               style={
//                 skills.includes(String(cat.code))
//                   ? styles.skillTextActive
//                   : styles.skillText
//               }
//             >
//               {cat.displayName}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Save Button */}
//       <TouchableOpacity style={styles.btn} onPress={handleSave}>
//         {saving ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.btnText}>Save Profile</Text>
//         )}
//       </TouchableOpacity>

//       {/* OTP Section */}
//       {otpSent && (
//         <View style={{ marginTop: 20 }}>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter OTP"
//             value={otp}
//             onChangeText={setOtp}
//           />
//           <TouchableOpacity style={styles.btn} onPress={verifyOtpNow}>
//             <Text style={styles.btnText}>Verify OTP</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },

//   photoWrap: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: "#eee",
//     alignSelf: "center",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   photo: { width: 120, height: 120, borderRadius: 60 },

//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 12,
//   },

//   label: { fontSize: 16, marginTop: 18, fontWeight: "bold" },

//   row: { flexDirection: "row", marginTop: 10 },
//   option: {
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderWidth: 1,
//     borderColor: "#777",
//     borderRadius: 20,
//     marginRight: 10,
//   },
//   optionActive: { backgroundColor: "#000", borderColor: "#000" },
//   optionText: { color: "#444" },
//   optionTextActive: { color: "#fff", fontWeight: "bold" },

//   skillsWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
//   skillBox: {
//     padding: 8,
//     borderWidth: 1,
//     borderColor: "#333",
//     marginRight: 8,
//     marginBottom: 8,
//     borderRadius: 20,
//   },
//   skillActive: { backgroundColor: "#000" },
//   skillText: { color: "#444" },
//   skillTextActive: { color: "#fff" },

//   btn: {
//     backgroundColor: "#000",
//     padding: 15,
//     borderRadius: 10,
//     marginTop: 25,
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "bold" },
// });
// src/screens/EditProfile.js
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   Image,
//   ActivityIndicator,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   fetchDoerProfile,
//   fetchDoerCategories,
//   updateDoerProfile,
//   updateUserProfileAPI, // PATCH /api/user/profile/update
//   sendPhoneOtp,
//   verifyPhoneOtp,
// } from "../api/doer";

// /**
//  * IMPORTANT:
//  * - This file uses `AsyncStorage.getItem('authToken')` as the stored JWT.
//  * - If your token key is different (e.g. 'token'), change the key here and in your doer api.
//  *
//  * - The image upload uses fetch() directly and posts to:
//  *    http://192.168.1.40:8080/api/user/profile/photo/upload
//  *   Update BASE_URL below if your backend address differs.
//  */
// const BASE_URL = "http://192.168.1.40:8080/api";

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   // Profile fields (all included)
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [originalPhone, setOriginalPhone] = useState("");
//   const [gender, setGender] = useState("");
//   const [dob, setDob] = useState(""); // YYYY-MM-DD
//   const [languagePref, setLanguagePref] = useState("");
//   const [photoUrl, setPhotoUrl] = useState("");

//   // Skills/categories
//   const [skills, setSkills] = useState([]); // stored as array of codes e.g. ["101","102"]
//   const [categories, setCategories] = useState([]);

//   // OTP
//   const [otpSent, setOtpSent] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [otp, setOtp] = useState("");

//   // local selected image before upload
//   const [localImageUri, setLocalImageUri] = useState(null);

//   // initial load
//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       // categories
//       const cats = await fetchDoerCategories();
//       // fetchDoerCategories should return ApiResponse-like { status, data, ... } or array
//       const catArray = Array.isArray(cats?.data)
//         ? cats.data
//         : Array.isArray(cats)
//         ? cats
//         : [];
//       setCategories(catArray);

//       // profile (doer)
//       const profileRes = await fetchDoerProfile();
//       // fetchDoerProfile should return { status, data, ... } or the data directly
//       const p = profileRes?.data ?? profileRes;

//       if (p) {
//         setName(p.name || "");
//         setEmail(p.email || "");
//         setBio(p.bio || "");
//         setPhone(String(p.phone || ""));
//         setOriginalPhone(String(p.phone || ""));
//         setGender(p.gender || "");
//         setDob(p.dob || "");
//         setLanguagePref(p.languagePref || p.language || "");
//         setPhotoUrl(p.photoUrl || p.pic || "");

//         // normalize skills -> array of codes (if items are objects or strings)
//         const incomingSkills = Array.isArray(p.skills) ? p.skills : [];
//         const normalized = incomingSkills
//           .map((s) => {
//             if (s == null) return null;
//             if (typeof s === "object")
//               return String(s.code ?? s.id ?? s.value ?? "");
//             return String(s);
//           })
//           .filter(Boolean);
//         setSkills(normalized);
//       }
//     } catch (err) {
//       console.warn("Load data error:", err);
//       Alert.alert("Error", "Failed to load profile or categories");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // pick image (expo-image-picker)
//   const pickImage = async () => {
//     try {
//       const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (!perm.granted) {
//         Alert.alert(
//           "Permission needed",
//           "Allow gallery access to pick a photo."
//         );
//         return;
//       }

//       const res = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         quality: 0.7,
//         allowsEditing: true,
//         aspect: [1, 1],
//       });

//       // expo v46+ returns { canceled: boolean, assets: [{ uri, ... }] }
//       if (res.cancelled === false || res.canceled === false) {
//         const uri = res.assets ? res.assets[0].uri : res.uri;
//         setLocalImageUri(uri);
//       }
//     } catch (err) {
//       console.warn("Pick image error:", err);
//       Alert.alert("Error", "Could not pick image");
//     }
//   };

//   // upload image using fetch (multipart/form-data)
//   const uploadProfilePhoto = async () => {
//     if (!localImageUri) {
//       Alert.alert("Select image", "Please choose a photo first.");
//       return null;
//     }

//     try {
//       setSaving(true);

//       const token = await AsyncStorage.getItem("authToken");
//       const formData = new FormData();
//       const filename = localImageUri.split("/").pop();
//       const match = /\.(\w+)$/.exec(filename || "");
//       const type = match ? `image/${match[1]}` : "image/jpeg";

//       // For React Native, file object shape: { uri, name, type }
//       formData.append("file", {
//         uri: localImageUri,
//         name: filename,
//         type,
//       });

//       const res = await fetch(`${BASE_URL}/user/profile/photo/upload`, {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           Authorization: token ? `Bearer ${token}` : undefined,
//           // Do NOT set Content-Type; let fetch set it including boundary
//         },
//         body: formData,
//       });

//       const json = await res.json();
//       if (res.ok) {
//         // backend might return data.photoUrl or data.url
//         const newUrl =
//           json?.data?.photoUrl || json?.data?.url || json?.data?.image || "";
//         if (newUrl) {
//           setPhotoUrl(newUrl);
//           setLocalImageUri(null);
//           Alert.alert("Uploaded", "Photo uploaded successfully");
//           return newUrl;
//         } else {
//           console.log("Upload response without url:", json);
//           Alert.alert(
//             "Uploaded",
//             "Photo uploaded but server didn't return URL"
//           );
//           return null;
//         }
//       } else {
//         console.warn("Upload failed:", json);
//         Alert.alert("Upload failed", json?.message || "Photo upload failed");
//         return null;
//       }
//     } catch (err) {
//       console.warn("Upload error:", err);
//       Alert.alert("Error", "Failed to upload photo");
//       return null;
//     } finally {
//       setSaving(false);
//     }
//   };

//   // toggle skill selection (pass category.code or id)
//   const toggleSkill = (code) => {
//     setSkills((prev) => {
//       const s = String(code);
//       if (prev.includes(s)) return prev.filter((x) => x !== s);
//       return [...prev, s];
//     });
//   };

//   // send OTP (backend expects auth token and uses stored phone on profile or passed phone)
//   const sendOtpToPhone = async () => {
//     try {
//       // sendPhoneOtp in your doer API sometimes expects (phone) or nothing (server uses logged-in phone).
//       // We'll call sendPhoneOtp with phone if your API accepts it; otherwise it will still work if server uses JWT user.
//       const res = await sendPhoneOtp(phone);
//       const sid =
//         res?.data?.sessionId ?? res?.sessionId ?? res?.session_id ?? "";
//       if (sid) setSessionId(String(sid));
//       setOtpSent(true);
//       Alert.alert("OTP sent", "Check your phone for OTP");
//     } catch (err) {
//       console.warn("Send OTP error:", err);
//       Alert.alert("Error", "Failed to send OTP");
//     }
//   };

//   // verify otp
//   const verifyOtpNow = async () => {
//     if (!otp || !otp.trim()) return Alert.alert("Enter OTP");
//     try {
//       // your verifyPhoneOtp expects either (sessionId, otp) or payload
//       const res = await verifyPhoneOtp(sessionId, otp);
//       const ok =
//         res?.status === "SUCCESS" ||
//         res?.data?.status === "SUCCESS" ||
//         res?.verified === true ||
//         res?.data?.verified === true;
//       if (ok) {
//         Alert.alert("Verified", "Phone verified successfully");
//         setOtpSent(false);
//         setSessionId("");
//       } else {
//         Alert.alert("Invalid OTP", res?.message || "OTP verification failed");
//       }
//     } catch (err) {
//       console.warn("Verify OTP error:", err);
//       Alert.alert("Error", "OTP verification failed");
//     }
//   };

//   // submit final: upload photo (if selected) -> patch user general profile -> put doer profile
//   const handleSave = async () => {
//     if (!name.trim() || !phone.trim()) {
//       return Alert.alert("Validation", "Name and phone are required");
//     }

//     try {
//       setSaving(true);

//       // 1) upload photo if user selected a new one
//       let uploadedPhotoUrl = photoUrl;
//       if (localImageUri) {
//         const newUrl = await uploadProfilePhoto();
//         if (newUrl) uploadedPhotoUrl = newUrl;
//       }

//       // 2) PATCH general user profile (gender, dob, photoUrl, languagePref)
//       try {
//         const userBody = {
//           gender: gender || undefined,
//           dob: dob || undefined,
//           photoUrl: uploadedPhotoUrl || undefined,
//           languagePref: languagePref || undefined,
//         };
//         await updateUserProfileAPI(userBody);
//       } catch (err) {
//         // Non-fatal: continue to update doer profile as well
//         console.warn("PATCH user profile error:", err);
//       }

//       // 3) PUT doer profile (name, phone, bio, skills, email maybe)
//       const doerBody = {
//         name: name.trim(),
//         phone: String(phone).trim(),
//         bio: bio || undefined,
//         skills: skills, // array of codes
//         email: email?.trim() || undefined,
//       };

//       await updateDoerProfile(doerBody);

//       // 4) If phone changed, send OTP to new phone
//       if (String(phone).trim() !== String(originalPhone).trim()) {
//         await sendOtpToPhone();
//       }

//       Alert.alert("Success", "Profile saved");
//       setOriginalPhone(String(phone).trim());
//     } catch (err) {
//       console.warn("Save error:", err);
//       Alert.alert("Error", "Failed to save profile");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#000" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Photo */}
//       <TouchableOpacity onPress={pickImage} style={styles.photoWrap}>
//         {photoUrl || localImageUri ? (
//           <Image
//             source={{ uri: localImageUri || photoUrl }}
//             style={styles.photo}
//           />
//         ) : (
//           <View style={styles.photoPlaceholder}>
//             <Text style={{ color: "#666" }}>Add Photo</Text>
//           </View>
//         )}
//       </TouchableOpacity>

//       {/* Name */}
//       <TextInput
//         style={styles.input}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//       />

//       {/* Email */}
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//       />

//       {/* Bio */}
//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Bio"
//         value={bio}
//         onChangeText={setBio}
//         multiline
//       />

//       {/* Phone */}
//       <TextInput
//         style={styles.input}
//         placeholder="Phone"
//         value={phone}
//         onChangeText={setPhone}
//         keyboardType="phone-pad"
//       />

//       {/* Gender */}
//       <Text style={{ fontWeight: "600", marginTop: 8 }}>Gender</Text>
//       <View style={styles.row}>
//         {["MALE", "FEMALE", "OTHER"].map((g) => (
//           <TouchableOpacity
//             key={g}
//             style={[styles.option, gender === g && styles.optionActive]}
//             onPress={() => setGender(g)}
//           >
//             <Text
//               style={gender === g ? styles.optionTextActive : styles.optionText}
//             >
//               {g}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* DOB */}
//       <TextInput
//         style={styles.input}
//         placeholder="DOB (YYYY-MM-DD)"
//         value={dob}
//         onChangeText={setDob}
//       />

//       {/* Language */}
//       <TextInput
//         style={styles.input}
//         placeholder="Language (e.g. ENG, HIN)"
//         value={languagePref}
//         onChangeText={setLanguagePref}
//       />

//       {/* Skills */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>Skills</Text>
//       <View style={styles.skillsWrap}>
//         {categories.map((cat) => {
//           const code = String(cat.code ?? cat.id ?? cat.value ?? cat.code);
//           const selected = skills.includes(code);
//           return (
//             <TouchableOpacity
//               key={code}
//               onPress={() => toggleSkill(code)}
//               style={[styles.skillBox, selected && styles.skillBoxSelected]}
//             >
//               <Text style={selected ? { color: "#fff" } : { color: "#333" }}>
//                 {cat.skillName || cat.name || cat.displayName || code}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       {/* Save */}
//       <TouchableOpacity
//         style={styles.saveBtn}
//         onPress={handleSave}
//         disabled={saving}
//       >
//         <Text style={styles.saveText}>
//           {saving ? "Saving..." : "Save Profile"}
//         </Text>
//       </TouchableOpacity>

//       {/* OTP area (visible if otpSent true) */}
//       {otpSent && (
//         <View style={{ marginTop: 16 }}>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter OTP"
//             value={otp}
//             onChangeText={setOtp}
//             keyboardType="numeric"
//           />
//           <TouchableOpacity
//             style={[styles.saveBtn, { backgroundColor: "#388E3C" }]}
//             onPress={verifyOtpNow}
//           >
//             <Text style={styles.saveText}>Verify OTP</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, paddingBottom: 40 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   photoWrap: { alignItems: "center", marginBottom: 12 },
//   photo: { width: 120, height: 120, borderRadius: 10 },
//   photoPlaceholder: {
//     width: 120,
//     height: 120,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   input: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },

//   row: { flexDirection: "row", marginTop: 8 },
//   option: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: "#777",
//     marginRight: 8,
//     borderRadius: 20,
//   },
//   optionActive: { backgroundColor: "#000", borderColor: "#000" },
//   optionText: { color: "#444" },
//   optionTextActive: { color: "#fff" },

//   skillsWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
//   skillBox: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 20,
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   skillBoxSelected: { backgroundColor: "#000", borderColor: "#000" },

//   saveBtn: {
//     backgroundColor: "#1976D2",
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 14,
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
// });
// src/screens/EditProfile.js
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   Image,
//   ActivityIndicator,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   fetchDoerProfile,
//   fetchDoerCategories,
//   updateDoerProfile,
//   updateUserProfileAPI,
//   sendPhoneOtp,
//   verifyPhoneOtp,
// } from "../api/doer";

// /**
//  * EditProfile
//  * - loads categories + profile
//  * - maps profile.skills (names/objects) -> category codes
//  * - allows picking & uploading profile photo
//  * - updates user profile (PATCH) and doer profile (PUT)
//  * - sends OTP if phone changed and verifies it
//  *
//  * IMPORTANT: API helpers used:
//  *  - fetchDoerCategories()
//  *  - fetchDoerProfile()
//  *  - updateUserProfileAPI(body)  -> PATCH /api/user/profile/update
//  *  - updateDoerProfile(body)     -> PUT /api/doer/profile/
//  *  - sendPhoneOtp(phone?)        -> POST /doer/profile/phone/send-otp  (uses JWT)
//  *  - verifyPhoneOtp(sessionId, otp) -> POST /doer/profile/phone/verify
//  *
//  * Image upload uses a direct fetch to:
//  *   `${BASE_URL}/user/profile/photo/upload` (multipart/form-data)
//  * Make sure BASE_URL matches your backend.
//  */
// const BASE_URL = "http://192.168.1.40:8080/api";

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   // profile fields
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [originalPhone, setOriginalPhone] = useState("");
//   const [gender, setGender] = useState("");
//   const [dob, setDob] = useState("");
//   const [languagePref, setLanguagePref] = useState("");
//   const [photoUrl, setPhotoUrl] = useState("");

//   // skills / categories
//   const [skills, setSkills] = useState([]); // -> array of codes (strings)
//   const [categories, setCategories] = useState([]);

//   // image local
//   const [localImageUri, setLocalImageUri] = useState(null);

//   // OTP
//   const [otpSent, setOtpSent] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [otp, setOtp] = useState("");

//   useEffect(() => {
//     loadData();
//   }, []);

//   // load categories and profile; map incoming skill names -> codes
//   const loadData = async () => {
//     try {
//       setLoading(true);

//       // 1) fetch categories
//       const catsRes = await fetchDoerCategories();
//       const catArray = Array.isArray(catsRes?.data)
//         ? catsRes.data
//         : Array.isArray(catsRes)
//         ? catsRes
//         : [];
//       setCategories(catArray);

//       // 2) fetch profile
//       const profileRes = await fetchDoerProfile();
//       const p = profileRes?.data ?? profileRes ?? {};

//       // basic fields
//       setName(p?.name ?? "");
//       setEmail(p?.email ?? "");
//       setBio(p?.bio ?? "");
//       setPhone(String(p?.phone ?? ""));
//       setOriginalPhone(String(p?.phone ?? ""));
//       setGender(p?.gender ?? "");
//       setDob(p?.dob ?? "");
//       setLanguagePref(p?.languagePref ?? p?.language ?? "");
//       setPhotoUrl(p?.photoUrl ?? p?.pic ?? "");

//       // 3) normalize skills -> ensure we store codes only
//       const incomingSkills = Array.isArray(p?.skills) ? p.skills : [];
//       // build lookup maps from categories (case-insensitive)
//       const codeByName = new Map();
//       for (const c of catArray) {
//         const code = String(c.code ?? c.id ?? "");
//         if (!code) continue;
//         if (c.skillName)
//           codeByName.set(String(c.skillName).toLowerCase(), code);
//         if (c.name) codeByName.set(String(c.name).toLowerCase(), code);
//         if (c.displayName)
//           codeByName.set(String(c.displayName).toLowerCase(), code);
//       }

//       const normalized = incomingSkills
//         .map((s) => {
//           if (s == null) return null;
//           // if object with code/id
//           if (typeof s === "object") {
//             const maybe = String(s.code ?? s.id ?? s.value ?? "").trim();
//             if (maybe) return maybe;
//             // else try name fields inside object
//             const name = String(s.skillName ?? s.name ?? s.displayName ?? "")
//               .trim()
//               .toLowerCase();
//             return codeByName.get(name) ?? null;
//           }

//           // if string: could be a code or a name
//           const str = String(s).trim();
//           if (!str) return null;
//           // if looks like numeric code or matches any category code, accept it directly
//           if (catArray.some((c) => String(c.code) === str)) return str;
//           // else map name -> code (case-insensitive)
//           const mapped = codeByName.get(str.toLowerCase());
//           return mapped ?? null;
//         })
//         .filter(Boolean);

//       setSkills(normalized);
//     } catch (err) {
//       console.warn("Load data error:", err);
//       Alert.alert("Error", "Failed to load profile or categories");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // image picker
//   const pickImage = async () => {
//     try {
//       const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (!perm.granted) {
//         Alert.alert(
//           "Permission required",
//           "Allow gallery access to select a photo."
//         );
//         return;
//       }
//       const res = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         quality: 0.7,
//         allowsEditing: true,
//         aspect: [1, 1],
//       });

//       // compat for different expo versions:
//       const canceled = res?.canceled ?? res?.cancelled ?? false;
//       if (!canceled) {
//         const uri = res.assets ? res.assets[0].uri : res.uri;
//         setLocalImageUri(uri);
//       }
//     } catch (err) {
//       console.warn("Pick image error:", err);
//       Alert.alert("Error", "Could not pick image");
//     }
//   };

//   // upload selected photo to backend; returns uploaded URL or null
//   const uploadProfilePhoto = async () => {
//     if (!localImageUri) {
//       Alert.alert("Select image", "Please choose a photo first.");
//       return null;
//     }

//     try {
//       setSaving(true);
//       const token = await AsyncStorage.getItem("authToken");
//       const formData = new FormData();
//       const filename = localImageUri.split("/").pop();
//       const match = /\.(\w+)$/.exec(filename || "");
//       const type = match ? `image/${match[1]}` : "image/jpeg";

//       formData.append("file", {
//         uri: localImageUri,
//         name: filename,
//         type,
//       });

//       const res = await fetch(`${BASE_URL}/user/profile/photo/upload`, {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           Authorization: token ? `Bearer ${token}` : undefined,
//           // DO NOT set Content-Type; fetch will set boundary
//         },
//         body: formData,
//       });

//       const json = await res.json();
//       if (res.ok) {
//         const newUrl =
//           json?.data?.photoUrl || json?.data?.url || json?.data?.image || "";
//         if (newUrl) {
//           setPhotoUrl(newUrl);
//           setLocalImageUri(null);
//           Alert.alert("Uploaded", "Photo uploaded successfully.");
//           return newUrl;
//         } else {
//           console.log("Upload succeeded but no URL returned:", json);
//           Alert.alert(
//             "Uploaded",
//             "Photo uploaded but server did not return URL."
//           );
//           return null;
//         }
//       } else {
//         console.warn("Upload failed:", json);
//         Alert.alert("Upload failed", json?.message || "Photo upload failed");
//         return null;
//       }
//     } catch (err) {
//       console.warn("Upload error:", err);
//       Alert.alert("Error", "Failed to upload photo");
//       return null;
//     } finally {
//       setSaving(false);
//     }
//   };

//   // toggle skill by code
//   const toggleSkill = (code) => {
//     setSkills((prev) => {
//       const s = String(code);
//       if (prev.includes(s)) return prev.filter((x) => x !== s);
//       return [...prev, s];
//     });
//   };

//   // send OTP (server might use logged-in user's phone; still we pass phone if supported)
//   const sendOtpToPhone = async () => {
//     try {
//       const res = await sendPhoneOtp(phone);
//       const sid =
//         res?.data?.sessionId ?? res?.sessionId ?? res?.session_id ?? "";
//       if (sid) setSessionId(String(sid));
//       setOtpSent(true);
//       Alert.alert("OTP Sent", "Check your phone for the OTP.");
//     } catch (err) {
//       console.warn("Send OTP error:", err);
//       Alert.alert("Error", "Failed to send OTP");
//     }
//   };

//   // verify OTP
//   const verifyOtpNow = async () => {
//     if (!otp || !otp.trim()) return Alert.alert("Validation", "Enter OTP");
//     try {
//       const res = await verifyPhoneOtp(sessionId, otp);
//       const ok =
//         res?.status === "SUCCESS" ||
//         res?.data?.status === "SUCCESS" ||
//         res?.verified === true ||
//         res?.data?.verified === true;
//       if (ok) {
//         Alert.alert("Verified", "Phone verified successfully");
//         setOtpSent(false);
//         setSessionId("");
//       } else {
//         Alert.alert("Invalid OTP", res?.message || "OTP verification failed");
//       }
//     } catch (err) {
//       console.warn("Verify OTP error:", err);
//       Alert.alert("Error", "OTP verification failed");
//     }
//   };

//   // Save profile:
//   // 1) upload photo if selected
//   // 2) PATCH /user/profile (gender,dob,photoUrl,languagePref) - non-fatal
//   // 3) PUT /doer/profile (name, phone, bio, skills, email)
//   // 4) send OTP if phone changed
//   const handleSave = async () => {
//     if (!name.trim() || !phone.trim()) {
//       return Alert.alert("Validation", "Name and phone are required");
//     }

//     try {
//       setSaving(true);

//       // 1) upload photo if selected
//       let uploadedPhotoUrl = photoUrl;
//       if (localImageUri) {
//         const newUrl = await uploadProfilePhoto();
//         if (newUrl) uploadedPhotoUrl = newUrl;
//       }

//       // 2) PATCH user profile (non-fatal)
//       try {
//         const userBody = {
//           gender: gender || undefined,
//           dob: dob || undefined,
//           photoUrl: uploadedPhotoUrl || undefined,
//           languagePref: languagePref || undefined,
//         };
//         await updateUserProfileAPI(userBody);
//       } catch (err) {
//         console.warn("PATCH user profile error (non-fatal):", err);
//       }

//       // 3) prepare doer body: ensure skills are codes (strings)
//       const finalSkills = Array.isArray(skills) ? skills.map(String) : [];

//       const doerBody = {
//         name: name.trim(),
//         phone: String(phone).trim(),
//         bio: bio?.trim() || undefined,
//         skills: finalSkills,
//         email: email?.trim() || undefined,
//       };

//       await updateDoerProfile(doerBody);

//       // 4) if phone changed, send OTP
//       if (String(phone).trim() !== String(originalPhone).trim()) {
//         await sendOtpToPhone();
//       }

//       Alert.alert("Success", "Profile saved successfully");
//       setOriginalPhone(String(phone).trim());
//     } catch (err) {
//       console.warn("Save error:", err);
//       Alert.alert("Error", "Failed to save profile. See console for details.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#000" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Photo */}
//       <TouchableOpacity onPress={pickImage} style={styles.photoWrap}>
//         {localImageUri || photoUrl ? (
//           <Image
//             source={{ uri: localImageUri || photoUrl }}
//             style={styles.photo}
//           />
//         ) : (
//           <View style={styles.photoPlaceholder}>
//             <Text style={{ color: "#666" }}>Add Photo</Text>
//           </View>
//         )}
//       </TouchableOpacity>

//       {/* Name */}
//       <TextInput
//         style={styles.input}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//       />

//       {/* Email */}
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//       />

//       {/* Bio */}
//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Bio"
//         value={bio}
//         onChangeText={setBio}
//         multiline
//       />

//       {/* Phone */}
//       <TextInput
//         style={styles.input}
//         placeholder="Phone"
//         value={phone}
//         onChangeText={setPhone}
//         keyboardType="phone-pad"
//       />

//       {/* Gender */}
//       <Text style={{ fontWeight: "600", marginTop: 8 }}>Gender</Text>
//       <View style={styles.row}>
//         {["MALE", "FEMALE", "OTHER"].map((g) => (
//           <TouchableOpacity
//             key={g}
//             style={[styles.option, gender === g && styles.optionActive]}
//             onPress={() => setGender(g)}
//           >
//             <Text
//               style={gender === g ? styles.optionTextActive : styles.optionText}
//             >
//               {g}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* DOB */}
//       <TextInput
//         style={styles.input}
//         placeholder="DOB (YYYY-MM-DD)"
//         value={dob}
//         onChangeText={setDob}
//       />

//       {/* Language */}
//       <TextInput
//         style={styles.input}
//         placeholder="Language (e.g. ENG, HIN)"
//         value={languagePref}
//         onChangeText={setLanguagePref}
//       />

//       {/* Skills */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>Skills</Text>
//       <View style={styles.skillsWrap}>
//         {categories.map((cat) => {
//           const code = String(cat.code ?? cat.id ?? "");
//           const selected = skills.includes(code);
//           return (
//             <TouchableOpacity
//               key={code}
//               onPress={() => toggleSkill(code)}
//               style={[styles.skillBox, selected && styles.skillBoxSelected]}
//             >
//               <Text style={selected ? { color: "#fff" } : { color: "#333" }}>
//                 {cat.skillName || cat.name || cat.displayName || code}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       {/* Save */}
//       <TouchableOpacity
//         style={styles.saveBtn}
//         onPress={handleSave}
//         disabled={saving}
//       >
//         {saving ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.saveText}>Save Profile</Text>
//         )}
//       </TouchableOpacity>

//       {/* OTP area */}
//       {otpSent && (
//         <View style={{ marginTop: 16 }}>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter OTP"
//             value={otp}
//             onChangeText={setOtp}
//             keyboardType="numeric"
//           />
//           <TouchableOpacity
//             style={[styles.saveBtn, { backgroundColor: "#388E3C" }]}
//             onPress={verifyOtpNow}
//           >
//             <Text style={styles.saveText}>Verify OTP</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, paddingBottom: 40 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   photoWrap: { alignItems: "center", marginBottom: 12 },
//   photo: { width: 120, height: 120, borderRadius: 10 },
//   photoPlaceholder: {
//     width: 120,
//     height: 120,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   input: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },

//   row: { flexDirection: "row", marginTop: 8 },
//   option: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: "#777",
//     marginRight: 8,
//     borderRadius: 20,
//   },
//   optionActive: { backgroundColor: "#000", borderColor: "#000" },
//   optionText: { color: "#444" },
//   optionTextActive: { color: "#fff" },

//   skillsWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
//   skillBox: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 20,
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   skillBoxSelected: { backgroundColor: "#000", borderColor: "#000" },

//   saveBtn: {
//     backgroundColor: "#1976D2",
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 14,
//   },
//   saveText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 16,
//     textAlign: "center",
//   },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   Image,
//   ActivityIndicator,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   fetchDoerProfile,
//   fetchDoerCategories,
//   updateDoerProfile,
//   updateUserProfileAPI,
//   sendPhoneOtp,
//   verifyPhoneOtp,
// } from "../api/doer";

// const BASE_URL = "http://192.168.1.40:8080/api";

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [originalPhone, setOriginalPhone] = useState("");
//   const [gender, setGender] = useState("");
//   const [dob, setDob] = useState("");
//   const [languagePref, setLanguagePref] = useState("");
//   const [photoUrl, setPhotoUrl] = useState("");

//   const [skills, setSkills] = useState([]);
//   const [categories, setCategories] = useState([]);

//   const [localImageUri, setLocalImageUri] = useState(null);

//   const [otpSent, setOtpSent] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [otp, setOtp] = useState("");

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       setLoading(true);

//       const catsRes = await fetchDoerCategories();
//       const catArray = Array.isArray(catsRes?.data)
//         ? catsRes.data
//         : Array.isArray(catsRes)
//         ? catsRes
//         : [];
//       setCategories(catArray);

//       const profileRes = await fetchDoerProfile();
//       const p = profileRes?.data ?? profileRes ?? {};

//       setName(p?.name ?? "");
//       setEmail(p?.email ?? "");
//       setBio(p?.bio ?? "");
//       setPhone(String(p?.phone ?? ""));
//       setOriginalPhone(String(p?.phone ?? ""));
//       setGender(p?.gender ?? "");
//       setDob(p?.dob ?? "");
//       setLanguagePref(p?.languagePref ?? p?.language ?? "");
//       setPhotoUrl(p?.photoUrl ?? p?.pic ?? "");

//       const incomingSkills = Array.isArray(p?.skills) ? p.skills : [];

//       const codeByName = new Map();
//       for (const c of catArray) {
//         const code = String(c.code ?? c.id ?? "");
//         if (!code) continue;

//         if (c.skillName) codeByName.set(String(c.skillName).toLowerCase(), code);
//         if (c.name) codeByName.set(String(c.name).toLowerCase(), code);
//         if (c.displayName)
//           codeByName.set(String(c.displayName).toLowerCase(), code);
//       }

//       const normalized = incomingSkills
//         .map((s) => {
//           if (typeof s === "object") {
//             const maybe = String(s.code ?? s.id ?? s.value ?? "").trim();
//             if (maybe) return maybe;

//             const name = String(s.skillName ?? s.name ?? s.displayName ?? "")
//               .trim()
//               .toLowerCase();
//             return codeByName.get(name) ?? null;
//           }

//           const str = String(s).trim();
//           if (!str) return null;

//           if (catArray.some((c) => String(c.code) === str)) return str;

//           return codeByName.get(str.toLowerCase()) ?? null;
//         })
//         .filter(Boolean);

//       setSkills(normalized);
//     } catch (err) {
//       Alert.alert("Error", "Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const pickImage = async () => {
//     try {
//       const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (!perm.granted) {
//         Alert.alert("Permission denied", "Enable gallery permission.");
//         return;
//       }

//       const res = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         quality: 0.7,
//         allowsEditing: true,
//         aspect: [1, 1],
//       });

//       const canceled = res?.canceled ?? res?.cancelled ?? false;
//       if (!canceled) {
//         const uri = res.assets ? res.assets[0].uri : res.uri;
//         setLocalImageUri(uri);
//       }
//     } catch (err) {
//       Alert.alert("Error", "Could not pick image");
//     }
//   };

//   const uploadProfilePhoto = async () => {
//     if (!localImageUri) return null;

//     try {
//       const token = await AsyncStorage.getItem("authToken");
//       const formData = new FormData();

//       const filename = localImageUri.split("/").pop();
//       const match = /\.(\w+)$/.exec(filename || "");
//       const type = match ? `image/${match[1]}` : "image/jpeg";

//       formData.append("file", {
//         uri: localImageUri,
//         name: filename,
//         type,
//       });

//       const res = await fetch(`${BASE_URL}/user/profile/photo/upload`, {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           Authorization: token ? `Bearer ${token}` : undefined,
//         },
//         body: formData,
//       });

//       const json = await res.json();

//       if (res.ok) {
//         const newUrl =
//           json?.data?.photoUrl || json?.data?.url || json?.data?.image || "";

//         setPhotoUrl(newUrl);
//         setLocalImageUri(null);

//         return newUrl;
//       } else {
//         Alert.alert("Upload error", json?.message || "Photo upload failed");
//         return null;
//       }
//     } catch (err) {
//       Alert.alert("Error", "Failed to upload photo");
//       return null;
//     }
//   };

//   const toggleSkill = (code) => {
//     setSkills((prev) => {
//       const s = String(code);
//       if (prev.includes(s)) return prev.filter((x) => x !== s);
//       return [...prev, s];
//     });
//   };

//   const sendOtpToPhone = async () => {
//     try {
//       const res = await sendPhoneOtp(phone);

//       const sid =
//         res?.data?.sessionId ?? res?.sessionId ?? res?.session_id ?? "";

//       setSessionId(String(sid));
//       setOtpSent(true);

//       Alert.alert("OTP Sent", "Please check your phone.");
//     } catch (err) {
//       Alert.alert("Error", "Failed to send OTP");
//     }
//   };

//   const verifyOtpNow = async () => {
//     if (!otp.trim()) return Alert.alert("Validation", "Enter OTP");

//     try {
//       const res = await verifyPhoneOtp(sessionId, otp);
//       const ok =
//         res?.status === "SUCCESS" ||
//         res?.data?.status === "SUCCESS" ||
//         res?.verified === true ||
//         res?.data?.verified === true;

//       if (ok) {
//         Alert.alert("Success", "Phone verified");
//         setOtpSent(false);
//         setSessionId("");
//       } else {
//         Alert.alert("Invalid OTP", res?.message || "Try again");
//       }
//     } catch (err) {
//       Alert.alert("Error", "OTP verification failed");
//     }
//   };

//   const handleSave = async () => {
//     if (!name.trim() || !phone.trim()) {
//       return Alert.alert("Validation", "Name and phone required");
//     }

//     try {
//       setSaving(true);

//       let uploadedPhotoUrl = photoUrl;

//       if (localImageUri) {
//         const newUrl = await uploadProfilePhoto();
//         if (newUrl) uploadedPhotoUrl = newUrl;
//       }

//       try {
//         await updateUserProfileAPI({
//           gender,
//           dob,
//           photoUrl: uploadedPhotoUrl,
//           languagePref,
//         });
//       } catch (err) {}

//       const doerBody = {
//         name,
//         phone,
//         bio,
//         email,
//         skills: skills.map(String),
//       };

//       await updateDoerProfile(doerBody);

//       if (phone !== originalPhone) {
//         await sendOtpToPhone();
//       }

//       Alert.alert("Success", "Profile updated");
//       setOriginalPhone(phone);
//     } catch (err) {
//       Alert.alert("Error", "Failed to update profile");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#000" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <TouchableOpacity onPress={pickImage} style={styles.photoWrap}>
//         {localImageUri || photoUrl ? (
//           <Image
//             source={{ uri: localImageUri || photoUrl }}
//             style={styles.photo}
//           />
//         ) : (
//           <View style={styles.photoPlaceholder}>
//             <Text>Add Photo</Text>
//           </View>
//         )}
//       </TouchableOpacity>

//       <TextInput
//         style={styles.input}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//       />

//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Bio"
//         value={bio}
//         onChangeText={setBio}
//         multiline
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Phone"
//         value={phone}
//         onChangeText={setPhone}
//         keyboardType="phone-pad"
//       />

//       <Text style={styles.label}>Gender</Text>
//       <View style={styles.row}>
//         {["MALE", "FEMALE", "OTHER"].map((g) => (
//           <TouchableOpacity
//             key={g}
//             style={[styles.option, gender === g && styles.optionActive]}
//             onPress={() => setGender(g)}
//           >
//             <Text
//               style={gender === g ? styles.optionTextActive : styles.optionText}
//             >
//               {g}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <TextInput
//         style={styles.input}
//         placeholder="DOB (YYYY-MM-DD)"
//         value={dob}
//         onChangeText={setDob}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Language (e.g. ENG)"
//         value={languagePref}
//         onChangeText={setLanguagePref}
//       />

//       <Text style={styles.label}>Skills</Text>
//       <View style={styles.skillsWrap}>
//         {categories.map((cat) => {
//           const code = String(cat.code ?? cat.id ?? "");
//           const selected = skills.includes(code);
//           return (
//             <TouchableOpacity
//               key={code}
//               onPress={() => toggleSkill(code)}
//               style={[styles.skillBox, selected && styles.skillBoxSelected]}
//             >
//               <Text style={{ color: selected ? "#fff" : "#333" }}>
//                 {cat.skillName || cat.name || cat.displayName || code}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       <TouchableOpacity
//         style={styles.saveBtn}
//         onPress={handleSave}
//         disabled={saving}
//       >
//         {saving ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.saveText}>Save Profile</Text>
//         )}
//       </TouchableOpacity>

//       {otpSent && (
//         <View style={{ marginTop: 20 }}>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter OTP"
//             value={otp}
//             onChangeText={setOtp}
//             keyboardType="numeric"
//           />

//           <TouchableOpacity style={styles.verifyBtn} onPress={verifyOtpNow}>
//             <Text style={styles.verifyText}>Verify OTP</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 15,
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   photoWrap: {
//     alignSelf: "center",
//     marginBottom: 20,
//   },
//   photo: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//   },
//   photoPlaceholder: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: "#eee",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 10,
//     borderRadius: 8,
//     marginVertical: 8,
//   },
//   label: {
//     fontWeight: "700",
//     marginTop: 10,
//   },
//   row: {
//     flexDirection: "row",
//     marginVertical: 8,
//   },
//   option: {
//     padding: 10,
//     marginRight: 10,
//     borderWidth: 1,
//     borderRadius: 8,
//     borderColor: "#888",
//   },
//   optionActive: {
//     backgroundColor: "#000",
//   },
//   optionText: {
//     color: "#333",
//   },
//   optionTextActive: {
//     color: "#fff",
//   },
//   skillsWrap: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginTop: 10,
//   },
//   skillBox: {
//     padding: 10,
//     backgroundColor: "#eee",
//     borderRadius: 8,
//     margin: 5,
//   },
//   skillBoxSelected: {
//     backgroundColor: "#000",
//   },
//   saveBtn: {
//     backgroundColor: "black",
//     padding: 15,
//     borderRadius: 8,
//     marginTop: 20,
//     alignItems: "center",
//   },
//   saveText: {
//     color: "white",
//     fontWeight: "700",
//   },
//   verifyBtn: {
//     backgroundColor: "#228B22",
//     padding: 15,
//     borderRadius: 8,
//     marginTop: 10,
//     alignItems: "center",
//   },
//   verifyText: {
//     color: "white",
//     fontWeight: "700",
//   },
// });
// src/screens/EditProfile.js
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
//   Image,
//   ActivityIndicator,
//   Platform,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import {
//   fetchDoerProfile,
//   fetchDoerCategories,
//   updateDoerProfile,
//   updateUserProfileAPI,
//   sendPhoneOtp,
//   verifyPhoneOtp,
// } from "../api/doer";

// /**
//  * EditProfile.js
//  * - merges data from GET /api/doer/profile/get and GET /api/user/profile
//  * - full UI: name, email, phone, bio, skills, gender, dob, photoUrl, languagePref
//  * - uploads image using fetch multipart/form-data with JWT from AsyncStorage
//  *
//  * Adjust BASE_URL and AUTH_KEY if needed.
//  */
// const BASE_URL =
//   Platform.OS === "android"
//     ? "http://192.168.1.40:8080/api"
//     : "http://192.168.1.40:8080/api";
// const AUTH_KEY = "authToken"; // change if you store token under a different key

// export default function EditProfile({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   // Profile fields
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [phone, setPhone] = useState("");
//   const [originalPhone, setOriginalPhone] = useState("");
//   const [gender, setGender] = useState("");
//   const [dob, setDob] = useState("");
//   const [languagePref, setLanguagePref] = useState("");
//   const [photoUrl, setPhotoUrl] = useState("");

//   // skills & categories
//   const [skills, setSkills] = useState([]); // array of codes (strings)
//   const [categories, setCategories] = useState([]);

//   // image local selection
//   const [localImageUri, setLocalImageUri] = useState(null);

//   // OTP
//   const [otpSent, setOtpSent] = useState(false);
//   const [sessionId, setSessionId] = useState("");
//   const [otp, setOtp] = useState("");

//   useEffect(() => {
//     loadAll();
//   }, []);

//   // Load categories + doer profile + user profile and merge
//   const loadAll = async () => {
//     try {
//       setLoading(true);

//       // fetch categories and both profiles in parallel (if available)
//       const [catsRes, doerRes, userRes] = await Promise.allSettled([
//         fetchDoerCategories(),
//         fetchDoerProfile(),
//         // user profile might be available via a separate function in doer api (getUserProfileAPI)
//         // but if fetchDoerProfile also contains some fields we can merge below.
//         // If you have getUserProfileAPI export, import and call it here instead of null.
//       ]);

//       // categories
//       let catArray = [];
//       if (catsRes.status === "fulfilled") {
//         const c = catsRes.value;
//         catArray = Array.isArray(c?.data) ? c.data : Array.isArray(c) ? c : [];
//       }
//       setCategories(catArray);

//       // doer profile
//       const doerData =
//         doerRes.status === "fulfilled"
//           ? doerRes.value?.data ?? doerRes.value ?? {}
//           : {};

//       // If you also have a separate user profile endpoint, call it here
//       // e.g. const userRes = await getUserProfileAPI();
//       // For now, attempt to merge fields from doerData.userProfile or a separate userRes if available.
//       let userData = {};
//       // try to see if doerData contains nested userProfile fields:
//       if (doerData?.userProfile) {
//         userData = doerData.userProfile;
//       }

//       // If separate fetch succeeded (we used Promise.allSettled placeholders), try to use its value:
//       // (Note: if you import getUserProfileAPI, replace above logic to call it directly)
//       // For robustness, also attempt to call /api/user/profile if you need fresh user fields
//       try {
//         // optional: attempt to fetch user profile explicitly if you exported it
//         // dynamic import guard: if your doer.js exported getUserProfileAPI, use it
//         // but to avoid breaking if not exported, skip if not present.
//         // replace with: const up = await getUserProfileAPI(); userData = up?.data ?? up ?? userData;
//       } catch (e) {
//         // ignore
//       }

//       // Merge fields:
//       // name, email, bio, phone, skills from doerData
//       setName(doerData?.name ?? "");
//       setEmail(doerData?.email ?? "");
//       setBio(doerData?.bio ?? "");
//       setPhone(String(doerData?.phone ?? ""));
//       setOriginalPhone(String(doerData?.phone ?? ""));

//       // user fields (gender, dob, photoUrl, languagePref) prefer userData then doerData falls back
//       setGender(userData?.gender ?? doerData?.gender ?? "");
//       setDob(userData?.dob ?? doerData?.dob ?? "");
//       setLanguagePref(
//         userData?.languagePref ??
//           doerData?.languagePref ??
//           doerData?.language ??
//           ""
//       );
//       setPhotoUrl(
//         userData?.photoUrl ?? doerData?.photoUrl ?? doerData?.pic ?? ""
//       );

//       // Normalize skills: incoming may be names or codes or objects; convert to codes using categories map
//       const incomingSkills = Array.isArray(doerData?.skills)
//         ? doerData.skills
//         : [];
//       const nameToCode = new Map();
//       for (const c of catArray) {
//         const code = String(c.code ?? c.id ?? "");
//         if (!code) continue;
//         if (c.skillName)
//           nameToCode.set(String(c.skillName).toLowerCase(), code);
//         if (c.name) nameToCode.set(String(c.name).toLowerCase(), code);
//         if (c.displayName)
//           nameToCode.set(String(c.displayName).toLowerCase(), code);
//       }

//       const normalized = incomingSkills
//         .map((s) => {
//           if (s == null) return null;
//           if (typeof s === "object") {
//             const maybe = String(s.code ?? s.id ?? s.value ?? "").trim();
//             if (maybe) return maybe;
//             const nm = String(s.skillName ?? s.name ?? s.displayName ?? "")
//               .trim()
//               .toLowerCase();
//             return nameToCode.get(nm) ?? null;
//           }
//           const str = String(s).trim();
//           if (!str) return null;
//           // if matches a category code
//           if (catArray.some((c) => String(c.code) === str)) return str;
//           // else map name->code
//           return nameToCode.get(str.toLowerCase()) ?? null;
//         })
//         .filter(Boolean);

//       setSkills(Array.from(new Set(normalized)));
//     } catch (err) {
//       console.warn("loadAll error:", err);
//       Alert.alert(
//         "Error",
//         "Failed to load profile. Check console for details."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // pick image from gallery
//   const pickImage = async () => {
//     try {
//       const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (!perm.granted) {
//         Alert.alert(
//           "Permission required",
//           "Allow gallery access to pick a photo."
//         );
//         return;
//       }

//       const res = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         quality: 0.7,
//         allowsEditing: true,
//         aspect: [1, 1],
//       });

//       const canceled = res?.canceled ?? res?.cancelled ?? false;
//       if (!canceled) {
//         const uri = res.assets ? res.assets[0].uri : res.uri;
//         setLocalImageUri(uri);
//       }
//     } catch (err) {
//       console.warn("pickImage error:", err);
//       Alert.alert("Error", "Unable to pick image.");
//     }
//   };

//   // upload selected image using fetch multipart/form-data (works reliably with RN)
//   const uploadImageToServer = async () => {
//     if (!localImageUri) return null;

//     try {
//       setSaving(true);
//       const token = await AsyncStorage.getItem(AUTH_KEY);
//       const formData = new FormData();
//       const filename = localImageUri.split("/").pop();
//       const match = /\.(\w+)$/.exec(filename || "");
//       const type = match ? `image/${match[1]}` : "image/jpeg";

//       formData.append("file", {
//         uri: localImageUri,
//         name: filename,
//         type,
//       });

//       const res = await fetch(`${BASE_URL}/user/profile/photo/upload`, {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           Authorization: token ? `Bearer ${token}` : undefined,
//           // DON'T set Content-Type (fetch will set multipart boundary)
//         },
//         body: formData,
//       });

//       const json = await res.json();
//       if (!res.ok) {
//         console.warn("uploadImageToServer failed:", json);
//         Alert.alert("Upload failed", json?.message || "Photo upload failed");
//         return null;
//       }

//       const newUrl =
//         json?.data?.photoUrl || json?.data?.url || json?.data?.image || "";
//       if (newUrl) {
//         setPhotoUrl(newUrl);
//         setLocalImageUri(null);
//         return newUrl;
//       } else {
//         console.log("upload returned no url:", json);
//         Alert.alert(
//           "Uploaded",
//           "Photo uploaded, but server didn't return URL."
//         );
//         return null;
//       }
//     } catch (err) {
//       console.warn("uploadImageToServer error:", err);
//       Alert.alert("Error", "Failed to upload image.");
//       return null;
//     } finally {
//       setSaving(false);
//     }
//   };

//   // toggle skill selection (store codes)
//   const toggleSkill = (code) => {
//     setSkills((prev) => {
//       const s = String(code);
//       if (prev.includes(s)) return prev.filter((x) => x !== s);
//       return [...prev, s];
//     });
//   };

//   // send OTP (server uses JWT and phone from body or user)
//   const sendOtp = async () => {
//     try {
//       const res = await sendPhoneOtp(phone);
//       const sid =
//         res?.data?.sessionId ?? res?.sessionId ?? res?.session_id ?? "";
//       if (sid) setSessionId(String(sid));
//       setOtpSent(true);
//       Alert.alert("OTP Sent", "Please check your phone for the OTP.");
//     } catch (err) {
//       console.warn("sendOtp error:", err);
//       Alert.alert("Error", "Failed to send OTP.");
//     }
//   };

//   // verify OTP
//   const verifyOtpNow = async () => {
//     if (!otp || !otp.trim()) return Alert.alert("Validation", "Enter OTP");
//     try {
//       const res = await verifyPhoneOtp(sessionId, otp);
//       const ok =
//         res?.status === "SUCCESS" ||
//         res?.data?.status === "SUCCESS" ||
//         res?.verified === true ||
//         res?.data?.verified === true;
//       if (ok) {
//         Alert.alert("Verified", "Phone verified successfully.");
//         setOtpSent(false);
//         setSessionId("");
//       } else {
//         Alert.alert("Invalid OTP", res?.message || "OTP verification failed.");
//       }
//     } catch (err) {
//       console.warn("verifyOtp error:", err);
//       Alert.alert("Error", "OTP verification failed.");
//     }
//   };

//   // Save handler: upload image (if any), patch user profile, then put doer profile
//   const handleSave = async () => {
//     if (!name.trim() || !phone.trim()) {
//       return Alert.alert("Validation", "Name and Phone are required.");
//     }

//     try {
//       setSaving(true);

//       // 1. upload photo if new
//       let uploadedPhoto = photoUrl;
//       if (localImageUri) {
//         const url = await uploadImageToServer();
//         if (url) uploadedPhoto = url;
//       }

//       // 2. PATCH /api/user/profile/update (non-fatal)
//       try {
//         const userBody = {
//           gender: gender || undefined,
//           dob: dob || undefined,
//           photoUrl: uploadedPhoto || undefined,
//           languagePref: languagePref || undefined,
//         };
//         await updateUserProfileAPI(userBody);
//       } catch (e) {
//         console.warn("PATCH user profile failed (non-fatal):", e);
//       }

//       // 3. prepare final skills as codes (string array)
//       const finalSkills = Array.isArray(skills) ? skills.map(String) : [];

//       // 4. PUT /api/doer/profile/
//       const doerBody = {
//         name: name.trim(),
//         phone: String(phone).trim(),
//         bio: bio?.trim() || undefined,
//         skills: finalSkills,
//         email: email?.trim() || undefined,
//       };

//       await updateDoerProfile(doerBody);

//       // 5. If phone changed, start OTP flow
//       if (String(phone).trim() !== String(originalPhone).trim()) {
//         await sendOtp();
//       }

//       Alert.alert("Success", "Profile updated successfully.");
//       setOriginalPhone(String(phone).trim());
//     } catch (err) {
//       console.warn("handleSave error:", err);
//       Alert.alert(
//         "Error",
//         "Failed to update profile. See console for details."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#000" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Photo */}
//       <TouchableOpacity onPress={pickImage} style={styles.photoWrap}>
//         {localImageUri || photoUrl ? (
//           <Image
//             source={{ uri: localImageUri || photoUrl }}
//             style={styles.photo}
//           />
//         ) : (
//           <View style={styles.photoPlaceholder}>
//             <Text style={{ color: "#666" }}>Add Photo</Text>
//           </View>
//         )}
//       </TouchableOpacity>

//       {/* Name */}
//       <TextInput
//         style={styles.input}
//         placeholder="Full Name"
//         value={name}
//         onChangeText={setName}
//       />

//       {/* Email */}
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//       />

//       {/* Bio */}
//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Bio"
//         value={bio}
//         onChangeText={setBio}
//         multiline
//       />

//       {/* Phone */}
//       <TextInput
//         style={styles.input}
//         placeholder="Phone"
//         value={phone}
//         onChangeText={setPhone}
//         keyboardType="phone-pad"
//       />

//       {/* Gender */}
//       <Text style={{ fontWeight: "600", marginTop: 8 }}>Gender</Text>
//       <View style={styles.row}>
//         {["MALE", "FEMALE", "OTHER"].map((g) => (
//           <TouchableOpacity
//             key={g}
//             style={[styles.option, gender === g && styles.optionActive]}
//             onPress={() => setGender(g)}
//           >
//             <Text
//               style={gender === g ? styles.optionTextActive : styles.optionText}
//             >
//               {g}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* DOB */}
//       <TextInput
//         style={styles.input}
//         placeholder="DOB (YYYY-MM-DD)"
//         value={dob}
//         onChangeText={setDob}
//       />

//       {/* Language */}
//       <TextInput
//         style={styles.input}
//         placeholder="Language (e.g. ENG)"
//         value={languagePref}
//         onChangeText={setLanguagePref}
//       />

//       {/* Skills */}
//       <Text style={{ fontWeight: "700", marginTop: 10 }}>Skills</Text>
//       <View style={styles.skillsWrap}>
//         {categories.map((cat) => {
//           const code = String(cat.code ?? cat.id ?? "");
//           const selected = skills.includes(code);
//           return (
//             <TouchableOpacity
//               key={code}
//               onPress={() => toggleSkill(code)}
//               style={[styles.skillBox, selected && styles.skillBoxSelected]}
//             >
//               <Text style={selected ? { color: "#fff" } : { color: "#333" }}>
//                 {cat.skillName || cat.name || cat.displayName || code}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       {/* Save */}
//       <TouchableOpacity
//         style={styles.saveBtn}
//         onPress={handleSave}
//         disabled={saving}
//       >
//         {saving ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.saveText}>Save Profile</Text>
//         )}
//       </TouchableOpacity>

//       {/* OTP area */}
//       {otpSent && (
//         <View style={{ marginTop: 16 }}>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter OTP"
//             value={otp}
//             onChangeText={setOtp}
//             keyboardType="numeric"
//           />
//           <TouchableOpacity
//             style={[styles.saveBtn, { backgroundColor: "#388E3C" }]}
//             onPress={verifyOtpNow}
//           >
//             <Text style={styles.saveText}>Verify OTP</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, paddingBottom: 40 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   photoWrap: { alignItems: "center", marginBottom: 12 },
//   photo: { width: 120, height: 120, borderRadius: 10 },
//   photoPlaceholder: {
//     width: 120,
//     height: 120,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   input: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   row: { flexDirection: "row", marginTop: 8 },
//   option: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: "#777",
//     marginRight: 8,
//     borderRadius: 20,
//   },
//   optionActive: { backgroundColor: "#000", borderColor: "#000" },
//   optionText: { color: "#444" },
//   optionTextActive: { color: "#fff" },
//   skillsWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
//   skillBox: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 20,
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   skillBoxSelected: { backgroundColor: "#000", borderColor: "#000" },
//   saveBtn: {
//     backgroundColor: "#1976D2",
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 14,
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
// });
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  fetchDoerProfile,
  fetchDoerCategories,
  updateDoerProfile,
  updateUserProfileAPI,
  sendPhoneOtp,
  verifyPhoneOtp,
  getUserProfileAPI,
} from "../api/doer";

// EditProfile.js
// - Merges data from GET /api/doer/profile/get and GET /api/user/profile
// - Ensures gender, dob, photoUrl and languagePref come from user profile
// - Robust to different response shapes (data wrapper or direct object)
// - Handles image upload using fetch multipart/form-data (same endpoint as your original)

const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.1.40:8080/api"
    : "http://192.168.1.40:8080/api";
const AUTH_KEY = "authToken"; // change if your AsyncStorage key differs

export default function EditProfile({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [languagePref, setLanguagePref] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // skills & categories
  const [skills, setSkills] = useState([]); // array of codes (strings)
  const [categories, setCategories] = useState([]);

  // image local selection
  const [localImageUri, setLocalImageUri] = useState(null);

  // OTP
  const [otpSent, setOtpSent] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  // Load categories + doer profile + user profile and merge
  const loadAll = async () => {
    try {
      setLoading(true);

      // Use Promise.allSettled so we can merge whatever is available
      const [catsRes, doerRes, userRes] = await Promise.allSettled([
        fetchDoerCategories(),
        fetchDoerProfile(),
        getUserProfileAPI(),
      ]);

      // categories
      let catArray = [];
      if (catsRes.status === "fulfilled") {
        const c = catsRes.value;
        // handle both { data: [...] } and [...]
        catArray = Array.isArray(c?.data) ? c.data : Array.isArray(c) ? c : [];
      }
      setCategories(catArray);

      // doer profile (may be wrapped in data)
      const doerData =
        doerRes.status === "fulfilled"
          ? doerRes.value?.data ?? doerRes.value ?? {}
          : {};

      // user profile (may be wrapped in data)
      const userData =
        userRes.status === "fulfilled"
          ? userRes.value?.data ?? userRes.value ?? {}
          : {};

      // Merge: prefer userData for personal fields (gender, dob, photoUrl, languagePref)
      // and doerData for doer-specific fields (name, email, phone, bio, skills)

      setName(doerData?.name ?? doerData?.fullName ?? userData?.name ?? "");
      setEmail(doerData?.email ?? userData?.email ?? "");
      setBio(doerData?.bio ?? "");

      // Phone may be in doerData or userData
      const phoneVal = doerData?.phone ?? userData?.phone ?? "";
      setPhone(String(phoneVal ?? ""));
      setOriginalPhone(String(phoneVal ?? ""));

      // These four were missing before — take from userData first, then doerData fallback
      setGender(userData?.gender ?? doerData?.gender ?? "");
      setDob(userData?.dob ?? doerData?.dob ?? "");
      setLanguagePref(
        userData?.languagePref ??
          doerData?.languagePref ??
          doerData?.language ??
          ""
      );
      setPhotoUrl(
        userData?.photoUrl ?? doerData?.photoUrl ?? doerData?.pic ?? ""
      );

      // Normalize/merge skills (doerData.skills preferred)
      const incomingSkills = Array.isArray(doerData?.skills)
        ? doerData.skills
        : Array.isArray(userData?.skills)
        ? userData.skills
        : [];

      // Map categories to codes if incoming are names
      const nameToCode = new Map();
      for (const c of catArray) {
        const code = String(c.code ?? c.id ?? "");
        if (!code) continue;
        if (c.skillName)
          nameToCode.set(String(c.skillName).toLowerCase(), code);
        if (c.name) nameToCode.set(String(c.name).toLowerCase(), code);
        if (c.displayName)
          nameToCode.set(String(c.displayName).toLowerCase(), code);
      }

      const normalized = (incomingSkills || [])
        .map((s) => {
          if (s == null) return null;
          if (typeof s === "object") {
            const maybe = String(s.code ?? s.id ?? s.value ?? "").trim();
            if (maybe) return maybe;
            const nm = String(s.skillName ?? s.name ?? s.displayName ?? "")
              .trim()
              .toLowerCase();
            return nameToCode.get(nm) ?? null;
          }
          const str = String(s).trim();
          if (!str) return null;
          // if matches a category code
          if (catArray.some((c) => String(c.code) === str)) return str;
          // else map name->code
          return nameToCode.get(str.toLowerCase()) ?? str;
        })
        .filter(Boolean);

      setSkills(Array.from(new Set(normalized)));
    } catch (err) {
      console.warn("loadAll error:", err);
      Alert.alert(
        "Error",
        "Failed to load profile. Check console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  // pick image from gallery
  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permission required",
          "Allow gallery access to pick a photo."
        );
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      const canceled = res?.canceled ?? res?.cancelled ?? false;
      if (!canceled) {
        const uri = res.assets ? res.assets[0].uri : res.uri;
        setLocalImageUri(uri);
      }
    } catch (err) {
      console.warn("pickImage error:", err);
      Alert.alert("Error", "Unable to pick image.");
    }
  };

  // upload selected image using fetch multipart/form-data (works reliably with RN)
  const uploadImageToServer = async () => {
    if (!localImageUri) return null;

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem(AUTH_KEY);
      const formData = new FormData();
      const filename = localImageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image/jpeg";

      // For Android URI may need to be prefixed with 'file://'
      const uriToSend =
        Platform.OS === "android" && !localImageUri.startsWith("file://")
          ? `file://${localImageUri}`
          : localImageUri;

      formData.append("file", {
        uri: uriToSend,
        name: filename,
        type,
      });

      const res = await fetch(`${BASE_URL}/user/profile/photo/upload`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        console.warn("uploadImageToServer failed:", json);
        Alert.alert("Upload failed", json?.message || "Photo upload failed");
        return null;
      }

      const newUrl =
        json?.data?.photoUrl || json?.data?.url || json?.data?.image || "";
      if (newUrl) {
        setPhotoUrl(newUrl);
        setLocalImageUri(null);
        return newUrl;
      } else {
        console.log("upload returned no url:", json);
        Alert.alert(
          "Uploaded",
          "Photo uploaded, but server didn't return URL."
        );
        return null;
      }
    } catch (err) {
      console.warn("uploadImageToServer error:", err);
      Alert.alert("Error", "Failed to upload image.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  // toggle skill selection (store codes)
  const toggleSkill = (code) => {
    setSkills((prev) => {
      const s = String(code);
      if (prev.includes(s)) return prev.filter((x) => x !== s);
      return [...prev, s];
    });
  };

  // send OTP (server uses JWT and phone from body or user)
  const sendOtp = async () => {
    try {
      const res = await sendPhoneOtp(phone);
      const sid =
        res?.data?.sessionId ?? res?.sessionId ?? res?.session_id ?? "";
      if (sid) setSessionId(String(sid));
      setOtpSent(true);
      Alert.alert("OTP Sent", "Please check your phone for the OTP.");
    } catch (err) {
      console.warn("sendOtp error:", err);
      Alert.alert("Error", "Failed to send OTP.");
    }
  };

  // verify OTP
  const verifyOtpNow = async () => {
    if (!otp || !otp.trim()) return Alert.alert("Validation", "Enter OTP");
    try {
      const res = await verifyPhoneOtp(sessionId, otp);
      const ok =
        res?.status === "SUCCESS" ||
        res?.data?.status === "SUCCESS" ||
        res?.verified === true ||
        res?.data?.verified === true;
      if (ok) {
        Alert.alert("Verified", "Phone verified successfully.");
        setOtpSent(false);
        setSessionId("");
      } else {
        Alert.alert("Invalid OTP", res?.message || "OTP verification failed.");
      }
    } catch (err) {
      console.warn("verifyOtp error:", err);
      Alert.alert("Error", "OTP verification failed.");
    }
  };

  // Save handler: upload image (if any), patch user profile, then put doer profile
  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      return Alert.alert("Validation", "Name and Phone are required.");
    }

    try {
      setSaving(true);

      // 1. upload photo if new
      let uploadedPhoto = photoUrl;
      if (localImageUri) {
        const url = await uploadImageToServer();
        if (url) uploadedPhoto = url;
      }

      // 2. PATCH /api/user/profile/update (non-fatal)
      try {
        const userBody = {
          gender: gender || undefined,
          dob: dob || undefined,
          photoUrl: uploadedPhoto || undefined,
          languagePref: languagePref || undefined,
        };
        await updateUserProfileAPI(userBody);
      } catch (e) {
        console.warn("PATCH user profile failed (non-fatal):", e);
      }

      // 3. prepare final skills as codes (string array)
      const finalSkills = Array.isArray(skills) ? skills.map(String) : [];

      // 4. PUT /api/doer/profile/
      const doerBody = {
        name: name.trim(),
        phone: String(phone).trim(),
        bio: bio?.trim() || undefined,
        skills: finalSkills,
        email: email?.trim() || undefined,
      };

      await updateDoerProfile(doerBody);

      // 5. If phone changed, start OTP flow
      if (String(phone).trim() !== String(originalPhone).trim()) {
        await sendOtp();
      }

      Alert.alert("Success", "Profile updated successfully.");
      setOriginalPhone(String(phone).trim());
    } catch (err) {
      console.warn("handleSave error:", err);
      Alert.alert(
        "Error",
        "Failed to update profile. See console for details."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Photo */}
      <TouchableOpacity onPress={pickImage} style={styles.photoWrap}>
        {localImageUri || photoUrl ? (
          <Image
            source={{ uri: localImageUri || photoUrl }}
            style={styles.photo}
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={{ color: "#666" }}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Name */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Bio */}
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
      />

      {/* Phone */}
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      {/* Gender */}
      <Text style={{ fontWeight: "600", marginTop: 8 }}>Gender</Text>
      <View style={styles.row}>
        {["MALE", "FEMALE", "OTHER"].map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.option, gender === g && styles.optionActive]}
            onPress={() => setGender(g)}
          >
            <Text
              style={gender === g ? styles.optionTextActive : styles.optionText}
            >
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* DOB */}
      <TextInput
        style={styles.input}
        placeholder="DOB (YYYY-MM-DD)"
        value={dob}
        onChangeText={setDob}
      />

      {/* Language */}
      <TextInput
        style={styles.input}
        placeholder="Language (e.g. ENG)"
        value={languagePref}
        onChangeText={setLanguagePref}
      />

      {/* Skills */}
      <Text style={{ fontWeight: "700", marginTop: 10 }}>Skills</Text>
      <View style={styles.skillsWrap}>
        {categories.map((cat) => {
          const code = String(cat.code ?? cat.id ?? "");
          const selected = skills.includes(code);
          return (
            <TouchableOpacity
              key={code}
              onPress={() => toggleSkill(code)}
              style={[styles.skillBox, selected && styles.skillBoxSelected]}
            >
              <Text style={selected ? { color: "#fff" } : { color: "#333" }}>
                {cat.skillName || cat.name || cat.displayName || code}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Save */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Save Profile</Text>
        )}
      </TouchableOpacity>

      {/* OTP area */}
      {otpSent && (
        <View style={{ marginTop: 16 }}>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: "#388E3C" }]}
            onPress={verifyOtpNow}
          >
            <Text style={styles.saveText}>Verify OTP</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  photoWrap: { alignItems: "center", marginBottom: 12 },
  photo: { width: 120, height: 120, borderRadius: 10 },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  row: { flexDirection: "row", marginTop: 8 },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#777",
    marginRight: 8,
    borderRadius: 20,
  },
  optionActive: { backgroundColor: "#000", borderColor: "#000" },
  optionText: { color: "#444" },
  optionTextActive: { color: "#fff" },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  skillBox: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillBoxSelected: { backgroundColor: "#000", borderColor: "#000" },
  saveBtn: {
    backgroundColor: "#1976D2",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 14,
  },
  saveText: { color: "#fff", fontWeight: "700" },
});

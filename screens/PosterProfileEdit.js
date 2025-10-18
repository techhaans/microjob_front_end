// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   Image,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import * as Location from "expo-location";
// import { Ionicons } from "@expo/vector-icons"; // ✅ Added import
// import {
//   updatePosterProfile,
//   fetchPosterProfile,
//   addAddress,
//   updateAddress,
// } from "../api/poster";

// export default function PosterProfileEdit({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [locating, setLocating] = useState(false);

//   // Profile states
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [about, setAbout] = useState("");
//   const [imageUri, setImageUri] = useState(null);

//   // Address states
//   const [addresses, setAddresses] = useState([]);
//   const [label, setLabel] = useState("");
//   const [pinCode, setPinCode] = useState("");
//   const [areaText, setAreaText] = useState("");
//   const [lat, setLat] = useState(null);
//   const [lon, setLon] = useState(null);

//   const [isExistingUser, setIsExistingUser] = useState(false);

//   // Load existing profile
//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         const res = await fetchPosterProfile();
//         if (res.status === "SUCCESS" && res.data) {
//           const profile = res.data;
//           setName(profile.name || "");
//           setEmail(profile.email || "");
//           setAbout(profile.about || "");
//           setImageUri(profile.imageUrl || null);
//           setAddresses(profile.addresses || []);
//           setIsExistingUser(true);
//         } else {
//           setIsExistingUser(false);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadProfile();
//   }, []);

//   // Pick profile image
//   const pickImage = async () => {
//     const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!granted) return Alert.alert("Permission", "Please allow photo access.");
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.8,
//     });
//     if (!res.canceled) setImageUri(res.assets[0].uri);
//   };

//   // Use current location
//   const useLocation = async () => {
//     try {
//       setLocating(true);
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted")
//         return Alert.alert("Permission denied", "Location permission needed.");
//       const loc = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Highest,
//       });
//       setLat(loc.coords.latitude);
//       setLon(loc.coords.longitude);
//       Alert.alert(
//         "Location fetched",
//         `Lat: ${loc.coords.latitude}, Lon: ${loc.coords.longitude}`
//       );
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to fetch location.");
//     } finally {
//       setLocating(false);
//     }
//   };

//   // Save profile
//   const handleSaveProfile = async () => {
//     if (!name.trim() || !email.trim())
//       return Alert.alert("Validation", "Name and Email are required.");
//     const payload = {
//       Name: name.trim(),
//       email: email.trim(),
//       about: about.trim(),
//       imageUrl: imageUri,
//     };
//     try {
//       setSaving(true);
//       const res = await updatePosterProfile(payload);
//       if (res.status === "SUCCESS") {
//         Alert.alert(
//           "Success",
//           isExistingUser ? "Profile updated." : "Profile created."
//         );
//         setIsExistingUser(true);
//       } else {
//         Alert.alert("Error", res.message || "Failed to save profile.");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to save profile.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Add or update address
//   const handleSaveAddress = async () => {
//     if (!label.trim() || !pinCode.trim() || !areaText.trim())
//       return Alert.alert("Validation", "Address fields are required.");
//     const payload = { label, pinCode, areaText, lat, lon };
//     try {
//       setSaving(true);
//       if (addresses.length > 0) {
//         const addrId = addresses[0].id;
//         await updateAddress(addrId, payload);
//         Alert.alert("Success", "Address updated.");
//       } else {
//         const res = await addAddress(payload);
//         setAddresses([...addresses, res.data]);
//         Alert.alert("Success", "Address added.");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to save address.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0b78ff" />
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* ✅ Back Arrow at Top */}
//       <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//         <Ionicons name="arrow-back" size={26} color="#000" />
//       </TouchableOpacity>

//       <Text style={styles.title}>
//         {isExistingUser ? "Edit Profile" : "Create Profile"}
//       </Text>

//       {/* Profile Image */}
//       <View style={styles.imageRow}>
//         <Image
//           source={{
//             uri:
//               imageUri ||
//               "https://cdn-icons-png.flaticon.com/512/847/847969.png",
//           }}
//           style={styles.avatar}
//         />
//         <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
//           <Text style={styles.imageBtnText}>Change Photo</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Profile Fields */}
//       <Text style={styles.label}>Full Name</Text>
//       <TextInput
//         style={styles.input}
//         value={name}
//         onChangeText={setName}
//         placeholder="Enter name"
//       />

//       <Text style={styles.label}>Email</Text>
//       <TextInput
//         style={styles.input}
//         value={email}
//         onChangeText={setEmail}
//         placeholder="Enter email"
//         keyboardType="email-address"
//       />

//       <Text style={styles.label}>About</Text>
//       <TextInput
//         style={[styles.input, { height: 100 }]}
//         value={about}
//         onChangeText={setAbout}
//         placeholder="Short bio"
//         multiline
//       />

//       {/* Address Fields */}
//       <Text style={[styles.label, { marginTop: 12 }]}>Address Label</Text>
//       <TextInput
//         style={styles.input}
//         value={label}
//         onChangeText={setLabel}
//         placeholder="Home / Office"
//       />

//       <Text style={styles.label}>Pin Code</Text>
//       <TextInput
//         style={styles.input}
//         value={pinCode}
//         onChangeText={setPinCode}
//         placeholder="Enter pin code"
//         keyboardType="numeric"
//       />

//       <Text style={styles.label}>Area / Street</Text>
//       <TextInput
//         style={styles.input}
//         value={areaText}
//         onChangeText={setAreaText}
//         placeholder="Area or Street"
//       />

//       {/* Location */}
//       <TouchableOpacity
//         style={styles.locationBtn}
//         onPress={useLocation}
//         disabled={locating}
//       >
//         {locating ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.locationBtnText}>Use Current Location</Text>
//         )}
//       </TouchableOpacity>

//       {/* Save Buttons */}
//       <TouchableOpacity
//         style={styles.saveBtn}
//         onPress={handleSaveProfile}
//         disabled={saving}
//       >
//         {saving ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.saveText}>
//             {isExistingUser ? "Update Profile" : "Create Profile"}
//           </Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.saveBtn, { backgroundColor: "#00b894", marginTop: 8 }]}
//         onPress={handleSaveAddress}
//         disabled={saving}
//       >
//         {saving ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.saveText}>
//             {addresses.length > 0 ? "Update Address" : "Add Address"}
//           </Text>
//         )}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#f2f6fb", paddingBottom: 50 },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f2f6fb",
//   },
//   backButton: {
//     position: "absolute",
//     top: 40,
//     left: 20,
//     zIndex: 10,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#0b4da0",
//     marginBottom: 12,
//     textAlign: "center",
//     marginTop: 40,
//   },
//   imageRow: { alignItems: "center", marginBottom: 12 },
//   avatar: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 2,
//     borderColor: "#0b78ff",
//   },
//   imageBtn: {
//     marginTop: 8,
//     backgroundColor: "#0b78ff",
//     padding: 8,
//     borderRadius: 8,
//   },
//   imageBtnText: { color: "#fff", fontWeight: "600" },
//   label: { color: "#4b5563", marginTop: 8, marginBottom: 6, fontWeight: "600" },
//   input: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#e6eefb",
//   },
//   locationBtn: {
//     backgroundColor: "#00b894",
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 12,
//     alignItems: "center",
//   },
//   locationBtnText: { color: "#fff", fontWeight: "700" },
//   saveBtn: {
//     backgroundColor: "#0b78ff",
//     padding: 14,
//     borderRadius: 10,
//     marginTop: 14,
//     alignItems: "center",
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
// });
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   Image,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import * as Location from "expo-location";
// import { Ionicons } from "@expo/vector-icons";
// import {
//   updatePosterProfile,
//   fetchPosterProfile,
//   addAddress,
//   updateAddress,
//   sendPosterPhoneOtp,
//   verifyPosterPhoneOtp,
// } from "../api/poster";

// export default function PosterProfileEdit({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [locating, setLocating] = useState(false);

//   // Profile states
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [about, setAbout] = useState("");
//   const [imageUri, setImageUri] = useState(null);

//   // Phone OTP
//   const [phone, setPhone] = useState("");
//   const [sessionId, setSessionId] = useState("");
//   const [otp, setOtp] = useState("");
//   const [phoneVerified, setPhoneVerified] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);

//   // Address states
//   const [addresses, setAddresses] = useState([]);
//   const [label, setLabel] = useState("");
//   const [pinCode, setPinCode] = useState("");
//   const [areaText, setAreaText] = useState("");
//   const [lat, setLat] = useState(null);
//   const [lon, setLon] = useState(null);

//   const [isExistingUser, setIsExistingUser] = useState(false);

//   // Load existing profile
//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         const res = await fetchPosterProfile();
//         if (res.status === "SUCCESS" && res.data) {
//           const profile = res.data.resp;
//           setName(profile.name || "");
//           setEmail(profile.email || "");
//           setAbout(profile.about || "");
//           setImageUri(profile.imageUrl || null);
//           setAddresses(profile.addresses || []);
//           setPhone(profile.phone || "");
//           setPhoneVerified(profile.KycStatus || false);
//           setIsExistingUser(true);
//         } else {
//           setIsExistingUser(false);
//         }
//       } catch (err) {
//         console.error(err);
//         setIsExistingUser(false);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadProfile();
//   }, []);

//   // Pick profile image
//   const pickImage = async () => {
//     const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!granted) return Alert.alert("Permission", "Please allow photo access.");
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.8,
//     });
//     if (!res.canceled) setImageUri(res.assets[0].uri);
//   };

//   // Use current location
//   const useLocation = async () => {
//     try {
//       setLocating(true);
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted")
//         return Alert.alert("Permission denied", "Location permission needed.");
//       const loc = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Highest,
//       });
//       setLat(loc.coords.latitude);
//       setLon(loc.coords.longitude);
//       Alert.alert(
//         "Location fetched",
//         `Lat: ${loc.coords.latitude}, Lon: ${loc.coords.longitude}`
//       );
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to fetch location.");
//     } finally {
//       setLocating(false);
//     }
//   };

//   // Save profile
//   const handleSaveProfile = async () => {
//     if (!name.trim() || !email.trim())
//       return Alert.alert("Validation", "Name and Email are required.");
//     const payload = {
//       Name: name.trim(),
//       email: email.trim(),
//       about: about.trim(),
//       imageUrl: imageUri,
//       phone: phone,
//     };
//     try {
//       setSaving(true);
//       const res = await updatePosterProfile(payload);
//       if (res.status === "SUCCESS") {
//         Alert.alert(
//           "Success",
//           isExistingUser ? "Profile updated." : "Profile created."
//         );
//         setIsExistingUser(true);
//       } else {
//         Alert.alert("Error", res.message || "Failed to save profile.");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to save profile.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const handleSendOtp = async () => {
//     if (!phone.trim()) return Alert.alert("Validation", "Phone number is required.");
//     try {
//       const res = await sendPosterPhoneOtp(phone.trim());
//       if (res.status === "SUCCESS") {
//         setSessionId(res.data.sessionId);
//         setOtpSent(true);
//         Alert.alert(
//           "OTP Sent",
//           `OTP sent to ${phone}. Expires in ${res.data.expiryMin} minutes.`
//         );
//       } else {
//         Alert.alert("Error", res.message);
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to send OTP.");
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (!otp.trim() || !sessionId)
//       return Alert.alert("Validation", "Enter OTP to verify.");
//     try {
//       const res = await verifyPosterPhoneOtp(sessionId, otp.trim());
//       if (res.status === "SUCCESS") {
//         setPhoneVerified(true);
//         Alert.alert("Success", "Phone number verified.");
//       } else {
//         Alert.alert("Error", res.message);
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "OTP verification failed.");
//     }
//   };

//   // Add or update address
//   const handleSaveAddress = async () => {
//     if (!label.trim() || !pinCode.trim() || !areaText.trim())
//       return Alert.alert("Validation", "Address fields are required.");
//     const payload = { label, pinCode, areaText, lat, lon };
//     try {
//       setSaving(true);
//       if (addresses.length > 0) {
//         const addrId = addresses[0].id;
//         await updateAddress(addrId, payload);
//         Alert.alert("Success", "Address updated.");
//       } else {
//         const res = await addAddress(payload);
//         setAddresses([...addresses, res.data]);
//         Alert.alert("Success", "Address added.");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to save address.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0b78ff" />
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//         <Ionicons name="arrow-back" size={26} color="#000" />
//       </TouchableOpacity>

//       <Text style={styles.title}>
//         {isExistingUser ? "Edit Profile" : "Create Profile"}
//       </Text>

//       {/* Profile Image */}
//       <View style={styles.imageRow}>
//         <Image
//           source={{
//             uri:
//               imageUri ||
//               "https://cdn-icons-png.flaticon.com/512/847/847969.png",
//           }}
//           style={styles.avatar}
//         />
//         <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
//           <Text style={styles.imageBtnText}>Change Photo</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Profile Fields */}
//       <Text style={styles.label}>Full Name</Text>
//       <TextInput
//         style={styles.input}
//         value={name}
//         onChangeText={setName}
//         placeholder="Enter name"
//       />

//       <Text style={styles.label}>Email</Text>
//       <TextInput
//         style={styles.input}
//         value={email}
//         onChangeText={setEmail}
//         placeholder="Enter email"
//         keyboardType="email-address"
//       />

//       <Text style={styles.label}>Phone</Text>
//       <TextInput
//         style={styles.input}
//         value={phone}
//         onChangeText={(text) => {
//           setPhone(text);
//           setPhoneVerified(false);
//           setOtpSent(false);
//         }}
//         placeholder="Enter phone number"
//         keyboardType="phone-pad"
//       />

//       {!phoneVerified && (
//         <View style={{ marginTop: 8 }}>
//           {!otpSent ? (
//             <TouchableOpacity style={styles.otpBtn} onPress={handleSendOtp}>
//               <Text style={styles.otpBtnText}>Send OTP</Text>
//             </TouchableOpacity>
//           ) : (
//             <>
//               <TextInput
//                 style={styles.input}
//                 value={otp}
//                 onChangeText={setOtp}
//                 placeholder="Enter OTP"
//                 keyboardType="numeric"
//               />
//               <TouchableOpacity style={styles.otpBtn} onPress={handleVerifyOtp}>
//                 <Text style={styles.otpBtnText}>Verify OTP</Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       )}

//       <Text style={styles.label}>About</Text>
//       <TextInput
//         style={[styles.input, { height: 100 }]}
//         value={about}
//         onChangeText={setAbout}
//         placeholder="Short bio"
//         multiline
//       />

//       {/* Address Fields */}
//       <Text style={[styles.label, { marginTop: 12 }]}>Address Label</Text>
//       <TextInput
//         style={styles.input}
//         value={label}
//         onChangeText={setLabel}
//         placeholder="Home / Office"
//       />

//       <Text style={styles.label}>Pin Code</Text>
//       <TextInput
//         style={styles.input}
//         value={pinCode}
//         onChangeText={setPinCode}
//         placeholder="Enter pin code"
//         keyboardType="numeric"
//       />

//       <Text style={styles.label}>Area / Street</Text>
//       <TextInput
//         style={styles.input}
//         value={areaText}
//         onChangeText={setAreaText}
//         placeholder="Area or Street"
//       />

//       {/* Location */}
//       <TouchableOpacity
//         style={styles.locationBtn}
//         onPress={useLocation}
//         disabled={locating}
//       >
//         {locating ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.locationBtnText}>Use Current Location</Text>
//         )}
//       </TouchableOpacity>

//       {/* Save Buttons */}
//       <TouchableOpacity
//         style={styles.saveBtn}
//         onPress={handleSaveProfile}
//         disabled={saving}
//       >
//         {saving ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.saveText}>
//             {isExistingUser ? "Update Profile" : "Create Profile"}
//           </Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.saveBtn, { backgroundColor: "#00b894", marginTop: 8 }]}
//         onPress={handleSaveAddress}
//         disabled={saving}
//       >
//         {saving ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.saveText}>
//             {addresses.length > 0 ? "Update Address" : "Add Address"}
//           </Text>
//         )}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#f2f6fb", paddingBottom: 50 },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f2f6fb",
//   },
//   backButton: {
//     position: "absolute",
//     top: 40,
//     left: 20,
//     zIndex: 10,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#0b4da0",
//     marginBottom: 12,
//     textAlign: "center",
//     marginTop: 40,
//   },
//   imageRow: { alignItems: "center", marginBottom: 12 },
//   avatar: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 2,
//     borderColor: "#0b78ff",
//   },
//   imageBtn: {
//     marginTop: 8,
//     backgroundColor: "#0b78ff",
//     padding: 8,
//     borderRadius: 8,
//   },
//   imageBtnText: { color: "#fff", fontWeight: "600" },
//   label: { color: "#4b5563", marginTop: 8, marginBottom: 6, fontWeight: "600" },
//   input: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#e6eefb",
//   },
//   otpBtn: {
//     backgroundColor: "#fd5e53",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 6,
//   },
//   otpBtnText: { color: "#fff", fontWeight: "700" },
//   locationBtn: {
//     backgroundColor: "#00b894",
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 12,
//     alignItems: "center",
//   },
//   locationBtnText: { color: "#fff", fontWeight: "700" },
//   saveBtn: {
//     backgroundColor: "#0b78ff",
//     padding: 14,
//     borderRadius: 10,
//     marginTop: 14,
//     alignItems: "center",
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
// });

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Image,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import * as Location from "expo-location";
// import { Ionicons } from "@expo/vector-icons";
// import {
//   fetchPosterProfile,
//   updatePosterProfile,
//   addAddress,
//   updateAddress,
//   sendPosterPhoneOtp,
//   verifyPosterPhoneOtp,
// } from "../api/poster";

// export default function PosterProfileEdit({ navigation }) {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [locating, setLocating] = useState(false);

//   // Profile
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [about, setAbout] = useState("");
//   const [imageUri, setImageUri] = useState(null);

//   // Phone OTP
//   const [phone, setPhone] = useState("");
//   const [otp, setOtp] = useState("");
//   const [sessionId, setSessionId] = useState(null);
//   const [phoneVerified, setPhoneVerified] = useState(false);

//   // Address
//   const [addresses, setAddresses] = useState([]);
//   const [label, setLabel] = useState("");
//   const [pinCode, setPinCode] = useState("");
//   const [areaText, setAreaText] = useState("");
//   const [lat, setLat] = useState(null);
//   const [lon, setLon] = useState(null);

//   const [isExistingUser, setIsExistingUser] = useState(false);

//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         const res = await fetchPosterProfile();
//         if (res.status === "SUCCESS" && res.data) {
//           const profile = res.data;
//           setName(profile.name || "");
//           setEmail(profile.email || "");
//           setAbout(profile.about || "");
//           setImageUri(profile.imageUrl || null);
//           setAddresses(profile.addresses || []);
//           setPhone(profile.phone || "");
//           setPhoneVerified(profile.isPhoneVerified || false);
//           setIsExistingUser(true);
//         } else {
//           setIsExistingUser(false);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadProfile();
//   }, []);

//   // Pick profile image
//   const pickImage = async () => {
//     const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!granted)
//       return Alert.alert("Permission", "Please allow photo access.");
//     const res = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.8,
//     });
//     if (!res.canceled) setImageUri(res.assets[0].uri);
//   };

//   // Use current location
//   const useLocation = async () => {
//     try {
//       setLocating(true);
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted")
//         return Alert.alert("Permission denied", "Location permission needed.");
//       const loc = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Highest,
//       });
//       setLat(loc.coords.latitude);
//       setLon(loc.coords.longitude);
//       Alert.alert(
//         "Location fetched",
//         `Lat: ${loc.coords.latitude}, Lon: ${loc.coords.longitude}`
//       );
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to fetch location.");
//     } finally {
//       setLocating(false);
//     }
//   };

//   // Save profile
//   const handleSaveProfile = async () => {
//     if (!name.trim() || !email.trim())
//       return Alert.alert("Validation", "Name and Email are required.");
//     const payload = {
//       Name: name.trim(),
//       email: email.trim(),
//       about: about.trim(),
//       imageUrl: imageUri,
//       phone: phone.trim(),
//     };
//     try {
//       setSaving(true);
//       const res = await updatePosterProfile(payload);
//       if (res.status === "SUCCESS") {
//         Alert.alert(
//           "Success",
//           isExistingUser ? "Profile updated." : "Profile created."
//         );
//         setIsExistingUser(true);
//       } else {
//         Alert.alert("Error", res.message || "Failed to save profile.");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to save profile.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Add or update address
//   const handleSaveAddress = async () => {
//     if (!label.trim() || !pinCode.trim() || !areaText.trim())
//       return Alert.alert("Validation", "Address fields are required.");
//     const payload = { label, pinCode, areaText, lat, lon };
//     try {
//       setSaving(true);
//       if (addresses.length > 0) {
//         const addrId = addresses[0].id;
//         await updateAddress(addrId, payload);
//         Alert.alert("Success", "Address updated.");
//       } else {
//         const res = await addAddress(payload);
//         setAddresses([...addresses, res.data]);
//         Alert.alert("Success", "Address added.");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to save address.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const handleSendOtp = async () => {
//     if (!phone.trim()) return Alert.alert("Validation", "Enter phone number.");
//     try {
//       const res = await sendPosterPhoneOtp();
//       if (res.status === "SUCCESS") {
//         setSessionId(res.data.sessionId);
//         Alert.alert("OTP Sent", "Check your phone for OTP.");
//       } else {
//         Alert.alert("Error", res.message || "Failed to send OTP.");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (!otp.trim()) return Alert.alert("Validation", "Enter OTP.");
//     try {
//       const res = await verifyPosterPhoneOtp(sessionId, otp);
//       if (res.status === "SUCCESS") {
//         setPhoneVerified(true);
//         Alert.alert("Success", "Phone verified successfully!");
//       } else {
//         Alert.alert("Error", res.message || "OTP verification failed.");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0b78ff" />
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <TouchableOpacity
//         style={styles.backButton}
//         onPress={() => navigation.goBack()}
//       >
//         <Ionicons name="arrow-back" size={26} color="#000" />
//       </TouchableOpacity>

//       <Text style={styles.title}>
//         {isExistingUser ? "Edit Profile" : "Create Profile"}
//       </Text>

//       {/* Profile Image */}
//       <View style={styles.imageRow}>
//         <Image
//           source={{
//             uri:
//               imageUri ||
//               "https://cdn-icons-png.flaticon.com/512/847/847969.png",
//           }}
//           style={styles.avatar}
//         />
//         <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
//           <Text style={styles.imageBtnText}>Change Photo</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Profile Fields */}
//       <Text style={styles.label}>Full Name</Text>
//       <TextInput
//         style={styles.input}
//         value={name}
//         onChangeText={setName}
//         placeholder="Enter name"
//       />

//       <Text style={styles.label}>Email</Text>
//       <TextInput
//         style={styles.input}
//         value={email}
//         onChangeText={setEmail}
//         placeholder="Enter email"
//         keyboardType="email-address"
//       />

//       <Text style={styles.label}>About</Text>
//       <TextInput
//         style={[styles.input, { height: 100 }]}
//         value={about}
//         onChangeText={setAbout}
//         placeholder="Short bio"
//         multiline
//       />

//       {/* Phone verification */}
//       <Text style={styles.label}>Phone Number</Text>
//       <TextInput
//         style={styles.input}
//         value={phone}
//         onChangeText={setPhone}
//         placeholder="Enter phone number"
//         keyboardType="phone-pad"
//       />
//       {phoneVerified ? (
//         <Text style={{ color: "green", fontWeight: "600" }}>Verified ✅</Text>
//       ) : (
//         <>
//           <TouchableOpacity style={styles.otpBtn} onPress={handleSendOtp}>
//             <Text style={styles.otpBtnText}>Send OTP</Text>
//           </TouchableOpacity>
//           <TextInput
//             style={styles.input}
//             value={otp}
//             onChangeText={setOtp}
//             placeholder="Enter OTP"
//             keyboardType="numeric"
//           />
//           <TouchableOpacity style={styles.otpBtn} onPress={handleVerifyOtp}>
//             <Text style={styles.otpBtnText}>Verify OTP</Text>
//           </TouchableOpacity>
//         </>
//       )}

//       {/* Address Fields */}
//       <Text style={[styles.label, { marginTop: 12 }]}>Address Label</Text>
//       <TextInput
//         style={styles.input}
//         value={label}
//         onChangeText={setLabel}
//         placeholder="Home / Office"
//       />

//       <Text style={styles.label}>Pin Code</Text>
//       <TextInput
//         style={styles.input}
//         value={pinCode}
//         onChangeText={setPinCode}
//         placeholder="Enter pin code"
//         keyboardType="numeric"
//       />

//       <Text style={styles.label}>Area / Street</Text>
//       <TextInput
//         style={styles.input}
//         value={areaText}
//         onChangeText={setAreaText}
//         placeholder="Area or Street"
//       />

//       {/* Location */}
//       <TouchableOpacity
//         style={styles.locationBtn}
//         onPress={useLocation}
//         disabled={locating}
//       >
//         {locating ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.locationBtnText}>Use Current Location</Text>
//         )}
//       </TouchableOpacity>

//       {/* Save Buttons */}
//       <TouchableOpacity
//         style={styles.saveBtn}
//         onPress={handleSaveProfile}
//         disabled={saving}
//       >
//         {saving ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.saveText}>
//             {isExistingUser ? "Update Profile" : "Create Profile"}
//           </Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.saveBtn, { backgroundColor: "#00b894", marginTop: 8 }]}
//         onPress={handleSaveAddress}
//         disabled={saving}
//       >
//         {saving ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.saveText}>
//             {addresses.length > 0 ? "Update Address" : "Add Address"}
//           </Text>
//         )}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#f2f6fb", paddingBottom: 50 },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f2f6fb",
//   },
//   backButton: { position: "absolute", top: 40, left: 20, zIndex: 10 },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#0b4da0",
//     marginBottom: 12,
//     textAlign: "center",
//     marginTop: 40,
//   },
//   imageRow: { alignItems: "center", marginBottom: 12 },
//   avatar: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 2,
//     borderColor: "#0b78ff",
//   },
//   imageBtn: {
//     marginTop: 8,
//     backgroundColor: "#0b78ff",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//   },
//   imageBtnText: { color: "#fff", fontWeight: "600" },
//   label: { marginTop: 12, fontWeight: "600", color: "#333" },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     marginTop: 4,
//     backgroundColor: "#fff",
//   },
//   otpBtn: {
//     backgroundColor: "#0984e3",
//     padding: 10,
//     marginTop: 6,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   otpBtnText: { color: "#fff", fontWeight: "600" },
//   locationBtn: {
//     backgroundColor: "#6c5ce7",
//     padding: 10,
//     marginTop: 6,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   locationBtnText: { color: "#fff", fontWeight: "600" },
//   saveBtn: {
//     backgroundColor: "#0b78ff",
//     padding: 14,
//     marginTop: 16,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchPosterProfile,
  updatePosterProfile,
  sendPosterPhoneOtp,
  verifyPosterPhoneOtp,
} from "../api/poster";

export default function PosterProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    about: "",
    isPhoneVerified: false,
  });

  const [otpSessionId, setOtpSessionId] = useState(null);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Load profile on mount
  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchPosterProfile();
      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        about: data.about || "",
        isPhoneVerified: data.isPhoneVerified || false,
      });
    } catch (err) {
      console.error("Fetch Profile Error:", err);
      // Handle new user
      if (err.response?.status === 400) {
        // Optionally prefill email from JWT or AsyncStorage
        const token = await AsyncStorage.getItem("authToken");
        let email = "";
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          email = payload.email || "";
        }
        setProfile({
          name: "",
          email,
          phone: "",
          about: "",
          isPhoneVerified: false,
        });
      } else {
        Alert.alert("Error", "Failed to fetch profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Save profile
  const handleSave = async () => {
    if (!profile.name || !profile.phone) {
      return Alert.alert("Error", "Name and Phone are required");
    }
    setSaving(true);
    try {
      const res = await updatePosterProfile({
        Name: profile.name,
        phone: profile.phone,
        about: profile.about,
      });
      Alert.alert("Success", "Profile saved successfully");
      setProfile((prev) => ({ ...prev, isPhoneVerified: false }));
    } catch (err) {
      console.error("Save Profile Error:", err);
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!profile.phone) return Alert.alert("Error", "Phone number is required");
    setSendingOtp(true);
    try {
      const res = await sendPosterPhoneOtp();
      if (res.status === "SUCCESS") {
        setOtpSessionId(res.data.sessionId);
        Alert.alert("OTP Sent", res.data.message || "OTP sent successfully");
      } else {
        Alert.alert("Error", res.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP Error:", err);
      Alert.alert("Error", "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpSessionId || !otp) return Alert.alert("Error", "Enter OTP first");
    setVerifyingOtp(true);
    try {
      const res = await verifyPosterPhoneOtp(otpSessionId, otp);
      if (res.status === "SUCCESS") {
        Alert.alert("Success", res.message || "Phone verified successfully");
        setProfile((prev) => ({ ...prev, isPhoneVerified: true }));
      } else {
        Alert.alert("Error", res.message || "OTP verification failed");
      }
    } catch (err) {
      console.error("Verify OTP Error:", err);
      Alert.alert("Error", "OTP verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, { backgroundColor: "#eee" }]}
        value={profile.email}
        editable={false}
      />

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={profile.name}
        onChangeText={(text) => setProfile({ ...profile, name: text })}
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={profile.phone}
        onChangeText={(text) => setProfile({ ...profile, phone: text })}
        placeholder="+919876543210"
      />

      <Text style={styles.label}>About</Text>
      <TextInput
        style={styles.input}
        value={profile.about}
        onChangeText={(text) => setProfile({ ...profile, about: text })}
        multiline
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Saving..." : "Save Profile"}
        </Text>
      </TouchableOpacity>

      {!profile.isPhoneVerified && profile.phone ? (
        <>
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
                keyboardType="number-pad"
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
        </>
      ) : (
        profile.phone && (
          <Text style={{ color: "green", marginTop: 10 }}>
            Phone Verified ✅
          </Text>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  label: { fontWeight: "bold", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  button: {
    backgroundColor: "#ff6b6b",
    padding: 15,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

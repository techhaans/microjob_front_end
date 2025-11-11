// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   TouchableOpacity,
//   LayoutAnimation,
//   Platform,
//   UIManager,
//   Image,
// } from "react-native";
// import { fetchPosterProfile, deleteAddress } from "../api/poster";
// import { Ionicons } from "@expo/vector-icons";
// import { useIsFocused } from "@react-navigation/native";

// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function PosterProfileView({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showProfileDetails, setShowProfileDetails] = useState(true);
//   const isFocused = useIsFocused();

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchPosterProfile();

//       // 🧩 Log full JSON response from backend
//       console.log(
//         "📦 Poster profile API raw response:",
//         JSON.stringify(res, null, 2)
//       );

//       if (res?.status === "SUCCESS" && res.data) {
//         console.log(
//           "✅ Parsed profile data:",
//           JSON.stringify(res.data, null, 2)
//         );
//         setProfile(res.data);
//       } else {
//         console.warn("⚠️ Unexpected or empty response:", res);
//         setProfile(null);
//       }
//     } catch (err) {
//       console.error("❌ Error fetching profile:", err);
//       Alert.alert("Error", "Failed to fetch profile.");
//       setProfile(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isFocused) loadProfile();
//   }, [isFocused]);

//   const handleDelete = async (id) => {
//     Alert.alert(
//       "Confirm Delete",
//       "Are you sure you want to delete this address?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               console.log("🗑️ Attempting to delete address with ID:", id);
//               const delRes = await deleteAddress(id);
//               console.log(
//                 "📩 Delete address API response:",
//                 JSON.stringify(delRes, null, 2)
//               );

//               await loadProfile(); // refresh profile after delete
//             } catch (err) {
//               console.error("❌ Error deleting address:", err);
//               Alert.alert("Error", "Failed to delete address");
//             }
//           },
//         },
//       ]
//     );
//   };

//   const toggleProfileDetails = () => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setShowProfileDetails(!showProfileDetails);
//   };

//   const kycBadge = () => {
//     if (profile?.verificationStatus) {
//       switch (profile.verificationStatus) {
//         case "VERIFIED":
//           return (
//             <Text style={[styles.badge, { backgroundColor: "#4CAF50" }]}>
//               Verified
//             </Text>
//           );
//         case "PENDING":
//           return (
//             <Text style={[styles.badge, { backgroundColor: "#FF9800" }]}>
//               Pending
//             </Text>
//           );
//         case "KYC_REJECTED":
//           return (
//             <Text style={[styles.badge, { backgroundColor: "#f44336" }]}>
//               Rejected
//             </Text>
//           );
//         default:
//           return (
//             <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>
//               -
//             </Text>
//           );
//       }
//     } else if (profile?.KycStatus !== undefined) {
//       return profile.KycStatus ? (
//         <Text style={[styles.badge, { backgroundColor: "#4CAF50" }]}>
//           Verified
//         </Text>
//       ) : (
//         <Text style={[styles.badge, { backgroundColor: "#FF9800" }]}>
//           Pending
//         </Text>
//       );
//     } else {
//       return (
//         <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>-</Text>
//       );
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#1877f2" />
//       </View>
//     );

//   if (!profile)
//     return (
//       <View style={styles.loader}>
//         <Text style={{ color: "#555" }}>No profile found.</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Top Header */}
//       <View style={styles.topHeader}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#1877f2" />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>Profile</Text>
//       </View>

//       {/* Collapsible Profile Details */}
//       <TouchableOpacity
//         style={styles.sectionHeader}
//         onPress={toggleProfileDetails}
//       >
//         <Text style={styles.sectionHeaderText}>Profile Details</Text>
//         <Ionicons
//           name={showProfileDetails ? "chevron-up" : "chevron-down"}
//           size={22}
//           color="#1877f2"
//         />
//       </TouchableOpacity>

//       {showProfileDetails && (
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Name</Text>
//           <Text style={styles.cardText}>{profile.name || "-"}</Text>

//           <Text style={styles.cardTitle}>Email</Text>
//           <Text style={styles.cardText}>{profile.email || "-"}</Text>

//           <Text style={styles.cardTitle}>Phone</Text>
//           <Text style={styles.cardText}>{profile.phone || "-"}</Text>

//           <Text style={styles.cardTitle}>KYC Status</Text>
//           <View style={{ marginTop: 4 }}>{kycBadge()}</View>

//           {/* KYC Rejected Reason & Images */}
//           {profile.verificationStatus === "KYC_REJECTED" && (
//             <View style={{ marginTop: 6 }}>
//               {profile.kycRejectReason && (
//                 <Text style={{ color: "#f44336", marginBottom: 4 }}>
//                   Reason: {profile.kycRejectReason}
//                 </Text>
//               )}

//               {profile.kycDocuments?.length > 0 && (
//                 <ScrollView horizontal style={{ marginTop: 4 }}>
//                   {profile.kycDocuments.map(
//                     (doc) =>
//                       doc.status === "REJECTED" && (
//                         <Image
//                           key={doc.id}
//                           source={{ uri: doc.downloadUrl }}
//                           style={{
//                             width: 80,
//                             height: 80,
//                             marginRight: 6,
//                             borderRadius: 6,
//                           }}
//                           resizeMode="cover"
//                         />
//                       )
//                   )}
//                 </ScrollView>
//               )}

//               {/* Button to Re-upload KYC */}
//               <TouchableOpacity
//                 style={styles.reuploadBtn}
//                 onPress={() =>
//                   navigation.navigate("UploadKyc", { userId: profile.userId })
//                 }
//               >
//                 <Text style={styles.reuploadText}>Re-upload KYC</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       )}

//       {/* About Section */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>About</Text>
//         <Text style={styles.cardText}>{profile.bio || "-"}</Text>
//       </View>

//       {/* Addresses */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Addresses</Text>
//         {profile.addresses?.length > 0 ? (
//           profile.addresses.map((addr) => (
//             <View key={addr.id} style={styles.addressCard}>
//               <Text style={styles.cardText}>Label: {addr.label}</Text>
//               <Text style={styles.cardText}>Area: {addr.area}</Text>
//               <Text style={styles.cardText}>Pin Code: {addr.pinCode}</Text>
//               <Text style={styles.cardText}>
//                 Added On: {new Date(addr.createdAt).toLocaleDateString()}
//               </Text>

//               <View style={{ flexDirection: "row", marginTop: 6 }}>
//                 <TouchableOpacity
//                   style={styles.editBtn}
//                   onPress={() =>
//                     navigation.navigate("EditAddress", {
//                       address: addr,
//                       isEdit: true,
//                     })
//                   }
//                 >
//                   <Text style={styles.editText}>Edit</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.deleteBtn}
//                   onPress={() => handleDelete(addr.id)}
//                 >
//                   <Text style={styles.deleteText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ))
//         ) : (
//           <Text style={{ color: "#555", marginTop: 8 }}>
//             No addresses added.
//           </Text>
//         )}

//         <TouchableOpacity
//           style={styles.addAddressBtn}
//           onPress={() => navigation.navigate("EditAddress")}
//         >
//           <Text style={styles.addAddressText}>+ Add New Address</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f0f2f5",
//   },
//   container: { padding: 16, paddingBottom: 40, backgroundColor: "#f0f2f5" },
//   topHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
//   headerText: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#1877f2",
//     marginLeft: 12,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#e8f0fe",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   sectionHeaderText: { fontSize: 16, fontWeight: "700", color: "#1877f2" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 16,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#1877f2",
//     marginBottom: 4,
//   },
//   cardText: { fontSize: 14, color: "#333", marginBottom: 8 },
//   badge: {
//     color: "#fff",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 14,
//     fontWeight: "600",
//     alignSelf: "flex-start",
//   },
//   addressCard: {
//     padding: 12,
//     marginBottom: 8,
//     backgroundColor: "#f0f2f5",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#d3d6db",
//   },
//   editBtn: {
//     backgroundColor: "#0b78ff",
//     padding: 6,
//     borderRadius: 6,
//     marginRight: 8,
//   },
//   editText: { color: "#fff", fontWeight: "600" },
//   deleteBtn: { backgroundColor: "#f44336", padding: 6, borderRadius: 6 },
//   deleteText: { color: "#fff", fontWeight: "600" },
//   addAddressBtn: {
//     backgroundColor: "#00b894",
//     padding: 10,
//     borderRadius: 8,
//     marginTop: 8,
//     alignItems: "center",
//   },
//   addAddressText: { color: "#fff", fontWeight: "700" },
//   reuploadBtn: {
//     backgroundColor: "#f39c12",
//     padding: 8,
//     borderRadius: 6,
//     marginTop: 8,
//     alignItems: "center",
//   },
//   reuploadText: { color: "#fff", fontWeight: "700" },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   TouchableOpacity,
//   LayoutAnimation,
//   Platform,
//   UIManager,
//   Image,
// } from "react-native";
// import { fetchPosterProfile, deleteAddress } from "../api/poster";
// import { Ionicons } from "@expo/vector-icons";
// import { useIsFocused } from "@react-navigation/native";

// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function PosterProfileView({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showProfileDetails, setShowProfileDetails] = useState(true);
//   const isFocused = useIsFocused();

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchPosterProfile();
//       console.log(
//         "📦 Poster profile API response:",
//         JSON.stringify(res, null, 2)
//       );

//       if (res?.status === "SUCCESS" && res.data) {
//         console.log(
//           "✅ Parsed profile data:",
//           JSON.stringify(res.data, null, 2)
//         );
//         setProfile(res.data);
//       } else {
//         console.warn("⚠️ Unexpected response:", res);
//         setProfile(null);
//       }
//     } catch (err) {
//       console.error("❌ Error fetching profile:", err);
//       Alert.alert("Error", "Failed to fetch profile.");
//       setProfile(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isFocused) loadProfile();
//   }, [isFocused]);

//   const handleDelete = async (id) => {
//     Alert.alert(
//       "Confirm Delete",
//       "Are you sure you want to delete this address?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               console.log("🗑️ Deleting address ID:", id);
//               const delRes = await deleteAddress(id);
//               console.log(
//                 "📩 Delete API response:",
//                 JSON.stringify(delRes, null, 2)
//               );
//               await loadProfile();
//             } catch (err) {
//               console.error("❌ Error deleting address:", err);
//               Alert.alert("Error", "Failed to delete address");
//             }
//           },
//         },
//       ]
//     );
//   };

//   const toggleProfileDetails = () => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setShowProfileDetails(!showProfileDetails);
//   };

//   const kycBadge = () => {
//     if (profile?.verificationStatus) {
//       switch (profile.verificationStatus) {
//         case "VERIFIED":
//           return (
//             <Text style={[styles.badge, { backgroundColor: "#4CAF50" }]}>
//               Verified
//             </Text>
//           );
//         case "PENDING":
//           return (
//             <Text style={[styles.badge, { backgroundColor: "#FF9800" }]}>
//               Pending
//             </Text>
//           );
//         case "KYC_REJECTED":
//           return (
//             <Text style={[styles.badge, { backgroundColor: "#f44336" }]}>
//               Rejected
//             </Text>
//           );
//         default:
//           return (
//             <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>
//               -
//             </Text>
//           );
//       }
//     } else if (profile?.KycStatus !== undefined) {
//       return profile.KycStatus ? (
//         <Text style={[styles.badge, { backgroundColor: "#4CAF50" }]}>
//           Verified
//         </Text>
//       ) : (
//         <Text style={[styles.badge, { backgroundColor: "#FF9800" }]}>
//           Pending
//         </Text>
//       );
//     } else {
//       return (
//         <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>-</Text>
//       );
//     }
//   };

//   const phoneVerifyBadge = () => {
//     if (profile?.isPhoneVerified === true) {
//       return (
//         <Text style={[styles.badge, { backgroundColor: "#4CAF50" }]}>
//           Completed
//         </Text>
//       );
//     } else if (profile?.isPhoneVerified === false) {
//       return (
//         <Text style={[styles.badge, { backgroundColor: "#FF9800" }]}>
//           Pending
//         </Text>
//       );
//     } else {
//       return (
//         <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>-</Text>
//       );
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#1877f2" />
//       </View>
//     );

//   if (!profile)
//     return (
//       <View style={styles.loader}>
//         <Text style={{ color: "#555" }}>No profile found.</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Top Header */}
//       <View style={styles.topHeader}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#1877f2" />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>Profile</Text>
//       </View>

//       {/* Collapsible Profile Details */}
//       <TouchableOpacity
//         style={styles.sectionHeader}
//         onPress={toggleProfileDetails}
//       >
//         <Text style={styles.sectionHeaderText}>Profile Details</Text>
//         <Ionicons
//           name={showProfileDetails ? "chevron-up" : "chevron-down"}
//           size={22}
//           color="#1877f2"
//         />
//       </TouchableOpacity>

//       {showProfileDetails && (
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Name</Text>
//           <Text style={styles.cardText}>{profile.name || "-"}</Text>

//           <Text style={styles.cardTitle}>Email</Text>
//           <Text style={styles.cardText}>{profile.email || "-"}</Text>

//           <Text style={styles.cardTitle}>Phone</Text>
//           <Text style={styles.cardText}>{profile.phone || "-"}</Text>

//           {/* 📞 Phone Verification Status */}
//           <Text style={styles.cardTitle}>Phone Verification</Text>
//           <View style={{ marginTop: 4 }}>{phoneVerifyBadge()}</View>

//           {/* 🪪 KYC Status */}
//           <Text style={styles.cardTitle}>KYC Status</Text>
//           <View style={{ marginTop: 4 }}>{kycBadge()}</View>

//           {/* KYC Rejected Reason & Images */}
//           {profile.verificationStatus === "KYC_REJECTED" && (
//             <View style={{ marginTop: 6 }}>
//               {profile.kycRejectReason && (
//                 <Text style={{ color: "#f44336", marginBottom: 4 }}>
//                   Reason: {profile.kycRejectReason}
//                 </Text>
//               )}

//               {profile.kycDocuments?.length > 0 && (
//                 <ScrollView horizontal style={{ marginTop: 4 }}>
//                   {profile.kycDocuments.map(
//                     (doc) =>
//                       doc.status === "REJECTED" && (
//                         <Image
//                           key={doc.id}
//                           source={{ uri: doc.downloadUrl }}
//                           style={{
//                             width: 80,
//                             height: 80,
//                             marginRight: 6,
//                             borderRadius: 6,
//                           }}
//                           resizeMode="cover"
//                         />
//                       )
//                   )}
//                 </ScrollView>
//               )}

//               {/* Button to Re-upload KYC */}
//               <TouchableOpacity
//                 style={styles.reuploadBtn}
//                 onPress={() =>
//                   navigation.navigate("UploadKyc", { userId: profile.userId })
//                 }
//               >
//                 <Text style={styles.reuploadText}>Re-upload KYC</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       )}

//       {/* About Section */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>About</Text>
//         <Text style={styles.cardText}>{profile.bio || "-"}</Text>
//       </View>

//       {/* Addresses */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Addresses</Text>
//         {profile.addresses?.length > 0 ? (
//           profile.addresses.map((addr) => (
//             <View key={addr.id} style={styles.addressCard}>
//               <Text style={styles.cardText}>Label: {addr.label}</Text>
//               <Text style={styles.cardText}>Area: {addr.area}</Text>
//               <Text style={styles.cardText}>Pin Code: {addr.pinCode}</Text>
//               <Text style={styles.cardText}>
//                 Added On: {new Date(addr.createdAt).toLocaleDateString()}
//               </Text>

//               <View style={{ flexDirection: "row", marginTop: 6 }}>
//                 <TouchableOpacity
//                   style={styles.editBtn}
//                   onPress={() =>
//                     navigation.navigate("EditAddress", {
//                       address: addr,
//                       isEdit: true,
//                     })
//                   }
//                 >
//                   <Text style={styles.editText}>Edit</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.deleteBtn}
//                   onPress={() => handleDelete(addr.id)}
//                 >
//                   <Text style={styles.deleteText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ))
//         ) : (
//           <Text style={{ color: "#555", marginTop: 8 }}>
//             No addresses added.
//           </Text>
//         )}

//         <TouchableOpacity
//           style={styles.addAddressBtn}
//           onPress={() => navigation.navigate("EditAddress")}
//         >
//           <Text style={styles.addAddressText}>+ Add New Address</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f0f2f5",
//   },
//   container: { padding: 16, paddingBottom: 40, backgroundColor: "#f0f2f5" },
//   topHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
//   headerText: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#1877f2",
//     marginLeft: 12,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#e8f0fe",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   sectionHeaderText: { fontSize: 16, fontWeight: "700", color: "#1877f2" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 16,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#1877f2",
//     marginBottom: 4,
//   },
//   cardText: { fontSize: 14, color: "#333", marginBottom: 8 },
//   badge: {
//     color: "#fff",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 14,
//     fontWeight: "600",
//     alignSelf: "flex-start",
//   },
//   addressCard: {
//     padding: 12,
//     marginBottom: 8,
//     backgroundColor: "#f0f2f5",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#d3d6db",
//   },
//   editBtn: {
//     backgroundColor: "#0b78ff",
//     padding: 6,
//     borderRadius: 6,
//     marginRight: 8,
//   },
//   editText: { color: "#fff", fontWeight: "600" },
//   deleteBtn: { backgroundColor: "#f44336", padding: 6, borderRadius: 6 },
//   deleteText: { color: "#fff", fontWeight: "600" },
//   addAddressBtn: {
//     backgroundColor: "#00b894",
//     padding: 10,
//     borderRadius: 8,
//     marginTop: 8,
//     alignItems: "center",
//   },
//   addAddressText: { color: "#fff", fontWeight: "700" },
//   reuploadBtn: {
//     backgroundColor: "#f39c12",
//     padding: 8,
//     borderRadius: 6,
//     marginTop: 8,
//     alignItems: "center",
//   },
//   reuploadText: { color: "#fff", fontWeight: "700" },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   TouchableOpacity,
//   LayoutAnimation,
//   Platform,
//   UIManager,
//   Image,
// } from "react-native";
// import { fetchPosterProfile, deleteAddress } from "../api/poster";
// import { Ionicons } from "@expo/vector-icons";
// import { useIsFocused } from "@react-navigation/native";

// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function PosterProfileView({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showProfileDetails, setShowProfileDetails] = useState(true);
//   const isFocused = useIsFocused();

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchPosterProfile();
//       console.log(
//         "📦 Poster profile API response:",
//         JSON.stringify(res, null, 2)
//       );

//       if (res?.status === "SUCCESS" && res.data) {
//         setProfile(res.data);
//       } else {
//         setProfile(null);
//       }
//     } catch (err) {
//       console.error("❌ Error fetching profile:", err);
//       Alert.alert("Error", "Failed to fetch profile.");
//       setProfile(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isFocused) loadProfile();
//   }, [isFocused]);

//   const handleDelete = async (id) => {
//     Alert.alert(
//       "Confirm Delete",
//       "Are you sure you want to delete this address?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await deleteAddress(id);
//               await loadProfile();
//             } catch (err) {
//               console.error("❌ Error deleting address:", err);
//               Alert.alert("Error", "Failed to delete address");
//             }
//           },
//         },
//       ]
//     );
//   };

//   const toggleProfileDetails = () => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setShowProfileDetails(!showProfileDetails);
//   };

//   const kycBadge = () => {
//     if (profile?.verificationStatus) {
//       switch (profile.verificationStatus) {
//         case "VERIFIED":
//           return (
//             <Text style={[styles.badge, { backgroundColor: "#4CAF50" }]}>
//               Verified
//             </Text>
//           );
//         case "PENDING":
//           return (
//             <Text style={[styles.badge, { backgroundColor: "#FF9800" }]}>
//               Pending
//             </Text>
//           );
//         case "KYC_REJECTED":
//           return (
//             <Text style={[styles.badge, { backgroundColor: "#f44336" }]}>
//               Rejected
//             </Text>
//           );
//         default:
//           return (
//             <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>
//               -
//             </Text>
//           );
//       }
//     } else {
//       return (
//         <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>-</Text>
//       );
//     }
//   };

//   const phoneVerifyBadge = () => {
//     if (profile?.isPhoneVerified === true) {
//       return (
//         <Text style={[styles.badge, { backgroundColor: "#4CAF50" }]}>
//           Completed
//         </Text>
//       );
//     } else if (profile?.isPhoneVerified === false) {
//       return (
//         <Text style={[styles.badge, { backgroundColor: "#FF9800" }]}>
//           Pending
//         </Text>
//       );
//     } else {
//       return (
//         <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>-</Text>
//       );
//     }
//   };

//   const displayValue = (value) => (value ? value : "-");

//   if (loading)
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#1877f2" />
//       </View>
//     );

//   // NEW: Default placeholder view for new users
//   if (!profile)
//     return (
//       <ScrollView contentContainerStyle={styles.container}>
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Name</Text>
//           <Text style={styles.cardText}>-</Text>

//           <Text style={styles.cardTitle}>Email</Text>
//           <Text style={styles.cardText}>-</Text>

//           <Text style={styles.cardTitle}>Phone</Text>
//           <Text style={styles.cardText}>-</Text>

//           <Text style={styles.cardTitle}>Phone Verification</Text>
//           <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>-</Text>

//           <Text style={styles.cardTitle}>KYC Status</Text>
//           <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>-</Text>

//           <Text style={styles.cardTitle}>About</Text>
//           <Text style={styles.cardText}>-</Text>
//         </View>

//         <View style={{ alignItems: "center", marginTop: 20 }}>
//           <TouchableOpacity
//             style={[styles.addAddressBtn, { backgroundColor: "#1877f2" }]}
//             onPress={() => navigation.navigate("PosterProfileEdit")}
//           >
//             <Text style={styles.addAddressText}>Create Profile</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     );

//   // EXISTING USERS VIEW
//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Top Header */}
//       <View style={styles.topHeader}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#1877f2" />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>Profile</Text>
//       </View>

//       {/* Collapsible Profile Details */}
//       <TouchableOpacity
//         style={styles.sectionHeader}
//         onPress={toggleProfileDetails}
//       >
//         <Text style={styles.sectionHeaderText}>Profile Details</Text>
//         <Ionicons
//           name={showProfileDetails ? "chevron-up" : "chevron-down"}
//           size={22}
//           color="#1877f2"
//         />
//       </TouchableOpacity>

//       {showProfileDetails && (
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Name</Text>
//           <Text style={styles.cardText}>{displayValue(profile.name)}</Text>

//           <Text style={styles.cardTitle}>Email</Text>
//           <Text style={styles.cardText}>{displayValue(profile.email)}</Text>

//           <Text style={styles.cardTitle}>Phone</Text>
//           <Text style={styles.cardText}>{displayValue(profile.phone)}</Text>

//           <Text style={styles.cardTitle}>Phone Verification</Text>
//           <View style={{ marginTop: 4 }}>{phoneVerifyBadge()}</View>

//           <Text style={styles.cardTitle}>KYC Status</Text>
//           <View style={{ marginTop: 4 }}>{kycBadge()}</View>

//           {profile.verificationStatus === "KYC_REJECTED" && (
//             <View style={{ marginTop: 6 }}>
//               {profile.kycRejectReason && (
//                 <Text style={{ color: "#f44336", marginBottom: 4 }}>
//                   Reason: {profile.kycRejectReason}
//                 </Text>
//               )}

//               {profile.kycDocuments?.length > 0 && (
//                 <ScrollView horizontal style={{ marginTop: 4 }}>
//                   {profile.kycDocuments.map(
//                     (doc) =>
//                       doc.status === "REJECTED" && (
//                         <Image
//                           key={doc.id}
//                           source={{ uri: doc.downloadUrl }}
//                           style={{
//                             width: 80,
//                             height: 80,
//                             marginRight: 6,
//                             borderRadius: 6,
//                           }}
//                           resizeMode="cover"
//                         />
//                       )
//                   )}
//                 </ScrollView>
//               )}

//               <TouchableOpacity
//                 style={styles.reuploadBtn}
//                 onPress={() =>
//                   navigation.navigate("UploadKyc", { userId: profile.userId })
//                 }
//               >
//                 <Text style={styles.reuploadText}>Re-upload KYC</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       )}

//       {/* About Section */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>About</Text>
//         <Text style={styles.cardText}>{displayValue(profile.bio)}</Text>
//       </View>

//       {/* Addresses */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Addresses</Text>
//         {profile.addresses?.length > 0 ? (
//           profile.addresses.map((addr) => (
//             <View key={addr.id} style={styles.addressCard}>
//               <Text style={styles.cardText}>Label: {addr.label}</Text>
//               <Text style={styles.cardText}>Area: {addr.area}</Text>
//               <Text style={styles.cardText}>Pin Code: {addr.pinCode}</Text>
//               <Text style={styles.cardText}>
//                 Added On: {new Date(addr.createdAt).toLocaleDateString()}
//               </Text>

//               <View style={{ flexDirection: "row", marginTop: 6 }}>
//                 <TouchableOpacity
//                   style={styles.editBtn}
//                   onPress={() =>
//                     navigation.navigate("EditAddress", {
//                       address: addr,
//                       isEdit: true,
//                     })
//                   }
//                 >
//                   <Text style={styles.editText}>Edit</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.deleteBtn}
//                   onPress={() => handleDelete(addr.id)}
//                 >
//                   <Text style={styles.deleteText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ))
//         ) : (
//           <Text style={{ color: "#555", marginTop: 8 }}>
//             No addresses added.
//           </Text>
//         )}

//         <TouchableOpacity
//           style={styles.addAddressBtn}
//           onPress={() => navigation.navigate("EditAddress")}
//         >
//           <Text style={styles.addAddressText}>+ Add New Address</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f0f2f5",
//   },
//   container: { padding: 16, paddingBottom: 40, backgroundColor: "#f0f2f5" },
//   topHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
//   headerText: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#1877f2",
//     marginLeft: 12,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#e8f0fe",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   sectionHeaderText: { fontSize: 16, fontWeight: "700", color: "#1877f2" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 16,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#1877f2",
//     marginBottom: 4,
//   },
//   cardText: { fontSize: 14, color: "#333", marginBottom: 8 },
//   badge: {
//     color: "#fff",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 14,
//     fontWeight: "600",
//     alignSelf: "flex-start",
//   },
//   addressCard: {
//     padding: 12,
//     marginBottom: 8,
//     backgroundColor: "#f0f2f5",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#d3d6db",
//   },
//   editBtn: {
//     backgroundColor: "#0b78ff",
//     padding: 6,
//     borderRadius: 6,
//     marginRight: 8,
//   },
//   editText: { color: "#fff", fontWeight: "600" },
//   deleteBtn: { backgroundColor: "#f44336", padding: 6, borderRadius: 6 },
//   deleteText: { color: "#fff", fontWeight: "600" },
//   addAddressBtn: {
//     backgroundColor: "#00b894",
//     padding: 10,
//     borderRadius: 8,
//     marginTop: 8,
//     alignItems: "center",
//   },
//   addAddressText: { color: "#fff", fontWeight: "700" },
//   reuploadBtn: {
//     backgroundColor: "#f39c12",
//     padding: 8,
//     borderRadius: 6,
//     marginTop: 8,
//     alignItems: "center",
//   },
//   reuploadText: { color: "#fff", fontWeight: "700" },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   TouchableOpacity,
//   LayoutAnimation,
//   Platform,
//   UIManager,
//   Image,
// } from "react-native";
// import { fetchPosterProfile, deleteAddress } from "../api/poster";
// import { Ionicons } from "@expo/vector-icons";
// import { useIsFocused } from "@react-navigation/native";

// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function PosterProfileView({ navigation, route }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showProfileDetails, setShowProfileDetails] = useState(true);
//   const isFocused = useIsFocused();

//   const emailFromLogin = route?.params?.email || null;

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchPosterProfile();
//       console.log("📦 Poster profile API response:", res);

//       if (res?.status === "SUCCESS" && res.data) {
//         setProfile(res.data);
//       } else {
//         setProfile({
//           name: "",
//           email: emailFromLogin,
//           phone: "",
//           bio: "",
//           verificationStatus: null,
//           isPhoneVerified: null,
//           addresses: [],
//         });
//       }
//     } catch (err) {
//       console.error("❌ Error fetching profile:", err);
//       Alert.alert(
//         "Info",
//         "Failed to fetch profile. You can create a new profile."
//       );
//       setProfile({
//         name: "",
//         email: emailFromLogin,
//         phone: "",
//         bio: "",
//         verificationStatus: null,
//         isPhoneVerified: null,
//         addresses: [],
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isFocused) loadProfile();
//   }, [isFocused]);

//   const handleDelete = async (id) => {
//     Alert.alert(
//       "Confirm Delete",
//       "Are you sure you want to delete this address?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await deleteAddress(id);
//               await loadProfile();
//             } catch (err) {
//               console.error("❌ Error deleting address:", err);
//               Alert.alert("Error", "Failed to delete address");
//             }
//           },
//         },
//       ]
//     );
//   };

//   const toggleProfileDetails = () => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setShowProfileDetails(!showProfileDetails);
//   };

//   const kycBadge = () => {
//     switch (profile.verificationStatus) {
//       case "VERIFIED":
//         return (
//           <Text style={[styles.badge, { backgroundColor: "#4CAF50" }]}>
//             Verified
//           </Text>
//         );
//       case "PENDING":
//         return (
//           <Text style={[styles.badge, { backgroundColor: "#FF9800" }]}>
//             Pending
//           </Text>
//         );
//       case "KYC_REJECTED":
//         return (
//           <Text style={[styles.badge, { backgroundColor: "#f44336" }]}>
//             Rejected
//           </Text>
//         );
//       default:
//         return (
//           <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>-</Text>
//         );
//     }
//   };

//   const phoneVerifyBadge = () => {
//     if (profile.isPhoneVerified === true)
//       return (
//         <Text style={[styles.badge, { backgroundColor: "#4CAF50" }]}>
//           Completed
//         </Text>
//       );
//     if (profile.isPhoneVerified === false)
//       return (
//         <Text style={[styles.badge, { backgroundColor: "#FF9800" }]}>
//           Pending
//         </Text>
//       );
//     return (
//       <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>-</Text>
//     );
//   };

//   const displayValue = (value) => (value ? value : "-");

//   if (loading)
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#1877f2" />
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Top Header */}
//       <View style={styles.topHeader}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#1877f2" />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>Profile</Text>
//       </View>

//       {/* Collapsible Profile Details */}
//       <TouchableOpacity
//         style={styles.sectionHeader}
//         onPress={toggleProfileDetails}
//       >
//         <Text style={styles.sectionHeaderText}>Profile Details</Text>
//         <Ionicons
//           name={showProfileDetails ? "chevron-up" : "chevron-down"}
//           size={22}
//           color="#1877f2"
//         />
//       </TouchableOpacity>

//       {showProfileDetails && (
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Name</Text>
//           <Text style={styles.cardText}>{displayValue(profile.name)}</Text>

//           <Text style={styles.cardTitle}>Email</Text>
//           <Text style={styles.cardText}>{displayValue(profile.email)}</Text>

//           <Text style={styles.cardTitle}>Phone</Text>
//           <Text style={styles.cardText}>{displayValue(profile.phone)}</Text>

//           <Text style={styles.cardTitle}>Phone Verification</Text>
//           <View style={{ marginTop: 4 }}>{phoneVerifyBadge()}</View>

//           <Text style={styles.cardTitle}>KYC Status</Text>
//           <View style={{ marginTop: 4 }}>{kycBadge()}</View>

//           {profile.verificationStatus === "KYC_REJECTED" && (
//             <View style={{ marginTop: 6 }}>
//               {profile.kycRejectReason && (
//                 <Text style={{ color: "#f44336", marginBottom: 4 }}>
//                   Reason: {profile.kycRejectReason}
//                 </Text>
//               )}

//               {profile.kycDocuments?.length > 0 && (
//                 <ScrollView horizontal style={{ marginTop: 4 }}>
//                   {profile.kycDocuments.map(
//                     (doc) =>
//                       doc.status === "REJECTED" && (
//                         <Image
//                           key={doc.id}
//                           source={{ uri: doc.downloadUrl }}
//                           style={{
//                             width: 80,
//                             height: 80,
//                             marginRight: 6,
//                             borderRadius: 6,
//                           }}
//                           resizeMode="cover"
//                         />
//                       )
//                   )}
//                 </ScrollView>
//               )}

//               <TouchableOpacity
//                 style={styles.reuploadBtn}
//                 onPress={() =>
//                   navigation.navigate("UploadKyc", { userId: profile.userId })
//                 }
//               >
//                 <Text style={styles.reuploadText}>Re-upload KYC</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       )}

//       {/* About Section */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>About</Text>
//         <Text style={styles.cardText}>{displayValue(profile.bio)}</Text>
//       </View>

//       {/* Addresses */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Addresses</Text>
//         {profile.addresses?.length > 0 ? (
//           profile.addresses.map((addr) => (
//             <View key={addr.id} style={styles.addressCard}>
//               <Text style={styles.cardText}>Label: {addr.label}</Text>
//               <Text style={styles.cardText}>Area: {addr.area}</Text>
//               <Text style={styles.cardText}>Pin Code: {addr.pinCode}</Text>
//               <Text style={styles.cardText}>
//                 Added On: {new Date(addr.createdAt).toLocaleDateString()}
//               </Text>

//               <View style={{ flexDirection: "row", marginTop: 6 }}>
//                 <TouchableOpacity
//                   style={styles.editBtn}
//                   onPress={() =>
//                     navigation.navigate("EditAddress", {
//                       address: addr,
//                       isEdit: true,
//                     })
//                   }
//                 >
//                   <Text style={styles.editText}>Edit</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.deleteBtn}
//                   onPress={() => handleDelete(addr.id)}
//                 >
//                   <Text style={styles.deleteText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ))
//         ) : (
//           <Text style={{ color: "#555", marginTop: 8 }}>
//             No addresses added.
//           </Text>
//         )}

//         <TouchableOpacity
//           style={styles.addAddressBtn}
//           onPress={() => navigation.navigate("EditAddress")}
//         >
//           <Text style={styles.addAddressText}>+ Add New Address</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Create Profile for new users */}
//       {!profile.name && (
//         <View style={{ alignItems: "center", marginTop: 20 }}>
//           <TouchableOpacity
//             style={[styles.addAddressBtn, { backgroundColor: "#1877f2" }]}
//             onPress={() => navigation.navigate("PosterProfileEdit")}
//           >
//             <Text style={styles.addAddressText}>Create Profile</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f0f2f5",
//   },
//   container: { padding: 16, paddingBottom: 40, backgroundColor: "#f0f2f5" },
//   topHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
//   headerText: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#1877f2",
//     marginLeft: 12,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#e8f0fe",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   sectionHeaderText: { fontSize: 16, fontWeight: "700", color: "#1877f2" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 16,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#1877f2",
//     marginBottom: 4,
//   },
//   cardText: { fontSize: 14, color: "#333", marginBottom: 8 },
//   badge: {
//     color: "#fff",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 14,
//     fontWeight: "600",
//     alignSelf: "flex-start",
//   },
//   addressCard: {
//     padding: 12,
//     marginBottom: 8,
//     backgroundColor: "#f0f2f5",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#d3d6db",
//   },
//   editBtn: {
//     backgroundColor: "#0b78ff",
//     padding: 6,
//     borderRadius: 6,
//     marginRight: 8,
//   },
//   editText: { color: "#fff", fontWeight: "600" },
//   deleteBtn: { backgroundColor: "#f44336", padding: 6, borderRadius: 6 },
//   deleteText: { color: "#fff", fontWeight: "600" },
//   addAddressBtn: {
//     backgroundColor: "#00b894",
//     padding: 10,
//     borderRadius: 8,
//     marginTop: 8,
//     alignItems: "center",
//   },
//   addAddressText: { color: "#fff", fontWeight: "700" },
//   reuploadBtn: {
//     backgroundColor: "#f39c12",
//     padding: 8,
//     borderRadius: 6,
//     marginTop: 8,
//     alignItems: "center",
//   },
//   reuploadText: { color: "#fff", fontWeight: "700" },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   TouchableOpacity,
//   LayoutAnimation,
//   Platform,
//   UIManager,
//   Image,
// } from "react-native";
// import { fetchPosterProfile, deleteAddress } from "../api/poster";
// import { Ionicons } from "@expo/vector-icons";
// import { useIsFocused } from "@react-navigation/native";

// if (
//   Platform.OS === "android" &&
//   UIManager.setLayoutAnimationEnabledExperimental
// ) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// export default function PosterProfileView({ navigation, route }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showProfileDetails, setShowProfileDetails] = useState(true);
//   const isFocused = useIsFocused();

//   const emailFromLogin = route?.params?.email || null;

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchPosterProfile();
//       console.log("📦 Poster profile API response:", res);

//       if (res?.status === "SUCCESS" && res.data) {
//         setProfile(res.data);
//       } else {
//         // Use emailFromLogin if API fails
//         setProfile({
//           name: "",
//           email: emailFromLogin,
//           phone: "",
//           bio: "",
//           verificationStatus: null,
//           isPhoneVerified: null,
//           addresses: [],
//         });
//       }
//     } catch (err) {
//       console.error("❌ Error fetching profile:", err);
//       Alert.alert(
//         "Info",
//         "Failed to fetch profile. You can create a new profile."
//       );
//       setProfile({
//         name: "",
//         email: emailFromLogin,
//         phone: "",
//         bio: "",
//         verificationStatus: null,
//         isPhoneVerified: null,
//         addresses: [],
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isFocused) loadProfile();
//   }, [isFocused]);

//   const handleDelete = async (id) => {
//     Alert.alert(
//       "Confirm Delete",
//       "Are you sure you want to delete this address?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await deleteAddress(id);
//               await loadProfile();
//             } catch (err) {
//               console.error("❌ Error deleting address:", err);
//               Alert.alert("Error", "Failed to delete address");
//             }
//           },
//         },
//       ]
//     );
//   };

//   const toggleProfileDetails = () => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setShowProfileDetails(!showProfileDetails);
//   };

//   const kycBadge = () => {
//     switch (profile.verificationStatus) {
//       case "VERIFIED":
//         return (
//           <Text style={[styles.badge, { backgroundColor: "#4CAF50" }]}>
//             Verified
//           </Text>
//         );
//       case "PENDING":
//         return (
//           <Text style={[styles.badge, { backgroundColor: "#FF9800" }]}>
//             Pending
//           </Text>
//         );
//       case "KYC_REJECTED":
//         return (
//           <Text style={[styles.badge, { backgroundColor: "#f44336" }]}>
//             Rejected
//           </Text>
//         );
//       default:
//         return (
//           <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>-</Text>
//         );
//     }
//   };

//   const phoneVerifyBadge = () => {
//     if (profile.isPhoneVerified === true)
//       return (
//         <Text style={[styles.badge, { backgroundColor: "#4CAF50" }]}>
//           Completed
//         </Text>
//       );
//     if (profile.isPhoneVerified === false)
//       return (
//         <Text style={[styles.badge, { backgroundColor: "#FF9800" }]}>
//           Pending
//         </Text>
//       );
//     return (
//       <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>-</Text>
//     );
//   };

//   const displayValue = (value) => (value ? value : "-");

//   if (loading)
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#1877f2" />
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Top Header */}
//       <View style={styles.topHeader}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#1877f2" />
//         </TouchableOpacity>
//         <Text style={styles.headerText}>Profile</Text>
//       </View>

//       {/* Collapsible Profile Details */}
//       <TouchableOpacity
//         style={styles.sectionHeader}
//         onPress={toggleProfileDetails}
//       >
//         <Text style={styles.sectionHeaderText}>Profile Details</Text>
//         <Ionicons
//           name={showProfileDetails ? "chevron-up" : "chevron-down"}
//           size={22}
//           color="#1877f2"
//         />
//       </TouchableOpacity>

//       {showProfileDetails && (
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Name</Text>
//           <Text style={styles.cardText}>{displayValue(profile.name)}</Text>

//           <Text style={styles.cardTitle}>Email</Text>
//           {/* Use emailFromLogin if profile.email is empty */}
//           <Text style={styles.cardText}>
//             {displayValue(profile.email || emailFromLogin)}
//           </Text>

//           <Text style={styles.cardTitle}>Phone</Text>
//           <Text style={styles.cardText}>{displayValue(profile.phone)}</Text>

//           <Text style={styles.cardTitle}>Phone Verification</Text>
//           <View style={{ marginTop: 4 }}>{phoneVerifyBadge()}</View>

//           <Text style={styles.cardTitle}>KYC Status</Text>
//           <View style={{ marginTop: 4 }}>{kycBadge()}</View>

//           {profile.verificationStatus === "KYC_REJECTED" && (
//             <View style={{ marginTop: 6 }}>
//               {profile.kycRejectReason && (
//                 <Text style={{ color: "#f44336", marginBottom: 4 }}>
//                   Reason: {profile.kycRejectReason}
//                 </Text>
//               )}

//               {profile.kycDocuments?.length > 0 && (
//                 <ScrollView horizontal style={{ marginTop: 4 }}>
//                   {profile.kycDocuments.map(
//                     (doc) =>
//                       doc.status === "REJECTED" && (
//                         <Image
//                           key={doc.id}
//                           source={{ uri: doc.downloadUrl }}
//                           style={{
//                             width: 80,
//                             height: 80,
//                             marginRight: 6,
//                             borderRadius: 6,
//                           }}
//                           resizeMode="cover"
//                         />
//                       )
//                   )}
//                 </ScrollView>
//               )}

//               <TouchableOpacity
//                 style={styles.reuploadBtn}
//                 onPress={() =>
//                   navigation.navigate("UploadKyc", { userId: profile.userId })
//                 }
//               >
//                 <Text style={styles.reuploadText}>Re-upload KYC</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       )}

//       {/* About Section */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>About</Text>
//         <Text style={styles.cardText}>{displayValue(profile.bio)}</Text>
//       </View>

//       {/* Addresses */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Addresses</Text>
//         {profile.addresses?.length > 0 ? (
//           profile.addresses.map((addr) => (
//             <View key={addr.id} style={styles.addressCard}>
//               <Text style={styles.cardText}>Label: {addr.label}</Text>
//               <Text style={styles.cardText}>Area: {addr.area}</Text>
//               <Text style={styles.cardText}>Pin Code: {addr.pinCode}</Text>
//               <Text style={styles.cardText}>
//                 Added On: {new Date(addr.createdAt).toLocaleDateString()}
//               </Text>

//               <View style={{ flexDirection: "row", marginTop: 6 }}>
//                 <TouchableOpacity
//                   style={styles.editBtn}
//                   onPress={() =>
//                     navigation.navigate("EditAddress", {
//                       address: addr,
//                       isEdit: true,
//                     })
//                   }
//                 >
//                   <Text style={styles.editText}>Edit</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.deleteBtn}
//                   onPress={() => handleDelete(addr.id)}
//                 >
//                   <Text style={styles.deleteText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ))
//         ) : (
//           <Text style={{ color: "#555", marginTop: 8 }}>
//             No addresses added.
//           </Text>
//         )}

//         <TouchableOpacity
//           style={styles.addAddressBtn}
//           onPress={() => navigation.navigate("EditAddress")}
//         >
//           <Text style={styles.addAddressText}>+ Add New Address</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Create Profile for new users */}
//       {!profile.name && (
//         <View style={{ alignItems: "center", marginTop: 20 }}>
//           <TouchableOpacity
//             style={[styles.addAddressBtn, { backgroundColor: "#1877f2" }]}
//             onPress={() => navigation.navigate("PosterProfileEdit")}
//           >
//             <Text style={styles.addAddressText}>Create Profile</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }
// const styles = StyleSheet.create({
//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f0f2f5",
//   },
//   container: { padding: 16, paddingBottom: 40, backgroundColor: "#f0f2f5" },
//   topHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
//   headerText: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#1877f2",
//     marginLeft: 12,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#e8f0fe",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   sectionHeaderText: { fontSize: 16, fontWeight: "700", color: "#1877f2" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 16,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#1877f2",
//     marginBottom: 4,
//   },
//   cardText: { fontSize: 14, color: "#333", marginBottom: 8 },
//   badge: {
//     color: "#fff",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 14,
//     fontWeight: "600",
//     alignSelf: "flex-start",
//   },
//   addressCard: {
//     padding: 12,
//     marginBottom: 8,
//     backgroundColor: "#f0f2f5",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#d3d6db",
//   },
//   editBtn: {
//     backgroundColor: "#0b78ff",
//     padding: 6,
//     borderRadius: 6,
//     marginRight: 8,
//   },
//   editText: { color: "#fff", fontWeight: "600" },
//   deleteBtn: { backgroundColor: "#f44336", padding: 6, borderRadius: 6 },
//   deleteText: { color: "#fff", fontWeight: "600" },
//   addAddressBtn: {
//     backgroundColor: "#00b894",
//     padding: 10,
//     borderRadius: 8,
//     marginTop: 8,
//     alignItems: "center",
//   },
//   addAddressText: { color: "#fff", fontWeight: "700" },
//   reuploadBtn: {
//     backgroundColor: "#f39c12",
//     padding: 8,
//     borderRadius: 6,
//     marginTop: 8,
//     alignItems: "center",
//   },
//   reuploadText: { color: "#fff", fontWeight: "700" },
// });
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
} from "react-native";
import { fetchPosterProfile, deleteAddress } from "../api/poster";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PosterProfileView({ navigation, route }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileDetails, setShowProfileDetails] = useState(true);
  const isFocused = useIsFocused();

  // Get email from login for new users
  const emailFromLogin = route?.params?.email || null;

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await fetchPosterProfile();
      console.log("📦 Poster profile API response:", res);

      if (res?.status === "SUCCESS" && res.data) {
        setProfile(res.data);
      } else {
        // API failed -> fallback
        setProfile({
          name: "",
          email: emailFromLogin || "-",
          phone: "",
          bio: "",
          verificationStatus: null,
          isPhoneVerified: null,
          addresses: [],
        });
      }
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
      Alert.alert(
        "Info",
        "Failed to fetch profile. You can create a new profile."
      );
      setProfile({
        name: "",
        email: emailFromLogin || "-",
        phone: "",
        bio: "",
        verificationStatus: null,
        isPhoneVerified: null,
        addresses: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) loadProfile();
  }, [isFocused]);

  const handleDelete = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAddress(id);
              await loadProfile();
            } catch (err) {
              console.error("❌ Error deleting address:", err);
              Alert.alert("Error", "Failed to delete address");
            }
          },
        },
      ]
    );
  };

  const toggleProfileDetails = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowProfileDetails(!showProfileDetails);
  };

  const kycBadge = () => {
    if (profile?.verificationStatus) {
      switch (profile.verificationStatus) {
        case "VERIFIED":
          return (
            <Text style={[styles.badge, { backgroundColor: "#4CAF50" }]}>
              Verified
            </Text>
          );
        case "PENDING":
          return (
            <Text style={[styles.badge, { backgroundColor: "#FF9800" }]}>
              Pending
            </Text>
          );
        case "KYC_REJECTED":
          return (
            <Text style={[styles.badge, { backgroundColor: "#f44336" }]}>
              Rejected
            </Text>
          );
        default:
          return (
            <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>
              -
            </Text>
          );
      }
    } else {
      return (
        <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>-</Text>
      );
    }
  };

  const phoneVerifyBadge = () => {
    if (profile?.isPhoneVerified === true) {
      return (
        <Text style={[styles.badge, { backgroundColor: "#4CAF50" }]}>
          Completed
        </Text>
      );
    } else if (profile?.isPhoneVerified === false) {
      return (
        <Text style={[styles.badge, { backgroundColor: "#FF9800" }]}>
          Pending
        </Text>
      );
    } else {
      return (
        <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>-</Text>
      );
    }
  };

  const displayValue = (value) => (value ? value : "-");

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1877f2" />
      </View>
    );

  // Default placeholder for new users
  if (!profile)
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarContainer}>
          <Text style={styles.welcomeText}>Welcome!</Text>
          <Text style={styles.subText}>
            Complete your profile to get started
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Name</Text>
          <Text style={styles.cardText}>-</Text>

          <Text style={styles.cardTitle}>Email</Text>
          <Text style={styles.cardText}>{emailFromLogin || "-"}</Text>

          <Text style={styles.cardTitle}>Phone</Text>
          <Text style={styles.cardText}>-</Text>

          <Text style={styles.cardTitle}>Phone Verification</Text>
          <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>-</Text>

          <Text style={styles.cardTitle}>KYC Status</Text>
          <Text style={[styles.badge, { backgroundColor: "#9e9e9e" }]}>-</Text>

          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.cardText}>-</Text>
        </View>

        <View style={{ alignItems: "center", marginTop: 20 }}>
          <TouchableOpacity
            style={[styles.addAddressBtn, { backgroundColor: "#1877f2" }]}
            onPress={() => navigation.navigate("PosterProfileEdit")}
          >
            <Text style={styles.addAddressText}>Create Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );

  // Existing users view
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1877f2" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      {/* Collapsible Profile Details */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={toggleProfileDetails}
      >
        <Text style={styles.sectionHeaderText}>Profile Details</Text>
        <Ionicons
          name={showProfileDetails ? "chevron-up" : "chevron-down"}
          size={22}
          color="#1877f2"
        />
      </TouchableOpacity>

      {showProfileDetails && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Name</Text>
          <Text style={styles.cardText}>{displayValue(profile.name)}</Text>

          <Text style={styles.cardTitle}>Email</Text>
          <Text style={styles.cardText}>{displayValue(profile.email)}</Text>

          <Text style={styles.cardTitle}>Phone</Text>
          <Text style={styles.cardText}>{displayValue(profile.phone)}</Text>

          <Text style={styles.cardTitle}>Phone Verification</Text>
          <View style={{ marginTop: 4 }}>{phoneVerifyBadge()}</View>

          <Text style={styles.cardTitle}>KYC Status</Text>
          <View style={{ marginTop: 4 }}>{kycBadge()}</View>

          {profile.verificationStatus === "KYC_REJECTED" && (
            <View style={{ marginTop: 6 }}>
              {profile.kycRejectReason && (
                <Text style={{ color: "#f44336", marginBottom: 4 }}>
                  Reason: {profile.kycRejectReason}
                </Text>
              )}

              {profile.kycDocuments?.length > 0 && (
                <ScrollView horizontal style={{ marginTop: 4 }}>
                  {profile.kycDocuments.map(
                    (doc) =>
                      doc.status === "REJECTED" && (
                        <Image
                          key={doc.id}
                          source={{ uri: doc.downloadUrl }}
                          style={{
                            width: 80,
                            height: 80,
                            marginRight: 6,
                            borderRadius: 6,
                          }}
                          resizeMode="cover"
                        />
                      )
                  )}
                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.reuploadBtn}
                onPress={() =>
                  navigation.navigate("UploadKyc", { userId: profile.userId })
                }
              >
                <Text style={styles.reuploadText}>Re-upload KYC</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* About Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        <Text style={styles.cardText}>{displayValue(profile.bio)}</Text>
      </View>

      {/* Addresses */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Addresses</Text>
        {profile.addresses?.length > 0 ? (
          profile.addresses.map((addr) => (
            <View key={addr.id} style={styles.addressCard}>
              <Text style={styles.cardText}>Label: {addr.label}</Text>
              <Text style={styles.cardText}>Area: {addr.area}</Text>
              <Text style={styles.cardText}>Pin Code: {addr.pinCode}</Text>
              <Text style={styles.cardText}>
                Added On: {new Date(addr.createdAt).toLocaleDateString()}
              </Text>

              <View style={{ flexDirection: "row", marginTop: 6 }}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    navigation.navigate("EditAddress", {
                      address: addr,
                      isEdit: true,
                    })
                  }
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(addr.id)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ color: "#555", marginTop: 8 }}>
            No addresses added.
          </Text>
        )}

        <TouchableOpacity
          style={styles.addAddressBtn}
          onPress={() => navigation.navigate("EditAddress")}
        >
          <Text style={styles.addAddressText}>+ Add New Address</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  container: { padding: 16, paddingBottom: 40, backgroundColor: "#f0f2f5" },
  topHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1877f2",
    marginLeft: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e8f0fe",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  sectionHeaderText: { fontSize: 16, fontWeight: "700", color: "#1877f2" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1877f2",
    marginBottom: 6,
  },
  cardText: { fontSize: 14, color: "#333", marginBottom: 10 },
  badge: {
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  addressCard: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d3d6db",
  },
  editBtn: {
    backgroundColor: "#0b78ff",
    padding: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  editText: { color: "#fff", fontWeight: "600" },
  deleteBtn: { backgroundColor: "#f44336", padding: 6, borderRadius: 6 },
  deleteText: { color: "#fff", fontWeight: "600" },
  addAddressBtn: {
    backgroundColor: "#00b894",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  addAddressText: { color: "#fff", fontWeight: "700" },
  reuploadBtn: {
    backgroundColor: "#f39c12",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: "center",
  },
  reuploadText: { color: "#fff", fontWeight: "700" },
  avatarContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: { fontSize: 20, fontWeight: "700", color: "#333" },
  subText: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 4 },
});

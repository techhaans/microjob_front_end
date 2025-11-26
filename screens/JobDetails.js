// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   Animated,
//   FlatList,
//   Alert,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import * as Location from "expo-location";
// import Slider from "@react-native-community/slider";
// import { useNavigation } from "@react-navigation/native";
// import { useDebouncedCallback } from "use-debounce";
// import {
//   fetchDoerProfile,
//   fetchAvailableJobs,
//   fetchCurrentJobs,
//   fetchJobHistory,
//   acceptJob,
// } from "../api/doer";

// export default function DoerDashboard() {
//   const navigation = useNavigation();
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [currentJobs, setCurrentJobs] = useState([]);
//   const [jobHistory, setJobHistory] = useState([]);
//   const [radius, setRadius] = useState(5);
//   const [location, setLocation] = useState(null);
//   const [acceptingMap, setAcceptingMap] = useState({});
//   const [activeTab, setActiveTab] = useState("current");
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const locationWatcher = useRef(null);

//   const debouncedLoadJobs = useDebouncedCallback(async (rad) => {
//     if (location) await loadAvailableJobs(location, rad);
//   }, 500);

//   useEffect(() => {
//     loadAllData();
//     return () => {
//       if (locationWatcher.current) locationWatcher.current.remove();
//     };
//   }, []);

//   const animateIn = () => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 600,
//       useNativeDriver: true,
//     }).start();
//   };

//   const loadAllData = async () => {
//     setLoading(true);
//     await loadProfile();
//     await getLocationAndJobs();
//     await loadCurrentJobs();
//     await loadJobHistory();
//     setLoading(false);
//     animateIn();
//   };

//   const loadProfile = async () => {
//     try {
//       const stored = await AsyncStorage.getItem("doerProfile");
//       if (stored) setProfile(JSON.parse(stored));
//       else {
//         const res = await fetchDoerProfile();
//         if (res?.data) {
//           setProfile(res.data);
//           await AsyncStorage.setItem("doerProfile", JSON.stringify(res.data));
//         }
//       }
//     } catch (err) {
//       console.warn("Profile Error:", err.message);
//     }
//   };

//   const getLocationAndJobs = async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert("Location Denied", "Enable location to see nearby jobs.");
//         return;
//       }

//       const loc = await Location.getCurrentPositionAsync({});
//       const coords = { lat: loc.coords.latitude, lon: loc.coords.longitude };
//       setLocation(coords);
//       await loadAvailableJobs(coords, radius);

//       locationWatcher.current = await Location.watchPositionAsync(
//         { distanceInterval: 50 },
//         (loc) => {
//           const newCoords = {
//             lat: loc.coords.latitude,
//             lon: loc.coords.longitude,
//           };
//           setLocation(newCoords);
//           debouncedLoadJobs(radius);
//         }
//       );
//     } catch (err) {
//       console.warn("Location Error:", err.message);
//     }
//   };

//   const loadAvailableJobs = async (coords = location, rad = radius) => {
//     if (!coords) return;
//     try {
//       const res = await fetchAvailableJobs(coords.lat, coords.lon, rad);
//       setAvailableJobs(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Available Jobs Error:", err.message);
//       setAvailableJobs([]);
//     }
//   };

//   const loadCurrentJobs = async () => {
//     try {
//       const res = await fetchCurrentJobs();
//       setCurrentJobs(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Current Jobs Error:", err?.message);
//     }
//   };

//   const loadJobHistory = async () => {
//     try {
//       const res = await fetchJobHistory(0, 10, ["updatedAt,desc"]);
//       setJobHistory(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Job History Error:", err?.message);
//     }
//   };

//   const handleAcceptJob = async (jobId) => {
//     try {
//       setAcceptingMap((p) => ({ ...p, [jobId]: true }));
//       const res = await acceptJob(jobId);
//       Alert.alert("Success", res?.message || "Job accepted!");
//       await Promise.all([
//         loadCurrentJobs(),
//         location && loadAvailableJobs(location, radius),
//         loadJobHistory(),
//       ]);
//     } catch (err) {
//       Alert.alert(
//         "Error",
//         err?.response?.data?.message || "Something went wrong"
//       );
//     } finally {
//       setAcceptingMap((p) => ({ ...p, [jobId]: false }));
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.clear();
//       navigation.reset({
//         index: 0,
//         routes: [{ name: "LoginPage" }],
//       });
//     } catch (err) {
//       Alert.alert("Error", "Unable to logout. Try again.");
//     }
//   };

//   const renderJobCard = ({ item, index }) => {
//     const accepting = acceptingMap[item.jobId] || false;
//     const statusColor =
//       item.status === "COMPLETED"
//         ? "#22c55e"
//         : item.status === "ACTIVE"
//         ? "#2563eb"
//         : "#f59e0b";

//     return (
//       <Animated.View
//         key={`${item.jobId}-${index}`}
//         style={[
//           styles.jobCard,
//           {
//             opacity: fadeAnim,
//             transform: [
//               {
//                 translateY: fadeAnim.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [20, 0],
//                 }),
//               },
//             ],
//           },
//         ]}
//       >
//         <View style={styles.cardHeader}>
//           <Text style={styles.title}>{item.title}</Text>
//           <View
//             style={[styles.statusTag, { backgroundColor: statusColor + "22" }]}
//           >
//             <Text style={[styles.statusText, { color: statusColor }]}>
//               {item.status}
//             </Text>
//           </View>
//         </View>
//         <Text style={styles.desc} numberOfLines={2}>
//           {item.description || "No description available"}
//         </Text>
//         {item.amountInRs > 0 && (
//           <View style={styles.metaRow}>
//             <Ionicons name="cash-outline" size={16} color="#475569" />
//             <Text
//               style={[styles.metaText, { fontWeight: "700", color: "#16a34a" }]}
//             >
//               ₹ {item.amountInRs}
//             </Text>
//             {item.distanceKm && (
//               <Text style={[styles.metaText, { marginLeft: 10 }]}>
//                 {item.distanceKm.toFixed(1)} km away
//               </Text>
//             )}
//           </View>
//         )}

//         <View style={{ flexDirection: "row", marginTop: 10 }}>
//           {activeTab === "available" && (
//             <TouchableOpacity
//               style={[styles.acceptBtn, { flex: 1, marginRight: 5 }]}
//               onPress={() => handleAcceptJob(item.jobId)}
//               disabled={accepting}
//             >
//               {accepting ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.acceptText}>Accept Job</Text>
//               )}
//             </TouchableOpacity>
//           )}
//           <TouchableOpacity
//             style={[styles.viewBtn, { flex: 1, marginLeft: 5 }]}
//             onPress={() =>
//               navigation.navigate("JobDetails", { jobId: item.jobId })
//             }
//           >
//             <Text style={styles.viewText}>View Details</Text>
//           </TouchableOpacity>
//         </View>
//       </Animated.View>
//     );
//   };

//   const renderProfileSection = () => {
//     const acceptedCount = currentJobs.length;
//     const completedCount = jobHistory.length;
//     const rating = profile?.rating ?? 4.7;
//     const isNewUser = !profile?.isKycDone && !profile?.isProfileUpdated;

//     return (
//       <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
//         <View
//           style={{
//             backgroundColor: "#2563eb",
//             padding: 20,
//             alignItems: "center",
//           }}
//         >
//           <Text style={{ fontSize: 18, fontWeight: "800", color: "#fff" }}>
//             {profile?.name || "New User"}
//           </Text>
//           <Text style={{ color: "#f3f4f6", marginTop: 4 }}>
//             {profile?.phone || "No phone"}
//           </Text>
//           <Text style={{ color: "#cbd5e1", marginTop: 2 }}>
//             Member since {profile?.createdAt?.slice(0, 10) || "—"}
//           </Text>
//         </View>

//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-around",
//             paddingVertical: 16,
//           }}
//         >
//           <View style={{ alignItems: "center" }}>
//             <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>
//               {acceptedCount}
//             </Text>
//             <Text style={{ color: "#6b7280", fontSize: 12 }}>Active Jobs</Text>
//           </View>
//           <View style={{ alignItems: "center" }}>
//             <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>
//               {completedCount}
//             </Text>
//             <Text style={{ color: "#6b7280", fontSize: 12 }}>Completed</Text>
//           </View>
//           <View style={{ alignItems: "center" }}>
//             <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>
//               {rating.toFixed(1)}
//             </Text>
//             <Text style={{ color: "#6b7280", fontSize: 12 }}>Rating</Text>
//           </View>
//         </View>

//         <Text
//           style={{
//             fontSize: 16,
//             fontWeight: "700",
//             color: "#111827",
//             marginHorizontal: 16,
//             marginTop: 20,
//           }}
//         >
//           My Account
//         </Text>

//         {!isNewUser && (
//           <TouchableOpacity
//             style={styles.profileBtn}
//             onPress={() => navigation.navigate("DoerProfile")}
//           >
//             <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
//             <Text style={styles.profileBtnText}>View Profile</Text>
//           </TouchableOpacity>
//         )}

//         <TouchableOpacity
//           style={styles.profileBtn}
//           onPress={() => navigation.navigate("EditProfile")}
//         >
//           <Ionicons name="create-outline" size={20} color="#2563eb" />
//           <Text style={styles.profileBtnText}>Edit Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.profileBtn,
//             { opacity: profile?.isPhoneVerified ? 1 : 0.5 },
//           ]}
//           disabled={!profile?.isPhoneVerified}
//           onPress={() => {
//             if (!profile?.isPhoneVerified) {
//               Alert.alert("Phone not verified", "Verify your phone first.");
//               return;
//             }
//             navigation.navigate("KYCPage");
//           }}
//         >
//           <Ionicons name="document-text-outline" size={20} color="#2563eb" />
//           <Text style={styles.profileBtnText}>Upload KYC</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.profileBtn, { borderColor: "#ef4444" }]}
//           onPress={handleLogout}
//         >
//           <Ionicons name="log-out-outline" size={20} color="#ef4444" />
//           <Text style={[styles.profileBtnText, { color: "#ef4444" }]}>
//             Logout
//           </Text>
//         </TouchableOpacity>
//       </ScrollView>
//     );
//   };

//   if (loading)
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </SafeAreaView>
//     );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor="#111827" barStyle="light-content" />
//       <View style={styles.topBar}>
//         <Text style={styles.topTitle}>Doer Dashboard</Text>
//         <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
//           <Ionicons name="log-out-outline" size={24} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {activeTab === "profile" && renderProfileSection()}

//       {activeTab === "available" && (
//         <View style={{ flex: 1 }}>
//           <View style={styles.radiusBox}>
//             <Text style={styles.radiusText}>
//               Search Radius: {radius.toFixed(1)} km — {availableJobs.length}{" "}
//               jobs found
//             </Text>

//             <View style={styles.radiusOptions}>
//               {[1, 3, 5, 10, 15].map((r) => (
//                 <TouchableOpacity
//                   key={r}
//                   style={[
//                     styles.radiusBtn,
//                     radius === r && { backgroundColor: "#2563eb" },
//                   ]}
//                   onPress={() => {
//                     setRadius(r);
//                     debouncedLoadJobs(r);
//                   }}
//                 >
//                   <Text style={{ color: radius === r ? "#fff" : "#111827" }}>
//                     {r} km
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <Slider
//               style={{ width: "100%", height: 40 }}
//               minimumValue={1}
//               maximumValue={15}
//               step={0.5}
//               value={radius}
//               onValueChange={(val) => {
//                 setRadius(val);
//                 debouncedLoadJobs(val);
//               }}
//               minimumTrackTintColor="#2563eb"
//               maximumTrackTintColor="#ddd"
//               thumbTintColor="#2563eb"
//             />
//           </View>

//           <FlatList
//             data={availableJobs}
//             keyExtractor={(item) => item.jobId.toString()}
//             renderItem={renderJobCard}
//             contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
//             ListEmptyComponent={
//               <Text style={styles.emptyText}>
//                 No nearby jobs. Try increasing the search radius.
//               </Text>
//             }
//           />
//         </View>
//       )}

//       {activeTab !== "available" && activeTab !== "profile" && (
//         <FlatList
//           data={activeTab === "current" ? currentJobs : jobHistory}
//           keyExtractor={(item) => item.jobId.toString()}
//           renderItem={renderJobCard}
//           contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>
//               {activeTab === "current"
//                 ? "No active jobs."
//                 : "No completed jobs."}
//             </Text>
//           }
//         />
//       )}

//       <View style={styles.bottomNav}>
//         {[
//           { key: "available", icon: "briefcase-outline", label: "Available" },
//           { key: "current", icon: "flash-outline", label: "Active" },
//           { key: "history", icon: "time-outline", label: "History" },
//           { key: "profile", icon: "person-outline", label: "Profile" },
//         ].map((tab) => (
//           <TouchableOpacity
//             key={tab.key}
//             style={styles.navItem}
//             onPress={() => setActiveTab(tab.key)}
//           >
//             <Ionicons
//               name={tab.icon}
//               size={22}
//               color={activeTab === tab.key ? "#2563eb" : "#9ca3af"}
//             />
//             <Text
//               style={[
//                 styles.navLabel,
//                 { color: activeTab === tab.key ? "#2563eb" : "#9ca3af" },
//               ]}
//             >
//               {tab.label}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f9fafb" },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   topBar: {
//     height: 56,
//     backgroundColor: "#111827",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   topTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },
//   logoutBtn: { position: "absolute", right: 16 },
//   radiusBox: {
//     padding: 14,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     marginBottom: 16,
//     elevation: 3,
//   },
//   radiusText: { fontWeight: "700", color: "#111827", marginBottom: 6 },
//   radiusOptions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   radiusBtn: { padding: 6, borderRadius: 6, backgroundColor: "#e5e7eb" },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 14,
//     elevation: 2,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   title: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
//   desc: { color: "#475569", fontSize: 13, marginVertical: 6 },
//   metaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
//   metaText: { marginLeft: 6, color: "#475569", fontSize: 13 },
//   statusTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
//   statusText: { fontSize: 12, fontWeight: "700" },
//   acceptBtn: {
//     backgroundColor: "#2563eb",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   acceptText: { color: "#fff", fontWeight: "800" },
//   viewBtn: {
//     backgroundColor: "#6b7280",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   viewText: { color: "#fff", fontWeight: "700" },
//   emptyText: { textAlign: "center", color: "#6b7280", fontSize: 14 },
//   bottomNav: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     height: 60,
//     borderTopWidth: 1,
//     borderColor: "#e5e7eb",
//     backgroundColor: "#fff",
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//   },
//   navItem: { alignItems: "center", justifyContent: "center" },
//   navLabel: { fontSize: 12, marginTop: 2 },
//   profileBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 14,
//     marginHorizontal: 16,
//     borderBottomWidth: 1,
//     borderColor: "#e5e7eb",
//   },
//   profileBtnText: { marginLeft: 10, color: "#111827", fontSize: 15 },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import * as Location from "expo-location";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { useRoute, useNavigation } from "@react-navigation/native";

// const BASE_URL = "http://192.168.1.40:8080"; // ⚠️ replace with your backend URL

// export default function JobDetails() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { jobId } = route.params;

//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadJobDetails();
//   }, [jobId]);

//   const loadJobDetails = async () => {
//     try {
//       setLoading(true);

//       // ✅ get location if allowed
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       let params = {};
//       if (status === "granted") {
//         const loc = await Location.getCurrentPositionAsync({});
//         params = {
//           lat: loc.coords.latitude,
//           lon: loc.coords.longitude,
//         };
//       }

//       const token = await AsyncStorage.getItem("authToken");
//       const headers = { Authorization: `Bearer ${token}` };

//       const { data } = await axios.get(
//         `${BASE_URL}/api/doer/jobs/${jobId}/details`,
//         { headers, params }
//       );

//       setJob(data?.data || null);
//     } catch (err) {
//       console.error("Job Details Error:", err.message);
//       Alert.alert("Error", "Unable to fetch job details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </View>
//     );

//   if (!job)
//     return (
//       <View style={styles.loader}>
//         <Text style={{ color: "#6b7280" }}>Job not found.</Text>
//       </View>
//     );

//   return (
//     <View style={styles.container}>
//       <View style={styles.topBar}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={{ position: "absolute", left: 16 }}
//         >
//           <Ionicons name="arrow-back-outline" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.topTitle}>Job Details</Text>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <View style={styles.card}>
//           <Text style={styles.title}>{job.title}</Text>
//           <Text style={styles.category}>{job.category || "—"}</Text>

//           <Text style={styles.sectionHeader}>Description</Text>
//           <Text style={styles.description}>
//             {job.description || "No description available"}
//           </Text>

//           {job.amountInRs > 0 && (
//             <>
//               <Text style={styles.sectionHeader}>Total Amount</Text>
//               <Text style={styles.amount}>₹ {job.amountInRs}</Text>
//             </>
//           )}

//           {job.priceItems?.length > 0 && (
//             <>
//               <Text style={styles.sectionHeader}>Price Breakdown</Text>
//               {job.priceItems.map((item) => (
//                 <View key={item.id} style={styles.priceItem}>
//                   <View style={{ flex: 1 }}>
//                     <Text style={styles.priceLabel}>{item.label}</Text>
//                     <Text style={styles.priceDesc}>{item.description}</Text>
//                   </View>
//                   <Text style={styles.priceValue}>₹ {item.priceRupees}</Text>
//                 </View>
//               ))}
//             </>
//           )}

//           <Text style={styles.sectionHeader}>Address</Text>
//           <View style={styles.metaRow}>
//             <Ionicons name="location-outline" size={16} color="#2563eb" />
//             <Text style={styles.metaText}>{job.addressLabel || "—"}</Text>
//           </View>

//           {job.distanceKm && (
//             <Text style={styles.metaSub}>
//               {job.distanceKm.toFixed(1)} km away
//             </Text>
//           )}

//           <Text style={styles.sectionHeader}>Posted By</Text>
//           <View style={styles.metaRow}>
//             <Ionicons name="person-outline" size={16} color="#2563eb" />
//             <Text style={styles.metaText}>{job.posterName || "—"}</Text>
//           </View>

//           <Text style={styles.postedAgo}>Posted {job.postedAgo || "—"}</Text>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f9fafb" },
//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//   },
//   topBar: {
//     height: 56,
//     backgroundColor: "#111827",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   topTitle: {
//     color: "#fff",
//     fontWeight: "800",
//     fontSize: 18,
//   },
//   scrollContainer: { padding: 16, paddingBottom: 60 },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     padding: 16,
//     elevation: 2,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#111827",
//     marginBottom: 4,
//   },
//   category: {
//     color: "#2563eb",
//     fontWeight: "600",
//     marginBottom: 12,
//   },
//   sectionHeader: {
//     marginTop: 12,
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#111827",
//   },
//   description: {
//     color: "#4b5563",
//     fontSize: 14,
//     marginTop: 4,
//     lineHeight: 20,
//   },
//   amount: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#16a34a",
//     marginTop: 4,
//   },
//   priceItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginTop: 8,
//     paddingVertical: 6,
//     borderBottomWidth: 0.5,
//     borderBottomColor: "#e5e7eb",
//   },
//   priceLabel: {
//     fontWeight: "600",
//     color: "#111827",
//   },
//   priceDesc: {
//     fontSize: 12,
//     color: "#6b7280",
//   },
//   priceValue: {
//     fontWeight: "700",
//     color: "#16a34a",
//   },
//   metaRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 6,
//   },
//   metaText: {
//     color: "#111827",
//     marginLeft: 6,
//     fontSize: 14,
//   },
//   metaSub: {
//     color: "#6b7280",
//     fontSize: 13,
//     marginLeft: 22,
//   },
//   postedAgo: {
//     marginTop: 12,
//     fontSize: 13,
//     color: "#6b7280",
//   },
// });
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Button } from "react-native-web";

const BASE_URL = "http://192.168.1.40:8080"; // ⚠️ replace with your backend URL

export default function JobDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { jobId } = route.params;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);

      let params = {};

      // ✅ Try to use stored location for instant speed
      const lastLat = await AsyncStorage.getItem("lastLat");
      const lastLon = await AsyncStorage.getItem("lastLon");

      if (lastLat && lastLon) {
        params = { lat: parseFloat(lastLat), lon: parseFloat(lastLon) };
      } else {
        // fallback: check permission & get fast location
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === "granted") {
          const lastLoc = await Location.getLastKnownPositionAsync({});
          if (lastLoc) {
            params = {
              lat: lastLoc.coords.latitude,
              lon: lastLoc.coords.longitude,
            };
          } else {
            // fallback (rare)
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Lowest,
            });
            params = {
              lat: loc.coords.latitude,
              lon: loc.coords.longitude,
            };
          }
        }
      }

      const token = await AsyncStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };

      const { data } = await axios.get(
        `${BASE_URL}/api/doer/jobs/${jobId}/details`,
        { headers, params }
      );

      setJob(data?.data || null);
    } catch (err) {
      console.error("Job Details Error:", err.message);
      Alert.alert("Error", "Unable to fetch job details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );

  if (!job)
    return (
      <View style={styles.loader}>
        <Text style={{ color: "#6b7280" }}>Job not found.</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ position: "absolute", left: 16 }}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Job Details</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.category}>{job.category || "—"}</Text>

          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.description}>
            {job.description || "No description available"}
          </Text>

          {job.amountInRs > 0 && (
            <>
              <Text style={styles.sectionHeader}>Total Amount</Text>
              <Text style={styles.amount}>₹ {job.amountInRs}</Text>
            </>
          )}

          {job.priceItems?.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Price Breakdown</Text>
              {job.priceItems.map((item) => (
                <View key={item.id} style={styles.priceItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.priceLabel}>{item.label}</Text>
                    <Text style={styles.priceDesc}>{item.description}</Text>
                  </View>
                  <Text style={styles.priceValue}>₹ {item.priceRupees}</Text>
                </View>
              ))}
            </>
          )}

          <Text style={styles.sectionHeader}>Address</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color="#2563eb" />
            <Text style={styles.metaText}>{job.addressLabel || "—"}</Text>
          </View>

          {job.distanceKm && (
            <Text style={styles.metaSub}>
              {job.distanceKm.toFixed(1)} km away
            </Text>
          )}

          <Text style={styles.sectionHeader}>Posted By</Text>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={16} color="#2563eb" />
            <Text style={styles.metaText}>{job.posterName || "—"}</Text>
          </View>

          <Text style={styles.postedAgo}>Posted {job.postedAgo || "—"}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  topBar: {
    height: 56,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  topTitle: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
  scrollContainer: { padding: 16, paddingBottom: 60 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  category: {
    color: "#2563eb",
    fontWeight: "600",
    marginBottom: 12,
  },
  sectionHeader: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  description: {
    color: "#4b5563",
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  amount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#16a34a",
    marginTop: 4,
  },
  priceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 8,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  priceLabel: {
    fontWeight: "600",
    color: "#111827",
  },
  priceDesc: {
    fontSize: 12,
    color: "#6b7280",
  },
  priceValue: {
    fontWeight: "700",
    color: "#16a34a",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  metaText: {
    color: "#111827",
    marginLeft: 6,
    fontSize: 14,
  },
  metaSub: {
    color: "#6b7280",
    fontSize: 13,
    marginLeft: 22,
  },
  postedAgo: {
    marginTop: 12,
    fontSize: 13,
    color: "#6b7280",
  },
});

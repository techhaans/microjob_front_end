// // DoerDashboard.js
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Alert,
//   Animated,
//   SafeAreaView,
//   StatusBar,
//   Dimensions,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import {
//   fetchDoerProfile,
//   fetchAvailableJobs,
//   fetchCurrentJobs,
//   acceptJob,
//   fetchJobHistory,
// } from "../api/doer";

// const { width: SCREEN_WIDTH } = Dimensions.get("window");
// const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.82);
// const CARD_MARGIN = 12;
// const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;

// export default function DoerDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [currentJobs, setCurrentJobs] = useState([]);
//   const [jobHistory, setJobHistory] = useState([]);
//   const [page, setPage] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [jobsLoading, setJobsLoading] = useState(false);
//   const [acceptingMap, setAcceptingMap] = useState({});
//   const [hasPendingJob, setHasPendingJob] = useState(false);

//   // Sidebar animation refs
//   const sidebarAnim = useRef(new Animated.Value(-320)).current; // offscreen left
//   const overlayOpacity = useRef(new Animated.Value(0)).current;
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // Keep polling small to refresh listings
//   useEffect(() => {
//     loadAllData();
//     const interval = setInterval(() => {
//       loadAvailableJobs(false);
//       loadCurrentJobs(false);
//     }, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   // ---------------- Data loaders ----------------
//   const loadAllData = async () => {
//     setLoading(true);
//     await loadProfile();
//     await loadAvailableJobs();
//     await loadCurrentJobs();
//     await loadJobHistory(true);
//     await checkPendingJob();
//     setLoading(false);
//   };

//   const loadProfile = async () => {
//     try {
//       const stored = await AsyncStorage.getItem("doerProfile");
//       if (stored) {
//         setProfile(JSON.parse(stored));
//       } else {
//         const res = await fetchDoerProfile();
//         if (res?.data) {
//           setProfile(res.data);
//           await AsyncStorage.setItem("doerProfile", JSON.stringify(res.data));
//         } else {
//           Alert.alert("Profile Missing", "Please complete your profile.");
//           navigation.reset({ index: 0, routes: [{ name: "EditProfile" }] });
//         }
//       }
//     } catch (err) {
//       console.warn("Profile Load Error:", err?.message || err);
//       setProfile(null);
//     }
//   };

//   const loadAvailableJobs = async (showSpinner = true) => {
//     try {
//       if (showSpinner) setJobsLoading(true);
//       const res = await fetchAvailableJobs();
//       setAvailableJobs(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Fetch Available Jobs Error:", err?.message || err);
//       setAvailableJobs([]);
//     } finally {
//       if (showSpinner) setJobsLoading(false);
//     }
//   };

//   const loadCurrentJobs = async (showSpinner = true) => {
//     try {
//       if (showSpinner) setJobsLoading(true);
//       const res = await fetchCurrentJobs();
//       setCurrentJobs(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Fetch Current Jobs Error:", err?.message || err);
//       setCurrentJobs([]);
//     } finally {
//       if (showSpinner) setJobsLoading(false);
//     }
//   };

//   const loadJobHistory = async (reset = false) => {
//     try {
//       const nextPage = reset ? 0 : page;
//       const res = await fetchJobHistory(nextPage, 5, ["updatedAt,desc"]);
//       if (res?.data?.data?.content) {
//         const newJobs = res.data.data.content;
//         setJobHistory((prev) => (reset ? newJobs : [...prev, ...newJobs]));
//         setHasMore(!res.data.data.last);
//         setPage(nextPage + 1);
//       }
//     } catch (err) {
//       console.warn("Fetch Job History Error:", err?.message || err);
//     }
//   };

//   const checkPendingJob = async () => {
//     try {
//       const res = await fetchCurrentJobs();
//       const pending = res?.data?.content?.some(
//         (job) => job.status === "ACCEPTED" || job.status === "IN_PROGRESS"
//       );
//       setHasPendingJob(!!pending);
//     } catch (err) {
//       console.warn("Pending Job Check Error:", err?.message || err);
//       setHasPendingJob(false);
//     }
//   };

//   // ----------------- Accept job -----------------
//   const handleAcceptJob = async (jobId) => {
//     if (hasPendingJob) {
//       Alert.alert(
//         "Already Working on a Job",
//         "Please complete your current job first."
//       );
//       return;
//     }
//     try {
//       setAcceptingMap((prev) => ({ ...prev, [jobId]: true }));
//       const res = await acceptJob(jobId);
//       if (res?.status === "SUCCESS") {
//         Alert.alert("Success", res.message || "Job accepted!");
//         await Promise.all([
//           loadCurrentJobs(),
//           loadAvailableJobs(),
//           loadJobHistory(true),
//           checkPendingJob(),
//         ]);
//       } else {
//         Alert.alert("Failed", res?.message || "Could not accept job");
//       }
//     } catch (err) {
//       Alert.alert(
//         "Error",
//         err?.response?.data?.message || err?.message || "Network error"
//       );
//     } finally {
//       setAcceptingMap((prev) => ({ ...prev, [jobId]: false }));
//     }
//   };

//   // ----------------- Logout -----------------
//   const handleLogout = async () => {
//     await AsyncStorage.multiRemove(["authToken", "doerProfile"]);
//     navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//   };

//   // ----------------- Sidebar controls -----------------
//   const openSidebar = () => {
//     setSidebarOpen(true);
//     Animated.parallel([
//       Animated.timing(sidebarAnim, {
//         toValue: 0,
//         duration: 280,
//         useNativeDriver: true,
//       }),
//       Animated.timing(overlayOpacity, {
//         toValue: 0.45,
//         duration: 280,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const closeSidebar = () => {
//     Animated.parallel([
//       Animated.timing(sidebarAnim, {
//         toValue: -320,
//         duration: 220,
//         useNativeDriver: true,
//       }),
//       Animated.timing(overlayOpacity, {
//         toValue: 0,
//         duration: 220,
//         useNativeDriver: true,
//       }),
//     ]).start(() => setSidebarOpen(false));
//   };

//   // ----------------- helpers -----------------
//   const formatPrice = (item) => {
//     if (item.amountInRs != null) return item.amountInRs;
//     if (item.amountPaise != null) return item.amountPaise / 100;
//     return 0;
//   };

//   // ---------- Render job cards (available) ----------
//   const renderJob = ({ item }) => {
//     const accepting = acceptingMap[item.jobId] || false;
//     return (
//       <View style={styles.jobCard}>
//         <View style={styles.jobRow}>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.jobTitle} numberOfLines={2}>
//               {item.title}
//             </Text>
//             {item.description ? (
//               <Text style={styles.jobMeta} numberOfLines={2}>
//                 📝 {item.description}
//               </Text>
//             ) : null}
//             <View style={{ flexDirection: "row", marginTop: 8 }}>
//               <View style={styles.badge}>
//                 <Text style={styles.badgeText}>
//                   {item.skillCategory || item.category || "General"}
//                 </Text>
//               </View>
//               <Text style={[styles.jobMeta, { marginLeft: 10 }]}>
//                 {item.postedAgo || ""}
//               </Text>
//             </View>
//           </View>

//           <View style={{ alignItems: "flex-end", marginLeft: 12 }}>
//             <Text style={styles.price}>₹{formatPrice(item)}</Text>
//             <Text style={styles.posterText}>
//               {item.posterName || item.postedByName || "Admin"}
//             </Text>
//           </View>
//         </View>

//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             marginTop: 12,
//             alignItems: "center",
//           }}
//         >
//           <Text style={styles.locationText}>
//             📍 {item.locationArea || "N/A"}
//           </Text>

//           <TouchableOpacity
//             style={[
//               styles.acceptBtn,
//               (hasPendingJob || accepting) && { backgroundColor: "#9ca3af" },
//             ]}
//             disabled={hasPendingJob || accepting}
//             onPress={() => handleAcceptJob(item.jobId)}
//           >
//             {accepting ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.acceptText}>
//                 {hasPendingJob ? "Complete Current" : "Accept"}
//               </Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   // ---------- Render current job card for carousel ----------
//   const renderCurrentJob = ({ item }) => {
//     const date = item.updatedAt?.split("T")[0] || "N/A";
//     return (
//       <View
//         style={[
//           styles.currentJobCard,
//           { width: CARD_WIDTH, marginRight: CARD_MARGIN },
//         ]}
//       >
//         <Text style={styles.jobTitle} numberOfLines={2}>
//           {item.title}
//         </Text>
//         {item.description ? (
//           <Text style={styles.jobMeta} numberOfLines={2}>
//             {item.description}
//           </Text>
//         ) : null}
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             marginTop: 10,
//           }}
//         >
//           <Text style={styles.jobMeta}>
//             📂 {item.category || item.skillCategory || "N/A"}
//           </Text>
//           <Text style={styles.jobMeta}>📅 {date}</Text>
//         </View>
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             marginTop: 12,
//             alignItems: "center",
//           }}
//         >
//           <Text style={[styles.statusText, { fontSize: 13 }]}>
//             Status: {item.status}
//           </Text>
//           <Text style={styles.price}>₹{formatPrice(item)}</Text>
//         </View>
//       </View>
//     );
//   };

//   // ---------- Render history ----------
//   const renderHistory = ({ item }) => {
//     const date = item.updatedAt?.split("T")[0] || "N/A";
//     return (
//       <View style={styles.historyCard}>
//         <Text style={styles.jobTitle}>{item.title}</Text>
//         {item.description ? (
//           <Text style={styles.jobMeta}>{item.description}</Text>
//         ) : null}
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             marginTop: 8,
//           }}
//         >
//           <Text style={styles.jobMeta}>
//             📂 {item.category || item.skillCategory || "N/A"}
//           </Text>
//           <Text style={styles.jobMeta}>📅 {date}</Text>
//         </View>
//         <Text
//           style={[
//             styles.statusText,
//             {
//               marginTop: 8,
//               color: item.status === "COMPLETED" ? "green" : "#f59e0b",
//             },
//           ]}
//         >
//           Status: {item.status}
//         </Text>
//         <Text style={[styles.price, { marginTop: 8 }]}>
//           ₹{formatPrice(item)}
//         </Text>
//       </View>
//     );
//   };

//   // ---------------- render ----------------
//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#111827" />

//       {/* Top bar: only menu + title (NO back arrow, NO logout) */}
//       <View style={styles.topBar}>
//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <TouchableOpacity onPress={openSidebar} style={styles.iconBtn}>
//             <Ionicons name="menu" size={22} color="#fff" />
//           </TouchableOpacity>
//           <Text style={styles.topTitle}>Doer Dashboard</Text>
//         </View>
//         <View />
//         {/* placeholder - keeps title centered */}
//       </View>

//       {/* Main list */}
//       <FlatList
//         data={availableJobs}
//         keyExtractor={(item) => `avail-${item.jobId}`}
//         renderItem={renderJob}
//         onRefresh={loadAllData}
//         refreshing={jobsLoading}
//         contentContainerStyle={styles.contentContainer}
//         ListHeaderComponent={
//           <>
//             <Text style={styles.header}>
//               Welcome{profile?.name ? `, ${profile.name}` : ""} 👋
//             </Text>

//             <View style={styles.profileCard}>
//               <View style={styles.profileRow}>
//                 <Text style={styles.label}>📞 Phone Verified</Text>
//                 <Text
//                   style={[
//                     styles.value,
//                     { color: profile?.isPhoneVerified ? "green" : "red" },
//                   ]}
//                 >
//                   {profile?.isPhoneVerified ? "Yes" : "No"}
//                 </Text>
//               </View>

//               <View style={styles.profileRow}>
//                 <Text style={styles.label}>🪪 KYC Level</Text>
//                 <Text style={styles.value}>{profile?.kycLevel ?? 0}</Text>
//               </View>

//               <View style={styles.profileRow}>
//                 <Text style={styles.label}>📋 Verification Status</Text>
//                 <Text style={styles.value}>
//                   {profile?.verificationStatus || "Unknown"}
//                 </Text>
//               </View>

//               <View style={styles.profileRow}>
//                 <Text style={styles.label}>✅ Profile Verified</Text>
//                 <Text
//                   style={[
//                     styles.value,
//                     { color: profile?.isVerified ? "green" : "orange" },
//                   ]}
//                 >
//                   {profile?.isVerified ? "Yes" : "No"}
//                 </Text>
//               </View>
//             </View>

//             <Text style={styles.sectionHeader}>📋 Available Jobs</Text>
//             {availableJobs.length === 0 && !jobsLoading && (
//               <View style={styles.emptyBox}>
//                 <Text style={styles.emptyText}>
//                   No available jobs right now.
//                 </Text>
//               </View>
//             )}
//           </>
//         }
//         ListFooterComponent={
//           <>
//             <Text style={styles.sectionHeader}>📌 Current Jobs</Text>

//             {/* Swipeable carousel for Current Jobs */}
//             {currentJobs.length === 0 ? (
//               <Text style={styles.emptyText}>No current jobs.</Text>
//             ) : (
//               <FlatList
//                 data={currentJobs}
//                 keyExtractor={(item) => `curr-${item.jobId}`}
//                 renderItem={renderCurrentJob}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 pagingEnabled={false}
//                 snapToInterval={SNAP_INTERVAL}
//                 decelerationRate="fast"
//                 contentContainerStyle={{ paddingLeft: 16, paddingVertical: 8 }}
//                 snapToAlignment="start"
//               />
//             )}

//             <Text style={styles.sectionHeader}>📜 Job History</Text>
//             {jobHistory.length === 0 ? (
//               <Text style={styles.emptyText}>No past jobs yet.</Text>
//             ) : (
//               <FlatList
//                 data={jobHistory}
//                 renderItem={renderHistory}
//                 keyExtractor={(item) => `hist-${item.jobId}`}
//                 onEndReached={() => hasMore && loadJobHistory()}
//                 onEndReachedThreshold={0.5}
//               />
//             )}
//           </>
//         }
//       />

//       {/* Overlay (dim) */}
//       {sidebarOpen && (
//         <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
//           <TouchableOpacity
//             style={{ flex: 1 }}
//             activeOpacity={1}
//             onPress={closeSidebar}
//           />
//         </Animated.View>
//       )}

//       {/* Animated Sidebar (narrower, rounded right edge) */}
//       <Animated.View
//         style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}
//       >
//         <View style={styles.sidebarHeader}>
//           <Text style={styles.sidebarTitle}>Menu</Text>
//           <TouchableOpacity onPress={closeSidebar}>
//             <Ionicons name="close" size={22} color="#111827" />
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("DoerDashboard");
//           }}
//         >
//           <Ionicons name="home-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Dashboard</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("DoerProfile");
//           }}
//         >
//           <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>View Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("EditProfile");
//           }}
//         >
//           <Ionicons name="create-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Edit Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.menuItem,
//             !profile?.isPhoneVerified && { opacity: 0.5 },
//           ]}
//           disabled={!profile?.isPhoneVerified}
//           onPress={() => {
//             if (!profile?.isPhoneVerified) {
//               Alert.alert("Phone not verified", "Verify your phone first.");
//               return;
//             }
//             closeSidebar();
//             navigation.navigate("KYCPage");
//           }}
//         >
//           <Ionicons name="document-text-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Upload KYC</Text>
//         </TouchableOpacity>

//         <View style={{ flex: 1 }} />

//         <TouchableOpacity
//           style={[styles.menuItem, { marginBottom: 22 }]}
//           onPress={() => {
//             closeSidebar();
//             handleLogout();
//           }}
//         >
//           <Ionicons name="log-out-outline" size={20} color="#ef4444" />
//           <Text style={[styles.menuText, { color: "#ef4444" }]}>Logout</Text>
//         </TouchableOpacity>
//       </Animated.View>
//     </SafeAreaView>
//   );
// }

// // ------------------ styles ------------------
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8fafc" },

//   // Top bar
//   topBar: {
//     height: 56,
//     backgroundColor: "#111827",
//     paddingHorizontal: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   iconBtn: { padding: 6, marginRight: 6 },
//   topTitle: { color: "#fff", fontWeight: "800", fontSize: 18, marginLeft: 8 },

//   // Content
//   contentContainer: { padding: 16, paddingBottom: 100 },
//   header: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 10,
//     color: "#0f172a",
//   },

//   // Profile
//   profileCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     elevation: 2,
//   },
//   profileRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 6,
//   },
//   label: { fontSize: 14, color: "#4b5563" },
//   value: { fontSize: 14, fontWeight: "800" },

//   sectionHeader: {
//     fontSize: 16,
//     fontWeight: "800",
//     marginVertical: 10,
//     color: "#2563eb",
//   },

//   // Job card
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#e6eef9",
//     elevation: 1,
//   },
//   jobRow: { flexDirection: "row", alignItems: "flex-start" },
//   jobTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
//   jobMeta: { fontSize: 13, color: "#475569", marginTop: 6 },
//   badge: {
//     backgroundColor: "#eef2ff",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 8,
//   },
//   badgeText: { color: "#3730a3", fontWeight: "700", fontSize: 12 },
//   price: { fontWeight: "900", color: "#0f172a", fontSize: 16 },
//   posterText: { color: "#475569", fontSize: 12, marginTop: 6 },
//   locationText: { color: "#475569", fontSize: 13 },

//   acceptBtn: {
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 8,
//     backgroundColor: "#2563eb",
//   },
//   acceptText: { color: "#fff", fontWeight: "800" },

//   // Current jobs (carousel)
//   currentJobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//   },

//   // History
//   historyCard: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#eef2ff",
//   },

//   statusText: { color: "#374151", fontWeight: "700" },
//   emptyText: { textAlign: "center", color: "#6b7280", paddingVertical: 10 },
//   emptyBox: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//   },

//   // overlay + sidebar
//   overlay: {
//     position: "absolute",
//     left: 0,
//     top: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "#000",
//   },

//   sidebar: {
//     position: "absolute",
//     left: 0,
//     top: 0,
//     bottom: 0,
//     width: 180,
//     backgroundColor: "#fff",
//     paddingTop: 34,
//     paddingHorizontal: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.18,
//     elevation: 8,
//     borderTopRightRadius: 18,
//     borderBottomRightRadius: 18,
//     zIndex: 50,
//   },
//   sidebarHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 14,
//   },
//   sidebarTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
//   menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
//   menuText: {
//     marginLeft: 12,
//     fontSize: 16,
//     color: "#111827",
//     fontWeight: "700",
//   },

//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
// });
//corret code  Avobee
// // DoerDashboard.js
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Alert,
//   Animated,
//   SafeAreaView,
//   StatusBar,
//   Dimensions,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Location from "expo-location";
// import { Ionicons } from "@expo/vector-icons";
// import {
//   fetchDoerProfile,
//   fetchAvailableJobs,
//   fetchCurrentJobs,
//   acceptJob,
//   fetchJobHistory,
// } from "../api/doer";

// const { width: SCREEN_WIDTH } = Dimensions.get("window");
// const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.94);

// export default function DoerDashboard({ navigation }) {
//   // data
//   const [profile, setProfile] = useState(null);
//   const [location, setLocation] = useState(null); // { latitude, longitude }
//   const [radiusKm, setRadiusKm] = useState(5); // km, user-adjustable
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [currentJobs, setCurrentJobs] = useState([]);
//   const [jobHistory, setJobHistory] = useState([]);

//   // loading states
//   const [loading, setLoading] = useState(true);
//   const [jobsLoading, setJobsLoading] = useState(false);
//   const [acceptingMap, setAcceptingMap] = useState({}); // jobId -> bool

//   // sidebar animation (kept from your original)
//   const sidebarAnim = useRef(new Animated.Value(-320)).current;
//   const overlayOpacity = useRef(new Animated.Value(0)).current;
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // Polling ref
//   const pollRef = useRef(null);

//   // mount
//   useEffect(() => {
//     init();
//     return cleanup;
//   }, []);

//   // whenever location or radius changes, reload available jobs
//   useEffect(() => {
//     if (location) {
//       loadAvailableJobs(location.latitude, location.longitude, radiusKm);
//     }
//   }, [location, radiusKm]);

//   const init = async () => {
//     setLoading(true);
//     await loadProfile();
//     await requestAndSetLocation();
//     await loadCurrentJobs();
//     await loadJobHistory(true);

//     // start polling location + jobs every 10s
//     pollRef.current = setInterval(async () => {
//       await requestAndSetLocation({ silent: true });
//       // refresh jobs only (will be triggered by location change effect, but ensure fallback)
//       if (location) {
//         await loadAvailableJobs(
//           location.latitude,
//           location.longitude,
//           radiusKm,
//           false
//         );
//         await loadCurrentJobs(false);
//       }
//     }, 10000);

//     setLoading(false);
//   };

//   const cleanup = () => {
//     if (pollRef.current) clearInterval(pollRef.current);
//   };

//   // ----------------- profile -----------------
//   const loadProfile = async () => {
//     try {
//       const stored = await AsyncStorage.getItem("doerProfile");
//       if (stored) {
//         setProfile(JSON.parse(stored));
//       } else {
//         const res = await fetchDoerProfile();
//         if (res?.data) {
//           setProfile(res.data);
//           await AsyncStorage.setItem("doerProfile", JSON.stringify(res.data));
//         }
//       }
//     } catch (err) {
//       console.warn("Profile Load Error:", err?.message || err);
//     }
//   };

//   // ----------------- location -----------------
//   const requestAndSetLocation = async ({ silent = false } = {}) => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         if (!silent) {
//           Alert.alert(
//             "Location Permission",
//             "Location permission is required to show nearby jobs."
//           );
//         }
//         return;
//       }
//       const pos = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Highest,
//       });
//       const coords = {
//         latitude: pos.coords.latitude,
//         longitude: pos.coords.longitude,
//       };
//       setLocation(coords);
//       return coords;
//     } catch (err) {
//       if (!silent) {
//         Alert.alert(
//           "Location Error",
//           err?.message || "Unable to get location."
//         );
//       }
//       console.warn("Location Error:", err);
//     }
//   };

//   // ----------------- fetch available jobs -----------------
//   // lat/lon in degrees, radiusKm in KM -> convert to meters for backend param if it expects meters
//   const loadAvailableJobs = async (
//     lat,
//     lon,
//     radiusKmLocal = radiusKm,
//     showSpinner = true
//   ) => {
//     try {
//       if (!lat || !lon) return;
//       if (showSpinner) setJobsLoading(true);

//       // backend fetch: your fetchAvailableJobs expects lat, lon, radius (you set default meters earlier)
//       // convert km -> meters (assuming backend expects meters)
//       const radiusMeters = Math.round(radiusKmLocal * 1000);

//       const res = await fetchAvailableJobs(lat, lon, radiusMeters, 0, 50, [
//         "createdAt,desc",
//       ]);
//       // your API returns structure in res.data.data.content or res.data.data? In your api helper you return axios.data
//       // We defensively try both locations from earlier messages.
//       const list =
//         res?.data?.content ||
//         res?.data ||
//         res?.content ||
//         res?.data?.data?.content ||
//         [];

//       // Normalize fields and sort by newest (createdAt or postedAgo fallback)
//       const normalized = (Array.isArray(list) ? list : []).map((j) => {
//         return {
//           ...j,
//           distanceValue:
//             j.Distance ??
//             j.distance ??
//             j.distanceInKm ??
//             j.distanceMeters ??
//             null,
//           postedAt: j.createdAt ?? j.postedAt ?? null,
//         };
//       });

//       // sort by createdAt (desc) if available, else fallback to postedAgo not easily sortable string
//       normalized.sort((a, b) => {
//         if (a.postedAt && b.postedAt)
//           return new Date(b.postedAt) - new Date(a.postedAt);
//         // if Distance present, sort by near -> far
//         if (a.distanceValue != null && b.distanceValue != null)
//           return a.distanceValue - b.distanceValue;
//         return 0;
//       });

//       setAvailableJobs(normalized);
//     } catch (err) {
//       console.warn(
//         "Fetch Available Jobs Error:",
//         err?.response?.data || err?.message || err
//       );
//       // if session expired
//       if (err?.response?.status === 403) {
//         Alert.alert("Session Expired", "Please login again.", [
//           {
//             text: "OK",
//             onPress: () =>
//               navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] }),
//           },
//         ]);
//       }
//       setAvailableJobs([]);
//     } finally {
//       if (showSpinner) setJobsLoading(false);
//     }
//   };

//   // ----------------- current jobs -----------------
//   const loadCurrentJobs = async (showSpinner = true) => {
//     try {
//       if (showSpinner) setJobsLoading(true);
//       const res = await fetchCurrentJobs();
//       const list = res?.data?.content || res?.data || [];
//       // sort by most recent updatedAt first
//       const sorted = Array.isArray(list)
//         ? list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
//         : [];
//       setCurrentJobs(sorted);
//     } catch (err) {
//       console.warn(
//         "Fetch Current Jobs Error:",
//         err?.response?.data || err?.message || err
//       );
//       setCurrentJobs([]);
//     } finally {
//       if (showSpinner) setJobsLoading(false);
//     }
//   };

//   // ----------------- job history -----------------
//   const loadJobHistory = async (reset = false) => {
//     try {
//       const res = await fetchJobHistory(0, 50, ["updatedAt,desc"]);
//       const list =
//         res?.data?.data?.content || res?.data?.content || res?.data || [];
//       const sorted = Array.isArray(list)
//         ? list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
//         : [];
//       setJobHistory(sorted);
//     } catch (err) {
//       console.warn(
//         "Fetch Job History Error:",
//         err?.response?.data || err?.message || err
//       );
//       setJobHistory([]);
//     }
//   };

//   // ----------------- accept job -----------------
//   const onAcceptJob = async (jobId) => {
//     try {
//       setAcceptingMap((p) => ({ ...p, [jobId]: true }));
//       const res = await acceptJob(jobId);
//       // check for your ApiResponse structure
//       if (
//         res?.status === "SUCCESS" ||
//         res?.message === "Job accepted successfully" ||
//         res?.data === "ACCEPTED"
//       ) {
//         Alert.alert("Accepted", "Job accepted successfully.");
//       } else if (res?.message) {
//         // backend might return message
//         Alert.alert("Result", String(res.message));
//       } else {
//         Alert.alert("Accepted", "Job accepted (response received).");
//       }
//       // refresh lists
//       await Promise.all([
//         loadCurrentJobs(false),
//         requestAndSetLocation({ silent: true }),
//         loadAvailableJobs(
//           location?.latitude,
//           location?.longitude,
//           radiusKm,
//           false
//         ),
//         loadJobHistory(false),
//       ]);
//     } catch (err) {
//       console.warn(
//         "Accept Job Error:",
//         err?.response?.data || err?.message || err
//       );
//       Alert.alert(
//         "Accept Error",
//         err?.response?.data?.message || err?.message || "Failed to accept job"
//       );
//     } finally {
//       setAcceptingMap((p) => ({ ...p, [jobId]: false }));
//     }
//   };

//   // ----------------- UI helpers -----------------
//   const increaseRadius = () => setRadiusKm((r) => Math.min(50, r + 1));
//   const decreaseRadius = () => setRadiusKm((r) => Math.max(1, r - 1));

//   // ---------- Render helpers ----------
//   const renderProfileCard = () => (
//     <View style={styles.profileCard}>
//       <Text style={styles.welcomeText}>
//         Welcome{profile?.name ? `, ${profile.name}` : ""} 👋
//       </Text>
//       <View style={styles.profileGrid}>
//         <View style={styles.profileRow}>
//           <View>
//             <Text style={styles.smallLabel}>📞 Phone Verified</Text>
//             <Text
//               style={[
//                 styles.smallValue,
//                 { color: profile?.isPhoneVerified ? "green" : "red" },
//               ]}
//             >
//               {profile?.isPhoneVerified ? "Yes" : "No"}
//             </Text>
//           </View>
//           <View>
//             <Text style={styles.smallLabel}>🪪 KYC Level</Text>
//             <Text style={styles.smallValue}>{profile?.kycLevel ?? "-"}</Text>
//           </View>
//         </View>

//         <View style={styles.profileRow}>
//           <View>
//             <Text style={styles.smallLabel}>📋 Verification Status</Text>
//             <Text style={styles.smallValue}>
//               {profile?.verificationStatus ?? "Unknown"}
//             </Text>
//           </View>
//           <View>
//             <Text style={styles.smallLabel}>✅ Profile Verified</Text>
//             <Text
//               style={[
//                 styles.smallValue,
//                 { color: profile?.isVerified ? "green" : "orange" },
//               ]}
//             >
//               {profile?.isVerified ? "Yes" : "No"}
//             </Text>
//           </View>
//         </View>
//       </View>
//     </View>
//   );

//   const renderJobCard = ({ item }) => {
//     const accepting = !!acceptingMap[item.jobId];
//     const amount =
//       item.amountInRs ?? item.amountPaise ? item.amountPaise / 100 : null;
//     const displayAmount =
//       amount != null
//         ? `₹${amount}`
//         : item.amountInRs
//         ? `₹${item.amountInRs}`
//         : "—";
//     const poster = item.posterName || item.postedByName || "Admin";
//     const category = item.skillCategory || item.category || "General";
//     const postedAgo = item.postedAgo || item.postedAt || item.createdAt || "";
//     const locationArea =
//       item.locationArea || item.address || item.location || "N/A";
//     const distanceText =
//       item.distanceValue != null
//         ? Number(item.distanceValue) > 1000
//           ? `${(Number(item.distanceValue) / 1000).toFixed(2)} km`
//           : `${Math.round(Number(item.distanceValue))} m`
//         : "";

//     return (
//       <View style={styles.jobCard}>
//         <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
//           <View style={{ flex: 1, paddingRight: 8 }}>
//             <Text style={styles.jobTitle} numberOfLines={2}>
//               {item.title}
//             </Text>
//             {item.description ? (
//               <Text style={styles.jobDesc} numberOfLines={2}>
//                 {item.description}
//               </Text>
//             ) : null}
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 marginTop: 8,
//               }}
//             >
//               <View style={styles.badge}>
//                 <Text style={styles.badgeText}>{category}</Text>
//               </View>
//               <Text style={styles.postedAgo}>{postedAgo}</Text>
//             </View>
//             <Text style={styles.locationText}>
//               📍 {locationArea} {distanceText ? ` • ${distanceText}` : ""}
//             </Text>
//           </View>

//           <View
//             style={{ alignItems: "flex-end", justifyContent: "space-between" }}
//           >
//             <Text style={styles.amountText}>{displayAmount}</Text>
//             <Text style={styles.posterText}>{poster}</Text>
//           </View>
//         </View>

//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "flex-end",
//             marginTop: 12,
//           }}
//         >
//           <TouchableOpacity
//             style={[styles.acceptBtn, accepting && { opacity: 0.8 }]}
//             onPress={() => onAcceptJob(item.jobId)}
//             disabled={accepting}
//           >
//             {accepting ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.acceptText}>Accept</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   // ----------------- main render -----------------
//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
//       {/* Top Bar */}
//       <View style={styles.topBar}>
//         <TouchableOpacity
//           onPress={() => {
//             setSidebarOpen(true);
//             Animated.parallel([
//               Animated.timing(sidebarAnim, {
//                 toValue: 0,
//                 duration: 260,
//                 useNativeDriver: true,
//               }),
//               Animated.timing(overlayOpacity, {
//                 toValue: 0.45,
//                 duration: 260,
//                 useNativeDriver: true,
//               }),
//             ]).start();
//           }}
//           style={styles.iconBtn}
//         >
//           <Ionicons name="menu" size={22} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.topTitle}>Doer Dashboard</Text>
//         <TouchableOpacity
//           onPress={() => {
//             requestAndSetLocation();
//           }}
//           style={styles.iconBtn}
//         >
//           <Ionicons name="md-locate" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 14 }}>
//         {/* welcome + profile */}
//         {renderProfileCard()}

//         {/* radius control */}
//         <View style={styles.radiusRow}>
//           <Text style={styles.radiusLabel}>📏 Search Radius</Text>
//           <View style={styles.radiusControl}>
//             <TouchableOpacity style={styles.radiusBtn} onPress={decreaseRadius}>
//               <Text style={styles.radiusBtnText}>−</Text>
//             </TouchableOpacity>
//             <Text style={styles.radiusValue}>{radiusKm} km</Text>
//             <TouchableOpacity style={styles.radiusBtn} onPress={increaseRadius}>
//               <Text style={styles.radiusBtnText}>+</Text>
//             </TouchableOpacity>
//           </View>
//           {location && (
//             <Text style={styles.locSmall}>
//               Lat: {location.latitude.toFixed(3)} | Lon:{" "}
//               {location.longitude.toFixed(3)}
//             </Text>
//           )}
//         </View>

//         {/* Available jobs */}
//         <View style={styles.sectionHeaderRow}>
//           <Text style={styles.sectionHeader}>📋 Available Jobs</Text>
//         </View>

//         {jobsLoading && (
//           <ActivityIndicator style={{ marginVertical: 8 }} color="#2563eb" />
//         )}

//         {availableJobs.length === 0 && !jobsLoading ? (
//           <View style={styles.emptyBox}>
//             <Text style={styles.emptyText}>
//               No available jobs in this area.
//             </Text>
//           </View>
//         ) : (
//           <FlatList
//             data={availableJobs}
//             keyExtractor={(i) => `avail-${i.jobId}`}
//             renderItem={renderJobCard}
//             scrollEnabled={false} // disable inner scroll, outer scrollView handles it
//             ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
//           />
//         )}

//         {/* Current jobs */}
//         <Text style={[styles.sectionHeader, { marginTop: 20 }]}>
//           📌 Current Jobs
//         </Text>
//         {currentJobs.length === 0 ? (
//           <Text style={styles.emptyText}>No current jobs.</Text>
//         ) : (
//           currentJobs.map((j) => (
//             <View key={j.jobId} style={styles.smallRow}>
//               <Text style={{ flex: 1 }}>
//                 {j.title} <Text style={{ color: "#6b7280" }}>({j.status})</Text>
//               </Text>
//               <Text style={{ fontWeight: "700" }}>
//                 {j.amountInRs ?? (j.amountPaise ? j.amountPaise / 100 : "")}
//               </Text>
//             </View>
//           ))
//         )}

//         {/* Job history */}
//         <Text style={[styles.sectionHeader, { marginTop: 20 }]}>
//           📜 Job History
//         </Text>
//         {jobHistory.length === 0 ? (
//           <Text style={styles.emptyText}>No past jobs yet.</Text>
//         ) : (
//           jobHistory.map((j) => (
//             <View key={j.jobId} style={styles.smallRow}>
//               <Text style={{ flex: 1 }}>{j.title}</Text>
//               <Text
//                 style={{
//                   color: j.status === "COMPLETED" ? "green" : "#f59e0b",
//                   fontWeight: "700",
//                 }}
//               >
//                 {j.status}
//               </Text>
//             </View>
//           ))
//         )}

//         <View style={{ height: 80 }} />
//       </ScrollView>

//       {/* Overlay and Sidebar (simple) */}
//       {sidebarOpen && (
//         <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
//           <TouchableOpacity
//             style={{ flex: 1 }}
//             activeOpacity={1}
//             onPress={() => {
//               Animated.parallel([
//                 Animated.timing(sidebarAnim, {
//                   toValue: -320,
//                   duration: 220,
//                   useNativeDriver: true,
//                 }),
//                 Animated.timing(overlayOpacity, {
//                   toValue: 0,
//                   duration: 220,
//                   useNativeDriver: true,
//                 }),
//               ]).start(() => setSidebarOpen(false));
//             }}
//           />
//         </Animated.View>
//       )}

//       <Animated.View
//         style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}
//       >
//         <View style={styles.sidebarHeader}>
//           <Text style={styles.sidebarTitle}>Menu</Text>
//           <TouchableOpacity
//             onPress={() => {
//               Animated.parallel([
//                 Animated.timing(sidebarAnim, {
//                   toValue: -320,
//                   duration: 220,
//                   useNativeDriver: true,
//                 }),
//                 Animated.timing(overlayOpacity, {
//                   toValue: 0,
//                   duration: 220,
//                   useNativeDriver: true,
//                 }),
//               ]).start(() => setSidebarOpen(false));
//             }}
//           >
//             <Ionicons name="close" size={22} color="#111827" />
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => navigation.navigate("DoerProfile")}
//         >
//           <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Profile</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => navigation.navigate("EditProfile")}
//         >
//           <Ionicons name="create-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Edit Profile</Text>
//         </TouchableOpacity>

//         <View style={{ flex: 1 }} />

//         <TouchableOpacity
//           style={[styles.menuItem, { marginBottom: 22 }]}
//           onPress={async () => {
//             await AsyncStorage.multiRemove(["authToken", "doerProfile"]);
//             navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//           }}
//         >
//           <Ionicons name="log-out-outline" size={20} color="#ef4444" />
//           <Text style={[styles.menuText, { color: "#ef4444" }]}>Logout</Text>
//         </TouchableOpacity>
//       </Animated.View>
//     </SafeAreaView>
//   );
// }

// // -------------------- styles --------------------
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f6f8fb" },
//   topBar: {
//     height: 56,
//     backgroundColor: "#0f172a",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 12,
//   },
//   topTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },
//   iconBtn: { padding: 6 },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },

//   welcomeText: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: "#0f172a",
//     marginBottom: 6,
//   },
//   profileCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 12,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     elevation: 2,
//   },
//   profileGrid: { marginTop: 6 },
//   profileRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },
//   smallLabel: { color: "#6b7280", fontSize: 13 },
//   smallValue: { fontSize: 14, fontWeight: "800" },

//   radiusRow: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   radiusLabel: { fontWeight: "700", color: "#111827", marginBottom: 8 },
//   radiusControl: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "flex-start",
//   },
//   radiusBtn: {
//     backgroundColor: "#eef2ff",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },
//   radiusBtnText: { fontSize: 20, color: "#2563eb", fontWeight: "800" },
//   radiusValue: { marginHorizontal: 12, fontWeight: "800" },
//   locSmall: { marginTop: 8, color: "#6b7280", fontSize: 12 },

//   sectionHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 6,
//   },
//   sectionHeader: { fontSize: 16, fontWeight: "800", color: "#2563eb" },

//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 14,
//     marginVertical: 6,
//     shadowColor: "#000",
//     shadowOpacity: 0.04,
//     elevation: 2,
//   },
//   jobTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
//   jobDesc: { color: "#475569", marginTop: 6 },
//   badge: {
//     backgroundColor: "#eef2ff",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 8,
//   },
//   badgeText: { color: "#3730a3", fontWeight: "700", fontSize: 12 },
//   postedAgo: { color: "#6b7280", marginLeft: 8, fontSize: 12 },
//   locationText: { marginTop: 8, color: "#475569", fontSize: 13 },

//   amountText: { fontWeight: "900", color: "#0f172a", fontSize: 16 },
//   posterText: { color: "#475569", fontSize: 12, marginTop: 6 },

//   acceptBtn: {
//     backgroundColor: "#2563eb",
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   acceptText: { color: "#fff", fontWeight: "800" },

//   emptyBox: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   emptyText: { color: "#6b7280", paddingVertical: 8 },

//   smallRow: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     marginVertical: 6,
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   // overlay + sidebar
//   overlay: {
//     position: "absolute",
//     left: 0,
//     top: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "#000",
//     zIndex: 20,
//   },
//   sidebar: {
//     position: "absolute",
//     left: 0,
//     top: 0,
//     bottom: 0,
//     width: 220,
//     backgroundColor: "#fff",
//     paddingTop: 34,
//     paddingHorizontal: 14,
//     zIndex: 30,
//     elevation: 8,
//   },
//   sidebarHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 14,
//   },
//   sidebarTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
//   menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
//   menuText: {
//     marginLeft: 12,
//     fontSize: 16,
//     color: "#111827",
//     fontWeight: "700",
//   },
// });
// DoerDashboard.js
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Alert,
//   Animated,
//   SafeAreaView,
//   StatusBar,
//   Dimensions,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import * as Location from "expo-location";
// import Slider from "@react-native-community/slider";
// import {
//   fetchDoerProfile,
//   fetchAvailableJobs,
//   fetchCurrentJobs,
//   acceptJob,
//   fetchJobHistory,
// } from "../api/doer";

// const { width: SCREEN_WIDTH } = Dimensions.get("window");
// const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.82);
// const CARD_MARGIN = 12;
// const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;

// export default function DoerDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [currentJobs, setCurrentJobs] = useState([]);
//   const [jobHistory, setJobHistory] = useState([]);
//   const [page, setPage] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [jobsLoading, setJobsLoading] = useState(false);
//   const [acceptingMap, setAcceptingMap] = useState({});
//   const [radius, setRadius] = useState(5);
//   const [location, setLocation] = useState(null);

//   // Sidebar animation refs
//   const sidebarAnim = useRef(new Animated.Value(-320)).current;
//   const overlayOpacity = useRef(new Animated.Value(0)).current;
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   useEffect(() => {
//     loadAllData();
//   }, [radius]);

//   // ---------------- Data loaders ----------------
//   const loadAllData = async () => {
//     setLoading(true);
//     await loadProfile();
//     await getLocationAndJobs();
//     await loadCurrentJobs();
//     await loadJobHistory(true);
//     setLoading(false);
//   };

//   const getLocationAndJobs = async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert("Permission Denied", "Enable location to see nearby jobs.");
//         return;
//       }
//       const loc = await Location.getCurrentPositionAsync({});
//       const coords = { lat: loc.coords.latitude, lon: loc.coords.longitude };
//       setLocation(coords);
//       await loadAvailableJobs(coords);
//     } catch (e) {
//       console.warn("Location Error:", e?.message);
//     }
//   };

//   const loadProfile = async () => {
//     try {
//       const stored = await AsyncStorage.getItem("doerProfile");
//       if (stored) {
//         setProfile(JSON.parse(stored));
//       } else {
//         const res = await fetchDoerProfile();
//         if (res?.data) {
//           setProfile(res.data);
//           await AsyncStorage.setItem("doerProfile", JSON.stringify(res.data));
//         } else {
//           navigation.reset({ index: 0, routes: [{ name: "EditProfile" }] });
//         }
//       }
//     } catch (err) {
//       console.warn("Profile Load Error:", err?.message || err);
//     }
//   };

//   const loadAvailableJobs = async (coords) => {
//     try {
//       setJobsLoading(true);
//       const res = await fetchAvailableJobs(coords?.lat, coords?.lon, radius);
//       setAvailableJobs(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Available Jobs Error:", err?.message || err);
//       setAvailableJobs([]);
//     } finally {
//       setJobsLoading(false);
//     }
//   };

//   const loadCurrentJobs = async () => {
//     try {
//       const res = await fetchCurrentJobs();
//       setCurrentJobs(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Current Jobs Error:", err?.message || err);
//     }
//   };

//   const loadJobHistory = async (reset = false) => {
//     try {
//       const nextPage = reset ? 0 : page;
//       const res = await fetchJobHistory(nextPage, 5, ["updatedAt,desc"]);
//       if (res?.data?.data?.content) {
//         const newJobs = res.data.data.content;
//         setJobHistory((prev) => (reset ? newJobs : [...prev, ...newJobs]));
//         setHasMore(!res.data.data.last);
//         setPage(nextPage + 1);
//       }
//     } catch (err) {
//       console.warn("Job History Error:", err?.message || err);
//     }
//   };

//   // ---------------- Accept job ----------------
//   const handleAcceptJob = async (jobId) => {
//     try {
//       setAcceptingMap((prev) => ({ ...prev, [jobId]: true }));
//       const res = await acceptJob(jobId);
//       if (res?.status === "SUCCESS") {
//         Alert.alert("Success", res.message || "Job accepted!");
//         await Promise.all([
//           loadCurrentJobs(),
//           location && loadAvailableJobs(location),
//           loadJobHistory(true),
//         ]);
//       } else {
//         Alert.alert("Failed", res?.message || "Could not accept job");
//       }
//     } catch (err) {
//       Alert.alert(
//         "Error",
//         err?.response?.data?.message || err?.message || "Network error"
//       );
//     } finally {
//       setAcceptingMap((prev) => ({ ...prev, [jobId]: false }));
//     }
//   };

//   // ---------------- Sidebar controls ----------------
//   const openSidebar = () => {
//     setSidebarOpen(true);
//     Animated.parallel([
//       Animated.timing(sidebarAnim, {
//         toValue: 0,
//         duration: 280,
//         useNativeDriver: true,
//       }),
//       Animated.timing(overlayOpacity, {
//         toValue: 0.45,
//         duration: 280,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const closeSidebar = () => {
//     Animated.parallel([
//       Animated.timing(sidebarAnim, {
//         toValue: -320,
//         duration: 220,
//         useNativeDriver: true,
//       }),
//       Animated.timing(overlayOpacity, {
//         toValue: 0,
//         duration: 220,
//         useNativeDriver: true,
//       }),
//     ]).start(() => setSidebarOpen(false));
//   };

//   // ---------------- Helpers ----------------
//   const formatPrice = (item) => {
//     if (item.amountInRs != null) return item.amountInRs;
//     if (item.amountPaise != null) return item.amountPaise / 100;
//     return 0;
//   };

//   // ---------- Render job cards ----------
//   const renderJob = ({ item }) => {
//     const accepting = acceptingMap[item.jobId] || false;
//     return (
//       <View style={styles.jobCard}>
//         <View style={styles.jobRow}>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.jobTitle}>{item.title}</Text>
//             <Text style={styles.jobMeta} numberOfLines={2}>
//               📝 {item.description || "No description"}
//             </Text>
//             <View style={{ flexDirection: "row", marginTop: 8 }}>
//               <Text style={styles.jobMeta}>
//                 📍 {item.locationArea || "N/A"}
//               </Text>
//               {item.distance && (
//                 <Text style={[styles.jobMeta, { marginLeft: 10 }]}>
//                   • {item.distance.toFixed(1)} km away
//                 </Text>
//               )}
//             </View>
//           </View>

//           <View style={{ alignItems: "flex-end" }}>
//             <Text style={styles.price}>₹{formatPrice(item)}</Text>
//           </View>
//         </View>

//         <TouchableOpacity
//           style={styles.acceptBtn}
//           onPress={() => handleAcceptJob(item.jobId)}
//           disabled={accepting}
//         >
//           {accepting ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.acceptText}>Accept</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   // ---------------- Render ----------------
//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#111827" />

//       {/* Top bar */}
//       <View style={styles.topBar}>
//         <TouchableOpacity onPress={openSidebar} style={styles.iconBtn}>
//           <Ionicons name="menu" size={22} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.topTitle}>Doer Dashboard</Text>
//         <View style={{ width: 22 }} />
//       </View>

//       {/* Radius slider */}
//       <View style={styles.radiusBox}>
//         <Text style={styles.radiusText}>
//           Search Radius: {radius.toFixed(1)} km
//         </Text>
//         <Slider
//           style={{ width: "100%", height: 40 }}
//           minimumValue={1}
//           maximumValue={15}
//           step={0.5}
//           value={radius}
//           onValueChange={setRadius}
//           minimumTrackTintColor="#2563eb"
//           maximumTrackTintColor="#ddd"
//           thumbTintColor="#2563eb"
//         />
//       </View>

//       {/* Available Jobs */}
//       <FlatList
//         data={availableJobs}
//         keyExtractor={(item) => `avail-${item.jobId}`}
//         renderItem={renderJob}
//         refreshing={jobsLoading}
//         onRefresh={loadAllData}
//         contentContainerStyle={styles.contentContainer}
//         ListHeaderComponent={
//           <Text style={styles.sectionHeader}>🧭 Available Jobs Nearby</Text>
//         }
//         ListFooterComponent={
//           availableJobs.length === 0 && !jobsLoading ? (
//             <Text style={styles.emptyText}>No jobs found nearby.</Text>
//           ) : null
//         }
//       />

//       {/* Overlay & Sidebar */}
//       {sidebarOpen && (
//         <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
//           <TouchableOpacity
//             style={{ flex: 1 }}
//             activeOpacity={1}
//             onPress={closeSidebar}
//           />
//         </Animated.View>
//       )}

//       <Animated.View
//         style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}
//       >
//         <View style={styles.sidebarHeader}>
//           <Text style={styles.sidebarTitle}>Menu</Text>
//           <TouchableOpacity onPress={closeSidebar}>
//             <Ionicons name="close" size={22} color="#111827" />
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("DoerProfile");
//           }}
//         >
//           <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("KYCPage");
//           }}
//         >
//           <Ionicons name="document-text-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Upload KYC</Text>
//         </TouchableOpacity>
//       </Animated.View>
//     </SafeAreaView>
//   );
// }

// // ------------------ styles ------------------
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8fafc" },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },

//   topBar: {
//     height: 56,
//     backgroundColor: "#111827",
//     paddingHorizontal: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   iconBtn: { padding: 6 },
//   topTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },

//   radiusBox: {
//     padding: 14,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     margin: 14,
//     elevation: 2,
//   },
//   radiusText: { fontWeight: "700", color: "#111827", marginBottom: 6 },

//   sectionHeader: {
//     fontSize: 17,
//     fontWeight: "800",
//     marginBottom: 10,
//     color: "#2563eb",
//   },
//   contentContainer: { paddingHorizontal: 16, paddingBottom: 100 },

//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#e6eef9",
//   },
//   jobRow: { flexDirection: "row", justifyContent: "space-between" },
//   jobTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
//   jobMeta: { fontSize: 13, color: "#475569", marginTop: 4 },
//   price: { fontWeight: "900", color: "#0f172a", fontSize: 16 },
//   acceptBtn: {
//     marginTop: 10,
//     backgroundColor: "#2563eb",
//     paddingVertical: 8,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   acceptText: { color: "#fff", fontWeight: "800" },
//   emptyText: { textAlign: "center", color: "#6b7280", marginTop: 12 },

//   overlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "#000",
//   },
//   sidebar: {
//     position: "absolute",
//     left: 0,
//     top: 0,
//     bottom: 0,
//     width: 180,
//     backgroundColor: "#fff",
//     paddingTop: 34,
//     paddingHorizontal: 16,
//     borderTopRightRadius: 18,
//     borderBottomRightRadius: 18,
//     elevation: 8,
//   },
//   sidebarHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 14,
//   },
//   sidebarTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
//   menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
//   menuText: {
//     marginLeft: 12,
//     fontSize: 16,
//     color: "#111827",
//     fontWeight: "700",
//   },
// });
// // DoerDashboard.js
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Alert,
//   Animated,
//   SafeAreaView,
//   StatusBar,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import * as Location from "expo-location";
// import Slider from "@react-native-community/slider";
// import {
//   fetchDoerProfile,
//   fetchAvailableJobs,
//   fetchCurrentJobs,
//   acceptJob,
//   fetchJobHistory,
// } from "../api/doer";

// export default function DoerDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [currentJobs, setCurrentJobs] = useState([]);
//   const [jobHistory, setJobHistory] = useState([]);
//   const [radius, setRadius] = useState(5);
//   const [location, setLocation] = useState(null);
//   const [acceptingMap, setAcceptingMap] = useState({});

//   const sidebarAnim = useRef(new Animated.Value(-300)).current;
//   const overlayOpacity = useRef(new Animated.Value(0)).current;
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // Initial load
//   useEffect(() => {
//     loadAllData();
//   }, [radius]);

//   const loadAllData = async () => {
//     setLoading(true);
//     await loadProfile();
//     await getLocationAndJobs();
//     await loadCurrentJobs();
//     await loadJobHistory();
//     setLoading(false);
//   };

//   const loadProfile = async () => {
//     try {
//       const stored = await AsyncStorage.getItem("doerProfile");
//       if (stored) {
//         setProfile(JSON.parse(stored));
//       } else {
//         const res = await fetchDoerProfile();
//         if (res?.data) {
//           setProfile(res.data);
//           await AsyncStorage.setItem("doerProfile", JSON.stringify(res.data));
//         } else {
//           navigation.reset({ index: 0, routes: [{ name: "EditProfile" }] });
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
//         Alert.alert("Location Denied", "Please enable location access.");
//         return;
//       }
//       const loc = await Location.getCurrentPositionAsync({});
//       const coords = { lat: loc.coords.latitude, lon: loc.coords.longitude };
//       setLocation(coords);
//       await loadAvailableJobs(coords);
//     } catch (err) {
//       console.warn("Location Error:", err.message);
//     }
//   };

//   const loadAvailableJobs = async (coords) => {
//     try {
//       const res = await fetchAvailableJobs(coords?.lat, coords?.lon, radius);
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
//       console.warn("Current Jobs Error:", err.message);
//     }
//   };

//   const loadJobHistory = async () => {
//     try {
//       const res = await fetchJobHistory(0, 10, ["updatedAt,desc"]);
//       setJobHistory(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Job History Error:", err.message);
//     }
//   };

//   const handleAcceptJob = async (jobId) => {
//     try {
//       setAcceptingMap((p) => ({ ...p, [jobId]: true }));
//       const res = await acceptJob(jobId);
//       Alert.alert("Success", res?.message || "Job accepted!");
//       await Promise.all([
//         loadCurrentJobs(),
//         location && loadAvailableJobs(location),
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

//   const formatPrice = (item) => {
//     if (item.amountInRs != null) return item.amountInRs;
//     if (item.amountPaise != null) return item.amountPaise / 100;
//     return 0;
//   };

//   const renderJobCard = (item, type = "available") => {
//     const accepting = acceptingMap[item.jobId] || false;
//     return (
//       <View key={`${type}-${item.jobId}`} style={styles.jobCard}>
//         <View style={styles.jobRow}>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.jobTitle}>{item.title}</Text>
//             <Text style={styles.jobMeta} numberOfLines={2}>
//               📝 {item.description || "No description"}
//             </Text>
//             <View style={{ flexDirection: "row", marginTop: 8 }}>
//               <Text style={styles.jobMeta}>
//                 📍 {item.locationArea || "N/A"}
//               </Text>
//               {item.distance && (
//                 <Text style={[styles.jobMeta, { marginLeft: 8 }]}>
//                   • {item.distance.toFixed(1)} km away
//                 </Text>
//               )}
//             </View>
//           </View>
//           <View style={{ alignItems: "flex-end" }}>
//             <Text style={styles.price}>₹{formatPrice(item)}</Text>
//           </View>
//         </View>
//         {type === "available" && (
//           <TouchableOpacity
//             style={styles.acceptBtn}
//             onPress={() => handleAcceptJob(item.jobId)}
//             disabled={accepting}
//           >
//             {accepting ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.acceptText}>Accept</Text>
//             )}
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor="#111827" barStyle="light-content" />

//       {/* Top Bar */}
//       <View style={styles.topBar}>
//         <TouchableOpacity onPress={() => setSidebarOpen(true)}>
//           <Ionicons name="menu" size={22} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.topTitle}>Doer Dashboard</Text>
//         <View style={{ width: 22 }} />
//       </View>

//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Radius Control */}
//         <View style={styles.radiusBox}>
//           <Text style={styles.radiusText}>
//             Search Radius: {radius.toFixed(1)} km
//           </Text>
//           <Slider
//             style={{ width: "100%", height: 40 }}
//             minimumValue={1}
//             maximumValue={15}
//             step={0.5}
//             value={radius}
//             onValueChange={setRadius}
//             minimumTrackTintColor="#2563eb"
//             maximumTrackTintColor="#ddd"
//             thumbTintColor="#2563eb"
//           />
//         </View>

//         {/* Available Jobs */}
//         <Text style={styles.sectionHeader}>🧭 Available Jobs Nearby</Text>
//         {availableJobs.length > 0 ? (
//           availableJobs.map((j) => renderJobCard(j, "available"))
//         ) : (
//           <Text style={styles.emptyText}>No jobs nearby.</Text>
//         )}

//         {/* Current Jobs */}
//         <Text style={styles.sectionHeader}>⚡ Active Jobs</Text>
//         {currentJobs.length > 0 ? (
//           currentJobs.map((j) => renderJobCard(j, "current"))
//         ) : (
//           <Text style={styles.emptyText}>No active jobs.</Text>
//         )}

//         {/* Job History */}
//         <Text style={styles.sectionHeader}>📜 Completed Jobs</Text>
//         {jobHistory.length > 0 ? (
//           jobHistory.map((j) => renderJobCard(j, "history"))
//         ) : (
//           <Text style={styles.emptyText}>No completed jobs yet.</Text>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// // ---------------- Styles ----------------
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8fafc" },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   topBar: {
//     height: 56,
//     backgroundColor: "#111827",
//     paddingHorizontal: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   topTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },
//   radiusBox: {
//     padding: 14,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     marginBottom: 16,
//     elevation: 2,
//   },
//   radiusText: { fontWeight: "700", color: "#111827", marginBottom: 6 },
//   sectionHeader: {
//     fontSize: 17,
//     fontWeight: "800",
//     marginVertical: 10,
//     color: "#2563eb",
//   },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#e6eef9",
//   },
//   jobRow: { flexDirection: "row", justifyContent: "space-between" },
//   jobTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
//   jobMeta: { fontSize: 13, color: "#475569", marginTop: 4 },
//   price: { fontWeight: "900", color: "#0f172a", fontSize: 16 },
//   acceptBtn: {
//     marginTop: 10,
//     backgroundColor: "#2563eb",
//     paddingVertical: 8,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   acceptText: { color: "#fff", fontWeight: "800" },
//   emptyText: { textAlign: "center", color: "#6b7280", marginBottom: 8 },
// });
// //corret code
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
//   StatusBar,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import * as Location from "expo-location";
// import Slider from "@react-native-community/slider";
// import {
//   fetchDoerProfile,
//   fetchAvailableJobs,
//   fetchCurrentJobs,
//   fetchJobHistory,
//   acceptJob,
// } from "../api/doer";

// export default function DoerDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [currentJobs, setCurrentJobs] = useState([]);
//   const [jobHistory, setJobHistory] = useState([]);
//   const [radius, setRadius] = useState(5);
//   const [location, setLocation] = useState(null);
//   const [acceptingMap, setAcceptingMap] = useState({});

//   useEffect(() => {
//     loadAllData();
//   }, [radius]);

//   const loadAllData = async () => {
//     setLoading(true);
//     await loadProfile();
//     await getLocationAndJobs();
//     await loadCurrentJobs();
//     await loadJobHistory();
//     setLoading(false);
//   };

//   const loadProfile = async () => {
//     try {
//       const stored = await AsyncStorage.getItem("doerProfile");
//       if (stored) setProfile(JSON.parse(stored));
//       else {
//         const res = await fetchDoerProfile();
//         setProfile(res.data);
//         await AsyncStorage.setItem("doerProfile", JSON.stringify(res.data));
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
//       await loadAvailableJobs(coords);
//     } catch (err) {
//       console.warn("Location Error:", err.message);
//     }
//   };

//   const loadAvailableJobs = async (coords) => {
//     try {
//       const res = await fetchAvailableJobs(coords?.lat, coords?.lon, radius);
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
//       console.warn("Current Jobs Error:", err.message);
//     }
//   };

//   const loadJobHistory = async () => {
//     try {
//       const res = await fetchJobHistory(0, 10, ["updatedAt,desc"]);
//       setJobHistory(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Job History Error:", err.message);
//     }
//   };

//   const handleAcceptJob = async (jobId) => {
//     try {
//       setAcceptingMap((p) => ({ ...p, [jobId]: true }));
//       const res = await acceptJob(jobId);
//       Alert.alert("Success", res?.message || "Job accepted!");
//       await Promise.all([
//         loadCurrentJobs(),
//         location && loadAvailableJobs(location),
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

//   const formatTimeLeft = (deadline) => {
//     if (!deadline) return "";
//     const diff = new Date(deadline) - new Date();
//     if (diff <= 0) return "Expired";
//     const hrs = Math.floor(diff / (1000 * 60 * 60));
//     const mins = Math.floor((diff / (1000 * 60)) % 60);
//     return `Due in ${hrs > 0 ? `${hrs}h ` : ""}${mins}m`;
//   };

//   const renderJobCard = (item, type = "available") => {
//     const accepting = acceptingMap[item.jobId] || false;
//     const statusColor =
//       item.status === "COMPLETED"
//         ? "#22c55e"
//         : item.status === "ACTIVE"
//         ? "#2563eb"
//         : "#f59e0b";

//     return (
//       <View style={styles.jobCard}>
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

//         <View style={styles.metaRow}>
//           <MaterialIcons name="category" size={16} color="#475569" />
//           <Text style={styles.metaText}>{item.category || "General"}</Text>
//         </View>

//         <View style={styles.metaRow}>
//           <Ionicons name="location-outline" size={16} color="#475569" />
//           <Text style={styles.metaText}>
//             {item.addressLabel || "No location"}
//           </Text>
//         </View>

//         {item.deadline && (
//           <View style={styles.metaRow}>
//             <Ionicons name="time-outline" size={16} color="#475569" />
//             <Text style={styles.metaText}>{formatTimeLeft(item.deadline)}</Text>
//           </View>
//         )}

//         {item.isProofSubmitted && (
//           <View style={styles.proofTag}>
//             <Text style={styles.proofText}>Proof Submitted ✅</Text>
//           </View>
//         )}

//         {type === "available" && (
//           <TouchableOpacity
//             style={styles.acceptBtn}
//             onPress={() => handleAcceptJob(item.jobId)}
//             disabled={accepting}
//           >
//             {accepting ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.acceptText}>Accept Job</Text>
//             )}
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor="#111827" barStyle="light-content" />
//       <View style={styles.topBar}>
//         <TouchableOpacity>
//           <Ionicons name="menu" size={22} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.topTitle}>Doer Dashboard</Text>
//         <View style={{ width: 22 }} />
//       </View>

//       <ScrollView
//         contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Radius Selector */}
//         <View style={styles.radiusBox}>
//           <Text style={styles.radiusText}>
//             Search Radius: {radius.toFixed(1)} km
//           </Text>
//           <Slider
//             style={{ width: "100%", height: 40 }}
//             minimumValue={1}
//             maximumValue={15}
//             step={0.5}
//             value={radius}
//             onValueChange={setRadius}
//             minimumTrackTintColor="#2563eb"
//             maximumTrackTintColor="#ddd"
//             thumbTintColor="#2563eb"
//           />
//         </View>

//         <Text style={styles.sectionHeader}>🧭 Available Jobs Nearby</Text>
//         {availableJobs.length > 0 ? (
//           availableJobs.map((j) => renderJobCard(j, "available"))
//         ) : (
//           <Text style={styles.emptyText}>No nearby jobs found.</Text>
//         )}

//         <Text style={styles.sectionHeader}>⚡ Active Jobs</Text>
//         {currentJobs.length > 0 ? (
//           currentJobs.map((j) => renderJobCard(j, "current"))
//         ) : (
//           <Text style={styles.emptyText}>No active jobs.</Text>
//         )}

//         <Text style={styles.sectionHeader}>📜 Completed Jobs</Text>
//         {jobHistory.length > 0 ? (
//           jobHistory.map((j) => renderJobCard(j, "history"))
//         ) : (
//           <Text style={styles.emptyText}>No completed jobs.</Text>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8fafc" },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   topBar: {
//     height: 56,
//     backgroundColor: "#111827",
//     paddingHorizontal: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   topTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },
//   radiusBox: {
//     padding: 14,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     marginBottom: 16,
//     elevation: 2,
//   },
//   radiusText: { fontWeight: "700", color: "#111827", marginBottom: 6 },
//   sectionHeader: {
//     fontSize: 17,
//     fontWeight: "800",
//     marginVertical: 10,
//     color: "#2563eb",
//   },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 14,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   title: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
//   desc: { color: "#475569", fontSize: 13, marginVertical: 6 },
//   metaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
//   metaText: { marginLeft: 6, color: "#475569", fontSize: 13 },
//   statusTag: {
//     borderRadius: 8,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//   },
//   statusText: { fontSize: 12, fontWeight: "700" },
//   proofTag: {
//     backgroundColor: "#dcfce7",
//     borderRadius: 6,
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     alignSelf: "flex-start",
//     marginTop: 8,
//   },
//   proofText: { color: "#15803d", fontSize: 12, fontWeight: "600" },
//   acceptBtn: {
//     marginTop: 12,
//     backgroundColor: "#2563eb",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   acceptText: { color: "#fff", fontWeight: "800" },
//   emptyText: { textAlign: "center", color: "#6b7280", marginBottom: 8 },
// });
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
//   StatusBar,
//   Animated,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import * as Location from "expo-location";
// import Slider from "@react-native-community/slider";
// import {
//   fetchDoerProfile,
//   fetchAvailableJobs,
//   fetchCurrentJobs,
//   fetchJobHistory,
//   acceptJob,
// } from "../api/doer";

// export default function DoerDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [currentJobs, setCurrentJobs] = useState([]);
//   const [jobHistory, setJobHistory] = useState([]);
//   const [radius, setRadius] = useState(5);
//   const [location, setLocation] = useState(null);
//   const [acceptingMap, setAcceptingMap] = useState({});

//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     loadAllData();
//   }, [radius]);

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
//         setProfile(res.data);
//         await AsyncStorage.setItem("doerProfile", JSON.stringify(res.data));
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
//       await loadAvailableJobs(coords);
//     } catch (err) {
//       console.warn("Location Error:", err.message);
//     }
//   };

//   const loadAvailableJobs = async (coords) => {
//     try {
//       const res = await fetchAvailableJobs(coords?.lat, coords?.lon, radius);
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
//       console.warn("Current Jobs Error:", err.message);
//     }
//   };

//   const loadJobHistory = async () => {
//     try {
//       const res = await fetchJobHistory(0, 10, ["updatedAt,desc"]);
//       setJobHistory(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Job History Error:", err.message);
//     }
//   };

//   const handleAcceptJob = async (jobId) => {
//     try {
//       setAcceptingMap((p) => ({ ...p, [jobId]: true }));
//       const res = await acceptJob(jobId);
//       Alert.alert("Success", res?.message || "Job accepted!");
//       await Promise.all([
//         loadCurrentJobs(),
//         location && loadAvailableJobs(location),
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

//   const formatTimeLeft = (deadline) => {
//     if (!deadline) return "";
//     const diff = new Date(deadline) - new Date();
//     if (diff <= 0) return "⏰ Expired";
//     const hrs = Math.floor(diff / (1000 * 60 * 60));
//     const mins = Math.floor((diff / (1000 * 60)) % 60);
//     return `⏳ ${hrs > 0 ? `${hrs}h ` : ""}${mins}m left`;
//   };

//   const renderJobCard = (item, type = "available", index) => {
//     const accepting = acceptingMap[item.jobId] || false;
//     const statusColor =
//       item.status === "COMPLETED"
//         ? "#22c55e"
//         : item.status === "ACTIVE"
//         ? "#2563eb"
//         : "#f59e0b";

//     return (
//       <Animated.View
//         key={`${type}-${item.jobId}-${index}`}
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

//         <View style={styles.metaRow}>
//           <MaterialIcons name="category" size={16} color="#475569" />
//           <Text style={styles.metaText}>{item.category || "General"}</Text>
//         </View>

//         {item.locationArea && (
//           <View style={styles.metaRow}>
//             <Ionicons name="location-outline" size={16} color="#475569" />
//             <Text style={styles.metaText}>{item.locationArea}</Text>
//             {item.distance && (
//               <View style={styles.distanceBadge}>
//                 <Text style={styles.distanceText}>
//                   {item.distance.toFixed(1)} km
//                 </Text>
//               </View>
//             )}
//           </View>
//         )}

//         {item.deadline && (
//           <View style={styles.metaRow}>
//             <Ionicons name="time-outline" size={16} color="#475569" />
//             <Text style={styles.metaText}>{formatTimeLeft(item.deadline)}</Text>
//           </View>
//         )}

//         {item.isProofSubmitted && (
//           <View style={styles.proofTag}>
//             <Text style={styles.proofText}>📎 Proof Submitted</Text>
//           </View>
//         )}

//         {type === "available" && (
//           <TouchableOpacity
//             style={styles.acceptBtn}
//             onPress={() => handleAcceptJob(item.jobId)}
//             disabled={accepting}
//           >
//             {accepting ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.acceptText}>Accept Job</Text>
//             )}
//           </TouchableOpacity>
//         )}
//       </Animated.View>
//     );
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor="#111827" barStyle="light-content" />

//       {/* Top Bar */}
//       <View style={styles.topBar}>
//         <TouchableOpacity>
//           <Ionicons name="menu" size={22} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.topTitle}>Doer Dashboard</Text>
//         <View style={{ width: 22 }} />
//       </View>

//       <ScrollView
//         contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Radius Slider */}
//         <View style={styles.radiusBox}>
//           <Text style={styles.radiusText}>
//             Search Radius: {radius.toFixed(1)} km
//           </Text>
//           <Slider
//             style={{ width: "100%", height: 40 }}
//             minimumValue={1}
//             maximumValue={15}
//             step={0.5}
//             value={radius}
//             onValueChange={setRadius}
//             minimumTrackTintColor="#2563eb"
//             maximumTrackTintColor="#ddd"
//             thumbTintColor="#2563eb"
//           />
//         </View>

//         {/* Available Jobs */}
//         <Text style={styles.sectionHeader}>🧭 Available Jobs Nearby</Text>
//         {availableJobs.length > 0
//           ? availableJobs.map((j, i) => renderJobCard(j, "available", i))
//           : <Text style={styles.emptyText}>No nearby jobs found.</Text>}

//         {/* Active Jobs */}
//         <Text style={styles.sectionHeader}>⚡ Active Jobs</Text>
//         {currentJobs.length > 0
//           ? currentJobs.map((j, i) => renderJobCard(j, "current", i))
//           : <Text style={styles.emptyText}>No active jobs.</Text>}

//         {/* History */}
//         <Text style={styles.sectionHeader}>📜 Completed Jobs</Text>
//         {jobHistory.length > 0
//           ? jobHistory.map((j, i) => renderJobCard(j, "history", i))
//           : <Text style={styles.emptyText}>No completed jobs.</Text>}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f9fafb" },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   topBar: {
//     height: 56,
//     backgroundColor: "#111827",
//     paddingHorizontal: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   topTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },
//   radiusBox: {
//     padding: 14,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     marginBottom: 16,
//     elevation: 3,
//   },
//   radiusText: { fontWeight: "700", color: "#111827", marginBottom: 6 },
//   sectionHeader: {
//     fontSize: 17,
//     fontWeight: "800",
//     marginVertical: 10,
//     color: "#2563eb",
//   },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 6,
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
//   statusTag: {
//     borderRadius: 8,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//   },
//   statusText: { fontSize: 12, fontWeight: "700" },
//   proofTag: {
//     backgroundColor: "#dcfce7",
//     borderRadius: 6,
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     alignSelf: "flex-start",
//     marginTop: 8,
//   },
//   proofText: { color: "#15803d", fontSize: 12, fontWeight: "600" },
//   distanceBadge: {
//     marginLeft: 8,
//     backgroundColor: "#dbeafe",
//     borderRadius: 10,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//   },
//   distanceText: { color: "#1e3a8a", fontSize: 12, fontWeight: "600" },
//   acceptBtn: {
//     marginTop: 10,
//     backgroundColor: "#2563eb",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   acceptText: { color: "#fff", fontWeight: "800" },
//   emptyText: {
//     textAlign: "center",
//     color: "#6b7280",
//     fontSize: 14,
//     marginBottom: 8,
//   },
// });
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
//   StatusBar,
//   Animated,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import * as Location from "expo-location";
// import Slider from "@react-native-community/slider";
// import {
//   fetchDoerProfile,
//   fetchAvailableJobs,
//   fetchCurrentJobs,
//   fetchJobHistory,
//   acceptJob,
// } from "../api/doer";

// export default function DoerDashboard() {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [currentJobs, setCurrentJobs] = useState([]);
//   const [jobHistory, setJobHistory] = useState([]);
//   const [radius, setRadius] = useState(5);
//   const [location, setLocation] = useState(null);
//   const [acceptingMap, setAcceptingMap] = useState({});

//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     loadAllData();
//   }, [radius]);

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
//         setProfile(res.data);
//         await AsyncStorage.setItem("doerProfile", JSON.stringify(res.data));
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
//       await loadAvailableJobs(coords);
//     } catch (err) {
//       console.warn("Location Error:", err.message);
//     }
//   };

//   const loadAvailableJobs = async (coords) => {
//     try {
//       const res = await fetchAvailableJobs(coords?.lat, coords?.lon, radius);
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
//       console.warn("Current Jobs Error:", err.message);
//     }
//   };

//   const loadJobHistory = async () => {
//     try {
//       const res = await fetchJobHistory(0, 10, ["updatedAt,desc"]);
//       setJobHistory(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Job History Error:", err.message);
//     }
//   };

//   const handleAcceptJob = async (jobId) => {
//     try {
//       setAcceptingMap((p) => ({ ...p, [jobId]: true }));
//       const res = await acceptJob(jobId);
//       Alert.alert("Success", res?.message || "Job accepted!");
//       await Promise.all([
//         loadCurrentJobs(),
//         location && loadAvailableJobs(location),
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

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const formatTimeLeft = (deadline) => {
//     if (!deadline) return "";
//     const diff = new Date(deadline) - new Date();
//     if (diff <= 0) return "⏰ Expired";
//     const hrs = Math.floor(diff / (1000 * 60 * 60));
//     const mins = Math.floor((diff / (1000 * 60)) % 60);
//     return `⏳ ${hrs > 0 ? `${hrs}h ` : ""}${mins}m left`;
//   };
//   const renderJobCard = (item, type = "available", index) => {
//     const accepting = acceptingMap[item.jobId] || false;
//     const statusColor =
//       item.status === "COMPLETED"
//         ? "#22c55e"
//         : item.status === "ACTIVE"
//         ? "#2563eb"
//         : "#f59e0b";

//     // Normalize backend naming (Distance → distance)
//     const distance = item.Distance ?? item.distance;

//     return (
//       <Animated.View
//         key={`${type}-${item.jobId}-${index}`}
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

//         <View style={styles.metaRow}>
//           <MaterialIcons name="category" size={16} color="#475569" />
//           <Text style={styles.metaText}>
//             {item.skillCategory || item.category || "General"}
//           </Text>
//         </View>

//         {item.locationArea && (
//           <View style={styles.metaRow}>
//             <Ionicons name="location-outline" size={16} color="#475569" />
//             <Text style={styles.metaText}>{item.locationArea}</Text>
//             {distance && (
//               <View style={styles.distanceBadge}>
//                 <Text style={styles.distanceText}>
//                   {distance.toFixed(1)} km
//                 </Text>
//               </View>
//             )}
//           </View>
//         )}

//         {item.posterName && (
//           <View style={styles.metaRow}>
//             <Ionicons name="person-outline" size={16} color="#475569" />
//             <Text style={styles.metaText}>By {item.posterName}</Text>
//           </View>
//         )}

//         {item.postedAgo && (
//           <View style={styles.metaRow}>
//             <Ionicons name="time-outline" size={16} color="#475569" />
//             <Text style={styles.metaText}>{item.postedAgo}</Text>
//           </View>
//         )}

//         {item.amountInRs > 0 && (
//           <View style={styles.metaRow}>
//             <Ionicons name="cash-outline" size={16} color="#475569" />
//             <Text
//               style={[styles.metaText, { fontWeight: "700", color: "#16a34a" }]}
//             >
//               ₹ {item.amountInRs}
//             </Text>
//           </View>
//         )}

//         {type === "available" && (
//           <TouchableOpacity
//             style={styles.acceptBtn}
//             onPress={() => handleAcceptJob(item.jobId)}
//             disabled={accepting}
//           >
//             {accepting ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.acceptText}>Accept Job</Text>
//             )}
//           </TouchableOpacity>
//         )}
//       </Animated.View>
//     );
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor="#111827" barStyle="light-content" />

//       <View style={styles.topBar}>
//         <TouchableOpacity>
//           <Ionicons name="menu" size={22} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.topTitle}>Doer Dashboard</Text>
//         <View style={{ width: 22 }} />
//       </View>

//       <ScrollView
//         contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Radius Slider */}
//         <View style={styles.radiusBox}>
//           <Text style={styles.radiusText}>
//             Search Radius: {radius.toFixed(1)} km
//           </Text>
//           <Slider
//             style={{ width: "100%", height: 40 }}
//             minimumValue={1}
//             maximumValue={15}
//             step={0.5}
//             value={radius}
//             onValueChange={setRadius}
//             minimumTrackTintColor="#2563eb"
//             maximumTrackTintColor="#ddd"
//             thumbTintColor="#2563eb"
//           />
//         </View>

//         <Text style={styles.sectionHeader}>🧭 Available Jobs Nearby</Text>
//         {availableJobs.length > 0 ? (
//           availableJobs.map((j, i) => renderJobCard(j, "available", i))
//         ) : (
//           <Text style={styles.emptyText}>No nearby jobs found.</Text>
//         )}

//         <Text style={styles.sectionHeader}>⚡ Active Jobs</Text>
//         {currentJobs.length > 0 ? (
//           currentJobs.map((j, i) => renderJobCard(j, "current", i))
//         ) : (
//           <Text style={styles.emptyText}>No active jobs.</Text>
//         )}

//         <Text style={styles.sectionHeader}>📜 Completed Jobs</Text>
//         {jobHistory.length > 0 ? (
//           jobHistory.map((j, i) => renderJobCard(j, "history", i))
//         ) : (
//           <Text style={styles.emptyText}>No completed jobs.</Text>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f9fafb" },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   topBar: {
//     height: 56,
//     backgroundColor: "#111827",
//     paddingHorizontal: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   topTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },
//   radiusBox: {
//     padding: 14,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     marginBottom: 16,
//     elevation: 3,
//   },
//   radiusText: { fontWeight: "700", color: "#111827", marginBottom: 6 },
//   sectionHeader: {
//     fontSize: 17,
//     fontWeight: "800",
//     marginVertical: 10,
//     color: "#2563eb",
//   },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 6,
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
//   statusTag: {
//     borderRadius: 8,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//   },
//   statusText: { fontSize: 12, fontWeight: "700" },
//   proofTag: {
//     backgroundColor: "#dcfce7",
//     borderRadius: 6,
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     alignSelf: "flex-start",
//     marginTop: 8,
//   },
//   proofText: { color: "#15803d", fontSize: 12, fontWeight: "600" },
//   distanceBadge: {
//     marginLeft: 8,
//     backgroundColor: "#dbeafe",
//     borderRadius: 10,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//   },
//   distanceText: { color: "#1e3a8a", fontSize: 12, fontWeight: "600" },
//   acceptBtn: {
//     marginTop: 10,
//     backgroundColor: "#2563eb",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   acceptText: { color: "#fff", fontWeight: "800" },
//   emptyText: {
//     textAlign: "center",
//     color: "#6b7280",
//     fontSize: 14,
//     marginBottom: 8,
//   },
// });

// //latest corret code
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
//   StatusBar,
//   Animated,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import * as Location from "expo-location";
// import Slider from "@react-native-community/slider";
// import {
//   fetchDoerProfile,
//   fetchAvailableJobs,
//   fetchCurrentJobs,
//   fetchJobHistory,
//   acceptJob,
// } from "../api/doer";

// export default function DoerDashboard() {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [currentJobs, setCurrentJobs] = useState([]);
//   const [jobHistory, setJobHistory] = useState([]);
//   const [radius, setRadius] = useState(5);
//   const [location, setLocation] = useState(null);
//   const [acceptingMap, setAcceptingMap] = useState({});
//   const [activeTab, setActiveTab] = useState("available");

//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     loadAllData();
//   }, [radius]);

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
//         setProfile(res.data);
//         await AsyncStorage.setItem("doerProfile", JSON.stringify(res.data));
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
//       await loadAvailableJobs(coords);
//     } catch (err) {
//       console.warn("Location Error:", err.message);
//     }
//   };

//   const loadAvailableJobs = async (coords) => {
//     try {
//       const res = await fetchAvailableJobs(coords?.lat, coords?.lon, radius);
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
//       console.warn("Current Jobs Error:", err.message);
//     }
//   };

//   const loadJobHistory = async () => {
//     try {
//       const res = await fetchJobHistory(0, 10, ["updatedAt,desc"]);
//       setJobHistory(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Job History Error:", err.message);
//     }
//   };

//   const handleAcceptJob = async (jobId) => {
//     try {
//       setAcceptingMap((p) => ({ ...p, [jobId]: true }));
//       const res = await acceptJob(jobId);
//       Alert.alert("Success", res?.message || "Job accepted!");
//       await Promise.all([
//         loadCurrentJobs(),
//         location && loadAvailableJobs(location),
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

//   const renderJobCard = (item, type = "available", index) => {
//     const accepting = acceptingMap[item.jobId] || false;
//     const statusColor =
//       item.status === "COMPLETED"
//         ? "#22c55e"
//         : item.status === "ACTIVE"
//         ? "#2563eb"
//         : "#f59e0b";

//     const distance = item.Distance ?? item.distance;

//     return (
//       <Animated.View
//         key={`${type}-${item.jobId}-${index}`}
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

//         <View style={styles.metaRow}>
//           <MaterialIcons name="category" size={16} color="#475569" />
//           <Text style={styles.metaText}>
//             {item.skillCategory || item.category || "General"}
//           </Text>
//         </View>

//         {item.locationArea && (
//           <View style={styles.metaRow}>
//             <Ionicons name="location-outline" size={16} color="#475569" />
//             <Text style={styles.metaText}>{item.locationArea}</Text>
//             {distance && (
//               <View style={styles.distanceBadge}>
//                 <Text style={styles.distanceText}>
//                   {distance.toFixed(1)} km
//                 </Text>
//               </View>
//             )}
//           </View>
//         )}

//         {item.posterName && (
//           <View style={styles.metaRow}>
//             <Ionicons name="person-outline" size={16} color="#475569" />
//             <Text style={styles.metaText}>By {item.posterName}</Text>
//           </View>
//         )}

//         {item.amountInRs > 0 && (
//           <View style={styles.metaRow}>
//             <Ionicons name="cash-outline" size={16} color="#475569" />
//             <Text
//               style={[styles.metaText, { fontWeight: "700", color: "#16a34a" }]}
//             >
//               ₹ {item.amountInRs}
//             </Text>
//           </View>
//         )}

//         {type === "available" && (
//           <TouchableOpacity
//             style={styles.acceptBtn}
//             onPress={() => handleAcceptJob(item.jobId)}
//             disabled={accepting}
//           >
//             {accepting ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.acceptText}>Accept Job</Text>
//             )}
//           </TouchableOpacity>
//         )}
//       </Animated.View>
//     );
//   };

//   const renderContent = () => {
//     if (activeTab === "available")
//       return (
//         <ScrollView contentContainerStyle={styles.scroll}>
//           <View style={styles.radiusBox}>
//             <Text style={styles.radiusText}>
//               Search Radius: {radius.toFixed(1)} km
//             </Text>
//             <Slider
//               style={{ width: "100%", height: 40 }}
//               minimumValue={1}
//               maximumValue={15}
//               step={0.5}
//               value={radius}
//               onValueChange={setRadius}
//               minimumTrackTintColor="#2563eb"
//               maximumTrackTintColor="#ddd"
//               thumbTintColor="#2563eb"
//             />
//           </View>
//           {availableJobs.length > 0 ? (
//             availableJobs.map((j, i) => renderJobCard(j, "available", i))
//           ) : (
//             <Text style={styles.emptyText}>No nearby jobs found.</Text>
//           )}
//         </ScrollView>
//       );

//     if (activeTab === "current")
//       return (
//         <ScrollView contentContainerStyle={styles.scroll}>
//           {currentJobs.length > 0 ? (
//             currentJobs.map((j, i) => renderJobCard(j, "current", i))
//           ) : (
//             <Text style={styles.emptyText}>No active jobs.</Text>
//           )}
//         </ScrollView>
//       );

//     if (activeTab === "history")
//       return (
//         <ScrollView contentContainerStyle={styles.scroll}>
//           {jobHistory.length > 0 ? (
//             jobHistory.map((j, i) => renderJobCard(j, "history", i))
//           ) : (
//             <Text style={styles.emptyText}>No completed jobs.</Text>
//           )}
//         </ScrollView>
//       );

//     if (activeTab === "profile")
//       return (
//         <View style={styles.profileBox}>
//           <Text style={styles.profileTitle}>👤 Profile</Text>
//           {profile ? (
//             <>
//               <Text style={styles.profileText}>Name: {profile.name}</Text>
//               <Text style={styles.profileText}>Email: {profile.email}</Text>
//               <Text style={styles.profileText}>Phone: {profile.phone}</Text>
//             </>
//           ) : (
//             <Text style={styles.emptyText}>No profile data found.</Text>
//           )}
//         </View>
//       );
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor="#111827" barStyle="light-content" />
//       <View style={styles.topBar}>
//         <Text style={styles.topTitle}>Doer Dashboard</Text>
//       </View>

//       {renderContent()}

//       {/* ✅ Bottom Tab Bar */}
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
//   scroll: { padding: 16, paddingBottom: 80 },
//   radiusBox: {
//     padding: 14,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     marginBottom: 16,
//     elevation: 3,
//   },
//   radiusText: { fontWeight: "700", color: "#111827", marginBottom: 6 },
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
//   statusTag: {
//     borderRadius: 8,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//   },
//   statusText: { fontSize: 12, fontWeight: "700" },
//   distanceBadge: {
//     marginLeft: 8,
//     backgroundColor: "#dbeafe",
//     borderRadius: 10,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//   },
//   distanceText: { color: "#1e3a8a", fontSize: 12, fontWeight: "600" },
//   acceptBtn: {
//     marginTop: 10,
//     backgroundColor: "#2563eb",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   acceptText: { color: "#fff", fontWeight: "800" },
//   emptyText: {
//     textAlign: "center",
//     color: "#6b7280",
//     fontSize: 14,
//     marginBottom: 8,
//   },
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
//   profileBox: { flex: 1, justifyContent: "center", alignItems: "center" },
//   profileTitle: { fontSize: 20, fontWeight: "800", marginBottom: 10 },
//   profileText: { fontSize: 14, color: "#374151", marginVertical: 4 },
// });

//2 curret code
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
//   StatusBar,
//   Animated,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import * as Location from "expo-location";
// import Slider from "@react-native-community/slider";
// import {
//   fetchDoerProfile,
//   fetchAvailableJobs,
//   fetchCurrentJobs,
//   fetchJobHistory,
//   acceptJob,
// } from "../api/doer";

// export default function DoerDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [currentJobs, setCurrentJobs] = useState([]);
//   const [jobHistory, setJobHistory] = useState([]);
//   const [radius, setRadius] = useState(5);
//   const [location, setLocation] = useState(null);
//   const [acceptingMap, setAcceptingMap] = useState({});
//   const [activeTab, setActiveTab] = useState("available"); // ✅ default page

//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     loadAllData();
//   }, [radius]);

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
//         setProfile(res.data);
//         await AsyncStorage.setItem("doerProfile", JSON.stringify(res.data));
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
//       await loadAvailableJobs(coords);
//     } catch (err) {
//       console.warn("Location Error:", err.message);
//     }
//   };

//   const loadAvailableJobs = async (coords) => {
//     try {
//       const res = await fetchAvailableJobs(coords?.lat, coords?.lon, radius);
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
//       console.warn("Current Jobs Error:", err.message);
//     }
//   };

//   const loadJobHistory = async () => {
//     try {
//       const res = await fetchJobHistory(0, 10, ["updatedAt,desc"]);
//       setJobHistory(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Job History Error:", err.message);
//     }
//   };

//   const handleAcceptJob = async (jobId) => {
//     try {
//       setAcceptingMap((p) => ({ ...p, [jobId]: true }));
//       const res = await acceptJob(jobId);
//       Alert.alert("Success", res?.message || "Job accepted!");
//       await Promise.all([
//         loadCurrentJobs(),
//         location && loadAvailableJobs(location),
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

//   const renderJobCard = (item, type = "available", index) => {
//     const accepting = acceptingMap[item.jobId] || false;
//     const statusColor =
//       item.status === "COMPLETED"
//         ? "#22c55e"
//         : item.status === "ACTIVE"
//         ? "#2563eb"
//         : "#f59e0b";

//     const distance = item.Distance ?? item.distance;

//     return (
//       <Animated.View
//         key={`${type}-${item.jobId}-${index}`}
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

//         <View style={styles.metaRow}>
//           <MaterialIcons name="category" size={16} color="#475569" />
//           <Text style={styles.metaText}>
//             {item.skillCategory || item.category || "General"}
//           </Text>
//         </View>

//         {item.locationArea && (
//           <View style={styles.metaRow}>
//             <Ionicons name="location-outline" size={16} color="#475569" />
//             <Text style={styles.metaText}>{item.locationArea}</Text>
//             {distance && (
//               <View style={styles.distanceBadge}>
//                 <Text style={styles.distanceText}>
//                   {distance.toFixed(1)} km
//                 </Text>
//               </View>
//             )}
//           </View>
//         )}

//         {item.posterName && (
//           <View style={styles.metaRow}>
//             <Ionicons name="person-outline" size={16} color="#475569" />
//             <Text style={styles.metaText}>By {item.posterName}</Text>
//           </View>
//         )}

//         {item.amountInRs > 0 && (
//           <View style={styles.metaRow}>
//             <Ionicons name="cash-outline" size={16} color="#475569" />
//             <Text
//               style={[styles.metaText, { fontWeight: "700", color: "#16a34a" }]}
//             >
//               ₹ {item.amountInRs}
//             </Text>
//           </View>
//         )}

//         {type === "available" && (
//           <TouchableOpacity
//             style={styles.acceptBtn}
//             onPress={() => handleAcceptJob(item.jobId)}
//             disabled={accepting}
//           >
//             {accepting ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.acceptText}>Accept Job</Text>
//             )}
//           </TouchableOpacity>
//         )}
//       </Animated.View>
//     );
//   };

//   const renderContent = () => {
//     if (activeTab === "available")
//       return (
//         <ScrollView contentContainerStyle={styles.scroll}>
//           <View style={styles.radiusBox}>
//             <Text style={styles.radiusText}>
//               Search Radius: {radius.toFixed(1)} km
//             </Text>
//             <Slider
//               style={{ width: "100%", height: 40 }}
//               minimumValue={1}
//               maximumValue={15}
//               step={0.5}
//               value={radius}
//               onValueChange={setRadius}
//               minimumTrackTintColor="#2563eb"
//               maximumTrackTintColor="#ddd"
//               thumbTintColor="#2563eb"
//             />
//           </View>
//           {availableJobs.length > 0 ? (
//             availableJobs.map((j, i) => renderJobCard(j, "available", i))
//           ) : (
//             <Text style={styles.emptyText}>No nearby jobs found.</Text>
//           )}
//         </ScrollView>
//       );

//     if (activeTab === "current")
//       return (
//         <ScrollView contentContainerStyle={styles.scroll}>
//           {currentJobs.length > 0 ? (
//             currentJobs.map((j, i) => renderJobCard(j, "current", i))
//           ) : (
//             <Text style={styles.emptyText}>No active jobs.</Text>
//           )}
//         </ScrollView>
//       );

//     if (activeTab === "history")
//       return (
//         <ScrollView contentContainerStyle={styles.scroll}>
//           {jobHistory.length > 0 ? (
//             jobHistory.map((j, i) => renderJobCard(j, "history", i))
//           ) : (
//             <Text style={styles.emptyText}>No completed jobs.</Text>
//           )}
//         </ScrollView>
//       );

//     if (activeTab === "profile")
//       return (
//         <ScrollView contentContainerStyle={styles.scroll}>
//           <View style={styles.profileBox}>
//             <Text style={styles.profileTitle}>👤 Profile</Text>
//             {profile ? (
//               <>
//                 <Text style={styles.profileText}>Name: {profile.name}</Text>
//                 <Text style={styles.profileText}>Email: {profile.email}</Text>
//                 <Text style={styles.profileText}>Phone: {profile.phone}</Text>

//                 <View style={styles.divider} />

//                 {/* Dashboard Button */}
//                 <TouchableOpacity
//                   style={styles.menuItem}
//                   onPress={() => setActiveTab("available")}
//                 >
//                   <Ionicons name="home-outline" size={20} color="#2563eb" />
//                   <Text style={styles.menuText}>Dashboard</Text>
//                 </TouchableOpacity>

//                 {/* View Profile */}
//                 <TouchableOpacity
//                   style={styles.menuItem}
//                   onPress={() => navigation?.navigate("DoerProfile")}
//                 >
//                   <Ionicons
//                     name="person-circle-outline"
//                     size={20}
//                     color="#2563eb"
//                   />
//                   <Text style={styles.menuText}>View Profile</Text>
//                 </TouchableOpacity>

//                 {/* Edit Profile */}
//                 <TouchableOpacity
//                   style={styles.menuItem}
//                   onPress={() => navigation?.navigate("EditProfile")}
//                 >
//                   <Ionicons name="create-outline" size={20} color="#2563eb" />
//                   <Text style={styles.menuText}>Edit Profile</Text>
//                 </TouchableOpacity>

//                 {/* Upload KYC */}
//                 <TouchableOpacity
//                   style={[
//                     styles.menuItem,
//                     !profile?.isPhoneVerified && { opacity: 0.5 },
//                   ]}
//                   disabled={!profile?.isPhoneVerified}
//                   onPress={() => {
//                     if (!profile?.isPhoneVerified) {
//                       Alert.alert(
//                         "Phone not verified",
//                         "Verify your phone first."
//                       );
//                       return;
//                     }
//                     navigation?.navigate("KYCPage");
//                   }}
//                 >
//                   <Ionicons
//                     name="document-text-outline"
//                     size={20}
//                     color="#2563eb"
//                   />
//                   <Text style={styles.menuText}>Upload KYC</Text>
//                 </TouchableOpacity>
//               </>
//             ) : (
//               <Text style={styles.emptyText}>No profile data found.</Text>
//             )}
//           </View>
//         </ScrollView>
//       );
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor="#111827" barStyle="light-content" />
//       <View style={styles.topBar}>
//         <Text style={styles.topTitle}>Doer Dashboard</Text>
//       </View>

//       {renderContent()}

//       {/* ✅ Bottom Navigation */}
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
//   scroll: { padding: 16, paddingBottom: 80 },
//   radiusBox: {
//     padding: 14,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     marginBottom: 16,
//     elevation: 3,
//   },
//   radiusText: { fontWeight: "700", color: "#111827", marginBottom: 6 },
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
//   statusTag: {
//     borderRadius: 8,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//   },
//   statusText: { fontSize: 12, fontWeight: "700" },
//   distanceBadge: {
//     marginLeft: 8,
//     backgroundColor: "#dbeafe",
//     borderRadius: 10,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//   },
//   distanceText: { color: "#1e3a8a", fontSize: 12, fontWeight: "600" },
//   acceptBtn: {
//     marginTop: 10,
//     backgroundColor: "#2563eb",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   acceptText: { color: "#fff", fontWeight: "800" },
//   emptyText: {
//     textAlign: "center",
//     color: "#6b7280",
//     fontSize: 14,
//     marginBottom: 8,
//   },
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
//   profileBox: { flex: 1, alignItems: "center" },
//   profileTitle: { fontSize: 20, fontWeight: "800", marginBottom: 10 },
//   profileText: { fontSize: 14, color: "#374151", marginVertical: 4 },
//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     marginTop: 10,
//     elevation: 2,
//   },
//   menuText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#111827",
//     marginLeft: 10,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: "#e5e7eb",
//     width: "100%",
//     marginVertical: 10,
//   },
// });
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
//   StatusBar,
//   Animated,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import * as Location from "expo-location";
// import Slider from "@react-native-community/slider";
// import Modal from "react-native-modal";
// import { useNavigation } from "@react-navigation/native";

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
//   const [activeTab, setActiveTab] = useState("current"); // ✅ default tab = Active jobs
//   const [isSidebarVisible, setSidebarVisible] = useState(false);

//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   const openSidebar = () => setSidebarVisible(true);
//   const closeSidebar = () => setSidebarVisible(false);

//   useEffect(() => {
//     loadAllData();
//   }, [radius]);

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
//         setProfile(res.data);
//         await AsyncStorage.setItem("doerProfile", JSON.stringify(res.data));
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
//       await loadAvailableJobs(coords);
//     } catch (err) {
//       console.warn("Location Error:", err.message);
//     }
//   };

//   const loadAvailableJobs = async (coords) => {
//     try {
//       const res = await fetchAvailableJobs(coords?.lat, coords?.lon, radius);
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
//       console.warn("Current Jobs Error:", err.message);
//     }
//   };

//   const loadJobHistory = async () => {
//     try {
//       const res = await fetchJobHistory(0, 10, ["updatedAt,desc"]);
//       setJobHistory(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Job History Error:", err.message);
//     }
//   };

//   const handleAcceptJob = async (jobId) => {
//     try {
//       setAcceptingMap((p) => ({ ...p, [jobId]: true }));
//       const res = await acceptJob(jobId);
//       Alert.alert("Success", res?.message || "Job accepted!");
//       await Promise.all([
//         loadCurrentJobs(),
//         location && loadAvailableJobs(location),
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

//   const renderJobCard = (item, type = "available", index) => {
//     const accepting = acceptingMap[item.jobId] || false;
//     const statusColor =
//       item.status === "COMPLETED"
//         ? "#22c55e"
//         : item.status === "ACTIVE"
//         ? "#2563eb"
//         : "#f59e0b";

//     const distance = item.Distance ?? item.distance;

//     return (
//       <Animated.View
//         key={`${type}-${item.jobId}-${index}`}
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

//         <View style={styles.metaRow}>
//           <MaterialIcons name="category" size={16} color="#475569" />
//           <Text style={styles.metaText}>
//             {item.skillCategory || item.category || "General"}
//           </Text>
//         </View>

//         {item.locationArea && (
//           <View style={styles.metaRow}>
//             <Ionicons name="location-outline" size={16} color="#475569" />
//             <Text style={styles.metaText}>{item.locationArea}</Text>
//             {distance && (
//               <View style={styles.distanceBadge}>
//                 <Text style={styles.distanceText}>
//                   {distance.toFixed(1)} km
//                 </Text>
//               </View>
//             )}
//           </View>
//         )}

//         {item.posterName && (
//           <View style={styles.metaRow}>
//             <Ionicons name="person-outline" size={16} color="#475569" />
//             <Text style={styles.metaText}>By {item.posterName}</Text>
//           </View>
//         )}

//         {item.amountInRs > 0 && (
//           <View style={styles.metaRow}>
//             <Ionicons name="cash-outline" size={16} color="#475569" />
//             <Text
//               style={[styles.metaText, { fontWeight: "700", color: "#16a34a" }]}
//             >
//               ₹ {item.amountInRs}
//             </Text>
//           </View>
//         )}

//         {type === "available" && (
//           <TouchableOpacity
//             style={styles.acceptBtn}
//             onPress={() => handleAcceptJob(item.jobId)}
//             disabled={accepting}
//           >
//             {accepting ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.acceptText}>Accept Job</Text>
//             )}
//           </TouchableOpacity>
//         )}
//       </Animated.View>
//     );
//   };

//   const renderContent = () => {
//     if (activeTab === "available")
//       return (
//         <ScrollView contentContainerStyle={styles.scroll}>
//           <View style={styles.radiusBox}>
//             <Text style={styles.radiusText}>
//               Search Radius: {radius.toFixed(1)} km
//             </Text>
//             <Slider
//               style={{ width: "100%", height: 40 }}
//               minimumValue={1}
//               maximumValue={15}
//               step={0.5}
//               value={radius}
//               onValueChange={setRadius}
//               minimumTrackTintColor="#2563eb"
//               maximumTrackTintColor="#ddd"
//               thumbTintColor="#2563eb"
//             />
//           </View>
//           {availableJobs.length > 0 ? (
//             availableJobs.map((j, i) => renderJobCard(j, "available", i))
//           ) : (
//             <Text style={styles.emptyText}>No nearby jobs found.</Text>
//           )}
//         </ScrollView>
//       );

//     if (activeTab === "current")
//       return (
//         <ScrollView contentContainerStyle={styles.scroll}>
//           {currentJobs.length > 0 ? (
//             currentJobs.map((j, i) => renderJobCard(j, "current", i))
//           ) : (
//             <Text style={styles.emptyText}>No active jobs.</Text>
//           )}
//         </ScrollView>
//       );

//     if (activeTab === "history")
//       return (
//         <ScrollView contentContainerStyle={styles.scroll}>
//           {jobHistory.length > 0 ? (
//             jobHistory.map((j, i) => renderJobCard(j, "history", i))
//           ) : (
//             <Text style={styles.emptyText}>No completed jobs.</Text>
//           )}
//         </ScrollView>
//       );

//     if (activeTab === "profile")
//       return (
//         <View style={styles.profileBox}>
//           <Text style={styles.profileTitle}>👤 Profile</Text>
//           {profile ? (
//             <>
//               <Text style={styles.profileText}>Name: {profile.name}</Text>
//               <Text style={styles.profileText}>Email: {profile.email}</Text>
//               <Text style={styles.profileText}>Phone: {profile.phone}</Text>

//               <TouchableOpacity style={styles.profileBtn} onPress={openSidebar}>
//                 <Text style={styles.profileBtnText}>Open Profile Menu</Text>
//               </TouchableOpacity>
//             </>
//           ) : (
//             <Text style={styles.emptyText}>No profile data found.</Text>
//           )}
//         </View>
//       );
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor="#111827" barStyle="light-content" />
//       <View style={styles.topBar}>
//         <Text style={styles.topTitle}>Doer Dashboard</Text>
//       </View>

//       {renderContent()}

//       {/* ✅ Sidebar Modal */}
//       <Modal
//         isVisible={isSidebarVisible}
//         animationIn="slideInRight"
//         animationOut="slideOutRight"
//         onBackdropPress={closeSidebar}
//         style={{ margin: 0 }}
//       >
//         <View style={styles.sidebarContainer}>
//           <View style={styles.sidebarHeader}>
//             <Text style={styles.sidebarTitle}>Profile Menu</Text>
//             <TouchableOpacity onPress={closeSidebar}>
//               <Ionicons name="close" size={24} color="#000" />
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() => {
//               closeSidebar();
//               navigation.navigate("DoerProfile");
//             }}
//           >
//             <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
//             <Text style={styles.menuText}>View Profile</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() => {
//               closeSidebar();
//               navigation.navigate("EditProfile");
//             }}
//           >
//             <Ionicons name="create-outline" size={20} color="#2563eb" />
//             <Text style={styles.menuText}>Edit Profile</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.menuItem,
//               !profile?.isPhoneVerified && { opacity: 0.5 },
//             ]}
//             disabled={!profile?.isPhoneVerified}
//             onPress={() => {
//               if (!profile?.isPhoneVerified) {
//                 Alert.alert("Phone not verified", "Verify your phone first.");
//                 return;
//               }
//               closeSidebar();
//               navigation.navigate("KYCPage");
//             }}
//           >
//             <Ionicons name="document-text-outline" size={20} color="#2563eb" />
//             <Text style={styles.menuText}>Upload KYC</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>

//       {/* ✅ Bottom Tab Bar */}
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
//   scroll: { padding: 16, paddingBottom: 80 },
//   radiusBox: {
//     padding: 14,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     marginBottom: 16,
//     elevation: 3,
//   },
//   radiusText: { fontWeight: "700", color: "#111827", marginBottom: 6 },
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
//   distanceBadge: {
//     marginLeft: 8,
//     backgroundColor: "#dbeafe",
//     borderRadius: 10,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//   },
//   distanceText: { color: "#1e3a8a", fontSize: 12, fontWeight: "600" },
//   acceptBtn: {
//     marginTop: 10,
//     backgroundColor: "#2563eb",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   acceptText: { color: "#fff", fontWeight: "800" },
//   emptyText: {
//     textAlign: "center",
//     color: "#6b7280",
//     fontSize: 14,
//     marginBottom: 8,
//   },
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
//   profileBox: { flex: 1, justifyContent: "center", alignItems: "center" },
//   profileTitle: { fontSize: 20, fontWeight: "800", marginBottom: 10 },
//   profileText: { fontSize: 14, color: "#374151", marginVertical: 4 },
//   profileBtn: {
//     backgroundColor: "#2563eb",
//     marginTop: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   profileBtnText: { color: "#fff", fontWeight: "700" },

//   // Sidebar Styles
//   sidebarContainer: {
//     backgroundColor: "#fff",
//     width: "75%",
//     height: "100%",
//     alignSelf: "flex-end",
//     padding: 20,
//     borderTopLeftRadius: 16,
//     borderBottomLeftRadius: 16,
//   },
//   sidebarHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   sidebarTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 12,
//   },
//   menuText: {
//     marginLeft: 10,
//     fontSize: 15,
//     fontWeight: "500",
//     color: "#111827",
//   },
// });
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
//   StatusBar,
//   Animated,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import * as Location from "expo-location";
// import Slider from "@react-native-community/slider";
// import Modal from "react-native-modal";
// import { useNavigation } from "@react-navigation/native";
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

//   useEffect(() => {
//     loadAllData();
//   }, [radius]);

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
//         setProfile(res.data);
//         await AsyncStorage.setItem("doerProfile", JSON.stringify(res.data));
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
//       await loadAvailableJobs(coords);
//     } catch (err) {
//       console.warn("Location Error:", err.message);
//     }
//   };

//   const loadAvailableJobs = async (coords) => {
//     try {
//       const res = await fetchAvailableJobs(coords?.lat, coords?.lon, radius);
//       setAvailableJobs(res?.data?.content || []);
//     } catch {
//       setAvailableJobs([]);
//     }
//   };

//   const loadCurrentJobs = async () => {
//     try {
//       const res = await fetchCurrentJobs();
//       setCurrentJobs(res?.data?.content || []);
//     } catch {}
//   };

//   const loadJobHistory = async () => {
//     try {
//       const res = await fetchJobHistory(0, 10, ["updatedAt,desc"]);
//       setJobHistory(res?.data?.content || []);
//     } catch {}
//   };

//   const handleAcceptJob = async (jobId) => {
//     try {
//       setAcceptingMap((p) => ({ ...p, [jobId]: true }));
//       const res = await acceptJob(jobId);
//       Alert.alert("Success", res?.message || "Job accepted!");
//       await Promise.all([
//         loadCurrentJobs(),
//         location && loadAvailableJobs(location),
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

//   const renderJobCard = (item, type, index) => {
//     const accepting = acceptingMap[item.jobId] || false;
//     const statusColor =
//       item.status === "COMPLETED"
//         ? "#22c55e"
//         : item.status === "ACTIVE"
//         ? "#2563eb"
//         : "#f59e0b";

//     const distance = item.Distance ?? item.distance;

//     return (
//       <Animated.View
//         key={`${type}-${item.jobId}-${index}`}
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
//           </View>
//         )}
//         {type === "available" && (
//           <TouchableOpacity
//             style={styles.acceptBtn}
//             onPress={() => handleAcceptJob(item.jobId)}
//             disabled={accepting}
//           >
//             {accepting ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.acceptText}>Accept Job</Text>
//             )}
//           </TouchableOpacity>
//         )}
//         {/* ✅ Logout Button */}
//         <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
//           <Ionicons name="log-out-outline" size={20} color="#ef4444" />
//           <Text style={[styles.menuText, { color: "#ef4444" }]}>Logout</Text>
//         </TouchableOpacity>
//       </Animated.View>
//     );
//   };

//   const renderProfileSection = () => {
//     const acceptedCount = currentJobs.length;
//     const completedCount = jobHistory.length;
//     const rating = profile?.rating ?? 4.7;

//     return (
//       <ScrollView style={styles.profileContainer}>
//         <View style={styles.profileHeader}>
//           <Text style={styles.profileName}>{profile?.name || "New User"}</Text>
//           <Text style={styles.profilePhone}>
//             {profile?.phone || "No phone"}
//           </Text>
//           <Text style={styles.memberSince}>
//             Member since {profile?.createdAt?.slice(0, 10) || "—"}
//           </Text>
//         </View>

//         <View style={styles.statsRow}>
//           <View style={styles.statBox}>
//             <Text style={styles.statValue}>{acceptedCount}</Text>
//             <Text style={styles.statLabel}>Active Jobs</Text>
//           </View>
//           <View style={styles.statBox}>
//             <Text style={styles.statValue}>{completedCount}</Text>
//             <Text style={styles.statLabel}>Completed</Text>
//           </View>
//           <View style={styles.statBox}>
//             <Text style={styles.statValue}>{rating.toFixed(1)}</Text>
//             <Text style={styles.statLabel}>Rating</Text>
//           </View>
//         </View>

//         <Text style={styles.sectionTitle}>My Options</Text>
//         {/* ✅ View Profile Navigation */}
//         <TouchableOpacity
//           style={styles.menuRow}
//           onPress={() => navigation.navigate("DoerProfile")}
//         >
//           <Ionicons name="create-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Profile</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.menuRow}
//           onPress={() => navigation.navigate("EditProfile")}
//         >
//           <Ionicons name="create-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>update Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[
//             styles.menuRow,
//             !profile?.isPhoneVerified && { opacity: 0.5 },
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
//           <Text style={styles.menuText}>Upload KYC</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     );
//   };

//   const renderContent = () => {
//     if (activeTab === "available")
//       return (
//         <ScrollView contentContainerStyle={styles.scroll}>
//           <View style={styles.radiusBox}>
//             <Text style={styles.radiusText}>
//               Search Radius: {radius.toFixed(1)} km
//             </Text>
//             <Slider
//               style={{ width: "100%", height: 40 }}
//               minimumValue={1}
//               maximumValue={15}
//               step={0.5}
//               value={radius}
//               onValueChange={setRadius}
//               minimumTrackTintColor="#2563eb"
//               maximumTrackTintColor="#ddd"
//               thumbTintColor="#2563eb"
//             />
//           </View>
//           {availableJobs.length > 0 ? (
//             availableJobs.map((j, i) => renderJobCard(j, "available", i))
//           ) : (
//             <Text style={styles.emptyText}>No nearby jobs found.</Text>
//           )}
//         </ScrollView>
//       );

//     if (activeTab === "current")
//       return (
//         <ScrollView contentContainerStyle={styles.scroll}>
//           {currentJobs.length > 0 ? (
//             currentJobs.map((j, i) => renderJobCard(j, "current", i))
//           ) : (
//             <Text style={styles.emptyText}>No active jobs.</Text>
//           )}
//         </ScrollView>
//       );

//     if (activeTab === "history")
//       return (
//         <ScrollView contentContainerStyle={styles.scroll}>
//           {jobHistory.length > 0 ? (
//             jobHistory.map((j, i) => renderJobCard(j, "history", i))
//           ) : (
//             <Text style={styles.emptyText}>No completed jobs.</Text>
//           )}
//         </ScrollView>
//       );

//     if (activeTab === "profile") return renderProfileSection();
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
//       </View>
//       {renderContent()}
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
//   scroll: { padding: 16, paddingBottom: 80 },
//   radiusBox: {
//     padding: 14,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     marginBottom: 16,
//     elevation: 3,
//   },
//   radiusText: { fontWeight: "700", color: "#111827", marginBottom: 6 },
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
//     marginTop: 10,
//     backgroundColor: "#2563eb",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   acceptText: { color: "#fff", fontWeight: "800" },
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

//   // 🔹 Profile Styles
//   profileContainer: { flex: 1, backgroundColor: "#fff" },
//   profileHeader: {
//     backgroundColor: "#2563eb",
//     padding: 20,
//     alignItems: "center",
//   },
//   profileName: { fontSize: 18, fontWeight: "800", color: "#fff" },
//   profilePhone: { color: "#f3f4f6", marginTop: 4 },
//   memberSince: { color: "#cbd5e1", marginTop: 2 },
//   statsRow: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingVertical: 16,
//     backgroundColor: "#fff",
//   },
//   statBox: { alignItems: "center" },
//   statValue: { fontSize: 16, fontWeight: "800", color: "#111827" },
//   statLabel: { color: "#6b7280", fontSize: 12 },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#111827",
//     marginHorizontal: 16,
//     marginTop: 20,
//   },
//   menuRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 14,
//     marginHorizontal: 16,
//     borderBottomWidth: 1,
//     borderColor: "#e5e7eb",
//   },
//   menuText: { marginLeft: 10, color: "#111827", fontSize: 15 },
// });
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";
import Modal from "react-native-modal";
import { useNavigation } from "@react-navigation/native";
import {
  fetchDoerProfile,
  fetchAvailableJobs,
  fetchCurrentJobs,
  fetchJobHistory,
  acceptJob,
} from "../api/doer";

export default function DoerDashboard() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [currentJobs, setCurrentJobs] = useState([]);
  const [jobHistory, setJobHistory] = useState([]);
  const [radius, setRadius] = useState(5);
  const [location, setLocation] = useState(null);
  const [acceptingMap, setAcceptingMap] = useState({});
  const [activeTab, setActiveTab] = useState("current");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAllData();
  }, [radius]);

  const animateIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const loadAllData = async () => {
    setLoading(true);
    await loadProfile();
    await getLocationAndJobs();
    await loadCurrentJobs();
    await loadJobHistory();
    setLoading(false);
    animateIn();
  };

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem("doerProfile");
      if (stored) setProfile(JSON.parse(stored));
      else {
        const res = await fetchDoerProfile();
        setProfile(res.data);
        await AsyncStorage.setItem("doerProfile", JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn("Profile Error:", err.message);
    }
  };

  const getLocationAndJobs = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location Denied", "Enable location to see nearby jobs.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const coords = { lat: loc.coords.latitude, lon: loc.coords.longitude };
      setLocation(coords);
      await loadAvailableJobs(coords);
    } catch (err) {
      console.warn("Location Error:", err.message);
    }
  };

  const loadAvailableJobs = async (coords) => {
    try {
      const res = await fetchAvailableJobs(coords?.lat, coords?.lon, radius);
      setAvailableJobs(res?.data?.content || []);
    } catch {
      setAvailableJobs([]);
    }
  };

  const loadCurrentJobs = async () => {
    try {
      const res = await fetchCurrentJobs();
      setCurrentJobs(res?.data?.content || []);
    } catch {}
  };

  const loadJobHistory = async () => {
    try {
      const res = await fetchJobHistory(0, 10, ["updatedAt,desc"]);
      setJobHistory(res?.data?.content || []);
    } catch {}
  };

  const handleAcceptJob = async (jobId) => {
    try {
      setAcceptingMap((p) => ({ ...p, [jobId]: true }));
      const res = await acceptJob(jobId);
      Alert.alert("Success", res?.message || "Job accepted!");
      await Promise.all([
        loadCurrentJobs(),
        location && loadAvailableJobs(location),
        loadJobHistory(),
      ]);
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setAcceptingMap((p) => ({ ...p, [jobId]: false }));
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["authToken", "doerProfile"]);
          navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
        },
      },
    ]);
  };

  const renderJobCard = (item, type, index) => {
    const accepting = acceptingMap[item.jobId] || false;
    const statusColor =
      item.status === "COMPLETED"
        ? "#22c55e"
        : item.status === "ACTIVE"
        ? "#2563eb"
        : "#f59e0b";

    const distance = item.Distance ?? item.distance;

    return (
      <Animated.View
        key={`${type}-${item.jobId}-${index}`}
        style={[
          styles.jobCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.title}</Text>
          <View
            style={[styles.statusTag, { backgroundColor: statusColor + "22" }]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.desc} numberOfLines={2}>
          {item.description || "No description available"}
        </Text>
        {item.amountInRs > 0 && (
          <View style={styles.metaRow}>
            <Ionicons name="cash-outline" size={16} color="#475569" />
            <Text
              style={[styles.metaText, { fontWeight: "700", color: "#16a34a" }]}
            >
              ₹ {item.amountInRs}
            </Text>
          </View>
        )}
        {type === "available" && (
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => handleAcceptJob(item.jobId)}
            disabled={accepting}
          >
            {accepting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.acceptText}>Accept Job</Text>
            )}
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  const renderProfileSection = () => {
    const acceptedCount = currentJobs.length;
    const completedCount = jobHistory.length;
    const rating = profile?.rating ?? 4.7;
    const isNewUser = !profile?.isKycDone && !profile?.isProfileUpdated;

    return (
      <ScrollView style={styles.profileContainer}>
        <View style={styles.profileHeader}>
          <Text style={styles.profileName}>{profile?.name || "New User"}</Text>
          <Text style={styles.profilePhone}>
            {profile?.phone || "No phone"}
          </Text>
          <Text style={styles.memberSince}>
            Member since {profile?.createdAt?.slice(0, 10) || "—"}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{acceptedCount}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>My Account</Text>

        {!isNewUser && (
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate("DoerProfile")}
          >
            <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
            <Text style={styles.menuText}>View Profile</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Ionicons name="create-outline" size={20} color="#2563eb" />
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuRow,
            !profile?.isPhoneVerified && { opacity: 0.5 },
          ]}
          disabled={!profile?.isPhoneVerified}
          onPress={() => {
            if (!profile?.isPhoneVerified) {
              Alert.alert("Phone not verified", "Verify your phone first.");
              return;
            }
            navigation.navigate("KYCPage");
          }}
        >
          <Ionicons name="document-text-outline" size={20} color="#2563eb" />
          <Text style={styles.menuText}>Upload KYC</Text>
        </TouchableOpacity>

        {/* ✅ Logout Button */}
        <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={[styles.menuText, { color: "#ef4444" }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderContent = () => {
    if (activeTab === "available")
      return (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.radiusBox}>
            <Text style={styles.radiusText}>
              Search Radius: {radius.toFixed(1)} km
            </Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={1}
              maximumValue={15}
              step={0.5}
              value={radius}
              onValueChange={setRadius}
              minimumTrackTintColor="#2563eb"
              maximumTrackTintColor="#ddd"
              thumbTintColor="#2563eb"
            />
          </View>
          {availableJobs.length > 0 ? (
            availableJobs.map((j, i) => renderJobCard(j, "available", i))
          ) : (
            <Text style={styles.emptyText}>No nearby jobs found.</Text>
          )}
        </ScrollView>
      );

    if (activeTab === "current")
      return (
        <ScrollView contentContainerStyle={styles.scroll}>
          {currentJobs.length > 0 ? (
            currentJobs.map((j, i) => renderJobCard(j, "current", i))
          ) : (
            <Text style={styles.emptyText}>No active jobs.</Text>
          )}
        </ScrollView>
      );

    if (activeTab === "history")
      return (
        <ScrollView contentContainerStyle={styles.scroll}>
          {jobHistory.length > 0 ? (
            jobHistory.map((j, i) => renderJobCard(j, "history", i))
          ) : (
            <Text style={styles.emptyText}>No completed jobs.</Text>
          )}
        </ScrollView>
      );

    if (activeTab === "profile") return renderProfileSection();
  };

  if (loading)
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#111827" barStyle="light-content" />
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Doer Dashboard</Text>
      </View>
      {renderContent()}
      <View style={styles.bottomNav}>
        {[
          { key: "available", icon: "briefcase-outline", label: "Available" },
          { key: "current", icon: "flash-outline", label: "Active" },
          { key: "history", icon: "time-outline", label: "History" },
          { key: "profile", icon: "person-outline", label: "Profile" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={22}
              color={activeTab === tab.key ? "#2563eb" : "#9ca3af"}
            />
            <Text
              style={[
                styles.navLabel,
                { color: activeTab === tab.key ? "#2563eb" : "#9ca3af" },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    height: 56,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  topTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },
  scroll: { padding: 16, paddingBottom: 80 },
  radiusBox: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },
  radiusText: { fontWeight: "700", color: "#111827", marginBottom: 6 },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  desc: { color: "#475569", fontSize: 13, marginVertical: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  metaText: { marginLeft: 6, color: "#475569", fontSize: 13 },
  statusTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 12, fontWeight: "700" },
  acceptBtn: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptText: { color: "#fff", fontWeight: "800" },
  emptyText: { textAlign: "center", color: "#6b7280", fontSize: 14 },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navItem: { alignItems: "center", justifyContent: "center" },
  navLabel: { fontSize: 12, marginTop: 2 },
  // Profile
  profileContainer: { flex: 1, backgroundColor: "#fff" },
  profileHeader: {
    backgroundColor: "#2563eb",
    padding: 20,
    alignItems: "center",
  },
  profileName: { fontSize: 18, fontWeight: "800", color: "#fff" },
  profilePhone: { color: "#f3f4f6", marginTop: 4 },
  memberSince: { color: "#cbd5e1", marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  statBox: { alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "800", color: "#111827" },
  statLabel: { color: "#6b7280", fontSize: 12 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginHorizontal: 16,
    marginTop: 20,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  menuText: { marginLeft: 10, color: "#111827", fontSize: 15 },
});

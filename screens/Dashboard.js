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

//   // ✅ UPDATED renderJobCard with View Details for all tabs
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

//         {/* ✅ Buttons Area */}
//         <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
//           {activeTab === "available" && (
//             <TouchableOpacity
//               style={[styles.actionBtn, { backgroundColor: "#2563eb" }]}
//               onPress={() => handleAcceptJob(item.jobId)}
//               disabled={accepting}
//             >
//               {accepting ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.actionText}>Accept Job</Text>
//               )}
//             </TouchableOpacity>
//           )}

//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: "#6b7280" }]}
//             onPress={() =>
//               navigation.navigate("JobDetails", { jobId: item.jobId })
//             }
//           >
//             <Text style={styles.actionText}>View Details</Text>
//           </TouchableOpacity>
//         </View>
//       </Animated.View>
//     );
//   };

//   const renderProfileSection = () => {
//     const acceptedCount = currentJobs.length;
//     const completedCount = jobHistory.length;
//     const rating = profile?.rating ?? 4.7;

//     return (
//       <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
//         {/* HEADER */}
//         <View
//           style={{
//             backgroundColor: "#2563eb",
//             padding: 20,
//             alignItems: "center",
//           }}
//         >
//           <Text style={{ fontSize: 18, fontWeight: "800", color: "#fff" }}>
//             {profile?.name || "Doer"}
//           </Text>
//           <Text style={{ color: "#f3f4f6", marginTop: 4 }}>
//             {profile?.phone || "No phone"}
//           </Text>
//           <Text style={{ color: "#cbd5e1", marginTop: 2 }}>
//             Member since {profile?.createdAt?.slice(0, 10) || "—"}
//           </Text>
//         </View>

//         {/* JOB STATS */}
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

//         {/* PERSONAL INFO */}
//         <View style={{ paddingHorizontal: 16 }}>
//           <Text
//             style={{
//               fontSize: 16,
//               fontWeight: "700",
//               color: "#111827",
//               marginBottom: 8,
//             }}
//           >
//             Personal Information
//           </Text>

//           {[
//             ["Email", profile?.email],
//             ["Bio", profile?.bio],
//             ["Skills", profile?.skills?.join(", ")],
//           ].map(([label, value], idx) => (
//             <View
//               key={idx}
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 borderBottomWidth: 0.5,
//                 borderColor: "#e5e7eb",
//                 paddingVertical: 8,
//               }}
//             >
//               <Text style={{ fontWeight: "600", color: "#374151" }}>
//                 {label}
//               </Text>
//               <Text
//                 style={{
//                   color: "#111827",
//                   flex: 1,
//                   textAlign: "right",
//                   marginLeft: 10,
//                 }}
//               >
//                 {value || "—"}
//               </Text>
//             </View>
//           ))}
//         </View>

//         {/* VERIFICATION INFO */}
//         <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
//           <Text
//             style={{
//               fontSize: 16,
//               fontWeight: "700",
//               color: "#111827",
//               marginBottom: 8,
//             }}
//           >
//             Verification Details
//           </Text>

//           {[
//             ["Phone Verified", profile?.isPhoneVerified ? "Yes" : "No"],
//             ["KYC Level", profile?.kycLevel?.toString()],
//             ["Account Verified", profile?.isVerified ? "Yes" : "No"],
//             ["Verification Status", profile?.verificationStatus],
//             ["Rejection Reason", profile?.rejectionReason],
//           ].map(([label, value], idx) => (
//             <View
//               key={idx}
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 borderBottomWidth: 0.5,
//                 borderColor: "#e5e7eb",
//                 paddingVertical: 8,
//               }}
//             >
//               <Text style={{ fontWeight: "600", color: "#374151" }}>
//                 {label}
//               </Text>
//               <Text
//                 style={{
//                   color:
//                     label === "Verification Status" &&
//                     value?.toLowerCase() === "rejected"
//                       ? "#dc2626"
//                       : "#111827",
//                   flex: 1,
//                   textAlign: "right",
//                   marginLeft: 10,
//                 }}
//               >
//                 {value || "—"}
//               </Text>
//             </View>
//           ))}
//         </View>

//         {/* ACTION BUTTONS */}
//         <Text
//           style={{
//             fontSize: 16,
//             fontWeight: "700",
//             color: "#111827",
//             marginHorizontal: 16,
//             marginTop: 20,
//           }}
//         >
//           Actions
//         </Text>

//         <TouchableOpacity
//           style={styles.profileBtn}
//           onPress={() => navigation.navigate("DoerProfile")}
//         >
//           <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
//           <Text style={styles.profileBtnText}>View Profile</Text>
//         </TouchableOpacity>

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

//         <View style={{ height: 60 }} />
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
//   title: { fontSize: 16, fontWeight: "700", color: "#111827" },
//   desc: { fontSize: 13, color: "#4b5563", marginTop: 4 },
//   metaRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 6,
//   },
//   metaText: { fontSize: 13, color: "#475569", marginLeft: 4 },
//   statusTag: {
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 8,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   actionBtn: {
//     flex: 1,
//     paddingVertical: 8,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   actionText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   emptyText: {
//     textAlign: "center",
//     color: "#6b7280",
//     fontSize: 14,
//     marginTop: 40,
//   },
//   profileBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 14,
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 10,
//     marginHorizontal: 16,
//     marginTop: 12,
//     backgroundColor: "#fff",
//   },
//   profileBtnText: {
//     marginLeft: 10,
//     fontSize: 15,
//     color: "#111827",
//     fontWeight: "600",
//   },
//   bottomNav: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 10,
//     backgroundColor: "#fff",
//     borderTopWidth: 1,
//     borderTopColor: "#e5e7eb",
//     elevation: 10,
//   },
//   navItem: { alignItems: "center", justifyContent: "center" },
//   navLabel: { fontSize: 12, fontWeight: "600", marginTop: 2 },
// });
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Animated,
  FlatList,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useDebouncedCallback } from "use-debounce";

import {
  fetchDoerProfile,
  fetchAvailableJobs,
  fetchCurrentJobs,
  fetchJobHistory,
  acceptJob,
} from "../api/doer";

/**
 * Optimized DoerDashboard
 * - Shows dashboard immediately (no blocking on GPS)
 * - Loads location & available jobs in background
 * - Uses cached last known location first (fast)
 * - Live watcher runs only when user enables "Live" toggle
 */

export default function DoerDashboard() {
  const navigation = useNavigation();

  // App state
  const [profile, setProfile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true); // only for initial small spinner
  const [availableJobs, setAvailableJobs] = useState([]);
  const [currentJobs, setCurrentJobs] = useState([]);
  const [jobHistory, setJobHistory] = useState([]);

  const [radius, setRadius] = useState(5);
  const [location, setLocation] = useState(null); // { lat, lon }
  const [liveTrackingEnabled, setLiveTrackingEnabled] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [acceptingMap, setAcceptingMap] = useState({});
  const [activeTab, setActiveTab] = useState("current");

  // refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const locationWatcherRef = useRef(null);
  const mountedRef = useRef(true);

  // Debounced loader
  const debouncedLoadJobs = useDebouncedCallback(
    async (coords, rad) => {
      if (!coords) return;
      await loadAvailableJobs(coords, rad);
    },
    700,
    { leading: false }
  );

  // Animate in
  const animateIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  };

  // ---------- MOUNT ----------
  useEffect(() => {
    mountedRef.current = true;

    // Fast non-blocking startup:
    // 1) show UI quickly
    // 2) start background tasks to fill data
    (async () => {
      try {
        await loadProfile(); // quick (cached or network)
        // load current & history quickly so UI has immediate content
        loadCurrentJobs();
        loadJobHistory();

        // Start background location + available jobs (non-blocking)
        startLocationFlow(); // does not await - runs in background
      } catch (err) {
        console.warn("Startup error:", err);
      } finally {
        // Hide initial spinner quickly — UI is ready
        if (mountedRef.current) {
          setInitialLoading(false);
          animateIn();
        }
      }
    })();

    return () => {
      mountedRef.current = false;
      stopLocationWatcher();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh current/history when screen focused
  useFocusEffect(
    useCallback(() => {
      loadCurrentJobs();
      loadJobHistory();
    }, [])
  );

  // Watcher toggle effect
  useEffect(() => {
    if (liveTrackingEnabled) startLocationWatcher();
    else stopLocationWatcher();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveTrackingEnabled]);

  // ---------- PROFILE / JOB LOADERS ----------
  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem("doerProfile");
      if (stored) {
        setProfile(JSON.parse(stored));
        // Refresh in background
        fetchDoerProfile()
          .then((res) => {
            if (res?.data) {
              setProfile(res.data);
              AsyncStorage.setItem(
                "doerProfile",
                JSON.stringify(res.data)
              ).catch(() => {});
            }
          })
          .catch(() => {});
      } else {
        const res = await fetchDoerProfile();
        if (res?.data) {
          setProfile(res.data);
          await AsyncStorage.setItem("doerProfile", JSON.stringify(res.data));
        }
      }
    } catch (err) {
      console.warn("Profile Error:", err);
      setProfile(null);
    }
  };

  const loadAvailableJobs = async (coords = location, rad = radius) => {
    if (!coords) return;
    setLoadingJobs(true);
    try {
      const res = await fetchAvailableJobs(coords.lat, coords.lon, rad, 0, 20, [
        "postedAgo,desc",
      ]);
      // API might return { data: { content: [...] } } or direct structure — keep defensive
      const jobs = res?.data?.content || res?.data || res?.content || [];
      setAvailableJobs(jobs);
    } catch (err) {
      console.warn("Available Jobs Error:", err?.message || err);
      setAvailableJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadCurrentJobs = async () => {
    try {
      const res = await fetchCurrentJobs();
      const jobs = res?.data?.content || res?.data || res?.content || [];
      setCurrentJobs(jobs);
    } catch (err) {
      console.warn("Current Jobs Error:", err?.message || err);
      setCurrentJobs([]);
    }
  };

  const loadJobHistory = async () => {
    try {
      const res = await fetchJobHistory(0, 10, ["updatedAt,desc"]);
      const jobs = res?.data?.content || res?.data || res?.content || [];
      setJobHistory(jobs);
    } catch (err) {
      console.warn("Job History Error:", err?.message || err);
      setJobHistory([]);
    }
  };

  // ---------- LOCATION HELPERS (background-friendly) ----------
  const startLocationFlow = async () => {
    // Request permission but don't block UI
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // permission denied: nothing to do
        return;
      }

      // Try fast last known position first
      let last = null;
      try {
        last = await Location.getLastKnownPositionAsync();
      } catch (e) {
        // ignore
      }

      if (last && mountedRef.current) {
        const coords = {
          lat: last.coords.latitude,
          lon: last.coords.longitude,
        };
        setLocation(coords);
        debouncedLoadJobs(coords, 100);
      } else {
        // fallback: getCurrentPosition but with conservative options (not blocking UI)
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            maximumAge: 10000,
            timeout: 5000,
          });
          if (loc?.coords && mountedRef.current) {
            const coords = {
              lat: loc.coords.latitude,
              lon: loc.coords.longitude,
            };
            setLocation(coords);
            debouncedLoadJobs(coords, radius);
          }
        } catch (e) {
          // ignore user/device slow GPS
          console.warn("Slow GPS or timeout:", e?.message || e);
        }
      }
      // Do not start watcher here; user controls via toggle (or call startLocationWatcher() if you want auto)
    } catch (err) {
      console.warn("startLocationFlow error:", err);
    }
  };

  const startLocationWatcher = async () => {
    if (locationWatcherRef.current) return;
    try {
      const options = {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 25,
      };
      locationWatcherRef.current = await Location.watchPositionAsync(
        options,
        (loc) => {
          if (!loc?.coords) return;
          const newCoords = {
            lat: loc.coords.latitude,
            lon: loc.coords.longitude,
          };
          setLocation(newCoords);
          // Debounced jobs reload avoids hammering API
          debouncedLoadJobs(newCoords, radius);
        }
      );
    } catch (err) {
      console.warn("startLocationWatcher error:", err);
    }
  };

  const stopLocationWatcher = () => {
    if (locationWatcherRef.current) {
      try {
        locationWatcherRef.current.remove();
      } catch (e) {}
      locationWatcherRef.current = null;
    }
  };

  // ---------- Accept Job ----------
  const handleAcceptJob = async (jobId) => {
    try {
      setAcceptingMap((p) => ({ ...p, [jobId]: true }));
      const res = await acceptJob(jobId);
      Alert.alert("Success", res?.message || "Job accepted!");
      await Promise.allSettled([
        loadCurrentJobs(),
        location ? loadAvailableJobs(location, radius) : Promise.resolve(),
        loadJobHistory(),
      ]);
    } catch (err) {
      console.warn("Accept job error:", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setAcceptingMap((p) => ({ ...p, [jobId]: false }));
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      stopLocationWatcher();
      navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
    } catch {
      Alert.alert("Error", "Unable to logout. Try again.");
    }
  };

  // ---------- Render Helpers ----------
  const renderJobCard = ({ item, index }) => {
    const accepting = acceptingMap[item.jobId] || false;
    const statusColor =
      item.status === "COMPLETED"
        ? "#22c55e"
        : item.status === "ACTIVE"
        ? "#2563eb"
        : "#f59e0b";

    return (
      <Animated.View
        key={`${item.jobId ?? item.id}-${index}`}
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
            {item.distanceKm != null && (
              <Text style={[styles.metaText, { marginLeft: 10 }]}>
                {Number(item.distanceKm).toFixed(1)} km away
              </Text>
            )}
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          {activeTab === "available" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#2563eb" }]}
              onPress={() => handleAcceptJob(item.jobId)}
              disabled={accepting}
            >
              {accepting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionText}>Accept Job</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#6b7280" }]}
            onPress={() =>
              navigation.navigate("JobDetails", {
                jobId: item.jobId ?? item.id,
              })
            }
          >
            <Text style={styles.actionText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderProfileSection = () => {
    const acceptedCount = currentJobs.length;
    const completedCount = jobHistory.length;
    const rating = profile?.rating ?? 4.7;

    return (
      <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{
            backgroundColor: "#2563eb",
            padding: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#fff" }}>
            {profile?.name || "Doer"}
          </Text>
          <Text style={{ color: "#f3f4f6", marginTop: 4 }}>
            {profile?.phone || "No phone"}
          </Text>
          <Text style={{ color: "#cbd5e1", marginTop: 2 }}>
            Member since {profile?.createdAt?.slice(0, 10) || "—"}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            paddingVertical: 16,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>
              {acceptedCount}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>Active Jobs</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>
              {completedCount}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>Completed</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>
              {rating.toFixed(1)}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>Rating</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Personal Information
          </Text>

          {[
            ["Email", profile?.email],
            ["Bio", profile?.bio],
            ["Skills", profile?.skills?.join(", ")],
          ].map(([label, value], idx) => (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderBottomWidth: 0.5,
                borderColor: "#e5e7eb",
                paddingVertical: 8,
              }}
            >
              <Text style={{ fontWeight: "600", color: "#374151" }}>
                {label}
              </Text>
              <Text
                style={{
                  color: "#111827",
                  flex: 1,
                  textAlign: "right",
                  marginLeft: 10,
                }}
              >
                {value || "—"}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Verification Details
          </Text>

          {[
            ["Phone Verified", profile?.isPhoneVerified ? "Yes" : "No"],
            ["KYC Level", profile?.kycLevel?.toString()],
            ["Account Verified", profile?.isVerified ? "Yes" : "No"],
            ["Verification Status", profile?.verificationStatus],
            ["Rejection Reason", profile?.rejectionReason],
          ].map(([label, value], idx) => (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderBottomWidth: 0.5,
                borderColor: "#e5e7eb",
                paddingVertical: 8,
              }}
            >
              <Text style={{ fontWeight: "600", color: "#374151" }}>
                {label}
              </Text>
              <Text
                style={{
                  color:
                    label === "Verification Status" &&
                    value?.toLowerCase() === "rejected"
                      ? "#dc2626"
                      : "#111827",
                  flex: 1,
                  textAlign: "right",
                  marginLeft: 10,
                }}
              >
                {value || "—"}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#111827",
            marginHorizontal: 16,
            marginTop: 20,
          }}
        >
          Actions
        </Text>

        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate("DoerProfile")}
        >
          <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
          <Text style={styles.profileBtnText}>View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Ionicons name="create-outline" size={20} color="#2563eb" />
          <Text style={styles.profileBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.profileBtn,
            { opacity: profile?.isPhoneVerified ? 1 : 0.5 },
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
          <Text style={styles.profileBtnText}>Upload KYC</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.profileBtn, { borderColor: "#ef4444" }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={[styles.profileBtnText, { color: "#ef4444" }]}>
            Logout
          </Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    );
  };

  // ---------- RENDER ----------
  if (initialLoading) {
    // Very short initial spinner while first sync happens (usually <1s)
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#111827" barStyle="light-content" />
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Doer Dashboard</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* small inline controls */}
      <View
        style={{
          padding: 12,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "700" }}>
            Location:{" "}
            {location
              ? `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
              : "Unavailable"}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ marginRight: 8, color: "#374151" }}>Live</Text>
            <Switch
              value={liveTrackingEnabled}
              onValueChange={setLiveTrackingEnabled}
            />
          </View>
        </View>

        {location == null && (
          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#b91c1c", flex: 1 }}>
              Location not available yet. Jobs will appear when location is
              determined.
            </Text>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={startLocationFlow}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* AVAILABLE */}
      {activeTab === "available" && (
        <View style={{ flex: 1 }}>
          <View style={styles.radiusBox}>
            <Text style={styles.radiusText}>
              Search Radius: {radius.toFixed(1)} km — {availableJobs.length}{" "}
              jobs found
            </Text>

            <View style={styles.radiusOptions}>
              {[1, 3, 5, 10, 15, 30].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.radiusBtn,
                    radius === r && { backgroundColor: "#2563eb" },
                  ]}
                  onPress={() => {
                    setRadius(r);
                    if (location) debouncedLoadJobs(location, r);
                    else startLocationFlow();
                  }}
                >
                  <Text style={{ color: radius === r ? "#fff" : "#111827" }}>
                    {r} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={1}
              maximumValue={15}
              step={0.5}
              value={radius}
              onValueChange={(val) => {
                setRadius(val);
                if (location) debouncedLoadJobs(location, val);
              }}
              minimumTrackTintColor="#2563eb"
              maximumTrackTintColor="#ddd"
              thumbTintColor="#2563eb"
            />
          </View>

          {loadingJobs && (
            <View style={{ padding: 10, alignItems: "center" }}>
              <ActivityIndicator size="small" color="#2563eb" />
            </View>
          )}

          <FlatList
            data={availableJobs}
            keyExtractor={(item) =>
              item.jobId
                ? item.jobId.toString()
                : String(item.id || Math.random())
            }
            renderItem={renderJobCard}
            contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No nearby jobs yet. Increase radius or enable Live tracking.
              </Text>
            }
          />
        </View>
      )}

      {/* CURRENT / HISTORY / PROFILE */}
      {activeTab !== "available" && activeTab !== "profile" && (
        <FlatList
          data={activeTab === "current" ? currentJobs : jobHistory}
          keyExtractor={(item) =>
            item.jobId
              ? item.jobId.toString()
              : String(item.id || Math.random())
          }
          renderItem={renderJobCard}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {activeTab === "current"
                ? "No active jobs."
                : "No completed jobs."}
            </Text>
          }
        />
      )}

      {activeTab === "profile" && renderProfileSection()}

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
  logoutBtn: { position: "absolute", right: 16 },
  radiusBox: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },
  radiusText: { fontWeight: "700", color: "#111827", marginBottom: 6 },
  radiusOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  radiusBtn: { padding: 6, borderRadius: 6, backgroundColor: "#e5e7eb" },
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
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },
  desc: { fontSize: 13, color: "#4b5563", marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  metaText: { fontSize: 13, color: "#475569", marginLeft: 4 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "600" },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  actionText: { color: "#fff", fontWeight: "600" },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
    marginTop: 40,
  },
  profileBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#fff",
  },
  profileBtnText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    elevation: 10,
  },
  navItem: { alignItems: "center", justifyContent: "center" },
  navLabel: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  smallBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
});

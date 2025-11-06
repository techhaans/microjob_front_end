// import React, { useEffect, useState, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Modal,
//   Alert,
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

// export default function DoerDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [sidebarVisible, setSidebarVisible] = useState(false);
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [currentJobs, setCurrentJobs] = useState([]);
//   const [jobHistory, setJobHistory] = useState([]);
//   const [page, setPage] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [jobsLoading, setJobsLoading] = useState(false);
//   const [acceptingMap, setAcceptingMap] = useState({});
//   const [hasPendingJob, setHasPendingJob] = useState(false);

//   // ---------- Header ----------
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Doer Dashboard",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => setSidebarVisible(true)}
//           style={{ marginLeft: 12 }}
//         >
//           <Ionicons name="menu" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//       headerRight: () => (
//         <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
//           <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // ---------- Load Data ----------
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadAllData();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const loadAllData = async () => {
//     await loadProfile();
//     await loadAvailableJobs();
//     await loadCurrentJobs();
//     await loadJobHistory(true);
//     await checkPendingJob();
//   };

//   // Auto-refresh every 10 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       loadAvailableJobs();
//       loadCurrentJobs();
//     }, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
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
//       console.warn("Profile Load Error:", err.message || err);
//       setProfile(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadAvailableJobs = async () => {
//     try {
//       setJobsLoading(true);
//       const res = await fetchAvailableJobs();
//       if (res?.data?.content) setAvailableJobs(res.data.content);
//       else setAvailableJobs([]);
//     } catch (err) {
//       console.warn("Fetch Available Jobs Error:", err.message || err);
//       setAvailableJobs([]);
//     } finally {
//       setJobsLoading(false);
//     }
//   };

//   const loadCurrentJobs = async () => {
//     try {
//       const res = await fetchCurrentJobs();
//       if (res?.data?.content) setCurrentJobs(res.data.content);
//       else setCurrentJobs([]);
//     } catch (err) {
//       console.warn("Fetch Current Jobs Error:", err.message || err);
//       setCurrentJobs([]);
//     }
//   };

//   const loadJobHistory = async (reset = false) => {
//     try {
//       const nextPage = reset ? 0 : page;
//       const res = await fetchJobHistory(nextPage, 5, ["updatedAt,desc"]);

//       if (res?.data?.data?.content) {
//         const newJobs = res.data.data.content;
//         setJobHistory((prev) =>
//           reset ? newJobs : [...prev, ...newJobs.filter((j) => j)]
//         );
//         setHasMore(!res.data.data.last);
//         setPage(nextPage + 1);
//       }
//     } catch (err) {
//       console.warn("Fetch Job History Error:", err.message);
//     }
//   };

//   const checkPendingJob = async () => {
//     try {
//       const res = await fetchCurrentJobs();
//       if (res?.data?.content) {
//         const pending = res.data.content.some(
//           (job) => job.status === "ACCEPTED" || job.status === "IN_PROGRESS"
//         );
//         setHasPendingJob(pending);
//       }
//     } catch (err) {
//       console.warn("Pending Job Check Error:", err.message);
//     }
//   };

//   // ---------- Logout ----------
//   const handleLogout = async () => {
//     await AsyncStorage.multiRemove(["authToken", "doerProfile"]);
//     navigation.reset({ index: 0, routes: [{ name: "RoleSelect" }] });
//   };

//   // ---------- Accept Job ----------
//   const handleAcceptJob = async (jobId) => {
//     if (hasPendingJob) {
//       Alert.alert(
//         "Already Working on a Job",
//         "Please complete your current job before accepting another."
//       );
//       return;
//     }

//     try {
//       setAcceptingMap((prev) => ({ ...prev, [jobId]: true }));
//       const res = await acceptJob(jobId);
//       console.log("✅ Accept Job Response:", res);

//       if (res?.data?.status === "SUCCESS") {
//         Alert.alert("Success", res.data.message || "Job accepted successfully!");
//         await checkPendingJob();
//         await loadAvailableJobs();
//         await loadCurrentJobs(); // <-- ensures accepted job shows immediately
//         await loadJobHistory(true);
//       } else if (res?.response?.data?.message) {
//         Alert.alert("Cannot Accept Job", res.response.data.message);
//       } else {
//         Alert.alert("Failed", "Could not accept job. Try again.");
//       }
//     } catch (err) {
//       console.warn("Accept Job Error:", err);
//       const msg =
//         err?.response?.data?.message ||
//         err?.message ||
//         "Failed to accept job. Try again.";
//       Alert.alert("Error", msg);
//     } finally {
//       setAcceptingMap((prev) => ({ ...prev, [jobId]: false }));
//     }
//   };

//   // ---------- Sidebar ----------
//   const Sidebar = () => (
//     <Modal
//       visible={sidebarVisible}
//       animationType="slide"
//       transparent
//       onRequestClose={() => setSidebarVisible(false)}
//     >
//       <View style={styles.overlay}>
//         <View style={styles.sidebar}>
//           <TouchableOpacity
//             onPress={() => setSidebarVisible(false)}
//             style={{ marginBottom: 12 }}
//           >
//             <Ionicons name="close" size={26} color="#000" />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() => {
//               setSidebarVisible(false);
//               navigation.navigate("DoerProfile");
//             }}
//           >
//             <Text style={styles.menuText}>👤 View Profile</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() => {
//               setSidebarVisible(false);
//               navigation.navigate("EditProfile");
//             }}
//           >
//             <Text style={styles.menuText}>✏️ Edit Profile</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.menuItem, !profile?.isPhoneVerified && { opacity: 0.5 }]}
//             disabled={!profile?.isPhoneVerified}
//             onPress={() => {
//               if (!profile?.isPhoneVerified) {
//                 Alert.alert("Phone not verified", "Verify your phone first.");
//                 return;
//               }
//               setSidebarVisible(false);
//               navigation.navigate("KYCPage");
//             }}
//           >
//             <Text style={styles.menuText}>🪪 Upload KYC</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );

//   // ---------- Render Available Job ----------
//   const renderJob = ({ item }) => {
//     const accepting = acceptingMap[item.jobId] || false;
//     return (
//       <View style={styles.jobCard}>
//         <Text style={styles.jobTitle}>{item.title}</Text>
//         <Text style={styles.jobMeta}>💰 ₹{item.amountInRs}</Text>
//         <Text style={styles.jobMeta}>📍 {item.locationArea}</Text>
//         <Text style={styles.jobMeta}>🕒 {item.postedAgo}</Text>

//         <TouchableOpacity
//           style={[
//             styles.acceptBtn,
//             (hasPendingJob || accepting) && { backgroundColor: "#ccc" },
//           ]}
//           disabled={hasPendingJob || accepting}
//           onPress={() => handleAcceptJob(item.jobId)}
//         >
//           {accepting ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={{ color: "#fff", fontWeight: "700" }}>
//               {hasPendingJob ? "Complete Current Job" : "Accept Job"}
//             </Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   // ---------- Render Current Job ----------
//   const renderCurrentJob = ({ item }) => (
//     <View style={styles.jobCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       <Text style={styles.jobMeta}>💰 ₹{item.amountPaise / 100}</Text>
//       <Text style={styles.jobMeta}>📂 {item.category}</Text>
//       <Text style={styles.jobMeta}>Status: {item.status}</Text>
//     </View>
//   );

//   // ---------- Render Job History ----------
//   const renderHistory = ({ item }) => (
//     <View style={styles.historyCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       <Text style={styles.jobMeta}>💰 ₹{item.amountPaise / 100}</Text>
//       <Text style={styles.jobMeta}>📂 {item.category}</Text>
//       <Text style={styles.jobMeta}>📅 {item.updatedAt.split("T")[0]}</Text>
//       <Text style={styles.statusLabel}>Status: {item.status}</Text>
//     </View>
//   );

//   if (loading)
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#0b78ff" />
//       </View>
//     );

//   return (
//     <>
//       <Sidebar />

//       <FlatList
//         data={availableJobs}
//         keyExtractor={(item) => item.jobId.toString()}
//         renderItem={renderJob}
//         onRefresh={loadAllData}
//         refreshing={jobsLoading}
//         contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
//         ListHeaderComponent={
//           <>
//             <Text style={styles.header}>
//               Welcome{profile?.name ? `, ${profile.name}` : ""} 👋
//             </Text>

//             <View style={styles.card}>
//               <Text style={styles.label}>📞 Phone Verified</Text>
//               <Text
//                 style={[
//                   styles.value,
//                   { color: profile?.isPhoneVerified ? "green" : "red" },
//                 ]}
//               >
//                 {profile?.isPhoneVerified ? "Yes" : "No"}
//               </Text>

//               <Text style={styles.label}>🪪 KYC Level</Text>
//               <Text style={styles.value}>{profile?.kycLevel ?? 0}</Text>

//               <Text style={styles.label}>📋 Verification Status</Text>
//               <Text style={styles.value}>
//                 {profile?.verificationStatus || "Unknown"}
//               </Text>

//               <Text style={styles.label}>✅ Profile Verified</Text>
//               <Text
//                 style={[
//                   styles.value,
//                   { color: profile?.isVerified ? "green" : "orange" },
//                 ]}
//               >
//                 {profile?.isVerified ? "Yes" : "No"}
//               </Text>
//             </View>

//             <Text style={styles.sectionHeader}>📋 Available Jobs</Text>
//           </>
//         }
//         ListFooterComponent={
//           <>
//             <Text style={styles.sectionHeader}>📌 Current Jobs</Text>
//             <FlatList
//               data={currentJobs}
//               renderItem={renderCurrentJob}
//               keyExtractor={(item) => `current-${item.jobId}`}
//               ListEmptyComponent={
//                 <Text style={{ textAlign: "center", color: "#666", marginVertical: 8 }}>
//                   No current jobs.
//                 </Text>
//               }
//             />

//             <Text style={styles.sectionHeader}>📜 Job History</Text>
//             <FlatList
//               data={jobHistory}
//               renderItem={renderHistory}
//               keyExtractor={(item) => `history-${item.jobId}`}
//               onEndReached={() => {
//                 if (hasMore) loadJobHistory();
//               }}
//               onEndReachedThreshold={0.5}
//               ListEmptyComponent={
//                 <Text style={{ textAlign: "center", color: "#666", marginVertical: 10 }}>
//                   No past jobs yet.
//                 </Text>
//               }
//             />
//           </>
//         }
//       />
//     </>
//   );
// }

// // ---------- Styles ----------
// const styles = StyleSheet.create({
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: { fontSize: 22, fontWeight: "700", marginBottom: 12, color: "#0b4da0" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   label: { fontSize: 14, color: "#555", marginTop: 4 },
//   value: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   historyCard: {
//     backgroundColor: "#f8f8f8",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: "#ccc",
//   },
//   statusLabel: { fontSize: 13, color: "#444", marginTop: 3 },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
//   jobMeta: { fontSize: 13, color: "#555", marginTop: 2 },
//   acceptBtn: {
//     marginTop: 8,
//     paddingVertical: 8,
//     borderRadius: 6,
//     backgroundColor: "#0b78ff",
//     alignItems: "center",
//   },
//   sectionHeader: { fontSize: 18, fontWeight: "700", marginTop: 10, marginBottom: 10, color: "#0b4da0" },
//   logoutBtn: { backgroundColor: "#e74c3c", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 10 },
//   overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", flexDirection: "row" },
//   sidebar: { backgroundColor: "#fff", width: "70%", padding: 20, paddingTop: 36, borderTopRightRadius: 20, borderBottomRightRadius: 20 },
//   menuItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
//   menuText: { fontSize: 16, color: "#333" },
// });

// //cprret code

// import React, { useEffect, useState, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Modal,
//   Alert,
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

// export default function DoerDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [sidebarVisible, setSidebarVisible] = useState(false);
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [currentJobs, setCurrentJobs] = useState([]);
//   const [jobHistory, setJobHistory] = useState([]);
//   const [page, setPage] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [jobsLoading, setJobsLoading] = useState(false);
//   const [acceptingMap, setAcceptingMap] = useState({});
//   const [hasPendingJob, setHasPendingJob] = useState(false);

//   // ---------- Header ----------
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Doer Dashboard",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => setSidebarVisible(true)}
//           style={{ marginLeft: 12 }}
//         >
//           <Ionicons name="menu" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//       headerRight: () => (
//         <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
//           <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // ---------- Load Data ----------
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadAllData();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const loadAllData = async () => {
//     await loadProfile();
//     await loadAvailableJobs();
//     await loadCurrentJobs();
//     await loadJobHistory(true);
//     await checkPendingJob();
//   };

//   // Auto-refresh every 10 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       loadAvailableJobs();
//       loadCurrentJobs();
//     }, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   // ---------- Load Profile ----------
//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const stored = await AsyncStorage.getItem("doerProfile");
//       if (stored) setProfile(JSON.parse(stored));
//       else {
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
//       console.warn("Profile Load Error:", err.message || err);
//       setProfile(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------- Load Jobs ----------
//   const loadAvailableJobs = async () => {
//     try {
//       setJobsLoading(true);
//       const res = await fetchAvailableJobs();
//       setAvailableJobs(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Fetch Available Jobs Error:", err.message || err);
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
//       console.warn(
//         "Fetch Current Jobs Error:",
//         err.response?.data || err.message
//       );
//       setCurrentJobs([]);
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
//       console.warn("Fetch Job History Error:", err.message);
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
//       console.warn("Pending Job Check Error:", err.message);
//       setHasPendingJob(false);
//     }
//   };

//   // ---------- Logout ----------
//   const handleLogout = async () => {
//     await AsyncStorage.multiRemove(["authToken", "doerProfile"]);
//     navigation.reset({ index: 0, routes: [{ name: "RoleSelect" }] });
//   };

//   // ---------- Accept Job ----------
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
//         await loadCurrentJobs();
//         await loadAvailableJobs();
//         await loadJobHistory(true);
//         await checkPendingJob();
//       } else {
//         Alert.alert("Failed", res.message || "Could not accept job");
//       }
//     } catch (err) {
//       console.warn("Accept Job Error:", err.response?.data || err.message);
//       Alert.alert("Error", err.response?.data?.message || err.message);
//     } finally {
//       setAcceptingMap((prev) => ({ ...prev, [jobId]: false }));
//     }
//   };

//   // ---------- Sidebar ----------
//   const Sidebar = () => (
//     <Modal
//       visible={sidebarVisible}
//       animationType="slide"
//       transparent
//       onRequestClose={() => setSidebarVisible(false)}
//     >
//       <View style={styles.overlay}>
//         <View style={styles.sidebar}>
//           <TouchableOpacity
//             onPress={() => setSidebarVisible(false)}
//             style={{ marginBottom: 12 }}
//           >
//             <Ionicons name="close" size={26} color="#000" />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() => {
//               setSidebarVisible(false);
//               navigation.navigate("DoerProfile");
//             }}
//           >
//             <Text style={styles.menuText}>👤 View Profile</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() => {
//               setSidebarVisible(false);
//               navigation.navigate("EditProfile");
//             }}
//           >
//             <Text style={styles.menuText}>✏️ Edit Profile</Text>
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
//               setSidebarVisible(false);
//               navigation.navigate("KYCPage");
//             }}
//           >
//             <Text style={styles.menuText}>🪪 Upload KYC</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );

//   // ---------- Render Job ----------
//   const renderJob = ({ item }) => {
//     const accepting = acceptingMap[item.jobId] || false;
//     return (
//       <View style={styles.jobCard}>
//         <Text style={styles.jobTitle}>{item.title}</Text>
//         <Text style={styles.jobMeta}>💰 ₹{item.amountInRs}</Text>
//         <Text style={styles.jobMeta}>📍 {item.locationArea}</Text>
//         <Text style={styles.jobMeta}>🕒 {item.postedAgo}</Text>

//         <TouchableOpacity
//           style={[
//             styles.acceptBtn,
//             (hasPendingJob || accepting) && { backgroundColor: "#ccc" },
//           ]}
//           disabled={hasPendingJob || accepting}
//           onPress={() => handleAcceptJob(item.jobId)}
//         >
//           {accepting ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={{ color: "#fff", fontWeight: "700" }}>
//               {hasPendingJob ? "Complete Current Job" : "Accept Job"}
//             </Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   // ---------- Render Current Job ----------
//   const renderCurrentJob = ({ item }) => (
//     <View style={styles.jobCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       <Text style={styles.jobMeta}>💰 ₹{item.amountPaise / 100}</Text>
//       <Text style={styles.jobMeta}>📂 {item.category}</Text>
//       <Text style={styles.jobMeta}>Status: {item.status}</Text>
//     </View>
//   );

//   // ---------- Render Job History ----------
//   const renderHistory = ({ item }) => (
//     <View style={styles.historyCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       <Text style={styles.jobMeta}>💰 ₹{item.amountPaise / 100}</Text>
//       <Text style={styles.jobMeta}>📂 {item.category}</Text>
//       <Text style={styles.jobMeta}>📅 {item.updatedAt.split("T")[0]}</Text>
//       <Text style={styles.statusLabel}>Status: {item.status}</Text>
//     </View>
//   );

//   if (loading)
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#0b78ff" />
//       </View>
//     );

//   return (
//     <>
//       <Sidebar />

//       <FlatList
//         data={availableJobs}
//         keyExtractor={(item) => item.jobId.toString()}
//         renderItem={renderJob}
//         onRefresh={loadAllData}
//         refreshing={jobsLoading}
//         contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
//         ListHeaderComponent={
//           <>
//             <Text style={styles.header}>
//               Welcome{profile?.name ? `, ${profile.name}` : ""} 👋
//             </Text>

//             <View style={styles.card}>
//               <Text style={styles.label}>📞 Phone Verified</Text>
//               <Text
//                 style={[
//                   styles.value,
//                   { color: profile?.isPhoneVerified ? "green" : "red" },
//                 ]}
//               >
//                 {profile?.isPhoneVerified ? "Yes" : "No"}
//               </Text>

//               <Text style={styles.label}>🪪 KYC Level</Text>
//               <Text style={styles.value}>{profile?.kycLevel ?? 0}</Text>

//               <Text style={styles.label}>📋 Verification Status</Text>
//               <Text style={styles.value}>
//                 {profile?.verificationStatus || "Unknown"}
//               </Text>

//               <Text style={styles.label}>✅ Profile Verified</Text>
//               <Text
//                 style={[
//                   styles.value,
//                   { color: profile?.isVerified ? "green" : "orange" },
//                 ]}
//               >
//                 {profile?.isVerified ? "Yes" : "No"}
//               </Text>
//             </View>

//             <Text style={styles.sectionHeader}>📋 Available Jobs</Text>
//           </>
//         }
//         ListFooterComponent={
//           <>
//             <Text style={styles.sectionHeader}>📌 Current Jobs</Text>
//             <FlatList
//               data={currentJobs}
//               renderItem={renderCurrentJob}
//               keyExtractor={(item) => `current-${item.jobId}`}
//               ListEmptyComponent={
//                 <Text
//                   style={{
//                     textAlign: "center",
//                     color: "#666",
//                     marginVertical: 8,
//                   }}
//                 >
//                   No current jobs.
//                 </Text>
//               }
//             />

//             <Text style={styles.sectionHeader}>📜 Job History</Text>
//             <FlatList
//               data={jobHistory}
//               renderItem={renderHistory}
//               keyExtractor={(item) => `history-${item.jobId}`}
//               onEndReached={() => hasMore && loadJobHistory()}
//               onEndReachedThreshold={0.5}
//               ListEmptyComponent={
//                 <Text
//                   style={{
//                     textAlign: "center",
//                     color: "#666",
//                     marginVertical: 10,
//                   }}
//                 >
//                   No past jobs yet.
//                 </Text>
//               }
//             />
//           </>
//         }
//       />
//     </>
//   );
// }

// // ---------- Styles ----------
// const styles = StyleSheet.create({
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 12,
//     color: "#0b4da0",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   label: { fontSize: 14, color: "#555", marginTop: 4 },
//   value: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   historyCard: {
//     backgroundColor: "#f8f8f8",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: "#ccc",
//   },
//   statusLabel: { fontSize: 13, color: "#444", marginTop: 3 },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
//   jobMeta: { fontSize: 13, color: "#555", marginTop: 2 },
//   acceptBtn: {
//     marginTop: 8,
//     paddingVertical: 8,
//     borderRadius: 6,
//     backgroundColor: "#0b78ff",
//     alignItems: "center",
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginTop: 10,
//     marginBottom: 10,
//     color: "#0b4da0",
//   },
//   logoutBtn: {
//     backgroundColor: "#e74c3c",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//     marginRight: 10,
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.3)",
//     flexDirection: "row",
//   },
//   sidebar: {
//     backgroundColor: "#fff",
//     width: "70%",
//     padding: 20,
//     paddingTop: 36,
//     borderTopRightRadius: 20,
//     borderBottomRightRadius: 20,
//   },
//   menuItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
//   menuText: { fontSize: 16, color: "#333" },
// });
// import React, { useEffect, useState, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Modal,
//   Alert,
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

// export default function DoerDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [sidebarVisible, setSidebarVisible] = useState(false);
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [currentJobs, setCurrentJobs] = useState([]);
//   const [jobHistory, setJobHistory] = useState([]);
//   const [page, setPage] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [jobsLoading, setJobsLoading] = useState(false);
//   const [acceptingMap, setAcceptingMap] = useState({});
//   const [hasPendingJob, setHasPendingJob] = useState(false);

//   // ---------- Header ----------
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Doer Dashboard",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => setSidebarVisible(true)}
//           style={{ marginLeft: 12 }}
//         >
//           <Ionicons name="menu" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//       headerRight: () => (
//         <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
//           <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // ---------- Load Data ----------
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadAllData();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const loadAllData = async () => {
//     await loadProfile();
//     await loadAvailableJobs();
//     await loadCurrentJobs();
//     await loadJobHistory(true);
//     await checkPendingJob();
//   };

//   // Auto-refresh every 10 seconds (spinner hidden)
//   useEffect(() => {
//     const interval = setInterval(() => {
//       loadAvailableJobs(false); // false = hide spinner
//       loadCurrentJobs(false); // false = hide spinner
//     }, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   // ---------- Load Profile ----------
//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const stored = await AsyncStorage.getItem("doerProfile");
//       if (stored) setProfile(JSON.parse(stored));
//       else {
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
//       console.warn("Profile Load Error:", err.message || err);
//       setProfile(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------- Load Jobs ----------
//   const loadAvailableJobs = async (showSpinner = true) => {
//     try {
//       if (showSpinner) setJobsLoading(true);
//       const res = await fetchAvailableJobs();
//       setAvailableJobs(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Fetch Available Jobs Error:", err.message || err);
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
//       console.warn(
//         "Fetch Current Jobs Error:",
//         err.response?.data || err.message
//       );
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
//       console.warn("Fetch Job History Error:", err.message);
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
//       console.warn("Pending Job Check Error:", err.message);
//       setHasPendingJob(false);
//     }
//   };

//   // ---------- Logout ----------
//   const handleLogout = async () => {
//     await AsyncStorage.multiRemove(["authToken", "doerProfile"]);
//     navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//   };

//   // ---------- Accept Job ----------
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
//         await loadCurrentJobs();
//         await loadAvailableJobs();
//         await loadJobHistory(true);
//         await checkPendingJob();
//       } else {
//         Alert.alert("Failed", res.message || "Could not accept job");
//       }
//     } catch (err) {
//       console.warn("Accept Job Error:", err.response?.data || err.message);
//       Alert.alert("Error", err.response?.data?.message || err.message);
//     } finally {
//       setAcceptingMap((prev) => ({ ...prev, [jobId]: false }));
//     }
//   };

//   // ---------- Sidebar ----------
//   const Sidebar = () => (
//     <Modal
//       visible={sidebarVisible}
//       animationType="slide"
//       transparent
//       onRequestClose={() => setSidebarVisible(false)}
//     >
//       <View style={styles.overlay}>
//         <View style={styles.sidebar}>
//           <TouchableOpacity
//             onPress={() => setSidebarVisible(false)}
//             style={{ marginBottom: 12 }}
//           >
//             <Ionicons name="close" size={26} color="#000" />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() => {
//               setSidebarVisible(false);
//               navigation.navigate("DoerProfile");
//             }}
//           >
//             <Text style={styles.menuText}>👤 View Profile</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() => {
//               setSidebarVisible(false);
//               navigation.navigate("EditProfile");
//             }}
//           >
//             <Text style={styles.menuText}>✏️ Edit Profile</Text>
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
//               setSidebarVisible(false);
//               navigation.navigate("KYCPage");
//             }}
//           >
//             <Text style={styles.menuText}>🪪 Upload KYC</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );

//   // ---------- Render Job ----------
//   const renderJob = ({ item }) => {
//     const accepting = acceptingMap[item.jobId] || false;
//     return (
//       <View style={styles.jobCard}>
//         <Text style={styles.jobTitle}>{item.title}</Text>
//         <Text style={styles.jobMeta}>💰 ₹{item.amountInRs}</Text>
//         <Text style={styles.jobMeta}>📍 {item.locationArea}</Text>
//         <Text style={styles.jobMeta}>🕒 {item.postedAgo}</Text>

//         <TouchableOpacity
//           style={[
//             styles.acceptBtn,
//             (hasPendingJob || accepting) && { backgroundColor: "#ccc" },
//           ]}
//           disabled={hasPendingJob || accepting}
//           onPress={() => handleAcceptJob(item.jobId)}
//         >
//           {accepting ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={{ color: "#fff", fontWeight: "700" }}>
//               {hasPendingJob ? "Complete Current Job" : "Accept Job"}
//             </Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   // ---------- Render Current Job ----------
//   const renderCurrentJob = ({ item }) => (
//     <View style={styles.jobCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       <Text style={styles.jobMeta}>💰 ₹{item.amountPaise / 100}</Text>
//       <Text style={styles.jobMeta}>📂 {item.category}</Text>
//       <Text style={styles.jobMeta}>Status: {item.status}</Text>
//     </View>
//   );

//   // ---------- Render Job History ----------
//   const renderHistory = ({ item }) => (
//     <View style={styles.historyCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       <Text style={styles.jobMeta}>💰 ₹{item.amountPaise / 100}</Text>
//       <Text style={styles.jobMeta}>📂 {item.category}</Text>
//       <Text style={styles.jobMeta}>📅 {item.updatedAt.split("T")[0]}</Text>
//       <Text style={styles.statusLabel}>Status: {item.status}</Text>
//     </View>
//   );

//   if (loading)
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#0b78ff" />
//       </View>
//     );

//   return (
//     <>
//       <Sidebar />

//       <FlatList
//         data={availableJobs}
//         keyExtractor={(item) => item.jobId.toString()}
//         renderItem={renderJob}
//         onRefresh={loadAllData}
//         refreshing={jobsLoading}
//         contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
//         ListHeaderComponent={
//           <>
//             <Text style={styles.header}>
//               Welcome{profile?.name ? `, ${profile.name}` : ""} 👋
//             </Text>

//             <View style={styles.card}>
//               <Text style={styles.label}>📞 Phone Verified</Text>
//               <Text
//                 style={[
//                   styles.value,
//                   { color: profile?.isPhoneVerified ? "green" : "red" },
//                 ]}
//               >
//                 {profile?.isPhoneVerified ? "Yes" : "No"}
//               </Text>

//               <Text style={styles.label}>🪪 KYC Level</Text>
//               <Text style={styles.value}>{profile?.kycLevel ?? 0}</Text>

//               <Text style={styles.label}>📋 Verification Status</Text>
//               <Text style={styles.value}>
//                 {profile?.verificationStatus || "Unknown"}
//               </Text>

//               <Text style={styles.label}>✅ Profile Verified</Text>
//               <Text
//                 style={[
//                   styles.value,
//                   { color: profile?.isVerified ? "green" : "orange" },
//                 ]}
//               >
//                 {profile?.isVerified ? "Yes" : "No"}
//               </Text>
//             </View>

//             <Text style={styles.sectionHeader}>📋 Available Jobs</Text>
//           </>
//         }
//         ListFooterComponent={
//           <>
//             <Text style={styles.sectionHeader}>📌 Current Jobs</Text>
//             <FlatList
//               data={currentJobs}
//               renderItem={renderCurrentJob}
//               keyExtractor={(item) => `current-${item.jobId}`}
//               ListEmptyComponent={
//                 <Text
//                   style={{
//                     textAlign: "center",
//                     color: "#666",
//                     marginVertical: 8,
//                   }}
//                 >
//                   No current jobs.
//                 </Text>
//               }
//             />

//             <Text style={styles.sectionHeader}>📜 Job History</Text>
//             <FlatList
//               data={jobHistory}
//               renderItem={renderHistory}
//               keyExtractor={(item) => `history-${item.jobId}`}
//               onEndReached={() => hasMore && loadJobHistory()}
//               onEndReachedThreshold={0.5}
//               ListEmptyComponent={
//                 <Text
//                   style={{
//                     textAlign: "center",
//                     color: "#666",
//                     marginVertical: 10,
//                   }}
//                 >
//                   No past jobs yet.
//                 </Text>
//               }
//             />
//           </>
//         }
//       />
//     </>
//   );
// }

// // ---------- Styles ----------
// const styles = StyleSheet.create({
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 12,
//     color: "#0b4da0",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   label: { fontSize: 14, color: "#555", marginTop: 4 },
//   value: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   historyCard: {
//     backgroundColor: "#f8f8f8",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: "#ccc",
//   },
//   statusLabel: { fontSize: 13, color: "#444", marginTop: 3 },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
//   jobMeta: { fontSize: 13, color: "#555", marginTop: 2 },
//   acceptBtn: {
//     marginTop: 8,
//     paddingVertical: 8,
//     borderRadius: 6,
//     backgroundColor: "#0b78ff",
//     alignItems: "center",
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginTop: 10,
//     marginBottom: 10,
//     color: "#0b4da0",
//   },
//   logoutBtn: {
//     backgroundColor: "#e74c3c",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//     marginRight: 10,
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.3)",
//     flexDirection: "row",
//   },
//   sidebar: {
//     backgroundColor: "#fff",
//     width: "70%",
//     padding: 20,
//     paddingTop: 36,
//     borderTopRightRadius: 20,
//     borderBottomRightRadius: 20,
//   },
//   menuItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
//   menuText: { fontSize: 16, color: "#333" },
// });
// import React, { useEffect, useState, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Modal,
//   Alert,
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

// export default function DoerDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [sidebarVisible, setSidebarVisible] = useState(false);
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [currentJobs, setCurrentJobs] = useState([]);
//   const [jobHistory, setJobHistory] = useState([]);
//   const [page, setPage] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [jobsLoading, setJobsLoading] = useState(false);
//   const [acceptingMap, setAcceptingMap] = useState({});
//   const [hasPendingJob, setHasPendingJob] = useState(false);

//   // ---------- Header ----------
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Doer Dashboard",
//       headerStyle: { backgroundColor: "#2563eb" },
//       headerTitleStyle: { color: "#fff", fontWeight: "700" },
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => setSidebarVisible(true)}
//           style={{ marginLeft: 12 }}
//         >
//           <Ionicons name="menu" size={26} color="#fff" />
//         </TouchableOpacity>
//       ),
//       headerRight: () => (
//         <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
//           <Ionicons name="log-out-outline" size={18} color="#fff" />
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // ---------- Load Data ----------
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadAllData();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const loadAllData = async () => {
//     await loadProfile();
//     await loadAvailableJobs();
//     await loadCurrentJobs();
//     await loadJobHistory(true);
//     await checkPendingJob();
//   };

//   // Auto-refresh every 10s
//   useEffect(() => {
//     const interval = setInterval(() => {
//       loadAvailableJobs(false);
//       loadCurrentJobs(false);
//     }, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   // ---------- Profile ----------
//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const stored = await AsyncStorage.getItem("doerProfile");
//       if (stored) setProfile(JSON.parse(stored));
//       else {
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
//       console.warn("Profile Load Error:", err.message);
//       setProfile(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------- Jobs ----------
//   const loadAvailableJobs = async (showSpinner = true) => {
//     try {
//       if (showSpinner) setJobsLoading(true);
//       const res = await fetchAvailableJobs();
//       setAvailableJobs(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Fetch Available Jobs Error:", err.message);
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
//       console.warn("Fetch Current Jobs Error:", err.message);
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
//       console.warn("Fetch Job History Error:", err.message);
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
//       console.warn("Pending Job Check Error:", err.message);
//       setHasPendingJob(false);
//     }
//   };

//   // ---------- Logout ----------
//   const handleLogout = async () => {
//     await AsyncStorage.multiRemove(["authToken", "doerProfile"]);
//     navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//   };

//   // ---------- Accept Job ----------
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
//         await loadCurrentJobs();
//         await loadAvailableJobs();
//         await loadJobHistory(true);
//         await checkPendingJob();
//       } else {
//         Alert.alert("Failed", res.message || "Could not accept job");
//       }
//     } catch (err) {
//       Alert.alert("Error", err.response?.data?.message || err.message);
//     } finally {
//       setAcceptingMap((prev) => ({ ...prev, [jobId]: false }));
//     }
//   };

//   // ---------- Sidebar ----------
//   const Sidebar = () => (
//     <Modal
//       visible={sidebarVisible}
//       animationType="slide"
//       transparent
//       onRequestClose={() => setSidebarVisible(false)}
//     >
//       <View style={styles.overlay}>
//         <View style={styles.sidebar}>
//           <TouchableOpacity
//             onPress={() => setSidebarVisible(false)}
//             style={{ alignSelf: "flex-end" }}
//           >
//             <Ionicons name="close" size={26} color="#333" />
//           </TouchableOpacity>

//           <View style={{ marginVertical: 20 }}>
//             <Text style={styles.sidebarTitle}>Menu</Text>
//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 setSidebarVisible(false);
//                 navigation.navigate("DoerProfile");
//               }}
//             >
//               <Ionicons
//                 name="person-circle-outline"
//                 size={20}
//                 color="#2563eb"
//               />
//               <Text style={styles.menuText}>View Profile</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 setSidebarVisible(false);
//                 navigation.navigate("EditProfile");
//               }}
//             >
//               <Ionicons name="create-outline" size={20} color="#2563eb" />
//               <Text style={styles.menuText}>Edit Profile</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.menuItem,
//                 !profile?.isPhoneVerified && { opacity: 0.5 },
//               ]}
//               disabled={!profile?.isPhoneVerified}
//               onPress={() => {
//                 if (!profile?.isPhoneVerified) {
//                   Alert.alert("Phone not verified", "Verify your phone first.");
//                   return;
//                 }
//                 setSidebarVisible(false);
//                 navigation.navigate("KYCPage");
//               }}
//             >
//               <Ionicons
//                 name="document-text-outline"
//                 size={20}
//                 color="#2563eb"
//               />
//               <Text style={styles.menuText}>Upload KYC</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   // ---------- Render Job ----------
//   const renderJob = ({ item }) => {
//     const accepting = acceptingMap[item.jobId] || false;
//     return (
//       <View style={styles.jobCard}>
//         <Text style={styles.jobTitle}>{item.title}</Text>
//         <Text style={styles.jobMeta}>💰 ₹{item.amountInRs}</Text>
//         <Text style={styles.jobMeta}>📍 {item.locationArea}</Text>
//         <Text style={styles.jobMeta}>🕒 {item.postedAgo}</Text>

//         <TouchableOpacity
//           style={[
//             styles.acceptBtn,
//             (hasPendingJob || accepting) && { backgroundColor: "#9ca3af" },
//           ]}
//           disabled={hasPendingJob || accepting}
//           onPress={() => handleAcceptJob(item.jobId)}
//         >
//           {accepting ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={styles.acceptText}>
//               {hasPendingJob ? "Complete Current Job" : "Accept Job"}
//             </Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   // ---------- Render Current Job ----------
//   const renderCurrentJob = ({ item }) => (
//     <View style={styles.currentJobCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       <Text style={styles.jobMeta}>💰 ₹{item.amountPaise / 100}</Text>
//       <Text style={styles.jobMeta}>📂 {item.category}</Text>
//       <Text style={styles.statusText}>Status: {item.status}</Text>
//     </View>
//   );

//   // ---------- Render Job History ----------
//   const renderHistory = ({ item }) => (
//     <View style={styles.historyCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       <Text style={styles.jobMeta}>💰 ₹{item.amountPaise / 100}</Text>
//       <Text style={styles.jobMeta}>📂 {item.category}</Text>
//       <Text style={styles.jobMeta}>📅 {item.updatedAt.split("T")[0]}</Text>
//       <Text style={styles.statusText}>Status: {item.status}</Text>
//     </View>
//   );

//   if (loading)
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </View>
//     );

//   return (
//     <>
//       <Sidebar />

//       <FlatList
//         data={availableJobs}
//         keyExtractor={(item) => item.jobId.toString()}
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
//               <Text style={styles.label}>📞 Phone Verified</Text>
//               <Text
//                 style={[
//                   styles.value,
//                   { color: profile?.isPhoneVerified ? "green" : "red" },
//                 ]}
//               >
//                 {profile?.isPhoneVerified ? "Yes" : "No"}
//               </Text>

//               <Text style={styles.label}>🪪 KYC Level</Text>
//               <Text style={styles.value}>{profile?.kycLevel ?? 0}</Text>

//               <Text style={styles.label}>📋 Verification Status</Text>
//               <Text style={styles.value}>
//                 {profile?.verificationStatus || "Unknown"}
//               </Text>

//               <Text style={styles.label}>✅ Profile Verified</Text>
//               <Text
//                 style={[
//                   styles.value,
//                   { color: profile?.isVerified ? "green" : "orange" },
//                 ]}
//               >
//                 {profile?.isVerified ? "Yes" : "No"}
//               </Text>
//             </View>

//             <Text style={styles.sectionHeader}>📋 Available Jobs</Text>
//           </>
//         }
//         ListFooterComponent={
//           <>
//             <Text style={styles.sectionHeader}>📌 Current Jobs</Text>
//             <FlatList
//               data={currentJobs}
//               renderItem={renderCurrentJob}
//               keyExtractor={(item) => `current-${item.jobId}`}
//               ListEmptyComponent={
//                 <Text style={styles.emptyText}>No current jobs.</Text>
//               }
//             />

//             <Text style={styles.sectionHeader}>📜 Job History</Text>
//             <FlatList
//               data={jobHistory}
//               renderItem={renderHistory}
//               keyExtractor={(item) => `history-${item.jobId}`}
//               onEndReached={() => hasMore && loadJobHistory()}
//               onEndReachedThreshold={0.5}
//               ListEmptyComponent={
//                 <Text style={styles.emptyText}>No past jobs yet.</Text>
//               }
//             />
//           </>
//         }
//       />
//     </>
//   );
// }

// // ---------- Styles ----------
// const styles = StyleSheet.create({
//   contentContainer: {
//     padding: 20,
//     backgroundColor: "#f1f5f9",
//     paddingBottom: 80,
//   },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: {
//     fontSize: 24,
//     fontWeight: "700",
//     marginBottom: 14,
//     color: "#1e3a8a",
//   },

//   profileCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   label: { fontSize: 14, color: "#555", marginTop: 6 },
//   value: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginVertical: 10,
//     color: "#2563eb",
//   },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   currentJobCard: {
//     backgroundColor: "#e0f2fe",
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 10,
//   },
//   historyCard: {
//     backgroundColor: "#f9fafb",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//   },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
//   jobMeta: { fontSize: 13, color: "#4b5563", marginTop: 2 },
//   acceptBtn: {
//     marginTop: 10,
//     paddingVertical: 10,
//     borderRadius: 8,
//     backgroundColor: "#2563eb",
//     alignItems: "center",
//   },
//   acceptText: { color: "#fff", fontWeight: "700" },
//   statusText: { fontSize: 13, marginTop: 4, color: "#374151" },
//   emptyText: { textAlign: "center", color: "#6b7280", marginVertical: 10 },

//   logoutBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#ef4444",
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 6,
//     marginRight: 10,
//   },
//   logoutText: { color: "#fff", fontWeight: "700", marginLeft: 4 },

//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.3)",
//     flexDirection: "row",
//   },
//   sidebar: {
//     backgroundColor: "#fff",
//     width: "70%",
//     padding: 20,
//     paddingTop: 36,
//     borderTopRightRadius: 20,
//     borderBottomRightRadius: 20,
//   },
//   sidebarTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#1e40af",
//     marginBottom: 10,
//   },
//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderColor: "#f1f5f9",
//   },
//   menuText: { fontSize: 16, color: "#333", marginLeft: 10 },
// });
// import React, { useEffect, useState, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Modal,
//   Alert,
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

// export default function DoerDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [sidebarVisible, setSidebarVisible] = useState(false);
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [currentJobs, setCurrentJobs] = useState([]);
//   const [jobHistory, setJobHistory] = useState([]);
//   const [page, setPage] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [jobsLoading, setJobsLoading] = useState(false);
//   const [acceptingMap, setAcceptingMap] = useState({});
//   const [hasPendingJob, setHasPendingJob] = useState(false);

//   // ---------- Header ----------
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Doer Dashboard",
//       headerStyle: { backgroundColor: "#2563eb" },
//       headerTitleStyle: { color: "#fff", fontWeight: "700" },
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => setSidebarVisible(true)}
//           style={{ marginLeft: 12 }}
//         >
//           <Ionicons name="menu" size={26} color="#fff" />
//         </TouchableOpacity>
//       ),
//       headerRight: () => (
//         <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
//           <Ionicons name="log-out-outline" size={18} color="#fff" />
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // ---------- Load Data ----------
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadAllData();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const loadAllData = async () => {
//     await loadProfile();
//     await loadAvailableJobs();
//     await loadCurrentJobs();
//     await loadJobHistory(true);
//     await checkPendingJob();
//   };

//   // Auto-refresh every 10s
//   useEffect(() => {
//     const interval = setInterval(() => {
//       loadAvailableJobs(false);
//       loadCurrentJobs(false);
//     }, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   // ---------- Profile ----------
//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const stored = await AsyncStorage.getItem("doerProfile");
//       if (stored) setProfile(JSON.parse(stored));
//       else {
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
//       console.warn("Profile Load Error:", err.message);
//       setProfile(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------- Jobs ----------
//   const loadAvailableJobs = async (showSpinner = true) => {
//     try {
//       if (showSpinner) setJobsLoading(true);
//       const res = await fetchAvailableJobs();
//       setAvailableJobs(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Fetch Available Jobs Error:", err.message);
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
//       console.warn("Fetch Current Jobs Error:", err.message);
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
//       console.warn("Fetch Job History Error:", err.message);
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
//       console.warn("Pending Job Check Error:", err.message);
//       setHasPendingJob(false);
//     }
//   };

//   // ---------- Logout ----------
//   const handleLogout = async () => {
//     await AsyncStorage.multiRemove(["authToken", "doerProfile"]);
//     navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//   };

//   // ---------- Accept Job ----------
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
//         await loadCurrentJobs();
//         await loadAvailableJobs();
//         await loadJobHistory(true);
//         await checkPendingJob();
//       } else {
//         Alert.alert("Failed", res.message || "Could not accept job");
//       }
//     } catch (err) {
//       Alert.alert("Error", err.response?.data?.message || err.message);
//     } finally {
//       setAcceptingMap((prev) => ({ ...prev, [jobId]: false }));
//     }
//   };

//   // ---------- Sidebar ----------
//   const Sidebar = () => (
//     <Modal
//       visible={sidebarVisible}
//       animationType="slide"
//       transparent
//       onRequestClose={() => setSidebarVisible(false)}
//     >
//       <View style={styles.overlay}>
//         <View style={styles.sidebar}>
//           <TouchableOpacity
//             onPress={() => setSidebarVisible(false)}
//             style={{ alignSelf: "flex-end" }}
//           >
//             <Ionicons name="close" size={26} color="#333" />
//           </TouchableOpacity>

//           <View style={{ marginVertical: 20 }}>
//             <Text style={styles.sidebarTitle}>Menu</Text>
//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 setSidebarVisible(false);
//                 navigation.navigate("DoerProfile");
//               }}
//             >
//               <Ionicons
//                 name="person-circle-outline"
//                 size={20}
//                 color="#2563eb"
//               />
//               <Text style={styles.menuText}>View Profile</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 setSidebarVisible(false);
//                 navigation.navigate("EditProfile");
//               }}
//             >
//               <Ionicons name="create-outline" size={20} color="#2563eb" />
//               <Text style={styles.menuText}>Edit Profile</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.menuItem,
//                 !profile?.isPhoneVerified && { opacity: 0.5 },
//               ]}
//               disabled={!profile?.isPhoneVerified}
//               onPress={() => {
//                 if (!profile?.isPhoneVerified) {
//                   Alert.alert("Phone not verified", "Verify your phone first.");
//                   return;
//                 }
//                 setSidebarVisible(false);
//                 navigation.navigate("KYCPage");
//               }}
//             >
//               <Ionicons
//                 name="document-text-outline"
//                 size={20}
//                 color="#2563eb"
//               />
//               <Text style={styles.menuText}>Upload KYC</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   // ---------- Render Job ----------
//   const renderJob = ({ item }) => {
//     const accepting = acceptingMap[item.jobId] || false;
//     return (
//       <View style={styles.jobCard}>
//         <Text style={styles.jobTitle}>{item.title}</Text>
//         {item.description && (
//           <Text style={styles.jobMeta}>📝 {item.description}</Text>
//         )}
//         <Text style={styles.jobMeta}>📂 Type: {item.jobType || "N/A"}</Text>
//         <Text style={styles.jobMeta}>💰 ₹{item.amountInRs}</Text>
//         <Text style={styles.jobMeta}>📍 {item.locationArea}</Text>
//         <Text style={styles.jobMeta}>🕒 {item.postedAgo}</Text>
//         <Text style={styles.jobMeta}>
//           👤 Posted By: {item.postedByName || "Admin"}
//         </Text>

//         <TouchableOpacity
//           style={[
//             styles.acceptBtn,
//             (hasPendingJob || accepting) && { backgroundColor: "#9ca3af" },
//           ]}
//           disabled={hasPendingJob || accepting}
//           onPress={() => handleAcceptJob(item.jobId)}
//         >
//           {accepting ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={styles.acceptText}>
//               {hasPendingJob ? "Complete Current Job" : "Accept Job"}
//             </Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   // ---------- Render Current Job ----------
//   const renderCurrentJob = ({ item }) => (
//     <View style={styles.currentJobCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       {item.description && (
//         <Text style={styles.jobMeta}>📝 {item.description}</Text>
//       )}
//       <Text style={styles.jobMeta}>💰 ₹{item.amountPaise / 100}</Text>
//       <Text style={styles.jobMeta}>📂 Category: {item.category}</Text>
//       <Text style={styles.jobMeta}>
//         📅 Started: {item.assignedDate?.split("T")[0] || "N/A"}
//       </Text>
//       <Text style={styles.jobMeta}>📍 {item.locationArea || "N/A"}</Text>
//       <Text style={styles.statusText}>Status: {item.status}</Text>
//     </View>
//   );

//   // ---------- Render Job History ----------
//   const renderHistory = ({ item }) => (
//     <View style={styles.historyCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       {item.description && (
//         <Text style={styles.jobMeta}>📝 {item.description}</Text>
//       )}
//       <Text style={styles.jobMeta}>💰 ₹{item.amountPaise / 100}</Text>
//       <Text style={styles.jobMeta}>📂 Category: {item.category}</Text>
//       <Text style={styles.jobMeta}>📍 {item.locationArea || "N/A"}</Text>
//       <Text style={styles.jobMeta}>
//         📅 Completed: {item.updatedAt?.split("T")[0]}
//       </Text>
//       <Text style={styles.statusText}>Status: {item.status}</Text>
//     </View>
//   );

//   if (loading)
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </View>
//     );

//   return (
//     <>
//       <Sidebar />
//       <FlatList
//         data={availableJobs}
//         keyExtractor={(item) => item.jobId.toString()}
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
//               <Text style={styles.label}>📞 Phone Verified</Text>
//               <Text
//                 style={[
//                   styles.value,
//                   { color: profile?.isPhoneVerified ? "green" : "red" },
//                 ]}
//               >
//                 {profile?.isPhoneVerified ? "Yes" : "No"}
//               </Text>

//               <Text style={styles.label}>🪪 KYC Level</Text>
//               <Text style={styles.value}>{profile?.kycLevel ?? 0}</Text>

//               <Text style={styles.label}>📋 Verification Status</Text>
//               <Text style={styles.value}>
//                 {profile?.verificationStatus || "Unknown"}
//               </Text>

//               <Text style={styles.label}>✅ Profile Verified</Text>
//               <Text
//                 style={[
//                   styles.value,
//                   { color: profile?.isVerified ? "green" : "orange" },
//                 ]}
//               >
//                 {profile?.isVerified ? "Yes" : "No"}
//               </Text>
//             </View>

//             <Text style={styles.sectionHeader}>📋 Available Jobs</Text>
//           </>
//         }
//         ListFooterComponent={
//           <>
//             <Text style={styles.sectionHeader}>📌 Current Jobs</Text>
//             <FlatList
//               data={currentJobs}
//               renderItem={renderCurrentJob}
//               keyExtractor={(item) => `current-${item.jobId}`}
//               ListEmptyComponent={
//                 <Text style={styles.emptyText}>No current jobs.</Text>
//               }
//             />

//             <Text style={styles.sectionHeader}>📜 Job History</Text>
//             <FlatList
//               data={jobHistory}
//               renderItem={renderHistory}
//               keyExtractor={(item) => `history-${item.jobId}`}
//               onEndReached={() => hasMore && loadJobHistory()}
//               onEndReachedThreshold={0.5}
//               ListEmptyComponent={
//                 <Text style={styles.emptyText}>No past jobs yet.</Text>
//               }
//             />
//           </>
//         }
//       />
//     </>
//   );
// }

// // ---------- Styles ----------
// const styles = StyleSheet.create({
//   contentContainer: {
//     padding: 20,
//     backgroundColor: "#f1f5f9",
//     paddingBottom: 80,
//   },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: {
//     fontSize: 24,
//     fontWeight: "700",
//     marginBottom: 14,
//     color: "#1e3a8a",
//   },
//   profileCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   label: { fontSize: 14, color: "#555", marginTop: 6 },
//   value: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginVertical: 10,
//     color: "#2563eb",
//   },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   currentJobCard: {
//     backgroundColor: "#e0f2fe",
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 10,
//   },
//   historyCard: {
//     backgroundColor: "#f9fafb",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//   },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
//   jobMeta: { fontSize: 13, color: "#4b5563", marginTop: 2 },
//   acceptBtn: {
//     marginTop: 10,
//     paddingVertical: 10,
//     borderRadius: 8,
//     backgroundColor: "#2563eb",
//     alignItems: "center",
//   },
//   acceptText: { color: "#fff", fontWeight: "700" },
//   statusText: { fontSize: 13, marginTop: 4, color: "#374151" },
//   emptyText: { textAlign: "center", color: "#6b7280", marginVertical: 10 },
//   logoutBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#ef4444",
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 6,
//     marginRight: 10,
//   },
//   logoutText: { color: "#fff", fontWeight: "700", marginLeft: 4 },
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.3)",
//     flexDirection: "row",
//   },
//   sidebar: {
//     backgroundColor: "#fff",
//     width: "70%",
//     padding: 20,
//     paddingTop: 36,
//     borderTopRightRadius: 20,
//     borderBottomRightRadius: 20,
//   },
//   sidebarTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#1e40af",
//     marginBottom: 10,
//   },
//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderColor: "#f1f5f9",
//   },
//   menuText: { fontSize: 16, color: "#333", marginLeft: 10 },
// });

//corretabove

// import React, { useEffect, useState, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Modal,
//   Alert,
//   ScrollView,
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

// export default function DoerDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [sidebarVisible, setSidebarVisible] = useState(false);
//   const [availableJobs, setAvailableJobs] = useState([]);
//   const [currentJobs, setCurrentJobs] = useState([]);
//   const [jobHistory, setJobHistory] = useState([]);
//   const [page, setPage] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [jobsLoading, setJobsLoading] = useState(false);
//   const [acceptingMap, setAcceptingMap] = useState({});
//   const [hasPendingJob, setHasPendingJob] = useState(false);

//   // ---------- Header ----------
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Doer Dashboard",
//       headerStyle: { backgroundColor: "#2563eb", height: 90 },
//       headerTitleStyle: { color: "#fff", fontWeight: "700", fontSize: 22 },
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backBtn}
//         >
//           <Ionicons name="arrow-back" size={26} color="#fff" />
//         </TouchableOpacity>
//       ),
//       headerRight: () => (
//         <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
//           <Ionicons name="log-out-outline" size={18} color="#fff" />
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadAllData();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const loadAllData = async () => {
//     await loadProfile();
//     await loadAvailableJobs();
//     await loadCurrentJobs();
//     await loadJobHistory(true);
//     await checkPendingJob();
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       loadAvailableJobs(false);
//       loadCurrentJobs(false);
//     }, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const stored = await AsyncStorage.getItem("doerProfile");
//       if (stored) setProfile(JSON.parse(stored));
//       else {
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
//       console.warn("Profile Load Error:", err.message);
//       setProfile(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadAvailableJobs = async (showSpinner = true) => {
//     try {
//       if (showSpinner) setJobsLoading(true);
//       const res = await fetchAvailableJobs();
//       setAvailableJobs(res?.data?.content || []);
//     } catch (err) {
//       console.warn("Fetch Available Jobs Error:", err.message);
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
//       console.warn("Fetch Current Jobs Error:", err.message);
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
//       console.warn("Fetch Job History Error:", err.message);
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
//       console.warn("Pending Job Check Error:", err.message);
//       setHasPendingJob(false);
//     }
//   };

//   const handleLogout = async () => {
//     await AsyncStorage.multiRemove(["authToken", "doerProfile"]);
//     navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//   };

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
//         await loadCurrentJobs();
//         await loadAvailableJobs();
//         await loadJobHistory(true);
//         await checkPendingJob();
//       } else {
//         Alert.alert("Failed", res.message || "Could not accept job");
//       }
//     } catch (err) {
//       Alert.alert("Error", err.response?.data?.message || err.message);
//     } finally {
//       setAcceptingMap((prev) => ({ ...prev, [jobId]: false }));
//     }
//   };

//   const renderJob = ({ item }) => {
//     const accepting = acceptingMap[item.jobId] || false;
//     return (
//       <View style={styles.jobCard}>
//         <Text style={styles.jobTitle}>{item.title}</Text>
//         <Text style={styles.jobMeta}>📂 Category: {item.skillCategory || "N/A"}</Text>
//         <Text style={styles.jobMeta}>💰 ₹{item.amountInRs}</Text>
//         <Text style={styles.jobMeta}>📍 {item.locationArea}</Text>
//         <Text style={styles.jobMeta}>👤 Posted By: {item.posterName || "Admin"}</Text>
//         <TouchableOpacity
//           style={[styles.acceptBtn, (hasPendingJob || accepting) && { backgroundColor: "#9ca3af" }]}
//           disabled={hasPendingJob || accepting}
//           onPress={() => handleAcceptJob(item.jobId)}
//         >
//           {accepting ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={styles.acceptText}>{hasPendingJob ? "Complete Current Job" : "Accept Job"}</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   const renderCurrentJob = ({ item }) => (
//     <View style={styles.currentJobCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       <Text style={styles.jobMeta}>💰 ₹{item.amountPaise / 100}</Text>
//       <Text style={styles.jobMeta}>📂 Category: {item.category}</Text>
//       <Text style={styles.jobMeta}>📅 Updated: {item.updatedAt?.split("T")[0]}</Text>
//       <Text style={styles.statusText}>Status: {item.status}</Text>
//     </View>
//   );

//   const renderHistory = ({ item }) => (
//     <View style={styles.historyCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       <Text style={styles.jobMeta}>💰 ₹{item.amountPaise / 100}</Text>
//       <Text style={styles.jobMeta}>📂 Category: {item.category}</Text>
//       <Text style={styles.jobMeta}>📅 Completed: {item.updatedAt?.split("T")[0]}</Text>
//       <Text style={[styles.statusText, { color: item.status === "COMPLETED" ? "green" : "#f59e0b" }]}>Status: {item.status}</Text>
//     </View>
//   );

//   if (loading)
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </View>
//     );

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={availableJobs}
//         keyExtractor={(item) => item.jobId.toString()}
//         renderItem={renderJob}
//         onRefresh={loadAllData}
//         refreshing={jobsLoading}
//         contentContainerStyle={styles.contentContainer}
//         ListHeaderComponent={
//           <>
//             <Text style={styles.header}>Welcome{profile?.name ? `, ${profile.name}` : ""} 👋</Text>
//             <View style={styles.profileCard}>
//               <View style={styles.profileRow}>
//                 <Text style={styles.label}>📞 Phone Verified:</Text>
//                 <Text style={[styles.value, { color: profile?.isPhoneVerified ? "green" : "red" }]}>
//                   {profile?.isPhoneVerified ? "Yes" : "No"}
//                 </Text>
//               </View>
//               <View style={styles.profileRow}>
//                 <Text style={styles.label}>🪪 KYC Level:</Text>
//                 <Text style={styles.value}>{profile?.kycLevel ?? 0}</Text>
//               </View>
//               <View style={styles.profileRow}>
//                 <Text style={styles.label}>📋 Verification Status:</Text>
//                 <Text style={styles.value}>{profile?.verificationStatus || "Unknown"}</Text>
//               </View>
//               <View style={styles.profileRow}>
//                 <Text style={styles.label}>✅ Profile Verified:</Text>
//                 <Text style={[styles.value, { color: profile?.isVerified ? "green" : "orange" }]}>
//                   {profile?.isVerified ? "Yes" : "No"}
//                 </Text>
//               </View>
//             </View>

//             <Text style={styles.sectionHeader}>📋 Available Jobs</Text>
//           </>
//         }
//         ListFooterComponent={
//           <>
//             <Text style={styles.sectionHeader}>📌 Current Jobs</Text>
//             <FlatList
//               data={currentJobs}
//               renderItem={renderCurrentJob}
//               keyExtractor={(item) => `current-${item.jobId}`}
//               ListEmptyComponent={<Text style={styles.emptyText}>No current jobs.</Text>}
//             />
//             <Text style={styles.sectionHeader}>📜 Job History</Text>
//             <FlatList
//               data={jobHistory}
//               renderItem={renderHistory}
//               keyExtractor={(item) => `history-${item.jobId}`}
//               onEndReached={() => hasMore && loadJobHistory()}
//               onEndReachedThreshold={0.5}
//               ListEmptyComponent={<Text style={styles.emptyText}>No past jobs yet.</Text>}
//             />
//           </>
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8fafc" },
//   contentContainer: { padding: 20, paddingBottom: 80 },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: { fontSize: 24, fontWeight: "700", marginBottom: 14, color: "#1e3a8a" },
//   profileCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   profileRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
//   label: { fontSize: 14, color: "#555" },
//   value: { fontSize: 15, fontWeight: "700" },
//   sectionHeader: { fontSize: 18, fontWeight: "700", marginVertical: 10, color: "#2563eb" },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   currentJobCard: { backgroundColor: "#e0f2fe", borderRadius: 10, padding: 14, marginBottom: 10 },
//   historyCard: {
//     backgroundColor: "#f9fafb",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//   },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
//   jobMeta: { fontSize: 13, color: "#4b5563", marginTop: 2 },
//   acceptBtn: {
//     marginTop: 10,
//     paddingVertical: 10,
//     borderRadius: 8,
//     backgroundColor: "#2563eb",
//     alignItems: "center",
//   },
//   acceptText: { color: "#fff", fontWeight: "700" },
//   statusText: { fontSize: 13, marginTop: 4, color: "#374151" },
//   emptyText: { textAlign: "center", color: "#6b7280", marginVertical: 10 },
//   logoutBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#ef4444",
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 6,
//     marginRight: 10,
//   },
//   logoutText: { color: "#fff", fontWeight: "700", marginLeft: 4 },
//   backBtn: { marginLeft: 12, padding: 4 },
// });// DoerDashboard.js
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

// export default function DoerDashboard({ navigation }) {
//   // --- state
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

//   // --- sidebar animation refs
//   const sidebarAnim = useRef(new Animated.Value(-300)).current; // offscreen left
//   const overlayOpacity = useRef(new Animated.Value(0)).current;
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   useEffect(() => {
//     loadAllData();
//     const interval = setInterval(() => {
//       loadAvailableJobs(false);
//       loadCurrentJobs(false);
//     }, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   // ---------------- Data loaders (kept logic similar to yours) ----------------
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
//       if (stored) setProfile(JSON.parse(stored));
//       else {
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

//   // ----------------- accept job -----------------
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

//   // ----------------- logout -----------------
//   const handleLogout = async () => {
//     await AsyncStorage.multiRemove(["authToken", "doerProfile"]);
//     navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//   };

//   // ----------------- sidebar open/close -----------------
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
//         toValue: -300,
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

//   // ----------------- render helpers -----------------
//   const formatPrice = (item) => {
//     if (item.amountInRs != null) return item.amountInRs;
//     if (item.amountPaise != null) return item.amountPaise / 100;
//     return 0;
//   };

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

//   const renderCurrentJob = ({ item }) => {
//     const date = item.updatedAt?.split("T")[0] || "N/A";
//     return (
//       <View style={styles.currentJobCard}>
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
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             marginTop: 8,
//           }}
//         >
//           <Text style={styles.statusText}>Status: {item.status}</Text>
//           <Text style={styles.price}>₹{formatPrice(item)}</Text>
//         </View>
//       </View>
//     );
//   };

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
//       <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
//       {/* Custom top bar (so sidebar works reliably) */}
//       <View style={styles.topBar}>
//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <TouchableOpacity onPress={openSidebar} style={styles.iconBtn}>
//             <Ionicons name="menu" size={22} color="#fff" />
//           </TouchableOpacity>
//           <Text style={styles.topTitle}>Doer Dashboard</Text>
//         </View>

//         <View style={{ flexDirection: "row", alignItems: "center" }}>
          

        
//         </View>
//       </View>

//       {/* List */}
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
//             {currentJobs.length === 0 ? (
//               <Text style={styles.emptyText}>No current jobs.</Text>
//             ) : (
//               <FlatList
//                 data={currentJobs}
//                 renderItem={renderCurrentJob}
//                 keyExtractor={(item) => `curr-${item.jobId}`}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
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

//       {/* Animated overlay */}
//       {sidebarOpen && (
//         <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
//           <TouchableOpacity
//             style={{ flex: 1 }}
//             activeOpacity={1}
//             onPress={closeSidebar}
//           />
//         </Animated.View>
//       )}

//       {/* Animated Sidebar */}
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
//           style={[styles.menuItem, { marginBottom: 20 }]}
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
//   topBar: {
//     height: 56,
//     backgroundColor: "#1f2937",
//     paddingHorizontal: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   topTitle: { color: "#fff", fontWeight: "800", fontSize: 18, marginLeft: 8 },
//   iconBtn: { padding: 6, marginRight: 6 },
//   logoutBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#ef4444",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//     marginLeft: 8,
//   },
//   logoutText: { color: "#fff", fontWeight: "700", marginLeft: 6, fontSize: 13 },

//   contentContainer: { padding: 16, paddingBottom: 100 },

//   header: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 10,
//     color: "#0f172a",
//   },
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

//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
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

//   acceptBtn: {
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 8,
//     backgroundColor: "#2563eb",
//   },
//   acceptText: { color: "#fff", fontWeight: "800" },

//   currentJobCard: {
//     backgroundColor: "#e0f2fe",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 10,
//   },
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
//     width: 300,
//     backgroundColor: "#fff",
//     paddingTop: 36,
//     paddingHorizontal: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.2,
//     elevation: 6,
//     zIndex: 40,
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
//     marginLeft: 10,
//     fontSize: 16,
//     color: "#111827",
//     fontWeight: "700",
//   },

//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
// });



// DoerDashboard.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Animated,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchDoerProfile,
  fetchAvailableJobs,
  fetchCurrentJobs,
  acceptJob,
  fetchJobHistory,
} from "../api/doer";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.82);
const CARD_MARGIN = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;

export default function DoerDashboard({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [currentJobs, setCurrentJobs] = useState([]);
  const [jobHistory, setJobHistory] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [acceptingMap, setAcceptingMap] = useState({});
  const [hasPendingJob, setHasPendingJob] = useState(false);

  // Sidebar animation refs
  const sidebarAnim = useRef(new Animated.Value(-320)).current; // offscreen left
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Keep polling small to refresh listings
  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => {
      loadAvailableJobs(false);
      loadCurrentJobs(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // ---------------- Data loaders ----------------
  const loadAllData = async () => {
    setLoading(true);
    await loadProfile();
    await loadAvailableJobs();
    await loadCurrentJobs();
    await loadJobHistory(true);
    await checkPendingJob();
    setLoading(false);
  };

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem("doerProfile");
      if (stored) {
        setProfile(JSON.parse(stored));
      } else {
        const res = await fetchDoerProfile();
        if (res?.data) {
          setProfile(res.data);
          await AsyncStorage.setItem("doerProfile", JSON.stringify(res.data));
        } else {
          Alert.alert("Profile Missing", "Please complete your profile.");
          navigation.reset({ index: 0, routes: [{ name: "EditProfile" }] });
        }
      }
    } catch (err) {
      console.warn("Profile Load Error:", err?.message || err);
      setProfile(null);
    }
  };

  const loadAvailableJobs = async (showSpinner = true) => {
    try {
      if (showSpinner) setJobsLoading(true);
      const res = await fetchAvailableJobs();
      setAvailableJobs(res?.data?.content || []);
    } catch (err) {
      console.warn("Fetch Available Jobs Error:", err?.message || err);
      setAvailableJobs([]);
    } finally {
      if (showSpinner) setJobsLoading(false);
    }
  };

  const loadCurrentJobs = async (showSpinner = true) => {
    try {
      if (showSpinner) setJobsLoading(true);
      const res = await fetchCurrentJobs();
      setCurrentJobs(res?.data?.content || []);
    } catch (err) {
      console.warn("Fetch Current Jobs Error:", err?.message || err);
      setCurrentJobs([]);
    } finally {
      if (showSpinner) setJobsLoading(false);
    }
  };

  const loadJobHistory = async (reset = false) => {
    try {
      const nextPage = reset ? 0 : page;
      const res = await fetchJobHistory(nextPage, 5, ["updatedAt,desc"]);
      if (res?.data?.data?.content) {
        const newJobs = res.data.data.content;
        setJobHistory((prev) => (reset ? newJobs : [...prev, ...newJobs]));
        setHasMore(!res.data.data.last);
        setPage(nextPage + 1);
      }
    } catch (err) {
      console.warn("Fetch Job History Error:", err?.message || err);
    }
  };

  const checkPendingJob = async () => {
    try {
      const res = await fetchCurrentJobs();
      const pending = res?.data?.content?.some(
        (job) => job.status === "ACCEPTED" || job.status === "IN_PROGRESS"
      );
      setHasPendingJob(!!pending);
    } catch (err) {
      console.warn("Pending Job Check Error:", err?.message || err);
      setHasPendingJob(false);
    }
  };

  // ----------------- Accept job -----------------
  const handleAcceptJob = async (jobId) => {
    if (hasPendingJob) {
      Alert.alert("Already Working on a Job", "Please complete your current job first.");
      return;
    }
    try {
      setAcceptingMap((prev) => ({ ...prev, [jobId]: true }));
      const res = await acceptJob(jobId);
      if (res?.status === "SUCCESS") {
        Alert.alert("Success", res.message || "Job accepted!");
        await Promise.all([loadCurrentJobs(), loadAvailableJobs(), loadJobHistory(true), checkPendingJob()]);
      } else {
        Alert.alert("Failed", res?.message || "Could not accept job");
      }
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err?.message || "Network error");
    } finally {
      setAcceptingMap((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  // ----------------- Logout -----------------
  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["authToken", "doerProfile"]);
    navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
  };

  // ----------------- Sidebar controls -----------------
  const openSidebar = () => {
    setSidebarOpen(true);
    Animated.parallel([
      Animated.timing(sidebarAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0.45, duration: 280, useNativeDriver: true }),
    ]).start();
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(sidebarAnim, { toValue: -320, duration: 220, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setSidebarOpen(false));
  };

  // ----------------- helpers -----------------
  const formatPrice = (item) => {
    if (item.amountInRs != null) return item.amountInRs;
    if (item.amountPaise != null) return item.amountPaise / 100;
    return 0;
  };

  // ---------- Render job cards (available) ----------
  const renderJob = ({ item }) => {
    const accepting = acceptingMap[item.jobId] || false;
    return (
      <View style={styles.jobCard}>
        <View style={styles.jobRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle} numberOfLines={2}>{item.title}</Text>
            {item.description ? <Text style={styles.jobMeta} numberOfLines={2}>📝 {item.description}</Text> : null}
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <View style={styles.badge}><Text style={styles.badgeText}>{item.skillCategory || item.category || "General"}</Text></View>
              <Text style={[styles.jobMeta, { marginLeft: 10 }]}>{item.postedAgo || ""}</Text>
            </View>
          </View>

          <View style={{ alignItems: "flex-end", marginLeft: 12 }}>
            <Text style={styles.price}>₹{formatPrice(item)}</Text>
            <Text style={styles.posterText}>{item.posterName || item.postedByName || "Admin"}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12, alignItems: "center" }}>
          <Text style={styles.locationText}>📍 {item.locationArea || "N/A"}</Text>

          <TouchableOpacity
            style={[styles.acceptBtn, (hasPendingJob || accepting) && { backgroundColor: "#9ca3af" }]}
            disabled={hasPendingJob || accepting}
            onPress={() => handleAcceptJob(item.jobId)}
          >
            {accepting ? <ActivityIndicator color="#fff" /> : <Text style={styles.acceptText}>{hasPendingJob ? "Complete Current" : "Accept"}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ---------- Render current job card for carousel ----------
  const renderCurrentJob = ({ item }) => {
    const date = item.updatedAt?.split("T")[0] || "N/A";
    return (
      <View style={[styles.currentJobCard, { width: CARD_WIDTH, marginRight: CARD_MARGIN }]}>
        <Text style={styles.jobTitle} numberOfLines={2}>{item.title}</Text>
        {item.description ? <Text style={styles.jobMeta} numberOfLines={2}>{item.description}</Text> : null}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
          <Text style={styles.jobMeta}>📂 {item.category || item.skillCategory || "N/A"}</Text>
          <Text style={styles.jobMeta}>📅 {date}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12, alignItems: "center" }}>
          <Text style={[styles.statusText, { fontSize: 13 }]}>Status: {item.status}</Text>
          <Text style={styles.price}>₹{formatPrice(item)}</Text>
        </View>
      </View>
    );
  };

  // ---------- Render history ----------
  const renderHistory = ({ item }) => {
    const date = item.updatedAt?.split("T")[0] || "N/A";
    return (
      <View style={styles.historyCard}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        {item.description ? <Text style={styles.jobMeta}>{item.description}</Text> : null}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
          <Text style={styles.jobMeta}>📂 {item.category || item.skillCategory || "N/A"}</Text>
          <Text style={styles.jobMeta}>📅 {date}</Text>
        </View>
        <Text style={[styles.statusText, { marginTop: 8, color: item.status === "COMPLETED" ? "green" : "#f59e0b" }]}>Status: {item.status}</Text>
        <Text style={[styles.price, { marginTop: 8 }]}>₹{formatPrice(item)}</Text>
      </View>
    );
  };

  // ---------------- render ----------------
  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Top bar: only menu + title (NO back arrow, NO logout) */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={openSidebar} style={styles.iconBtn}>
            <Ionicons name="menu" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Doer Dashboard</Text>
        </View>
        <View />{/* placeholder - keeps title centered */}
      </View>

      {/* Main list */}
      <FlatList
        data={availableJobs}
        keyExtractor={(item) => `avail-${item.jobId}`}
        renderItem={renderJob}
        onRefresh={loadAllData}
        refreshing={jobsLoading}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>Welcome{profile?.name ? `, ${profile.name}` : ""} 👋</Text>

            <View style={styles.profileCard}>
              <View style={styles.profileRow}>
                <Text style={styles.label}>📞 Phone Verified</Text>
                <Text style={[styles.value, { color: profile?.isPhoneVerified ? "green" : "red" }]}>{profile?.isPhoneVerified ? "Yes" : "No"}</Text>
              </View>

              <View style={styles.profileRow}>
                <Text style={styles.label}>🪪 KYC Level</Text>
                <Text style={styles.value}>{profile?.kycLevel ?? 0}</Text>
              </View>

              <View style={styles.profileRow}>
                <Text style={styles.label}>📋 Verification Status</Text>
                <Text style={styles.value}>{profile?.verificationStatus || "Unknown"}</Text>
              </View>

              <View style={styles.profileRow}>
                <Text style={styles.label}>✅ Profile Verified</Text>
                <Text style={[styles.value, { color: profile?.isVerified ? "green" : "orange" }]}>{profile?.isVerified ? "Yes" : "No"}</Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>📋 Available Jobs</Text>
            {availableJobs.length === 0 && !jobsLoading && (
              <View style={styles.emptyBox}><Text style={styles.emptyText}>No available jobs right now.</Text></View>
            )}
          </>
        }
        ListFooterComponent={
          <>
            <Text style={styles.sectionHeader}>📌 Current Jobs</Text>

            {/* Swipeable carousel for Current Jobs */}
            {currentJobs.length === 0 ? (
              <Text style={styles.emptyText}>No current jobs.</Text>
            ) : (
              <FlatList
                data={currentJobs}
                keyExtractor={(item) => `curr-${item.jobId}`}
                renderItem={renderCurrentJob}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled={false}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                contentContainerStyle={{ paddingLeft: 16, paddingVertical: 8 }}
                snapToAlignment="start"
              />
            )}

            <Text style={styles.sectionHeader}>📜 Job History</Text>
            {jobHistory.length === 0 ? (
              <Text style={styles.emptyText}>No past jobs yet.</Text>
            ) : (
              <FlatList
                data={jobHistory}
                renderItem={renderHistory}
                keyExtractor={(item) => `hist-${item.jobId}`}
                onEndReached={() => hasMore && loadJobHistory()}
                onEndReachedThreshold={0.5}
              />
            )}
          </>
        }
      />

      {/* Overlay (dim) */}
      {sidebarOpen && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeSidebar} />
        </Animated.View>
      )}

      {/* Animated Sidebar (narrower, rounded right edge) */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Menu</Text>
          <TouchableOpacity onPress={closeSidebar}><Ionicons name="close" size={22} color="#111827" /></TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => { closeSidebar(); navigation.navigate("DoerDashboard"); }}>
          <Ionicons name="home-outline" size={20} color="#2563eb" />
          <Text style={styles.menuText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => { closeSidebar(); navigation.navigate("DoerProfile"); }}>
          <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
          <Text style={styles.menuText}>View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => { closeSidebar(); navigation.navigate("EditProfile"); }}>
          <Ionicons name="create-outline" size={20} color="#2563eb" />
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, !profile?.isPhoneVerified && { opacity: 0.5 }]} disabled={!profile?.isPhoneVerified} onPress={() => {
          if (!profile?.isPhoneVerified) { Alert.alert("Phone not verified", "Verify your phone first."); return; }
          closeSidebar(); navigation.navigate("KYCPage");
        }}>
          <Ionicons name="document-text-outline" size={20} color="#2563eb" />
          <Text style={styles.menuText}>Upload KYC</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={[styles.menuItem, { marginBottom: 22 }]} onPress={() => { closeSidebar(); handleLogout(); }}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={[styles.menuText, { color: "#ef4444" }]}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

// ------------------ styles ------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  

  // Top bar
  topBar: {
    height: 56,
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: { padding: 6, marginRight: 6 },
  topTitle: { color: "#fff", fontWeight: "800", fontSize: 18, marginLeft: 8 },

  // Content
  contentContainer: { padding: 16, paddingBottom: 100 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 10, color: "#0f172a" },

  // Profile
  profileCard: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.05, elevation: 2 },
  profileRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { fontSize: 14, color: "#4b5563" },
  value: { fontSize: 14, fontWeight: "800" },

  sectionHeader: { fontSize: 16, fontWeight: "800", marginVertical: 10, color: "#2563eb" },

  // Job card
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e6eef9",
    elevation: 1,
  },
  jobRow: { flexDirection: "row", alignItems: "flex-start" },
  jobTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  jobMeta: { fontSize: 13, color: "#475569", marginTop: 6 },
  badge: { backgroundColor: "#eef2ff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: "#3730a3", fontWeight: "700", fontSize: 12 },
  price: { fontWeight: "900", color: "#0f172a", fontSize: 16 },
  posterText: { color: "#475569", fontSize: 12, marginTop: 6 },
  locationText: { color: "#475569", fontSize: 13 },

  acceptBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: "#2563eb" },
  acceptText: { color: "#fff", fontWeight: "800" },

  // Current jobs (carousel)
  currentJobCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },

  // History
  historyCard: { backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: "#eef2ff" },

  statusText: { color: "#374151", fontWeight: "700" },
  emptyText: { textAlign: "center", color: "#6b7280", paddingVertical: 10 },
  emptyBox: { backgroundColor: "#fff", padding: 12, borderRadius: 10, alignItems: "center" },

  // overlay + sidebar
  overlay: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, backgroundColor: "#000" },

  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 180,
    backgroundColor: "#fff",
    paddingTop: 34,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    elevation: 8,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    zIndex: 50,
  },
  sidebarHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sidebarTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  menuText: { marginLeft: 12, fontSize: 16, color: "#111827", fontWeight: "700" },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});

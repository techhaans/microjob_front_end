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
import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
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

export default function DoerDashboard({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [currentJobs, setCurrentJobs] = useState([]);
  const [jobHistory, setJobHistory] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [acceptingMap, setAcceptingMap] = useState({});
  const [hasPendingJob, setHasPendingJob] = useState(false);

  // ---------- Header ----------
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Doer Dashboard",
      headerStyle: { backgroundColor: "#2563eb" },
      headerTitleStyle: { color: "#fff", fontWeight: "700" },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => setSidebarVisible(true)}
          style={{ marginLeft: 12 }}
        >
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // ---------- Load Data ----------
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadAllData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadAllData = async () => {
    await loadProfile();
    await loadAvailableJobs();
    await loadCurrentJobs();
    await loadJobHistory(true);
    await checkPendingJob();
  };

  // Auto-refresh every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      loadAvailableJobs(false);
      loadCurrentJobs(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // ---------- Profile ----------
  const loadProfile = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem("doerProfile");
      if (stored) setProfile(JSON.parse(stored));
      else {
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
      console.warn("Profile Load Error:", err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Jobs ----------
  const loadAvailableJobs = async (showSpinner = true) => {
    try {
      if (showSpinner) setJobsLoading(true);
      const res = await fetchAvailableJobs();
      setAvailableJobs(res?.data?.content || []);
    } catch (err) {
      console.warn("Fetch Available Jobs Error:", err.message);
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
      console.warn("Fetch Current Jobs Error:", err.message);
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
      console.warn("Fetch Job History Error:", err.message);
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
      console.warn("Pending Job Check Error:", err.message);
      setHasPendingJob(false);
    }
  };

  // ---------- Logout ----------
  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["authToken", "doerProfile"]);
    navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
  };

  // ---------- Accept Job ----------
  const handleAcceptJob = async (jobId) => {
    if (hasPendingJob) {
      Alert.alert(
        "Already Working on a Job",
        "Please complete your current job first."
      );
      return;
    }
    try {
      setAcceptingMap((prev) => ({ ...prev, [jobId]: true }));
      const res = await acceptJob(jobId);
      if (res?.status === "SUCCESS") {
        Alert.alert("Success", res.message || "Job accepted!");
        await loadCurrentJobs();
        await loadAvailableJobs();
        await loadJobHistory(true);
        await checkPendingJob();
      } else {
        Alert.alert("Failed", res.message || "Could not accept job");
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || err.message);
    } finally {
      setAcceptingMap((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  // ---------- Sidebar ----------
  const Sidebar = () => (
    <Modal
      visible={sidebarVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setSidebarVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.sidebar}>
          <TouchableOpacity
            onPress={() => setSidebarVisible(false)}
            style={{ alignSelf: "flex-end" }}
          >
            <Ionicons name="close" size={26} color="#333" />
          </TouchableOpacity>

          <View style={{ marginVertical: 20 }}>
            <Text style={styles.sidebarTitle}>Menu</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setSidebarVisible(false);
                navigation.navigate("DoerProfile");
              }}
            >
              <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
              <Text style={styles.menuText}>View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setSidebarVisible(false);
                navigation.navigate("EditProfile");
              }}
            >
              <Ionicons name="create-outline" size={20} color="#2563eb" />
              <Text style={styles.menuText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                !profile?.isPhoneVerified && { opacity: 0.5 },
              ]}
              disabled={!profile?.isPhoneVerified}
              onPress={() => {
                if (!profile?.isPhoneVerified) {
                  Alert.alert("Phone not verified", "Verify your phone first.");
                  return;
                }
                setSidebarVisible(false);
                navigation.navigate("KYCPage");
              }}
            >
              <Ionicons name="document-text-outline" size={20} color="#2563eb" />
              <Text style={styles.menuText}>Upload KYC</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ---------- Render Job ----------
  const renderJob = ({ item }) => {
    const accepting = acceptingMap[item.jobId] || false;
    return (
      <View style={styles.jobCard}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobMeta}>💰 ₹{item.amountInRs}</Text>
        <Text style={styles.jobMeta}>📍 {item.locationArea}</Text>
        <Text style={styles.jobMeta}>🕒 {item.postedAgo}</Text>

        <TouchableOpacity
          style={[
            styles.acceptBtn,
            (hasPendingJob || accepting) && { backgroundColor: "#9ca3af" },
          ]}
          disabled={hasPendingJob || accepting}
          onPress={() => handleAcceptJob(item.jobId)}
        >
          {accepting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.acceptText}>
              {hasPendingJob ? "Complete Current Job" : "Accept Job"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // ---------- Render Current Job ----------
  const renderCurrentJob = ({ item }) => (
    <View style={styles.currentJobCard}>
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.jobMeta}>💰 ₹{item.amountPaise / 100}</Text>
      <Text style={styles.jobMeta}>📂 {item.category}</Text>
      <Text style={styles.statusText}>Status: {item.status}</Text>
    </View>
  );

  // ---------- Render Job History ----------
  const renderHistory = ({ item }) => (
    <View style={styles.historyCard}>
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.jobMeta}>💰 ₹{item.amountPaise / 100}</Text>
      <Text style={styles.jobMeta}>📂 {item.category}</Text>
      <Text style={styles.jobMeta}>📅 {item.updatedAt.split("T")[0]}</Text>
      <Text style={styles.statusText}>Status: {item.status}</Text>
    </View>
  );

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );

  return (
    <>
      <Sidebar />

      <FlatList
        data={availableJobs}
        keyExtractor={(item) => item.jobId.toString()}
        renderItem={renderJob}
        onRefresh={loadAllData}
        refreshing={jobsLoading}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>
              Welcome{profile?.name ? `, ${profile.name}` : ""} 👋
            </Text>

            <View style={styles.profileCard}>
              <Text style={styles.label}>📞 Phone Verified</Text>
              <Text
                style={[
                  styles.value,
                  { color: profile?.isPhoneVerified ? "green" : "red" },
                ]}
              >
                {profile?.isPhoneVerified ? "Yes" : "No"}
              </Text>

              <Text style={styles.label}>🪪 KYC Level</Text>
              <Text style={styles.value}>{profile?.kycLevel ?? 0}</Text>

              <Text style={styles.label}>📋 Verification Status</Text>
              <Text style={styles.value}>
                {profile?.verificationStatus || "Unknown"}
              </Text>

              <Text style={styles.label}>✅ Profile Verified</Text>
              <Text
                style={[
                  styles.value,
                  { color: profile?.isVerified ? "green" : "orange" },
                ]}
              >
                {profile?.isVerified ? "Yes" : "No"}
              </Text>
            </View>

            <Text style={styles.sectionHeader}>📋 Available Jobs</Text>
          </>
        }
        ListFooterComponent={
          <>
            <Text style={styles.sectionHeader}>📌 Current Jobs</Text>
            <FlatList
              data={currentJobs}
              renderItem={renderCurrentJob}
              keyExtractor={(item) => `current-${item.jobId}`}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No current jobs.</Text>
              }
            />

            <Text style={styles.sectionHeader}>📜 Job History</Text>
            <FlatList
              data={jobHistory}
              renderItem={renderHistory}
              keyExtractor={(item) => `history-${item.jobId}`}
              onEndReached={() => hasMore && loadJobHistory()}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No past jobs yet.</Text>
              }
            />
          </>
        }
      />
    </>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  contentContainer: { padding: 20, backgroundColor: "#f1f5f9", paddingBottom: 80 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 14, color: "#1e3a8a" },

  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  label: { fontSize: 14, color: "#555", marginTop: 6 },
  value: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
    color: "#2563eb",
  },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  currentJobCard: {
    backgroundColor: "#e0f2fe",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  historyCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  jobTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  jobMeta: { fontSize: 13, color: "#4b5563", marginTop: 2 },
  acceptBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },
  acceptText: { color: "#fff", fontWeight: "700" },
  statusText: { fontSize: 13, marginTop: 4, color: "#374151" },
  emptyText: { textAlign: "center", color: "#6b7280", marginVertical: 10 },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 10,
  },
  logoutText: { color: "#fff", fontWeight: "700", marginLeft: 4 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    flexDirection: "row",
  },
  sidebar: {
    backgroundColor: "#fff",
    width: "70%",
    padding: 20,
    paddingTop: 36,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },
  menuText: { fontSize: 16, color: "#333", marginLeft: 10 },
});

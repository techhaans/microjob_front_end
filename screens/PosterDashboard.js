// import React, { useEffect, useState, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Modal,
//   Platform,
//   FlatList,
//   TextInput,
//   KeyboardAvoidingView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import { Picker } from "@react-native-picker/picker";
// import {
//   fetchPosterProfile,
//   logoutPoster,
//   getPosterJobs,
//   deletePosterJob,
//   updatePosterJob,
//   fetchCategories,
//   fetchPosterAddresses,
// } from "../api/poster";

// export default function PosterDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [sidebarVisible, setSidebarVisible] = useState(false);
//   const [jobs, setJobs] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);

//   const [updateModalVisible, setUpdateModalVisible] = useState(false);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryCode, setCategoryCode] = useState("");
//   const [amountPaise, setAmountPaise] = useState("");
//   const [deadLine, setDeadLine] = useState(new Date());
//   const [addressId, setAddressId] = useState("");

//   const [categories, setCategories] = useState([]);
//   const [addresses, setAddresses] = useState([]);

//   // ---------- Header ----------
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Poster Dashboard",
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

//   // ---------- Load when focused ----------
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadData(); // Load everything on dashboard open or return
//     });
//     return unsubscribe;
//   }, [navigation]);

//   // ---------- Auto-refresh jobs when returning from CreateJobScreen ----------
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadJobs(); // Auto-refresh job list when back to dashboard
//     });
//     return unsubscribe;
//   }, [navigation]);

//   // ---------- Load All ----------
//   const loadData = async () => {
//     await loadProfile();
//     await loadJobs();
//     await loadCategories();
//     await loadAddresses();
//   };

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchPosterProfile();
//       if (res?.status === "SUCCESS" && res.data) {
//         setProfile(res.data);
//         await AsyncStorage.setItem("posterProfile", JSON.stringify(res.data));
//       } else {
//         setProfile(null);
//         Alert.alert("Info", "No profile found. Please complete your profile.");
//         navigation.reset({ index: 0, routes: [{ name: "PosterProfileEdit" }] });
//       }
//     } catch (err) {
//       console.error("[Profile Error]", err);
//       Alert.alert("Error", "Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadJobs = async () => {
//     setLoading(true);
//     const res = await getPosterJobs(0, 20); // fetch first 20 jobs
//     setLoading(false);

//     if (res.status === "ERROR") {
//       Alert.alert("Error", res.message);
//       return;
//     }

//     setJobs(res.content || []);
//   };

//   const loadCategories = async () => {
//     try {
//       const res = await fetchCategories();
//       if (res?.content) setCategories(res.content);
//       else setCategories([]);
//     } catch (err) {
//       console.error("[Categories Error]", err);
//     }
//   };

//   const loadAddresses = async () => {
//     try {
//       const res = await fetchPosterAddresses();
//       if (res?.content) setAddresses(res.content);
//       else setAddresses([]);
//     } catch (err) {
//       console.error("[Addresses Error]", err);
//     }
//   };

//   // ---------- Logout ----------
//   const handleLogout = async () => {
//     try {
//       await logoutPoster();
//       navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//     } catch (err) {
//       console.error("[Logout Error]", err);
//       Alert.alert("Error", "Logout failed. Please try again.");
//     }
//   };

//   // ---------- Delete Job ----------
//   const handleDeleteJob = (jobId) => {
//     Alert.alert("Confirm Delete", "Are you sure you want to delete this job?", [
//       { text: "Cancel" },
//       {
//         text: "Delete",
//         onPress: async () => {
//           try {
//             await deletePosterJob(jobId);
//             Alert.alert("Deleted", "Job deleted successfully");
//             loadJobs();
//           } catch (err) {
//             console.error(err);
//             Alert.alert("Error", "Failed to delete job");
//           }
//         },
//       },
//     ]);
//   };

//   // ---------- Open Update Job ----------
//   const handleOpenUpdate = (job) => {
//     setSelectedJob(job);
//     setTitle(job.title || "");
//     setDescription(job.description || "");
//     setCategoryCode(job.categoryCode || "");
//     setAmountPaise(String(job.amountPaise || ""));
//     setDeadLine(new Date(job.deadLine || new Date()));
//     setAddressId(String(job.addressId || ""));
//     setUpdateModalVisible(true);
//   };

//   // ---------- Update Job ----------
//   const handleUpdateJob = async () => {
//     if (!title || !description) {
//       return Alert.alert("Validation", "Title & Description required");
//     }
//     try {
//       const payload = {
//         title,
//         description,
//         categoryCode,
//         amountPaise: Number(amountPaise),
//         deadLine: deadLine.toISOString(),
//         addressId: Number(addressId),
//       };
//       const res = await updatePosterJob(selectedJob.id, payload);
//       if (res.status === "SUCCESS") {
//         Alert.alert("✅ Updated", "Job updated successfully");
//         setUpdateModalVisible(false);
//         loadJobs();
//       } else {
//         Alert.alert("Error", res.message || "Failed to update job");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Something went wrong");
//     }
//   };

//   // ---------- Render Job ----------
//   const renderJobItem = ({ item }) => (
//     <View style={styles.jobCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       <Text style={styles.jobMeta}>
//         📍 {item.addressLabel || "No Address"} | 🗓{" "}
//         {new Date(item.createdAt).toLocaleDateString()}
//       </Text>
//       <Text style={styles.jobStatus}>
//         Status: <Text style={{ fontWeight: "700" }}>{item.status}</Text>
//       </Text>

//       <View style={{ flexDirection: "row", marginTop: 10 }}>
//         <TouchableOpacity
//           style={[styles.btn, { backgroundColor: "#007bff", marginRight: 10 }]}
//           onPress={() => handleOpenUpdate(item)}
//         >
//           <Text style={styles.btnText}>Update</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.btn, { backgroundColor: "#e74c3c" }]}
//           onPress={() => handleDeleteJob(item.id)}
//         >
//           <Text style={styles.btnText}>Delete</Text>
//         </TouchableOpacity>
//       </View>
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
//       {/* Sidebar */}
//       <Modal
//         visible={sidebarVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setSidebarVisible(false)}
//       >
//         <View style={styles.overlay}>
//           <View style={styles.sidebar}>
//             <TouchableOpacity
//               onPress={() => setSidebarVisible(false)}
//               style={{ marginBottom: 12 }}
//             >
//               <Ionicons name="close" size={26} color="#000" />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 setSidebarVisible(false);
//                 navigation.navigate("PosterProfileView");
//               }}
//             >
//               <Text style={styles.menuText}>👤 View Profile</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 setSidebarVisible(false);
//                 navigation.navigate("PosterProfileEdit", { isEdit: true });
//               }}
//             >
//               <Text style={styles.menuText}>✏️ Edit Profile</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 setSidebarVisible(false);
//                 navigation.navigate("PosterKycUpload");
//               }}
//             >
//               <Text style={styles.menuText}>🪪 Upload KYC</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Update Modal */}
//       <Modal
//         visible={updateModalVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setUpdateModalVisible(false)}
//       >
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           style={styles.modalOverlay}
//         >
//           <View style={styles.modalContent}>
//             <Text style={{ fontWeight: "700", fontSize: 18, marginBottom: 10 }}>
//               Update Job
//             </Text>

//             <TextInput
//               style={styles.input}
//               placeholder="Title"
//               value={title}
//               onChangeText={setTitle}
//             />
//             <TextInput
//               style={[styles.input, { height: 60 }]}
//               placeholder="Description"
//               multiline
//               value={description}
//               onChangeText={setDescription}
//             />

//             <Text>Category:</Text>
//             <Picker
//               selectedValue={categoryCode}
//               onValueChange={setCategoryCode}
//               style={{ marginBottom: 10 }}
//             >
//               {categories.length ? (
//                 categories.map((cat) => (
//                   <Picker.Item
//                     key={cat.code}
//                     label={cat.name}
//                     value={cat.code}
//                   />
//                 ))
//               ) : (
//                 <Picker.Item label="No Category" value="" />
//               )}
//             </Picker>

//             <Text>Address:</Text>
//             <Picker
//               selectedValue={addressId}
//               onValueChange={setAddressId}
//               style={{ marginBottom: 10 }}
//             >
//               {addresses.length ? (
//                 addresses.map((addr) => (
//                   <Picker.Item
//                     key={addr.id}
//                     label={addr.label}
//                     value={String(addr.id)}
//                   />
//                 ))
//               ) : (
//                 <Picker.Item label="No Address" value="" />
//               )}
//             </Picker>

//             <TextInput
//               style={styles.input}
//               placeholder="Amount (Paise)"
//               keyboardType="numeric"
//               value={amountPaise}
//               onChangeText={setAmountPaise}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Deadline (ISO)"
//               value={deadLine.toISOString()}
//               onChangeText={(text) => setDeadLine(new Date(text))}
//             />

//             <View
//               style={{ flexDirection: "row", justifyContent: "space-between" }}
//             >
//               <TouchableOpacity
//                 style={[styles.btn, { backgroundColor: "#007bff" }]}
//                 onPress={handleUpdateJob}
//               >
//                 <Text style={styles.btnText}>Update</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.btn, { backgroundColor: "#999" }]}
//                 onPress={() => setUpdateModalVisible(false)}
//               >
//                 <Text style={styles.btnText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>

//       {/* Job List */}
//       <FlatList
//         data={jobs || []}
//         keyExtractor={(item, index) =>
//           item?.id ? item.id.toString() : index.toString()
//         }
//         renderItem={renderJobItem}
//         onRefresh={loadJobs}
//         refreshing={refreshing}
//         contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
//         ListHeaderComponent={
//           <>
//             <Text style={styles.header}>
//               Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""} 👋
//             </Text>

//             <TouchableOpacity
//               style={styles.btn}
//               onPress={() => navigation.navigate("CreateJobScreen")}
//             >
//               <Text style={styles.btnText}>Create New Job</Text>
//             </TouchableOpacity>

//             <Text style={styles.sectionHeader}>📋 Your Job Posts</Text>
//           </>
//         }
//         ListEmptyComponent={
//           <Text style={{ textAlign: "center", color: "#555", marginTop: 20 }}>
//             No job posts found. Create one!
//           </Text>
//         }
//       />
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
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
//   header: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 12,
//     color: "#0b4da0",
//   },
//   btn: {
//     backgroundColor: "#0b78ff",
//     padding: 16,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 10,
//     marginBottom: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
//   logoutBtn: {
//     backgroundColor: "#e74c3c",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//     marginRight: 10,
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginTop: 10,
//     marginBottom: 10,
//     color: "#0b4da0",
//   },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
//   jobMeta: { fontSize: 13, color: "#555", marginTop: 4 },
//   jobStatus: { fontSize: 13, color: "#0b4da0", marginTop: 6 },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "rgba(0,0,0,0.3)",
//     padding: 20,
//   },
//   modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 8,
//   },
// });
// clrret coseeee

// import React, { useEffect, useState, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Modal,
//   Platform,
//   FlatList,
//   TextInput,
//   KeyboardAvoidingView,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import { Picker } from "@react-native-picker/picker";
// import {
//   fetchPosterProfile,
//   logoutPoster,
//   getPosterJobs,
//   deletePosterJob,
//   updatePosterJob,
//   fetchCategories,
//   fetchPosterAddresses,
// } from "../api/poster";

// export default function PosterDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [jobs, setJobs] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);

//   // Sidebar state
//   const [sidebarVisible, setSidebarVisible] = useState(false);

//   // Update modal state
//   const [updateModalVisible, setUpdateModalVisible] = useState(false);
//   const [selectedJob, setSelectedJob] = useState(null);

//   // Editable fields
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryCode, setCategoryCode] = useState("");
//   const [amountPaise, setAmountPaise] = useState("");
//   const [deadline, setDeadline] = useState(new Date());
//   const [addressId, setAddressId] = useState("");

//   // Lists
//   const [categories, setCategories] = useState([]);
//   const [addresses, setAddresses] = useState([]);

//   // ---------- Header ----------
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Poster Dashboard",
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

//   // ---------- Load data on focus ----------
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadAll();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const loadAll = async () => {
//     await Promise.all([loadProfile(), loadJobs(), loadCategories(), loadAddresses()]);
//   };

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchPosterProfile();
//       if (res?.status === "SUCCESS" && res.data) {
//         setProfile(res.data);
//         await AsyncStorage.setItem("posterProfile", JSON.stringify(res.data));
//       } else {
//         setProfile(null);
//         Alert.alert("Info", "No profile found. Please complete your profile.");
//         navigation.reset({ index: 0, routes: [{ name: "PosterProfileEdit" }] });
//       }
//     } catch (err) {
//       console.warn("[Profile Error]", err.message || err);
//       setProfile(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadJobs = async () => {
//     setRefreshing(true);
//     try {
//       const res = await getPosterJobs(0, 20);
//       if (res?.content) setJobs(res.content);
//       else setJobs([]);
//     } catch (err) {
//       console.warn("[Jobs Error]", err.message || err);
//       setJobs([]);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const loadCategories = async () => {
//     try {
//       const res = await fetchCategories();
//       if (res?.status === "SUCCESS" && Array.isArray(res.data)) setCategories(res.data);
//       else setCategories([]);
//     } catch (err) {
//       console.warn("[Categories Error]", err.message || err);
//       setCategories([]);
//     }
//   };

//   const loadAddresses = async () => {
//     try {
//       const res = await fetchPosterAddresses();
//       if (res?.status === "SUCCESS" && Array.isArray(res.data)) setAddresses(res.data);
//       else setAddresses([]);
//     } catch (err) {
//       console.warn("[Addresses Error]", err.message || err);
//       setAddresses([]);
//     }
//   };

//   // ---------- Logout ----------
//   const handleLogout = async () => {
//     try {
//       await logoutPoster();
//       navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//     } catch (err) {
//       console.warn("[Logout Error]", err.message || err);
//       Alert.alert("Error", "Logout failed. Please try again.");
//     }
//   };

//   // ---------- Delete ----------
//   const handleDeleteJob = (jobId) => {
//     Alert.alert("Confirm Delete", "Are you sure you want to delete this job?", [
//       { text: "Cancel" },
//       {
//         text: "Delete",
//         onPress: async () => {
//           try {
//             await deletePosterJob(jobId);
//             Alert.alert("Deleted", "Job deleted successfully");
//             loadJobs();
//           } catch (err) {
//             console.warn("[Delete Error]", err.message || err);
//             Alert.alert("Error", "Failed to delete job");
//           }
//         },
//       },
//     ]);
//   };

//   // ---------- Open Update Modal ----------
//   const handleOpenUpdate = (job) => {
//     setSelectedJob(job);
//     setTitle(job.title || "");
//     setDescription(job.description || "");
//     setAmountPaise(String(job.amountPaise || ""));
//     setDeadline(new Date(job.deadline || job.deadLine || new Date()));

//     const matchedCategory = categories.find(
//       (c) =>
//         c.name.toLowerCase() === (job.category?.name || job.category || "").toLowerCase()
//     );
//     const matchedAddress = addresses.find(
//       (a) =>
//         a.label.toLowerCase() === (job.address?.label || job.addressLabel || "").toLowerCase()
//     );

//     setCategoryCode(String(matchedCategory?.code || ""));
//     setAddressId(String(matchedAddress?.id || ""));
//     setUpdateModalVisible(true);
//   };

//   // ---------- Update Job ----------
//   const handleUpdateJob = async () => {
//     if (!title || !description || !categoryCode || !addressId) {
//       return Alert.alert("Validation", "All fields are required");
//     }

//     try {
//       const payload = {
//         title,
//         description,
//         categoryCode: Number(categoryCode),
//         amountPaise: Number(amountPaise),
//         deadline: deadline.toISOString(),
//         addressId: Number(addressId),
//       };

//       const res = await updatePosterJob(selectedJob.id, payload);

//       if (res.status === "SUCCESS") {
//         Alert.alert("✅ Updated", "Job updated successfully");
//         setUpdateModalVisible(false);
//         loadJobs();
//       } else {
//         Alert.alert("Error", res.message || "Failed to update job");
//       }
//     } catch (err) {
//       console.warn("[Update Error]", err.message || err);
//       Alert.alert("Error", "Something went wrong");
//     }
//   };

//   // ---------- Render Job ----------
//   const renderJobItem = ({ item }) => (
//     <View style={styles.jobCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       <Text style={styles.jobMeta}>
//         📦 {item.category?.name || item.category || "No Category"} | 📍{" "}
//         {item.address?.label || item.addressLabel || "No Address"}
//       </Text>
//       <Text style={styles.jobMeta}>
//         🗓 {new Date(item.createdAt).toLocaleDateString()}
//       </Text>
//       <Text style={styles.jobStatus}>
//         Status: <Text style={{ fontWeight: "700" }}>{item.status}</Text>
//       </Text>

//       <View style={{ flexDirection: "row", marginTop: 10 }}>
//         <TouchableOpacity
//           style={[styles.btn, { backgroundColor: "#007bff", marginRight: 10 }]}
//           onPress={() => handleOpenUpdate(item)}
//         >
//           <Text style={styles.btnText}>Update</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.btn, { backgroundColor: "#e74c3c" }]}
//           onPress={() => handleDeleteJob(item.id)}
//         >
//           <Text style={styles.btnText}>Delete</Text>
//         </TouchableOpacity>
//       </View>
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
//       {/* Sidebar Modal */}
//       <Modal
//         visible={sidebarVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setSidebarVisible(false)}
//       >
//         <View style={styles.overlay}>
//           <View style={styles.sidebar}>
//             <TouchableOpacity
//               onPress={() => setSidebarVisible(false)}
//               style={{ marginBottom: 12 }}
//             >
//               <Ionicons name="close" size={26} color="#000" />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 setSidebarVisible(false);
//                 navigation.navigate("PosterProfileView");
//               }}
//             >
//               <Text style={styles.menuText}>👤 View Profile</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 setSidebarVisible(false);
//                 navigation.navigate("PosterProfileEdit", { isEdit: true });
//               }}
//             >
//               <Text style={styles.menuText}>✏️ Edit Profile</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 setSidebarVisible(false);
//                 navigation.navigate("PosterKycUpload");
//               }}
//             >
//               <Text style={styles.menuText}>🪪 Upload KYC</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Update Modal */}
//       <Modal
//         visible={updateModalVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setUpdateModalVisible(false)}
//       >
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           style={styles.modalOverlay}
//         >
//           <ScrollView contentContainerStyle={styles.modalContent}>
//             <Text style={styles.modalHeader}>Update Job</Text>

//             <TextInput
//               style={styles.input}
//               placeholder="Title"
//               value={title}
//               onChangeText={setTitle}
//             />
//             <TextInput
//               style={[styles.input, { height: 70 }]}
//               placeholder="Description"
//               multiline
//               value={description}
//               onChangeText={setDescription}
//             />

//             <Text>Category:</Text>
//             <Picker
//               selectedValue={categoryCode}
//               onValueChange={(v) => setCategoryCode(String(v))}
//             >
//               <Picker.Item label="Select Category" value="" />
//               {categories.length > 0 ? (
//                 categories.map((cat) => (
//                   <Picker.Item key={cat.code} label={cat.name} value={String(cat.code)} />
//                 ))
//               ) : (
//                 <Picker.Item label="No categories available" value="" />
//               )}
//             </Picker>

//             <Text>Address:</Text>
//             <Picker
//               selectedValue={addressId}
//               onValueChange={(v) => setAddressId(String(v))}
//             >
//               <Picker.Item label="Select Address" value="" />
//               {addresses.length > 0 ? (
//                 addresses.map((addr) => (
//                   <Picker.Item
//                     key={addr.id}
//                     label={`${addr.label} (${addr.area || "-"})`}
//                     value={String(addr.id)}
//                   />
//                 ))
//               ) : (
//                 <Picker.Item label="No addresses available" value="" />
//               )}
//             </Picker>

//             <TextInput
//               style={styles.input}
//               placeholder="Amount (Paise)"
//               keyboardType="numeric"
//               value={amountPaise}
//               onChangeText={setAmountPaise}
//             />

//             <TextInput
//               style={styles.input}
//               placeholder="Deadline (YYYY-MM-DD)"
//               value={deadline.toISOString().split("T")[0]}
//               onChangeText={(t) => setDeadline(new Date(t))}
//             />

//             <View style={styles.modalBtns}>
//               <TouchableOpacity
//                 style={[styles.btn, { backgroundColor: "#007bff" }]}
//                 onPress={handleUpdateJob}
//               >
//                 <Text style={styles.btnText}>Update</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.btn, { backgroundColor: "#999" }]}
//                 onPress={() => setUpdateModalVisible(false)}
//               >
//                 <Text style={styles.btnText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </Modal>

//       {/* Jobs List */}
//       <FlatList
//         data={jobs}
//         keyExtractor={(item, i) => item.id?.toString() || i.toString()}
//         renderItem={renderJobItem}
//         onRefresh={loadJobs}
//         refreshing={refreshing}
//         contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
//         ListHeaderComponent={
//           <>
//             <Text style={styles.header}>
//               Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""} 👋
//             </Text>

//             <TouchableOpacity
//               style={styles.btn}
//               onPress={() => navigation.navigate("CreateJobScreen")}
//             >
//               <Text style={styles.btnText}>Create New Job</Text>
//             </TouchableOpacity>

//             <Text style={styles.sectionHeader}>📋 Your Job Posts</Text>
//           </>
//         }
//         ListEmptyComponent={
//           <Text style={{ textAlign: "center", color: "#555", marginTop: 20 }}>
//             No job posts found. Create one!
//           </Text>
//         }
//       />
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: { fontSize: 22, fontWeight: "700", marginBottom: 12, color: "#0b4da0" },
//   btn: {
//     backgroundColor: "#0b78ff",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
//   jobMeta: { fontSize: 13, color: "#555", marginTop: 2 },
//   jobStatus: { fontSize: 13, color: "#0b4da0", marginTop: 4 },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "rgba(0,0,0,0.3)",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 20,
//     marginHorizontal: 20,
//   },
//   modalHeader: { fontWeight: "700", fontSize: 18, marginBottom: 10 },
//   input: { borderWidth: 1, borderColor: "#ddd", padding: 10, marginBottom: 10, borderRadius: 8 },
//   modalBtns: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
//   logoutBtn: { backgroundColor: "#e74c3c", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 10 },
//   sectionHeader: { fontSize: 18, fontWeight: "700", marginTop: 10, marginBottom: 10, color: "#0b4da0" },

//   // Sidebar
//   overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", flexDirection: "row" },
//   sidebar: { backgroundColor: "#fff", width: "70%", padding: 20, paddingTop: 36, borderTopRightRadius: 20, borderBottomRightRadius: 20 },
//   menuItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
//   menuText: { fontSize: 16, color: "#333" },
// });
// import React, { useEffect, useState, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Modal,
//   Platform,
//   FlatList,
//   TextInput,
//   KeyboardAvoidingView,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import { Picker } from "@react-native-picker/picker";
// import {
//   fetchPosterProfile,
//   logoutPoster,
//   getPosterJobs,
//   deletePosterJob,
//   updatePosterJob,
//   fetchCategories,
//   fetchPosterAddresses,
// } from "../api/poster";

// export default function PosterDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [jobs, setJobs] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);

//   // Pagination
//   const [page, setPage] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loadingMore, setLoadingMore] = useState(false);

//   // Sidebar
//   const [sidebarVisible, setSidebarVisible] = useState(false);

//   // Update modal
//   const [updateModalVisible, setUpdateModalVisible] = useState(false);
//   const [selectedJob, setSelectedJob] = useState(null);

//   // Editable fields
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryCode, setCategoryCode] = useState("");
//   const [amountPaise, setAmountPaise] = useState("");
//   const [deadline, setDeadline] = useState(new Date());
//   const [addressId, setAddressId] = useState("");

//   // Lists
//   const [categories, setCategories] = useState([]);
//   const [addresses, setAddresses] = useState([]);

//   // Header
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Poster Dashboard",
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

//   // Load data
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadAll();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const loadAll = async () => {
//     await Promise.all([
//       loadProfile(),
//       loadJobs(0),
//       loadCategories(),
//       loadAddresses(),
//     ]);
//   };

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchPosterProfile();
//       if (res?.status === "SUCCESS" && res.data) {
//         setProfile(res.data);
//         await AsyncStorage.setItem("posterProfile", JSON.stringify(res.data));
//       } else {
//         setProfile(null);
//         Alert.alert("Info", "No profile found. Please complete your profile.");
//         navigation.reset({ index: 0, routes: [{ name: "PosterProfileEdit" }] });
//       }
//     } catch (err) {
//       console.warn("[Profile Error]", err.message || err);
//       setProfile(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadJobs = async (pageNumber = 0) => {
//     if (pageNumber === 0) setRefreshing(true);
//     else setLoadingMore(true);

//     try {
//       const res = await getPosterJobs(pageNumber, 20);
//       if (res?.content) {
//         if (pageNumber === 0) setJobs(res.content);
//         else setJobs((prev) => [...prev, ...res.content]);
//         setPage(res.page);
//         setTotalPages(res.totalPages || 1);
//       } else {
//         if (pageNumber === 0) setJobs([]);
//       }
//     } catch (err) {
//       console.warn("[Jobs Error]", err.message || err);
//       if (pageNumber === 0) setJobs([]);
//     } finally {
//       setRefreshing(false);
//       setLoadingMore(false);
//     }
//   };

//   const loadCategories = async () => {
//     try {
//       const res = await fetchCategories();
//       if (res?.status === "SUCCESS" && Array.isArray(res.data))
//         setCategories(res.data);
//       else setCategories([]);
//     } catch (err) {
//       console.warn("[Categories Error]", err.message || err);
//       setCategories([]);
//     }
//   };

//   const loadAddresses = async () => {
//     try {
//       const res = await fetchPosterAddresses();
//       if (res?.status === "SUCCESS" && Array.isArray(res.data))
//         setAddresses(res.data);
//       else setAddresses([]);
//     } catch (err) {
//       console.warn("[Addresses Error]", err.message || err);
//       setAddresses([]);
//     }
//   };

//   // Logout
//   const handleLogout = async () => {
//     try {
//       await logoutPoster();
//       navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//     } catch (err) {
//       console.warn("[Logout Error]", err.message || err);
//       Alert.alert("Error", "Logout failed. Please try again.");
//     }
//   };

//   // Delete job
//   const handleDeleteJob = (jobId) => {
//     Alert.alert("Confirm Delete", "Are you sure you want to delete this job?", [
//       { text: "Cancel" },
//       {
//         text: "Delete",
//         onPress: async () => {
//           try {
//             await deletePosterJob(jobId);
//             Alert.alert("Deleted", "Job deleted successfully");
//             loadJobs(0);
//           } catch (err) {
//             console.warn("[Delete Error]", err.message || err);
//             Alert.alert("Error", "Failed to delete job");
//           }
//         },
//       },
//     ]);
//   };

//   // Open Update Modal
//   const handleOpenUpdate = (job) => {
//     setSelectedJob(job);
//     setTitle(job.title || "");
//     setDescription(job.description || "");
//     setAmountPaise(String(job.amountPaise || ""));
//     setDeadline(new Date(job.deadline || new Date()));

//     const matchedCategory = categories.find(
//       (c) =>
//         c.name.toLowerCase() ===
//         (job.category?.name || job.category || "").toLowerCase()
//     );
//     const matchedAddress = addresses.find(
//       (a) =>
//         a.label.toLowerCase() ===
//         (job.address?.label || job.addressLabel || "").toLowerCase()
//     );

//     setCategoryCode(String(matchedCategory?.code || ""));
//     setAddressId(String(matchedAddress?.id || ""));
//     setUpdateModalVisible(true);
//   };

//   // Update Job
//   const handleUpdateJob = async () => {
//     if (!title || !description || !categoryCode || !addressId) {
//       return Alert.alert("Validation", "All fields are required");
//     }

//     try {
//       const payload = {
//         title,
//         description,
//         categoryCode: Number(categoryCode),
//         amountPaise: Number(amountPaise),
//         deadline: deadline.toISOString(),
//         addressId: Number(addressId),
//       };

//       const res = await updatePosterJob(selectedJob.id, payload);

//       if (res.status === "SUCCESS") {
//         Alert.alert("✅ Updated", "Job updated successfully");
//         setUpdateModalVisible(false);
//         loadJobs(0);
//       } else {
//         Alert.alert("Error", res.message || "Failed to update job");
//       }
//     } catch (err) {
//       console.warn("[Update Error]", err.message || err);
//       Alert.alert("Error", "Something went wrong");
//     }
//   };

//   // Render job card
//   const renderJobItem = ({ item }) => (
//     <View style={styles.jobCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       <Text style={styles.jobMeta}>
//         📦 {item.category?.name || item.category || "No Category"} | 📍{" "}
//         {item.address?.label || item.addressLabel || "No Address"}
//       </Text>
//       <Text style={styles.jobMeta}>
//         🗓 {new Date(item.createdAt).toLocaleDateString()}
//       </Text>
//       <Text style={styles.jobStatus}>
//         Status: <Text style={{ fontWeight: "700" }}>{item.status}</Text>
//       </Text>

//       <View style={{ flexDirection: "row", marginTop: 10 }}>
//         <TouchableOpacity
//           style={[styles.btn, { backgroundColor: "#007bff", marginRight: 10 }]}
//           onPress={() => handleOpenUpdate(item)}
//         >
//           <Text style={styles.btnText}>Update</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.btn, { backgroundColor: "#e74c3c" }]}
//           onPress={() => handleDeleteJob(item.id)}
//         >
//           <Text style={styles.btnText}>Delete</Text>
//         </TouchableOpacity>
//       </View>
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
//       {/* Sidebar Modal */}
//       <Modal
//         visible={sidebarVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setSidebarVisible(false)}
//       >
//         <View style={styles.overlay}>
//           <View style={styles.sidebar}>
//             <TouchableOpacity
//               onPress={() => setSidebarVisible(false)}
//               style={{ marginBottom: 12 }}
//             >
//               <Ionicons name="close" size={26} color="#000" />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 setSidebarVisible(false);
//                 navigation.navigate("PosterProfileView");
//               }}
//             >
//               <Text style={styles.menuText}>👤 View Profile</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 setSidebarVisible(false);
//                 navigation.navigate("PosterProfileEdit", { isEdit: true });
//               }}
//             >
//               <Text style={styles.menuText}>✏️ Edit Profile</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 setSidebarVisible(false);
//                 navigation.navigate("PosterKycUpload");
//               }}
//             >
//               <Text style={styles.menuText}>🪪 Upload KYC</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Update Modal */}
//       <Modal
//         visible={updateModalVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setUpdateModalVisible(false)}
//       >
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           style={styles.modalOverlay}
//         >
//           <ScrollView contentContainerStyle={styles.modalContent}>
//             <Text style={styles.modalHeader}>Update Job</Text>

//             <TextInput
//               style={styles.input}
//               placeholder="Title"
//               value={title}
//               onChangeText={setTitle}
//             />
//             <TextInput
//               style={[styles.input, { height: 70 }]}
//               placeholder="Description"
//               multiline
//               value={description}
//               onChangeText={setDescription}
//             />

//             <Text>Category:</Text>
//             <Picker
//               selectedValue={categoryCode}
//               onValueChange={(v) => setCategoryCode(String(v))}
//             >
//               <Picker.Item label="Select Category" value="" />
//               {categories.length > 0 ? (
//                 categories.map((cat) => (
//                   <Picker.Item
//                     key={cat.code}
//                     label={cat.name}
//                     value={String(cat.code)}
//                   />
//                 ))
//               ) : (
//                 <Picker.Item label="No categories available" value="" />
//               )}
//             </Picker>

//             <Text>Address:</Text>
//             <Picker
//               selectedValue={addressId}
//               onValueChange={(v) => setAddressId(String(v))}
//             >
//               <Picker.Item label="Select Address" value="" />
//               {addresses.length > 0 ? (
//                 addresses.map((addr) => (
//                   <Picker.Item
//                     key={addr.id}
//                     label={`${addr.label} (${addr.area || "-"})`}
//                     value={String(addr.id)}
//                   />
//                 ))
//               ) : (
//                 <Picker.Item label="No addresses available" value="" />
//               )}
//             </Picker>

//             <TextInput
//               style={styles.input}
//               placeholder="Amount (Paise)"
//               keyboardType="numeric"
//               value={amountPaise}
//               onChangeText={setAmountPaise}
//             />

//             <TextInput
//               style={styles.input}
//               placeholder="Deadline (YYYY-MM-DD)"
//               value={deadline.toISOString().split("T")[0]}
//               onChangeText={(t) => setDeadline(new Date(t))}
//             />

//             <View style={styles.modalBtns}>
//               <TouchableOpacity
//                 style={[styles.btn, { backgroundColor: "#007bff" }]}
//                 onPress={handleUpdateJob}
//               >
//                 <Text style={styles.btnText}>Update</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.btn, { backgroundColor: "#999" }]}
//                 onPress={() => setUpdateModalVisible(false)}
//               >
//                 <Text style={styles.btnText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </Modal>

//       {/* Jobs List */}
//       <FlatList
//         data={jobs}
//         keyExtractor={(item, i) => item.id?.toString() || i.toString()}
//         renderItem={renderJobItem}
//         onRefresh={() => loadJobs(0)}
//         refreshing={refreshing}
//         onEndReached={() => {
//           if (page + 1 < totalPages && !loadingMore) loadJobs(page + 1);
//         }}
//         onEndReachedThreshold={0.5}
//         ListFooterComponent={
//           loadingMore ? (
//             <ActivityIndicator size="small" color="#0b78ff" />
//           ) : null
//         }
//         contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
//         ListHeaderComponent={
//           <>
//             <Text style={styles.header}>
//               Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""} 👋
//             </Text>

//             <TouchableOpacity
//               style={styles.btn}
//               onPress={() => navigation.navigate("CreateJobScreen")}
//             >
//               <Text style={styles.btnText}>Create New Job</Text>
//             </TouchableOpacity>

//             <Text style={styles.sectionHeader}>📋 Your Job Posts</Text>
//           </>
//         }
//         ListEmptyComponent={
//           <Text style={{ textAlign: "center", color: "#555", marginTop: 20 }}>
//             No job posts found. Create one!
//           </Text>
//         }
//       />
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 12,
//     color: "#0b4da0",
//   },
//   btn: {
//     backgroundColor: "#0b78ff",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
//   jobMeta: { fontSize: 13, color: "#555", marginTop: 2 },
//   jobStatus: { fontSize: 13, color: "#0b4da0", marginTop: 4 },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "rgba(0,0,0,0.3)",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 20,
//     marginHorizontal: 20,
//   },
//   modalHeader: { fontWeight: "700", fontSize: 18, marginBottom: 10 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 8,
//   },
//   modalBtns: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },
//   logoutBtn: {
//     backgroundColor: "#e74c3c",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//     marginRight: 10,
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginTop: 10,
//     marginBottom: 10,
//     color: "#0b4da0",
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
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import {
  fetchPosterProfile,
  logoutPoster,
  getPosterJobs,
  deletePosterJob,
  updatePosterJob,
  fetchCategories,
  fetchPosterAddresses,
} from "../api/poster";

export default function PosterDashboard({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Sidebar state
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Update modal state
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Editable fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [amountPaise, setAmountPaise] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [addressId, setAddressId] = useState("");

  // Lists
  const [categories, setCategories] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // ---------- Header ----------
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Poster Dashboard",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => setSidebarVisible(true)}
          style={{ marginLeft: 12 }}
        >
          <Ionicons name="menu" size={26} color="#000" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // ---------- Load data on focus ----------
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadAll();
    });
    return unsubscribe;
  }, [navigation]);

  const loadAll = async () => {
    await Promise.all([
      loadProfile(),
      loadJobs(),
      loadCategories(),
      loadAddresses(),
    ]);
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await fetchPosterProfile();
      if (res?.status === "SUCCESS" && res.data) {
        setProfile(res.data);
        await AsyncStorage.setItem("posterProfile", JSON.stringify(res.data));
      } else {
        setProfile(null);
        Alert.alert("Info", "No profile found. Please complete your profile.");
        navigation.reset({ index: 0, routes: [{ name: "PosterProfileEdit" }] });
      }
    } catch (err) {
      console.warn("[Profile Error]", err.message || err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    setRefreshing(true);
    try {
      const res = await getPosterJobs(0, 20);
      console.log("Jobs fetched:", res); // debug
      if (res?.data) setJobs(res.data); // <-- use res.data
      else setJobs([]);
    } catch (err) {
      console.warn("[Jobs Error]", err.message || err);
      setJobs([]);
    } finally {
      setRefreshing(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetchCategories();
      if (res?.status === "SUCCESS" && Array.isArray(res.data))
        setCategories(res.data);
      else setCategories([]);
    } catch (err) {
      console.warn("[Categories Error]", err.message || err);
      setCategories([]);
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await fetchPosterAddresses();
      if (res?.status === "SUCCESS" && Array.isArray(res.data))
        setAddresses(res.data);
      else setAddresses([]);
    } catch (err) {
      console.warn("[Addresses Error]", err.message || err);
      setAddresses([]);
    }
  };

  // ---------- Logout ----------
  const handleLogout = async () => {
    try {
      await logoutPoster();
      navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
    } catch (err) {
      console.warn("[Logout Error]", err.message || err);
      Alert.alert("Error", "Logout failed. Please try again.");
    }
  };

  // ---------- Delete ----------
  const handleDeleteJob = (jobId) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this job?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deletePosterJob(jobId);
            Alert.alert("Deleted", "Job deleted successfully");
            loadJobs();
          } catch (err) {
            console.warn("[Delete Error]", err.message || err);
            Alert.alert("Error", "Failed to delete job");
          }
        },
      },
    ]);
  };

  // ---------- Open Update Modal ----------
  const handleOpenUpdate = (job) => {
    setSelectedJob(job);
    setTitle(job.title || "");
    setDescription(job.description || "");
    setAmountPaise(String(job.amountPaise || ""));
    setDeadline(new Date(job.deadline || job.deadLine || new Date()));

    const matchedCategory = categories.find(
      (c) => c.name.toLowerCase() === (job.category || "").toLowerCase()
    );

    const matchedAddress = addresses.find(
      (a) => a.label.toLowerCase() === (job.addressLabel || "").toLowerCase()
    );

    setCategoryCode(String(matchedCategory?.code || ""));
    setAddressId(String(matchedAddress?.id || ""));
    setUpdateModalVisible(true);
  };

  // ---------- Update Job ----------
  const handleUpdateJob = async () => {
    if (!title || !description || !categoryCode || !addressId) {
      return Alert.alert("Validation", "All fields are required");
    }

    try {
      const payload = {
        title,
        description,
        categoryCode: Number(categoryCode),
        amountPaise: Number(amountPaise),
        deadline: deadline.toISOString(),
        addressId: Number(addressId),
      };

      const res = await updatePosterJob(selectedJob.id, payload);

      if (res.status === "SUCCESS") {
        Alert.alert("✅ Updated", "Job updated successfully");
        setUpdateModalVisible(false);
        loadJobs();
      } else {
        Alert.alert("Error", res.message || "Failed to update job");
      }
    } catch (err) {
      console.warn("[Update Error]", err.message || err);
      Alert.alert("Error", "Something went wrong");
    }
  };

  // ---------- Render Job ----------
  const renderJobItem = ({ item }) => (
    <View style={styles.jobCard}>
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.jobMeta}>
        📦 {item.category || "No Category"} | 📍{" "}
        {item.addressLabel || "No Address"}
      </Text>
      <Text style={styles.jobMeta}>
        🗓 {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <Text style={styles.jobStatus}>
        Status: <Text style={{ fontWeight: "700" }}>{item.status}</Text>
      </Text>

      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#007bff", marginRight: 10 }]}
          onPress={() => handleOpenUpdate(item)}
        >
          <Text style={styles.btnText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#e74c3c" }]}
          onPress={() => handleDeleteJob(item.id)}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0b78ff" />
      </View>
    );

  return (
    <>
      {/* Sidebar Modal */}
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
              style={{ marginBottom: 12 }}
            >
              <Ionicons name="close" size={26} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setSidebarVisible(false);
                navigation.navigate("PosterProfileView");
              }}
            >
              <Text style={styles.menuText}>👤 View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setSidebarVisible(false);
                navigation.navigate("PosterProfileEdit", { isEdit: true });
              }}
            >
              <Text style={styles.menuText}>✏️ Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setSidebarVisible(false);
                navigation.navigate("PosterKycUpload");
              }}
            >
              <Text style={styles.menuText}>🪪 Upload KYC</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Update Modal */}
      <Modal
        visible={updateModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalHeader}>Update Job</Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { height: 70 }]}
              placeholder="Description"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Text>Category:</Text>
            <Picker
              selectedValue={categoryCode}
              onValueChange={(v) => setCategoryCode(String(v))}
            >
              <Picker.Item label="Select Category" value="" />
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <Picker.Item
                    key={cat.code}
                    label={cat.name}
                    value={String(cat.code)}
                  />
                ))
              ) : (
                <Picker.Item label="No categories available" value="" />
              )}
            </Picker>

            <Text>Address:</Text>
            <Picker
              selectedValue={addressId}
              onValueChange={(v) => setAddressId(String(v))}
            >
              <Picker.Item label="Select Address" value="" />
              {addresses.length > 0 ? (
                addresses.map((addr) => (
                  <Picker.Item
                    key={addr.id}
                    label={`${addr.label} (${addr.area || "-"})`}
                    value={String(addr.id)}
                  />
                ))
              ) : (
                <Picker.Item label="No addresses available" value="" />
              )}
            </Picker>

            <TextInput
              style={styles.input}
              placeholder="Amount (Paise)"
              keyboardType="numeric"
              value={amountPaise}
              onChangeText={setAmountPaise}
            />

            <TextInput
              style={styles.input}
              placeholder="Deadline (YYYY-MM-DD)"
              value={deadline.toISOString().split("T")[0]}
              onChangeText={(t) => setDeadline(new Date(t))}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#007bff" }]}
                onPress={handleUpdateJob}
              >
                <Text style={styles.btnText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#999" }]}
                onPress={() => setUpdateModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Jobs List */}
      <FlatList
        data={jobs}
        keyExtractor={(item, i) => item.id?.toString() || i.toString()}
        renderItem={renderJobItem}
        onRefresh={loadJobs}
        refreshing={refreshing}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>
              Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""} 👋
            </Text>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => navigation.navigate("CreateJobScreen")}
            >
              <Text style={styles.btnText}>Create New Job</Text>
            </TouchableOpacity>

            <Text style={styles.sectionHeader}>📋 Your Job Posts</Text>
          </>
        }
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#555", marginTop: 20 }}>
            No job posts found. Create one!
          </Text>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#0b4da0",
  },
  btn: {
    backgroundColor: "#0b78ff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  jobTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
  jobMeta: { fontSize: 13, color: "#555", marginTop: 2 },
  jobStatus: { fontSize: 13, color: "#0b4da0", marginTop: 4 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
  },
  modalHeader: { fontWeight: "700", fontSize: 18, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  modalBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  logoutBtn: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 10,
    color: "#0b4da0",
  },

  // Sidebar
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
  menuItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
  menuText: { fontSize: 16, color: "#333" },
});

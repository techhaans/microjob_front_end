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
//     await Promise.all([
//       loadProfile(),
//       loadJobs(),
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

//   const loadJobs = async () => {
//     setRefreshing(true);
//     try {
//       const res = await getPosterJobs(0, 20);
//       console.log("Jobs fetched:", res); // debug
//       if (res?.data) setJobs(res.data); // <-- use res.data
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
//       (c) => c.name.toLowerCase() === (job.category || "").toLowerCase()
//     );

//     const matchedAddress = addresses.find(
//       (a) => a.label.toLowerCase() === (job.addressLabel || "").toLowerCase()
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
//         📦 {item.category || "No Category"} | 📍{" "}
//         {item.addressLabel || "No Address"}
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

//   // Sidebar
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

// //corret
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
// import RNPickerSelect from "react-native-picker-select";
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

//   const [jobStatusFilter, setJobStatusFilter] = useState("POSTED"); // Added status filter

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
//     await Promise.all([
//       loadProfile(),
//       loadJobs(),
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

//   const loadJobs = async () => {
//     setRefreshing(true);
//     try {
//       const res = await getPosterJobs(0, 20, jobStatusFilter); // Pass filter
//       console.log("Jobs fetched:", res);
//       if (res?.data) setJobs(res.data);
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
//       (c) => c.name.toLowerCase() === (job.category || "").toLowerCase()
//     );

//     const matchedAddress = addresses.find(
//       (a) => a.label.toLowerCase() === (job.addressLabel || "").toLowerCase()
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
//         📦 {item.category || "No Category"} | 📍{" "}
//         {item.addressLabel || "No Address"}
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
//             <RNPickerSelect
//               onValueChange={(v) => setCategoryCode(String(v))}
//               value={categoryCode}
//               items={categories.map((c) => ({
//                 label: c.name,
//                 value: String(c.code),
//               }))}
//               placeholder={{ label: "Select Category", value: "" }}
//             />

//             <Text>Address:</Text>
//             <RNPickerSelect
//               onValueChange={(v) => setAddressId(String(v))}
//               value={addressId}
//               items={addresses.map((a) => ({
//                 label: `${a.label} (${a.area || "-"})`,
//                 value: String(a.id),
//               }))}
//               placeholder={{ label: "Select Address", value: "" }}
//             />

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

//       {/* Job Status Filter */}
//       {/* <View style={{ flexDirection: "row", marginHorizontal: 20, marginTop: 10 }}>
//         {["POSTED", "ACCEPTED"].map((status) => (
//           <TouchableOpacity
//             key={status}
//             style={{
//               flex: 1,
//               padding: 10,
//               backgroundColor: jobStatusFilter === status ? "#0b78ff" : "#ddd",
//               marginHorizontal: 5,
//               borderRadius: 8,
//               alignItems: "center",
//             }}
//             onPress={() => {
//               setJobStatusFilter(status);
//               loadJobs();
//             }}
//           >
//             <Text
//               style={{
//                 color: jobStatusFilter === status ? "#fff" : "#333",
//                 fontWeight: "700",
//               }}
//             >
//               {status}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View> */}
//       <View
//         style={{ flexDirection: "row", marginHorizontal: 20, marginTop: 10 }}
//       >
//         {["POSTED", "ACCEPTED"].map((status) => (
//           <TouchableOpacity
//             key={status}
//             style={{
//               flex: 1,
//               padding: 10,
//               backgroundColor: jobStatusFilter === status ? "#0b78ff" : "#ddd",
//               marginHorizontal: 5,
//               borderRadius: 8,
//               alignItems: "center",
//             }}
//             onPress={() => {
//               setJobStatusFilter(status); // update state for UI
//               loadJobs(status); // pass new status directly
//             }}
//           >
//             <Text
//               style={{
//                 color: jobStatusFilter === status ? "#fff" : "#333",
//                 fontWeight: "700",
//               }}
//             >
//               {status}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

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

// // ---------- Styles ----------
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
// import React, { useEffect, useState, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   FlatList,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import {
//   fetchPosterProfile,
//   logoutPoster,
//   getPosterJobs,
//   deletePosterJob,
// } from "../api/poster";

// export default function PosterDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [jobs, setJobs] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [jobStatusFilter, setJobStatusFilter] = useState("POSTED"); // Filter

//   // ---------- Header ----------
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Poster Dashboard",
//       headerLeft: () => (
//         <TouchableOpacity onPress={() => {}} style={{ marginLeft: 12 }}>
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
//       loadProfile();
//       loadJobsWithStatus(jobStatusFilter);
//     });
//     return unsubscribe;
//   }, [navigation, jobStatusFilter]);

//   // ---------- Load Profile ----------
//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchPosterProfile();
//       if (res?.status === "SUCCESS" && res.data) {
//         setProfile(res.data);
//       } else {
//         setProfile(null);
//         Alert.alert("Info", "No profile found. Please complete your profile.");
//       }
//     } catch (err) {
//       console.warn("[Profile Error]", err.message || err);
//       setProfile(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------- Load Jobs with specific status ----------
//   const loadJobsWithStatus = async (status) => {
//     setRefreshing(true);
//     try {
//       const res = await getPosterJobs(0, 20, status);
//       console.log("Jobs fetched:", res);
//       if (res?.data) setJobs(res.data);
//       else setJobs([]);
//     } catch (err) {
//       console.warn("[Jobs Error]", err.message || err);
//       setJobs([]);
//     } finally {
//       setRefreshing(false);
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
//             loadJobsWithStatus(jobStatusFilter);
//           } catch (err) {
//             console.warn("[Delete Error]", err.message || err);
//             Alert.alert("Error", "Failed to delete job");
//           }
//         },
//       },
//     ]);
//   };

//   // ---------- Render Job ----------
//   const renderJobItem = ({ item }) => (
//     <View style={styles.jobCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       <Text style={styles.jobMeta}>
//         📦 {item.category || "No Category"} | 📍{" "}
//         {item.addressLabel || "No Address"}
//       </Text>
//       <Text style={styles.jobMeta}>
//         🗓 {new Date(item.createdAt).toLocaleDateString()}
//       </Text>
//       <Text style={styles.jobStatus}>
//         Status: <Text style={{ fontWeight: "700" }}>{item.status}</Text>
//       </Text>

//       {/* Only allow update/delete for POSTED jobs */}
//       {item.status === "POSTED" && (
//         <View style={{ flexDirection: "row", marginTop: 10 }}>
//           <TouchableOpacity
//             style={[
//               styles.btn,
//               { backgroundColor: "#007bff", marginRight: 10 },
//             ]}
//           >
//             <Text style={styles.btnText}>Update</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.btn, { backgroundColor: "#e74c3c" }]}
//             onPress={() => handleDeleteJob(item.id)}
//           >
//             <Text style={styles.btnText}>Delete</Text>
//           </TouchableOpacity>
//         </View>
//       )}
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
//       {/* Filter Buttons */}
//       <View
//         style={{ flexDirection: "row", marginHorizontal: 20, marginTop: 10 }}
//       >
//         {["POSTED", "ACCEPTED"].map((status) => (
//           <TouchableOpacity
//             key={status}
//             style={{
//               flex: 1,
//               padding: 10,
//               backgroundColor: jobStatusFilter === status ? "#0b78ff" : "#ddd",
//               marginHorizontal: 5,
//               borderRadius: 8,
//               alignItems: "center",
//             }}
//             onPress={() => {
//               setJobStatusFilter(status);
//               loadJobsWithStatus(status);
//             }}
//           >
//             <Text
//               style={{
//                 color: jobStatusFilter === status ? "#fff" : "#333",
//                 fontWeight: "700",
//               }}
//             >
//               {status}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Jobs List */}
//       <FlatList
//         data={jobs}
//         keyExtractor={(item, i) => item.id?.toString() || i.toString()}
//         renderItem={renderJobItem}
//         onRefresh={() => loadJobsWithStatus(jobStatusFilter)}
//         refreshing={refreshing}
//         contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
//         ListHeaderComponent={
//           <Text style={styles.sectionHeader}>📋 Your Job Posts</Text>
//         }
//         ListEmptyComponent={null} // Don't show anything when empty
//       />
//     </>
//   );
// }

// // ---------- Styles ----------
// const styles = StyleSheet.create({
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
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
// });

//corret 2
// import React, { useState, useLayoutEffect, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   FlatList,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { Ionicons, MaterialIcons, Feather, FontAwesome5 } from "@expo/vector-icons";
// import {
//   fetchPosterProfile,
//   logoutPoster,
//   getPosterJobs,
//   deletePosterJob,
// } from "../api/poster";

// export default function PosterDashboard({ navigation }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sidebarAnim] = useState(new Animated.Value(0));
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [jobs, setJobs] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Poster Dashboard",
//       headerLeft: () => (
//         <TouchableOpacity onPress={toggleSidebar} style={{ marginLeft: 12 }}>
//           <Ionicons name="menu" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//       headerRight: () => (
//         <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
//           <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation, sidebarOpen]);

//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadProfile();
//       loadJobs();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//     Animated.timing(sidebarAnim, {
//       toValue: sidebarOpen ? 0 : 1,
//       duration: 250,
//       useNativeDriver: false,
//     }).start();
//   };

//   const closeSidebar = () => {
//     setSidebarOpen(false);
//     Animated.timing(sidebarAnim, {
//       toValue: 0,
//       duration: 200,
//       useNativeDriver: false,
//     }).start();
//   };

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchPosterProfile();
//       if (res?.status === "SUCCESS") setProfile(res.data);
//     } catch (e) {
//       console.warn(e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadJobs = async () => {
//     setRefreshing(true);
//     try {
//       const res = await getPosterJobs(0, 20);
//       if (res?.data) setJobs(res.data);
//     } catch (e) {
//       console.warn(e);
//       setJobs([]);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logoutPoster();
//       navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//     } catch (err) {
//       Alert.alert("Error", "Logout failed");
//     }
//   };

//   const handleDeleteJob = async (jobId) => {
//     Alert.alert("Confirm", "Delete this job?", [
//       { text: "Cancel" },
//       {
//         text: "Delete",
//         onPress: async () => {
//           await deletePosterJob(jobId);
//           loadJobs();
//         },
//       },
//     ]);
//   };

//   const sidebarWidth = sidebarAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [60, 150],
//   });

//   return (
//     <View style={{ flex: 1, flexDirection: "row", backgroundColor: "#f5f5f5" }}>
//       {/* Sidebar */}
//       <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
//         {/* Create Job */}
//         <TouchableOpacity
//           style={styles.sidebarIcon}
//           onPress={() => {
//             navigation.navigate("CreateJobScreen");
//             closeSidebar();
//           }}
//         >
//           <Feather name="plus-circle" size={22} color="#fff" />
//           {sidebarOpen && <Text style={styles.sidebarText}>Create Job</Text>}
//         </TouchableOpacity>

//         {/* Profile View */}
//         <TouchableOpacity
//           style={styles.sidebarIcon}
//           onPress={() => {
//             navigation.navigate("PosterProfileView");
//             closeSidebar();
//           }}
//         >
//           <Ionicons name="person-circle-outline" size={22} color="#fff" />
//           {sidebarOpen && <Text style={styles.sidebarText}>Profile</Text>}
//         </TouchableOpacity>

//         {/* Profile Edit */}
//         <TouchableOpacity
//           style={styles.sidebarIcon}
//           onPress={() => {
//             navigation.navigate("PosterProfileEdit");
//             closeSidebar();
//           }}
//         >
//           <FontAwesome5 name="user-edit" size={20} color="#fff" />
//           {sidebarOpen && <Text style={styles.sidebarText}>Edit Profile</Text>}
//         </TouchableOpacity>

//         {/* KYC */}
//         <TouchableOpacity
//           style={styles.sidebarIcon}
//           onPress={() => {
//             navigation.navigate("PosterKycUpload");
//             closeSidebar();
//           }}
//         >
//           <MaterialIcons name="verified-user" size={22} color="#fff" />
//           {sidebarOpen && <Text style={styles.sidebarText}>KYC</Text>}
//         </TouchableOpacity>
//       </Animated.View>

//       {/* Main content */}
//       <View style={{ flex: 1, padding: 10 }}>
//         {loading ? (
//           <View style={styles.loader}>
//             <ActivityIndicator size="large" color="#0b78ff" />
//           </View>
//         ) : (
//           <FlatList
//             data={jobs}
//             keyExtractor={(item, i) => item.id?.toString() || i.toString()}
//             renderItem={({ item }) => (
//               <View style={styles.jobCard}>
//                 <Text style={styles.jobTitle}>{item.title}</Text>
//                 <Text style={styles.jobMeta}>
//                   {item.category} | {item.addressLabel}
//                 </Text>
//                 <Text style={styles.jobStatus}>Status: {item.status}</Text>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#e74c3c" }]}
//                   onPress={() => handleDeleteJob(item.id)}
//                 >
//                   <Text style={styles.btnText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//             refreshing={refreshing}
//             onRefresh={loadJobs}
//             contentContainerStyle={{ paddingBottom: 20 }}
//             ListHeaderComponent={
//               <Text style={styles.header}>
//                 Welcome, {profile?.name ? profile.name : ""}
//               </Text>
//             }
//           />
//         )}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   sidebar: {
//     backgroundColor: "#1e1e1e",
//     paddingTop: 40,
//     alignItems: "center",
//     elevation: 5,
//   },
//   sidebarIcon: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 18,
//     paddingHorizontal: 10,
//   },
//   sidebarText: {
//     color: "#fff",
//     fontSize: 14,
//     marginLeft: 10,
//     fontWeight: "600",
//   },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#eee",
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
//   jobMeta: { fontSize: 13, color: "#666", marginTop: 2 },
//   jobStatus: { fontSize: 13, color: "#0b4da0", marginTop: 4 },
//   btn: {
//     padding: 10,
//     borderRadius: 8,
//     marginTop: 10,
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "600" },
//   logoutBtn: {
//     backgroundColor: "#e74c3c",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//     marginRight: 10,
//   },
//   header: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#0b4da0",
//     marginBottom: 10,
//   },
// });

// import React, { useState, useLayoutEffect, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   FlatList,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import {
//   Ionicons,
//   MaterialIcons,
//   Feather,
//   FontAwesome5,
// } from "@expo/vector-icons";
// import {
//   fetchPosterProfile,
//   logoutPoster,
//   getPosterJobs,
//   deletePosterJob,
// } from "../api/poster";

// export default function PosterDashboard({ navigation }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sidebarAnim] = useState(new Animated.Value(0));
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [jobs, setJobs] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [filter, setFilter] = useState("ALL"); // ALL / POSTED / ACCEPTED

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Poster Dashboard",
//       headerLeft: () => (
//         <TouchableOpacity onPress={toggleSidebar} style={{ marginLeft: 12 }}>
//           <Ionicons name="menu" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//       headerRight: () => (
//         <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
//           <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation, sidebarOpen]);

//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadProfile();
//       loadJobs();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//     Animated.timing(sidebarAnim, {
//       toValue: sidebarOpen ? 0 : 1,
//       duration: 250,
//       useNativeDriver: false,
//     }).start();
//   };

//   const closeSidebar = () => {
//     setSidebarOpen(false);
//     Animated.timing(sidebarAnim, {
//       toValue: 0,
//       duration: 200,
//       useNativeDriver: false,
//     }).start();
//   };

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchPosterProfile();
//       if (res?.status === "SUCCESS") setProfile(res.data);
//     } catch (e) {
//       console.warn(e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadJobs = async () => {
//     setRefreshing(true);
//     try {
//       const res = await getPosterJobs(0, 20);
//       if (res?.data) setJobs(res.data);
//     } catch (e) {
//       console.warn(e);
//       setJobs([]);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logoutPoster();
//       navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//     } catch (err) {
//       Alert.alert("Error", "Logout failed");
//     }
//   };

//   const handleDeleteJob = async (jobId) => {
//     Alert.alert("Confirm", "Delete this job?", [
//       { text: "Cancel" },
//       {
//         text: "Delete",
//         onPress: async () => {
//           await deletePosterJob(jobId);
//           loadJobs();
//         },
//       },
//     ]);
//   };

//   const sidebarWidth = sidebarAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [60, 160],
//   });

//   // ✅ Filter logic
//   const filteredJobs =
//     filter === "ALL" ? jobs : jobs.filter((j) => j.status === filter);

//   return (
//     <View style={{ flex: 1, flexDirection: "row", backgroundColor: "#f5f5f5" }}>
//       {/* Sidebar */}
//       <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
//         {/* Create Job */}
//         <TouchableOpacity
//           style={styles.sidebarIcon}
//           onPress={() => {
//             navigation.navigate("CreateJobScreen");
//             closeSidebar();
//           }}
//         >
//           <Feather name="plus-circle" size={22} color="#fff" />
//           {sidebarOpen && <Text style={styles.sidebarText}>Create Job</Text>}
//         </TouchableOpacity>

//         {/* Profile View */}
//         <TouchableOpacity
//           style={styles.sidebarIcon}
//           onPress={() => {
//             navigation.navigate("PosterProfileView");
//             closeSidebar();
//           }}
//         >
//           <Ionicons name="person-circle-outline" size={22} color="#fff" />
//           {sidebarOpen && <Text style={styles.sidebarText}>Profile</Text>}
//         </TouchableOpacity>

//         {/* Profile Edit */}
//         <TouchableOpacity
//           style={styles.sidebarIcon}
//           onPress={() => {
//             navigation.navigate("PosterProfileEdit");
//             closeSidebar();
//           }}
//         >
//           <FontAwesome5 name="user-edit" size={20} color="#fff" />
//           {sidebarOpen && <Text style={styles.sidebarText}>Edit Profile</Text>}
//         </TouchableOpacity>

//         {/* KYC */}
//         <TouchableOpacity
//           style={styles.sidebarIcon}
//           onPress={() => {
//             navigation.navigate("PosterKycUpload");
//             closeSidebar();
//           }}
//         >
//           <MaterialIcons name="verified-user" size={22} color="#fff" />
//           {sidebarOpen && <Text style={styles.sidebarText}>KYC</Text>}
//         </TouchableOpacity>
//       </Animated.View>

//       {/* Main Content */}
//       <View style={{ flex: 1, padding: 10 }}>
//         {loading ? (
//           <View style={styles.loader}>
//             <ActivityIndicator size="large" color="#0b78ff" />
//           </View>
//         ) : (
//           <>
//             {/* Filter Toggle */}
//             <View style={styles.filterRow}>
//               {["ALL", "POSTED", "ACCEPTED"].map((f) => (
//                 <TouchableOpacity
//                   key={f}
//                   onPress={() => setFilter(f)}
//                   style={[
//                     styles.filterBtn,
//                     filter === f && styles.filterBtnActive,
//                   ]}
//                 >
//                   <Text
//                     style={[
//                       styles.filterText,
//                       filter === f && styles.filterTextActive,
//                     ]}
//                   >
//                     {f}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             {/* Job List */}
//             <FlatList
//               data={filteredJobs}
//               keyExtractor={(item, i) => item.id?.toString() || i.toString()}
//               renderItem={({ item }) => (
//                 <View
//                   style={[
//                     styles.jobCard,
//                     item.status === "ACCEPTED" && { borderColor: "#27ae60" },
//                   ]}
//                 >
//                   <Text style={styles.jobTitle}>{item.title}</Text>
//                   <Text style={styles.jobMeta}>
//                     {item.category} | {item.addressLabel}
//                   </Text>
//                   <Text
//                     style={[
//                       styles.jobStatus,
//                       item.status === "ACCEPTED"
//                         ? { color: "#27ae60" }
//                         : { color: "#0b4da0" },
//                     ]}
//                   >
//                     Status: {item.status}
//                   </Text>

//                   <TouchableOpacity
//                     style={[styles.btn, { backgroundColor: "#e74c3c" }]}
//                     onPress={() => handleDeleteJob(item.id)}
//                   >
//                     <Text style={styles.btnText}>Delete</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//               refreshing={refreshing}
//               onRefresh={loadJobs}
//               contentContainerStyle={{ paddingBottom: 20 }}
//               ListHeaderComponent={
//                 <Text style={styles.header}>
//                   Welcome, {profile?.name ? profile.name : ""}
//                 </Text>
//               }
//             />
//           </>
//         )}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   sidebar: {
//     backgroundColor: "#1e1e1e",
//     paddingTop: 40,
//     alignItems: "center",
//     elevation: 5,
//   },
//   sidebarIcon: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 18,
//     paddingHorizontal: 10,
//   },
//   sidebarText: {
//     color: "#fff",
//     fontSize: 14,
//     marginLeft: 10,
//     fontWeight: "600",
//   },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
//   jobMeta: { fontSize: 13, color: "#666", marginTop: 2 },
//   jobStatus: { fontSize: 13, marginTop: 4, fontWeight: "600" },
//   btn: {
//     padding: 10,
//     borderRadius: 8,
//     marginTop: 10,
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "600" },
//   logoutBtn: {
//     backgroundColor: "#e74c3c",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//     marginRight: 10,
//   },
//   header: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#0b4da0",
//     marginBottom: 10,
//   },
//   filterRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginBottom: 10,
//   },
//   filterBtn: {
//     backgroundColor: "#ddd",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//     marginHorizontal: 4,
//   },
//   filterBtnActive: { backgroundColor: "#0b4da0" },
//   filterText: { color: "#333", fontWeight: "600" },
//   filterTextActive: { color: "#fff" },
// });

// //main funcunaluty
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
// import RNPickerSelect from "react-native-picker-select";
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
//   const [jobStatusFilter, setJobStatusFilter] = useState("POSTED");
//   const [sidebarVisible, setSidebarVisible] = useState(false);

//   // Modal States for Update
//   const [updateModalVisible, setUpdateModalVisible] = useState(false);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryCode, setCategoryCode] = useState("");
//   const [amountPaise, setAmountPaise] = useState("");
//   const [deadline, setDeadline] = useState(new Date());
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

//   // ---------- Load Data ----------
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadAll();
//     });
//     return unsubscribe;
//   }, [navigation, jobStatusFilter]);

//   const loadAll = async () => {
//     await Promise.all([
//       loadProfile(),
//       loadJobs(jobStatusFilter),
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
//         Alert.alert("Info", "No profile found. Please complete your profile.");
//         navigation.navigate("PosterProfileEdit");
//       }
//     } catch (err) {
//       console.warn("[Profile Error]", err.message || err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadJobs = async (status) => {
//     setRefreshing(true);
//     try {
//       const res = await getPosterJobs(0, 20, status);
//       if (res?.data) setJobs(res.data);
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
//       if (res?.status === "SUCCESS" && Array.isArray(res.data))
//         setCategories(res.data);
//     } catch (err) {
//       console.warn("[Categories Error]", err.message || err);
//     }
//   };

//   const loadAddresses = async () => {
//     try {
//       const res = await fetchPosterAddresses();
//       if (res?.status === "SUCCESS" && Array.isArray(res.data))
//         setAddresses(res.data);
//     } catch (err) {
//       console.warn("[Addresses Error]", err.message || err);
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
//             loadJobs(jobStatusFilter);
//           } catch (err) {
//             Alert.alert("Error", "Failed to delete job");
//           }
//         },
//       },
//     ]);
//   };

//   // ---------- Update ----------
//   const handleOpenUpdate = (job) => {
//     setSelectedJob(job);
//     setTitle(job.title || "");
//     setDescription(job.description || "");
//     setAmountPaise(String(job.amountPaise || ""));
//     setDeadline(new Date(job.deadline || job.deadLine || new Date()));

//     const matchedCategory = categories.find(
//       (c) => c.name?.toLowerCase() === job.category?.toLowerCase()
//     );
//     const matchedAddress = addresses.find(
//       (a) => a.label?.toLowerCase() === job.addressLabel?.toLowerCase()
//     );

//     setCategoryCode(String(matchedCategory?.code || ""));
//     setAddressId(String(matchedAddress?.id || ""));
//     setUpdateModalVisible(true);
//   };

//   const handleUpdateJob = async () => {
//     if (!title || !description || !categoryCode || !addressId)
//       return Alert.alert("Validation", "All fields are required");

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
//         loadJobs(jobStatusFilter);
//       } else {
//         Alert.alert("Error", res.message || "Update failed");
//       }
//     } catch (err) {
//       Alert.alert("Error", "Something went wrong");
//     }
//   };

//   // ---------- Render Job ----------
//   const renderJobItem = ({ item }) => (
//     <View style={styles.jobCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       <Text style={styles.jobMeta}>
//         📦 {item.category} | 📍 {item.addressLabel}
//       </Text>
//       <Text style={styles.jobMeta}>
//         🗓 {new Date(item.createdAt).toLocaleDateString()}
//       </Text>
//       <Text style={styles.jobStatus}>
//         Status: <Text style={{ fontWeight: "700" }}>{item.status}</Text>
//       </Text>

//       {item.status === "POSTED" && (
//         <View style={{ flexDirection: "row", marginTop: 10 }}>
//           <TouchableOpacity
//             style={[styles.btn, { backgroundColor: "#007bff", marginRight: 10 }]}
//             onPress={() => handleOpenUpdate(item)}
//           >
//             <Text style={styles.btnText}>Update</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.btn, { backgroundColor: "#e74c3c" }]}
//             onPress={() => handleDeleteJob(item.id)}
//           >
//             <Text style={styles.btnText}>Delete</Text>
//           </TouchableOpacity>
//         </View>
//       )}
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
//       {/* Sidebar Drawer */}
//       <Modal
//         visible={sidebarVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setSidebarVisible(false)}
//       >
//         <View style={styles.overlay}>
//           <TouchableOpacity
//             style={{ flex: 1 }}
//             onPress={() => setSidebarVisible(false)}
//           />
//           <View style={styles.sidebar}>
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
//                 navigation.navigate("PosterProfileEdit");
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

//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 setSidebarVisible(false);
//                 navigation.navigate("CreateJobScreen");
//               }}
//             >
//               <Text style={styles.menuText}>➕ Create Job</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Filter */}
//       <View style={styles.filterRow}>
//         {["POSTED", "ACCEPTED"].map((status) => (
//           <TouchableOpacity
//             key={status}
//             style={[
//               styles.filterBtn,
//               jobStatusFilter === status && styles.filterBtnActive,
//             ]}
//             onPress={() => {
//               setJobStatusFilter(status);
//               loadJobs(status);
//             }}
//           >
//             <Text
//               style={{
//                 color: jobStatusFilter === status ? "#fff" : "#333",
//                 fontWeight: "700",
//               }}
//             >
//               {status}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Jobs List */}
//       <FlatList
//         data={jobs}
//         keyExtractor={(item, i) => item.id?.toString() || i.toString()}
//         renderItem={renderJobItem}
//         refreshing={refreshing}
//         onRefresh={() => loadJobs(jobStatusFilter)}
//         contentContainerStyle={{ padding: 20 }}
//         ListHeaderComponent={
//           <>
//             <Text style={styles.header}>
//               Welcome{profile?.name ? `, ${profile.name}` : ""} 👋
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
//             No job posts found.
//           </Text>
//         }
//       />
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: { fontSize: 22, fontWeight: "700", color: "#0b4da0", marginBottom: 10 },
//   btn: {
//     backgroundColor: "#0b78ff",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginVertical: 8,
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
//   filterRow: {
//     flexDirection: "row",
//     marginHorizontal: 20,
//     marginTop: 10,
//   },
//   filterBtn: {
//     flex: 1,
//     padding: 10,
//     backgroundColor: "#ddd",
//     marginHorizontal: 5,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   filterBtnActive: {
//     backgroundColor: "#0b78ff",
//   },
//   overlay: {
//     flex: 1,
//     flexDirection: "row",
//     backgroundColor: "rgba(0,0,0,0.4)",
//   },
//   sidebar: {
//     width: "65%",
//     backgroundColor: "#fff",
//     padding: 20,
//     justifyContent: "flex-start",
//   },
//   menuItem: {
//     paddingVertical: 14,
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//   },
//   menuText: { fontSize: 16, color: "#333", fontWeight: "600" },
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
//     color: "#0b4da0",
//     marginTop: 10,
//   },
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
  Animated,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import {
  fetchPosterProfile,
  logoutPoster,
  getPosterJobs,
  deletePosterJob,
  updatePosterJob,
  fetchCategories,
  fetchPosterAddresses,
} from "../api/poster";

const { width } = Dimensions.get("window");

export default function PosterDashboard({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [jobStatusFilter, setJobStatusFilter] = useState("POSTED");

  // Sidebar animation
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(width))[0]; // start offscreen (right side)

  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [amountPaise, setAmountPaise] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [addressId, setAddressId] = useState("");
  const [categories, setCategories] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // ---------- Header ----------
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Poster Dashboard",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => toggleSidebar()}
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

  // ---------- Sidebar Animation ----------
  const toggleSidebar = () => {
    if (sidebarVisible) {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSidebarVisible(false));
    } else {
      setSidebarVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // ---------- Load data ----------
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadAll();
    });
    return unsubscribe;
  }, [navigation, jobStatusFilter]);

  const loadAll = async () => {
    await Promise.all([
      loadProfile(),
      loadJobs(jobStatusFilter),
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
        Alert.alert("Info", "No profile found. Please complete your profile.");
        navigation.navigate("PosterProfileEdit");
      }
    } catch (err) {
      console.warn("[Profile Error]", err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async (status = "POSTED") => {
    setRefreshing(true);
    try {
      const res = await getPosterJobs(0, 20, status);
      if (res?.data) setJobs(res.data);
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
    } catch (err) {
      console.warn("[Categories Error]", err.message || err);
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await fetchPosterAddresses();
      if (res?.status === "SUCCESS" && Array.isArray(res.data))
        setAddresses(res.data);
    } catch (err) {
      console.warn("[Addresses Error]", err.message || err);
    }
  };

  // ---------- Logout ----------
  const handleLogout = async () => {
    try {
      await logoutPoster();
      navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
    } catch (err) {
      Alert.alert("Error", "Logout failed.");
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
            loadJobs(jobStatusFilter);
          } catch {
            Alert.alert("Error", "Failed to delete job");
          }
        },
      },
    ]);
  };

  // ---------- Update ----------
  const handleOpenUpdate = (job) => {
    setSelectedJob(job);
    setTitle(job.title || "");
    setDescription(job.description || "");
    setAmountPaise(String(job.amountPaise || ""));
    setDeadline(new Date(job.deadline || job.deadLine || new Date()));

    const matchedCategory = categories.find(
      (c) => c.name?.toLowerCase() === job.category?.toLowerCase()
    );
    const matchedAddress = addresses.find(
      (a) => a.label?.toLowerCase() === job.addressLabel?.toLowerCase()
    );

    setCategoryCode(String(matchedCategory?.code || ""));
    setAddressId(String(matchedAddress?.id || ""));
    setUpdateModalVisible(true);
  };

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
        loadJobs(jobStatusFilter);
      } else {
        Alert.alert("Error", res.message || "Failed to update job");
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  // ---------- Job Card ----------
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

      {item.status === "POSTED" && (
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <TouchableOpacity
            style={[
              styles.btn,
              { backgroundColor: "#007bff", marginRight: 10 },
            ]}
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
      )}
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
      {/* Sidebar (slides from right) */}
      {sidebarVisible && (
        <Modal transparent visible={sidebarVisible} animationType="none">
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={toggleSidebar}
          >
            <Animated.View
              style={[
                styles.sidebar,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              <TouchableOpacity
                onPress={toggleSidebar}
                style={{ marginBottom: 12 }}
              >
                <Ionicons name="close" size={26} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  toggleSidebar();
                  navigation.navigate("PosterProfileView");
                }}
              >
                <Text style={styles.menuText}>👤 View Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  toggleSidebar();
                  navigation.navigate("PosterProfileEdit");
                }}
              >
                <Text style={styles.menuText}>✏️ Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  toggleSidebar();
                  navigation.navigate("PosterKycUpload");
                }}
              >
                <Text style={styles.menuText}>🪪 Upload KYC</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}

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
            <RNPickerSelect
              onValueChange={(v) => setCategoryCode(String(v))}
              value={categoryCode}
              items={categories.map((c) => ({
                label: c.name,
                value: String(c.code),
              }))}
            />
            <Text>Address:</Text>
            <RNPickerSelect
              onValueChange={(v) => setAddressId(String(v))}
              value={addressId}
              items={addresses.map((a) => ({
                label: `${a.label}`,
                value: String(a.id),
              }))}
            />
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

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        {["POSTED", "ACCEPTED"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterBtn,
              {
                backgroundColor:
                  jobStatusFilter === status ? "#0b78ff" : "#ddd",
              },
            ]}
            onPress={() => {
              setJobStatusFilter(status);
              loadJobs(status);
            }}
          >
            <Text
              style={{
                color: jobStatusFilter === status ? "#fff" : "#333",
                fontWeight: "700",
              }}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Job List */}
      <FlatList
        data={jobs}
        keyExtractor={(item, i) => item.id?.toString() || i.toString()}
        renderItem={renderJobItem}
        refreshing={refreshing}
        onRefresh={() => loadJobs(jobStatusFilter)}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>
              Welcome {profile?.name ? profile.name.split(" ")[0] : ""} 👋
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
      />
    </>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0b4da0",
    marginBottom: 12,
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  sidebar: {
    width: "70%",
    backgroundColor: "#fff",
    height: "100%",
    padding: 20,
    paddingTop: 40,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    position: "absolute",
    right: 0,
  },
  menuItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
  menuText: { fontSize: 16, color: "#333" },
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
  filterContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 10,
  },
  filterBtn: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 10,
    color: "#0b4da0",
  },
});

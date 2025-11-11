//19.24
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
//   Animated,
//   Dimensions,
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

// const { width } = Dimensions.get("window");

// export default function PosterDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [jobs, setJobs] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [jobStatusFilter, setJobStatusFilter] = useState("POSTED");

//   // Sidebar animation
//   const [sidebarVisible, setSidebarVisible] = useState(false);
//   const slideAnim = useState(new Animated.Value(width))[0]; // start offscreen (right side)

//   const [updateModalVisible, setUpdateModalVisible] = useState(false);
//   const [selectedJob, setSelectedJob] = useState(null);

//   // Form fields
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
//           onPress={() => toggleSidebar()}
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

//   // ---------- Sidebar Animation ----------
//   const toggleSidebar = () => {
//     if (sidebarVisible) {
//       Animated.timing(slideAnim, {
//         toValue: width,
//         duration: 300,
//         useNativeDriver: true,
//       }).start(() => setSidebarVisible(false));
//     } else {
//       setSidebarVisible(true);
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     }
//   };

//   // ---------- Load data ----------
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

//   const loadJobs = async (status = "POSTED") => {
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
//       Alert.alert("Error", "Logout failed.");
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
//             loadJobs(jobStatusFilter);
//           } catch {
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
//         loadJobs(jobStatusFilter);
//       } else {
//         Alert.alert("Error", res.message || "Failed to update job");
//       }
//     } catch (err) {
//       Alert.alert("Error", "Something went wrong");
//     }
//   };

//   // ---------- Job Card ----------
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

//       {item.status === "POSTED" && (
//         <View style={{ flexDirection: "row", marginTop: 10 }}>
//           <TouchableOpacity
//             style={[
//               styles.btn,
//               { backgroundColor: "#007bff", marginRight: 10 },
//             ]}
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
//       {/* Sidebar (slides from right) */}
//       {sidebarVisible && (
//         <Modal transparent visible={sidebarVisible} animationType="none">
//           <TouchableOpacity
//             style={styles.overlay}
//             activeOpacity={1}
//             onPress={toggleSidebar}
//           >
//             <Animated.View
//               style={[
//                 styles.sidebar,
//                 { transform: [{ translateX: slideAnim }] },
//               ]}
//             >
//               <TouchableOpacity
//                 onPress={toggleSidebar}
//                 style={{ marginBottom: 12 }}
//               >
//                 <Ionicons name="close" size={26} color="#000" />
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => {
//                   toggleSidebar();
//                   navigation.navigate("PosterProfileView");
//                 }}
//               >
//                 <Text style={styles.menuText}>👤 View Profile</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => {
//                   toggleSidebar();
//                   navigation.navigate("PosterProfileEdit");
//                 }}
//               >
//                 <Text style={styles.menuText}>✏️ Edit Profile</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => {
//                   toggleSidebar();
//                   navigation.navigate("PosterKycUpload");
//                 }}
//               >
//                 <Text style={styles.menuText}>🪪 Upload KYC</Text>
//               </TouchableOpacity>
//             </Animated.View>
//           </TouchableOpacity>
//         </Modal>
//       )}

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
//             />
//             <Text>Address:</Text>
//             <RNPickerSelect
//               onValueChange={(v) => setAddressId(String(v))}
//               value={addressId}
//               items={addresses.map((a) => ({
//                 label: `${a.label}`,
//                 value: String(a.id),
//               }))}
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

//       {/* Status Filter */}
//       <View style={styles.filterContainer}>
//         {["POSTED", "ACCEPTED"].map((status) => (
//           <TouchableOpacity
//             key={status}
//             style={[
//               styles.filterBtn,
//               {
//                 backgroundColor:
//                   jobStatusFilter === status ? "#0b78ff" : "#ddd",
//               },
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

//       {/* Job List */}
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
//               Welcome {profile?.name ? profile.name.split(" ")[0] : ""} 👋
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
//     color: "#0b4da0",
//     marginBottom: 12,
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
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.3)",
//     justifyContent: "flex-start",
//     alignItems: "flex-end",
//   },
//   sidebar: {
//     width: "70%",
//     backgroundColor: "#fff",
//     height: "100%",
//     padding: 20,
//     paddingTop: 40,
//     borderTopLeftRadius: 20,
//     borderBottomLeftRadius: 20,
//     position: "absolute",
//     right: 0,
//   },
//   menuItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
//   menuText: { fontSize: 16, color: "#333" },
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
//   filterContainer: {
//     flexDirection: "row",
//     marginHorizontal: 20,
//     marginTop: 10,
//   },
//   filterBtn: {
//     flex: 1,
//     padding: 10,
//     marginHorizontal: 5,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginTop: 10,
//     marginBottom: 10,
//     color: "#0b4da0",
//   },
// });
// // corret code above
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
//   Animated,
//   Dimensions,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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

// const { width } = Dimensions.get("window");

// export default function PosterDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [jobs, setJobs] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [jobStatusFilter, setJobStatusFilter] = useState("POSTED");

//   // Sidebar animation
//   const [sidebarVisible, setSidebarVisible] = useState(false);
//   const slideAnim = useState(new Animated.Value(-width))[0]; // start hidden left

//   const [updateModalVisible, setUpdateModalVisible] = useState(false);
//   const [selectedJob, setSelectedJob] = useState(null);

//   // Form fields
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
//   }, [navigation]);

//   // ---------- Sidebar Animation ----------
//   const toggleSidebar = () => {
//     if (sidebarVisible) {
//       Animated.timing(slideAnim, {
//         toValue: -width,
//         duration: 300,
//         useNativeDriver: true,
//       }).start(() => setSidebarVisible(false));
//     } else {
//       setSidebarVisible(true);
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     }
//   };

//   // ---------- Load data ----------
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

//   const loadJobs = async (status = "POSTED") => {
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
//       Alert.alert("Error", "Logout failed.");
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
//             loadJobs(jobStatusFilter);
//           } catch {
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
//     setDeadline(new Date(job.deadline || new Date()));

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
//         loadJobs(jobStatusFilter);
//       } else {
//         Alert.alert("Error", res.message || "Failed to update job");
//       }
//     } catch (err) {
//       Alert.alert("Error", "Something went wrong");
//     }
//   };

//   // ---------- Job Card ----------
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

//       {item.status === "POSTED" && (
//         <View style={{ flexDirection: "row", marginTop: 10 }}>
//           <TouchableOpacity
//             style={[
//               styles.btn,
//               { backgroundColor: "#007bff", marginRight: 10 },
//             ]}
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
//     <View style={{ flex: 1 }}>
//       {/* Sidebar Overlay */}
//       {sidebarVisible && (
//         <TouchableOpacity
//           activeOpacity={1}
//           style={styles.overlay}
//           onPress={toggleSidebar}
//         />
//       )}

//       {/* Sidebar */}
//       <Animated.View
//         style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
//       >
//         <Text style={styles.menuHeader}>Menu</Text>
//         <TouchableOpacity onPress={toggleSidebar} style={styles.closeBtn}>
//           <Ionicons name="close" size={24} color="#000" />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             toggleSidebar();
//           }}
//         >
//           <Ionicons name="home-outline" size={22} color="#333" />
//           <Text style={styles.menuText}>Dashboard</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             toggleSidebar();
//             navigation.navigate("PosterProfileView");
//           }}
//         >
//           <Ionicons name="person-circle-outline" size={22} color="#333" />
//           <Text style={styles.menuText}>View Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             toggleSidebar();
//             navigation.navigate("PosterProfileEdit");
//           }}
//         >
//           <MaterialIcons name="edit" size={22} color="#333" />
//           <Text style={styles.menuText}>Edit Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             toggleSidebar();
//             navigation.navigate("PosterKycUpload");
//           }}
//         >
//           <Ionicons name="document-text-outline" size={22} color="#333" />
//           <Text style={styles.menuText}>Upload KYC</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.logoutMenu} onPress={handleLogout}>
//           <Ionicons name="log-out-outline" size={22} color="#e74c3c" />
//           <Text style={[styles.menuText, { color: "#e74c3c" }]}>Logout</Text>
//         </TouchableOpacity>
//       </Animated.View>

//       {/* Filters and Job List */}
//       <View style={styles.filterContainer}>
//         {["POSTED", "ACCEPTED"].map((status) => (
//           <TouchableOpacity
//             key={status}
//             style={[
//               styles.filterBtn,
//               {
//                 backgroundColor:
//                   jobStatusFilter === status ? "#0b78ff" : "#ddd",
//               },
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
//               Welcome {profile?.name ? profile.name.split(" ")[0] : ""} 👋
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
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#0b4da0",
//     marginBottom: 12,
//   },
//   btn: {
//     backgroundColor: "#0b78ff",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   filterBtn: {
//     flex: 1,
//     alignItems: "center",
//     paddingVertical: 10,
//     borderRadius: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
//   // ---- Job Card ----
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 14,
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//     borderWidth: 1,
//     borderColor: "#eee",
//   },
//   jobHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 6,
//   },
//   jobTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#222",
//     flex: 1,
//   },
//   statusBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: "700",
//     textTransform: "uppercase",
//   },
//   jobDetails: { marginTop: 4 },
//   jobRow: { flexDirection: "row", alignItems: "center", marginVertical: 3 },
//   jobInfo: { fontSize: 13, color: "#444", marginLeft: 6 },
//   actionRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 12,
//   },
//   actionBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 10,
//     borderRadius: 10,
//     marginHorizontal: 5,
//   },
//   actionText: { color: "#fff", fontWeight: "700", fontSize: 14, marginLeft: 5 },

//   overlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     zIndex: 9,
//   },
//   sidebar: {
//     position: "absolute",
//     top: 0,
//     bottom: 0,
//     left: 0,
//     width: "70%",
//     backgroundColor: "#fff",
//     padding: 20,
//     borderTopRightRadius: 20,
//     borderBottomRightRadius: 20,
//     elevation: 8,
//     zIndex: 10,
//   },
//   menuHeader: { fontSize: 18, fontWeight: "700", marginBottom: 20 },
//   closeBtn: { position: "absolute", right: 15, top: 15 },
//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 18,
//     gap: 10,
//   },
//   menuText: { fontSize: 16, color: "#333" },
//   logoutMenu: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: "auto",
//     gap: 10,
//   },
//   logoutBtn: {
//     backgroundColor: "#e74c3c",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//     marginRight: 10,
//   },
//   filterContainer: {
//     flexDirection: "row",
//     marginHorizontal: 20,
//     marginTop: 10,
//   },
//   filterBtn: {
//     flex: 1,
//     alignItems: "center",
//     paddingVertical: 10,
//     borderRadius: 10,
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginTop: 10,
//     marginBottom: 10,
//     color: "#0b4da0",
//   },
// });
// // PosterDashboard.js
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   FlatList,
//   TextInput,
//   KeyboardAvoidingView,
//   ScrollView,
//   Animated,
//   Dimensions,
//   SafeAreaView,
//   StatusBar,
//   Easing,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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

// const { width, height } = Dimensions.get("window");

// export default function PosterDashboard({ navigation }) {
//   // data states
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [jobs, setJobs] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [jobStatusFilter, setJobStatusFilter] = useState("POSTED");

//   // sidebar animation
//   const slideAnim = useRef(new Animated.Value(-width * 0.72)).current; // hidden left
//   const overlayAnim = useRef(new Animated.Value(0)).current;
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // update modal & form (kept for compatibility)
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

//   // ---------- loaders ----------
//   useEffect(() => {
//     const unsub = navigation.addListener("focus", () => {
//       loadAll();
//     });
//     // initial load too
//     loadAll();
//     return unsub;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [navigation, jobStatusFilter]);

//   const loadAll = async () => {
//     setLoading(true);
//     await Promise.all([
//       loadProfile(),
//       loadJobs(jobStatusFilter),
//       loadCategories(),
//       loadAddresses(),
//     ]);
//     setLoading(false);
//   };

//   const loadProfile = async () => {
//     try {
//       const res = await fetchPosterProfile();
//       if (res?.status === "SUCCESS" && res.data) {
//         setProfile(res.data);
//         await AsyncStorage.setItem("posterProfile", JSON.stringify(res.data));
//       } else {
//         setProfile(null);
//       }
//     } catch (err) {
//       console.warn("[Profile Error]", err?.message || err);
//       setProfile(null);
//     }
//   };

//   const loadJobs = async (status = "POSTED") => {
//     setRefreshing(true);
//     try {
//       const res = await getPosterJobs(0, 20, status);
//       if (res?.data) setJobs(res.data);
//       else setJobs([]);
//     } catch (err) {
//       console.warn("[Jobs Error]", err?.message || err);
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
//       console.warn("[Categories Error]", err?.message || err);
//     }
//   };

//   const loadAddresses = async () => {
//     try {
//       const res = await fetchPosterAddresses();
//       if (res?.status === "SUCCESS" && Array.isArray(res.data))
//         setAddresses(res.data);
//     } catch (err) {
//       console.warn("[Addresses Error]", err?.message || err);
//     }
//   };

//   // ---------- sidebar controls ----------
//   const openSidebar = () => {
//     setSidebarOpen(true);
//     Animated.parallel([
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 260,
//         easing: Easing.out(Easing.cubic),
//         useNativeDriver: true,
//       }),
//       Animated.timing(overlayAnim, {
//         toValue: 0.45,
//         duration: 260,
//         easing: Easing.out(Easing.cubic),
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const closeSidebar = () => {
//     Animated.parallel([
//       Animated.timing(slideAnim, {
//         toValue: -width * 0.72,
//         duration: 200,
//         easing: Easing.in(Easing.cubic),
//         useNativeDriver: true,
//       }),
//       Animated.timing(overlayAnim, {
//         toValue: 0,
//         duration: 200,
//         easing: Easing.in(Easing.cubic),
//         useNativeDriver: true,
//       }),
//     ]).start(() => setSidebarOpen(false));
//   };

//   const toggleSidebar = () => {
//     if (sidebarOpen) closeSidebar();
//     else openSidebar();
//   };

//   // ---------- logout ----------
//   const handleLogout = async () => {
//     try {
//       await logoutPoster();
//       navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//     } catch (err) {
//       Alert.alert("Error", "Logout failed.");
//     }
//   };

//   // ---------- delete ----------
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

//   // ---------- update (open modal prefill) ----------
//   const handleOpenUpdate = (job) => {
//     setSelectedJob(job);
//     setTitle(job.title || "");
//     setDescription(job.description || "");
//     setAmountPaise(String(job.amountPaise || ""));
//     setDeadline(new Date(job.deadline || new Date()));

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
//         loadJobs(jobStatusFilter);
//       } else {
//         Alert.alert("Error", res.message || "Failed to update job");
//       }
//     } catch (err) {
//       Alert.alert("Error", "Something went wrong");
//     }
//   };

//   // ---------- Job card (clean) ----------
//   const renderJobItem = ({ item }) => {
//     return (
//       <View style={styles.jobCard}>
//         <View style={styles.jobHeader}>
//           <Text style={styles.jobTitle}>{item.title}</Text>
//           <View
//             style={[
//               styles.statusBadge,
//               {
//                 backgroundColor:
//                   item.status === "POSTED" ? "#007bff20" : "#28a74520",
//               },
//             ]}
//           >
//             <Text
//               style={[
//                 styles.statusText,
//                 { color: item.status === "POSTED" ? "#007bff" : "#28a745" },
//               ]}
//             >
//               {item.status}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.jobDetails}>
//           <View style={styles.jobRow}>
//             <Ionicons name="briefcase-outline" size={16} color="#555" />
//             <Text style={styles.jobInfo}>{item.category || "No Category"}</Text>
//           </View>

//           <View style={styles.jobRow}>
//             <Ionicons name="location-outline" size={16} color="#555" />
//             <Text style={styles.jobInfo}>
//               {item.addressLabel || "No Address"}
//             </Text>
//           </View>

//           <View style={styles.jobRow}>
//             <Ionicons name="calendar-outline" size={16} color="#555" />
//             <Text style={styles.jobInfo}>
//               {new Date(item.createdAt).toLocaleDateString()}
//             </Text>
//           </View>
//         </View>

//         {item.status === "POSTED" && (
//           <View style={styles.actionRow}>
//             <TouchableOpacity
//               style={[styles.actionBtn, { backgroundColor: "#007bff" }]}
//               onPress={() => handleOpenUpdate(item)}
//             >
//               <Ionicons name="create-outline" size={16} color="#fff" />
//               <Text style={styles.actionText}>Update</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.actionBtn, { backgroundColor: "#e74c3c" }]}
//               onPress={() => handleDeleteJob(item.id)}
//             >
//               <Ionicons name="trash-outline" size={16} color="#fff" />
//               <Text style={styles.actionText}>Delete</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#0b78ff" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView
//       style={[styles.container, { paddingTop: StatusBar.currentHeight || 0 }]}
//     >
//       <StatusBar
//         translucent
//         backgroundColor="#111827"
//         barStyle="light-content"
//       />

//       {/* Top bar (custom) */}
//       <View style={styles.topBar}>
//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <TouchableOpacity onPress={toggleSidebar} style={styles.iconBtn}>
//             <Ionicons name="menu" size={22} color="#fff" />
//           </TouchableOpacity>
//           <Text style={styles.topTitle}>Poster Dashboard</Text>
//         </View>
//         <TouchableOpacity onPress={handleLogout}>
//           <Ionicons name="log-out-outline" size={22} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* Content area */}
//       <FlatList
//         data={jobs}
//         keyExtractor={(item, i) => item.id?.toString() || String(i)}
//         renderItem={renderJobItem}
//         refreshing={refreshing}
//         onRefresh={() => loadJobs(jobStatusFilter)}
//         contentContainerStyle={styles.contentContainer}
//         ListHeaderComponent={
//           <>
//             <Text style={styles.header}>
//               Welcome {profile?.name ? profile.name.split(" ")[0] : ""} 👋
//             </Text>

//             <TouchableOpacity
//               style={styles.createBtn}
//               onPress={() => navigation.navigate("CreateJobScreen")}
//             >
//               <Text style={styles.createBtnText}>Create New Job</Text>
//             </TouchableOpacity>

//             <View style={styles.filterContainer}>
//               {["POSTED", "ACCEPTED"].map((status) => (
//                 <TouchableOpacity
//                   key={status}
//                   style={[
//                     styles.filterBtn,
//                     {
//                       backgroundColor:
//                         jobStatusFilter === status ? "#0b78ff" : "#ddd",
//                     },
//                   ]}
//                   onPress={() => {
//                     setJobStatusFilter(status);
//                     loadJobs(status);
//                   }}
//                 >
//                   <Text
//                     style={{
//                       color: jobStatusFilter === status ? "#fff" : "#333",
//                       fontWeight: "700",
//                     }}
//                   >
//                     {status}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <Text style={styles.sectionHeader}>📋 Your Job Posts</Text>
//           </>
//         }
//       />

//       {/* Overlay (absolute) */}
//       {sidebarOpen && (
//         <Animated.View
//           style={[styles.overlay, { opacity: overlayAnim }]}
//           pointerEvents={sidebarOpen ? "auto" : "none"}
//         >
//           <TouchableOpacity
//             style={{ flex: 1 }}
//             activeOpacity={1}
//             onPress={closeSidebar}
//           />
//         </Animated.View>
//       )}

//       {/* Sidebar (animated) */}
//       <Animated.View
//         style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
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
//             navigation.navigate("PosterDashboard");
//           }}
//         >
//           <Ionicons name="home-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Dashboard</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("PosterProfileView");
//           }}
//         >
//           <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>View Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("PosterProfileEdit");
//           }}
//         >
//           <MaterialIcons name="edit" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Edit Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("PosterKycUpload");
//           }}
//         >
//           <Ionicons name="document-text-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Upload KYC</Text>
//         </TouchableOpacity>

//         <View style={{ flex: 1 }} />

//         <TouchableOpacity style={styles.logoutMenu} onPress={handleLogout}>
//           <Ionicons name="log-out-outline" size={20} color="#ef4444" />
//           <Text style={[styles.menuText, { color: "#ef4444" }]}>Logout</Text>
//         </TouchableOpacity>
//       </Animated.View>
//     </SafeAreaView>
//   );
// }

// // ---------- styles ----------
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8fafc" },
//   contentContainer: { padding: 16, paddingBottom: 100 },

//   // Top bar
//   topBar: {
//     height: 56,
//     backgroundColor: "#111827",
//     paddingHorizontal: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   iconBtn: { padding: 6, marginRight: 8 },
//   topTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },

//   // Header + create button
//   header: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 12,
//     color: "#0f172a",
//   },
//   createBtn: {
//     backgroundColor: "#0b78ff",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   createBtnText: { color: "#fff", fontWeight: "800" },

//   // Filters
//   filterContainer: { flexDirection: "row", marginBottom: 12 },
//   filterBtn: {
//     flex: 1,
//     padding: 10,
//     marginHorizontal: 5,
//     borderRadius: 8,
//     alignItems: "center",
//   },

//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginTop: 6,
//     marginBottom: 12,
//     color: "#0b4da0",
//   },

//   // Job card
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     elevation: 3,
//     borderWidth: 1,
//     borderColor: "#eee",
//   },
//   jobHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#111", flex: 1 },
//   statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
//   statusText: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },

//   jobDetails: { marginTop: 2 },
//   jobRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
//   jobInfo: { fontSize: 13, color: "#444", marginLeft: 8 },

//   actionRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 12,
//   },
//   actionBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 10,
//     borderRadius: 10,
//     marginHorizontal: 6,
//   },
//   actionText: { color: "#fff", fontWeight: "700", fontSize: 14, marginLeft: 6 },

//   // overlay & sidebar
//   overlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "#000",
//     zIndex: 9,
//   },
//   sidebar: {
//     position: "absolute",
//     top: 0,
//     bottom: 0,
//     left: 0,
//     width: width * 0.72,
//     backgroundColor: "#fff",
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 20 : 34,
//     paddingHorizontal: 18,
//     paddingBottom: 22,
//     borderTopRightRadius: 18,
//     borderBottomRightRadius: 18,
//     elevation: 12,
//     zIndex: 10,
//   },
//   sidebarHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   sidebarTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },

//   menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
//   menuText: { marginLeft: 12, fontSize: 16, color: "#111", fontWeight: "700" },

//   logoutMenu: { flexDirection: "row", alignItems: "center", marginTop: 16 },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
// });
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   FlatList,
//   TextInput,
//   ScrollView,
//   Animated,
//   Dimensions,
//   SafeAreaView,
//   StatusBar,
//   Modal,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import RNPickerSelect from "react-native-picker-select";
// import DateTimePicker from "@react-native-community/datetimepicker";

// import {
//   fetchPosterProfile,
//   logoutPoster,
//   getPosterJobs,
//   deletePosterJob,
//   updatePosterJob,
//   fetchCategories,
//   fetchPosterAddresses,
//   addJobPriceItem,
// } from "../api/poster";

// const { width, height } = Dimensions.get("window");

// export default function PosterDashboard({ navigation }) {
//   // ---------- State ----------
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [jobs, setJobs] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [jobStatusFilter, setJobStatusFilter] = useState("POSTED");
//   const [categories, setCategories] = useState([]);
//   const [addresses, setAddresses] = useState([]);

//   // Sidebar animation
//   const slideAnim = useRef(new Animated.Value(-width * 0.72)).current;
//   const overlayAnim = useRef(new Animated.Value(0)).current;
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // ---------- Update Modal ----------
//   const [updateModalVisible, setUpdateModalVisible] = useState(false);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryCode, setCategoryCode] = useState("");
//   const [amountPaise, setAmountPaise] = useState("");
//   const [deadline, setDeadline] = useState(new Date());
//   const [addressId, setAddressId] = useState("");
//   const [jobType, setJobType] = useState("PHYSICAL");

//   const [priceItems, setPriceItems] = useState([]);
//   const [label, setLabel] = useState("");
//   const [price, setPrice] = useState("");

//   const [showPicker, setShowPicker] = useState(false);

//   // ---------- Load Data ----------
//   useEffect(() => {
//     const unsub = navigation.addListener("focus", () => {
//       loadAll();
//     });
//     loadAll();
//     return unsub;
//   }, [navigation, jobStatusFilter]);

//   const loadAll = async () => {
//     setLoading(true);
//     await Promise.all([
//       loadProfile(),
//       loadJobs(jobStatusFilter),
//       loadCategories(),
//       loadAddresses(),
//     ]);
//     setLoading(false);
//   };

//   const loadProfile = async () => {
//     try {
//       const res = await fetchPosterProfile();
//       if (res?.status === "SUCCESS" && res.data) {
//         setProfile(res.data);
//         await AsyncStorage.setItem("posterProfile", JSON.stringify(res.data));
//       } else setProfile(null);
//     } catch (err) {
//       console.warn("[Profile Error]", err?.message || err);
//       setProfile(null);
//     }
//   };

//   const loadJobs = async (status = "POSTED") => {
//     setRefreshing(true);
//     try {
//       const res = await getPosterJobs(0, 20, status);
//       if (res?.data) setJobs(res.data);
//       else setJobs([]);
//     } catch (err) {
//       console.warn("[Jobs Error]", err?.message || err);
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
//       console.warn("[Categories Error]", err?.message || err);
//     }
//   };

//   const loadAddresses = async () => {
//     try {
//       const res = await fetchPosterAddresses();
//       if (res?.status === "SUCCESS" && Array.isArray(res.data))
//         setAddresses(res.data);
//     } catch (err) {
//       console.warn("[Addresses Error]", err?.message || err);
//     }
//   };

//   // ---------- Sidebar ----------
//   const openSidebar = () => {
//     setSidebarOpen(true);
//     Animated.parallel([
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 260,
//         useNativeDriver: true,
//       }),
//       Animated.timing(overlayAnim, {
//         toValue: 0.45,
//         duration: 260,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };
//   const closeSidebar = () => {
//     Animated.parallel([
//       Animated.timing(slideAnim, {
//         toValue: -width * 0.72,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//       Animated.timing(overlayAnim, {
//         toValue: 0,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//     ]).start(() => setSidebarOpen(false));
//   };
//   const toggleSidebar = () => (sidebarOpen ? closeSidebar() : openSidebar());

//   // ---------- Logout ----------
//   const handleLogout = async () => {
//     try {
//       await logoutPoster();
//       navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//     } catch (err) {
//       Alert.alert("Error", "Logout failed.");
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
//             loadJobs(jobStatusFilter);
//           } catch (err) {
//             Alert.alert("Error", "Failed to delete job");
//           }
//         },
//       },
//     ]);
//   };

//   // ---------- Update Modal Prefill ----------
//   const handleOpenUpdate = (job) => {
//     setSelectedJob(job);
//     setTitle(job.title || "");
//     setDescription(job.description || "");
//     setAmountPaise(String(job.amountPaise || 0));
//     setDeadline(new Date(job.deadline || new Date()));
//     setJobType(job.jobType || "PHYSICAL");

//     const matchedCategory = categories.find(
//       (c) => String(c.code) === String(job.categoryCode)
//     );
//     setCategoryCode(String(matchedCategory?.code || ""));

//     const matchedAddress = addresses.find(
//       (a) => String(a.id) === String(job.addressId)
//     );
//     setAddressId(String(matchedAddress?.id || ""));

//     setPriceItems(job.priceItems || []);
//     setUpdateModalVisible(true);
//   };

//   // ---------- Date Picker ----------
//   const onChangeDate = (event, selectedDate) => {
//     if (Platform.OS === "android") setShowPicker(false);
//     if (selectedDate) setDeadline(selectedDate);
//   };

//   // ---------- Job Card ----------
//   const renderJobItem = ({ item }) => (
//     <View style={styles.jobCard}>
//       <View style={styles.jobHeader}>
//         <Text style={styles.jobTitle}>{item.title}</Text>
//         <View
//           style={[
//             styles.statusBadge,
//             {
//               backgroundColor:
//                 item.status === "POSTED" ? "#007bff20" : "#28a74520",
//             },
//           ]}
//         >
//           <Text
//             style={[
//               styles.statusText,
//               { color: item.status === "POSTED" ? "#007bff" : "#28a745" },
//             ]}
//           >
//             {item.status}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.jobDetails}>
//         <View style={styles.jobRow}>
//           <Ionicons name="briefcase-outline" size={16} color="#555" />
//           <Text style={styles.jobInfo}>{item.category || "No Category"}</Text>
//         </View>

//         <View style={styles.jobRow}>
//           <Ionicons name="location-outline" size={16} color="#555" />
//           <Text style={styles.jobInfo}>
//             {item.addressLabel || "No Address"}
//           </Text>
//         </View>

//         <View style={styles.jobRow}>
//           <Ionicons name="calendar-outline" size={16} color="#555" />
//           <Text style={styles.jobInfo}>
//             {new Date(item.createdAt).toLocaleDateString()}
//           </Text>
//         </View>
//       </View>

//       {item.status === "POSTED" && (
//         <View style={styles.actionRow}>
//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: "#007bff" }]}
//             onPress={() => handleOpenUpdate(item)}
//           >
//             <Ionicons name="create-outline" size={16} color="#fff" />
//             <Text style={styles.actionText}>Update</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: "#e74c3c" }]}
//             onPress={() => handleDeleteJob(item.id)}
//           >
//             <Ionicons name="trash-outline" size={16} color="#fff" />
//             <Text style={styles.actionText}>Delete</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );

//   // ---------- Update Modal Save ----------
//   const handleSaveUpdate = async () => {
//     if (
//       !title ||
//       !description ||
//       !categoryCode ||
//       (jobType === "PHYSICAL" && !addressId)
//     ) {
//       return Alert.alert("Validation", "All required fields must be filled.");
//     }

//     try {
//       const payload = {
//         title,
//         description,
//         categoryCode: Number(categoryCode),
//         amountPaise: Number(amountPaise),
//         deadline: deadline.toISOString(),
//         addressId: jobType === "PHYSICAL" ? Number(addressId) : null,
//         jobType,
//       };
//       const res = await updatePosterJob(selectedJob.id, payload);

//       if (res.status === "SUCCESS") {
//         // Update price items
//         for (const item of priceItems) {
//           await addJobPriceItem(selectedJob.id, {
//             label: item.label,
//             description: item.description || "",
//             priceRupees: item.priceRupees,
//           });
//         }

//         Alert.alert("✅ Updated", "Job and price items updated successfully");
//         setUpdateModalVisible(false);
//         loadJobs(jobStatusFilter);
//       } else {
//         Alert.alert("Error", res.message || "Failed to update job");
//       }
//     } catch (err) {
//       Alert.alert("Error", "Something went wrong");
//     }
//   };

//   if (loading)
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#0b78ff" />
//       </SafeAreaView>
//     );

//   return (
//     <SafeAreaView
//       style={[styles.container, { paddingTop: StatusBar.currentHeight || 0 }]}
//     >
//       <StatusBar
//         translucent
//         backgroundColor="#111827"
//         barStyle="light-content"
//       />

//       {/* Top bar */}
//       <View style={styles.topBar}>
//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <TouchableOpacity onPress={toggleSidebar} style={styles.iconBtn}>
//             <Ionicons name="menu" size={22} color="#fff" />
//           </TouchableOpacity>
//           <Text style={styles.topTitle}>Poster Dashboard</Text>
//         </View>

//         <TouchableOpacity onPress={handleLogout}>
//           <Ionicons name="log-out-outline" size={22} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* FlatList */}
//       <FlatList
//         data={jobs}
//         keyExtractor={(item, i) => item.id?.toString() || String(i)}
//         renderItem={renderJobItem}
//         refreshing={refreshing}
//         onRefresh={() => loadJobs(jobStatusFilter)}
//         contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
//         ListHeaderComponent={
//           <>
//             <Text style={styles.header}>
//               Welcome {profile?.name?.split(" ")[0] || ""} 👋
//             </Text>

//             <View style={styles.filterContainer}>
//               {["POSTED", "ACCEPTED"].map((status) => (
//                 <TouchableOpacity
//                   key={status}
//                   style={[
//                     styles.filterBtn,
//                     {
//                       backgroundColor:
//                         jobStatusFilter === status ? "#0b78ff" : "#ddd",
//                     },
//                   ]}
//                   onPress={() => {
//                     setJobStatusFilter(status);
//                     loadJobs(status);
//                   }}
//                 >
//                   <Text
//                     style={{
//                       color: jobStatusFilter === status ? "#fff" : "#333",
//                       fontWeight: "700",
//                     }}
//                   >
//                     {status}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <Text style={styles.sectionHeader}>📋 Your Job Posts</Text>
//             <TouchableOpacity
//               onPress={() => navigation.navigate("CreateJobScreen")} // ✅ matches Stack.Screen name
//               style={{
//                 marginRight: 14,
//                 paddingHorizontal: 10,
//                 paddingVertical: 6,
//                 backgroundColor: "#0b78ff",
//                 borderRadius: 8,
//               }}
//             >
//               <Text style={{ color: "#fff", fontWeight: "700" }}>
//                 + Create Job
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={handleLogout}>
//               <Ionicons name="log-out-outline" size={22} color="#fff" />
//             </TouchableOpacity>
//           </>
//         }
//       />

//       {/* Sidebar Overlay */}
//       {sidebarOpen && (
//         <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
//           <TouchableOpacity
//             style={{ flex: 1 }}
//             activeOpacity={1}
//             onPress={closeSidebar}
//           />
//         </Animated.View>
//       )}

//       {/* Sidebar */}
//       <Animated.View
//         style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
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
//             navigation.navigate("PosterDashboard");
//           }}
//         >
//           <Ionicons name="home-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Dashboard</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("PosterProfileView");
//           }}
//         >
//           <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>View Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("PosterProfileEdit");
//           }}
//         >
//           <MaterialIcons name="edit" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Edit Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("PosterKycUpload");
//           }}
//         >
//           <Ionicons name="document-text-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Upload KYC</Text>
//         </TouchableOpacity>

//         <View style={{ flex: 1 }} />

//         <TouchableOpacity style={styles.logoutMenu} onPress={handleLogout}>
//           <Ionicons name="log-out-outline" size={20} color="#ef4444" />
//           <Text style={[styles.menuText, { color: "#ef4444" }]}>Logout</Text>
//         </TouchableOpacity>
//       </Animated.View>

//       {/* Update Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={updateModalVisible}
//         onRequestClose={() => setUpdateModalVisible(false)}
//       >
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "rgba(0,0,0,0.4)",
//             justifyContent: "center",
//             padding: 20,
//           }}
//         >
//           <ScrollView
//             style={{ backgroundColor: "#fff", borderRadius: 12, padding: 20 }}
//           >
//             <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
//               Update Job
//             </Text>

//             <TextInput
//               style={styles.input}
//               placeholder="Title"
//               value={title}
//               onChangeText={setTitle}
//             />
//             <TextInput
//               style={[styles.input, { height: 80 }]}
//               placeholder="Description"
//               multiline
//               value={description}
//               onChangeText={setDescription}
//             />

//             {/* Category */}
//             <RNPickerSelect
//               onValueChange={(val) => setCategoryCode(val)}
//               value={categoryCode}
//               placeholder={{ label: "Select Category", value: "" }}
//               items={categories.map((c) => ({
//                 label: c.name,
//                 value: String(c.code),
//               }))}
//               style={{ inputAndroid: styles.input, inputIOS: styles.input }}
//             />

//             {/* Address */}
//             <RNPickerSelect
//               onValueChange={(val) => setAddressId(val)}
//               value={addressId}
//               placeholder={{ label: "Select Address", value: "" }}
//               items={addresses.map((a) => ({
//                 label: `${a.label} — ${a.area} (${a.pinCode})`,
//                 value: String(a.id),
//               }))}
//               style={{ inputAndroid: styles.input, inputIOS: styles.input }}
//             />

//             {/* Job Type */}
//             <RNPickerSelect
//               onValueChange={(val) => setJobType(val)}
//               value={jobType}
//               placeholder={{ label: "Select Job Type", value: "PHYSICAL" }}
//               items={[
//                 { label: "PHYSICAL", value: "PHYSICAL" },
//                 { label: "ONLINE", value: "ONLINE" },
//               ]}
//               style={{ inputAndroid: styles.input, inputIOS: styles.input }}
//             />

//             {/* Deadline */}
//             <TouchableOpacity onPress={() => setShowPicker(true)}>
//               <View pointerEvents="none">
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Deadline"
//                   value={deadline?.toISOString()?.split("T")[0]}
//                   editable={false}
//                 />
//               </View>
//             </TouchableOpacity>
//             {showPicker && (
//               <DateTimePicker
//                 value={deadline}
//                 mode="date"
//                 display="default"
//                 onChange={onChangeDate}
//               />
//             )}

//             {/* Amount */}
//             <TextInput
//               style={styles.input}
//               placeholder="Amount (Paise)"
//               keyboardType="numeric"
//               value={amountPaise}
//               onChangeText={setAmountPaise}
//             />

//             {/* Price Items */}
//             <Text style={{ fontWeight: "700", marginBottom: 5, marginTop: 10 }}>
//               Price Items
//             </Text>
//             {priceItems.map((item) => (
//               <View
//                 key={item.id}
//                 style={{
//                   flexDirection: "row",
//                   marginBottom: 5,
//                   alignItems: "center",
//                 }}
//               >
//                 <TextInput
//                   style={[styles.input, { flex: 2, marginRight: 5 }]}
//                   placeholder="Label"
//                   value={item.label}
//                   onChangeText={(text) =>
//                     setPriceItems(
//                       priceItems.map((i) =>
//                         i.id === item.id ? { ...i, label: text } : i
//                       )
//                     )
//                   }
//                 />
//                 <TextInput
//                   style={[styles.input, { flex: 1 }]}
//                   placeholder="Price"
//                   keyboardType="numeric"
//                   value={String(item.priceRupees)}
//                   onChangeText={(text) => {
//                     const val = parseInt(text) || 0;
//                     setPriceItems(
//                       priceItems.map((i) =>
//                         i.id === item.id ? { ...i, priceRupees: val } : i
//                       )
//                     );
//                   }}
//                 />
//                 <TouchableOpacity
//                   onPress={() =>
//                     setPriceItems(priceItems.filter((i) => i.id !== item.id))
//                   }
//                   style={{ marginLeft: 5 }}
//                 >
//                   <Text style={{ color: "red" }}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             ))}

//             {/* Add New Price Item */}
//             <View
//               style={{ flexDirection: "row", marginTop: 5, marginBottom: 10 }}
//             >
//               <TextInput
//                 style={[styles.input, { flex: 2, marginRight: 5 }]}
//                 placeholder="Label"
//                 value={label}
//                 onChangeText={setLabel}
//               />
//               <TextInput
//                 style={[styles.input, { flex: 1 }]}
//                 placeholder="Price"
//                 keyboardType="numeric"
//                 value={price}
//                 onChangeText={setPrice}
//               />
//               <TouchableOpacity
//                 onPress={() => {
//                   if (!label.trim() || !price.trim()) return;
//                   setPriceItems([
//                     ...priceItems,
//                     {
//                       id: Date.now(),
//                       label: label.trim(),
//                       priceRupees: parseInt(price),
//                     },
//                   ]);
//                   setLabel("");
//                   setPrice("");
//                 }}
//                 style={{ marginLeft: 5, justifyContent: "center" }}
//               >
//                 <Text style={{ color: "#007bff" }}>Add</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Save / Cancel */}
//             <TouchableOpacity style={styles.addBtn} onPress={handleSaveUpdate}>
//               <Text style={{ color: "#fff", fontWeight: "700" }}>
//                 Update Job
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[
//                 styles.addBtn,
//                 { backgroundColor: "#ccc", marginTop: 10 },
//               ]}
//               onPress={() => setUpdateModalVisible(false)}
//             >
//               <Text style={{ color: "#333", fontWeight: "700" }}>Cancel</Text>
//             </TouchableOpacity>
//           </ScrollView>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// // ---------- Styles ----------
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8fafc" },
//   topBar: {
//     height: 56,
//     backgroundColor: "#111827",
//     paddingHorizontal: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   iconBtn: { padding: 6, marginRight: 8 },
//   topTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },
//   header: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 12,
//     color: "#0f172a",
//   },
//   filterContainer: { flexDirection: "row", marginBottom: 12 },
//   filterBtn: {
//     flex: 1,
//     padding: 10,
//     marginHorizontal: 5,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginTop: 6,
//     marginBottom: 12,
//     color: "#0b4da0",
//   },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     elevation: 3,
//     borderWidth: 1,
//     borderColor: "#eee",
//   },
//   jobHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#111", flex: 1 },
//   statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
//   statusText: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
//   jobDetails: { marginTop: 2 },
//   jobRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
//   jobInfo: { fontSize: 13, color: "#444", marginLeft: 8 },
//   actionRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 12,
//   },
//   actionBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 10,
//     borderRadius: 10,
//     marginHorizontal: 6,
//   },
//   actionText: { color: "#fff", fontWeight: "700", fontSize: 14, marginLeft: 6 },
//   overlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "#000",
//     zIndex: 9,
//   },
//   sidebar: {
//     position: "absolute",
//     top: 0,
//     bottom: 0,
//     left: 0,
//     width: width * 0.72,
//     backgroundColor: "#fff",
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 20 : 34,
//     paddingHorizontal: 18,
//     paddingBottom: 22,
//     borderTopRightRadius: 18,
//     borderBottomRightRadius: 18,
//     elevation: 12,
//     zIndex: 10,
//   },
//   sidebarHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   sidebarTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
//   menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
//   menuText: { marginLeft: 12, fontSize: 16, color: "#111", fontWeight: "700" },
//   logoutMenu: { flexDirection: "row", alignItems: "center", marginTop: 16 },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   addBtn: {
//     backgroundColor: "#0b78ff",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 10,
//   },
// });
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   FlatList,
//   TextInput,
//   ScrollView,
//   Animated,
//   Dimensions,
//   SafeAreaView,
//   StatusBar,
//   Modal,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import RNPickerSelect from "react-native-picker-select";
// import DateTimePicker from "@react-native-community/datetimepicker";

// import {
//   fetchPosterProfile,
//   logoutPoster,
//   getPosterJobs,
//   deletePosterJob,
//   updatePosterJob,
//   fetchCategories,
//   fetchPosterAddresses,
//   addJobPriceItem,
// } from "../api/poster";

// const { width, height } = Dimensions.get("window");

// export default function PosterDashboard({ navigation }) {
//   // ---------- State ----------
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [jobs, setJobs] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [jobStatusFilter, setJobStatusFilter] = useState("POSTED");
//   const [categories, setCategories] = useState([]);
//   const [addresses, setAddresses] = useState([]);

//   // Sidebar animation
//   const slideAnim = useRef(new Animated.Value(-width * 0.72)).current;
//   const overlayAnim = useRef(new Animated.Value(0)).current;
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // ---------- Update Modal ----------
//   const [updateModalVisible, setUpdateModalVisible] = useState(false);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryCode, setCategoryCode] = useState("");
//   const [amountPaise, setAmountPaise] = useState("");
//   const [deadline, setDeadline] = useState(new Date());
//   const [addressId, setAddressId] = useState("");
//   const [jobType, setJobType] = useState("PHYSICAL");

//   const [priceItems, setPriceItems] = useState([]);
//   const [label, setLabel] = useState("");
//   const [price, setPrice] = useState("");

//   const [showPicker, setShowPicker] = useState(false);

//   // ---------- Load Data ----------
//   useEffect(() => {
//     const unsub = navigation.addListener("focus", () => {
//       loadAll();
//     });
//     loadAll();
//     return unsub;
//   }, [navigation, jobStatusFilter]);

//   const loadAll = async () => {
//     setLoading(true);
//     await Promise.all([
//       loadProfile(),
//       loadJobs(jobStatusFilter),
//       loadCategories(),
//       loadAddresses(),
//     ]);
//     setLoading(false);
//   };

//   const loadProfile = async () => {
//     try {
//       const res = await fetchPosterProfile();
//       if (res?.status === "SUCCESS" && res.data) {
//         setProfile(res.data);
//         await AsyncStorage.setItem("posterProfile", JSON.stringify(res.data));
//       } else setProfile(null);
//     } catch (err) {
//       console.warn("[Profile Error]", err?.message || err);
//       setProfile(null);
//     }
//   };

//   const loadJobs = async (status = "POSTED") => {
//     setRefreshing(true);
//     try {
//       const res = await getPosterJobs(0, 20, status);
//       if (res?.data) setJobs(res.data);
//       else setJobs([]);
//     } catch (err) {
//       console.warn("[Jobs Error]", err?.message || err);
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
//       console.warn("[Categories Error]", err?.message || err);
//     }
//   };

//   const loadAddresses = async () => {
//     try {
//       const res = await fetchPosterAddresses();
//       if (res?.status === "SUCCESS" && Array.isArray(res.data))
//         setAddresses(res.data);
//     } catch (err) {
//       console.warn("[Addresses Error]", err?.message || err);
//     }
//   };

//   // ---------- Sidebar ----------
//   const openSidebar = () => {
//     setSidebarOpen(true);
//     Animated.parallel([
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 260,
//         useNativeDriver: true,
//       }),
//       Animated.timing(overlayAnim, {
//         toValue: 0.45,
//         duration: 260,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };
//   const closeSidebar = () => {
//     Animated.parallel([
//       Animated.timing(slideAnim, {
//         toValue: -width * 0.72,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//       Animated.timing(overlayAnim, {
//         toValue: 0,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//     ]).start(() => setSidebarOpen(false));
//   };
//   const toggleSidebar = () => (sidebarOpen ? closeSidebar() : openSidebar());

//   // ---------- Logout ----------
//   const handleLogout = async () => {
//     try {
//       await logoutPoster();
//       navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//     } catch (err) {
//       Alert.alert("Error", "Logout failed.");
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
//             loadJobs(jobStatusFilter);
//           } catch (err) {
//             Alert.alert("Error", "Failed to delete job");
//           }
//         },
//       },
//     ]);
//   };

//   // ---------- Update Modal Prefill ----------
//   const handleOpenUpdate = (job) => {
//     setSelectedJob(job);
//     setTitle(job.title || "");
//     setDescription(job.description || "");
//     setAmountPaise(String(job.amountPaise || 0));
//     setDeadline(new Date(job.deadline || new Date()));
//     setJobType(job.jobType || "PHYSICAL");

//     const matchedCategory = categories.find(
//       (c) => String(c.code) === String(job.categoryCode)
//     );
//     setCategoryCode(String(matchedCategory?.code || ""));

//     const matchedAddress = addresses.find(
//       (a) => String(a.id) === String(job.addressId)
//     );
//     setAddressId(String(matchedAddress?.id || ""));

//     setPriceItems(job.priceItems || []);
//     setUpdateModalVisible(true);
//   };

//   // ---------- View Items ----------
//   const handleViewItems = (job) => {
//     // Navigate to a new screen (implement JobItemsScreen separately)
//     navigation.navigate("JobItemsScreen", { jobId: job.id });
//   };

//   // ---------- Date Picker ----------
//   const onChangeDate = (event, selectedDate) => {
//     if (Platform.OS === "android") setShowPicker(false);
//     if (selectedDate) setDeadline(selectedDate);
//   };

//   // ---------- Job Card ----------
//   const renderJobItem = ({ item }) => (
//     <View style={styles.jobCard}>
//       <View style={styles.jobHeader}>
//         <Text style={styles.jobTitle}>{item.title}</Text>
//         <View
//           style={[
//             styles.statusBadge,
//             {
//               backgroundColor:
//                 item.status === "POSTED" ? "#007bff20" : "#28a74520",
//             },
//           ]}
//         >
//           <Text
//             style={[
//               styles.statusText,
//               { color: item.status === "POSTED" ? "#007bff" : "#28a745" },
//             ]}
//           >
//             {item.status}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.jobDetails}>
//         <View style={styles.jobRow}>
//           <Ionicons name="briefcase-outline" size={16} color="#555" />
//           <Text style={styles.jobInfo}>{item.category || "No Category"}</Text>
//         </View>

//         <View style={styles.jobRow}>
//           <Ionicons name="location-outline" size={16} color="#555" />
//           <Text style={styles.jobInfo}>
//             {item.addressLabel || "No Address"}
//           </Text>
//         </View>

//         <View style={styles.jobRow}>
//           <Ionicons name="calendar-outline" size={16} color="#555" />
//           <Text style={styles.jobInfo}>
//             {new Date(item.createdAt).toLocaleDateString()}
//           </Text>
//         </View>
//       </View>

//       {item.status === "POSTED" && (
//         <View style={styles.actionRow}>
//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: "#007bff" }]}
//             onPress={() => handleOpenUpdate(item)}
//           >
//             <Ionicons name="create-outline" size={16} color="#fff" />
//             <Text style={styles.actionText}>Update</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: "#28a745" }]}
//             onPress={() => handleViewItems(item)}
//           >
//             <Ionicons name="eye-outline" size={16} color="#fff" />
//             <Text style={styles.actionText}>View Items</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: "#e74c3c" }]}
//             onPress={() => handleDeleteJob(item.id)}
//           >
//             <Ionicons name="trash-outline" size={16} color="#fff" />
//             <Text style={styles.actionText}>Delete</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );

//   // ---------- Update Modal Save ----------
//   const handleSaveUpdate = async () => {
//     if (
//       !title ||
//       !description ||
//       !categoryCode ||
//       (jobType === "PHYSICAL" && !addressId)
//     ) {
//       return Alert.alert("Validation", "All required fields must be filled.");
//     }

//     try {
//       const payload = {
//         title,
//         description,
//         categoryCode: Number(categoryCode),
//         amountPaise: Number(amountPaise),
//         deadline: deadline.toISOString(),
//         addressId: jobType === "PHYSICAL" ? Number(addressId) : null,
//         jobType,
//       };
//       const res = await updatePosterJob(selectedJob.id, payload);

//       if (res.status === "SUCCESS") {
//         // Update price items
//         for (const item of priceItems) {
//           await addJobPriceItem(selectedJob.id, {
//             label: item.label,
//             description: item.description || "",
//             priceRupees: item.priceRupees,
//           });
//         }

//         Alert.alert("✅ Updated", "Job and price items updated successfully");
//         setUpdateModalVisible(false);
//         loadJobs(jobStatusFilter);
//       } else {
//         Alert.alert("Error", res.message || "Failed to update job");
//       }
//     } catch (err) {
//       Alert.alert("Error", "Something went wrong");
//     }
//   };

//   if (loading)
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#0b78ff" />
//       </SafeAreaView>
//     );

//   return (
//     <SafeAreaView
//       style={[styles.container, { paddingTop: StatusBar.currentHeight || 0 }]}
//     >
//       <StatusBar
//         translucent
//         backgroundColor="#111827"
//         barStyle="light-content"
//       />

//       {/* Top bar */}
//       <View style={styles.topBar}>
//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <TouchableOpacity onPress={toggleSidebar} style={styles.iconBtn}>
//             <Ionicons name="menu" size={22} color="#fff" />
//           </TouchableOpacity>
//           <Text style={styles.topTitle}>Poster Dashboard</Text>
//         </View>

//         <TouchableOpacity onPress={handleLogout}>
//           <Ionicons name="log-out-outline" size={22} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* FlatList */}
//       <FlatList
//         data={jobs}
//         keyExtractor={(item, i) => item.id?.toString() || String(i)}
//         renderItem={renderJobItem}
//         refreshing={refreshing}
//         onRefresh={() => loadJobs(jobStatusFilter)}
//         contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
//         ListHeaderComponent={
//           <>
//             <Text style={styles.header}>
//               Welcome {profile?.name?.split(" ")[0] || ""} 👋
//             </Text>

//             <View style={styles.filterContainer}>
//               {["POSTED", "ACCEPTED"].map((status) => (
//                 <TouchableOpacity
//                   key={status}
//                   style={[
//                     styles.filterBtn,
//                     {
//                       backgroundColor:
//                         jobStatusFilter === status ? "#0b78ff" : "#ddd",
//                     },
//                   ]}
//                   onPress={() => {
//                     setJobStatusFilter(status);
//                     loadJobs(status);
//                   }}
//                 >
//                   <Text
//                     style={{
//                       color: jobStatusFilter === status ? "#fff" : "#333",
//                       fontWeight: "700",
//                     }}
//                   >
//                     {status}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <Text style={styles.sectionHeader}>📋 Your Job Posts</Text>
//             <TouchableOpacity
//               onPress={() => navigation.navigate("CreateJobScreen")}
//               style={{
//                 marginRight: 14,
//                 paddingHorizontal: 10,
//                 paddingVertical: 6,
//                 backgroundColor: "#0b78ff",
//                 borderRadius: 8,
//               }}
//             >
//               <Text style={{ color: "#fff", fontWeight: "700" }}>
//                 + Create Job
//               </Text>
//             </TouchableOpacity>
//           </>
//         }
//       />

//       {/* Sidebar Overlay */}
//       {sidebarOpen && (
//         <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
//           <TouchableOpacity
//             style={{ flex: 1 }}
//             activeOpacity={1}
//             onPress={closeSidebar}
//           />
//         </Animated.View>
//       )}

//       {/* Sidebar */}
//       <Animated.View
//         style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
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
//             navigation.navigate("PosterDashboard");
//           }}
//         >
//           <Ionicons name="home-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Dashboard</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("PosterProfileView");
//           }}
//         >
//           <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>View Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("PosterProfileEdit");
//           }}
//         >
//           <MaterialIcons name="edit" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Edit Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("PosterKycUpload");
//           }}
//         >
//           <Ionicons name="document-text-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Upload KYC</Text>
//         </TouchableOpacity>

//         <View style={{ flex: 1 }} />

//         <TouchableOpacity style={styles.logoutMenu} onPress={handleLogout}>
//           <Ionicons name="log-out-outline" size={20} color="#ef4444" />
//           <Text style={[styles.menuText, { color: "#ef4444" }]}>Logout</Text>
//         </TouchableOpacity>
//       </Animated.View>

//       {/* Update Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={updateModalVisible}
//         onRequestClose={() => setUpdateModalVisible(false)}
//       >
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "rgba(0,0,0,0.4)",
//             justifyContent: "center",
//             padding: 20,
//           }}
//         >
//           <ScrollView
//             style={{ backgroundColor: "#fff", borderRadius: 12, padding: 20 }}
//           >
//             <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
//               Update Job
//             </Text>

//             <TextInput
//               style={styles.input}
//               placeholder="Title"
//               value={title}
//               onChangeText={setTitle}
//             />
//             <TextInput
//               style={[styles.input, { height: 80 }]}
//               placeholder="Description"
//               multiline
//               value={description}
//               onChangeText={setDescription}
//             />

//             {/* Category */}
//             <RNPickerSelect
//               onValueChange={(val) => setCategoryCode(val)}
//               value={categoryCode}
//               placeholder={{ label: "Select Category", value: "" }}
//               items={categories.map((c) => ({
//                 label: c.name,
//                 value: String(c.code),
//               }))}
//               style={{ inputAndroid: styles.input, inputIOS: styles.input }}
//             />

//             {/* Address */}
//             <RNPickerSelect
//               onValueChange={(val) => setAddressId(val)}
//               value={addressId}
//               placeholder={{ label: "Select Address", value: "" }}
//               items={addresses.map((a) => ({
//                 label: `${a.label} — ${a.area} (${a.pinCode})`,
//                 value: String(a.id),
//               }))}
//               style={{ inputAndroid: styles.input, inputIOS: styles.input }}
//             />

//             {/* Job Type */}
//             <RNPickerSelect
//               onValueChange={(val) => setJobType(val)}
//               value={jobType}
//               placeholder={{ label: "Select Job Type", value: "PHYSICAL" }}
//               items={[
//                 { label: "PHYSICAL", value: "PHYSICAL" },
//                 { label: "ONLINE", value: "ONLINE" },
//               ]}
//               style={{ inputAndroid: styles.input, inputIOS: styles.input }}
//             />

//             {/* Deadline */}
//             <TouchableOpacity onPress={() => setShowPicker(true)}>
//               <View pointerEvents="none">
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Deadline"
//                   value={deadline?.toISOString()?.split("T")[0]}
//                   editable={false}
//                 />
//               </View>
//             </TouchableOpacity>
//             {showPicker && (
//               <DateTimePicker
//                 value={deadline}
//                 mode="date"
//                 display="default"
//                 onChange={onChangeDate}
//               />
//             )}

//             {/* Amount */}
//             <TextInput
//               style={styles.input}
//               placeholder="Amount (Paise)"
//               keyboardType="numeric"
//               value={amountPaise}
//               onChangeText={setAmountPaise}
//             />

//             {/* Price Items */}
//             <Text style={{ fontWeight: "700", marginBottom: 5, marginTop: 10 }}>
//               Price Items
//             </Text>
//             {priceItems.map((item) => (
//               <View
//                 key={item.id}
//                 style={{
//                   flexDirection: "row",
//                   marginBottom: 5,
//                   alignItems: "center",
//                 }}
//               >
//                 <TextInput
//                   style={[styles.input, { flex: 2, marginRight: 5 }]}
//                   placeholder="Label"
//                   value={item.label}
//                   onChangeText={(text) =>
//                     setPriceItems(
//                       priceItems.map((i) =>
//                         i.id === item.id ? { ...i, label: text } : i
//                       )
//                     )
//                   }
//                 />
//                 <TextInput
//                   style={[styles.input, { flex: 1 }]}
//                   placeholder="Price"
//                   keyboardType="numeric"
//                   value={String(item.priceRupees)}
//                   onChangeText={(text) => {
//                     const val = parseInt(text) || 0;
//                     setPriceItems(
//                       priceItems.map((i) =>
//                         i.id === item.id ? { ...i, priceRupees: val } : i
//                       )
//                     );
//                   }}
//                 />
//                 <TouchableOpacity
//                   onPress={() =>
//                     setPriceItems(priceItems.filter((i) => i.id !== item.id))
//                   }
//                   style={{ marginLeft: 5 }}
//                 >
//                   <Text style={{ color: "red" }}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             ))}

//             {/* Add New Price Item */}
//             <View
//               style={{ flexDirection: "row", marginTop: 5, marginBottom: 10 }}
//             >
//               <TextInput
//                 style={[styles.input, { flex: 2, marginRight: 5 }]}
//                 placeholder="Label"
//                 value={label}
//                 onChangeText={setLabel}
//               />
//               <TextInput
//                 style={[styles.input, { flex: 1 }]}
//                 placeholder="Price"
//                 keyboardType="numeric"
//                 value={price}
//                 onChangeText={setPrice}
//               />
//               <TouchableOpacity
//                 onPress={() => {
//                   if (!label.trim() || !price.trim()) return;
//                   setPriceItems([
//                     ...priceItems,
//                     {
//                       id: Date.now(),
//                       label: label.trim(),
//                       priceRupees: parseInt(price),
//                     },
//                   ]);
//                   setLabel("");
//                   setPrice("");
//                 }}
//                 style={{ marginLeft: 5, justifyContent: "center" }}
//               >
//                 <Text style={{ color: "#007bff" }}>Add</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Save / Cancel */}
//             <TouchableOpacity style={styles.addBtn} onPress={handleSaveUpdate}>
//               <Text style={{ color: "#fff", fontWeight: "700" }}>
//                 Update Job
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[
//                 styles.addBtn,
//                 { backgroundColor: "#ccc", marginTop: 10 },
//               ]}
//               onPress={() => setUpdateModalVisible(false)}
//             >
//               <Text style={{ color: "#333", fontWeight: "700" }}>Cancel</Text>
//             </TouchableOpacity>
//           </ScrollView>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// // ---------- Styles ----------
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8fafc" },
//   topBar: {
//     height: 56,
//     backgroundColor: "#111827",
//     paddingHorizontal: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   iconBtn: { padding: 6, marginRight: 8 },
//   topTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },
//   header: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 12,
//     color: "#0f172a",
//   },
//   filterContainer: { flexDirection: "row", marginBottom: 12 },
//   filterBtn: {
//     flex: 1,
//     padding: 10,
//     marginHorizontal: 5,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginTop: 6,
//     marginBottom: 12,
//     color: "#0b4da0",
//   },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     elevation: 3,
//     borderWidth: 1,
//     borderColor: "#eee",
//   },
//   jobHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#111", flex: 1 },
//   statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
//   statusText: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
//   jobDetails: { marginTop: 2 },
//   jobRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
//   jobInfo: { fontSize: 13, color: "#444", marginLeft: 8 },
//   actionRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 12,
//   },
//   actionBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 10,
//     borderRadius: 10,
//     marginHorizontal: 6,
//   },
//   actionText: { color: "#fff", fontWeight: "700", fontSize: 14, marginLeft: 6 },
//   overlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "#000",
//     zIndex: 9,
//   },
//   sidebar: {
//     position: "absolute",
//     top: 0,
//     bottom: 0,
//     left: 0,
//     width: width * 0.72,
//     backgroundColor: "#fff",
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 20 : 34,
//     paddingHorizontal: 18,
//     paddingBottom: 22,
//     borderTopRightRadius: 18,
//     borderBottomRightRadius: 18,
//     elevation: 12,
//     zIndex: 10,
//   },
//   sidebarHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   sidebarTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
//   menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
//   menuText: { marginLeft: 12, fontSize: 16, color: "#111", fontWeight: "700" },
//   logoutMenu: { flexDirection: "row", alignItems: "center", marginTop: 16 },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   addBtn: {
//     backgroundColor: "#0b78ff",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 10,
//   },
// });

// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   FlatList,
//   TextInput,
//   ScrollView,
//   Animated,
//   Dimensions,
//   SafeAreaView,
//   StatusBar,
//   Modal,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import RNPickerSelect from "react-native-picker-select";
// import DateTimePicker from "@react-native-community/datetimepicker";

// import {
//   fetchPosterProfile,
//   logoutPoster,
//   getPosterJobs,
//   deletePosterJob,
//   updatePosterJob,
//   fetchCategories,
//   fetchPosterAddresses,
//   addJobPriceItem,
// } from "../api/poster";

// const { width, height } = Dimensions.get("window");

// export default function PosterDashboard({ navigation }) {
//   // ---------- State ----------
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [jobs, setJobs] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [jobStatusFilter, setJobStatusFilter] = useState("POSTED");
//   const [categories, setCategories] = useState([]);
//   const [addresses, setAddresses] = useState([]);

//   // Sidebar animation
//   const slideAnim = useRef(new Animated.Value(-width * 0.72)).current;
//   const overlayAnim = useRef(new Animated.Value(0)).current;
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // ---------- Update Modal ----------
//   const [updateModalVisible, setUpdateModalVisible] = useState(false);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryCode, setCategoryCode] = useState("");
//   const [amountPaise, setAmountPaise] = useState("");
//   const [deadline, setDeadline] = useState(new Date());
//   const [addressId, setAddressId] = useState("");
//   const [jobType, setJobType] = useState("PHYSICAL");
//   const [priceItems, setPriceItems] = useState([]);
//   const [label, setLabel] = useState("");
//   const [price, setPrice] = useState("");
//   const [showPicker, setShowPicker] = useState(false);

//   // ---------- View Items Modal ----------
//   const [viewItemsModalVisible, setViewItemsModalVisible] = useState(false);
//   const [selectedJobItems, setSelectedJobItems] = useState([]);

//   // ---------- Load Data ----------
//   useEffect(() => {
//     const unsub = navigation.addListener("focus", () => {
//       loadAll();
//     });
//     loadAll();
//     return unsub;
//   }, [navigation, jobStatusFilter]);

//   const loadAll = async () => {
//     setLoading(true);
//     await Promise.all([
//       loadProfile(),
//       loadJobs(jobStatusFilter),
//       loadCategories(),
//       loadAddresses(),
//     ]);
//     setLoading(false);
//   };

//   const loadProfile = async () => {
//     try {
//       const res = await fetchPosterProfile();
//       if (res?.status === "SUCCESS" && res.data) {
//         setProfile(res.data);
//         await AsyncStorage.setItem("posterProfile", JSON.stringify(res.data));
//       } else setProfile(null);
//     } catch (err) {
//       console.warn("[Profile Error]", err?.message || err);
//       setProfile(null);
//     }
//   };

//   const loadJobs = async (status = "POSTED") => {
//     setRefreshing(true);
//     try {
//       const res = await getPosterJobs(0, 20, status);
//       if (res?.data) setJobs(res.data);
//       else setJobs([]);
//     } catch (err) {
//       console.warn("[Jobs Error]", err?.message || err);
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
//       console.warn("[Categories Error]", err?.message || err);
//     }
//   };

//   const loadAddresses = async () => {
//     try {
//       const res = await fetchPosterAddresses();
//       if (res?.status === "SUCCESS" && Array.isArray(res.data))
//         setAddresses(res.data);
//     } catch (err) {
//       console.warn("[Addresses Error]", err?.message || err);
//     }
//   };

//   // ---------- Sidebar ----------
//   const openSidebar = () => {
//     setSidebarOpen(true);
//     Animated.parallel([
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 260,
//         useNativeDriver: true,
//       }),
//       Animated.timing(overlayAnim, {
//         toValue: 0.45,
//         duration: 260,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };
//   const closeSidebar = () => {
//     Animated.parallel([
//       Animated.timing(slideAnim, {
//         toValue: -width * 0.72,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//       Animated.timing(overlayAnim, {
//         toValue: 0,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//     ]).start(() => setSidebarOpen(false));
//   };
//   const toggleSidebar = () => (sidebarOpen ? closeSidebar() : openSidebar());

//   // ---------- Logout ----------
//   const handleLogout = async () => {
//     try {
//       await logoutPoster();
//       navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//     } catch (err) {
//       Alert.alert("Error", "Logout failed.");
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
//             loadJobs(jobStatusFilter);
//           } catch (err) {
//             Alert.alert("Error", "Failed to delete job");
//           }
//         },
//       },
//     ]);
//   };

//   // ---------- Update Modal Prefill ----------
//   const handleOpenUpdate = (job) => {
//     setSelectedJob(job);
//     setTitle(job.title || "");
//     setDescription(job.description || "");
//     setAmountPaise(String(job.amountPaise || 0));
//     setDeadline(new Date(job.deadline || new Date()));
//     setJobType(job.jobType || "PHYSICAL");

//     const matchedCategory = categories.find(
//       (c) => String(c.code) === String(job.categoryCode)
//     );
//     setCategoryCode(String(matchedCategory?.code || ""));

//     const matchedAddress = addresses.find(
//       (a) => String(a.id) === String(job.addressId)
//     );
//     setAddressId(String(matchedAddress?.id || ""));

//     setPriceItems(job.priceItems || []);
//     setUpdateModalVisible(true);
//   };

//   // ---------- View Items ----------
//   const handleViewItems = (job) => {
//     setSelectedJobItems(job.priceItems || []);
//     setViewItemsModalVisible(true);
//   };

//   // ---------- Date Picker ----------
//   const onChangeDate = (event, selectedDate) => {
//     if (Platform.OS === "android") setShowPicker(false);
//     if (selectedDate) setDeadline(selectedDate);
//   };

//   // ---------- Job Card ----------
//   const renderJobItem = ({ item }) => (
//     <View style={styles.jobCard}>
//       <View style={styles.jobHeader}>
//         <Text style={styles.jobTitle}>{item.title}</Text>
//         <View
//           style={[
//             styles.statusBadge,
//             {
//               backgroundColor:
//                 item.status === "POSTED" ? "#007bff20" : "#28a74520",
//             },
//           ]}
//         >
//           <Text
//             style={[
//               styles.statusText,
//               { color: item.status === "POSTED" ? "#007bff" : "#28a745" },
//             ]}
//           >
//             {item.status}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.jobDetails}>
//         <View style={styles.jobRow}>
//           <Ionicons name="briefcase-outline" size={16} color="#555" />
//           <Text style={styles.jobInfo}>{item.category || "No Category"}</Text>
//         </View>

//         <View style={styles.jobRow}>
//           <Ionicons name="location-outline" size={16} color="#555" />
//           <Text style={styles.jobInfo}>
//             {item.addressLabel || "No Address"}
//           </Text>
//         </View>

//         <View style={styles.jobRow}>
//           <Ionicons name="calendar-outline" size={16} color="#555" />
//           <Text style={styles.jobInfo}>
//             {new Date(item.createdAt).toLocaleDateString()}
//           </Text>
//         </View>
//       </View>

//       {item.status === "POSTED" && (
//         <View style={styles.actionRow}>
//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: "#007bff" }]}
//             onPress={() => handleOpenUpdate(item)}
//           >
//             <Ionicons name="create-outline" size={16} color="#fff" />
//             <Text style={styles.actionText}>Update</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: "#e74c3c" }]}
//             onPress={() => handleDeleteJob(item.id)}
//           >
//             <Ionicons name="trash-outline" size={16} color="#fff" />
//             <Text style={styles.actionText}>Delete</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: "#28a745" }]}
//             onPress={() => handleViewItems(item)}
//           >
//             <Ionicons name="eye-outline" size={16} color="#fff" />
//             <Text style={styles.actionText}>View Items</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );

//   // ---------- Update Modal Save ----------
//   const handleSaveUpdate = async () => {
//     if (
//       !title ||
//       !description ||
//       !categoryCode ||
//       (jobType === "PHYSICAL" && !addressId)
//     ) {
//       return Alert.alert("Validation", "All required fields must be filled.");
//     }

//     try {
//       const payload = {
//         title,
//         description,
//         categoryCode: Number(categoryCode),
//         amountPaise: Number(amountPaise),
//         deadline: deadline.toISOString(),
//         addressId: jobType === "PHYSICAL" ? Number(addressId) : null,
//         jobType,
//       };
//       const res = await updatePosterJob(selectedJob.id, payload);

//       if (res.status === "SUCCESS") {
//         for (const item of priceItems) {
//           await addJobPriceItem(selectedJob.id, {
//             label: item.label,
//             description: item.description || "",
//             priceRupees: item.priceRupees,
//           });
//         }
//         Alert.alert("✅ Updated", "Job and price items updated successfully");
//         setUpdateModalVisible(false);
//         loadJobs(jobStatusFilter);
//       } else {
//         Alert.alert("Error", res.message || "Failed to update job");
//       }
//     } catch (err) {
//       Alert.alert("Error", "Something went wrong");
//     }
//   };

//   if (loading)
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#0b78ff" />
//       </SafeAreaView>
//     );

//   return (
//     <SafeAreaView
//       style={[styles.container, { paddingTop: StatusBar.currentHeight || 0 }]}
//     >
//       <StatusBar
//         translucent
//         backgroundColor="#111827"
//         barStyle="light-content"
//       />

//       {/* Top bar */}
//       <View style={styles.topBar}>
//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <TouchableOpacity onPress={toggleSidebar} style={styles.iconBtn}>
//             <Ionicons name="menu" size={22} color="#fff" />
//           </TouchableOpacity>
//           <Text style={styles.topTitle}>Poster Dashboard</Text>
//         </View>
//         <TouchableOpacity onPress={handleLogout}>
//           <Ionicons name="log-out-outline" size={22} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* FlatList */}
//       <FlatList
//         data={jobs}
//         keyExtractor={(item, i) => item.id?.toString() || String(i)}
//         renderItem={renderJobItem}
//         refreshing={refreshing}
//         onRefresh={() => loadJobs(jobStatusFilter)}
//         contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
//         ListHeaderComponent={
//           <>
//             <Text style={styles.header}>
//               Welcome {profile?.name?.split(" ")[0] || ""} 👋
//             </Text>

//             <View style={styles.filterContainer}>
//               {["POSTED", "ACCEPTED"].map((status) => (
//                 <TouchableOpacity
//                   key={status}
//                   style={[
//                     styles.filterBtn,
//                     {
//                       backgroundColor:
//                         jobStatusFilter === status ? "#0b78ff" : "#ddd",
//                     },
//                   ]}
//                   onPress={() => {
//                     setJobStatusFilter(status);
//                     loadJobs(status);
//                   }}
//                 >
//                   <Text
//                     style={{
//                       color: jobStatusFilter === status ? "#fff" : "#333",
//                       fontWeight: "700",
//                     }}
//                   >
//                     {status}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <Text style={styles.sectionHeader}>📋 Your Job Posts</Text>
//             <TouchableOpacity
//               onPress={() => navigation.navigate("CreateJobScreen")}
//               style={{
//                 marginRight: 14,
//                 paddingHorizontal: 10,
//                 paddingVertical: 6,
//                 backgroundColor: "#0b78ff",
//                 borderRadius: 8,
//               }}
//             >
//               <Text style={{ color: "#fff", fontWeight: "700" }}>
//                 + Create Job
//               </Text>
//             </TouchableOpacity>
//           </>
//         }
//       />

//       {/* Sidebar Overlay */}
//       {sidebarOpen && (
//         <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
//           <TouchableOpacity
//             style={{ flex: 1 }}
//             activeOpacity={1}
//             onPress={closeSidebar}
//           />
//         </Animated.View>
//       )}

//       {/* Sidebar */}
//       <Animated.View
//         style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
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
//             navigation.navigate("PosterDashboard");
//           }}
//         >
//           <Ionicons name="home-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Dashboard</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("PosterProfileView");
//           }}
//         >
//           <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>View Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("PosterProfileEdit");
//           }}
//         >
//           <MaterialIcons name="edit" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Edit Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("PosterKycUpload");
//           }}
//         >
//           <Ionicons name="document-text-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Upload KYC</Text>
//         </TouchableOpacity>

//         <View style={{ flex: 1 }} />

//         <TouchableOpacity style={styles.logoutMenu} onPress={handleLogout}>
//           <Ionicons name="log-out-outline" size={20} color="#ef4444" />
//           <Text style={[styles.menuText, { color: "#ef4444" }]}>Logout</Text>
//         </TouchableOpacity>
//       </Animated.View>

//       {/* ---------- Update Modal ---------- */}
//       <Modal
//         animationType="slide"
//         transparent
//         visible={updateModalVisible}
//         onRequestClose={() => setUpdateModalVisible(false)}
//       >
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "rgba(0,0,0,0.4)",
//             justifyContent: "center",
//             padding: 20,
//           }}
//         >
//           <ScrollView
//             style={{ backgroundColor: "#fff", borderRadius: 12, padding: 20 }}
//           >
//             <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
//               Update Job
//             </Text>
//             {/* ... All your inputs from earlier code ... */}
//             {/* Save / Cancel buttons */}
//             <TouchableOpacity style={styles.addBtn} onPress={handleSaveUpdate}>
//               <Text style={{ color: "#fff", fontWeight: "700" }}>
//                 Update Job
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[
//                 styles.addBtn,
//                 { backgroundColor: "#ccc", marginTop: 10 },
//               ]}
//               onPress={() => setUpdateModalVisible(false)}
//             >
//               <Text style={{ color: "#333", fontWeight: "700" }}>Cancel</Text>
//             </TouchableOpacity>
//           </ScrollView>
//         </View>
//       </Modal>

//       {/* ---------- View Items Modal ---------- */}
//       <Modal
//         animationType="slide"
//         transparent
//         visible={viewItemsModalVisible}
//         onRequestClose={() => setViewItemsModalVisible(false)}
//       >
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "rgba(0,0,0,0.4)",
//             justifyContent: "center",
//             padding: 20,
//           }}
//         >
//           <View
//             style={{
//               backgroundColor: "#fff",
//               borderRadius: 12,
//               padding: 20,
//               maxHeight: height * 0.7,
//             }}
//           >
//             <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
//               Job Items
//             </Text>
//             {selectedJobItems.length === 0 && (
//               <Text style={{ textAlign: "center", marginVertical: 20 }}>
//                 No items available
//               </Text>
//             )}
//             <ScrollView>
//               {selectedJobItems.map((item, index) => (
//                 <View
//                   key={index}
//                   style={{
//                     borderBottomWidth: 1,
//                     borderBottomColor: "#eee",
//                     paddingVertical: 10,
//                   }}
//                 >
//                   <Text style={{ fontWeight: "700" }}>{item.label}</Text>
//                   {item.description ? (
//                     <Text style={{ color: "#555", marginTop: 2 }}>
//                       {item.description}
//                     </Text>
//                   ) : null}
//                   <Text style={{ color: "#111", marginTop: 2 }}>
//                     Price: ₹{item.priceRupees}
//                   </Text>
//                 </View>
//               ))}
//             </ScrollView>
//             <TouchableOpacity
//               onPress={() => setViewItemsModalVisible(false)}
//               style={{
//                 marginTop: 12,
//                 backgroundColor: "#0b78ff",
//                 padding: 12,
//                 borderRadius: 10,
//                 alignItems: "center",
//               }}
//             >
//               <Text style={{ color: "#fff", fontWeight: "700" }}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f9f9f9" },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   topBar: {
//     height: 60,
//     backgroundColor: "#111827",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 12,
//   },
//   iconBtn: { marginRight: 10 },
//   topTitle: { color: "#fff", fontWeight: "700", fontSize: 18 },
//   header: { fontSize: 22, fontWeight: "700", marginVertical: 14 },
//   filterContainer: { flexDirection: "row", marginBottom: 16 },
//   filterBtn: { padding: 8, marginRight: 8, borderRadius: 8 },
//   sectionHeader: { fontSize: 18, fontWeight: "700", marginVertical: 8 },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   jobHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },
//   jobTitle: { fontSize: 16, fontWeight: "700" },
//   statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
//   statusText: { fontWeight: "700", fontSize: 12 },
//   jobDetails: { marginBottom: 8 },
//   jobRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
//   jobInfo: { marginLeft: 6, color: "#555" },
//   actionRow: { flexDirection: "row", justifyContent: "space-between" },
//   actionBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 6,
//     borderRadius: 8,
//     flex: 1,
//     marginHorizontal: 4,
//     justifyContent: "center",
//   },
//   actionText: { color: "#fff", marginLeft: 4, fontWeight: "700" },
//   overlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     bottom: 0,
//     right: 0,
//     backgroundColor: "#000",
//   },
//   sidebar: {
//     position: "absolute",
//     top: 0,
//     bottom: 0,
//     left: 0,
//     width: width * 0.72,
//     backgroundColor: "#fff",
//     zIndex: 20,
//     padding: 20,
//   },
//   sidebarHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   sidebarTitle: { fontSize: 22, fontWeight: "700" },
//   menuItem: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
//   menuText: {
//     marginLeft: 12,
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#111827",
//   },
//   logoutMenu: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
//   addBtn: {
//     marginTop: 12,
//     backgroundColor: "#0b78ff",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//   },
// });
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   FlatList,
//   ScrollView,
//   Animated,
//   Dimensions,
//   SafeAreaView,
//   StatusBar,
//   Modal,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// import {
//   fetchPosterProfile,
//   logoutPoster,
//   getPosterJobs,
//   deletePosterJob,
//   updatePosterJob,
//   fetchCategories,
//   fetchPosterAddresses,
//   addJobPriceItem,
// } from "../api/poster";

// const { width, height } = Dimensions.get("window");

// export default function PosterDashboard({ navigation }) {
//   // ---------- State ----------
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [jobs, setJobs] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [jobStatusFilter, setJobStatusFilter] = useState("POSTED");
//   const [categories, setCategories] = useState([]);
//   const [addresses, setAddresses] = useState([]);

//   // Sidebar animation
//   const slideAnim = useRef(new Animated.Value(-width * 0.72)).current;
//   const overlayAnim = useRef(new Animated.Value(0)).current;
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // ---------- Update Modal ----------
//   const [updateModalVisible, setUpdateModalVisible] = useState(false);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryCode, setCategoryCode] = useState("");
//   const [amountPaise, setAmountPaise] = useState("");
//   const [deadline, setDeadline] = useState(new Date());
//   const [addressId, setAddressId] = useState("");
//   const [jobType, setJobType] = useState("PHYSICAL");
//   const [priceItems, setPriceItems] = useState([]);

//   // ---------- View Items Modal ----------
//   const [viewItemsModalVisible, setViewItemsModalVisible] = useState(false);
//   const [selectedJobItems, setSelectedJobItems] = useState([]);

//   // ---------- Load Data ----------
//   useEffect(() => {
//     const unsub = navigation.addListener("focus", () => {
//       loadAll();
//     });
//     loadAll();
//     return unsub;
//   }, [navigation, jobStatusFilter]);

//   const loadAll = async () => {
//     setLoading(true);
//     await Promise.all([
//       loadProfile(),
//       loadJobs(jobStatusFilter),
//       loadCategories(),
//       loadAddresses(),
//     ]);
//     setLoading(false);
//   };

//   const loadProfile = async () => {
//     try {
//       const res = await fetchPosterProfile();
//       if (res?.status === "SUCCESS" && res.data) {
//         setProfile(res.data);
//         await AsyncStorage.setItem("posterProfile", JSON.stringify(res.data));
//       } else setProfile(null);
//     } catch (err) {
//       console.warn("[Profile Error]", err?.message || err);
//       setProfile(null);
//     }
//   };

//   const loadJobs = async (status = "POSTED") => {
//     setRefreshing(true);
//     try {
//       const res = await getPosterJobs(0, 20, status);
//       if (res?.data) setJobs(res.data);
//       else setJobs([]);
//     } catch (err) {
//       console.warn("[Jobs Error]", err?.message || err);
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
//       console.warn("[Categories Error]", err?.message || err);
//     }
//   };

//   const loadAddresses = async () => {
//     try {
//       const res = await fetchPosterAddresses();
//       if (res?.status === "SUCCESS" && Array.isArray(res.data))
//         setAddresses(res.data);
//     } catch (err) {
//       console.warn("[Addresses Error]", err?.message || err);
//     }
//   };

//   // ---------- Sidebar ----------
//   const openSidebar = () => {
//     setSidebarOpen(true);
//     Animated.parallel([
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 260,
//         useNativeDriver: true,
//       }),
//       Animated.timing(overlayAnim, {
//         toValue: 0.45,
//         duration: 260,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };
//   const closeSidebar = () => {
//     Animated.parallel([
//       Animated.timing(slideAnim, {
//         toValue: -width * 0.72,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//       Animated.timing(overlayAnim, {
//         toValue: 0,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//     ]).start(() => setSidebarOpen(false));
//   };
//   const toggleSidebar = () => (sidebarOpen ? closeSidebar() : openSidebar());

//   // ---------- Logout ----------
//   const handleLogout = async () => {
//     try {
//       await logoutPoster();
//       navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
//     } catch (err) {
//       Alert.alert("Error", "Logout failed.");
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
//             loadJobs(jobStatusFilter);
//           } catch (err) {
//             Alert.alert("Error", "Failed to delete job");
//           }
//         },
//       },
//     ]);
//   };

//   // ---------- Update Modal Prefill ----------
//   const handleOpenUpdate = (job) => {
//     setSelectedJob(job);
//     setTitle(job.title || "");
//     setDescription(job.description || "");
//     setAmountPaise(String(job.amountPaise || 0));
//     setDeadline(new Date(job.deadline || new Date()));
//     setJobType(job.jobType || "PHYSICAL");

//     const matchedCategory = categories.find(
//       (c) => String(c.code) === String(job.categoryCode)
//     );
//     setCategoryCode(String(matchedCategory?.code || ""));

//     const matchedAddress = addresses.find(
//       (a) => String(a.id) === String(job.addressId)
//     );
//     setAddressId(String(matchedAddress?.id || ""));

//     setPriceItems(job.priceItems || []);
//     setUpdateModalVisible(true);
//   };

//   // ---------- View Items ----------
//   const handleViewItems = (job) => {
//     // Ensure items exist and flatten nested structure if needed
//     const items = job.priceItems?.data || job.priceItems || [];
//     setSelectedJobItems(items);
//     setViewItemsModalVisible(true);
//   };

//   // ---------- Job Card ----------
//   const renderJobItem = ({ item }) => (
//     <View style={styles.jobCard}>
//       <View style={styles.jobHeader}>
//         <Text style={styles.jobTitle}>{item.title}</Text>
//         <View
//           style={[
//             styles.statusBadge,
//             {
//               backgroundColor:
//                 item.status === "POSTED" ? "#007bff20" : "#28a74520",
//             },
//           ]}
//         >
//           <Text
//             style={[
//               styles.statusText,
//               { color: item.status === "POSTED" ? "#007bff" : "#28a745" },
//             ]}
//           >
//             {item.status}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.jobDetails}>
//         <View style={styles.jobRow}>
//           <Ionicons name="briefcase-outline" size={16} color="#555" />
//           <Text style={styles.jobInfo}>{item.category || "No Category"}</Text>
//         </View>

//         <View style={styles.jobRow}>
//           <Ionicons name="location-outline" size={16} color="#555" />
//           <Text style={styles.jobInfo}>
//             {item.addressLabel || "No Address"}
//           </Text>
//         </View>

//         <View style={styles.jobRow}>
//           <Ionicons name="calendar-outline" size={16} color="#555" />
//           <Text style={styles.jobInfo}>
//             {new Date(item.createdAt).toLocaleDateString()}
//           </Text>
//         </View>
//       </View>

//       {item.status === "POSTED" && (
//         <View style={styles.actionRow}>
//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: "#007bff" }]}
//             onPress={() => handleOpenUpdate(item)}
//           >
//             <Ionicons name="create-outline" size={16} color="#fff" />
//             <Text style={styles.actionText}>Update</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: "#e74c3c" }]}
//             onPress={() => handleDeleteJob(item.id)}
//           >
//             <Ionicons name="trash-outline" size={16} color="#fff" />
//             <Text style={styles.actionText}>Delete</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: "#28a745" }]}
//             onPress={() => handleViewItems(item)}
//           >
//             <Ionicons name="eye-outline" size={16} color="#fff" />
//             <Text style={styles.actionText}>View Items</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );

//   // ---------- Update Modal Save ----------
//   const handleSaveUpdate = async () => {
//     if (
//       !title ||
//       !description ||
//       !categoryCode ||
//       (jobType === "PHYSICAL" && !addressId)
//     ) {
//       return Alert.alert("Validation", "All required fields must be filled.");
//     }

//     try {
//       const payload = {
//         title,
//         description,
//         categoryCode: Number(categoryCode),
//         amountPaise: Number(amountPaise),
//         deadline: deadline.toISOString(),
//         addressId: jobType === "PHYSICAL" ? Number(addressId) : null,
//         jobType,
//       };
//       const res = await updatePosterJob(selectedJob.id, payload);

//       if (res.status === "SUCCESS") {
//         for (const item of priceItems) {
//           await addJobPriceItem(selectedJob.id, {
//             label: item.label,
//             description: item.description || "",
//             priceRupees: item.priceRupees,
//           });
//         }
//         Alert.alert("✅ Updated", "Job and price items updated successfully");
//         setUpdateModalVisible(false);
//         loadJobs(jobStatusFilter);
//       } else {
//         Alert.alert("Error", res.message || "Failed to update job");
//       }
//     } catch (err) {
//       Alert.alert("Error", "Something went wrong");
//     }
//   };

//   if (loading)
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#0b78ff" />
//       </SafeAreaView>
//     );

//   return (
//     <SafeAreaView
//       style={[styles.container, { paddingTop: StatusBar.currentHeight || 0 }]}
//     >
//       <StatusBar
//         translucent
//         backgroundColor="#111827"
//         barStyle="light-content"
//       />

//       {/* Top bar */}
//       <View style={styles.topBar}>
//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <TouchableOpacity onPress={toggleSidebar} style={styles.iconBtn}>
//             <Ionicons name="menu" size={22} color="#fff" />
//           </TouchableOpacity>
//           <Text style={styles.topTitle}>Poster Dashboard</Text>
//         </View>
//         <TouchableOpacity onPress={handleLogout}>
//           <Ionicons name="log-out-outline" size={22} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* FlatList */}
//       <FlatList
//         data={jobs}
//         keyExtractor={(item, i) => item.id?.toString() || String(i)}
//         renderItem={renderJobItem}
//         refreshing={refreshing}
//         onRefresh={() => loadJobs(jobStatusFilter)}
//         contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
//         ListHeaderComponent={
//           <>
//             <Text style={styles.header}>
//               Welcome {profile?.name?.split(" ")[0] || ""} 👋
//             </Text>

//             <View style={styles.filterContainer}>
//               {["POSTED", "ACCEPTED"].map((status) => (
//                 <TouchableOpacity
//                   key={status}
//                   style={[
//                     styles.filterBtn,
//                     {
//                       backgroundColor:
//                         jobStatusFilter === status ? "#0b78ff" : "#ddd",
//                     },
//                   ]}
//                   onPress={() => {
//                     setJobStatusFilter(status);
//                     loadJobs(status);
//                   }}
//                 >
//                   <Text
//                     style={{
//                       color: jobStatusFilter === status ? "#fff" : "#333",
//                       fontWeight: "700",
//                     }}
//                   >
//                     {status}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <Text style={styles.sectionHeader}>📋 Your Job Posts</Text>
//             <TouchableOpacity
//               onPress={() => navigation.navigate("CreateJobScreen")}
//               style={{
//                 marginRight: 14,
//                 paddingHorizontal: 10,
//                 paddingVertical: 6,
//                 backgroundColor: "#0b78ff",
//                 borderRadius: 8,
//               }}
//             >
//               <Text style={{ color: "#fff", fontWeight: "700" }}>
//                 + Create Job
//               </Text>
//             </TouchableOpacity>
//           </>
//         }
//       />

//       {/* Sidebar Overlay */}
//       {sidebarOpen && (
//         <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
//           <TouchableOpacity
//             style={{ flex: 1 }}
//             activeOpacity={1}
//             onPress={closeSidebar}
//           />
//         </Animated.View>
//       )}

//       {/* Sidebar */}
//       <Animated.View
//         style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
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
//             navigation.navigate("PosterDashboard");
//           }}
//         >
//           <Ionicons name="home-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Dashboard</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("PosterProfileView");
//           }}
//         >
//           <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>View Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("PosterProfileEdit");
//           }}
//         >
//           <MaterialIcons name="edit" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Edit Profile</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.menuItem}
//           onPress={() => {
//             closeSidebar();
//             navigation.navigate("PosterKycUpload");
//           }}
//         >
//           <Ionicons name="document-text-outline" size={20} color="#2563eb" />
//           <Text style={styles.menuText}>Upload KYC</Text>
//         </TouchableOpacity>

//         <View style={{ flex: 1 }} />

//         <TouchableOpacity style={styles.logoutMenu} onPress={handleLogout}>
//           <Ionicons name="log-out-outline" size={20} color="#ef4444" />
//           <Text style={[styles.menuText, { color: "#ef4444" }]}>Logout</Text>
//         </TouchableOpacity>
//       </Animated.View>

//       {/* ---------- Update Modal ---------- */}
//       <Modal
//         animationType="slide"
//         transparent
//         visible={updateModalVisible}
//         onRequestClose={() => setUpdateModalVisible(false)}
//       >
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "rgba(0,0,0,0.4)",
//             justifyContent: "center",
//             padding: 20,
//           }}
//         >
//           <ScrollView
//             style={{ backgroundColor: "#fff", borderRadius: 12, padding: 20 }}
//           >
//             <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
//               Update Job
//             </Text>
//             {/* Add your input fields here */}
//             <TouchableOpacity style={styles.addBtn} onPress={handleSaveUpdate}>
//               <Text style={{ color: "#fff", fontWeight: "700" }}>
//                 Update Job
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[
//                 styles.addBtn,
//                 { backgroundColor: "#ccc", marginTop: 10 },
//               ]}
//               onPress={() => setUpdateModalVisible(false)}
//             >
//               <Text style={{ color: "#333", fontWeight: "700" }}>Cancel</Text>
//             </TouchableOpacity>
//           </ScrollView>
//         </View>
//       </Modal>

//       {/* ---------- View Items Modal ---------- */}
//       <Modal
//         animationType="slide"
//         transparent
//         visible={viewItemsModalVisible}
//         onRequestClose={() => setViewItemsModalVisible(false)}
//       >
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "rgba(0,0,0,0.4)",
//             justifyContent: "center",
//             padding: 20,
//           }}
//         >
//           <View
//             style={{
//               backgroundColor: "#fff",
//               borderRadius: 12,
//               padding: 20,
//               maxHeight: height * 0.7,
//             }}
//           >
//             <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
//               Job Items
//             </Text>
//             {selectedJobItems.length === 0 ? (
//               <Text style={{ textAlign: "center", marginVertical: 20 }}>
//                 No items available
//               </Text>
//             ) : (
//               <ScrollView>
//                 {selectedJobItems.map((item, index) => (
//                   <View
//                     key={index}
//                     style={{
//                       borderBottomWidth: 1,
//                       borderBottomColor: "#eee",
//                       paddingVertical: 10,
//                     }}
//                   >
//                     <Text style={{ fontWeight: "700" }}>
//                       {item.label || item.name}
//                     </Text>
//                     {item.description || item.desc ? (
//                       <Text style={{ color: "#555", marginTop: 2 }}>
//                         {item.description || item.desc}
//                       </Text>
//                     ) : null}
//                     <Text style={{ color: "#111", marginTop: 2 }}>
//                       Price: ₹{item.priceRupees || item.amount}
//                     </Text>
//                   </View>
//                 ))}
//               </ScrollView>
//             )}
//             <TouchableOpacity
//               onPress={() => setViewItemsModalVisible(false)}
//               style={{
//                 marginTop: 12,
//                 backgroundColor: "#0b78ff",
//                 padding: 12,
//                 borderRadius: 10,
//                 alignItems: "center",
//               }}
//             >
//               <Text style={{ color: "#fff", fontWeight: "700" }}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f9f9f9" },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   topBar: {
//     height: 60,
//     backgroundColor: "#111827",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 12,
//   },
//   iconBtn: { marginRight: 10 },
//   topTitle: { color: "#fff", fontWeight: "700", fontSize: 18 },
//   header: { fontSize: 22, fontWeight: "700", marginVertical: 14 },
//   filterContainer: { flexDirection: "row", marginBottom: 16 },
//   filterBtn: { padding: 8, marginRight: 8, borderRadius: 8 },
//   sectionHeader: { fontSize: 18, fontWeight: "700", marginVertical: 8 },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 14,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   jobHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },
//   jobTitle: { fontSize: 16, fontWeight: "700" },
//   statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
//   statusText: { fontWeight: "700", fontSize: 12 },
//   jobDetails: { marginBottom: 8 },
//   jobRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
//   jobInfo: { marginLeft: 6, color: "#555" },
//   actionRow: { flexDirection: "row", justifyContent: "space-between" },
//   actionBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 6,
//     borderRadius: 8,
//     flex: 1,
//     marginHorizontal: 4,
//     justifyContent: "center",
//   },
//   actionText: { color: "#fff", marginLeft: 4, fontWeight: "700" },
//   overlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     bottom: 0,
//     right: 0,
//     backgroundColor: "#000",
//   },
//   sidebar: {
//     position: "absolute",
//     top: 0,
//     bottom: 0,
//     left: 0,
//     width: width * 0.72,
//     backgroundColor: "#fff",
//     zIndex: 20,
//     padding: 20,
//   },
//   sidebarHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   sidebarTitle: { fontSize: 22, fontWeight: "700" },
//   menuItem: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
//   menuText: {
//     marginLeft: 12,
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#111827",
//   },
//   logoutMenu: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
//   addBtn: {
//     marginTop: 12,
//     backgroundColor: "#0b78ff",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//   },
// });
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import {
  fetchPosterProfile,
  logoutPoster,
  getPosterJobs,
  deletePosterJob,
  updatePosterJob,
  fetchCategories,
  fetchPosterAddresses,
  addJobPriceItem,
} from "../api/poster";

import { getJobDetails } from "../api/doer"; // fetch full job details

const { width, height } = Dimensions.get("window");

export default function PosterDashboard({ navigation }) {
  // ---------- State ----------
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [jobStatusFilter, setJobStatusFilter] = useState("POSTED");
  const [categories, setCategories] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // Sidebar animation
  const slideAnim = useRef(new Animated.Value(-width * 0.72)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ---------- Update Modal ----------
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [amountPaise, setAmountPaise] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [addressId, setAddressId] = useState("");
  const [jobType, setJobType] = useState("PHYSICAL");
  const [priceItems, setPriceItems] = useState([]);

  // ---------- View Items Modal ----------
  const [viewItemsModalVisible, setViewItemsModalVisible] = useState(false);
  const [selectedJobItems, setSelectedJobItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // ---------- Load Data ----------
  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      loadAll();
    });
    loadAll();
    return unsub;
  }, [navigation, jobStatusFilter]);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      loadProfile(),
      loadJobs(jobStatusFilter),
      loadCategories(),
      loadAddresses(),
    ]);
    setLoading(false);
  };

  const loadProfile = async () => {
    try {
      const res = await fetchPosterProfile();
      if (res?.status === "SUCCESS" && res.data) {
        setProfile(res.data);
        await AsyncStorage.setItem("posterProfile", JSON.stringify(res.data));
      } else setProfile(null);
    } catch (err) {
      console.warn("[Profile Error]", err?.message || err);
      setProfile(null);
    }
  };

  const loadJobs = async (status = "POSTED") => {
    setRefreshing(true);
    try {
      const res = await getPosterJobs(0, 20, status);
      if (res?.data) setJobs(res.data);
      else setJobs([]);
    } catch (err) {
      console.warn("[Jobs Error]", err?.message || err);
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
      console.warn("[Categories Error]", err?.message || err);
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await fetchPosterAddresses();
      if (res?.status === "SUCCESS" && Array.isArray(res.data))
        setAddresses(res.data);
    } catch (err) {
      console.warn("[Addresses Error]", err?.message || err);
    }
  };

  // ---------- Sidebar ----------
  const openSidebar = () => {
    setSidebarOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0.45,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  };
  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width * 0.72,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setSidebarOpen(false));
  };
  const toggleSidebar = () => (sidebarOpen ? closeSidebar() : openSidebar());

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
          } catch (err) {
            Alert.alert("Error", "Failed to delete job");
          }
        },
      },
    ]);
  };

  // ---------- Update Modal Prefill ----------
  const handleOpenUpdate = (job) => {
    setSelectedJob(job);
    setTitle(job.title || "");
    setDescription(job.description || "");
    setAmountPaise(String(job.amountPaise || 0));
    setDeadline(new Date(job.deadline || new Date()));
    setJobType(job.jobType || "PHYSICAL");

    const matchedCategory = categories.find(
      (c) => String(c.code) === String(job.categoryCode)
    );
    setCategoryCode(String(matchedCategory?.code || ""));

    const matchedAddress = addresses.find(
      (a) => String(a.id) === String(job.addressId)
    );
    setAddressId(String(matchedAddress?.id || ""));

    setPriceItems(job.priceItems || []);
    setUpdateModalVisible(true);
  };

  // ---------- View Items ----------
  const handleViewItems = async (job) => {
    setViewItemsModalVisible(true);
    setSelectedJobItems([]);
    setItemsLoading(true);

    try {
      const res = await getJobDetails(job.id);
      if (res?.status === "SUCCESS" && res.data?.priceItems) {
        setSelectedJobItems(res.data.priceItems);
      } else {
        setSelectedJobItems([]);
        Alert.alert("No Items", "No price items found for this job.");
      }
    } catch (err) {
      setSelectedJobItems([]);
      Alert.alert("Error", "Failed to fetch job items.");
      console.warn("[Job Details Error]", err?.message || err);
    } finally {
      setItemsLoading(false);
    }
  };

  // ---------- Job Card ----------
  const renderJobItem = ({ item }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "POSTED" ? "#007bff20" : "#28a74520",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: item.status === "POSTED" ? "#007bff" : "#28a745" },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.jobDetails}>
        <View style={styles.jobRow}>
          <Ionicons name="briefcase-outline" size={16} color="#555" />
          <Text style={styles.jobInfo}>{item.category || "No Category"}</Text>
        </View>

        <View style={styles.jobRow}>
          <Ionicons name="location-outline" size={16} color="#555" />
          <Text style={styles.jobInfo}>
            {item.addressLabel || "No Address"}
          </Text>
        </View>

        <View style={styles.jobRow}>
          <Ionicons name="calendar-outline" size={16} color="#555" />
          <Text style={styles.jobInfo}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {item.status === "POSTED" && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#007bff" }]}
            onPress={() => handleOpenUpdate(item)}
          >
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={styles.actionText}>Update</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#e74c3c" }]}
            onPress={() => handleDeleteJob(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#fff" />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#28a745" }]}
            onPress={() => handleViewItems(item)}
          >
            <Ionicons name="eye-outline" size={16} color="#fff" />
            <Text style={styles.actionText}>View Items</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // ---------- Update Modal Save ----------
  const handleSaveUpdate = async () => {
    if (
      !title ||
      !description ||
      !categoryCode ||
      (jobType === "PHYSICAL" && !addressId)
    ) {
      return Alert.alert("Validation", "All required fields must be filled.");
    }

    try {
      const payload = {
        title,
        description,
        categoryCode: Number(categoryCode),
        amountPaise: Number(amountPaise),
        deadline: deadline.toISOString(),
        addressId: jobType === "PHYSICAL" ? Number(addressId) : null,
        jobType,
      };
      const res = await updatePosterJob(selectedJob.id, payload);

      if (res.status === "SUCCESS") {
        for (const item of priceItems) {
          await addJobPriceItem(selectedJob.id, {
            label: item.label,
            description: item.description || "",
            priceRupees: item.priceRupees,
          });
        }
        Alert.alert("✅ Updated", "Job and price items updated successfully");
        setUpdateModalVisible(false);
        loadJobs(jobStatusFilter);
      } else {
        Alert.alert("Error", res.message || "Failed to update job");
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  if (loading)
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#0b78ff" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: StatusBar.currentHeight || 0 }]}
    >
      <StatusBar
        translucent
        backgroundColor="#111827"
        barStyle="light-content"
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.iconBtn}>
            <Ionicons name="menu" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Poster Dashboard</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* FlatList */}
      <FlatList
        data={jobs}
        keyExtractor={(item, i) => item.id?.toString() || String(i)}
        renderItem={renderJobItem}
        refreshing={refreshing}
        onRefresh={() => loadJobs(jobStatusFilter)}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>
              Welcome {profile?.name?.split(" ")[0] || ""} 👋
            </Text>

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

            <Text style={styles.sectionHeader}>📋 Your Job Posts</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("CreateJobScreen")}
              style={{
                marginRight: 14,
                paddingHorizontal: 10,
                paddingVertical: 6,
                backgroundColor: "#0b78ff",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                + Create Job
              </Text>
            </TouchableOpacity>
          </>
        }
      />

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closeSidebar}
          />
        </Animated.View>
      )}

      {/* Sidebar */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
      >
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Menu</Text>
          <TouchableOpacity onPress={closeSidebar}>
            <Ionicons name="close" size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            closeSidebar();
            navigation.navigate("PosterDashboard");
          }}
        >
          <Ionicons name="home-outline" size={20} color="#2563eb" />
          <Text style={styles.menuText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            closeSidebar();
            navigation.navigate("PosterProfileView");
          }}
        >
          <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
          <Text style={styles.menuText}>View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            closeSidebar();
            navigation.navigate("PosterProfileEdit");
          }}
        >
          <MaterialIcons name="edit" size={20} color="#2563eb" />
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            closeSidebar();
            navigation.navigate("PosterKycUpload");
          }}
        >
          <Ionicons name="document-text-outline" size={20} color="#2563eb" />
          <Text style={styles.menuText}>Upload KYC</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={styles.logoutMenu} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={[styles.menuText, { color: "#ef4444" }]}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ---------- Update Modal ---------- */}
      <Modal
        animationType="slide"
        transparent
        visible={updateModalVisible}
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <ScrollView
            style={{ backgroundColor: "#fff", borderRadius: 12, padding: 20 }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
              Update Job
            </Text>
            {/* Input fields can go here */}
            <TouchableOpacity style={styles.addBtn} onPress={handleSaveUpdate}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Update Job
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.addBtn,
                { backgroundColor: "#ccc", marginTop: 10 },
              ]}
              onPress={() => setUpdateModalVisible(false)}
            >
              <Text style={{ color: "#333", fontWeight: "700" }}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* ---------- View Items Modal ---------- */}
      <Modal
        animationType="slide"
        transparent
        visible={viewItemsModalVisible}
        onRequestClose={() => setViewItemsModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 20,
              maxHeight: height * 0.7,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
              Job Items
            </Text>
            {itemsLoading ? (
              <ActivityIndicator
                size="large"
                color="#0b78ff"
                style={{ marginVertical: 20 }}
              />
            ) : selectedJobItems.length === 0 ? (
              <Text style={{ textAlign: "center", marginVertical: 20 }}>
                No items available
              </Text>
            ) : (
              <ScrollView>
                {selectedJobItems.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: "#eee",
                      paddingVertical: 10,
                    }}
                  >
                    <Text style={{ fontWeight: "700" }}>
                      {item.label || item.name}
                    </Text>
                    {item.description || item.desc ? (
                      <Text style={{ color: "#555", marginTop: 2 }}>
                        {item.description || item.desc}
                      </Text>
                    ) : null}
                    <Text style={{ color: "#111", marginTop: 2 }}>
                      Price: ₹{item.priceRupees || item.amount}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity
              onPress={() => setViewItemsModalVisible(false)}
              style={{
                marginTop: 12,
                backgroundColor: "#0b78ff",
                padding: 12,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    height: 60,
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  iconBtn: { marginRight: 10 },
  topTitle: { color: "#fff", fontWeight: "700", fontSize: 18 },
  header: { fontSize: 22, fontWeight: "700", marginVertical: 14 },
  filterContainer: { flexDirection: "row", marginBottom: 16 },
  filterBtn: { padding: 8, marginRight: 8, borderRadius: 8 },
  sectionHeader: { fontSize: 18, fontWeight: "700", marginVertical: 8 },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  jobTitle: { fontSize: 16, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontWeight: "700", fontSize: 12 },
  jobDetails: { marginBottom: 8 },
  jobRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  jobInfo: { marginLeft: 6, color: "#555" },
  actionRow: { flexDirection: "row", justifyContent: "space-between" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  actionText: { color: "#fff", marginLeft: 4, fontWeight: "700" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "#000",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: width * 0.72,
    backgroundColor: "#fff",
    zIndex: 20,
    padding: 20,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  sidebarTitle: { fontSize: 22, fontWeight: "700" },
  menuItem: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  logoutMenu: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  addBtn: {
    marginTop: 12,
    backgroundColor: "#0b78ff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});

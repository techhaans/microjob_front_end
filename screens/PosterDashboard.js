// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   ScrollView,
//   Animated,
//   Dimensions,
//   SafeAreaView,
//   StatusBar,
//   Modal,
//   TextInput,
//   Platform,
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
// import { getJobDetails } from "../api/doer"; // fetch full job details

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
//   const [deadline, setDeadline] = useState(null);
//   const [addressId, setAddressId] = useState("");
//   const [jobType, setJobType] = useState("PHYSICAL");
//   const [priceItems, setPriceItems] = useState([]); // local price items (existing + new)

//   // ---------- New Price Item (local) ----------
//   const [newItemLabel, setNewItemLabel] = useState("");
//   const [newItemDescription, setNewItemDescription] = useState("");
//   const [newItemPrice, setNewItemPrice] = useState("");

//   // ---------- View Items Modal ----------
//   const [viewItemsModalVisible, setViewItemsModalVisible] = useState(false);
//   const [selectedJobItems, setSelectedJobItems] = useState([]);
//   const [itemsLoading, setItemsLoading] = useState(false);

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

//   // // ---------- Update Modal Prefill ----------
//   // const handleOpenUpdate = (job) => {
//   //   setSelectedJob(job);
//   //   setTitle(job.title || "");
//   //   setDescription(job.description || "");
//   //   // keep amountPaise as string of paise (if backend uses paise)
//   //   setAmountPaise(job.amountPaise != null ? String(job.amountPaise) : "");
//   //   setDeadline(job.deadline ? new Date(job.deadline) : null);
//   //   setJobType(job.jobType || "PHYSICAL");
//   //   setCategoryCode(job.categoryCode != null ? String(job.categoryCode) : "");
//   //   setAddressId(job.addressId != null ? String(job.addressId) : "");
//   //   // merge existing price items (map to expected local shape)
//   //   setPriceItems(
//   //     (job.priceItems || []).map((it) => ({
//   //       label: it.label || it.name || "",
//   //       description: it.description || it.desc || "",
//   //       priceRupees: it.priceRupees != null ? it.priceRupees : it.amount || 0,
//   //     }))
//   //   );
//   //   setNewItemLabel("");
//   //   setNewItemDescription("");
//   //   setNewItemPrice("");
//   //   setUpdateModalVisible(true);
//   // };

//   const handleOpenUpdate = (job) => {
//     console.log("🚀 Job object received for update:", job);

//     setSelectedJob(job);

//     // Map API fields to modal state
//     setTitle(job.title || ""); // simple string
//     setDescription(job.description || job.job_description || ""); // try alternate key
//     setAmountPaise(
//       job.amountPaise != null
//         ? String(job.amountPaise)
//         : job.amount != null
//         ? String(job.amount)
//         : ""
//     );

//     setDeadline(job.deadline ? new Date(job.deadline) : null);

//     setJobType(job.jobType || job.job_type || "PHYSICAL");

//     // Category: could be nested object
//     setCategoryCode(
//       job.categoryCode != null
//         ? String(job.categoryCode)
//         : job.category?.code != null
//         ? String(job.category.code)
//         : ""
//     );

//     // Address: could be nested object
//     setAddressId(
//       job.addressId != null
//         ? String(job.addressId)
//         : job.address?.id != null
//         ? String(job.address.id)
//         : ""
//     );

//     // Price Items: map correctly to local state
//     setPriceItems(
//       (job.priceItems || []).map((it) => ({
//         label: it.label || it.name || "",
//         description: it.description || it.desc || "",
//         priceRupees:
//           it.priceRupees != null
//             ? it.priceRupees
//             : it.amount != null
//             ? it.amount
//             : 0,
//       }))
//     );

//     // Clear new item inputs
//     setNewItemLabel("");
//     setNewItemDescription("");
//     setNewItemPrice("");

//     // Show modal
//     setUpdateModalVisible(true);
//   };

//   // ---------- View Items ----------
//   const handleViewItems = async (job) => {
//     setViewItemsModalVisible(true);
//     setSelectedJobItems([]);
//     setItemsLoading(true);
//     try {
//       const res = await getJobDetails(job.id);
//       if (res?.status === "SUCCESS" && res.data?.priceItems) {
//         setSelectedJobItems(res.data.priceItems);
//       } else {
//         setSelectedJobItems([]);
//       }
//     } catch (err) {
//       setSelectedJobItems([]);
//       console.warn("[Job Details Error]", err?.message || err);
//     } finally {
//       setItemsLoading(false);
//     }
//   };

//   // ---------- Add Price Item Locally ----------
//   const handleAddPriceItem = () => {
//     if (!newItemLabel || !newItemPrice) {
//       Alert.alert("Validation", "Please enter label and price.");
//       return;
//     }
//     const newItem = {
//       label: newItemLabel,
//       description: newItemDescription,
//       priceRupees: Number(newItemPrice),
//       // mark new items (we'll send all items on save; server will create duplicates if not careful,
//       // but we assume addJobPriceItem always creates new item for the job)
//     };
//     setPriceItems([...priceItems, newItem]);
//     setNewItemLabel("");
//     setNewItemDescription("");
//     setNewItemPrice("");
//   };

//   // ---------- Update Save (partial update) ----------
//   const handleSaveUpdate = async () => {
//     // allow partial updates; if you want minimum validation remove below or tweak it
//     if (!selectedJob) return Alert.alert("Error", "No job selected.");

//     try {
//       // Build minimal payload — only include fields that are non-empty and different from selectedJob
//       const payload = {};

//       if (title != null && title.trim() !== "" && title !== selectedJob.title)
//         payload.title = title.trim();
//       if (
//         description != null &&
//         description.trim() !== "" &&
//         description !== selectedJob.description
//       )
//         payload.description = description.trim();
//       if (
//         categoryCode != null &&
//         categoryCode !== "" &&
//         String(categoryCode) !== String(selectedJob.categoryCode)
//       )
//         payload.categoryCode = Number(categoryCode);
//       if (
//         amountPaise != null &&
//         amountPaise !== "" &&
//         Number(amountPaise) !== Number(selectedJob.amountPaise)
//       )
//         payload.amountPaise = Number(amountPaise);
//       if (deadline) {
//         // compare timestamps (if selectedJob.deadline exists)
//         const selDeadlineTs = selectedJob.deadline
//           ? new Date(selectedJob.deadline).toISOString()
//           : null;
//         const newDeadlineTs = deadline.toISOString();
//         if (newDeadlineTs !== selDeadlineTs) payload.deadline = newDeadlineTs;
//       }
//       if (jobType && jobType !== selectedJob.jobType) payload.jobType = jobType;
//       if (jobType === "PHYSICAL") {
//         if (addressId && String(addressId) !== String(selectedJob.addressId))
//           payload.addressId = Number(addressId);
//       } else {
//         // if switching to virtual, clear address
//         if (selectedJob.addressId) payload.addressId = null;
//       }

//       if (
//         Object.keys(payload).length === 0 &&
//         priceItems.length === (selectedJob.priceItems?.length || 0)
//       ) {
//         return Alert.alert(
//           "Nothing changed",
//           "Please modify a field or add price items before saving."
//         );
//       }

//       setLoading(true);
//       const res = await updatePosterJob(selectedJob.id, payload);

//       if (res?.status === "SUCCESS") {
//         // Add / sync price items — we simply call addJobPriceItem for each item
//         // If you have existing items and want to avoid duplicates you can implement remove/update logic on server
//         for (const item of priceItems) {
//           // If item looks like already created (no easy id), we still call addJobPriceItem.
//           // If your backend prevents duplicates, you'll need more logic here.
//           await addJobPriceItem(selectedJob.id, {
//             label: item.label,
//             description: item.description || "",
//             priceRupees: item.priceRupees,
//           });
//         }

//         Alert.alert("✅ Updated", "Job and price items updated successfully");
//         setUpdateModalVisible(false);
//         // refresh list
//         await loadJobs(jobStatusFilter);
//       } else {
//         Alert.alert("Error", res?.message || "Failed to update job");
//       }
//     } catch (err) {
//       console.warn("[handleSaveUpdate] ", err?.message || err);
//       Alert.alert("Error", "Something went wrong while updating the job.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------- Render job card ----------
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
//         <Text style={{ color: "#333", marginBottom: 8 }}>
//           {item.description}
//         </Text>

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

//   // ---------- Loader ----------
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

//         <View style={{ flexDirection: "row", alignItems: "center" }}>
//           <TouchableOpacity
//             onPress={() => navigation.navigate("CreateJobScreen")}
//             style={styles.createBtn}
//           >
//             <Text style={{ color: "#fff", fontWeight: "700" }}>Create Job</Text>
//           </TouchableOpacity>

//           <TouchableOpacity onPress={handleLogout} style={{ marginLeft: 12 }}>
//             <Ionicons name="log-out-outline" size={22} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Filters & Header */}
//       <View style={{ padding: 16 }}>
//         <Text style={styles.header}>
//           Welcome {profile?.name?.split(" ")[0] || ""} 👋
//         </Text>

//         <View style={styles.filterContainer}>
//           {["POSTED", "ACCEPTED"].map((status) => (
//             <TouchableOpacity
//               key={status}
//               style={[
//                 styles.filterBtn,
//                 {
//                   backgroundColor:
//                     jobStatusFilter === status ? "#0b78ff" : "#ddd",
//                 },
//               ]}
//               onPress={() => {
//                 setJobStatusFilter(status);
//                 loadJobs(status);
//               }}
//             >
//               <Text
//                 style={{
//                   color: jobStatusFilter === status ? "#fff" : "#333",
//                   fontWeight: "700",
//                 }}
//               >
//                 {status}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {/* Job List */}
//       <FlatList
//         data={jobs}
//         keyExtractor={(item, i) => item.id?.toString() || String(i)}
//         renderItem={renderJobItem}
//         refreshing={refreshing}
//         onRefresh={() => loadJobs(jobStatusFilter)}
//         contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
//         ListEmptyComponent={() => (
//           <View style={{ padding: 20 }}>
//             <Text style={{ textAlign: "center", color: "#555" }}>
//               No jobs found
//             </Text>
//           </View>
//         )}
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
//             keyboardShouldPersistTaps="handled"
//           >
//             <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
//               Update Job
//             </Text>

//             <Text style={styles.label}>Title</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter title"
//               value={title}
//               onChangeText={setTitle}
//             />

//             <Text style={styles.label}>Description</Text>
//             <TextInput
//               style={[styles.input, { height: 80 }]}
//               multiline
//               value={description}
//               onChangeText={setDescription}
//             />

//             <Text style={styles.label}>Amount (₹)</Text>
//             <TextInput
//               style={styles.input}
//               keyboardType="numeric"
//               placeholder="Enter amount"
//               value={amountPaise ? String(Number(amountPaise) / 100) : ""}
//               onChangeText={(val) =>
//                 setAmountPaise(val === "" ? "" : String(Number(val) * 100))
//               }
//             />

//             <Text style={styles.label}>Category</Text>
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               style={{ marginBottom: 8 }}
//             >
//               {categories.map((c) => (
//                 <TouchableOpacity
//                   key={c.code}
//                   onPress={() => setCategoryCode(String(c.code))}
//                   style={[
//                     styles.optionBtn,
//                     {
//                       backgroundColor:
//                         categoryCode === String(c.code) ? "#0b78ff" : "#ddd",
//                     },
//                   ]}
//                 >
//                   <Text
//                     style={{
//                       color: categoryCode === String(c.code) ? "#fff" : "#333",
//                     }}
//                   >
//                     {c.name}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>

//             <Text style={styles.label}>Job Type</Text>
//             <View style={{ flexDirection: "row", marginBottom: 10 }}>
//               {["PHYSICAL", "VIRTUAL"].map((type) => (
//                 <TouchableOpacity
//                   key={type}
//                   onPress={() => setJobType(type)}
//                   style={[
//                     styles.optionBtn,
//                     { backgroundColor: jobType === type ? "#0b78ff" : "#ddd" },
//                   ]}
// //                 >
// //                   <Text
// //                     style={{
// //                       color: jobType === type ? "#fff" : "#333",
// //                       fontWeight: "600",
// //                     }}
// //                   >
// //                     {type}
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </View>

// //             {jobType === "PHYSICAL" && (
// //               <>
// //                 <Text style={styles.label}>Select Address</Text>
// //                 <ScrollView
// //                   horizontal
// //                   showsHorizontalScrollIndicator={false}
// //                   style={{ marginBottom: 8 }}
// //                 >
// //                   {addresses.map((a) => (
// //                     <TouchableOpacity
// //                       key={a.id}
// //                       onPress={() => setAddressId(String(a.id))}
// //                       style={[
// //                         styles.optionBtn,
// //                         {
// //                           backgroundColor:
// //                             addressId === String(a.id) ? "#0b78ff" : "#ddd",
// //                         },
// //                       ]}
// //                     >
// //                       <Text
// //                         style={{
// //                           color: addressId === String(a.id) ? "#fff" : "#333",
// //                           fontWeight: "600",
// //                         }}
// //                       >
// //                         {a.label || `Address ${a.id}`}
// //                       </Text>
// //                     </TouchableOpacity>
// //                   ))}
// //                 </ScrollView>
// //               </>
// //             )}

// //             {/* ---------- Add Price Items (local) ---------- */}
// //             <Text style={[styles.label, { marginTop: 14 }]}>
// //               Add Price Items
// //             </Text>
// //             <TextInput
// //               style={styles.input}
// //               placeholder="Label"
// //               value={newItemLabel}
// //               onChangeText={setNewItemLabel}
// //             />
// //             <TextInput
// //               style={styles.input}
// //               placeholder="Description"
// //               value={newItemDescription}
// //               onChangeText={setNewItemDescription}
// //             />
// //             <TextInput
// //               style={styles.input}
// //               placeholder="Price (₹)"
// //               keyboardType="numeric"
// //               value={newItemPrice}
// //               onChangeText={setNewItemPrice}
// //             />
// //             <TouchableOpacity
// //               style={[styles.addBtn, { backgroundColor: "#28a745" }]}
// //               onPress={handleAddPriceItem}
// //             >
// //               <Text style={{ color: "#fff", fontWeight: "700" }}>
// //                 + Add Item
// //               </Text>
// //             </TouchableOpacity>

// //             {priceItems.length > 0 && (
// //               <View style={{ marginTop: 10 }}>
// //                 {priceItems.map((it, i) => (
// //                   <View
// //                     key={i}
// //                     style={{
// //                       marginBottom: 8,
// //                       padding: 8,
// //                       borderRadius: 8,
// //                       backgroundColor: "#fafafa",
// //                     }}
// //                   >
// //                     <Text style={{ fontWeight: "700" }}>{it.label}</Text>
// //                     {it.description ? (
// //                       <Text style={{ color: "#555" }}>{it.description}</Text>
// //                     ) : null}
// //                     <Text>₹{it.priceRupees}</Text>
// //                   </View>
// //                 ))}
// //               </View>
// //             )}

// //             {/* Save/Cancel */}
// //             <TouchableOpacity style={styles.addBtn} onPress={handleSaveUpdate}>
// //               <Text style={{ color: "#fff", fontWeight: "700" }}>
// //                 Update Job
// //               </Text>
// //             </TouchableOpacity>
// //             <TouchableOpacity
// //               style={[
// //                 styles.addBtn,
// //                 { backgroundColor: "#ccc", marginTop: 10 },
// //               ]}
// //               onPress={() => setUpdateModalVisible(false)}
// //             >
// //               <Text style={{ color: "#333", fontWeight: "700" }}>Cancel</Text>
// //             </TouchableOpacity>
// //           </ScrollView>
// //         </View>
// //       </Modal>

// //       {/* ---------- View Items Modal ---------- */}
// //       <Modal
// //         animationType="slide"
// //         transparent
// //         visible={viewItemsModalVisible}
// //         onRequestClose={() => setViewItemsModalVisible(false)}
// //       >
// //         <View
// //           style={{
// //             flex: 1,
// //             backgroundColor: "rgba(0,0,0,0.4)",
// //             justifyContent: "center",
// //             padding: 20,
// //           }}
// //         >
// //           <View
// //             style={{
// //               backgroundColor: "#fff",
// //               borderRadius: 12,
// //               padding: 20,
// //               maxHeight: height * 0.75,
// //             }}
// //           >
// //             <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
// //               Job Items
// //             </Text>

// //             {itemsLoading ? (
// //               <ActivityIndicator
// //                 size="large"
// //                 color="#0b78ff"
// //                 style={{ marginVertical: 20 }}
// //               />
// //             ) : selectedJobItems.length === 0 ? (
// //               <Text style={{ textAlign: "center", marginVertical: 20 }}>
// //                 No items available
// //               </Text>
// //             ) : (
// //               <ScrollView>
// //                 {selectedJobItems.map((item, index) => (
// //                   <View
// //                     key={index}
// //                     style={{
// //                       borderBottomWidth: 1,
// //                       borderBottomColor: "#eee",
// //                       paddingVertical: 10,
// //                     }}
// //                   >
// //                     <Text style={{ fontWeight: "700" }}>
// //                       {item.label || item.name}
// //                     </Text>
// //                     {item.description || item.desc ? (
// //                       <Text style={{ color: "#555", marginTop: 4 }}>
// //                         {item.description || item.desc}
// //                       </Text>
// //                     ) : null}
// //                     <Text style={{ color: "#111", marginTop: 4 }}>
// //                       Price: ₹{item.priceRupees || item.amount}
// //                     </Text>
// //                   </View>
// //                 ))}
// //               </ScrollView>
// //             )}

// //             <TouchableOpacity
// //               onPress={() => setViewItemsModalVisible(false)}
// //               style={{
// //                 marginTop: 12,
// //                 backgroundColor: "#0b78ff",
// //                 padding: 12,
// //                 borderRadius: 10,
// //                 alignItems: "center",
// //               }}
// //             >
// //               <Text style={{ color: "#fff", fontWeight: "700" }}>Close</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </Modal>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: "#f9f9f9" },
// //   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   topBar: {
// //     height: 60,
// //     backgroundColor: "#111827",
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     paddingHorizontal: 12,
// //   },
// //   iconBtn: { marginRight: 10 },
// //   topTitle: { color: "#fff", fontWeight: "700", fontSize: 18 },
// //   createBtn: {
// //     backgroundColor: "#0b78ff",
// //     paddingHorizontal: 12,
// //     paddingVertical: 8,
// //     borderRadius: 8,
// //   },
// //   header: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
// //   filterContainer: { flexDirection: "row", marginBottom: 8 },
// //   filterBtn: { padding: 15, marginRight: 8, borderRadius: 8, paddingLeft: 30 },
// //   jobCard: {
// //     backgroundColor: "#fff",
// //     borderRadius: 12,
// //     padding: 12,
// //     marginBottom: 14,
// //     shadowColor: "#000",
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.08,
// //     shadowRadius: 4,
// //     elevation: 2,
// //   },
// //   jobHeader: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     marginBottom: 8,
// //   },
// //   jobTitle: { fontSize: 16, fontWeight: "700" },
// //   statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
// //   statusText: { fontWeight: "700", fontSize: 12 },
// //   jobDetails: { marginBottom: 10 },
// //   jobRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
// //   jobInfo: { marginLeft: 6, color: "#555" },
// //   actionRow: { flexDirection: "row", justifyContent: "space-between" },
// //   actionBtn: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     padding: 8,
// //     borderRadius: 8,
// //     flex: 1,
// //     marginHorizontal: 4,
// //     justifyContent: "center",
// //   },
// //   actionText: { color: "#fff", marginLeft: 6, fontWeight: "700" },
// //   overlay: {
// //     position: "absolute",
// //     top: 0,
// //     left: 0,
// //     bottom: 0,
// //     right: 0,
// //     backgroundColor: "#000",
// //   },
// //   sidebar: {
// //     position: "absolute",
// //     top: 0,
// //     bottom: 0,
// //     left: 0,
// //     width: width * 0.72,
// //     backgroundColor: "#fff",
// //     zIndex: 20,
// //     padding: 20,
// //   },
// //   sidebarHeader: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: 24,
// //   },
// //   sidebarTitle: { fontSize: 22, fontWeight: "700" },
// //   menuItem: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
// //   menuText: {
// //     marginLeft: 12,
// //     fontSize: 16,
// //     fontWeight: "600",
// //     color: "#111827",
// //   },
// //   logoutMenu: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
// //   label: { marginTop: 10, fontWeight: "600", color: "#333" },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //     borderRadius: 8,
// //     paddingHorizontal: 10,
// //     paddingVertical: Platform.OS === "ios" ? 12 : 8,
// //     marginTop: 6,
// //     backgroundColor: "#fff",
// //   },
// //   optionBtn: {
// //     marginRight: 8,
// //     paddingHorizontal: 12,
// //     paddingVertical: 8,
// //     borderRadius: 8,
// //   },
// //   addBtn: {
// //     marginTop: 14,
// //     backgroundColor: "#0b78ff",
// //     padding: 12,
// //     borderRadius: 8,
// //     alignItems: "center",
// //   },
// // });
//
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import {
  fetchPosterProfile,
  logoutPoster,
  getPosterJobs,
  deletePosterJob,
  fetchCategories,
  fetchPosterAddresses,
  getPosterJobPriceItems,
  addPosterJobPriceItem,
  updatePosterJobPriceItem,
  deletePosterJobPriceItem,
} from "../api/poster";

const { width, height } = Dimensions.get("window");

export default function PosterDashboard({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [jobStatusFilter, setJobStatusFilter] = useState("POSTED");
  const [categories, setCategories] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const slideAnim = useRef(new Animated.Value(-width * 0.72)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [viewItemsModalVisible, setViewItemsModalVisible] = useState(false);
  const [selectedJobItems, setSelectedJobItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [modalJobTitle, setModalJobTitle] = useState("");
  const [activeJobId, setActiveJobId] = useState(null);

  const [editingItem, setEditingItem] = useState(null);
  const [itemLabel, setItemLabel] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => loadAll());
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
      console.warn("[Profile Error]", err);
      setProfile(null);
    }
  };

  const loadJobs = async (status = "POSTED") => {
    setRefreshing(true);
    try {
      const res = await getPosterJobs(0, 20, status);
      setJobs(res?.data || []);
    } catch (err) {
      console.warn("[Jobs Error]", err);
      setJobs([]);
    }
    setRefreshing(false);
  };

  const loadCategories = async () => {
    try {
      const res = await fetchCategories();
      if (res?.status === "SUCCESS" && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.warn("[Categories Error]", err);
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await fetchPosterAddresses();
      if (res?.status === "SUCCESS" && Array.isArray(res.data)) {
        setAddresses(res.data);
      }
    } catch (err) {
      console.warn("[Addresses Error]", err);
    }
  };

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

  const toggleSidebar = () => {
    sidebarOpen ? closeSidebar() : openSidebar();
  };

  const handleLogout = async () => {
    try {
      await logoutPoster();
      navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
    } catch (err) {
      Alert.alert("Error", "Logout failed.");
    }
  };

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

  const handleViewItems = async (job) => {
    setViewItemsModalVisible(true);
    setSelectedJobItems([]);
    setItemsLoading(true);
    setModalJobTitle(job.title || "Job Items");
    setActiveJobId(job.id);
    setEditingItem(null);
    setItemLabel("");
    setItemDescription("");
    setItemPrice("");

    try {
      const res = await getPosterJobPriceItems(job.id);
      const items = res?.data?.priceItems || [];
      setSelectedJobItems(items);
    } catch (err) {
      console.warn("[Job Price Items Error]", err);
      setSelectedJobItems([]);
    }

    setItemsLoading(false);
  };

  const loadJobItems = async (jobId) => {
    setItemsLoading(true);
    try {
      const res = await getPosterJobPriceItems(jobId);
      setSelectedJobItems(res?.data?.priceItems || []);
    } catch (err) {
      console.warn("[Reload Items Error]", err);
      setSelectedJobItems([]);
    }
    setItemsLoading(false);
  };

  const handleAddOrUpdateItem = async () => {
    if (!itemLabel.trim() || !itemPrice.trim()) {
      Alert.alert("Error", "Label and Price are required");
      return;
    }

    const priceNum = parseFloat(itemPrice);
    if (isNaN(priceNum)) {
      Alert.alert("Error", "Price must be a valid number");
      return;
    }

    const payload = {
      label: itemLabel.trim(),
      description: itemDescription.trim(),
      priceRupees: priceNum,
      totalPriceRupees: 0, // added this field
    };

    try {
      if (editingItem) {
        await updatePosterJobPriceItem(activeJobId, editingItem.id, payload);
      } else {
        await addPosterJobPriceItem(activeJobId, payload);
      }
      setItemLabel("");
      setItemDescription("");
      setItemPrice("");
      setEditingItem(null);
      loadJobItems(activeJobId);
    } catch (err) {
      console.warn("[Add/Update Item Error]", err);
      Alert.alert("Error", "Failed to save item");
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemLabel(item.label);
    setItemDescription(item.description);
    setItemPrice(item.priceRupees?.toString() || "");
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deletePosterJobPriceItem(activeJobId, itemId);
      if (editingItem && editingItem.id === itemId) {
        setEditingItem(null);
        setItemLabel("");
        setItemDescription("");
        setItemPrice("");
      }
      loadJobItems(activeJobId);
    } catch (err) {
      console.warn("[Delete Item Error]", err);
      Alert.alert("Error", "Failed to delete item");
    }
  };

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
        <Text style={{ color: "#333", marginBottom: 8 }}>
          {item.description}
        </Text>

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
          <Ionicons name="cash-outline" size={16} color="#555" />
          <Text style={[styles.jobInfo, { fontWeight: "700", color: "#000" }]}>
            ₹ {item.totalPriceRupees || 0}
          </Text>
        </View>

        <View style={styles.jobRow}>
          <Ionicons name="calendar-outline" size={16} color="#555" />
          <Text style={styles.jobInfo}>
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : ""}
          </Text>
        </View>
      </View>

      {item.status === "POSTED" && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#e74c3c" }]}
            onPress={() => handleDeleteJob(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#fff" />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#0b78ff" }]}
            onPress={() => handleViewItems(item)}
          >
            <Ionicons name="list-outline" size={16} color="#fff" />
            <Text style={styles.actionText}>Items</Text>
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
    <SafeAreaView
      style={[styles.container, { paddingTop: StatusBar.currentHeight || 0 }]}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.iconBtn}>
            <Ionicons name="menu" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Poster Dashboard</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateJobScreen")}
            style={styles.createBtn}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Create Job</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={{ marginLeft: 12 }}>
            <Ionicons name="log-out-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting + Filters */}
      <View style={{ padding: 16 }}>
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
      </View>

      {/* Job List */}
      <FlatList
        data={jobs}
        keyExtractor={(item, i) => item.id?.toString() || String(i)}
        renderItem={renderJobItem}
        refreshing={refreshing}
        onRefresh={() => loadJobs(jobStatusFilter)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ListEmptyComponent={() => (
          <View style={{ padding: 20 }}>
            <Text style={{ textAlign: "center", color: "#555" }}>
              No jobs found
            </Text>
          </View>
        )}
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

      {/* Items Modal */}
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
              maxHeight: height * 0.85,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
              {modalJobTitle}
            </Text>

            {itemsLoading ? (
              <ActivityIndicator
                size="large"
                color="#0b78ff"
                style={{ marginVertical: 20 }}
              />
            ) : (
              <>
                {selectedJobItems.length === 0 ? (
                  <Text style={{ textAlign: "center", marginVertical: 20 }}>
                    No items available
                  </Text>
                ) : (
                  <ScrollView
                    style={{ maxHeight: height * 0.4, marginBottom: 12 }}
                  >
                    {selectedJobItems.map((item, index) => (
                      <TouchableOpacity
                        key={item.id || index}
                        onPress={() =>
                          Alert.alert(
                            "Choose Action",
                            `What do you want to do with "${item.label}"?`,
                            [
                              {
                                text: "Edit",
                                onPress: () => handleEditItem(item),
                              },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: () => {
                                  Alert.alert(
                                    "Confirm Delete",
                                    "Are you sure you want to delete this item?",
                                    [
                                      { text: "Cancel", style: "cancel" },
                                      {
                                        text: "Delete",
                                        style: "destructive",
                                        onPress: () =>
                                          handleDeleteItem(item.id),
                                      },
                                    ]
                                  );
                                },
                              },
                              { text: "Cancel", style: "cancel" },
                            ]
                          )
                        }
                        style={{
                          borderBottomWidth: 1,
                          borderBottomColor: "#eee",
                          paddingVertical: 8,
                        }}
                      >
                        <Text style={{ fontWeight: "700", fontSize: 16 }}>
                          {item.label}
                        </Text>
                        <Text style={{ color: "#555" }}>
                          {item.description}
                        </Text>
                        <Text
                          style={{
                            color: "#333",
                            fontWeight: "700",
                            marginTop: 2,
                          }}
                        >
                          ₹ {item.priceRupees}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                <TextInput
                  placeholder="Label"
                  value={itemLabel}
                  onChangeText={setItemLabel}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Description"
                  value={itemDescription}
                  onChangeText={setItemDescription}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Price (₹)"
                  value={itemPrice}
                  onChangeText={setItemPrice}
                  keyboardType="numeric"
                  style={styles.input}
                />

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#0b78ff" }]}
                  onPress={handleAddOrUpdateItem}
                >
                  <Text style={[styles.actionText, { color: "#fff" }]}>
                    {editingItem ? "Update Item" : "Add Item"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#ccc" }]}
                  onPress={() => setViewItemsModalVisible(false)}
                >
                  <Text style={[styles.actionText]}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    backgroundColor: "#0b78ff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  iconBtn: { padding: 6 },
  topTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginLeft: 8 },
  createBtn: {
    backgroundColor: "#28a745",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  filterContainer: { flexDirection: "row", gap: 12 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  jobHeader: { flexDirection: "row", justifyContent: "space-between" },
  jobTitle: { fontWeight: "700", fontSize: 16 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  jobDetails: { marginTop: 8 },
  jobRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 4,
  },
  jobInfo: { color: "#555" },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: { fontWeight: "700" },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    width: width * 0.72,
    height: "100%",
    backgroundColor: "#fff",
    zIndex: 5,
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: "#000",
    zIndex: 4,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sidebarTitle: { fontSize: 20, fontWeight: "700" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  menuText: { fontSize: 16, fontWeight: "500", color: "#2563eb" },
  logoutMenu: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
});

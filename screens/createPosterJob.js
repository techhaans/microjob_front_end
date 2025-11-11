// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   Keyboard,
//   Platform,
// } from "react-native";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { createPosterJob, fetchCategories, fetchPosterAddresses } from "../api/poster";

// export default function CreateJobScreen({ navigation }) {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryCode, setCategoryCode] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [amountPaise, setAmountPaise] = useState("");
//   const [deadline, setDeadline] = useState(new Date());
//   const [addressId, setAddressId] = useState("");
//   const [addresses, setAddresses] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showPicker, setShowPicker] = useState(false);
//   const [loadingCategories, setLoadingCategories] = useState(true);
//   const [loadingAddresses, setLoadingAddresses] = useState(true);

//   // ✅ Fetch categories
//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const res = await fetchCategories();
//         if (res?.status === "SUCCESS" && res.data) {
//           setCategories(res.data); // array of { code, name }
//         } else {
//           Alert.alert("Error", res.message || "Failed to fetch categories");
//         }
//       } catch (err) {
//         console.error("Categories Fetch Error:", err);
//         Alert.alert("Error", "Failed to load categories");
//       } finally {
//         setLoadingCategories(false);
//       }
//     };
//     loadCategories();
//   }, []);

//   // ✅ Fetch addresses
//   useEffect(() => {
//     const loadAddresses = async () => {
//       try {
//         const res = await fetchPosterAddresses();
//         if (res?.status === "SUCCESS" && res.data) {
//           setAddresses(res.data);
//           // Auto-select if only one address
//           if (res.data.length === 1) {
//             setAddressId(String(res.data[0].id));
//           }
//         } else {
//           Alert.alert("Error", res.message || "Failed to load addresses");
//         }
//       } catch (err) {
//         //console.error("Addresses Fetch Error:", err);
//         Alert.alert("Error", "save address first");
//       } finally {
//         setLoadingAddresses(false);
//       }
//     };
//     loadAddresses();
//   }, []);

//   // ✅ Date picker handlers
//   const onChangeDate = (event, selectedDate) => {
//     if (Platform.OS === "android") setShowPicker(false);
//     if (selectedDate) setDeadline(selectedDate);
//   };

//   const handleOpenPicker = () => {
//     Keyboard.dismiss();
//     setShowPicker(true);
//   };

//   // ✅ Create job
//   const handleCreateJob = async () => {
//     if (
//       !title ||
//       !description ||
//       !categoryCode ||
//       !amountPaise ||
//       !deadline ||
//       !addressId
//     ) {
//       return Alert.alert("Validation Error", "Please fill all fields");
//     }

//     try {
//       setLoading(true);

//       const payload = {
//         title,
//         description,
//         categoryCode: Number(categoryCode),
//         amountPaise: Number(amountPaise),
//         deadline: deadline.toISOString(),
//         addressId: Number(addressId),
//       };

//       const res = await createPosterJob(payload);

//       if (res.status === "SUCCESS") {
//         Alert.alert("✅ Job Created", `Job ID: ${res.data.id}`, [
//           { text: "OK", onPress: () => navigation.goBack() },
//         ]);

//         // Reset fields
//         setTitle("");
//         setDescription("");
//         setCategoryCode("");
//         setAmountPaise("");
//         setDeadline(new Date());
//         setAddressId("");
//       } else {
//         Alert.alert("❌ Error", res.message || "Failed to create job");
//       }
//     } catch (err) {
//       console.error("Job Create Error:", err);
//       Alert.alert("❌ Error", "Something went wrong. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Loading state
//   if (loadingCategories || loadingAddresses)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#007bff" />
//         <Text>Loading data...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Create New Job</Text>

//       {/* ✅ Job Title */}
//       <TextInput
//         style={styles.input}
//         placeholder="Job Title"
//         value={title}
//         onChangeText={setTitle}
//       />

//       {/* ✅ Description */}
//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Description"
//         multiline
//         value={description}
//         onChangeText={setDescription}
//       />

//       {/* ✅ Category Selection */}
//       <View style={{ marginBottom: 15 }}>
//         <Text style={{ fontWeight: "700", marginBottom: 5 }}>
//           Select Category:
//         </Text>
//         {categories.map((cat) => (
//           <TouchableOpacity
//             key={cat.code}
//             style={[
//               styles.categoryItem,
//               categoryCode === String(cat.code) && {
//                 backgroundColor: "#007bff",
//               },
//             ]}
//             onPress={() => setCategoryCode(String(cat.code))}
//           >
//             <Text
//               style={{
//                 color: categoryCode === String(cat.code) ? "#fff" : "#000",
//               }}
//             >
//               {cat.name}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* ✅ Amount */}
//       <TextInput
//         style={styles.input}
//         placeholder="Amount (Paise)"
//         keyboardType="numeric"
//         value={amountPaise}
//         onChangeText={setAmountPaise}
//       />

//       {/* ✅ Deadline */}
//       <TouchableOpacity onPress={handleOpenPicker}>
//         <View pointerEvents="none">
//           <TextInput
//             style={styles.input}
//             placeholder="Select Deadline"
//             value={deadline ? deadline.toISOString().split("T")[0] : ""}
//             editable={false}
//           />
//         </View>
//       </TouchableOpacity>

//       {showPicker && (
//         <DateTimePicker
//           value={deadline || new Date()}
//           mode="date"
//           display="default"
//           onChange={onChangeDate}
//         />
//       )}

//       {/* ✅ Address Selection */}
//       <View style={{ marginBottom: 15 }}>
//         <Text style={{ fontWeight: "700", marginBottom: 5 }}>
//           Select Address:
//         </Text>

//         {addresses.length === 0 && (
//           <Text style={{ color: "gray" }}>
//             No saved addresses found. Please add one in your profile.
//           </Text>
//         )}

//         {addresses.map((addr) => (
//           <TouchableOpacity
//             key={addr.id}
//             style={[
//               styles.addressItem,
//               addressId === String(addr.id) && { backgroundColor: "#007bff" },
//             ]}
//             onPress={() => setAddressId(String(addr.id))}
//           >
//             <View
//               style={{ flexDirection: "row", justifyContent: "space-between" }}
//             >
//               <Text
//                 style={{
//                   color: addressId === String(addr.id) ? "#fff" : "#000",
//                   flexShrink: 1,
//                 }}
//               >
//                 {addr.label} — {addr.area} ({addr.pinCode})
//               </Text>
//               {addressId === String(addr.id) && (
//                 <Text style={{ color: "#fff", fontWeight: "bold" }}>✔</Text>
//               )}
//             </View>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* ✅ Submit Button */}
//       <TouchableOpacity
//         style={[styles.btn, loading && { backgroundColor: "gray" }]}
//         onPress={handleCreateJob}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.btnText}>Create Job</Text>
//         )}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 20, backgroundColor: "#f7f8fc" },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#007bff",
//     marginBottom: 20,
//   },
//   input: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 15,
//   },
//   btn: {
//     backgroundColor: "#007bff",
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryItem: {
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 5,
//   },
//   addressItem: {
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 5,
//   },
// });
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   Keyboard,
//   Platform,
// } from "react-native";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { createPosterJob, fetchCategories, fetchPosterAddresses } from "../api/poster";

// export default function CreateJobScreen({ navigation }) {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryCode, setCategoryCode] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [amountInRs, setAmountInRs] = useState("");
//   const [deadline, setDeadline] = useState(new Date());
//   const [addressId, setAddressId] = useState("");
//   const [addresses, setAddresses] = useState([]);
//   const [jobType, setJobType] = useState("PHYSICAL");
//   const [loading, setLoading] = useState(false);
//   const [showPicker, setShowPicker] = useState(false);
//   const [loadingCategories, setLoadingCategories] = useState(true);
//   const [loadingAddresses, setLoadingAddresses] = useState(true);

//   // Fetch categories
//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const res = await fetchCategories();
//         if (res?.status === "SUCCESS" && res.data) {
//           setCategories(res.data);
//         } else {
//           Alert.alert("Error", res.message || "Failed to fetch categories");
//         }
//       } catch (err) {
//         Alert.alert("Error", "Failed to load categories");
//       } finally {
//         setLoadingCategories(false);
//       }
//     };
//     loadCategories();
//   }, []);

//   // Fetch addresses
//   useEffect(() => {
//     const loadAddresses = async () => {
//       try {
//         const res = await fetchPosterAddresses();
//         if (res?.status === "SUCCESS" && res.data) {
//           setAddresses(res.data);
//           if (res.data.length === 1) setAddressId(String(res.data[0].id));
//         } else {
//           Alert.alert("Error", res.message || "Failed to load addresses");
//         }
//       } catch (err) {
//         Alert.alert("Error", "Save address first");
//       } finally {
//         setLoadingAddresses(false);
//       }
//     };
//     loadAddresses();
//   }, []);

//   const onChangeDate = (event, selectedDate) => {
//     if (Platform.OS === "android") setShowPicker(false);
//     if (selectedDate) setDeadline(selectedDate);
//   };

//   const handleOpenPicker = () => {
//     Keyboard.dismiss();
//     setShowPicker(true);
//   };

//   const handleCreateJob = async () => {
//     // Validation
//     if (!title.trim() || !description.trim() || !categoryCode || !amountInRs) {
//       return Alert.alert("Validation Error", "Please fill all required fields");
//     }

//     const parsedAmount = parseInt(amountInRs, 10);
//     if (isNaN(parsedAmount) || parsedAmount <= 0) {
//       return Alert.alert("Validation Error", "Enter a valid amount in Rs");
//     }

//     if (jobType === "PHYSICAL" && !addressId) {
//       return Alert.alert("Validation Error", "Please select an address");
//     }

//     const payload = {
//       title: title.trim(),
//       description: description.trim(),
//       categoryCode,
//       amountInRs: parsedAmount,
//       deadline: deadline.toISOString(),
//       addressId: jobType === "PHYSICAL" ? Number(addressId) : null,
//       jobType,
//     };

//     try {
//       setLoading(true);
//       const res = await createPosterJob(payload);

//       if (res.status === "SUCCESS") {
//         Alert.alert("✅ Job Created", `Job ID: ${res.data.id}`, [
//           { text: "OK", onPress: () => navigation.goBack() },
//         ]);

//         // Reset form
//         setTitle("");
//         setDescription("");
//         setCategoryCode("");
//         setAmountInRs("");
//         setDeadline(new Date());
//         setAddressId("");
//         setJobType("PHYSICAL");
//       } else {
//         Alert.alert("❌ Error", res.message || "Failed to create job");
//       }
//     } catch (err) {
//       console.error("Job Create Error:", err);
//       Alert.alert("❌ Error", "Something went wrong. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loadingCategories || loadingAddresses)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#007bff" />
//         <Text>Loading data...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Create New Job</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Job Title"
//         value={title}
//         onChangeText={setTitle}
//       />

//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Description"
//         multiline
//         value={description}
//         onChangeText={setDescription}
//       />

//       <View style={{ marginBottom: 15 }}>
//         <Text style={{ fontWeight: "700", marginBottom: 5 }}>Select Category:</Text>
//         {categories.map((cat) => (
//           <TouchableOpacity
//             key={cat.code}
//             style={[styles.categoryItem, categoryCode === String(cat.code) && { backgroundColor: "#007bff" }]}
//             onPress={() => setCategoryCode(String(cat.code))}
//           >
//             <Text style={{ color: categoryCode === String(cat.code) ? "#fff" : "#000" }}>{cat.name}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <TextInput
//         style={styles.input}
//         placeholder="Amount (in Rs)"
//         keyboardType="numeric"
//         value={amountInRs}
//         onChangeText={setAmountInRs}
//       />

//       <View style={{ marginBottom: 15 }}>
//         <Text style={{ fontWeight: "700", marginBottom: 5 }}>Job Type:</Text>
//         {["PHYSICAL", "REMOTE"].map((type) => (
//           <TouchableOpacity
//             key={type}
//             style={[styles.categoryItem, jobType === type && { backgroundColor: "#007bff" }]}
//             onPress={() => setJobType(type)}
//           >
//             <Text style={{ color: jobType === type ? "#fff" : "#000" }}>{type}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <TouchableOpacity onPress={handleOpenPicker}>
//         <View pointerEvents="none">
//           <TextInput
//             style={styles.input}
//             placeholder="Select Deadline"
//             value={deadline ? deadline.toISOString().split("T")[0] : ""}
//             editable={false}
//           />
//         </View>
//       </TouchableOpacity>

//       {showPicker && (
//         <DateTimePicker
//           value={deadline || new Date()}
//           mode="date"
//           display="default"
//           onChange={onChangeDate}
//         />
//       )}

//       {jobType === "PHYSICAL" && (
//         <View style={{ marginBottom: 15 }}>
//           <Text style={{ fontWeight: "700", marginBottom: 5 }}>Select Address:</Text>
//           {addresses.length === 0 && (
//             <Text style={{ color: "gray" }}>No saved addresses found. Please add one in your profile.</Text>
//           )}
//           {addresses.map((addr) => (
//             <TouchableOpacity
//               key={addr.id}
//               style={[styles.addressItem, addressId === String(addr.id) && { backgroundColor: "#007bff" }]}
//               onPress={() => setAddressId(String(addr.id))}
//             >
//               <Text style={{ color: addressId === String(addr.id) ? "#fff" : "#000" }}>
//                 {addr.label} — {addr.area} ({addr.pinCode})
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}

//       <TouchableOpacity
//         style={[styles.btn, loading && { backgroundColor: "gray" }]}
//         onPress={handleCreateJob}
//         disabled={loading}
//       >
//         {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Job</Text>}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 20, backgroundColor: "#f7f8fc" },
//   title: { fontSize: 22, fontWeight: "700", color: "#007bff", marginBottom: 20 },
//   input: { backgroundColor: "#fff", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#ddd", marginBottom: 15 },
//   btn: { backgroundColor: "#007bff", padding: 15, borderRadius: 8, alignItems: "center" },
//   btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryItem: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#ddd", marginBottom: 5 },
//   addressItem: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#ddd", marginBottom: 5 },
// });
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   Keyboard,
//   Platform,
// } from "react-native";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import {
//   createPosterJob,
//   fetchCategories,
//   fetchPosterAddresses,
//   fetchPosterProfile,
// } from "../api/poster";

// export default function CreateJobScreen({ navigation }) {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryCode, setCategoryCode] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [amountInRs, setAmountInRs] = useState("");
//   const [deadline, setDeadline] = useState(new Date());
//   const [addressId, setAddressId] = useState("");
//   const [addresses, setAddresses] = useState([]);
//   const [jobType, setJobType] = useState("PHYSICAL");
//   const [loading, setLoading] = useState(false);
//   const [showPicker, setShowPicker] = useState(false);
//   const [loadingCategories, setLoadingCategories] = useState(true);
//   const [loadingAddresses, setLoadingAddresses] = useState(true);

//   // ✅ Fetch categories
//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const res = await fetchCategories();
//         if (res?.status === "SUCCESS" && res.data) {
//           setCategories(res.data);
//         } else {
//           Alert.alert("Error", res.message || "Failed to fetch categories");
//         }
//       } catch (err) {
//         Alert.alert("Error", "Failed to load categories");
//       } finally {
//         setLoadingCategories(false);
//       }
//     };
//     loadCategories();
//   }, []);

//   // ✅ Fetch addresses
//   useEffect(() => {
//     const loadAddresses = async () => {
//       try {
//         const res = await fetchPosterAddresses();
//         if (res?.status === "SUCCESS" && res.data) {
//           setAddresses(res.data);
//           if (res.data.length === 1) setAddressId(String(res.data[0].id));
//         } else {
//           Alert.alert("Error", res.message || "Failed to load addresses");
//         }
//       } catch (err) {
//         Alert.alert("Error", "Save address first");
//       } finally {
//         setLoadingAddresses(false);
//       }
//     };
//     loadAddresses();
//   }, []);

//   const onChangeDate = (event, selectedDate) => {
//     if (Platform.OS === "android") setShowPicker(false);
//     if (selectedDate) setDeadline(selectedDate);
//   };

//   const handleOpenPicker = () => {
//     Keyboard.dismiss();
//     setShowPicker(true);
//   };

//   // ✅ Validate KYC + Create Job
//   const handleCreateJob = async () => {
//     try {
//       setLoading(true);

//       // ✅ Fetch live KYC status before posting
//       const kycRes = await fetchPosterProfile();
//       const kycStatus =
//         kycRes?.data?.kycStatus ??
//         kycRes?.data?.KycStatus ??
//         false;
//       const kycRejectReason =
//         kycRes?.data?.kycRejectReason ||
//         kycRes?.data?.rejectionResponse ||
//         "";

//       // ✅ Handle KYC states
//       if (kycStatus === false || kycStatus === "false") {
//         setLoading(false);
//         return Alert.alert("KYC Required", "Please complete your KYC before posting a job.");
//       }

//       if (kycStatus === "PENDING") {
//         setLoading(false);
//         return Alert.alert("KYC Pending", "Your KYC is still pending. Please wait for verification.");
//       }

//       if (kycStatus === "REJECTED") {
//         setLoading(false);
//         return Alert.alert(
//           "KYC Rejected",
//           `Your KYC was rejected.\nReason: ${kycRejectReason || "Not provided."}`
//         );
//       }

//       // ✅ Proceed only if verified (true or VERIFIED)
//       if (kycStatus !== true && kycStatus !== "VERIFIED") {
//         setLoading(false);
//         return Alert.alert("KYC Error", "Invalid KYC status. Please verify your profile.");
//       }

//       // ✅ Validate form fields
//       if (!title.trim() || !description.trim() || !categoryCode || !amountInRs) {
//         setLoading(false);
//         return Alert.alert("Validation Error", "Please fill all required fields");
//       }

//       const parsedAmount = parseInt(amountInRs, 10);
//       if (isNaN(parsedAmount) || parsedAmount <= 0) {
//         setLoading(false);
//         return Alert.alert("Validation Error", "Enter a valid amount in Rs");
//       }

//       if (jobType === "PHYSICAL" && !addressId) {
//         setLoading(false);
//         return Alert.alert("Validation Error", "Please select an address");
//       }

//       // ✅ Prepare payload
//       const payload = {
//         title: title.trim(),
//         description: description.trim(),
//         categoryCode,
//         amountInRs: parsedAmount,
//         deadline: deadline.toISOString(),
//         addressId: jobType === "PHYSICAL" ? Number(addressId) : null,
//         jobType,
//       };

//       // ✅ Create job
//       const res = await createPosterJob(payload);

//       if (res.status === "SUCCESS") {
//         Alert.alert("✅ Job Created", `Job ID: ${res.data.id}`, [
//           { text: "OK", onPress: () => navigation.goBack() },
//         ]);

//         // Reset form
//         setTitle("");
//         setDescription("");
//         setCategoryCode("");
//         setAmountInRs("");
//         setDeadline(new Date());
//         setAddressId("");
//         setJobType("PHYSICAL");
//       } else {
//         Alert.alert("❌ Error", res.message || "Failed to create job");
//       }
//     } catch (err) {
//       console.error("Job Create Error:", err);
//       Alert.alert("❌ Error", "Something went wrong. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loadingCategories || loadingAddresses)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#007bff" />
//         <Text>Loading data...</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Create New Job</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Job Title"
//         value={title}
//         onChangeText={setTitle}
//       />

//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Description"
//         multiline
//         value={description}
//         onChangeText={setDescription}
//       />

//       <View style={{ marginBottom: 15 }}>
//         <Text style={{ fontWeight: "700", marginBottom: 5 }}>Select Category:</Text>
//         {categories.map((cat) => (
//           <TouchableOpacity
//             key={cat.code}
//             style={[
//               styles.categoryItem,
//               categoryCode === String(cat.code) && { backgroundColor: "#007bff" },
//             ]}
//             onPress={() => setCategoryCode(String(cat.code))}
//           >
//             <Text style={{ color: categoryCode === String(cat.code) ? "#fff" : "#000" }}>
//               {cat.name}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <TextInput
//         style={styles.input}
//         placeholder="Amount (in Rs)"
//         keyboardType="numeric"
//         value={amountInRs}
//         onChangeText={setAmountInRs}
//       />

//       <View style={{ marginBottom: 15 }}>
//         <Text style={{ fontWeight: "700", marginBottom: 5 }}>Job Type:</Text>
//         {["PHYSICAL", "REMOTE"].map((type) => (
//           <TouchableOpacity
//             key={type}
//             style={[
//               styles.categoryItem,
//               jobType === type && { backgroundColor: "#007bff" },
//             ]}
//             onPress={() => setJobType(type)}
//           >
//             <Text style={{ color: jobType === type ? "#fff" : "#000" }}>{type}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <TouchableOpacity onPress={handleOpenPicker}>
//         <View pointerEvents="none">
//           <TextInput
//             style={styles.input}
//             placeholder="Select Deadline"
//             value={deadline ? deadline.toISOString().split("T")[0] : ""}
//             editable={false}
//           />
//         </View>
//       </TouchableOpacity>

//       {showPicker && (
//         <DateTimePicker
//           value={deadline || new Date()}
//           mode="date"
//           display="default"
//           onChange={onChangeDate}
//         />
//       )}

//       {jobType === "PHYSICAL" && (
//         <View style={{ marginBottom: 15 }}>
//           <Text style={{ fontWeight: "700", marginBottom: 5 }}>Select Address:</Text>
//           {addresses.length === 0 && (
//             <Text style={{ color: "gray" }}>
//               No saved addresses found. Please add one in your profile.
//             </Text>
//           )}
//           {addresses.map((addr) => (
//             <TouchableOpacity
//               key={addr.id}
//               style={[
//                 styles.addressItem,
//                 addressId === String(addr.id) && { backgroundColor: "#007bff" },
//               ]}
//               onPress={() => setAddressId(String(addr.id))}
//             >
//               <Text style={{ color: addressId === String(addr.id) ? "#fff" : "#000" }}>
//                 {addr.label} — {addr.area} ({addr.pinCode})
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}

//       <TouchableOpacity
//         style={[styles.btn, loading && { backgroundColor: "gray" }]}
//         onPress={handleCreateJob}
//         disabled={loading}
//       >
//         {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Job</Text>}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 20, backgroundColor: "#f7f8fc" },
//   title: { fontSize: 22, fontWeight: "700", color: "#007bff", marginBottom: 20 },
//   input: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 15,
//   },
//   btn: {
//     backgroundColor: "#007bff",
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryItem: {
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 5,
//   },
//   addressItem: {
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 5,
//   },
// });
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   Keyboard,
//   Platform,
// } from "react-native";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import {
//   createPosterJob,
//   fetchCategories,
//   fetchPosterAddresses,
//   fetchPosterProfile,
// } from "../api/poster";

// export default function CreateJobScreen({ navigation }) {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryCode, setCategoryCode] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [amountInRs, setAmountInRs] = useState("");
//   const [deadline, setDeadline] = useState(new Date());
//   const [addressId, setAddressId] = useState("");
//   const [addresses, setAddresses] = useState([]);
//   const [jobType, setJobType] = useState("PHYSICAL");
//   const [loading, setLoading] = useState(false);
//   const [showPicker, setShowPicker] = useState(false);
//   const [loadingCategories, setLoadingCategories] = useState(true);
//   const [loadingAddresses, setLoadingAddresses] = useState(true);

//   // ✅ Fetch categories on mount
//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const res = await fetchCategories();
//         if (res?.status === "SUCCESS" && Array.isArray(res.data)) {
//           setCategories(res.data);
//         } else {
//           Alert.alert("Error", res?.message || "Failed to fetch categories.");
//         }
//       } catch (err) {
//         console.error("Category Fetch Error:", err);
//         Alert.alert("Error", "Failed to load categories.");
//       } finally {
//         setLoadingCategories(false);
//       }
//     };
//     loadCategories();
//   }, []);

//   // ✅ Fetch addresses on mount
//   useEffect(() => {
//     const loadAddresses = async () => {
//       try {
//         const res = await fetchPosterAddresses();
//         if (res?.status === "SUCCESS" && Array.isArray(res.data)) {
//           setAddresses(res.data);
//           if (res.data.length === 1) setAddressId(String(res.data[0].id));
//         } else {
//           Alert.alert("Error", res?.message || "Failed to fetch addresses.");
//         }
//       } catch (err) {
//         console.error("Address Fetch Error:", err);
//         Alert.alert("Error", "Please save at least one address first.");
//       } finally {
//         setLoadingAddresses(false);
//       }
//     };
//     loadAddresses();
//   }, []);

//   const onChangeDate = (event, selectedDate) => {
//     if (Platform.OS === "android") setShowPicker(false);
//     if (selectedDate) setDeadline(selectedDate);
//   };

//   const handleOpenPicker = () => {
//     Keyboard.dismiss();
//     setShowPicker(true);
//   };

//   // ✅ Validate KYC and Create Job
//   const handleCreateJob = async () => {
//     try {
//       setLoading(true);

//       // Fetch KYC
//       const kycRes = await fetchPosterProfile();
//       const kycStatus =
//         kycRes?.data?.kycStatus || kycRes?.data?.KycStatus || false;
//       const rejectReason =
//         kycRes?.data?.kycRejectReason || kycRes?.data?.rejectionResponse || "";

//       if (!kycStatus || kycStatus === "false") {
//         return Alert.alert(
//           "KYC Required",
//           "Please complete your KYC before posting."
//         );
//       }
//       if (kycStatus === "PENDING") {
//         return Alert.alert("KYC Pending", "Your KYC is still under review.");
//       }
//       if (kycStatus === "REJECTED") {
//         return Alert.alert(
//           "KYC Rejected",
//           `Reason: ${rejectReason || "Not provided"}`
//         );
//       }

//       // ✅ Validate fields
//       if (
//         !title.trim() ||
//         !description.trim() ||
//         !categoryCode ||
//         !amountInRs
//       ) {
//         return Alert.alert(
//           "Validation Error",
//           "Please fill all required fields."
//         );
//       }

//       const parsedAmount = parseInt(amountInRs, 10);
//       if (isNaN(parsedAmount) || parsedAmount <= 0) {
//         return Alert.alert("Validation Error", "Enter a valid amount.");
//       }

//       if (jobType === "PHYSICAL" && !addressId) {
//         return Alert.alert(
//           "Validation Error",
//           "Select an address for physical jobs."
//         );
//       }

//       // ✅ Prepare payload (backend expects categoryCode or categoryId)
//       const payload = {
//         title: title.trim(),
//         description: description.trim(),
//         categoryCode, // or change to categoryId if backend expects numeric
//         amountInRs: parsedAmount,
//         deadline: deadline.toISOString(),
//         jobType,
//         addressId: jobType === "PHYSICAL" ? Number(addressId) : null,
//       };

//       const res = await createPosterJob(payload);

//       if (res?.status === "SUCCESS") {
//         Alert.alert("✅ Success", "Job created successfully!", [
//           { text: "OK", onPress: () => navigation.goBack() },
//         ]);
//         // Reset
//         setTitle("");
//         setDescription("");
//         setCategoryCode("");
//         setAmountInRs("");
//         setDeadline(new Date());
//         setAddressId("");
//         setJobType("PHYSICAL");
//       } else {
//         Alert.alert("❌ Error", res?.message || "Failed to create job.");
//       }
//     } catch (err) {
//       console.error("Create Job Error:", err);
//       Alert.alert("Error", "Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loadingCategories || loadingAddresses) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#007bff" />
//         <Text>Loading data...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Create New Job</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Job Title"
//         value={title}
//         onChangeText={setTitle}
//       />

//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Description"
//         multiline
//         value={description}
//         onChangeText={setDescription}
//       />

//       {/* Categories */}
//       <View style={{ marginBottom: 15 }}>
//         <Text style={{ fontWeight: "700", marginBottom: 5 }}>
//           Select Category:
//         </Text>
//         {categories.map((cat) => (
//           <TouchableOpacity
//             key={cat.code}
//             style={[
//               styles.categoryItem,
//               categoryCode === String(cat.code) && {
//                 backgroundColor: "#007bff",
//               },
//             ]}
//             onPress={() => setCategoryCode(String(cat.code))}
//           >
//             <Text
//               style={{
//                 color: categoryCode === String(cat.code) ? "#fff" : "#000",
//               }}
//             >
//               {cat.name}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <TextInput
//         style={styles.input}
//         placeholder="Amount (in ₹)"
//         keyboardType="numeric"
//         value={amountInRs}
//         onChangeText={setAmountInRs}
//       />

//       {/* Job Type */}
//       <View style={{ marginBottom: 15 }}>
//         <Text style={{ fontWeight: "700", marginBottom: 5 }}>Job Type:</Text>
//         {["PHYSICAL", "REMOTE"].map((type) => (
//           <TouchableOpacity
//             key={type}
//             style={[
//               styles.categoryItem,
//               jobType === type && { backgroundColor: "#007bff" },
//             ]}
//             onPress={() => setJobType(type)}
//           >
//             <Text style={{ color: jobType === type ? "#fff" : "#000" }}>
//               {type}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Deadline Picker */}
//       <TouchableOpacity onPress={handleOpenPicker}>
//         <View pointerEvents="none">
//           <TextInput
//             style={styles.input}
//             placeholder="Select Deadline"
//             value={deadline ? deadline.toISOString().split("T")[0] : ""}
//             editable={false}
//           />
//         </View>
//       </TouchableOpacity>

//       {showPicker && (
//         <DateTimePicker
//           value={deadline || new Date()}
//           mode="date"
//           display="default"
//           onChange={onChangeDate}
//         />
//       )}

//       {/* Addresses */}
//       {jobType === "PHYSICAL" && (
//         <View style={{ marginBottom: 15 }}>
//           <Text style={{ fontWeight: "700", marginBottom: 5 }}>
//             Select Address:
//           </Text>
//           {addresses.length === 0 ? (
//             <Text style={{ color: "gray" }}>
//               No saved addresses found. Please add one in your profile.
//             </Text>
//           ) : (
//             addresses.map((addr) => (
//               <TouchableOpacity
//                 key={addr.id}
//                 style={[
//                   styles.addressItem,
//                   addressId === String(addr.id) && {
//                     backgroundColor: "#007bff",
//                   },
//                 ]}
//                 onPress={() => setAddressId(String(addr.id))}
//               >
//                 <Text
//                   style={{
//                     color: addressId === String(addr.id) ? "#fff" : "#000",
//                   }}
//                 >
//                   {addr.label} — {addr.area} ({addr.pinCode})
//                 </Text>
//               </TouchableOpacity>
//             ))
//           )}
//         </View>
//       )}

//       <TouchableOpacity
//         style={[styles.btn, loading && { backgroundColor: "gray" }]}
//         onPress={handleCreateJob}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.btnText}>Create Job</Text>
//         )}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 20, backgroundColor: "#f7f8fc" },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#007bff",
//     marginBottom: 20,
//   },
//   input: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 15,
//   },
//   btn: {
//     backgroundColor: "#007bff",
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryItem: {
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 5,
//   },
//   addressItem: {
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 5,
//   },
// });
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   Keyboard,
//   Platform,
// } from "react-native";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import {
//   createPosterJob,
//   fetchCategories,
//   fetchPosterAddresses,
//   fetchPosterProfile,
// } from "../api/poster";

// export default function CreateJobScreen({ navigation }) {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryCode, setCategoryCode] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [amountInRs, setAmountInRs] = useState("");
//   const [deadline, setDeadline] = useState(new Date());
//   const [addressId, setAddressId] = useState("");
//   const [addresses, setAddresses] = useState([]);
//   const [jobType, setJobType] = useState("PHYSICAL");
//   const [loading, setLoading] = useState(false);
//   const [showPicker, setShowPicker] = useState(false);
//   const [loadingCategories, setLoadingCategories] = useState(true);
//   const [loadingAddresses, setLoadingAddresses] = useState(true);

//   // ✅ Fetch categories
//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const res = await fetchCategories();
//         if (res?.status === "SUCCESS" && Array.isArray(res.data)) {
//           setCategories(res.data);
//         } else {
//           Alert.alert("Error", res?.message || "Failed to fetch categories.");
//         }
//       } catch (err) {
//         console.error("Category Fetch Error:", err);
//         Alert.alert("Error", "Failed to load categories.");
//       } finally {
//         setLoadingCategories(false);
//       }
//     };
//     loadCategories();
//   }, []);

//   // ✅ Fetch poster addresses
//   useEffect(() => {
//     const loadAddresses = async () => {
//       try {
//         const res = await fetchPosterAddresses();
//         if (res?.status === "SUCCESS" && Array.isArray(res.data)) {
//           setAddresses(res.data);
//           if (res.data.length === 1) setAddressId(String(res.data[0].id));
//         } else {
//           Alert.alert("Error", res?.message || "Failed to fetch addresses.");
//         }
//       } catch (err) {
//         console.error("Address Fetch Error:", err);
//         Alert.alert("Error", "Please save at least one address first.");
//       } finally {
//         setLoadingAddresses(false);
//       }
//     };
//     loadAddresses();
//   }, []);

//   const onChangeDate = (event, selectedDate) => {
//     if (Platform.OS === "android") setShowPicker(false);
//     if (selectedDate) setDeadline(selectedDate);
//   };

//   const handleOpenPicker = () => {
//     Keyboard.dismiss();
//     setShowPicker(true);
//   };

//   // ✅ Validate and Create Job
//   const handleCreateJob = async () => {
//     try {
//       setLoading(true);

//       // ✅ Check KYC status
//       const kycRes = await fetchPosterProfile();
//       const kycStatus =
//         kycRes?.data?.kycStatus || kycRes?.data?.KycStatus || "false";
//       const rejectReason =
//         kycRes?.data?.kycRejectReason || kycRes?.data?.rejectionResponse || "";

//       if (!kycStatus || kycStatus === "false") {
//         return Alert.alert(
//           "KYC Required",
//           "Please complete your KYC before posting."
//         );
//       }
//       if (kycStatus === "PENDING") {
//         return Alert.alert("KYC Pending", "Your KYC is still under review.");
//       }
//       if (kycStatus === "REJECTED") {
//         return Alert.alert(
//           "KYC Rejected",
//           `Reason: ${rejectReason || "Not provided"}`
//         );
//       }

//       // ✅ Field validations
//       if (
//         !title.trim() ||
//         !description.trim() ||
//         !categoryCode ||
//         !amountInRs
//       ) {
//         return Alert.alert(
//           "Validation Error",
//           "Please fill all required fields."
//         );
//       }

//       const parsedAmount = parseInt(amountInRs, 10);
//       if (isNaN(parsedAmount) || parsedAmount <= 0) {
//         return Alert.alert("Validation Error", "Enter a valid amount.");
//       }

//       if (jobType === "PHYSICAL" && !addressId) {
//         return Alert.alert(
//           "Validation Error",
//           "Select an address for physical jobs."
//         );
//       }

//       // ✅ Prepare payload
//       const payload = {
//         title: title.trim(),
//         description: description.trim(),
//         categoryCode,
//         amountInRs: parsedAmount,
//         deadline: deadline.toISOString(),
//         jobType,
//         addressId: jobType === "PHYSICAL" ? Number(addressId) : null,
//       };

//       const res = await createPosterJob(payload);

//       if (res?.status === "SUCCESS") {
//         const jobId = res?.data?.id || res?.data?.jobId;
//         Alert.alert("✅ Success", "Job created successfully!", [
//           {
//             text: "Add Price Items",
//             onPress: () =>
//               navigation.navigate("JobPriceItems", {
//                 jobId,
//               }),
//           },
//           {
//             text: "Done",
//             onPress: () => navigation.goBack(),
//           },
//         ]);

//         // Reset fields
//         setTitle("");
//         setDescription("");
//         setCategoryCode("");
//         setAmountInRs("");
//         setDeadline(new Date());
//         setAddressId("");
//         setJobType("PHYSICAL");
//       } else {
//         Alert.alert("❌ Error", res?.message || "Failed to create job.");
//       }
//     } catch (err) {
//       console.error("Create Job Error:", err);
//       Alert.alert("Error", "Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loadingCategories || loadingAddresses) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#007bff" />
//         <Text>Loading data...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Create New Job</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Job Title"
//         value={title}
//         onChangeText={setTitle}
//       />

//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Description"
//         multiline
//         value={description}
//         onChangeText={setDescription}
//       />

//       {/* Categories */}
//       <View style={{ marginBottom: 15 }}>
//         <Text style={styles.label}>Select Category:</Text>
//         {categories.map((cat) => (
//           <TouchableOpacity
//             key={cat.code}
//             style={[
//               styles.categoryItem,
//               categoryCode === String(cat.code) && {
//                 backgroundColor: "#007bff",
//               },
//             ]}
//             onPress={() => setCategoryCode(String(cat.code))}
//           >
//             <Text
//               style={{
//                 color: categoryCode === String(cat.code) ? "#fff" : "#000",
//               }}
//             >
//               {cat.name}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <TextInput
//         style={styles.input}
//         placeholder="Amount (in ₹)"
//         keyboardType="numeric"
//         value={amountInRs}
//         onChangeText={setAmountInRs}
//       />

//       {/* Job Type */}
//       <View style={{ marginBottom: 15 }}>
//         <Text style={styles.label}>Job Type:</Text>
//         {["PHYSICAL", "REMOTE"].map((type) => (
//           <TouchableOpacity
//             key={type}
//             style={[
//               styles.categoryItem,
//               jobType === type && { backgroundColor: "#007bff" },
//             ]}
//             onPress={() => setJobType(type)}
//           >
//             <Text style={{ color: jobType === type ? "#fff" : "#000" }}>
//               {type}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Deadline Picker */}
//       <TouchableOpacity onPress={handleOpenPicker}>
//         <View pointerEvents="none">
//           <TextInput
//             style={styles.input}
//             placeholder="Select Deadline"
//             value={deadline ? deadline.toISOString().split("T")[0] : ""}
//             editable={false}
//           />
//         </View>
//       </TouchableOpacity>

//       {showPicker && (
//         <DateTimePicker
//           value={deadline || new Date()}
//           mode="date"
//           display="default"
//           onChange={onChangeDate}
//         />
//       )}

//       {/* Addresses */}
//       {jobType === "PHYSICAL" && (
//         <View style={{ marginBottom: 15 }}>
//           <Text style={styles.label}>Select Address:</Text>
//           {addresses.length === 0 ? (
//             <Text style={{ color: "gray" }}>
//               No saved addresses found. Please add one in your profile.
//             </Text>
//           ) : (
//             addresses.map((addr) => (
//               <TouchableOpacity
//                 key={addr.id}
//                 style={[
//                   styles.addressItem,
//                   addressId === String(addr.id) && {
//                     backgroundColor: "#007bff",
//                   },
//                 ]}
//                 onPress={() => setAddressId(String(addr.id))}
//               >
//                 <Text
//                   style={{
//                     color: addressId === String(addr.id) ? "#fff" : "#000",
//                   }}
//                 >
//                   {addr.label} — {addr.area} ({addr.pinCode})
//                 </Text>
//               </TouchableOpacity>
//             ))
//           )}
//         </View>
//       )}

//       <TouchableOpacity
//         style={[styles.btn, loading && { backgroundColor: "gray" }]}
//         onPress={handleCreateJob}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.btnText}>Create Job</Text>
//         )}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 20, backgroundColor: "#f7f8fc" },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#007bff",
//     marginBottom: 20,
//   },
//   input: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 15,
//   },
//   label: { fontWeight: "700", marginBottom: 5 },
//   btn: {
//     backgroundColor: "#007bff",
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryItem: {
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 5,
//   },
//   addressItem: {
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 5,
//   },
// });
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   Keyboard,
//   Platform,
// } from "react-native";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import {
//   createPosterJob,
//   fetchCategories,
//   fetchPosterAddresses,
//   fetchPosterProfile,
//   addJobPriceItem, // ✅ make sure to define this in your API file
// } from "../api/poster";

// export default function CreateJobScreen({ navigation }) {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryCode, setCategoryCode] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [amountInRs, setAmountInRs] = useState("");
//   const [deadline, setDeadline] = useState(new Date());
//   const [addressId, setAddressId] = useState("");
//   const [addresses, setAddresses] = useState([]);
//   const [jobType, setJobType] = useState("PHYSICAL");
//   const [loading, setLoading] = useState(false);
//   const [showPicker, setShowPicker] = useState(false);
//   const [loadingCategories, setLoadingCategories] = useState(true);
//   const [loadingAddresses, setLoadingAddresses] = useState(true);

//   // ✅ Local state for price items
//   const [priceItems, setPriceItems] = useState([]);
//   const [label, setLabel] = useState("");
//   const [price, setPrice] = useState("");

//   // ✅ Fetch categories and addresses
//   useEffect(() => {
//     const loadInitial = async () => {
//       try {
//         const [catRes, addrRes] = await Promise.all([
//           fetchCategories(),
//           fetchPosterAddresses(),
//         ]);
//         if (catRes?.status === "SUCCESS") setCategories(catRes.data);
//         if (addrRes?.status === "SUCCESS") {
//           setAddresses(addrRes.data);
//           if (addrRes.data.length === 1)
//             setAddressId(String(addrRes.data[0].id));
//         }
//       } catch (err) {
//         console.error("Init fetch error:", err);
//       } finally {
//         setLoadingCategories(false);
//         setLoadingAddresses(false);
//       }
//     };
//     loadInitial();
//   }, []);

//   const onChangeDate = (event, selectedDate) => {
//     if (Platform.OS === "android") setShowPicker(false);
//     if (selectedDate) setDeadline(selectedDate);
//   };

//   const handleAddItem = () => {
//     if (!label.trim() || !price.trim()) {
//       return Alert.alert("Error", "Enter both label and price.");
//     }
//     const parsed = parseInt(price, 10);
//     if (isNaN(parsed) || parsed <= 0)
//       return Alert.alert("Error", "Enter a valid numeric price.");

//     const newItem = {
//       id: Date.now(),
//       label: label.trim(),
//       priceRupees: parsed,
//     };
//     setPriceItems([...priceItems, newItem]);
//     setLabel("");
//     setPrice("");
//   };

//   const handleRemoveItem = (id) => {
//     setPriceItems(priceItems.filter((i) => i.id !== id));
//   };

//   // ✅ Validate and Create Job with Price Items
//   const handleCreateJob = async () => {
//     try {
//       setLoading(true);

//       // Check KYC
//       const kycRes = await fetchPosterProfile();
//       const kycStatus =
//         kycRes?.data?.kycStatus || kycRes?.data?.KycStatus || "false";
//       if (!kycStatus || kycStatus === "false")
//         return Alert.alert(
//           "KYC Required",
//           "Please complete KYC before posting."
//         );

//       // Field validation
//       if (!title || !description || !categoryCode || !amountInRs)
//         return Alert.alert("Error", "Please fill all required fields.");

//       const parsedAmount = parseInt(amountInRs, 10);
//       if (isNaN(parsedAmount) || parsedAmount <= 0)
//         return Alert.alert("Error", "Invalid total amount.");

//       const payload = {
//         title,
//         description,
//         categoryCode,
//         amountInRs: parsedAmount,
//         deadline: deadline.toISOString(),
//         jobType,
//         addressId: jobType === "PHYSICAL" ? Number(addressId) : null,
//       };

//       const res = await createPosterJob(payload);
//       if (res?.status === "SUCCESS") {
//         const jobId = res?.data?.id || res?.data?.jobId;
//         if (priceItems.length > 0) {
//           for (const item of priceItems) {
//             await addJobPriceItem(jobId, {
//               label: item.label,
//               priceRupees: item.priceRupees,
//             });
//           }
//         }
//         Alert.alert("✅ Success", "Job and price items added successfully!");
//         setTitle("");
//         setDescription("");
//         setCategoryCode("");
//         setAmountInRs("");
//         setDeadline(new Date());
//         setAddressId("");
//         setJobType("PHYSICAL");
//         setPriceItems([]);
//       } else {
//         Alert.alert("❌ Error", res?.message || "Failed to create job.");
//       }
//     } catch (err) {
//       console.error("Create Job Error:", err);
//       Alert.alert("Error", "Something went wrong. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loadingCategories || loadingAddresses) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#007bff" />
//         <Text>Loading data...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Create New Job</Text>

//       {/* Basic Job Fields */}
//       <TextInput
//         style={styles.input}
//         placeholder="Job Title"
//         value={title}
//         onChangeText={setTitle}
//       />
//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Description"
//         multiline
//         value={description}
//         onChangeText={setDescription}
//       />

//       {/* Category */}
//       <Text style={styles.label}>Select Category:</Text>
//       {categories.map((cat) => (
//         <TouchableOpacity
//           key={cat.code}
//           style={[
//             styles.categoryItem,
//             categoryCode === String(cat.code) && { backgroundColor: "#007bff" },
//           ]}
//           onPress={() => setCategoryCode(String(cat.code))}
//         >
//           <Text
//             style={{
//               color: categoryCode === String(cat.code) ? "#fff" : "#000",
//             }}
//           >
//             {cat.name}
//           </Text>
//         </TouchableOpacity>
//       ))}

//       <TextInput
//         style={styles.input}
//         placeholder="Total Amount (₹)"
//         keyboardType="numeric"
//         value={amountInRs}
//         onChangeText={setAmountInRs}
//       />

//       {/* Add Price Items Section */}
//       <Text style={[styles.label, { marginTop: 20 }]}>Job Price Items:</Text>
//       <View style={styles.priceBox}>
//         <TextInput
//           style={[styles.input, { flex: 1 }]}
//           placeholder="Item Label (e.g., Materials)"
//           value={label}
//           onChangeText={setLabel}
//         />
//         <TextInput
//           style={[styles.input, { flex: 1, marginLeft: 5 }]}
//           placeholder="Price ₹"
//           keyboardType="numeric"
//           value={price}
//           onChangeText={setPrice}
//         />
//       </View>
//       <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}>
//         <Text style={{ color: "#fff", fontWeight: "700" }}>Add Item</Text>
//       </TouchableOpacity>

//       {/* Show Added Items */}
//       {priceItems.length > 0 &&
//         priceItems.map((item) => (
//           <View key={item.id} style={styles.itemRow}>
//             <Text style={{ flex: 1 }}>
//               {item.label} - ₹{item.priceRupees}
//             </Text>
//             <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
//               <Text style={{ color: "red" }}>Remove</Text>
//             </TouchableOpacity>
//           </View>
//         ))}

//       {/* Deadline */}
//       <TouchableOpacity onPress={() => setShowPicker(true)}>
//         <View pointerEvents="none">
//           <TextInput
//             style={styles.input}
//             placeholder="Select Deadline"
//             value={deadline ? deadline.toISOString().split("T")[0] : ""}
//             editable={false}
//           />
//         </View>
//       </TouchableOpacity>
//       {showPicker && (
//         <DateTimePicker
//           value={deadline}
//           mode="date"
//           display="default"
//           onChange={onChangeDate}
//         />
//       )}

//       {/* Address */}
//       {jobType === "PHYSICAL" && (
//         <View style={{ marginBottom: 15 }}>
//           <Text style={styles.label}>Select Address:</Text>
//           {addresses.map((addr) => (
//             <TouchableOpacity
//               key={addr.id}
//               style={[
//                 styles.addressItem,
//                 addressId === String(addr.id) && { backgroundColor: "#007bff" },
//               ]}
//               onPress={() => setAddressId(String(addr.id))}
//             >
//               <Text
//                 style={{
//                   color: addressId === String(addr.id) ? "#fff" : "#000",
//                 }}
//               >
//                 {addr.label} — {addr.area} ({addr.pinCode})
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}

//       {/* Submit */}
//       <TouchableOpacity
//         style={[styles.btn, loading && { backgroundColor: "gray" }]}
//         onPress={handleCreateJob}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.btnText}>Create Job</Text>
//         )}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 20, backgroundColor: "#f7f8fc" },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#007bff",
//     marginBottom: 20,
//   },
//   input: {
//     backgroundColor: "#fff",
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 10,
//   },
//   label: { fontWeight: "700", marginBottom: 5 },
//   categoryItem: {
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 5,
//   },
//   addressItem: {
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 5,
//   },
//   priceBox: { flexDirection: "row", marginBottom: 10 },
//   addBtn: {
//     backgroundColor: "#007bff",
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   itemRow: {
//     backgroundColor: "#fff",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 5,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     borderWidth: 1,
//     borderColor: "#eee",
//   },
//   btn: {
//     backgroundColor: "#007bff",
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
// });
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   Keyboard,
//   Platform,
// } from "react-native";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import {
//   createPosterJob,
//   fetchCategories,
//   fetchPosterAddresses,
//   fetchPosterProfile,
//   addJobPriceItem, // ✅ defined in your api/poster.js
// } from "../api/poster";

// export default function CreateJobScreen() {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryCode, setCategoryCode] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [amountInRs, setAmountInRs] = useState("");
//   const [deadline, setDeadline] = useState(new Date());
//   const [addressId, setAddressId] = useState("");
//   const [addresses, setAddresses] = useState([]);
//   const [jobType, setJobType] = useState("PHYSICAL");
//   const [loading, setLoading] = useState(false);
//   const [showPicker, setShowPicker] = useState(false);
//   const [loadingCategories, setLoadingCategories] = useState(true);
//   const [loadingAddresses, setLoadingAddresses] = useState(true);

//   // ✅ Local price items state
//   const [priceItems, setPriceItems] = useState([]);
//   const [label, setLabel] = useState("");
//   const [price, setPrice] = useState("");
//   const [editingId, setEditingId] = useState(null);

//   // ✅ Fetch categories & addresses
//   useEffect(() => {
//     const loadInitial = async () => {
//       try {
//         const [catRes, addrRes] = await Promise.all([
//           fetchCategories(),
//           fetchPosterAddresses(),
//         ]);
//         if (catRes?.status === "SUCCESS") setCategories(catRes.data);
//         if (addrRes?.status === "SUCCESS") {
//           setAddresses(addrRes.data);
//           if (addrRes.data.length === 1)
//             setAddressId(String(addrRes.data[0].id));
//         }
//       } catch (err) {
//         console.error("Init fetch error:", err);
//       } finally {
//         setLoadingCategories(false);
//         setLoadingAddresses(false);
//       }
//     };
//     loadInitial();
//   }, []);

//   const onChangeDate = (event, selectedDate) => {
//     if (Platform.OS === "android") setShowPicker(false);
//     if (selectedDate) setDeadline(selectedDate);
//   };

//   // ✅ Add or Update Item
//   const handleAddOrUpdateItem = () => {
//     if (!label.trim() || !price.trim())
//       return Alert.alert("Error", "Enter both label and price.");
//     const parsed = parseInt(price, 10);
//     if (isNaN(parsed) || parsed <= 0)
//       return Alert.alert("Error", "Enter a valid numeric price.");

//     if (editingId) {
//       // Update
//       const updated = priceItems.map((item) =>
//         item.id === editingId ? { ...item, label, priceRupees: parsed } : item
//       );
//       setPriceItems(updated);
//       setEditingId(null);
//       setLabel("");
//       setPrice("");
//     } else {
//       // Add
//       const newItem = {
//         id: Date.now(),
//         label: label.trim(),
//         priceRupees: parsed,
//       };
//       setPriceItems([...priceItems, newItem]);
//       setLabel("");
//       setPrice("");
//     }
//   };

//   const handleEditItem = (item) => {
//     setEditingId(item.id);
//     setLabel(item.label);
//     setPrice(String(item.priceRupees));
//   };

//   const handleRemoveItem = (id) => {
//     Alert.alert("Confirm Delete", "Remove this item?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         onPress: () => setPriceItems(priceItems.filter((i) => i.id !== id)),
//         style: "destructive",
//       },
//     ]);
//   };

//   // ✅ Validate & Create Job
//   const handleCreateJob = async () => {
//     try {
//       setLoading(true);

//       const kycRes = await fetchPosterProfile();
//       const kycStatus = kycRes?.data?.kycStatus || "false";
//       if (kycStatus !== "APPROVED")
//         return Alert.alert(
//           "KYC Required",
//           "Please complete or wait for KYC approval."
//         );

//       if (!title || !description || !categoryCode || !amountInRs)
//         return Alert.alert("Error", "Please fill all required fields.");

//       const parsedAmount = parseInt(amountInRs, 10);
//       if (isNaN(parsedAmount) || parsedAmount <= 0)
//         return Alert.alert("Error", "Invalid total amount.");

//       const payload = {
//         title,
//         description,
//         categoryCode,
//         amountInRs: parsedAmount,
//         deadline: deadline.toISOString(),
//         jobType,
//         addressId: jobType === "PHYSICAL" ? Number(addressId) : null,
//       };

//       const res = await createPosterJob(payload);
//       if (res?.status === "SUCCESS") {
//         const jobId = res?.data?.id || res?.data?.jobId;
//         // Add price items
//         for (const item of priceItems) {
//           await addJobPriceItem(jobId, {
//             label: item.label,
//             priceRupees: item.priceRupees,
//           });
//         }
//         Alert.alert("✅ Success", "Job and items created successfully!");
//         setTitle("");
//         setDescription("");
//         setCategoryCode("");
//         setAmountInRs("");
//         setDeadline(new Date());
//         setAddressId("");
//         setJobType("PHYSICAL");
//         setPriceItems([]);
//       } else {
//         Alert.alert("❌ Error", res?.message || "Failed to create job.");
//       }
//     } catch (err) {
//       console.error("Create Job Error:", err);
//       Alert.alert("Error", "Something went wrong. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loadingCategories || loadingAddresses) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#007bff" />
//         <Text>Loading data...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Create New Job</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Job Title"
//         value={title}
//         onChangeText={setTitle}
//       />
//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Description"
//         multiline
//         value={description}
//         onChangeText={setDescription}
//       />

//       <Text style={styles.label}>Select Category:</Text>
//       {categories.map((cat) => (
//         <TouchableOpacity
//           key={cat.code}
//           style={[
//             styles.categoryItem,
//             categoryCode === String(cat.code) && { backgroundColor: "#007bff" },
//           ]}
//           onPress={() => setCategoryCode(String(cat.code))}
//         >
//           <Text
//             style={{
//               color: categoryCode === String(cat.code) ? "#fff" : "#000",
//             }}
//           >
//             {cat.name}
//           </Text>
//         </TouchableOpacity>
//       ))}

//       <TextInput
//         style={styles.input}
//         placeholder="Total Amount (₹)"
//         keyboardType="numeric"
//         value={amountInRs}
//         onChangeText={setAmountInRs}
//       />

//       {/* Price Items Section */}
//       <Text style={[styles.label, { marginTop: 20 }]}>Job Price Items:</Text>
//       <View style={styles.priceBox}>
//         <TextInput
//           style={[styles.input, { flex: 1 }]}
//           placeholder="Item Label (e.g., Materials)"
//           value={label}
//           onChangeText={setLabel}
//         />
//         <TextInput
//           style={[styles.input, { flex: 1, marginLeft: 5 }]}
//           placeholder="Price ₹"
//           keyboardType="numeric"
//           value={price}
//           onChangeText={setPrice}
//         />
//       </View>
//       <TouchableOpacity style={styles.addBtn} onPress={handleAddOrUpdateItem}>
//         <Text style={{ color: "#fff", fontWeight: "700" }}>
//           {editingId ? "Update Item" : "Add Item"}
//         </Text>
//       </TouchableOpacity>

//       {priceItems.length > 0 && (
//         <View style={{ marginTop: 10 }}>
//           {priceItems.map((item) => (
//             <View key={item.id} style={styles.itemRow}>
//               <Text style={{ flex: 1 }}>
//                 {item.label} - ₹{item.priceRupees}
//               </Text>
//               <View style={{ flexDirection: "row" }}>
//                 <TouchableOpacity onPress={() => handleEditItem(item)}>
//                   <Text style={{ color: "orange", marginRight: 10 }}>Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
//                   <Text style={{ color: "red" }}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ))}
//         </View>
//       )}

//       {/* Deadline */}
//       <TouchableOpacity onPress={() => setShowPicker(true)}>
//         <View pointerEvents="none">
//           <TextInput
//             style={styles.input}
//             placeholder="Select Deadline"
//             value={deadline ? deadline.toISOString().split("T")[0] : ""}
//             editable={false}
//           />
//         </View>
//       </TouchableOpacity>
//       {showPicker && (
//         <DateTimePicker
//           value={deadline}
//           mode="date"
//           display="default"
//           onChange={onChangeDate}
//         />
//       )}

//       {/* Address */}
//       {jobType === "PHYSICAL" && (
//         <View style={{ marginBottom: 15 }}>
//           <Text style={styles.label}>Select Address:</Text>
//           {addresses.map((addr) => (
//             <TouchableOpacity
//               key={addr.id}
//               style={[
//                 styles.addressItem,
//                 addressId === String(addr.id) && { backgroundColor: "#007bff" },
//               ]}
//               onPress={() => setAddressId(String(addr.id))}
//             >
//               <Text
//                 style={{
//                   color: addressId === String(addr.id) ? "#fff" : "#000",
//                 }}
//               >
//                 {addr.label} — {addr.area} ({addr.pinCode})
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}

//       {/* Submit */}
//       <TouchableOpacity
//         style={[styles.btn, loading && { backgroundColor: "gray" }]}
//         onPress={handleCreateJob}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.btnText}>Create Job</Text>
//         )}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 20, backgroundColor: "#f7f8fc" },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#007bff",
//     marginBottom: 20,
//   },
//   input: {
//     backgroundColor: "#fff",
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 10,
//   },
//   label: { fontWeight: "700", marginBottom: 5 },
//   categoryItem: {
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 5,
//   },
//   addressItem: {
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 5,
//   },
//   priceBox: { flexDirection: "row", marginBottom: 10 },
//   addBtn: {
//     backgroundColor: "#007bff",
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   itemRow: {
//     backgroundColor: "#fff",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 5,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     borderWidth: 1,
//     borderColor: "#eee",
//   },
//   btn: {
//     backgroundColor: "#007bff",
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
// });
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   Platform,
// } from "react-native";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import {
//   createPosterJob,
//   fetchCategories,
//   fetchPosterAddresses,
//   fetchPosterProfile,
//   addJobPriceItem,
// } from "../api/poster";

// export default function CreateJobScreen() {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryCode, setCategoryCode] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [amountInRs, setAmountInRs] = useState(0); // auto total
//   const [deadline, setDeadline] = useState(new Date());
//   const [addressId, setAddressId] = useState("");
//   const [addresses, setAddresses] = useState([]);
//   const [jobType, setJobType] = useState("PHYSICAL");
//   const [loading, setLoading] = useState(false);
//   const [showPicker, setShowPicker] = useState(false);
//   const [loadingCategories, setLoadingCategories] = useState(true);
//   const [loadingAddresses, setLoadingAddresses] = useState(true);

//   const [priceItems, setPriceItems] = useState([]);
//   const [label, setLabel] = useState("");
//   const [price, setPrice] = useState("");
//   const [editingId, setEditingId] = useState(null);

//   // Fetch categories & addresses
//   useEffect(() => {
//     const loadInitial = async () => {
//       try {
//         const [catRes, addrRes] = await Promise.all([
//           fetchCategories(),
//           fetchPosterAddresses(),
//         ]);
//         if (catRes?.status === "SUCCESS") setCategories(catRes.data);
//         if (addrRes?.status === "SUCCESS") {
//           setAddresses(addrRes.data);
//           if (addrRes.data.length === 1)
//             setAddressId(String(addrRes.data[0].id));
//         }
//       } catch (err) {
//         console.error("Init fetch error:", err);
//       } finally {
//         setLoadingCategories(false);
//         setLoadingAddresses(false);
//       }
//     };
//     loadInitial();
//   }, []);

//   const onChangeDate = (event, selectedDate) => {
//     if (Platform.OS === "android") setShowPicker(false);
//     if (selectedDate) setDeadline(selectedDate);
//   };

//   // Auto-calculate total whenever priceItems change
//   useEffect(() => {
//     const total = priceItems.reduce(
//       (sum, item) => sum + (item.priceRupees || 0),
//       0
//     );
//     setAmountInRs(total);
//   }, [priceItems]);

//   const handleAddOrUpdateItem = () => {
//     if (!label.trim() || !price.trim())
//       return Alert.alert("Error", "Enter both label and price.");
//     const parsed = parseInt(price, 10);
//     if (isNaN(parsed) || parsed <= 0)
//       return Alert.alert("Error", "Enter a valid numeric price.");

//     if (editingId) {
//       const updated = priceItems.map((item) =>
//         item.id === editingId ? { ...item, label, priceRupees: parsed } : item
//       );
//       setPriceItems(updated);
//       setEditingId(null);
//     } else {
//       setPriceItems([
//         ...priceItems,
//         { id: Date.now(), label: label.trim(), priceRupees: parsed },
//       ]);
//     }
//     setLabel("");
//     setPrice("");
//   };

//   const handleEditItem = (item) => {
//     setEditingId(item.id);
//     setLabel(item.label);
//     setPrice(String(item.priceRupees));
//   };

//   const handleRemoveItem = (id) => {
//     Alert.alert("Confirm Delete", "Remove this item?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         onPress: () => setPriceItems(priceItems.filter((i) => i.id !== id)),
//         style: "destructive",
//       },
//     ]);
//   };

//   const handleCreateJob = async () => {
//     try {
//       setLoading(true);

//       // ✅ Fetch profile and handle KYC as boolean
//       const profileRes = await fetchPosterProfile();
//       const kycStatusBoolean = profileRes?.data?.KycStatus; // boolean
//       if (!kycStatusBoolean)
//         return Alert.alert(
//           "KYC Required",
//           "Please complete or wait for KYC approval."
//         );

//       if (!title || !description || !categoryCode)
//         return Alert.alert("Error", "Please fill all required fields.");

//       const payload = {
//         title,
//         description,
//         categoryCode,
//         amountInRs,
//         deadline: deadline.toISOString(),
//         jobType,
//         addressId: jobType === "PHYSICAL" ? Number(addressId) : null,
//       };

//       const res = await createPosterJob(payload);
//       if (res?.status === "SUCCESS") {
//         const jobId = res?.data?.id || res?.data?.jobId;
//         for (const item of priceItems) {
//           await addJobPriceItem(jobId, {
//             label: item.label,
//             priceRupees: item.priceRupees,
//           });
//         }
//         Alert.alert("✅ Success", "Job and items created successfully!");
//         setTitle("");
//         setDescription("");
//         setCategoryCode("");
//         setAmountInRs(0);
//         setDeadline(new Date());
//         setAddressId("");
//         setJobType("PHYSICAL");
//         setPriceItems([]);
//       } else {
//         Alert.alert("❌ Error", res?.message || "Failed to create job.");
//       }
//     } catch (err) {
//       console.error("Create Job Error:", err);
//       Alert.alert("Error", "Something went wrong. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loadingCategories || loadingAddresses) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#007bff" />
//         <Text>Loading data...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Create New Job</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Job Title"
//         value={title}
//         onChangeText={setTitle}
//       />
//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Description"
//         multiline
//         value={description}
//         onChangeText={setDescription}
//       />

//       <Text style={styles.label}>Select Category:</Text>
//       {categories.map((cat) => (
//         <TouchableOpacity
//           key={cat.code}
//           style={[
//             styles.categoryItem,
//             categoryCode === String(cat.code) && { backgroundColor: "#007bff" },
//           ]}
//           onPress={() => setCategoryCode(String(cat.code))}
//         >
//           <Text
//             style={{
//               color: categoryCode === String(cat.code) ? "#fff" : "#000",
//             }}
//           >
//             {cat.name}
//           </Text>
//         </TouchableOpacity>
//       ))}

//       {/* Total Amount */}
//       <TextInput
//         style={[styles.input, { backgroundColor: "#e9ecef" }]}
//         placeholder="Total Amount (₹)"
//         value={amountInRs.toString()}
//         editable={false}
//       />

//       {/* Price Items */}
//       <Text style={[styles.label, { marginTop: 20 }]}>Job Price Items:</Text>
//       <View style={styles.priceBox}>
//         <TextInput
//           style={[styles.input, { flex: 1 }]}
//           placeholder="Item Label (e.g., Materials)"
//           value={label}
//           onChangeText={setLabel}
//         />
//         <TextInput
//           style={[styles.input, { flex: 1, marginLeft: 5 }]}
//           placeholder="Price ₹"
//           keyboardType="numeric"
//           value={price}
//           onChangeText={setPrice}
//         />
//       </View>
//       <TouchableOpacity style={styles.addBtn} onPress={handleAddOrUpdateItem}>
//         <Text style={{ color: "#fff", fontWeight: "700" }}>
//           {editingId ? "Update Item" : "Add Item"}
//         </Text>
//       </TouchableOpacity>

//       {priceItems.length > 0 && (
//         <View style={{ marginTop: 10 }}>
//           {priceItems.map((item) => (
//             <View key={item.id} style={styles.itemRow}>
//               <Text style={{ flex: 1 }}>
//                 {item.label} - ₹{item.priceRupees}
//               </Text>
//               <View style={{ flexDirection: "row" }}>
//                 <TouchableOpacity onPress={() => handleEditItem(item)}>
//                   <Text style={{ color: "orange", marginRight: 10 }}>Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
//                   <Text style={{ color: "red" }}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ))}
//           <Text style={styles.totalText}>Total: ₹{amountInRs}</Text>
//         </View>
//       )}

//       {/* Deadline */}
//       <TouchableOpacity onPress={() => setShowPicker(true)}>
//         <View pointerEvents="none">
//           <TextInput
//             style={styles.input}
//             placeholder="Select Deadline"
//             value={deadline ? deadline.toISOString().split("T")[0] : ""}
//             editable={false}
//           />
//         </View>
//       </TouchableOpacity>
//       {showPicker && (
//         <DateTimePicker
//           value={deadline}
//           mode="date"
//           display="default"
//           onChange={onChangeDate}
//         />
//       )}

//       {/* Address */}
//       {jobType === "PHYSICAL" && (
//         <View style={{ marginBottom: 15 }}>
//           <Text style={styles.label}>Select Address:</Text>
//           {addresses.map((addr) => (
//             <TouchableOpacity
//               key={addr.id}
//               style={[
//                 styles.addressItem,
//                 addressId === String(addr.id) && { backgroundColor: "#007bff" },
//               ]}
//               onPress={() => setAddressId(String(addr.id))}
//             >
//               <Text
//                 style={{
//                   color: addressId === String(addr.id) ? "#fff" : "#000",
//                 }}
//               >
//                 {addr.label} — {addr.area} ({addr.pinCode})
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       )}

//       {/* Submit */}
//       <TouchableOpacity
//         style={[styles.btn, loading && { backgroundColor: "gray" }]}
//         onPress={handleCreateJob}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.btnText}>Create Job</Text>
//         )}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 20, backgroundColor: "#f7f8fc" },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#007bff",
//     marginBottom: 20,
//   },
//   input: {
//     backgroundColor: "#fff",
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 10,
//   },
//   label: { fontWeight: "700", marginBottom: 5 },
//   categoryItem: {
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 5,
//   },
//   addressItem: {
//     padding: 10,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     marginBottom: 5,
//   },
//   priceBox: { flexDirection: "row", marginBottom: 10 },
//   addBtn: {
//     backgroundColor: "#007bff",
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   itemRow: {
//     backgroundColor: "#fff",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 5,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     borderWidth: 1,
//     borderColor: "#eee",
//   },
//   totalText: {
//     fontWeight: "700",
//     textAlign: "right",
//     fontSize: 16,
//     marginTop: 5,
//   },
//   btn: {
//     backgroundColor: "#007bff",
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  createPosterJob,
  fetchCategories,
  fetchPosterAddresses,
  fetchPosterProfile,
  addJobPriceItem,
} from "../api/poster";

export default function CreateJobScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [categories, setCategories] = useState([]);
  const [amountInRs, setAmountInRs] = useState(0); // Auto total
  const [deadline, setDeadline] = useState(new Date());
  const [addressId, setAddressId] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [jobType, setJobType] = useState("PHYSICAL");
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Price items state
  const [priceItems, setPriceItems] = useState([]);
  const [label, setLabel] = useState("");
  const [itemDescription, setItemDescription] = useState(""); // optional
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Fetch categories and addresses
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [catRes, addrRes] = await Promise.all([
          fetchCategories(),
          fetchPosterAddresses(),
        ]);
        if (catRes?.status === "SUCCESS") setCategories(catRes.data);
        if (addrRes?.status === "SUCCESS") {
          setAddresses(addrRes.data);
          if (addrRes.data.length === 1)
            setAddressId(String(addrRes.data[0].id));
        }
      } catch (err) {
        console.error("Init fetch error:", err);
      } finally {
        setLoadingCategories(false);
        setLoadingAddresses(false);
      }
    };
    loadInitial();
  }, []);

  // Auto total calculation
  useEffect(() => {
    const total = priceItems.reduce(
      (sum, item) => sum + (item.priceRupees || 0),
      0
    );
    setAmountInRs(total);
  }, [priceItems]);

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (selectedDate) setDeadline(selectedDate);
  };

  // Add or update price item
  const handleAddOrUpdateItem = () => {
    if (!label.trim() || !price.trim())
      return Alert.alert("Error", "Enter both label and price.");

    const parsedPrice = parseInt(price, 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0)
      return Alert.alert("Error", "Enter a valid numeric price.");

    if (editingId) {
      const updated = priceItems.map((item) =>
        item.id === editingId
          ? {
              ...item,
              label: label.trim(),
              description: itemDescription,
              priceRupees: parsedPrice,
            }
          : item
      );
      setPriceItems(updated);
      setEditingId(null);
    } else {
      setPriceItems([
        ...priceItems,
        {
          id: Date.now(),
          label: label.trim(),
          description: itemDescription,
          priceRupees: parsedPrice,
        },
      ]);
    }

    setLabel("");
    setItemDescription("");
    setPrice("");
  };

  const handleEditItem = (item) => {
    setEditingId(item.id);
    setLabel(item.label);
    setItemDescription(item.description || "");
    setPrice(String(item.priceRupees));
  };

  const handleRemoveItem = (id) => {
    Alert.alert("Confirm Delete", "Remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => setPriceItems(priceItems.filter((i) => i.id !== id)),
        style: "destructive",
      },
    ]);
  };

  // Create Job
  const handleCreateJob = async () => {
    try {
      setLoading(true);

      // Check KYC
      const profileRes = await fetchPosterProfile();
      const kycStatusBoolean = profileRes?.data?.KycStatus; // boolean
      if (!kycStatusBoolean)
        return Alert.alert(
          "KYC Required",
          "Please complete or wait for KYC approval."
        );

      if (!title || !description || !categoryCode)
        return Alert.alert("Error", "Please fill all required fields.");

      const payload = {
        title,
        description,
        categoryCode,
        amountInRs,
        deadline: deadline.toISOString(),
        jobType,
        addressId: jobType === "PHYSICAL" ? Number(addressId) : null,
      };

      const res = await createPosterJob(payload);
      if (res?.status === "SUCCESS") {
        const jobId = res?.data?.id || res?.data?.jobId;

        for (const item of priceItems) {
          await addJobPriceItem(jobId, {
            label: item.label,
            description: item.description || "",
            priceRupees: item.priceRupees,
          });
        }

        Alert.alert("✅ Success", "Job and items created successfully!");

        // Reset form
        setTitle("");
        setDescription("");
        setCategoryCode("");
        setAmountInRs(0);
        setDeadline(new Date());
        setAddressId("");
        setJobType("PHYSICAL");
        setPriceItems([]);
      } else {
        Alert.alert("❌ Error", res?.message || "Failed to create job.");
      }
    } catch (err) {
      console.error("Create Job Error:", err);
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories || loadingAddresses) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create New Job</Text>

      <TextInput
        style={styles.input}
        placeholder="Job Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Description"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Select Category:</Text>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.code}
          style={[
            styles.categoryItem,
            categoryCode === String(cat.code) && { backgroundColor: "#007bff" },
          ]}
          onPress={() => setCategoryCode(String(cat.code))}
        >
          <Text
            style={{
              color: categoryCode === String(cat.code) ? "#fff" : "#000",
            }}
          >
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Total Amount */}
      <TextInput
        style={[styles.input, { backgroundColor: "#e9ecef" }]}
        placeholder="Total Amount (₹)"
        value={amountInRs.toString()}
        editable={false}
      />

      {/* Price Items */}
      <Text style={[styles.label, { marginTop: 20 }]}>Job Price Items:</Text>
      <View style={styles.priceBox}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Item Label"
          value={label}
          onChangeText={setLabel}
        />
        <TextInput
          style={[styles.input, { flex: 1, marginLeft: 5 }]}
          placeholder="Price ₹"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
      </View>
      <TextInput
        style={[styles.input, { marginBottom: 10 }]}
        placeholder="Description (optional)"
        value={itemDescription}
        onChangeText={setItemDescription}
      />
      <TouchableOpacity style={styles.addBtn} onPress={handleAddOrUpdateItem}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          {editingId ? "Update Item" : "Add Item"}
        </Text>
      </TouchableOpacity>

      {priceItems.length > 0 && (
        <View style={{ marginTop: 10 }}>
          {priceItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={{ flex: 1 }}>
                {item.label} - ₹{item.priceRupees}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={() => handleEditItem(item)}>
                  <Text style={{ color: "orange", marginRight: 10 }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                  <Text style={{ color: "red" }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <Text style={styles.totalText}>Total: ₹{amountInRs}</Text>
        </View>
      )}

      {/* Deadline */}
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <View pointerEvents="none">
          <TextInput
            style={styles.input}
            placeholder="Select Deadline"
            value={deadline ? deadline.toISOString().split("T")[0] : ""}
            editable={false}
          />
        </View>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={deadline}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      {/* Address */}
      {jobType === "PHYSICAL" && (
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.label}>Select Address:</Text>
          {addresses.map((addr) => (
            <TouchableOpacity
              key={addr.id}
              style={[
                styles.addressItem,
                addressId === String(addr.id) && { backgroundColor: "#007bff" },
              ]}
              onPress={() => setAddressId(String(addr.id))}
            >
              <Text
                style={{
                  color: addressId === String(addr.id) ? "#fff" : "#000",
                }}
              >
                {addr.label} — {addr.area} ({addr.pinCode})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.btn, loading && { backgroundColor: "gray" }]}
        onPress={handleCreateJob}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Create Job</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f7f8fc" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#007bff",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  label: { fontWeight: "700", marginBottom: 5 },
  categoryItem: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 5,
  },
  addressItem: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 5,
  },
  priceBox: { flexDirection: "row", marginBottom: 10 },
  addBtn: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  itemRow: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#eee",
  },
  totalText: {
    fontWeight: "700",
    textAlign: "right",
    fontSize: 16,
    marginTop: 5,
  },
  btn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

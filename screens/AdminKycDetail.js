// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   Platform,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as FileSystem from "expo-file-system/legacy";
// import * as MediaLibrary from "expo-media-library";
// import * as Sharing from "expo-sharing";
// import axios from "axios";

// const AdminKycDetail = () => {
//   const [kycList, setKycList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [downloadingId, setDownloadingId] = useState(null);

//   const BASE_URL = "http://192.168.217.218:8080";

//   // 1️⃣ Fetch Pending KYCs
//   const fetchPendingKyc = async () => {
//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       const res = await axios.get(
//         `${BASE_URL}/api/admin/kyc/pending?page=0&size=20&sort=createdAt,DESC`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setKycList(res.data?.data?.content || []);
//     } catch (err) {
//       console.error("Fetch KYC error:", err);
//       Alert.alert("Error", "Failed to load pending KYCs");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPendingKyc();
//   }, []);

//   // 2️⃣ Download KYC File
//   const downloadKycFile = async (kyc) => {
//     try {
//       setDownloadingId(kyc.id);

//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       const fileUrl = `${BASE_URL}/${kyc.downloadUrl}`; // use backend downloadUrl
//       const extension = kyc.docType?.toLowerCase() || "pdf";
//       const fileName = `KYC_${kyc.id}_${kyc.userName}.${extension}`;
//       const fileUri = FileSystem.cacheDirectory + fileName;

//       console.log("Downloading:", fileUrl);

//       const downloadResumable = FileSystem.createDownloadResumable(
//         fileUrl,
//         fileUri,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const { uri } = await downloadResumable.downloadAsync();
//       console.log("Downloaded to:", uri);

//       // Android: save to Downloads
//       if (Platform.OS === "android") {
//         const { status } = await MediaLibrary.requestPermissionsAsync();
//         if (status !== "granted") return Alert.alert("Permission denied");

//         const asset = await MediaLibrary.createAssetAsync(uri);
//         await MediaLibrary.createAlbumAsync("Download", asset, false);
//         Alert.alert("Download Complete", "File saved to Downloads folder!");
//       }
//       // iOS: share or save
//       else if (Platform.OS === "ios") {
//         if (await Sharing.isAvailableAsync()) {
//           await Sharing.shareAsync(uri);
//         } else {
//           Alert.alert("Download Complete", "File saved in app cache.");
//         }
//       }
//     } catch (err) {
//       console.error("Download error:", err);
//       Alert.alert("Error", "Failed to download KYC file");
//     } finally {
//       setDownloadingId(null);
//     }
//   };

//   const renderKycItem = ({ item }) => (
//     <View style={styles.card}>
//       <Text style={styles.title}>KYC ID: {item.id}</Text>
//       <Text style={styles.text}>User: {item.userName}</Text>
//       <Text style={styles.text}>Phone: {item.userPhone}</Text>
//       <Text style={styles.text}>Doc Type: {item.docType}</Text>
//       <Text style={styles.text}>Status: {item.status}</Text>
//       <Text style={styles.text}>Role: {item.roleType}</Text>

//       <TouchableOpacity
//         style={styles.downloadButton}
//         onPress={() => downloadKycFile(item)}
//         disabled={downloadingId === item.id}
//       >
//         {downloadingId === item.id ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.downloadText}>Download</Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#007bff" />
//         <Text>Loading pending KYCs...</Text>
//       </View>
//     );

//   if (kycList.length === 0)
//     return (
//       <View style={styles.center}>
//         <Text>No pending KYCs found</Text>
//       </View>
//     );

//   return (
//     <FlatList
//       data={kycList}
//       keyExtractor={(item) => item.id.toString()}
//       renderItem={renderKycItem}
//       contentContainerStyle={{ padding: 10 }}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 8,
//     elevation: 3,
//   },
//   title: {
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   text: {
//     fontSize: 14,
//     marginTop: 4,
//   },
//   downloadButton: {
//     backgroundColor: "#007bff",
//     padding: 10,
//     borderRadius: 8,
//     marginTop: 10,
//     alignItems: "center",
//   },
//   downloadText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   center: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

// export default AdminKycDetail;
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Linking from "expo-linking";
// import { Ionicons } from "@expo/vector-icons";

// import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// export default function AdminKycDetail({ route, navigation }) {
//   const { kycId } = route.params;
//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [reason, setReason] = useState("");
//   const [downloading, setDownloading] = useState(false);

//   const BASE_URL = "http://192.168.217.218:8080";

//   useEffect(() => {
//     fetchKycDetail();
//   }, []);

//   const fetchKycDetail = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchPendingKyc();
//       const content = res.data?.data?.content || [];
//       const selectedKyc = content.find((item) => item.id === kycId);
//       if (!selectedKyc) {
//         Alert.alert(
//           "KYC Not Found",
//           "This KYC request is no longer available."
//         );
//         navigation.goBack();
//         return;
//       }
//       setKyc(selectedKyc);
//     } catch (err) {
//       console.error(
//         "Fetch KYC Detail Error:",
//         err.response?.data || err.message
//       );
//       Alert.alert("Error", "Failed to fetch KYC details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Download via Chrome / system browser
//   const downloadKycFile = async () => {
//     if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");

//     try {
//       setDownloading(true);

//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       // Full download URL
//       let fileUrl = `${BASE_URL}/${kyc.downloadUrl}`;

//       // ⚠️ If your backend requires auth header, you can pass token as query param
//       fileUrl += `?token=${token}`;

//       console.log("Opening KYC in browser:", fileUrl);

//       const supported = await Linking.canOpenURL(fileUrl);
//       if (supported) {
//         await Linking.openURL(fileUrl);
//       } else {
//         Alert.alert("Error", "Cannot open browser to download KYC.");
//       }
//     } catch (err) {
//       console.error("Download error:", err);
//       Alert.alert("Error", "Failed to download KYC file.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const handleApprove = async () => {
//     try {
//       await approveKyc(kyc.id);
//       Alert.alert("Success", "KYC Approved!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Approve KYC Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to approve KYC.");
//     }
//   };

//   const handleReject = async () => {
//     if (!reason.trim()) {
//       Alert.alert("Reason Required", "Please provide a reason for rejection.");
//       return;
//     }
//     try {
//       await rejectKyc(kyc.id, reason);
//       Alert.alert("Success", "KYC Rejected!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Reject KYC Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to reject KYC.");
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196f3" />
//       </View>
//     );

//   if (!kyc)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.empty}>KYC not found.</Text>
//       </View>
//     );

//   return (
//     <View style={styles.wrapper}>
//       <View style={styles.navBar}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.navTitle}>KYC Detail</Text>
//       </View>

//       <ScrollView style={styles.container}>
//         <Text style={styles.label}>Name: {kyc.userName}</Text>
//         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
//         <Text style={styles.label}>Role: {kyc.roleType}</Text>
//         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
//         <Text style={styles.label}>Status: {kyc.status}</Text>

//         <TouchableOpacity
//           style={[
//             styles.downloadBtn,
//             downloading && { backgroundColor: "#ccc" },
//           ]}
//           onPress={downloadKycFile}
//           disabled={downloading}
//         >
//           {downloading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.downloadText}>Download / Open Document</Text>
//           )}
//         </TouchableOpacity>

//         <TextInput
//           style={styles.input}
//           placeholder="Reason for rejection"
//           value={reason}
//           onChangeText={setReason}
//         />

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={[styles.btn, styles.approveBtn]}
//             onPress={handleApprove}
//           >
//             <Text style={styles.btnText}>Approve</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.btn, styles.rejectBtn]}
//             onPress={handleReject}
//           >
//             <Text style={styles.btnText}>Reject</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
//   navBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2196f3",
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     elevation: 3,
//   },
//   backButton: { marginRight: 10, padding: 4 },
//   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
//   container: { flex: 1, padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   label: { fontSize: 18, marginBottom: 10 },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
//   downloadBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 15,
//   },
//   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//   },
//   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
//   btn: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginHorizontal: 5,
//   },
//   approveBtn: { backgroundColor: "#4CAF50" },
//   rejectBtn: { backgroundColor: "#FF3B30" },
//   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Linking from "expo-linking";
// import { Ionicons } from "@expo/vector-icons";
// import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// export default function AdminKycDetail({ route, navigation }) {
//   const { kycId } = route.params;
//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [reason, setReason] = useState("");
//   const [downloading, setDownloading] = useState(false);

//   const BASE_URL = "https://192.168.217.218:8080";

//   useEffect(() => {
//     fetchKycDetail();
//   }, []);

//   const fetchKycDetail = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchPendingKyc();
//       const content = res.data?.data?.content || [];
//       const selectedKyc = content.find((item) => item.id === kycId);
//       if (!selectedKyc) {
//         Alert.alert(
//           "KYC Not Found",
//           "This KYC request is no longer available."
//         );
//         navigation.goBack();
//         return;
//       }
//       setKyc(selectedKyc);
//     } catch (err) {
//       console.error(
//         "Fetch KYC Detail Error:",
//         err.response?.data || err.message
//       );
//       Alert.alert("Error", "Failed to fetch KYC details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadKycFile = async () => {
//     if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");

//     try {
//       setDownloading(true);
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       let fileUrl = `${BASE_URL}/${kyc.downloadUrl}?token=${token}`;
//       const supported = await Linking.canOpenURL(fileUrl);
//       if (supported) await Linking.openURL(fileUrl);
//       else Alert.alert("Error", "Cannot open browser to download KYC.");
//     } catch (err) {
//       console.error("Download error:", err);
//       Alert.alert("Error", "Failed to download KYC file.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const handleApprove = async () => {
//     try {
//       await approveKyc(kyc.id);
//       Alert.alert("Success", "KYC Approved!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Approve KYC Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to approve KYC.");
//     }
//   };

//   const handleReject = async () => {
//     if (!reason.trim()) {
//       Alert.alert("Reason Required", "Please provide a reason for rejection.");
//       return;
//     }
//     try {
//       await rejectKyc(kyc.id, reason);
//       Alert.alert("Success", "KYC Rejected!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Reject KYC Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to reject KYC.");
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196f3" />
//       </View>
//     );

//   if (!kyc)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.empty}>KYC not found.</Text>
//       </View>
//     );

//   return (
//     <View style={styles.wrapper}>
//       <View style={styles.navBar}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.navTitle}>KYC Detail</Text>
//       </View>

//       <ScrollView style={styles.container}>
//         <Text style={styles.label}>Name: {kyc.userName}</Text>
//         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
//         <Text style={styles.label}>Role: {kyc.roleType}</Text>
//         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
//         <Text style={styles.label}>Status: {kyc.status}</Text>

//         <TouchableOpacity
//           style={[
//             styles.downloadBtn,
//             downloading && { backgroundColor: "#ccc" },
//           ]}
//           onPress={downloadKycFile}
//           disabled={downloading}
//         >
//           {downloading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.downloadText}>Download / Open Document</Text>
//           )}
//         </TouchableOpacity>

//         <TextInput
//           style={styles.input}
//           placeholder="Reason for rejection"
//           value={reason}
//           onChangeText={setReason}
//         />

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={[styles.btn, styles.approveBtn]}
//             onPress={handleApprove}
//           >
//             <Text style={styles.btnText}>Approve</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.btn, styles.rejectBtn]}
//             onPress={handleReject}
//           >
//             <Text style={styles.btnText}>Reject</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
//   navBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2196f3",
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     elevation: 3,
//   },
//   backButton: { marginRight: 10, padding: 4 },
//   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
//   container: { flex: 1, padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   label: { fontSize: 18, marginBottom: 10 },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
//   downloadBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 15,
//   },
//   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//   },
//   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
//   btn: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginHorizontal: 5,
//   },
//   approveBtn: { backgroundColor: "#4CAF50" },
//   rejectBtn: { backgroundColor: "#FF3B30" },
//   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   Linking,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";

// import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// export default function AdminKycDetail({ route, navigation }) {
//   const { kycId } = route.params;
//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [reason, setReason] = useState("");
//   const [downloading, setDownloading] = useState(false);

//   const BASE_URL = "https://192.168.217.218:8080"; // Use HTTPS for secure browser download

//   useEffect(() => {
//     fetchKycDetail();
//   }, []);

//   const fetchKycDetail = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchPendingKyc();
//       const content = res.data?.data?.content || [];
//       const selectedKyc = content.find((item) => item.id === kycId);

//       if (!selectedKyc) {
//         Alert.alert(
//           "KYC Not Found",
//           "This KYC request is no longer available."
//         );
//         navigation.goBack();
//         return;
//       }

//       setKyc(selectedKyc);
//     } catch (err) {
//       console.error(
//         "Fetch KYC Detail Error:",
//         err.response?.data || err.message
//       );
//       Alert.alert("Error", "Failed to fetch KYC details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadKycFile = async () => {
//     if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");

//     try {
//       setDownloading(true);
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       // Full secure download URL with token
//       const fileUrl = `${BASE_URL}/${kyc.downloadUrl}?token=${token}`;

//       console.log("Opening KYC in browser:", fileUrl);

//       const supported = await Linking.canOpenURL(fileUrl);
//       if (supported) {
//         await Linking.openURL(fileUrl);
//       } else {
//         Alert.alert("Error", "Cannot open browser to download KYC.");
//       }
//     } catch (err) {
//       console.error("Download error:", err);
//       Alert.alert("Error", "Failed to download KYC file.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const handleApprove = async () => {
//     try {
//       await approveKyc(kyc.id);
//       Alert.alert("Success", "KYC Approved!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Approve KYC Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to approve KYC.");
//     }
//   };

//   const handleReject = async () => {
//     if (!reason.trim()) {
//       Alert.alert("Reason Required", "Please provide a reason for rejection.");
//       return;
//     }
//     try {
//       await rejectKyc(kyc.id, reason);
//       Alert.alert("Success", "KYC Rejected!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Reject KYC Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to reject KYC.");
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196f3" />
//       </View>
//     );

//   if (!kyc)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.empty}>KYC not found.</Text>
//       </View>
//     );

//   return (
//     <View style={styles.wrapper}>
//       <View style={styles.navBar}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.navTitle}>KYC Detail</Text>
//       </View>

//       <ScrollView style={styles.container}>
//         <Text style={styles.label}>Name: {kyc.userName}</Text>
//         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
//         <Text style={styles.label}>Role: {kyc.roleType}</Text>
//         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
//         <Text style={styles.label}>Status: {kyc.status}</Text>

//         <TouchableOpacity
//           style={[
//             styles.downloadBtn,
//             downloading && { backgroundColor: "#ccc" },
//           ]}
//           onPress={downloadKycFile}
//           disabled={downloading}
//         >
//           {downloading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.downloadText}>Download / Open Document</Text>
//           )}
//         </TouchableOpacity>

//         <TextInput
//           style={styles.input}
//           placeholder="Reason for rejection"
//           value={reason}
//           onChangeText={setReason}
//         />

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={[styles.btn, styles.approveBtn]}
//             onPress={handleApprove}
//           >
//             <Text style={styles.btnText}>Approve</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.btn, styles.rejectBtn]}
//             onPress={handleReject}
//           >
//             <Text style={styles.btnText}>Reject</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
//   navBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2196f3",
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     elevation: 3,
//   },
//   backButton: { marginRight: 10, padding: 4 },
//   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
//   container: { flex: 1, padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   label: { fontSize: 18, marginBottom: 10 },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
//   downloadBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 15,
//   },
//   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//   },
//   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
//   btn: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginHorizontal: 5,
//   },
//   approveBtn: { backgroundColor: "#4CAF50" },
//   rejectBtn: { backgroundColor: "#FF3B30" },
//   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Linking from "react-native"; // fallback if expo-linking is unavailable
// import { Ionicons } from "@expo/vector-icons";

// import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// export default function AdminKycDetail({ route, navigation }) {
//   const { kycId } = route.params;
//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [reason, setReason] = useState("");
//   const [downloading, setDownloading] = useState(false);

//   const BASE_URL = "http://192.168.217.218:8080"; // local dev server

//   useEffect(() => {
//     fetchKycDetail();
//   }, []);

//   const fetchKycDetail = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchPendingKyc();
//       const content = res.data?.data?.content || [];
//       const selectedKyc = content.find((item) => item.id === kycId);
//       if (!selectedKyc) {
//         Alert.alert(
//           "KYC Not Found",
//           "This KYC request is no longer available."
//         );
//         navigation.goBack();
//         return;
//       }
//       setKyc(selectedKyc);
//     } catch (err) {
//       console.error(
//         "Fetch KYC Detail Error:",
//         err.response?.data || err.message
//       );
//       Alert.alert("Error", "Failed to fetch KYC details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadKycFile = async () => {
//     if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");

//     try {
//       setDownloading(true);

//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       // Full URL for file download
//       const fileUrl = `${BASE_URL}/${kyc.downloadUrl}?token=${token}`;
//       console.log("Opening KYC in browser:", fileUrl);

//       const supported = await Linking.canOpenURL(fileUrl);
//       if (supported) {
//         await Linking.openURL(fileUrl); // browser will download the file
//       } else {
//         Alert.alert("Error", "Cannot open browser to download KYC.");
//       }
//     } catch (err) {
//       console.error("Download error:", err);
//       Alert.alert("Error", "Failed to download KYC file.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const handleApprove = async () => {
//     try {
//       await approveKyc(kyc.id);
//       Alert.alert("Success", "KYC Approved!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Approve KYC Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to approve KYC.");
//     }
//   };

//   const handleReject = async () => {
//     if (!reason.trim()) {
//       Alert.alert("Reason Required", "Please provide a reason for rejection.");
//       return;
//     }
//     try {
//       await rejectKyc(kyc.id, reason);
//       Alert.alert("Success", "KYC Rejected!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Reject KYC Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to reject KYC.");
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196f3" />
//       </View>
//     );

//   if (!kyc)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.empty}>KYC not found.</Text>
//       </View>
//     );

//   return (
//     <View style={styles.wrapper}>
//       <View style={styles.navBar}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.navTitle}>KYC Detail</Text>
//       </View>

//       <ScrollView style={styles.container}>
//         <Text style={styles.label}>Name: {kyc.userName}</Text>
//         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
//         <Text style={styles.label}>Role: {kyc.roleType}</Text>
//         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
//         <Text style={styles.label}>Status: {kyc.status}</Text>

//         <TouchableOpacity
//           style={[
//             styles.downloadBtn,
//             downloading && { backgroundColor: "#ccc" },
//           ]}
//           onPress={downloadKycFile}
//           disabled={downloading}
//         >
//           {downloading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.downloadText}>Download / Open Document</Text>
//           )}
//         </TouchableOpacity>

//         <TextInput
//           style={styles.input}
//           placeholder="Reason for rejection"
//           value={reason}
//           onChangeText={setReason}
//         />

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={[styles.btn, styles.approveBtn]}
//             onPress={handleApprove}
//           >
//             <Text style={styles.btnText}>Approve</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.btn, styles.rejectBtn]}
//             onPress={handleReject}
//           >
//             <Text style={styles.btnText}>Reject</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
//   navBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2196f3",
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     elevation: 3,
//   },
//   backButton: { marginRight: 10, padding: 4 },
//   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
//   container: { flex: 1, padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   label: { fontSize: 18, marginBottom: 10 },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
//   downloadBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 15,
//   },
//   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//   },
//   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
//   btn: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginHorizontal: 5,
//   },
//   approveBtn: { backgroundColor: "#4CAF50" },
//   rejectBtn: { backgroundColor: "#FF3B30" },
//   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });

// //half corret
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   Platform,
//   Linking,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// export default function AdminKycDetail({ route, navigation }) {
//   const { kycId } = route.params;
//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [reason, setReason] = useState("");
//   const [downloading, setDownloading] = useState(false);

//   // For testing, use HTTP for local network, HTTPS for production or Ngrok
//   const BASE_URL = "https://192.168.217.218:8080";

//   useEffect(() => {
//     fetchKycDetail();
//   }, []);

//   const fetchKycDetail = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchPendingKyc();
//       const content = res.data?.data?.content || [];
//       const selectedKyc = content.find((item) => item.id === kycId);

//       if (!selectedKyc) {
//         Alert.alert(
//           "KYC Not Found",
//           "This KYC request is no longer available."
//         );
//         navigation.goBack();
//         return;
//       }

//       setKyc(selectedKyc);
//     } catch (err) {
//       console.error(
//         "Fetch KYC Detail Error:",
//         err.response?.data || err.message
//       );
//       Alert.alert("Error", "Failed to fetch KYC details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Opens KYC file in browser
//   const downloadKycFile = async () => {
//     if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");

//     try {
//       setDownloading(true);
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       const fileUrl = `${BASE_URL}/${kyc.downloadUrl}?token=${token}`;
//       console.log("Opening KYC in browser:", fileUrl);

//       const supported = await Linking.canOpenURL(fileUrl);
//       if (supported) {
//         // On mobile, this opens the default browser (Chrome/Safari)
//         await Linking.openURL(fileUrl);
//       } else {
//         Alert.alert("Error", "Cannot open browser to download KYC.");
//       }
//     } catch (err) {
//       console.error("Download error:", err);
//       Alert.alert("Error", "Failed to download KYC file.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const handleApprove = async () => {
//     try {
//       await approveKyc(kyc.id);
//       Alert.alert("Success", "KYC Approved!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Approve KYC Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to approve KYC.");
//     }
//   };

//   const handleReject = async () => {
//     if (!reason.trim()) {
//       Alert.alert("Reason Required", "Please provide a reason for rejection.");
//       return;
//     }
//     try {
//       await rejectKyc(kyc.id, reason);
//       Alert.alert("Success", "KYC Rejected!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Reject KYC Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to reject KYC.");
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196f3" />
//       </View>
//     );

//   if (!kyc)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.empty}>KYC not found.</Text>
//       </View>
//     );

//   return (
//     <View style={styles.wrapper}>
//       <View style={styles.navBar}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.navTitle}>KYC Detail</Text>
//       </View>

//       <ScrollView style={styles.container}>
//         <Text style={styles.label}>Name: {kyc.userName}</Text>
//         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
//         <Text style={styles.label}>Role: {kyc.roleType}</Text>
//         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
//         <Text style={styles.label}>Status: {kyc.status}</Text>

//         <TouchableOpacity
//           style={[
//             styles.downloadBtn,
//             downloading && { backgroundColor: "#ccc" },
//           ]}
//           onPress={downloadKycFile}
//           disabled={downloading}
//         >
//           {downloading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.downloadText}>Download / Open Document</Text>
//           )}
//         </TouchableOpacity>

//         <TextInput
//           style={styles.input}
//           placeholder="Reason for rejection"
//           value={reason}
//           onChangeText={setReason}
//         />

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={[styles.btn, styles.approveBtn]}
//             onPress={handleApprove}
//           >
//             <Text style={styles.btnText}>Approve</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.btn, styles.rejectBtn]}
//             onPress={handleReject}
//           >
//             <Text style={styles.btnText}>Reject</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
//   navBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2196f3",
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     elevation: 3,
//   },
//   backButton: { marginRight: 10, padding: 4 },
//   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
//   container: { flex: 1, padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   label: { fontSize: 18, marginBottom: 10 },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
//   downloadBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 15,
//   },
//   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//   },
//   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
//   btn: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginHorizontal: 5,
//   },
//   approveBtn: { backgroundColor: "#4CAF50" },
//   rejectBtn: { backgroundColor: "#FF3B30" },
//   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   Platform,
//   Linking,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";

// import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// export default function AdminKycDetail({ route, navigation }) {
//   const { kycId } = route.params;
//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [reason, setReason] = useState("");
//   const [downloading, setDownloading] = useState(false);

//   const BASE_URL = "https://192.168.217.218:8080"; // local HTTPS

//   useEffect(() => {
//     fetchKycDetail();
//   }, []);

//   const fetchKycDetail = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchPendingKyc();
//       const content = res.data?.data?.content || [];
//       const selectedKyc = content.find((item) => item.id === kycId);

//       if (!selectedKyc) {
//         Alert.alert(
//           "KYC Not Found",
//           "This KYC request is no longer available."
//         );
//         navigation.goBack();
//         return;
//       }

//       setKyc(selectedKyc);
//     } catch (err) {
//       console.error(
//         "Fetch KYC Detail Error:",
//         err.response?.data || err.message
//       );
//       Alert.alert("Error", "Failed to fetch KYC details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadKycFile = async () => {
//     if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");

//     try {
//       setDownloading(true);
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       const fileUrl = `${BASE_URL}/${kyc.downloadUrl}?token=${token}`;
//       console.log("Opening KYC in browser:", fileUrl);

//       // ✅ Open URL in browser (mobile + web)
//       const supported = await Linking.canOpenURL(fileUrl);
//       if (supported) {
//         await Linking.openURL(fileUrl); // Chrome/Default browser
//       } else {
//         Alert.alert("Error", "Cannot open browser to download KYC.");
//       }
//     } catch (err) {
//       console.error("Download error:", err);
//       Alert.alert("Error", "Failed to open KYC file.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const handleApprove = async () => {
//     try {
//       await approveKyc(kyc.id);
//       Alert.alert("Success", "KYC Approved!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Approve KYC Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to approve KYC.");
//     }
//   };

//   const handleReject = async () => {
//     if (!reason.trim()) {
//       Alert.alert("Reason Required", "Please provide a reason for rejection.");
//       return;
//     }
//     try {
//       await rejectKyc(kyc.id, reason);
//       Alert.alert("Success", "KYC Rejected!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Reject KYC Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to reject KYC.");
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196f3" />
//       </View>
//     );

//   if (!kyc)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.empty}>KYC not found.</Text>
//       </View>
//     );

//   return (
//     <View style={styles.wrapper}>
//       <View style={styles.navBar}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.navTitle}>KYC Detail</Text>
//       </View>

//       <ScrollView style={styles.container}>
//         <Text style={styles.label}>Name: {kyc.userName}</Text>
//         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
//         <Text style={styles.label}>Role: {kyc.roleType}</Text>
//         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
//         <Text style={styles.label}>Status: {kyc.status}</Text>

//         <TouchableOpacity
//           style={[
//             styles.downloadBtn,
//             downloading && { backgroundColor: "#ccc" },
//           ]}
//           onPress={downloadKycFile}
//           disabled={downloading}
//         >
//           {downloading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.downloadText}>Download / Open Document</Text>
//           )}
//         </TouchableOpacity>

//         <TextInput
//           style={styles.input}
//           placeholder="Reason for rejection"
//           value={reason}
//           onChangeText={setReason}
//         />

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={[styles.btn, styles.approveBtn]}
//             onPress={handleApprove}
//           >
//             <Text style={styles.btnText}>Approve</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.btn, styles.rejectBtn]}
//             onPress={handleReject}
//           >
//             <Text style={styles.btnText}>Reject</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
//   navBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2196f3",
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     elevation: 3,
//   },
//   backButton: { marginRight: 10, padding: 4 },
//   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
//   container: { flex: 1, padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   label: { fontSize: 18, marginBottom: 10 },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
//   downloadBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 15,
//   },
//   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//   },
//   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
//   btn: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginHorizontal: 5,
//   },
//   approveBtn: { backgroundColor: "#4CAF50" },
//   rejectBtn: { backgroundColor: "#FF3B30" },
//   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   StyleSheet,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as FileSystem from "expo-file-system";
// import * as MediaLibrary from "expo-media-library";
// import * as Sharing from "expo-sharing";

// import { Ionicons } from "@expo/vector-icons";
// import { fetchPendingKyc } from "../api/admin";

// export default function AdminKycDetail({ route, navigation }) {
//   const { kycId } = route.params;
//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [downloading, setDownloading] = useState(false);

//   const BASE_URL = "https://192.168.217.218:8080"; // Make sure HTTPS works

//   useEffect(() => {
//     loadKycDetail();
//   }, []);

//   const loadKycDetail = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchPendingKyc();
//       const content = res.data?.data?.content || [];
//       const selected = content.find((item) => item.id === kycId);
//       if (!selected) {
//         Alert.alert("KYC Not Found");
//         navigation.goBack();
//         return;
//       }
//       setKyc(selected);
//     } catch (err) {
//       console.error("Fetch KYC Error:", err);
//       Alert.alert("Error fetching KYC details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadKycFile = async () => {
//     if (!kyc) return;

//     try {
//       setDownloading(true);
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       const fileUrl = `${BASE_URL}/api/admin/kyc/file/${kyc.id}?token=${token}`;

//       if (Platform.OS === "web") {
//         // Open in new tab, Chrome will download
//         window.open(fileUrl, "_blank");
//         return;
//       }

//       // Mobile: download to file system
//       const extension = kyc.docType?.toLowerCase() || "pdf";
//       const fileName = `${kyc.userName}_${kyc.id}.${extension}`;
//       const fileUri = FileSystem.cacheDirectory + fileName;

//       const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);

//       // Android: save to MediaLibrary Downloads
//       if (Platform.OS === "android") {
//         const { status } = await MediaLibrary.requestPermissionsAsync();
//         if (status !== "granted") return Alert.alert("Permission denied");
//         const asset = await MediaLibrary.createAssetAsync(uri);
//         await MediaLibrary.createAlbumAsync("Download", asset, false);
//         Alert.alert("Download Complete", "Saved to Downloads folder!");
//       }
//       // iOS: share dialog
//       else if (Platform.OS === "ios") {
//         if (await Sharing.isAvailableAsync()) {
//           await Sharing.shareAsync(uri);
//         } else {
//           Alert.alert("Download Complete", "Saved in app cache.");
//         }
//       }
//     } catch (err) {
//       console.error("Download Error:", err);
//       Alert.alert("Error", "Failed to download KYC file.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196f3" />
//       </View>
//     );

//   if (!kyc)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.empty}>KYC not found.</Text>
//       </View>
//     );

//   return (
//     <View style={styles.wrapper}>
//       <View style={styles.navBar}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.navTitle}>KYC Detail</Text>
//       </View>

//       <ScrollView style={styles.container}>
//         <Text style={styles.label}>Name: {kyc.userName}</Text>
//         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
//         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
//         <Text style={styles.label}>Status: {kyc.status}</Text>

//         <TouchableOpacity
//           style={[styles.downloadBtn, downloading && { backgroundColor: "#ccc" }]}
//           onPress={downloadKycFile}
//           disabled={downloading}
//         >
//           {downloading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.downloadText}>Download / Open Document</Text>
//           )}
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
//   navBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2196f3",
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     elevation: 3,
//   },
//   backButton: { marginRight: 10, padding: 4 },
//   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
//   container: { flex: 1, padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   label: { fontSize: 18, marginBottom: 10 },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
//   downloadBtn: { backgroundColor: "#2196f3", padding: 12, borderRadius: 8, alignItems: "center", marginVertical: 15 },
//   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });

///.................................................................................................................................
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   Platform,
//   Linking,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// export default function AdminKycDetail({ route, navigation }) {
//   const { kycId } = route.params;
//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [reason, setReason] = useState("");
//   const [downloading, setDownloading] = useState(false);

//   // For testing, use HTTP for local network, HTTPS for production or Ngrok
//   const BASE_URL = "http://192.168.217.218:8080";

//   useEffect(() => {
//     fetchKycDetail();
//   }, []);

//   const fetchKycDetail = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchPendingKyc();
//       const content = res.data?.data?.content || [];
//       const selectedKyc = content.find((item) => item.id === kycId);

//       if (!selectedKyc) {
//         Alert.alert(
//           "KYC Not Found",
//           "This KYC request is no longer available."
//         );
//         navigation.goBack();
//         return;
//       }

//       setKyc(selectedKyc);
//     } catch (err) {
//       console.error(
//         "Fetch KYC Detail Error:",
//         err.response?.data || err.message
//       );
//       Alert.alert("Error", "Failed to fetch KYC details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Opens KYC file in browser
//   const downloadKycFile = async () => {
//     if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");

//     try {
//       setDownloading(true);
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       const fileUrl = `${BASE_URL}/${kyc.downloadUrl}?token=${token}`;
//       console.log("Opening KYC in browser:", fileUrl);

//       const supported = await Linking.canOpenURL(fileUrl);
//       if (supported) {
//         // On mobile, this opens the default browser (Chrome/Safari)
//         await Linking.openURL(fileUrl);
//       } else {
//         Alert.alert("Error", "Cannot open browser to download KYC.");
//       }
//     } catch (err) {
//       console.error("Download error:", err);
//       Alert.alert("Error", "Failed to download KYC file.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const handleApprove = async () => {
//     try {
//       await approveKyc(kyc.id);
//       Alert.alert("Success", "KYC Approved!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Approve KYC Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to approve KYC.");
//     }
//   };

//   const handleReject = async () => {
//     if (!reason.trim()) {
//       Alert.alert("Reason Required", "Please provide a reason for rejection.");
//       return;
//     }
//     try {
//       await rejectKyc(kyc.id, reason);
//       Alert.alert("Success", "KYC Rejected!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Reject KYC Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to reject KYC.");
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196f3" />
//       </View>
//     );

//   if (!kyc)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.empty}>KYC not found.</Text>
//       </View>
//     );

//   return (
//     <View style={styles.wrapper}>
//       <View style={styles.navBar}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.navTitle}>KYC Detail</Text>
//       </View>

//       <ScrollView style={styles.container}>
//         <Text style={styles.label}>Name: {kyc.userName}</Text>
//         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
//         <Text style={styles.label}>Role: {kyc.roleType}</Text>
//         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
//         <Text style={styles.label}>Status: {kyc.status}</Text>

//         <TouchableOpacity
//           style={[
//             styles.downloadBtn,
//             downloading && { backgroundColor: "#ccc" },
//           ]}
//           onPress={downloadKycFile}
//           disabled={downloading}
//         >
//           {downloading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.downloadText}>Download / Open Document</Text>
//           )}
//         </TouchableOpacity>

//         <TextInput
//           style={styles.input}
//           placeholder="Reason for rejection"
//           value={reason}
//           onChangeText={setReason}
//         />

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={[styles.btn, styles.approveBtn]}
//             onPress={handleApprove}
//           >
//             <Text style={styles.btnText}>Approve</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.btn, styles.rejectBtn]}
//             onPress={handleReject}
//           >
//             <Text style={styles.btnText}>Reject</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
//   navBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2196f3",
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     elevation: 3,
//   },
//   backButton: { marginRight: 10, padding: 4 },
//   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
//   container: { flex: 1, padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   label: { fontSize: 18, marginBottom: 10 },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
//   downloadBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 15,
//   },
//   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//   },
//   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
//   btn: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginHorizontal: 5,
//   },
//   approveBtn: { backgroundColor: "#4CAF50" },
//   rejectBtn: { backgroundColor: "#FF3B30" },
//   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });
//---------------------------------------------------------------------------------
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   Platform,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as FileSystem from "expo-file-system";
// import * as MediaLibrary from "expo-media-library";
// import * as Sharing from "expo-sharing";
// import { Ionicons } from "@expo/vector-icons";

// import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// export default function AdminKycDetail({ route, navigation }) {
//   const { kycId } = route.params;
//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [downloading, setDownloading] = useState(false);

//   const BASE_URL = "http://192.168.217.218:8080";

//   useEffect(() => {
//     fetchKycDetail();
//   }, []);

//   const fetchKycDetail = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchPendingKyc();
//       const content = res.data?.data?.content || [];
//       const selected = content.find((item) => item.id === kycId);
//       if (!selected) {
//         Alert.alert("KYC Not Found");
//         navigation.goBack();
//         return;
//       }
//       setKyc(selected);
//     } catch (err) {
//       console.error("Fetch KYC Error:", err);
//       Alert.alert("Error fetching KYC details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadKycFile = async () => {
//     if (!kyc) return;

//     try {
//       setDownloading(true);
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       const fileUrl = `${BASE_URL}/api/admin/kyc/file/${kyc.id}`;
//       const extension = kyc.docType?.toLowerCase() || "pdf";
//       const fileName = `${kyc.userName}_${kyc.id}.${extension}`;
//       const fileUri = FileSystem.cacheDirectory + fileName;

//       // Download with JWT Authorization header
//       const downloadResumable = FileSystem.createDownloadResumable(
//         fileUrl,
//         fileUri,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const { uri } = await downloadResumable.downloadAsync();

//       if (Platform.OS === "android") {
//         const { status } = await MediaLibrary.requestPermissionsAsync();
//         if (status !== "granted") return Alert.alert("Permission denied");

//         const asset = await MediaLibrary.createAssetAsync(uri);
//         await MediaLibrary.createAlbumAsync("Download", asset, false);
//         Alert.alert("Download Complete", "Saved to Downloads folder!");
//       } else if (Platform.OS === "ios") {
//         if (await Sharing.isAvailableAsync()) {
//           await Sharing.shareAsync(uri);
//         } else {
//           Alert.alert("Download Complete", "Saved in app cache.");
//         }
//       }
//     } catch (err) {
//       console.error("Download Error:", err);
//       Alert.alert("Error", "Failed to download KYC file.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196f3" />
//       </View>
//     );

//   if (!kyc)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.empty}>KYC not found.</Text>
//       </View>
//     );

//   return (
//     <View style={styles.wrapper}>
//       <View style={styles.navBar}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.navTitle}>KYC Detail</Text>
//       </View>

//       <ScrollView style={styles.container}>
//         <Text style={styles.label}>Name: {kyc.userName}</Text>
//         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
//         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
//         <Text style={styles.label}>Status: {kyc.status}</Text>

//         <TouchableOpacity
//           style={[
//             styles.downloadBtn,
//             downloading && { backgroundColor: "#ccc" },
//           ]}
//           onPress={downloadKycFile}
//           disabled={downloading}
//         >
//           {downloading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.downloadText}>Download / Open Document</Text>
//           )}
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
//   navBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2196f3",
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     elevation: 3,
//   },
//   backButton: { marginRight: 10, padding: 4 },
//   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
//   container: { flex: 1, padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   label: { fontSize: 18, marginBottom: 10 },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
//   downloadBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 15,
//   },
//   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   Platform,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as FileSystem from "expo-file-system";
// import * as MediaLibrary from "expo-media-library";
// import * as Sharing from "expo-sharing";
// import { Ionicons } from "@expo/vector-icons";

// import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// export default function AdminKycDetail({ route, navigation }) {
//   const { kycId } = route.params;
//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [reason, setReason] = useState("");
//   const [downloading, setDownloading] = useState(false);

//   const BASE_URL = "http://192.168.217.218:8080"; // replace with https if possible

//   useEffect(() => {
//     fetchKycDetail();
//   }, []);

//   const fetchKycDetail = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchPendingKyc();
//       const content = res.data?.data?.content || [];
//       const selectedKyc = content.find((item) => item.id === kycId);

//       if (!selectedKyc) {
//         Alert.alert(
//           "KYC Not Found",
//           "This KYC request is no longer available."
//         );
//         navigation.goBack();
//         return;
//       }

//       setKyc(selectedKyc);
//     } catch (err) {
//       console.error("Fetch KYC Detail Error:", err);
//       Alert.alert("Error", "Failed to fetch KYC details.");
//     } finally {
//       setLoading(false);
//     }
//   };
//   const downloadKycFile = async () => {
//     if (!kyc) return;

//     try {
//       setDownloading(true);
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       const fileUrl = `${BASE_URL}/api/admin/kyc/file/${kyc.id}`;
//       const extension = kyc.docType?.toLowerCase() || "pdf";
//       const fileName = `${kyc.userName}_${kyc.id}.${extension}`;

//       if (Platform.OS === "web") {
//         // Web download with JWT
//         const response = await fetch(fileUrl, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const blob = await response.blob();
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = fileName;
//         a.click();
//         URL.revokeObjectURL(url);
//       } else {
//         // Mobile download with JWT
//         const fileUri = FileSystem.cacheDirectory + fileName;
//         const downloadResumable = FileSystem.createDownloadResumable(
//           fileUrl,
//           fileUri,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         const { uri } = await downloadResumable.downloadAsync();

//         if (Platform.OS === "android") {
//           const { status } = await MediaLibrary.requestPermissionsAsync();
//           if (status !== "granted") return Alert.alert("Permission denied");

//           const asset = await MediaLibrary.createAssetAsync(uri);
//           await MediaLibrary.createAlbumAsync("Download", asset, false);
//           Alert.alert("Download Complete", "File saved to Downloads folder!");
//         } else if (Platform.OS === "ios") {
//           if (await Sharing.isAvailableAsync()) {
//             await Sharing.shareAsync(uri);
//           } else {
//             Alert.alert("Download Complete", "File saved in app cache.");
//           }
//         }
//       }
//     } catch (err) {
//       console.error("Download error:", err);
//       Alert.alert("Error", "Failed to download KYC file.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const handleApprove = async () => {
//     try {
//       await approveKyc(kyc.id);
//       Alert.alert("Success", "KYC Approved!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Approve KYC Error:", err);
//       Alert.alert("Error", "Failed to approve KYC.");
//     }
//   };

//   const handleReject = async () => {
//     if (!reason.trim()) {
//       Alert.alert("Reason Required", "Please provide a reason for rejection.");
//       return;
//     }
//     try {
//       await rejectKyc(kyc.id, reason);
//       Alert.alert("Success", "KYC Rejected!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Reject KYC Error:", err);
//       Alert.alert("Error", "Failed to reject KYC.");
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196f3" />
//       </View>
//     );

//   if (!kyc)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.empty}>KYC not found.</Text>
//       </View>
//     );

//   return (
//     <View style={styles.wrapper}>
//       <View style={styles.navBar}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.navTitle}>KYC Detail</Text>
//       </View>

//       <ScrollView style={styles.container}>
//         <Text style={styles.label}>Name: {kyc.userName}</Text>
//         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
//         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
//         <Text style={styles.label}>Status: {kyc.status}</Text>

//         <TouchableOpacity
//           style={[
//             styles.downloadBtn,
//             downloading && { backgroundColor: "#ccc" },
//           ]}
//           onPress={downloadKycFile}
//           disabled={downloading}
//         >
//           {downloading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.downloadText}>Download / Open Document</Text>
//           )}
//         </TouchableOpacity>

//         <TextInput
//           style={styles.input}
//           placeholder="Reason for rejection"
//           value={reason}
//           onChangeText={setReason}
//         />

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={[styles.btn, styles.approveBtn]}
//             onPress={handleApprove}
//           >
//             <Text style={styles.btnText}>Approve</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.btn, styles.rejectBtn]}
//             onPress={handleReject}
//           >
//             <Text style={styles.btnText}>Reject</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
//   navBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2196f3",
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     elevation: 3,
//   },
//   backButton: { marginRight: 10, padding: 4 },
//   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
//   container: { flex: 1, padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   label: { fontSize: 18, marginBottom: 10 },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
//   downloadBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 15,
//   },
//   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//   },
//   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
//   btn: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginHorizontal: 5,
//   },
//   approveBtn: { backgroundColor: "#4CAF50" },
//   rejectBtn: { backgroundColor: "#FF3B30" },
//   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   Platform,
//   Modal,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as FileSystem from "expo-file-system";
// import * as MediaLibrary from "expo-media-library";
// import * as Sharing from "expo-sharing";
// import { Ionicons } from "@expo/vector-icons";
// import { WebView } from "react-native-webview";

// import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// export default function AdminKycDetail({ route, navigation }) {
//   const { kycId } = route.params;
//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [reason, setReason] = useState("");
//   const [downloading, setDownloading] = useState(false);
//   const [fileUri, setFileUri] = useState(null);
//   const [showViewer, setShowViewer] = useState(false);

//   const BASE_URL = "http://192.168.217.218:8080"; // your local API

//   useEffect(() => {
//     fetchKycDetail();
//   }, []);

//   const fetchKycDetail = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchPendingKyc();
//       const content = res?.data?.data?.content || [];
//       const selectedKyc = content.find((item) => item.id === kycId);

//       if (!selectedKyc) {
//         Alert.alert(
//           "KYC Not Found",
//           "This KYC request is no longer available."
//         );
//         navigation.goBack();
//         return;
//       }

//       setKyc(selectedKyc);
//     } catch (err) {
//       console.error("Fetch KYC Detail Error:", err);
//       Alert.alert("Error", "Failed to fetch KYC details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadKycFile = async (openAfter = false) => {
//     if (!kyc) return;

//     try {
//       setDownloading(true);
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       const fileUrl = `${BASE_URL}/api/admin/kyc/file/${kyc.id}`;
//       const extension = (kyc.docType || "pdf").toLowerCase();
//       const fileName = `${kyc.userName || "KYC"}_${kyc.id}.${extension}`;
//       const filePath = FileSystem.cacheDirectory + fileName;

//       console.log("Downloading:", fileUrl);

//       const { uri } = await FileSystem.downloadAsync(fileUrl, filePath, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       console.log("File downloaded to:", uri);
//       setFileUri(uri);

//       if (Platform.OS === "android") {
//         const { status } = await MediaLibrary.requestPermissionsAsync();
//         if (status === "granted") {
//           const asset = await MediaLibrary.createAssetAsync(uri);
//           await MediaLibrary.createAlbumAsync("Download", asset, false);
//         }
//       }

//       if (openAfter) {
//         // open the viewer modal
//         setShowViewer(true);
//       } else {
//         Alert.alert("Success", "File downloaded successfully!");
//       }
//     } catch (err) {
//       console.error("Download error:", err);
//       Alert.alert("Error", "Failed to download file.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const openFileExternally = async () => {
//     if (!fileUri) {
//       Alert.alert("No file found", "Please download the file first.");
//       return;
//     }
//     if (await Sharing.isAvailableAsync()) {
//       await Sharing.shareAsync(fileUri);
//     } else {
//       Alert.alert("Info", "Sharing not supported on this device.");
//     }
//   };

//   const handleApprove = async () => {
//     try {
//       await approveKyc(kyc.id);
//       Alert.alert("Success", "KYC Approved!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Approve KYC Error:", err);
//       Alert.alert("Error", "Failed to approve KYC.");
//     }
//   };

//   const handleReject = async () => {
//     if (!reason.trim()) {
//       Alert.alert("Reason Required", "Please provide a reason for rejection.");
//       return;
//     }
//     try {
//       await rejectKyc(kyc.id, reason);
//       Alert.alert("Success", "KYC Rejected!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Reject KYC Error:", err);
//       Alert.alert("Error", "Failed to reject KYC.");
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196f3" />
//       </View>
//     );

//   if (!kyc)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.empty}>KYC not found.</Text>
//       </View>
//     );

//   return (
//     <View style={styles.wrapper}>
//       {/* Header */}
//       <View style={styles.navBar}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.navTitle}>KYC Detail</Text>
//       </View>

//       <ScrollView style={styles.container}>
//         <Text style={styles.label}>Name: {kyc.userName}</Text>
//         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
//         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
//         <Text style={styles.label}>Status: {kyc.status}</Text>

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={[styles.btn, styles.downloadBtn]}
//             onPress={() => downloadKycFile(false)}
//             disabled={downloading}
//           >
//             {downloading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.btnText}>Download File</Text>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.btn, styles.viewBtn]}
//             onPress={() => downloadKycFile(true)}
//           >
//             <Text style={styles.btnText}>View File</Text>
//           </TouchableOpacity>
//         </View>

//         <TextInput
//           style={styles.input}
//           placeholder="Reason for rejection"
//           value={reason}
//           onChangeText={setReason}
//           multiline
//         />

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={[styles.btn, styles.approveBtn]}
//             onPress={handleApprove}
//           >
//             <Text style={styles.btnText}>Approve</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.btn, styles.rejectBtn]}
//             onPress={handleReject}
//           >
//             <Text style={styles.btnText}>Reject</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* ✅ File Viewer Modal */}
//       <Modal visible={showViewer} animationType="slide">
//         <View style={{ flex: 1 }}>
//           <View style={styles.viewerHeader}>
//             <TouchableOpacity
//               onPress={() => setShowViewer(false)}
//               style={styles.backButton}
//             >
//               <Ionicons name="close" size={26} color="#fff" />
//             </TouchableOpacity>
//             <Text style={styles.navTitle}>View Document</Text>
//           </View>
//           {fileUri ? (
//             <WebView
//               source={{ uri: fileUri }}
//               style={{ flex: 1 }}
//               originWhitelist={["*"]}
//               useWebKit
//               startInLoadingState
//             />
//           ) : (
//             <View style={styles.loadingContainer}>
//               <Text>No file loaded</Text>
//             </View>
//           )}
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
//   navBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2196f3",
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     elevation: 3,
//   },
//   backButton: { marginRight: 10, padding: 4 },
//   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
//   container: { flex: 1, padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   label: { fontSize: 18, marginBottom: 10 },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//     minHeight: 60,
//   },
//   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
//   btn: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginHorizontal: 5,
//   },
//   downloadBtn: { backgroundColor: "#2196f3" },
//   viewBtn: { backgroundColor: "#00bcd4" },
//   approveBtn: { backgroundColor: "#4CAF50" },
//   rejectBtn: { backgroundColor: "#FF3B30" },
//   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   viewerHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2196f3",
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//   },
// });

// // import React, { useState } from "react";
// // import {
// //   View,
// //   Text,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   Alert,
// //   Platform,
// //   StyleSheet,
// //   Modal,
// // } from "react-native";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import * as FileSystem from "expo-file-system/legacy"; // legacy downloadAsync
// // import * as MediaLibrary from "expo-media-library";
// // import * as Linking from "expo-linking";

// // const BASE_URL = "http://192.168.217.218:8080"; // your backend

// // export default function AdminKycDetail({ route }) {
// //   const { kyc } = route.params;
// //   const [downloading, setDownloading] = useState(false);
// //   const [fileUri, setFileUri] = useState(null);

// //   // --- Download & Save File
// //   const downloadKycFile = async () => {
// //     if (!kyc) return;
// //     setDownloading(true);
// //     console.log("[Download] Started for KYC ID:", kyc.id);

// //     try {
// //       const token = await AsyncStorage.getItem("adminToken");
// //       console.log("[Download] Token:", token);
// //       if (!token) return Alert.alert("Error", "Admin not logged in");

// //       const fileUrl = `${BASE_URL}/api/admin/kyc/file/${kyc.id}`;
// //       console.log("[Download] File URL:", fileUrl);

// //       const extension = (kyc.docType || "pdf").toLowerCase();
// //       const fileName = `${kyc.userName || "KYC"}_${kyc.id}.${extension}`;
// //       const filePath = FileSystem.cacheDirectory + fileName;
// //       console.log("[Download] File path:", filePath);

// //       const { uri } = await FileSystem.downloadAsync(fileUrl, filePath, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       console.log("[Download] File downloaded at:", uri);
// //       setFileUri(uri);

// //       // Mobile: save to MediaLibrary
// //       if (Platform.OS !== "web") {
// //         const { status } = await MediaLibrary.requestPermissionsAsync();
// //         console.log("[Download] MediaLibrary status:", status);
// //         if (status === "granted") {
// //           const asset = await MediaLibrary.createAssetAsync(uri);
// //           await MediaLibrary.createAlbumAsync("Download", asset, false);
// //           console.log("[Download] File saved to MediaLibrary:", asset.uri);
// //           Alert.alert("Success", "File saved to Downloads folder!");
// //         } else {
// //           Alert.alert("Permission Denied", "Cannot save file without permission.");
// //         }
// //       } else {
// //         Alert.alert("Web", "Download complete (check browser download folder).");
// //       }
// //     } catch (err) {
// //       console.error("[Download Error]:", err);
// //       Alert.alert("Error", "Failed to download file.");
// //     } finally {
// //       setDownloading(false);
// //       console.log("[Download] Process finished");
// //     }
// //   };

// //   // --- Open file using system viewer
// //   const openFile = async () => {
// //     if (!fileUri) return Alert.alert("No file", "Download file first");
// //     console.log("[Open] Opening file at:", fileUri);
// //     if (Platform.OS === "web") window.open(fileUri, "_blank");
// //     else Linking.openURL(fileUri);
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.title}>KYC Detail</Text>
// //       <Text style={styles.label}>User: {kyc?.userName}</Text>
// //       <Text style={styles.label}>Phone: {kyc?.userPhone}</Text>
// //       <Text style={styles.label}>Document Type: {kyc?.docType}</Text>
// //       <Text style={styles.label}>Status: {kyc?.status}</Text>

// //       <TouchableOpacity
// //         style={styles.button}
// //         onPress={downloadKycFile}
// //         disabled={downloading}
// //       >
// //         {downloading ? (
// //           <ActivityIndicator color="#fff" />
// //         ) : (
// //           <Text style={styles.buttonText}>Download</Text>
// //         )}
// //       </TouchableOpacity>

// //       <TouchableOpacity style={styles.button} onPress={openFile}>
// //         <Text style={styles.buttonText}>Open File</Text>
// //       </TouchableOpacity>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, padding: 20, backgroundColor: "#f0f4f7" },
// //   title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
// //   label: { fontSize: 16, marginBottom: 10 },
// //   button: {
// //     backgroundColor: "#2196f3",
// //     padding: 12,
// //     borderRadius: 8,
// //     marginTop: 10,
// //     alignItems: "center",
// //   },
// //   buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// // });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   Platform,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as FileSystem from "expo-file-system/legacy";
// import * as MediaLibrary from "expo-media-library";
// import * as Sharing from "expo-sharing";
// import { Ionicons } from "@expo/vector-icons";

// import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// export default function AdminKycDetail({ route, navigation }) {
//   const { kycId } = route.params;
//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [reason, setReason] = useState("");
//   const [downloading, setDownloading] = useState(false);

//   const BASE_URL = "http://192.168.217.218:8080"; // replace with HTTPS in production

//   useEffect(() => {
//     fetchKycDetail();
//   }, []);

//   const fetchKycDetail = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchPendingKyc();
//       const content = res.data?.data?.content || [];
//       const selectedKyc = content.find((item) => item.id === kycId);

//       if (!selectedKyc) {
//         Alert.alert("KYC Not Found", "This KYC request is no longer available.");
//         navigation.goBack();
//         return;
//       }

//       setKyc(selectedKyc);
//     } catch (err) {
//       console.error("Fetch KYC Detail Error:", err);
//       Alert.alert("Error", "Failed to fetch KYC details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownload = async () => {
//     if (!kyc) return;

//     try {
//       setDownloading(true);
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       console.log("Downloading:", `${BASE_URL}/api/admin/kyc/file/${kyc.id}`);

//       const extension = kyc.docType?.toLowerCase() || "pdf";
//       const safeName = kyc.userName
//         .replace(/\s+/g, "_")
//         .replace(/\n/g, "")
//         .replace(/[^\w.-]/g, "");
//       const fileName = `${safeName}_${kyc.id}.${extension}`;

//       const fileUrl = `${BASE_URL}/api/admin/kyc/file/${encodeURIComponent(
//         String(kyc.id)
//       )}`;

//       if (Platform.OS === "web") {
//         const res = await fetch(fileUrl, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!res.ok) throw new Error(`HTTP error ${res.status}`);
//         const blob = await res.blob();
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = fileName;
//         a.click();
//         URL.revokeObjectURL(url);
//         console.log("File downloaded on Web");
//       } else {
//         const fileUri = FileSystem.cacheDirectory + fileName;
//         const downloadResumable = FileSystem.createDownloadResumable(
//           fileUrl,
//           fileUri,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const { uri } = await downloadResumable.downloadAsync();
//         console.log("File downloaded to:", uri);

//         if (Platform.OS === "android") {
//           const { status } = await MediaLibrary.requestPermissionsAsync();
//           if (status !== "granted")
//             return Alert.alert(
//               "Permission denied",
//               "Cannot save file without permission"
//             );

//           const asset = await MediaLibrary.createAssetAsync(uri);
//           await MediaLibrary.createAlbumAsync("Download", asset, false);
//           Alert.alert("Download Complete", "File saved to Downloads folder!");
//         } else if (Platform.OS === "ios") {
//           if (await Sharing.isAvailableAsync()) {
//             await Sharing.shareAsync(uri);
//           } else {
//             Alert.alert("Download Complete", "File saved in app cache.");
//           }
//         }
//       }
//     } catch (err) {
//       console.error("Download error:", err);
//       Alert.alert("Error", "Failed to download file");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const handleApprove = async () => {
//     try {
//       await approveKyc(kyc.id);
//       Alert.alert("Success", "KYC Approved!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Approve KYC Error:", err);
//       Alert.alert("Error", "Failed to approve KYC.");
//     }
//   };

//   const handleReject = async () => {
//     if (!reason.trim()) {
//       Alert.alert("Reason Required", "Please provide a reason for rejection.");
//       return;
//     }
//     try {
//       await rejectKyc(kyc.id, reason);
//       Alert.alert("Success", "KYC Rejected!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Reject KYC Error:", err);
//       Alert.alert("Error", "Failed to reject KYC.");
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196f3" />
//       </View>
//     );

//   if (!kyc)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.empty}>KYC not found.</Text>
//       </View>
//     );

//   return (
//     <View style={styles.wrapper}>
//       <View style={styles.navBar}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.navTitle}>KYC Detail</Text>
//       </View>

//       <ScrollView style={styles.container}>
//         <Text style={styles.label}>Name: {kyc.userName}</Text>
//         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
//         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
//         <Text style={styles.label}>Status: {kyc.status}</Text>

//         <TouchableOpacity
//           style={[styles.downloadBtn, downloading && { backgroundColor: "#ccc" }]}
//           onPress={handleDownload}
//           disabled={downloading}
//         >
//           {downloading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.downloadText}>Download / Open Document</Text>
//           )}
//         </TouchableOpacity>

//         <TextInput
//           style={styles.input}
//           placeholder="Reason for rejection"
//           value={reason}
//           onChangeText={setReason}
//         />

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={[styles.btn, styles.approveBtn]}
//             onPress={handleApprove}
//           >
//             <Text style={styles.btnText}>Approve</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.btn, styles.rejectBtn]}
//             onPress={handleReject}
//           >
//             <Text style={styles.btnText}>Reject</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
//   navBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2196f3",
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     elevation: 3,
//   },
//   backButton: { marginRight: 10, padding: 4 },
//   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
//   container: { flex: 1, padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   label: { fontSize: 18, marginBottom: 10 },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
//   downloadBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 15,
//   },
//   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//   },
//   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
//   btn: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginHorizontal: 5,
//   },
//   approveBtn: { backgroundColor: "#4CAF50" },
//   rejectBtn: { backgroundColor: "#FF3B30" },
//   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   Platform,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";
// import { Ionicons } from "@expo/vector-icons";

// import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// export default function AdminKycDetail({ route, navigation }) {
//   const { kycId } = route.params;
//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [reason, setReason] = useState("");
//   const [downloading, setDownloading] = useState(false);

//   const BASE_URL = "http://192.168.217.218:8080"; // replace with HTTPS if possible

//   useEffect(() => {
//     fetchKycDetail();
//   }, []);

//   const fetchKycDetail = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchPendingKyc();
//       const content = res.data?.data?.content || [];
//       const selectedKyc = content.find((item) => item.id === kycId);

//       if (!selectedKyc) {
//         Alert.alert(
//           "KYC Not Found",
//           "This KYC request is no longer available."
//         );
//         navigation.goBack();
//         return;
//       }

//       setKyc(selectedKyc);
//     } catch (err) {
//       console.error("Fetch KYC Detail Error:", err);
//       Alert.alert("Error", "Failed to fetch KYC details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadKycFile = async () => {
//     if (!kyc) return;
//     setDownloading(true);
//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       const fileUrl = `${BASE_URL}/api/admin/kyc/file/${kyc.id}`;
//       const extension = kyc.docType?.toLowerCase() || "pdf";
//       const fileName = `${kyc.userName}_${kyc.id}.${extension}`;
//       const fileUri = FileSystem.cacheDirectory + fileName;

//       console.log("Downloading:", fileUrl);

//       const response = await fetch(fileUrl, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!response.ok) throw new Error("Failed to fetch file");

//       const blob = await response.blob();
//       const arrayBuffer = await blob.arrayBuffer();
//       await FileSystem.writeAsStringAsync(
//         fileUri,
//         Buffer.from(arrayBuffer).toString("base64"),
//         { encoding: FileSystem.EncodingType.Base64 }
//       );

//       console.log("File downloaded to:", fileUri);

//       if (await Sharing.isAvailableAsync()) {
//         await Sharing.shareAsync(fileUri);
//       } else {
//         Alert.alert(
//           "Download Complete",
//           "File saved in app cache. You can view it via the app."
//         );
//       }
//     } catch (err) {
//       console.error("Download error:", err);
//       Alert.alert("Error", "Failed to download KYC file.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const handleApprove = async () => {
//     try {
//       await approveKyc(kyc.id);
//       Alert.alert("Success", "KYC Approved!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Approve KYC Error:", err);
//       Alert.alert("Error", "Failed to approve KYC.");
//     }
//   };

//   const handleReject = async () => {
//     if (!reason.trim()) {
//       Alert.alert("Reason Required", "Please provide a reason for rejection.");
//       return;
//     }
//     try {
//       await rejectKyc(kyc.id, reason);
//       Alert.alert("Success", "KYC Rejected!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Reject KYC Error:", err);
//       Alert.alert("Error", "Failed to reject KYC.");
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196f3" />
//       </View>
//     );

//   if (!kyc)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.empty}>KYC not found.</Text>
//       </View>
//     );

//   return (
//     <View style={styles.wrapper}>
//       <View style={styles.navBar}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}
//         >
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.navTitle}>KYC Detail</Text>
//       </View>

//       <ScrollView style={styles.container}>
//         <Text style={styles.label}>Name: {kyc.userName}</Text>
//         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
//         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
//         <Text style={styles.label}>Status: {kyc.status}</Text>

//         <TouchableOpacity
//           style={[
//             styles.downloadBtn,
//             downloading && { backgroundColor: "#ccc" },
//           ]}
//           onPress={downloadKycFile}
//           disabled={downloading}
//         >
//           {downloading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.downloadText}>Download / Open Document</Text>
//           )}
//         </TouchableOpacity>

//         <TextInput
//           style={styles.input}
//           placeholder="Reason for rejection"
//           value={reason}
//           onChangeText={setReason}
//         />

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={[styles.btn, styles.approveBtn]}
//             onPress={handleApprove}
//           >
//             <Text style={styles.btnText}>Approve</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.btn, styles.rejectBtn]}
//             onPress={handleReject}
//           >
//             <Text style={styles.btnText}>Reject</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
//   navBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#2196f3",
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     elevation: 3,
//   },
//   backButton: { marginRight: 10, padding: 4 },
//   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
//   container: { flex: 1, padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   label: { fontSize: 18, marginBottom: 10 },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
//   downloadBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 15,
//   },
//   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//   },
//   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
//   btn: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginHorizontal: 5,
//   },
//   approveBtn: { backgroundColor: "#4CAF50" },
//   rejectBtn: { backgroundColor: "#FF3B30" },
//   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";

// import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// export default function AdminKycDetail({ route, navigation }) {
//   const { kycId } = route.params;
//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [reason, setReason] = useState("");
//   const [downloading, setDownloading] = useState(false);

//   const BASE_URL = "http://192.168.217.218:8080"; // replace with HTTPS if possible

//   useEffect(() => {
//     fetchKycDetail();
//   }, []);

//   const fetchKycDetail = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchPendingKyc();
//       const content = res.data?.data?.content || [];
//       const selectedKyc = content.find((item) => item.id === kycId);

//       if (!selectedKyc) {
//         Alert.alert(
//           "KYC Not Found",
//           "This KYC request is no longer available."
//         );
//         navigation.goBack();
//         return;
//       }

//       setKyc(selectedKyc);
//     } catch (err) {
//       console.error("Fetch KYC Detail Error:", err);
//       Alert.alert("Error", "Failed to fetch KYC details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadKycFile = async () => {
//     if (!kyc) return;
//     setDownloading(true);
//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       const fileUrl = `${BASE_URL}/api/admin/kyc/file/${kyc.id}`;
//       const extension = kyc.docType?.toLowerCase() || "pdf";
//       const fileName = `${kyc.userName}_${kyc.id}.${extension}`;
//       const fileUri = FileSystem.cacheDirectory + fileName;

//       console.log("Downloading:", fileUrl);

//       const response = await fetch(fileUrl, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!response.ok) throw new Error("Failed to fetch file");

//       // Use arrayBuffer directly, then convert to base64
//       const arrayBuffer = await response.arrayBuffer();
//       const base64 = Buffer.from(arrayBuffer).toString("base64");

//       await FileSystem.writeAsStringAsync(fileUri, base64, {
//         encoding: FileSystem.EncodingType.Base64,
//       });

//       console.log("File downloaded to:", fileUri);

//       if (await Sharing.isAvailableAsync()) {
//         await Sharing.shareAsync(fileUri);
//       } else {
//         Alert.alert(
//           "Download Complete",
//           "File saved in app cache. You can view it via the app."
//         );
//       }
//     } catch (err) {
//       console.error("Download error:", err);
//       Alert.alert("Error", "Failed to download KYC file.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const handleApprove = async () => {
//     try {
//       await approveKyc(kyc.id);
//       Alert.alert("Success", "KYC Approved!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Approve KYC Error:", err);
//       Alert.alert("Error", "Failed to approve KYC.");
//     }
//   };

//   const handleReject = async () => {
//     if (!reason.trim()) {
//       Alert.alert("Reason Required", "Please provide a reason for rejection.");
//       return;
//     }
//     try {
//       await rejectKyc(kyc.id, reason);
//       Alert.alert("Success", "KYC Rejected!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Reject KYC Error:", err);
//       Alert.alert("Error", "Failed to reject KYC.");
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196f3" />
//       </View>
//     );

//   if (!kyc)
//     return (
//       <View style={styles.container}>
//         <Text style={styles.empty}>KYC not found.</Text>
//       </View>
//     );

//   return (
//     <View style={styles.wrapper}>
//       <ScrollView style={styles.container}>
//         <Text style={styles.label}>Name: {kyc.userName}</Text>
//         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
//         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
//         <Text style={styles.label}>Status: {kyc.status}</Text>

//         <TouchableOpacity
//           style={[
//             styles.downloadBtn,
//             downloading && { backgroundColor: "#ccc" },
//           ]}
//           onPress={downloadKycFile}
//           disabled={downloading}
//         >
//           {downloading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.downloadText}>Download / Open Document</Text>
//           )}
//         </TouchableOpacity>

//         <TextInput
//           style={styles.input}
//           placeholder="Reason for rejection"
//           value={reason}
//           onChangeText={setReason}
//         />

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={[styles.btn, styles.approveBtn]}
//             onPress={handleApprove}
//           >
//             <Text style={styles.btnText}>Approve</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.btn, styles.rejectBtn]}
//             onPress={handleReject}
//           >
//             <Text style={styles.btnText}>Reject</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
//   container: { flex: 1, padding: 20 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   label: { fontSize: 18, marginBottom: 10 },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
//   downloadBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 15,
//   },
//   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//   },
//   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
//   btn: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginHorizontal: 5,
//   },
//   approveBtn: { backgroundColor: "#4CAF50" },
//   rejectBtn: { backgroundColor: "#FF3B30" },
//   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

export default function AdminKycDetail({ route, navigation }) {
  const { kycId } = route.params;
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [downloading, setDownloading] = useState(false);

  const BASE_URL = "http://192.168.217.218:8080"; // replace with HTTPS in production

  useEffect(() => {
    fetchKycDetail();
  }, []);

  const fetchKycDetail = async () => {
    setLoading(true);
    try {
      const res = await fetchPendingKyc();
      const content = res.data?.data?.content || [];
      const selectedKyc = content.find((item) => item.id === kycId);

      if (!selectedKyc) {
        Alert.alert(
          "KYC Not Found",
          "This KYC request is no longer available."
        );
        navigation.goBack();
        return;
      }

      setKyc(selectedKyc);
    } catch (err) {
      console.error("Fetch KYC Detail Error:", err);
      Alert.alert("Error", "Failed to fetch KYC details.");
    } finally {
      setLoading(false);
    }
  };

  const downloadKycFile = async () => {
    if (!kyc) return;
    setDownloading(true);

    try {
      const token = await AsyncStorage.getItem("adminToken");
      if (!token) return Alert.alert("Error", "Admin not logged in");

      const fileUrl = `${BASE_URL}/api/admin/kyc/file/${kyc.id}`;
      // Append token as query parameter if backend supports it
      const secureUrl = `${fileUrl}?token=${encodeURIComponent(token)}`;

      console.log("Opening URL in browser:", secureUrl);
      const supported = await Linking.canOpenURL(secureUrl);
      if (supported) {
        await Linking.openURL(secureUrl);
      } else {
        Alert.alert("Error", "Cannot open URL in browser");
      }
    } catch (err) {
      console.error("Download error:", err);
      Alert.alert("Error", "Failed to start download.");
    } finally {
      setDownloading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await approveKyc(kyc.id);
      Alert.alert("Success", "KYC Approved!");
      navigation.goBack();
    } catch (err) {
      console.error("Approve KYC Error:", err);
      Alert.alert("Error", "Failed to approve KYC.");
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      Alert.alert("Reason Required", "Please provide a reason for rejection.");
      return;
    }
    try {
      await rejectKyc(kyc.id, reason);
      Alert.alert("Success", "KYC Rejected!");
      navigation.goBack();
    } catch (err) {
      console.error("Reject KYC Error:", err);
      Alert.alert("Error", "Failed to reject KYC.");
    }
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );

  if (!kyc)
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>KYC not found.</Text>
      </View>
    );

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <Text style={styles.label}>Name: {kyc.userName}</Text>
        <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
        <Text style={styles.label}>Document Type: {kyc.docType}</Text>
        <Text style={styles.label}>Status: {kyc.status}</Text>

        <TouchableOpacity
          style={[
            styles.downloadBtn,
            downloading && { backgroundColor: "#ccc" },
          ]}
          onPress={downloadKycFile}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.downloadText}>Download / Open Document</Text>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Reason for rejection"
          value={reason}
          onChangeText={setReason}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, styles.approveBtn]}
            onPress={handleApprove}
          >
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.rejectBtn]}
            onPress={handleReject}
          >
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  label: { fontSize: 18, marginBottom: 10 },
  empty: { fontSize: 16, color: "gray", marginVertical: 10 },
  downloadBtn: {
    backgroundColor: "#2196f3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 15,
  },
  downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  btn: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  approveBtn: { backgroundColor: "#4CAF50" },
  rejectBtn: { backgroundColor: "#FF3B30" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   Linking,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function AdminKycDetail({ route }) {
//   const { kycId, userName, docType } = route.params;
//   const [downloading, setDownloading] = useState(false);

//   const BASE_URL = "https://192.168.217.218:8080"; // replace with your API base URL

//   const handleDownload = async () => {
//     setDownloading(true);
//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return Alert.alert("Error", "Admin not logged in");

//       const extension = docType?.toLowerCase() || "pdf";
//       const fileName = `${userName}_${kycId}.${extension}`;

//       // Construct a secure URL with token as query param
//       const downloadUrl = `${BASE_URL}/api/admin/kyc/file/${kycId}?token=${token}`;

//       // Open in browser (mobile or desktop) to trigger download
//       const supported = await Linking.canOpenURL(downloadUrl);
//       if (supported) {
//         await Linking.openURL(downloadUrl);
//       } else {
//         Alert.alert("Error", "Cannot open download URL.");
//       }
//     } catch (err) {
//       console.error("Download error:", err);
//       Alert.alert("Error", "Failed to download KYC file.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.label}>Name: {userName}</Text>
//       <Text style={styles.label}>Document Type: {docType}</Text>

//       <TouchableOpacity
//         style={[styles.downloadBtn, downloading && { backgroundColor: "#ccc" }]}
//         onPress={handleDownload}
//         disabled={downloading}
//       >
//         {downloading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.downloadText}>Download KYC </Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#f0f4f7" },
//   label: { fontSize: 18, marginBottom: 10 },
//   downloadBtn: {
//     backgroundColor: "#2196f3",
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 20,
//   },
//   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });

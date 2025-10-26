// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   TouchableOpacity,
// //   FlatList,
// //   ActivityIndicator,
// //   Alert,
// //   StyleSheet,
// //   Platform,
// // } from "react-native";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import * as FileSystem from "expo-file-system/legacy";
// // import * as MediaLibrary from "expo-media-library";
// // import * as Sharing from "expo-sharing";
// // import axios from "axios";

// // const AdminKycDetail = () => {
// //   const [kycList, setKycList] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [downloadingId, setDownloadingId] = useState(null);

// //   const BASE_URL = "http://192.168.30.218:8080";

// //   // 1️⃣ Fetch Pending KYCs
// //   const fetchPendingKyc = async () => {
// //     try {
// //       const token = await AsyncStorage.getItem("adminToken");
// //       if (!token) return Alert.alert("Error", "Admin not logged in");

// //       const res = await axios.get(
// //         `${BASE_URL}/api/admin/kyc/pending?page=0&size=20&sort=createdAt,DESC`,
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       setKycList(res.data?.data?.content || []);
// //     } catch (err) {
// //       console.error("Fetch KYC error:", err);
// //       Alert.alert("Error", "Failed to load pending KYCs");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchPendingKyc();
// //   }, []);

// //   // 2️⃣ Download KYC File
// //   const downloadKycFile = async (kyc) => {
// //     try {
// //       setDownloadingId(kyc.id);

// //       const token = await AsyncStorage.getItem("adminToken");
// //       if (!token) return Alert.alert("Error", "Admin not logged in");

// //       const fileUrl = `${BASE_URL}/${kyc.downloadUrl}`; // use backend downloadUrl
// //       const extension = kyc.docType?.toLowerCase() || "pdf";
// //       const fileName = `KYC_${kyc.id}_${kyc.userName}.${extension}`;
// //       const fileUri = FileSystem.cacheDirectory + fileName;

// //       console.log("Downloading:", fileUrl);

// //       const downloadResumable = FileSystem.createDownloadResumable(
// //         fileUrl,
// //         fileUri,
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       const { uri } = await downloadResumable.downloadAsync();
// //       console.log("Downloaded to:", uri);

// //       // Android: save to Downloads
// //       if (Platform.OS === "android") {
// //         const { status } = await MediaLibrary.requestPermissionsAsync();
// //         if (status !== "granted") return Alert.alert("Permission denied");

// //         const asset = await MediaLibrary.createAssetAsync(uri);
// //         await MediaLibrary.createAlbumAsync("Download", asset, false);
// //         Alert.alert("Download Complete", "File saved to Downloads folder!");
// //       }
// //       // iOS: share or save
// //       else if (Platform.OS === "ios") {
// //         if (await Sharing.isAvailableAsync()) {
// //           await Sharing.shareAsync(uri);
// //         } else {
// //           Alert.alert("Download Complete", "File saved in app cache.");
// //         }
// //       }
// //     } catch (err) {
// //       console.error("Download error:", err);
// //       Alert.alert("Error", "Failed to download KYC file");
// //     } finally {
// //       setDownloadingId(null);
// //     }
// //   };

// //   const renderKycItem = ({ item }) => (
// //     <View style={styles.card}>
// //       <Text style={styles.title}>KYC ID: {item.id}</Text>
// //       <Text style={styles.text}>User: {item.userName}</Text>
// //       <Text style={styles.text}>Phone: {item.userPhone}</Text>
// //       <Text style={styles.text}>Doc Type: {item.docType}</Text>
// //       <Text style={styles.text}>Status: {item.status}</Text>
// //       <Text style={styles.text}>Role: {item.roleType}</Text>

// //       <TouchableOpacity
// //         style={styles.downloadButton}
// //         onPress={() => downloadKycFile(item)}
// //         disabled={downloadingId === item.id}
// //       >
// //         {downloadingId === item.id ? (
// //           <ActivityIndicator color="#fff" />
// //         ) : (
// //           <Text style={styles.downloadText}>Download</Text>
// //         )}
// //       </TouchableOpacity>
// //     </View>
// //   );

// //   if (loading)
// //     return (
// //       <View style={styles.center}>
// //         <ActivityIndicator size="large" color="#007bff" />
// //         <Text>Loading pending KYCs...</Text>
// //       </View>
// //     );

// //   if (kycList.length === 0)
// //     return (
// //       <View style={styles.center}>
// //         <Text>No pending KYCs found</Text>
// //       </View>
// //     );

// //   return (
// //     <FlatList
// //       data={kycList}
// //       keyExtractor={(item) => item.id.toString()}
// //       renderItem={renderKycItem}
// //       contentContainerStyle={{ padding: 10 }}
// //     />
// //   );
// // };

// // const styles = StyleSheet.create({
// //   card: {
// //     backgroundColor: "#fff",
// //     borderRadius: 10,
// //     padding: 15,
// //     marginVertical: 8,
// //     elevation: 3,
// //   },
// //   title: {
// //     fontWeight: "bold",
// //     fontSize: 16,
// //   },
// //   text: {
// //     fontSize: 14,
// //     marginTop: 4,
// //   },
// //   downloadButton: {
// //     backgroundColor: "#007bff",
// //     padding: 10,
// //     borderRadius: 8,
// //     marginTop: 10,
// //     alignItems: "center",
// //   },
// //   downloadText: {
// //     color: "#fff",
// //     fontWeight: "bold",
// //   },
// //   center: {
// //     flex: 1,
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },
// // });

// // export default AdminKycDetail;
// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   ScrollView,
// //   TouchableOpacity,
// //   TextInput,
// //   ActivityIndicator,
// //   Alert,
// //   StyleSheet,
// // } from "react-native";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import * as Linking from "expo-linking";
// // import { Ionicons } from "@expo/vector-icons";

// // import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// // export default function AdminKycDetail({ route, navigation }) {
// //   const { kycId } = route.params;
// //   const [kyc, setKyc] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [reason, setReason] = useState("");
// //   const [downloading, setDownloading] = useState(false);

// //   const BASE_URL = "http://192.168.30.218:8080";

// //   useEffect(() => {
// //     fetchKycDetail();
// //   }, []);

// //   const fetchKycDetail = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await fetchPendingKyc();
// //       const content = res.data?.data?.content || [];
// //       const selectedKyc = content.find((item) => item.id === kycId);
// //       if (!selectedKyc) {
// //         Alert.alert(
// //           "KYC Not Found",
// //           "This KYC request is no longer available."
// //         );
// //         navigation.goBack();
// //         return;
// //       }
// //       setKyc(selectedKyc);
// //     } catch (err) {
// //       console.error(
// //         "Fetch KYC Detail Error:",
// //         err.response?.data || err.message
// //       );
// //       Alert.alert("Error", "Failed to fetch KYC details.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ✅ Download via Chrome / system browser
// //   const downloadKycFile = async () => {
// //     if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");

// //     try {
// //       setDownloading(true);

// //       const token = await AsyncStorage.getItem("adminToken");
// //       if (!token) return Alert.alert("Error", "Admin not logged in");

// //       // Full download URL
// //       let fileUrl = `${BASE_URL}/${kyc.downloadUrl}`;

// //       // ⚠️ If your backend requires auth header, you can pass token as query param
// //       fileUrl += `?token=${token}`;

// //       console.log("Opening KYC in browser:", fileUrl);

// //       const supported = await Linking.canOpenURL(fileUrl);
// //       if (supported) {
// //         await Linking.openURL(fileUrl);
// //       } else {
// //         Alert.alert("Error", "Cannot open browser to download KYC.");
// //       }
// //     } catch (err) {
// //       console.error("Download error:", err);
// //       Alert.alert("Error", "Failed to download KYC file.");
// //     } finally {
// //       setDownloading(false);
// //     }
// //   };

// //   const handleApprove = async () => {
// //     try {
// //       await approveKyc(kyc.id);
// //       Alert.alert("Success", "KYC Approved!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Approve KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to approve KYC.");
// //     }
// //   };

// //   const handleReject = async () => {
// //     if (!reason.trim()) {
// //       Alert.alert("Reason Required", "Please provide a reason for rejection.");
// //       return;
// //     }
// //     try {
// //       await rejectKyc(kyc.id, reason);
// //       Alert.alert("Success", "KYC Rejected!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Reject KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to reject KYC.");
// //     }
// //   };

// //   if (loading)
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#2196f3" />
// //       </View>
// //     );

// //   if (!kyc)
// //     return (
// //       <View style={styles.container}>
// //         <Text style={styles.empty}>KYC not found.</Text>
// //       </View>
// //     );

// //   return (
// //     <View style={styles.wrapper}>
// //       <View style={styles.navBar}>
// //         <TouchableOpacity
// //           onPress={() => navigation.goBack()}
// //           style={styles.backButton}
// //         >
// //           <Ionicons name="arrow-back" size={24} color="#fff" />
// //         </TouchableOpacity>
// //         <Text style={styles.navTitle}>KYC Detail</Text>
// //       </View>

// //       <ScrollView style={styles.container}>
// //         <Text style={styles.label}>Name: {kyc.userName}</Text>
// //         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
// //         <Text style={styles.label}>Role: {kyc.roleType}</Text>
// //         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
// //         <Text style={styles.label}>Status: {kyc.status}</Text>

// //         <TouchableOpacity
// //           style={[
// //             styles.downloadBtn,
// //             downloading && { backgroundColor: "#ccc" },
// //           ]}
// //           onPress={downloadKycFile}
// //           disabled={downloading}
// //         >
// //           {downloading ? (
// //             <ActivityIndicator color="#fff" />
// //           ) : (
// //             <Text style={styles.downloadText}>Download / Open Document</Text>
// //           )}
// //         </TouchableOpacity>

// //         <TextInput
// //           style={styles.input}
// //           placeholder="Reason for rejection"
// //           value={reason}
// //           onChangeText={setReason}
// //         />

// //         <View style={styles.buttonRow}>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.approveBtn]}
// //             onPress={handleApprove}
// //           >
// //             <Text style={styles.btnText}>Approve</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.rejectBtn]}
// //             onPress={handleReject}
// //           >
// //             <Text style={styles.btnText}>Reject</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </ScrollView>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
// //   navBar: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#2196f3",
// //     paddingVertical: 12,
// //     paddingHorizontal: 15,
// //     elevation: 3,
// //   },
// //   backButton: { marginRight: 10, padding: 4 },
// //   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
// //   container: { flex: 1, padding: 20 },
// //   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   label: { fontSize: 18, marginBottom: 10 },
// //   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
// //   downloadBtn: {
// //     backgroundColor: "#2196f3",
// //     padding: 12,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginVertical: 15,
// //   },
// //   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //     borderRadius: 8,
// //     padding: 10,
// //     marginBottom: 15,
// //     backgroundColor: "#fff",
// //   },
// //   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
// //   btn: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginHorizontal: 5,
// //   },
// //   approveBtn: { backgroundColor: "#4CAF50" },
// //   rejectBtn: { backgroundColor: "#FF3B30" },
// //   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// // });
// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   ScrollView,
// //   TouchableOpacity,
// //   TextInput,
// //   ActivityIndicator,
// //   Alert,
// //   StyleSheet,
// // } from "react-native";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import * as Linking from "expo-linking";
// // import { Ionicons } from "@expo/vector-icons";
// // import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// // export default function AdminKycDetail({ route, navigation }) {
// //   const { kycId } = route.params;
// //   const [kyc, setKyc] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [reason, setReason] = useState("");
// //   const [downloading, setDownloading] = useState(false);

// //   const BASE_URL = "https://192.168.30.218:8080";

// //   useEffect(() => {
// //     fetchKycDetail();
// //   }, []);

// //   const fetchKycDetail = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await fetchPendingKyc();
// //       const content = res.data?.data?.content || [];
// //       const selectedKyc = content.find((item) => item.id === kycId);
// //       if (!selectedKyc) {
// //         Alert.alert(
// //           "KYC Not Found",
// //           "This KYC request is no longer available."
// //         );
// //         navigation.goBack();
// //         return;
// //       }
// //       setKyc(selectedKyc);
// //     } catch (err) {
// //       console.error(
// //         "Fetch KYC Detail Error:",
// //         err.response?.data || err.message
// //       );
// //       Alert.alert("Error", "Failed to fetch KYC details.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const downloadKycFile = async () => {
// //     if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");

// //     try {
// //       setDownloading(true);
// //       const token = await AsyncStorage.getItem("adminToken");
// //       if (!token) return Alert.alert("Error", "Admin not logged in");

// //       let fileUrl = `${BASE_URL}/${kyc.downloadUrl}?token=${token}`;
// //       const supported = await Linking.canOpenURL(fileUrl);
// //       if (supported) await Linking.openURL(fileUrl);
// //       else Alert.alert("Error", "Cannot open browser to download KYC.");
// //     } catch (err) {
// //       console.error("Download error:", err);
// //       Alert.alert("Error", "Failed to download KYC file.");
// //     } finally {
// //       setDownloading(false);
// //     }
// //   };

// //   const handleApprove = async () => {
// //     try {
// //       await approveKyc(kyc.id);
// //       Alert.alert("Success", "KYC Approved!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Approve KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to approve KYC.");
// //     }
// //   };

// //   const handleReject = async () => {
// //     if (!reason.trim()) {
// //       Alert.alert("Reason Required", "Please provide a reason for rejection.");
// //       return;
// //     }
// //     try {
// //       await rejectKyc(kyc.id, reason);
// //       Alert.alert("Success", "KYC Rejected!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Reject KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to reject KYC.");
// //     }
// //   };

// //   if (loading)
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#2196f3" />
// //       </View>
// //     );

// //   if (!kyc)
// //     return (
// //       <View style={styles.container}>
// //         <Text style={styles.empty}>KYC not found.</Text>
// //       </View>
// //     );

// //   return (
// //     <View style={styles.wrapper}>
// //       <View style={styles.navBar}>
// //         <TouchableOpacity
// //           onPress={() => navigation.goBack()}
// //           style={styles.backButton}
// //         >
// //           <Ionicons name="arrow-back" size={24} color="#fff" />
// //         </TouchableOpacity>
// //         <Text style={styles.navTitle}>KYC Detail</Text>
// //       </View>

// //       <ScrollView style={styles.container}>
// //         <Text style={styles.label}>Name: {kyc.userName}</Text>
// //         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
// //         <Text style={styles.label}>Role: {kyc.roleType}</Text>
// //         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
// //         <Text style={styles.label}>Status: {kyc.status}</Text>

// //         <TouchableOpacity
// //           style={[
// //             styles.downloadBtn,
// //             downloading && { backgroundColor: "#ccc" },
// //           ]}
// //           onPress={downloadKycFile}
// //           disabled={downloading}
// //         >
// //           {downloading ? (
// //             <ActivityIndicator color="#fff" />
// //           ) : (
// //             <Text style={styles.downloadText}>Download / Open Document</Text>
// //           )}
// //         </TouchableOpacity>

// //         <TextInput
// //           style={styles.input}
// //           placeholder="Reason for rejection"
// //           value={reason}
// //           onChangeText={setReason}
// //         />

// //         <View style={styles.buttonRow}>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.approveBtn]}
// //             onPress={handleApprove}
// //           >
// //             <Text style={styles.btnText}>Approve</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.rejectBtn]}
// //             onPress={handleReject}
// //           >
// //             <Text style={styles.btnText}>Reject</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </ScrollView>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
// //   navBar: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#2196f3",
// //     paddingVertical: 12,
// //     paddingHorizontal: 15,
// //     elevation: 3,
// //   },
// //   backButton: { marginRight: 10, padding: 4 },
// //   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
// //   container: { flex: 1, padding: 20 },
// //   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   label: { fontSize: 18, marginBottom: 10 },
// //   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
// //   downloadBtn: {
// //     backgroundColor: "#2196f3",
// //     padding: 12,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginVertical: 15,
// //   },
// //   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //     borderRadius: 8,
// //     padding: 10,
// //     marginBottom: 15,
// //     backgroundColor: "#fff",
// //   },
// //   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
// //   btn: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginHorizontal: 5,
// //   },
// //   approveBtn: { backgroundColor: "#4CAF50" },
// //   rejectBtn: { backgroundColor: "#FF3B30" },
// //   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// // });

// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   ScrollView,
// //   TouchableOpacity,
// //   TextInput,
// //   ActivityIndicator,
// //   Alert,
// //   StyleSheet,
// //   Linking,
// // } from "react-native";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { Ionicons } from "@expo/vector-icons";

// // import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// // export default function AdminKycDetail({ route, navigation }) {
// //   const { kycId } = route.params;
// //   const [kyc, setKyc] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [reason, setReason] = useState("");
// //   const [downloading, setDownloading] = useState(false);

// //   const BASE_URL = "https://192.168.30.218:8080"; // Use HTTPS for secure browser download

// //   useEffect(() => {
// //     fetchKycDetail();
// //   }, []);

// //   const fetchKycDetail = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await fetchPendingKyc();
// //       const content = res.data?.data?.content || [];
// //       const selectedKyc = content.find((item) => item.id === kycId);

// //       if (!selectedKyc) {
// //         Alert.alert(
// //           "KYC Not Found",
// //           "This KYC request is no longer available."
// //         );
// //         navigation.goBack();
// //         return;
// //       }

// //       setKyc(selectedKyc);
// //     } catch (err) {
// //       console.error(
// //         "Fetch KYC Detail Error:",
// //         err.response?.data || err.message
// //       );
// //       Alert.alert("Error", "Failed to fetch KYC details.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const downloadKycFile = async () => {
// //     if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");

// //     try {
// //       setDownloading(true);
// //       const token = await AsyncStorage.getItem("adminToken");
// //       if (!token) return Alert.alert("Error", "Admin not logged in");

// //       // Full secure download URL with token
// //       const fileUrl = `${BASE_URL}/${kyc.downloadUrl}?token=${token}`;

// //       console.log("Opening KYC in browser:", fileUrl);

// //       const supported = await Linking.canOpenURL(fileUrl);
// //       if (supported) {
// //         await Linking.openURL(fileUrl);
// //       } else {
// //         Alert.alert("Error", "Cannot open browser to download KYC.");
// //       }
// //     } catch (err) {
// //       console.error("Download error:", err);
// //       Alert.alert("Error", "Failed to download KYC file.");
// //     } finally {
// //       setDownloading(false);
// //     }
// //   };

// //   const handleApprove = async () => {
// //     try {
// //       await approveKyc(kyc.id);
// //       Alert.alert("Success", "KYC Approved!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Approve KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to approve KYC.");
// //     }
// //   };

// //   const handleReject = async () => {
// //     if (!reason.trim()) {
// //       Alert.alert("Reason Required", "Please provide a reason for rejection.");
// //       return;
// //     }
// //     try {
// //       await rejectKyc(kyc.id, reason);
// //       Alert.alert("Success", "KYC Rejected!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Reject KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to reject KYC.");
// //     }
// //   };

// //   if (loading)
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#2196f3" />
// //       </View>
// //     );

// //   if (!kyc)
// //     return (
// //       <View style={styles.container}>
// //         <Text style={styles.empty}>KYC not found.</Text>
// //       </View>
// //     );

// //   return (
// //     <View style={styles.wrapper}>
// //       <View style={styles.navBar}>
// //         <TouchableOpacity
// //           onPress={() => navigation.goBack()}
// //           style={styles.backButton}
// //         >
// //           <Ionicons name="arrow-back" size={24} color="#fff" />
// //         </TouchableOpacity>
// //         <Text style={styles.navTitle}>KYC Detail</Text>
// //       </View>

// //       <ScrollView style={styles.container}>
// //         <Text style={styles.label}>Name: {kyc.userName}</Text>
// //         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
// //         <Text style={styles.label}>Role: {kyc.roleType}</Text>
// //         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
// //         <Text style={styles.label}>Status: {kyc.status}</Text>

// //         <TouchableOpacity
// //           style={[
// //             styles.downloadBtn,
// //             downloading && { backgroundColor: "#ccc" },
// //           ]}
// //           onPress={downloadKycFile}
// //           disabled={downloading}
// //         >
// //           {downloading ? (
// //             <ActivityIndicator color="#fff" />
// //           ) : (
// //             <Text style={styles.downloadText}>Download / Open Document</Text>
// //           )}
// //         </TouchableOpacity>

// //         <TextInput
// //           style={styles.input}
// //           placeholder="Reason for rejection"
// //           value={reason}
// //           onChangeText={setReason}
// //         />

// //         <View style={styles.buttonRow}>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.approveBtn]}
// //             onPress={handleApprove}
// //           >
// //             <Text style={styles.btnText}>Approve</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.rejectBtn]}
// //             onPress={handleReject}
// //           >
// //             <Text style={styles.btnText}>Reject</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </ScrollView>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
// //   navBar: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#2196f3",
// //     paddingVertical: 12,
// //     paddingHorizontal: 15,
// //     elevation: 3,
// //   },
// //   backButton: { marginRight: 10, padding: 4 },
// //   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
// //   container: { flex: 1, padding: 20 },
// //   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   label: { fontSize: 18, marginBottom: 10 },
// //   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
// //   downloadBtn: {
// //     backgroundColor: "#2196f3",
// //     padding: 12,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginVertical: 15,
// //   },
// //   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //     borderRadius: 8,
// //     padding: 10,
// //     marginBottom: 15,
// //     backgroundColor: "#fff",
// //   },
// //   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
// //   btn: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginHorizontal: 5,
// //   },
// //   approveBtn: { backgroundColor: "#4CAF50" },
// //   rejectBtn: { backgroundColor: "#FF3B30" },
// //   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// // });
// // //

// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   ScrollView,
// //   TouchableOpacity,
// //   TextInput,
// //   ActivityIndicator,
// //   Alert,
// //   StyleSheet,
// //   Platform,
// // } from "react-native";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import * as FileSystem from "expo-file-system";
// // import * as MediaLibrary from "expo-media-library";
// // import { Ionicons } from "@expo/vector-icons";

// // import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// // export default function AdminKycDetail({ route, navigation }) {
// //   const { kycId } = route.params;
// //   const [kyc, setKyc] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [reason, setReason] = useState("");
// //   const [downloading, setDownloading] = useState(false);

// //   const BASE_URL = "http://192.168.30.218:8080";

// //   useEffect(() => {
// //     fetchKycDetail();
// //   }, []);

// //   const fetchKycDetail = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await fetchPendingKyc();
// //       const content = res.data?.data?.content || [];
// //       const selectedKyc = content.find((item) => item.id === kycId);
// //       if (!selectedKyc) {
// //         Alert.alert(
// //           "KYC Not Found",
// //           "This KYC request is no longer available."
// //         );
// //         navigation.goBack();
// //         return;
// //       }
// //       setKyc(selectedKyc);
// //     } catch (err) {
// //       console.error(
// //         "Fetch KYC Detail Error:",
// //         err.response?.data || err.message
// //       );
// //       Alert.alert("Error", "Failed to fetch KYC details.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const downloadKycFile = async () => {
// //     if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");
// //     try {
// //       setDownloading(true);

// //       const token = await AsyncStorage.getItem("adminToken");
// //       if (!token) return Alert.alert("Error", "Admin not logged in");

// //       const fileUrl = `${BASE_URL}/${kyc.downloadUrl}?token=${token}`;
// //       const fileExt = kyc.docType?.toLowerCase() || "pdf";
// //       const fileName = `KYC_${kyc.id}_${kyc.userName}.${fileExt}`;
// //       const fileUri = FileSystem.documentDirectory + fileName;

// //       console.log("Downloading KYC from:", fileUrl);

// //       // Download file
// //       const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);
// //       console.log("Downloaded to:", uri);

// //       if (Platform.OS === "android") {
// //         // Request permission
// //         const { status } = await MediaLibrary.requestPermissionsAsync();
// //         if (status !== "granted") return Alert.alert("Permission denied");

// //         // Save to Downloads
// //         const asset = await MediaLibrary.createAssetAsync(uri);
// //         await MediaLibrary.createAlbumAsync("Download", asset, false);
// //         Alert.alert("Download Complete", "File saved to Downloads folder!");
// //       } else {
// //         Alert.alert("Download Complete", "File saved in app storage.");
// //       }
// //     } catch (err) {
// //       console.error("Download error:", err);
// //       Alert.alert("Error", "Failed to download KYC file.");
// //     } finally {
// //       setDownloading(false);
// //     }
// //   };

// //   const handleApprove = async () => {
// //     try {
// //       await approveKyc(kyc.id);
// //       Alert.alert("Success", "KYC Approved!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Approve KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to approve KYC.");
// //     }
// //   };

// //   const handleReject = async () => {
// //     if (!reason.trim()) {
// //       Alert.alert("Reason Required", "Please provide a reason for rejection.");
// //       return;
// //     }
// //     try {
// //       await rejectKyc(kyc.id, reason);
// //       Alert.alert("Success", "KYC Rejected!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Reject KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to reject KYC.");
// //     }
// //   };

// //   if (loading)
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#2196f3" />
// //       </View>
// //     );

// //   if (!kyc)
// //     return (
// //       <View style={styles.container}>
// //         <Text style={styles.empty}>KYC not found.</Text>
// //       </View>
// //     );

// //   return (
// //     <View style={styles.wrapper}>
// //       <View style={styles.navBar}>
// //         <TouchableOpacity
// //           onPress={() => navigation.goBack()}
// //           style={styles.backButton}
// //         >
// //           <Ionicons name="arrow-back" size={24} color="#fff" />
// //         </TouchableOpacity>
// //         <Text style={styles.navTitle}>KYC Detail</Text>
// //       </View>

// //       <ScrollView style={styles.container}>
// //         <Text style={styles.label}>Name: {kyc.userName}</Text>
// //         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
// //         <Text style={styles.label}>Role: {kyc.roleType}</Text>
// //         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
// //         <Text style={styles.label}>Status: {kyc.status}</Text>

// //         <TouchableOpacity
// //           style={[
// //             styles.downloadBtn,
// //             downloading && { backgroundColor: "#ccc" },
// //           ]}
// //           onPress={downloadKycFile}
// //           disabled={downloading}
// //         >
// //           {downloading ? (
// //             <ActivityIndicator color="#fff" />
// //           ) : (
// //             <Text style={styles.downloadText}>Download Document</Text>
// //           )}
// //         </TouchableOpacity>

// //         <TextInput
// //           style={styles.input}
// //           placeholder="Reason for rejection"
// //           value={reason}
// //           onChangeText={setReason}
// //         />

// //         <View style={styles.buttonRow}>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.approveBtn]}
// //             onPress={handleApprove}
// //           >
// //             <Text style={styles.btnText}>Approve</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.rejectBtn]}
// //             onPress={handleReject}
// //           >
// //             <Text style={styles.btnText}>Reject</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </ScrollView>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
// //   navBar: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#2196f3",
// //     paddingVertical: 12,
// //     paddingHorizontal: 15,
// //     elevation: 3,
// //   },
// //   backButton: { marginRight: 10, padding: 4 },
// //   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
// //   container: { flex: 1, padding: 20 },
// //   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   label: { fontSize: 18, marginBottom: 10 },
// //   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
// //   downloadBtn: {
// //     backgroundColor: "#2196f3",
// //     padding: 12,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginVertical: 15,
// //   },
// //   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //     borderRadius: 8,
// //     padding: 10,
// //     marginBottom: 15,
// //     backgroundColor: "#fff",
// //   },
// //   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
// //   btn: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginHorizontal: 5,
// //   },
// //   approveBtn: { backgroundColor: "#4CAF50" },
// //   rejectBtn: { backgroundColor: "#FF3B30" },
// //   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// // });
// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   ScrollView,
// //   TouchableOpacity,
// //   TextInput,
// //   ActivityIndicator,
// //   Alert,
// //   StyleSheet,
// //   Linking,
// // } from "react-native";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { Ionicons } from "@expo/vector-icons";

// // import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// // export default function AdminKycDetail({ route, navigation }) {
// //   const { kycId } = route.params;
// //   const [kyc, setKyc] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [reason, setReason] = useState("");
// //   const [downloading, setDownloading] = useState(false);

// //   const BASE_URL = "http://192.168.30.218:8080"; // your backend base URL

// //   useEffect(() => {
// //     fetchKycDetail();
// //   }, []);

// //   const fetchKycDetail = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await fetchPendingKyc();
// //       const content = res.data?.data?.content || [];
// //       const selectedKyc = content.find((item) => item.id === kycId);
// //       if (!selectedKyc) {
// //         Alert.alert(
// //           "KYC Not Found",
// //           "This KYC request is no longer available."
// //         );
// //         navigation.goBack();
// //         return;
// //       }
// //       setKyc(selectedKyc);
// //     } catch (err) {
// //       console.error(
// //         "Fetch KYC Detail Error:",
// //         err.response?.data || err.message
// //       );
// //       Alert.alert("Error", "Failed to fetch KYC details.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
// //   const downloadKycFile = async () => {
// //     if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");

// //     try {
// //       setDownloading(true);

// //       const token = await AsyncStorage.getItem("adminToken");
// //       if (!token) return Alert.alert("Error", "Admin not logged in");

// //       // Full API URL
// //       const fileUrl = `${BASE_URL}/${kyc.downloadUrl}`;

// //       // Fetch file as blob
// //       const response = await fetch(fileUrl, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       const blob = await response.blob();

// //       // Create blob URL (like Swagger)
// //       const blobUrl = URL.createObjectURL(blob);
// //       console.log("Blob URL:", blobUrl);

// //       // Open in browser tab for download
// //       window.open(blobUrl, "_blank");
// //     } catch (err) {
// //       console.error("Download error:", err);
// //       Alert.alert("Error", "Failed to download KYC file.");
// //     } finally {
// //       setDownloading(false);
// //     }
// //   };

// //   const handleApprove = async () => {
// //     try {
// //       await approveKyc(kyc.id);
// //       Alert.alert("Success", "KYC Approved!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Approve KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to approve KYC.");
// //     }
// //   };

// //   const handleReject = async () => {
// //     if (!reason.trim()) {
// //       Alert.alert("Reason Required", "Please provide a reason for rejection.");
// //       return;
// //     }
// //     try {
// //       await rejectKyc(kyc.id, reason);
// //       Alert.alert("Success", "KYC Rejected!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Reject KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to reject KYC.");
// //     }
// //   };

// //   if (loading)
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#2196f3" />
// //       </View>
// //     );

// //   if (!kyc)
// //     return (
// //       <View style={styles.container}>
// //         <Text style={styles.empty}>KYC not found.</Text>
// //       </View>
// //     );

// //   return (
// //     <View style={styles.wrapper}>
// //       <View style={styles.navBar}>
// //         <TouchableOpacity
// //           onPress={() => navigation.goBack()}
// //           style={styles.backButton}
// //         >
// //           <Ionicons name="arrow-back" size={24} color="#fff" />
// //         </TouchableOpacity>
// //         <Text style={styles.navTitle}>KYC Detail</Text>
// //       </View>

// //       <ScrollView style={styles.container}>
// //         <Text style={styles.label}>Name: {kyc.userName}</Text>
// //         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
// //         <Text style={styles.label}>Role: {kyc.roleType}</Text>
// //         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
// //         <Text style={styles.label}>Status: {kyc.status}</Text>

// //         <TouchableOpacity
// //           style={[
// //             styles.downloadBtn,
// //             downloading && { backgroundColor: "#ccc" },
// //           ]}
// //           onPress={downloadKycFile}
// //           disabled={downloading}
// //         >
// //           {downloading ? (
// //             <ActivityIndicator color="#fff" />
// //           ) : (
// //             <Text style={styles.downloadText}>Download / Open Document</Text>
// //           )}
// //         </TouchableOpacity>

// //         <TextInput
// //           style={styles.input}
// //           placeholder="Reason for rejection"
// //           value={reason}
// //           onChangeText={setReason}
// //         />

// //         <View style={styles.buttonRow}>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.approveBtn]}
// //             onPress={handleApprove}
// //           >
// //             <Text style={styles.btnText}>Approve</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.rejectBtn]}
// //             onPress={handleReject}
// //           >
// //             <Text style={styles.btnText}>Reject</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </ScrollView>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
// //   navBar: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#2196f3",
// //     paddingVertical: 12,
// //     paddingHorizontal: 15,
// //     elevation: 3,
// //   },
// //   backButton: { marginRight: 10, padding: 4 },
// //   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
// //   container: { flex: 1, padding: 20 },
// //   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   label: { fontSize: 18, marginBottom: 10 },
// //   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
// //   downloadBtn: {
// //     backgroundColor: "#2196f3",
// //     padding: 12,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginVertical: 15,
// //   },
// //   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //     borderRadius: 8,
// //     padding: 10,
// //     marginBottom: 15,
// //     backgroundColor: "#fff",
// //   },
// //   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
// //   btn: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginHorizontal: 5,
// //   },
// //   approveBtn: { backgroundColor: "#4CAF50" },
// //   rejectBtn: { backgroundColor: "#FF3B30" },
// //   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// // });
// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   ScrollView,
// //   TouchableOpacity,
// //   TextInput,
// //   ActivityIndicator,
// //   Alert,
// //   StyleSheet,
// // } from "react-native";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { Ionicons } from "@expo/vector-icons";

// // import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// // export default function AdminKycDetail({ route, navigation }) {
// //   const { kycId } = route.params;
// //   const [kyc, setKyc] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [reason, setReason] = useState("");
// //   const [downloading, setDownloading] = useState(false);

// //   const BASE_URL = "http://192.168.30.218:8080";

// //   useEffect(() => {
// //     fetchKycDetail();
// //   }, []);

// //   const fetchKycDetail = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await fetchPendingKyc();
// //       const content = res.data?.data?.content || [];
// //       const selectedKyc = content.find((item) => item.id === kycId);
// //       if (!selectedKyc) {
// //         Alert.alert(
// //           "KYC Not Found",
// //           "This KYC request is no longer available."
// //         );
// //         navigation.goBack();
// //         return;
// //       }
// //       setKyc(selectedKyc);
// //     } catch (err) {
// //       console.error("Fetch KYC Detail Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to fetch KYC details.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ✅ Web-style download (like Swagger)
// //   const downloadKycFile = async () => {
// //     if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");

// //     try {
// //       setDownloading(true);

// //       const token = await AsyncStorage.getItem("adminToken");
// //       if (!token) return Alert.alert("Error", "Admin not logged in");

// //       const fileUrl = `${BASE_URL}/${kyc.downloadUrl}`;

// //       // Fetch the file as blob
// //       const response = await fetch(fileUrl, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });

// //       if (!response.ok) {
// //         throw new Error("Failed to fetch file");
// //       }

// //       const blob = await response.blob();
// //       const downloadUrl = window.URL.createObjectURL(blob);

// //       // Automatically trigger download
// //       const link = document.createElement("a");
// //       link.href = downloadUrl;
// //       link.download = `KYC_${kyc.id}_${kyc.userName}.${kyc.docType.toLowerCase()}`;
// //       document.body.appendChild(link);
// //       link.click();
// //       document.body.removeChild(link);
// //       window.URL.revokeObjectURL(downloadUrl);

// //       console.log("✅ File download triggered in browser");
// //     } catch (err) {
// //       console.error("Download error:", err);
// //       Alert.alert("Error", "Failed to download KYC file.");
// //     } finally {
// //       setDownloading(false);
// //     }
// //   };

// //   const handleApprove = async () => {
// //     try {
// //       await approveKyc(kyc.id);
// //       Alert.alert("Success", "KYC Approved!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Approve KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to approve KYC.");
// //     }
// //   };

// //   const handleReject = async () => {
// //     if (!reason.trim()) {
// //       Alert.alert("Reason Required", "Please provide a reason for rejection.");
// //       return;
// //     }
// //     try {
// //       await rejectKyc(kyc.id, reason);
// //       Alert.alert("Success", "KYC Rejected!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Reject KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to reject KYC.");
// //     }
// //   };

// //   if (loading)
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#2196f3" />
// //       </View>
// //     );

// //   if (!kyc)
// //     return (
// //       <View style={styles.container}>
// //         <Text style={styles.empty}>KYC not found.</Text>
// //       </View>
// //     );

// //   return (
// //     <View style={styles.wrapper}>
// //       <View style={styles.navBar}>
// //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
// //           <Ionicons name="arrow-back" size={24} color="#fff" />
// //         </TouchableOpacity>
// //         <Text style={styles.navTitle}>KYC Detail</Text>
// //       </View>

// //       <ScrollView style={styles.container}>
// //         <Text style={styles.label}>Name: {kyc.userName}</Text>
// //         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
// //         <Text style={styles.label}>Role: {kyc.roleType}</Text>
// //         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
// //         <Text style={styles.label}>Status: {kyc.status}</Text>

// //         <TouchableOpacity
// //           style={[styles.downloadBtn, downloading && { backgroundColor: "#ccc" }]}
// //           onPress={downloadKycFile}
// //           disabled={downloading}
// //         >
// //           {downloading ? (
// //             <ActivityIndicator color="#fff" />
// //           ) : (
// //             <Text style={styles.downloadText}>Download / Open Document</Text>
// //           )}
// //         </TouchableOpacity>

// //         <TextInput
// //           style={styles.input}
// //           placeholder="Reason for rejection"
// //           value={reason}
// //           onChangeText={setReason}
// //         />

// //         <View style={styles.buttonRow}>
// //           <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={handleApprove}>
// //             <Text style={styles.btnText}>Approve</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={handleReject}>
// //             <Text style={styles.btnText}>Reject</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </ScrollView>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
// //   navBar: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#2196f3",
// //     paddingVertical: 12,
// //     paddingHorizontal: 15,
// //     elevation: 3,
// //   },
// //   backButton: { marginRight: 10, padding: 4 },
// //   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
// //   container: { flex: 1, padding: 20 },
// //   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   label: { fontSize: 18, marginBottom: 10 },
// //   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
// //   downloadBtn: {
// //     backgroundColor: "#2196f3",
// //     padding: 12,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginVertical: 15,
// //   },
// //   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //     borderRadius: 8,
// //     padding: 10,
// //     marginBottom: 15,
// //     backgroundColor: "#fff",
// //   },
// //   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
// //   btn: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginHorizontal: 5,
// //   },
// //   approveBtn: { backgroundColor: "#4CAF50" },
// //   rejectBtn: { backgroundColor: "#FF3B30" },
// //   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// // });
// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   ScrollView,
// //   TouchableOpacity,
// //   TextInput,
// //   ActivityIndicator,
// //   Alert,
// //   StyleSheet,
// //   Platform,
// // } from "react-native";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import * as FileSystem from "expo-file-system";
// // import * as MediaLibrary from "expo-media-library";
// // import * as Sharing from "expo-sharing";
// // import { Ionicons } from "@expo/vector-icons";

// // import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// // export default function AdminKycDetail({ route, navigation }) {
// //   const { kycId } = route.params;
// //   const [kyc, setKyc] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [reason, setReason] = useState("");
// //   const [downloading, setDownloading] = useState(false);

// //   const BASE_URL = "http://192.168.30.218:8080";

// //   useEffect(() => {
// //     fetchKycDetail();
// //   }, []);

// //   const fetchKycDetail = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await fetchPendingKyc();
// //       const content = res.data?.data?.content || [];
// //       const selectedKyc = content.find((item) => item.id === kycId);
// //       if (!selectedKyc) {
// //         Alert.alert(
// //           "KYC Not Found",
// //           "This KYC request is no longer available."
// //         );
// //         navigation.goBack();
// //         return;
// //       }
// //       setKyc(selectedKyc);
// //     } catch (err) {
// //       console.error(
// //         "Fetch KYC Detail Error:",
// //         err.response?.data || err.message
// //       );
// //       Alert.alert("Error", "Failed to fetch KYC details.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const downloadKycFile = async () => {
// //     if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");

// //     try {
// //       setDownloading(true);
// //       const token = await AsyncStorage.getItem("adminToken");
// //       if (!token) return Alert.alert("Error", "Admin not logged in");

// //       const fileUrl = `${BASE_URL}/${kyc.downloadUrl}?token=${token}`;

// //       if (Platform.OS === "web") {
// //         // Web: download directly using blob
// //         const response = await fetch(fileUrl);
// //         const blob = await response.blob();
// //         const url = URL.createObjectURL(blob);
// //         const a = document.createElement("a");
// //         a.href = url;
// //         a.download = `${kyc.userName}_${kyc.id}.${
// //           kyc.docType?.toLowerCase() || "pdf"
// //         }`;
// //         a.click();
// //         URL.revokeObjectURL(url);
// //       } else {
// //         // Mobile: download using FileSystem + MediaLibrary
// //         const extension = kyc.docType?.toLowerCase() || "pdf";
// //         const fileName = `${kyc.userName}_${kyc.id}.${extension}`;
// //         const fileUri = FileSystem.cacheDirectory + fileName;

// //         const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);

// //         if (Platform.OS === "android") {
// //           const { status } = await MediaLibrary.requestPermissionsAsync();
// //           if (status !== "granted") return Alert.alert("Permission denied");

// //           const asset = await MediaLibrary.createAssetAsync(uri);
// //           await MediaLibrary.createAlbumAsync("Download", asset, false);
// //           Alert.alert("Download Complete", "File saved to Downloads folder!");
// //         } else if (Platform.OS === "ios") {
// //           if (await Sharing.isAvailableAsync()) {
// //             await Sharing.shareAsync(uri);
// //           } else {
// //             Alert.alert("Download Complete", "File saved in app cache.");
// //           }
// //         }
// //       }
// //     } catch (err) {
// //       console.error("Download error:", err);
// //       Alert.alert("Error", "Failed to download KYC file.");
// //     } finally {
// //       setDownloading(false);
// //     }
// //   };

// //   const handleApprove = async () => {
// //     try {
// //       await approveKyc(kyc.id);
// //       Alert.alert("Success", "KYC Approved!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Approve KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to approve KYC.");
// //     }
// //   };

// //   const handleReject = async () => {
// //     if (!reason.trim()) {
// //       Alert.alert("Reason Required", "Please provide a reason for rejection.");
// //       return;
// //     }
// //     try {
// //       await rejectKyc(kyc.id, reason);
// //       Alert.alert("Success", "KYC Rejected!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Reject KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to reject KYC.");
// //     }
// //   };

// //   if (loading)
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#2196f3" />
// //       </View>
// //     );

// //   if (!kyc)
// //     return (
// //       <View style={styles.container}>
// //         <Text style={styles.empty}>KYC not found.</Text>
// //       </View>
// //     );

// //   return (
// //     <View style={styles.wrapper}>
// //       <View style={styles.navBar}>
// //         <TouchableOpacity
// //           onPress={() => navigation.goBack()}
// //           style={styles.backButton}
// //         >
// //           <Ionicons name="arrow-back" size={24} color="#fff" />
// //         </TouchableOpacity>
// //         <Text style={styles.navTitle}>KYC Detail</Text>
// //       </View>

// //       <ScrollView style={styles.container}>
// //         <Text style={styles.label}>Name: {kyc.userName}</Text>
// //         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
// //         <Text style={styles.label}>Role: {kyc.roleType}</Text>
// //         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
// //         <Text style={styles.label}>Status: {kyc.status}</Text>

// //         <TouchableOpacity
// //           style={[
// //             styles.downloadBtn,
// //             downloading && { backgroundColor: "#ccc" },
// //           ]}
// //           onPress={downloadKycFile}
// //           disabled={downloading}
// //         >
// //           {downloading ? (
// //             <ActivityIndicator color="#fff" />
// //           ) : (
// //             <Text style={styles.downloadText}>Download / Open Document</Text>
// //           )}
// //         </TouchableOpacity>

// //         <TextInput
// //           style={styles.input}
// //           placeholder="Reason for rejection"
// //           value={reason}
// //           onChangeText={setReason}
// //         />

// //         <View style={styles.buttonRow}>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.approveBtn]}
// //             onPress={handleApprove}
// //           >
// //             <Text style={styles.btnText}>Approve</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.rejectBtn]}
// //             onPress={handleReject}
// //           >
// //             <Text style={styles.btnText}>Reject</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </ScrollView>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
// //   navBar: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#2196f3",
// //     paddingVertical: 12,
// //     paddingHorizontal: 15,
// //     elevation: 3,
// //   },
// //   backButton: { marginRight: 10, padding: 4 },
// //   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
// //   container: { flex: 1, padding: 20 },
// //   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   label: { fontSize: 18, marginBottom: 10 },
// //   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
// //   downloadBtn: {
// //     backgroundColor: "#2196f3",
// //     padding: 12,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginVertical: 15,
// //   },
// //   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //     borderRadius: 8,
// //     padding: 10,
// //     marginBottom: 15,
// //     backgroundColor: "#fff",
// //   },
// //   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
// //   btn: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginHorizontal: 5,
// //   },
// //   approveBtn: { backgroundColor: "#4CAF50" },
// //   rejectBtn: { backgroundColor: "#FF3B30" },
// //   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// // });
// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   ScrollView,
// //   TouchableOpacity,
// //   TextInput,
// //   ActivityIndicator,
// //   Alert,
// //   StyleSheet,
// //   Platform,
// // } from "react-native";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import * as FileSystem from "expo-file-system/legacy"; // ✅ Legacy API
// // import * as MediaLibrary from "expo-media-library";
// // import * as Sharing from "expo-sharing";
// // import { Ionicons } from "@expo/vector-icons";

// // import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// // export default function AdminKycDetail({ route, navigation }) {
// //   const { kycId } = route.params;
// //   const [kyc, setKyc] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [reason, setReason] = useState("");
// //   const [downloading, setDownloading] = useState(false);

// //   const BASE_URL = "http://192.168.30.218:8080";

// //   useEffect(() => {
// //     fetchKycDetail();
// //   }, []);

// //   const fetchKycDetail = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await fetchPendingKyc();
// //       const content = res.data?.data?.content || [];
// //       const selectedKyc = content.find((item) => item.id === kycId);
// //       if (!selectedKyc) {
// //         Alert.alert(
// //           "KYC Not Found",
// //           "This KYC request is no longer available."
// //         );
// //         navigation.goBack();
// //         return;
// //       }
// //       setKyc(selectedKyc);
// //     } catch (err) {
// //       console.error(
// //         "Fetch KYC Detail Error:",
// //         err.response?.data || err.message
// //       );
// //       Alert.alert("Error", "Failed to fetch KYC details.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const downloadKycFile = async () => {
// //     if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");

// //     try {
// //       setDownloading(true);
// //       const token = await AsyncStorage.getItem("adminToken");
// //       if (!token) return Alert.alert("Error", "Admin not logged in");

// //       const fileUrl = `${BASE_URL}/${kyc.downloadUrl}?token=${token}`;

// //       if (Platform.OS === "web") {
// //         // ✅ Web: download via blob
// //         const response = await fetch(fileUrl);
// //         const blob = await response.blob();
// //         const url = URL.createObjectURL(blob);
// //         const a = document.createElement("a");
// //         a.href = url;
// //         a.download = `${kyc.userName}_${kyc.id}.${
// //           kyc.docType?.toLowerCase() || "pdf"
// //         }`;
// //         a.click();
// //         URL.revokeObjectURL(url);
// //       } else {
// //         // ✅ Mobile: download using legacy FileSystem API + MediaLibrary
// //         const extension = kyc.docType?.toLowerCase() || "pdf";
// //         const fileName = `${kyc.userName}_${kyc.id}.${extension}`;
// //         const fileUri = FileSystem.cacheDirectory + fileName;

// //         const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);

// //         if (Platform.OS === "android") {
// //           const { status } = await MediaLibrary.requestPermissionsAsync();
// //           if (status !== "granted") return Alert.alert("Permission denied");

// //           const asset = await MediaLibrary.createAssetAsync(uri);
// //           await MediaLibrary.createAlbumAsync("Download", asset, false);
// //           Alert.alert("Download Complete", "File saved to Downloads folder!");
// //         } else if (Platform.OS === "ios") {
// //           if (await Sharing.isAvailableAsync()) {
// //             await Sharing.shareAsync(uri);
// //           } else {
// //             Alert.alert("Download Complete", "File saved in app cache.");
// //           }
// //         }
// //       }
// //     } catch (err) {
// //       console.error("Download error:", err);
// //       Alert.alert("Error", "Failed to download KYC file.");
// //     } finally {
// //       setDownloading(false);
// //     }
// //   };

// //   const handleApprove = async () => {
// //     try {
// //       await approveKyc(kyc.id);
// //       Alert.alert("Success", "KYC Approved!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Approve KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to approve KYC.");
// //     }
// //   };

// //   const handleReject = async () => {
// //     if (!reason.trim()) {
// //       Alert.alert("Reason Required", "Please provide a reason for rejection.");
// //       return;
// //     }
// //     try {
// //       await rejectKyc(kyc.id, reason);
// //       Alert.alert("Success", "KYC Rejected!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Reject KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to reject KYC.");
// //     }
// //   };

// //   if (loading)
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#2196f3" />
// //       </View>
// //     );

// //   if (!kyc)
// //     return (
// //       <View style={styles.container}>
// //         <Text style={styles.empty}>KYC not found.</Text>
// //       </View>
// //     );

// //   return (
// //     <View style={styles.wrapper}>
// //       <View style={styles.navBar}>
// //         <TouchableOpacity
// //           onPress={() => navigation.goBack()}
// //           style={styles.backButton}
// //         >
// //           <Ionicons name="arrow-back" size={24} color="#fff" />
// //         </TouchableOpacity>
// //         <Text style={styles.navTitle}>KYC Detail</Text>
// //       </View>

// //       <ScrollView style={styles.container}>
// //         <Text style={styles.label}>Name: {kyc.userName}</Text>
// //         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
// //         <Text style={styles.label}>Role: {kyc.roleType}</Text>
// //         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
// //         <Text style={styles.label}>Status: {kyc.status}</Text>

// //         <TouchableOpacity
// //           style={[
// //             styles.downloadBtn,
// //             downloading && { backgroundColor: "#ccc" },
// //           ]}
// //           onPress={downloadKycFile}
// //           disabled={downloading}
// //         >
// //           {downloading ? (
// //             <ActivityIndicator color="#fff" />
// //           ) : (
// //             <Text style={styles.downloadText}>Download / Open Document</Text>
// //           )}
// //         </TouchableOpacity>

// //         <TextInput
// //           style={styles.input}
// //           placeholder="Reason for rejection"
// //           value={reason}
// //           onChangeText={setReason}
// //         />

// //         <View style={styles.buttonRow}>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.approveBtn]}
// //             onPress={handleApprove}
// //           >
// //             <Text style={styles.btnText}>Approve</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.rejectBtn]}
// //             onPress={handleReject}
// //           >
// //             <Text style={styles.btnText}>Reject</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </ScrollView>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
// //   navBar: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#2196f3",
// //     paddingVertical: 12,
// //     paddingHorizontal: 15,
// //     elevation: 3,
// //   },
// //   backButton: { marginRight: 10, padding: 4 },
// //   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
// //   container: { flex: 1, padding: 20 },
// //   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   label: { fontSize: 18, marginBottom: 10 },
// //   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
// //   downloadBtn: {
// //     backgroundColor: "#2196f3",
// //     padding: 12,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginVertical: 15,
// //   },
// //   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //     borderRadius: 8,
// //     padding: 10,
// //     marginBottom: 15,
// //     backgroundColor: "#fff",
// //   },
// //   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
// //   btn: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginHorizontal: 5,
// //   },
// //   approveBtn: { backgroundColor: "#4CAF50" },
// //   rejectBtn: { backgroundColor: "#FF3B30" },
// //   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// // });
// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   ScrollView,
// //   TouchableOpacity,
// //   TextInput,
// //   ActivityIndicator,
// //   Alert,
// //   StyleSheet,
// //   Platform,
// // } from "react-native";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import * as FileSystem from "expo-file-system";
// // import * as Sharing from "expo-sharing";
// // import { Ionicons } from "@expo/vector-icons";

// // import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// // export default function AdminKycDetail({ route, navigation }) {
// //   const { kycId } = route.params;
// //   const [kyc, setKyc] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [reason, setReason] = useState("");
// //   const [downloading, setDownloading] = useState(false);

// //   const BASE_URL = "http://192.168.30.218:8080";

// //   useEffect(() => {
// //     fetchKycDetail();
// //   }, []);

// //   const fetchKycDetail = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await fetchPendingKyc();
// //       const content = res.data?.data?.content || [];
// //       const selectedKyc = content.find((item) => item.id === kycId);
// //       if (!selectedKyc) {
// //         Alert.alert(
// //           "KYC Not Found",
// //           "This KYC request is no longer available."
// //         );
// //         navigation.goBack();
// //         return;
// //       }
// //       setKyc(selectedKyc);
// //     } catch (err) {
// //       console.error(
// //         "Fetch KYC Detail Error:",
// //         err.response?.data || err.message
// //       );
// //       Alert.alert("Error", "Failed to fetch KYC details.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
// //   const downloadKycFile = async () => {
// //     if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");

// //     try {
// //       setDownloading(true);
// //       const token = await AsyncStorage.getItem("adminToken");
// //       if (!token) return Alert.alert("Error", "Admin not logged in");

// //       const fileUrl = `${BASE_URL}/${kyc.downloadUrl}?token=${token}`;
// //       const fileName = `${kyc.userName}_${kyc.id}.${
// //         kyc.docType?.toLowerCase() || "pdf"
// //       }`;
// //       const fileUri = FileSystem.cacheDirectory + fileName;

// //       if (Platform.OS === "web") {
// //         const response = await fetch(fileUrl);
// //         const blob = await response.blob();
// //         const url = URL.createObjectURL(blob);
// //         const a = document.createElement("a");
// //         a.href = url;
// //         a.download = fileName;
// //         a.click();
// //         URL.revokeObjectURL(url);
// //       } else {
// //         // Mobile: fetch the file as blob
// //         const response = await fetch(fileUrl);
// //         const blob = await response.blob();
// //         const arrayBuffer = await blob.arrayBuffer();
// //         const uint8Array = new Uint8Array(arrayBuffer);

// //         // Write binary directly to cache directory
// //         await FileSystem.writeAsStringAsync(
// //           fileUri,
// //           String.fromCharCode(...uint8Array),
// //           {
// //             encoding: FileSystem.EncodingType.Base64,
// //           }
// //         );

// //         if (await Sharing.isAvailableAsync()) {
// //           await Sharing.shareAsync(fileUri);
// //         } else {
// //           Alert.alert(
// //             "Download Complete",
// //             `File saved in app cache:\n${fileUri}`
// //           );
// //         }
// //       }
// //     } catch (err) {
// //       console.error("Download error:", err);
// //       Alert.alert("Error", "Failed to download KYC file.");
// //     } finally {
// //       setDownloading(false);
// //     }
// //   };

// //   const handleApprove = async () => {
// //     try {
// //       await approveKyc(kyc.id);
// //       Alert.alert("Success", "KYC Approved!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Approve KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to approve KYC.");
// //     }
// //   };

// //   const handleReject = async () => {
// //     if (!reason.trim()) {
// //       Alert.alert("Reason Required", "Please provide a reason for rejection.");
// //       return;
// //     }
// //     try {
// //       await rejectKyc(kyc.id, reason);
// //       Alert.alert("Success", "KYC Rejected!");
// //       navigation.goBack();
// //     } catch (err) {
// //       console.error("Reject KYC Error:", err.response?.data || err.message);
// //       Alert.alert("Error", "Failed to reject KYC.");
// //     }
// //   };

// //   if (loading)
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#2196f3" />
// //       </View>
// //     );

// //   if (!kyc)
// //     return (
// //       <View style={styles.container}>
// //         <Text style={styles.empty}>KYC not found.</Text>
// //       </View>
// //     );

// //   return (
// //     <View style={styles.wrapper}>
// //       <View style={styles.navBar}>
// //         <TouchableOpacity
// //           onPress={() => navigation.goBack()}
// //           style={styles.backButton}
// //         >
// //           <Ionicons name="arrow-back" size={24} color="#fff" />
// //         </TouchableOpacity>
// //         <Text style={styles.navTitle}>KYC Detail</Text>
// //       </View>

// //       <ScrollView style={styles.container}>
// //         <Text style={styles.label}>Name: {kyc.userName}</Text>
// //         <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
// //         <Text style={styles.label}>Role: {kyc.roleType}</Text>
// //         <Text style={styles.label}>Document Type: {kyc.docType}</Text>
// //         <Text style={styles.label}>Status: {kyc.status}</Text>

// //         <TouchableOpacity
// //           style={[
// //             styles.downloadBtn,
// //             downloading && { backgroundColor: "#ccc" },
// //           ]}
// //           onPress={downloadKycFile}
// //           disabled={downloading}
// //         >
// //           {downloading ? (
// //             <ActivityIndicator color="#fff" />
// //           ) : (
// //             <Text style={styles.downloadText}>Download / Open Document</Text>
// //           )}
// //         </TouchableOpacity>

// //         <TextInput
// //           style={styles.input}
// //           placeholder="Reason for rejection"
// //           value={reason}
// //           onChangeText={setReason}
// //         />

// //         <View style={styles.buttonRow}>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.approveBtn]}
// //             onPress={handleApprove}
// //           >
// //             <Text style={styles.btnText}>Approve</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity
// //             style={[styles.btn, styles.rejectBtn]}
// //             onPress={handleReject}
// //           >
// //             <Text style={styles.btnText}>Reject</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </ScrollView>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   wrapper: { flex: 1, backgroundColor: "#f0f4f7" },
// //   navBar: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#2196f3",
// //     paddingVertical: 12,
// //     paddingHorizontal: 15,
// //     elevation: 3,
// //   },
// //   backButton: { marginRight: 10, padding: 4 },
// //   navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
// //   container: { flex: 1, padding: 20 },
// //   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   label: { fontSize: 18, marginBottom: 10 },
// //   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
// //   downloadBtn: {
// //     backgroundColor: "#2196f3",
// //     padding: 12,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginVertical: 15,
// //   },
// //   downloadText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //     borderRadius: 8,
// //     padding: 10,
// //     marginBottom: 15,
// //     backgroundColor: "#fff",
// //   },
// //   buttonRow: { flexDirection: "row", justifyContent: "space-between" },
// //   btn: {
// //     flex: 1,
// //     padding: 15,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginHorizontal: 5,
// //   },
// //   approveBtn: { backgroundColor: "#4CAF50" },
// //   rejectBtn: { backgroundColor: "#FF3B30" },
// //   btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
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
// import * as FileSystem from "expo-file-system/legacy"; // legacy API for mobile download
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

//   const BASE_URL = "http://192.168.30.218:8080";

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
//       const extension = kyc.docType?.toLowerCase() || "pdf";
//       const fileName = `${kyc.userName}_${kyc.id}.${extension}`;

//       if (Platform.OS === "web") {
//         // Web download
//         const response = await fetch(fileUrl);
//         const blob = await response.blob();
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = fileName;
//         a.click();
//         URL.revokeObjectURL(url);
//       } else {
//         // Mobile download using legacy FileSystem
//         const fileUri = FileSystem.cacheDirectory + fileName;
//         const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);

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

//   const BASE_URL = "http://192.168.30.218:8080";

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

//   const BASE_URL = "http://192.168.30.218:8080";

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

//   const BASE_URL = "https://192.168.30.218:8080";

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
import { Ionicons } from "@expo/vector-icons";

import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

export default function AdminKycDetail({ route, navigation }) {
  const { kycId } = route.params;
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [downloading, setDownloading] = useState(false);

  const BASE_URL = "https://192.168.30.218:8080"; // Use HTTPS for secure browser download

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
      console.error(
        "Fetch KYC Detail Error:",
        err.response?.data || err.message
      );
      Alert.alert("Error", "Failed to fetch KYC details.");
    } finally {
      setLoading(false);
    }
  };

  const downloadKycFile = async () => {
    if (!kyc?.downloadUrl) return Alert.alert("Error", "Invalid KYC document");

    try {
      setDownloading(true);
      const token = await AsyncStorage.getItem("adminToken");
      if (!token) return Alert.alert("Error", "Admin not logged in");

      // Full secure download URL with token
      const fileUrl = `${BASE_URL}/${kyc.downloadUrl}?token=${token}`;

      console.log("Opening KYC in browser:", fileUrl);

      const supported = await Linking.canOpenURL(fileUrl);
      if (supported) {
        await Linking.openURL(fileUrl);
      } else {
        Alert.alert("Error", "Cannot open browser to download KYC.");
      }
    } catch (err) {
      console.error("Download error:", err);
      Alert.alert("Error", "Failed to download KYC file.");
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
      console.error("Approve KYC Error:", err.response?.data || err.message);
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
      console.error("Reject KYC Error:", err.response?.data || err.message);
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
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>KYC Detail</Text>
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.label}>Name: {kyc.userName}</Text>
        <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
        <Text style={styles.label}>Role: {kyc.roleType}</Text>
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
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196f3",
    paddingVertical: 12,
    paddingHorizontal: 15,
    elevation: 3,
  },
  backButton: { marginRight: 10, padding: 4 },
  navTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
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

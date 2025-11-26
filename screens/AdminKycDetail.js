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

//   const BASE_URL = "http:// 192.168.1.40:8080"; // replace with HTTPS if possible

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

//   const BASE_URL = "https:// 192.168.1.40:8080"; // replace with your API base URL

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
// import RNFS from "react-native-fs";
// import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

// export default function AdminKycDetail({ route, navigation }) {
//   const { kycId } = route.params;

//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [reason, setReason] = useState("");
//   const [downloading, setDownloading] = useState(false);
//   const [approving, setApproving] = useState(false);
//   const [rejecting, setRejecting] = useState(false);

//   const BASE_URL = "http://192.168.1.40:8080"; // replace with HTTPS in production

//   useEffect(() => {
//     fetchKycDetail();
//   }, []);

//   // Fetch single KYC detail
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

//   // Download KYC securely using react-native-fs
//   const downloadKycFile = async () => {
//     if (!kyc) return;
//     setDownloading(true);

//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) {
//         Alert.alert("Error", "Admin not logged in");
//         return;
//       }

//       const fileUrl = `${BASE_URL}/api/admin/kyc/file/${kyc.id}`;
//       const filename = `${kyc.userName}_${kyc.id}.pdf`; // default name
//       const downloadDest = `${RNFS.DocumentDirectoryPath}/${filename}`;

//       const options = {
//         fromUrl: fileUrl,
//         toFile: downloadDest,
//         headers: {
//           Authorization: `Bearer ${token}`, // secure token
//         },
//       };

//       const result = await RNFS.downloadFile(options).promise;

//       if (result.statusCode === 200) {
//         Alert.alert("Success", `File downloaded to:\n${downloadDest}`);
//       } else {
//         console.error("Download failed", result);
//         Alert.alert("Error", "Failed to download KYC file.");
//       }
//     } catch (err) {
//       console.error("Download error:", err);
//       Alert.alert("Error", "Failed to download KYC file.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   // Approve KYC
//   const handleApprove = async () => {
//     if (!kyc) return;
//     setApproving(true);
//     try {
//       await approveKyc(kyc.id);
//       Alert.alert("Success", "KYC Approved!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Approve KYC Error:", err);
//       Alert.alert("Error", "Failed to approve KYC.");
//     } finally {
//       setApproving(false);
//     }
//   };

//   // Reject KYC
//   const handleReject = async () => {
//     if (!reason.trim()) {
//       Alert.alert("Reason Required", "Please provide a reason for rejection.");
//       return;
//     }
//     if (!kyc) return;
//     setRejecting(true);
//     try {
//       await rejectKyc(kyc.id, reason);
//       Alert.alert("Success", "KYC Rejected!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Reject KYC Error:", err);
//       Alert.alert("Error", "Failed to reject KYC.");
//     } finally {
//       setRejecting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2196f3" />
//       </View>
//     );
//   }

//   if (!kyc) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.empty}>KYC not found.</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.wrapper}>
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

//         <TextInput
//           style={styles.input}
//           placeholder="Reason for rejection"
//           value={reason}
//           onChangeText={setReason}
//         />

//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={[styles.btn, styles.approveBtn, approving && { opacity: 0.7 }]}
//             onPress={handleApprove}
//             disabled={approving}
//           >
//             {approving ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.btnText}>Approve</Text>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.btn, styles.rejectBtn, rejecting && { opacity: 0.7 }]}
//             onPress={handleReject}
//             disabled={rejecting}
//           >
//             {rejecting ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.btnText}>Reject</Text>
//             )}
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
//present corret code

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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

export default function AdminKycDetail({ route, navigation }) {
  const { kycId } = route.params;
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [downloading, setDownloading] = useState(false);

  const BASE_URL = "http://192.168.1.40:8080"; // Use HTTPS in production

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
      if (!token) throw new Error("Admin not logged in");

      const fileUrl = `${BASE_URL}/api/admin/kyc/file/${
        kyc.id
      }?token=${encodeURIComponent(token)}`;
      const fileName = `KYC_${kyc.id}.pdf`;
      const localPath = `${FileSystem.documentDirectory}${fileName}`;

      // Download the file
      const downloadResumable = FileSystem.createDownloadResumable(
        fileUrl,
        localPath
      );

      const { uri } = await downloadResumable.downloadAsync();
      console.log("File downloaded to", uri);

      // Open file
      await Linking.openURL(uri);
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

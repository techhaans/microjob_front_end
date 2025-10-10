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
// import axios from "axios";

// const BASE_URL = "http://192.168.60.218:8080/api";

// export default function AdminKycDetail({ route, navigation }) {
//   const { kycId, role } = route.params;
//   const [kyc, setKyc] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [reason, setReason] = useState("");

//   useEffect(() => {
//     fetchKycDetail();
//   }, []);

//   const fetchKycDetail = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return navigation.replace("AdminLogin");

//       const res = await axios.get(`${BASE_URL}/admin/kyc/pending`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const content = res.data?.data?.content || [];
//       const selectedKyc = content.find((item) => item.id === kycId);

//       if (!selectedKyc) {
//         Alert.alert("KYC Not Found", "This KYC request is no longer available.");
//         navigation.goBack();
//         return;
//       }

//       setKyc(selectedKyc);
//     } catch (err) {
//       console.error("Fetch KYC Detail Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to fetch KYC details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadFile = () => {
//     if (!kyc?.downloadUrl) return;
//     // Correct URL without double /api/api
//     const url = `${BASE_URL.replace(/\/$/, "")}/${kyc.downloadUrl.replace(/^\/+/, "")}`;
//     Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
//   };

//   const handleApprove = async () => {
//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       const res = await axios.post(`${BASE_URL}/admin/kyc/approve/${kyc.id}`, null, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       Alert.alert("Success", "KYC Approved!");
//       navigation.goBack(); // Go back to refresh dashboard
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
//       const token = await AsyncStorage.getItem("adminToken");
//       const res = await axios.post(
//         `${BASE_URL}/admin/kyc/reject/${kyc.id}?reason=${encodeURIComponent(reason)}`,
//         null,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       Alert.alert("Success", "KYC Rejected!");
//       navigation.goBack(); // Go back to refresh dashboard
//     } catch (err) {
//       console.error("Reject KYC Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to reject KYC.");
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
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>KYC Detail</Text>
//       <Text style={styles.label}>Name: {kyc.userName}</Text>
//       <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
//       <Text style={styles.label}>Role: {kyc.roleType}</Text>
//       <Text style={styles.label}>Document Type: {kyc.docType}</Text>
//       <Text style={styles.label}>Status: {kyc.status}</Text>

//       <TouchableOpacity style={styles.downloadBtn} onPress={downloadFile}>
//         <Text style={styles.downloadText}>Download Document</Text>
//       </TouchableOpacity>

//       <TextInput
//         style={styles.input}
//         placeholder="Reason for rejection"
//         value={reason}
//         onChangeText={setReason}
//       />

//       <View style={styles.buttonRow}>
//         <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={handleApprove}>
//           <Text style={styles.btnText}>Approve</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={handleReject}>
//           <Text style={styles.btnText}>Reject</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#f0f4f7" },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
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
//   btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: "center", marginHorizontal: 5 },
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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

export default function AdminKycDetail({ route, navigation }) {
  const { kycId } = route.params;
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchKycDetail();
  }, []);

  // Fetch KYC details
  const fetchKycDetail = async () => {
    setLoading(true);
    try {
      const res = await fetchPendingKyc();
      const content = res.data?.data?.content || [];
      const selectedKyc = content.find((item) => item.id === kycId);

      if (!selectedKyc) {
        Alert.alert("KYC Not Found", "This KYC request is no longer available.");
        navigation.goBack();
        return;
      }

      setKyc(selectedKyc);
    } catch (err) {
      console.error("Fetch KYC Detail Error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch KYC details.");
    } finally {
      setLoading(false);
    }
  };

  // Download KYC document using base64 method
  const downloadFile = async () => {
    if (!kyc?.id) {
      Alert.alert("Error", "Invalid KYC document");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("adminToken");
      if (!token) {
        Alert.alert("Error", "Admin not logged in");
        return;
      }

      const url = `http://192.168.60.218:8080/api/admin/kyc/file/${kyc.id}`;
      const fileUri = FileSystem.documentDirectory + `KYC_${kyc.id}.pdf`;

      // Fetch the file as blob
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();

      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result.split(",")[1]; // remove "data:...;base64,"
        await FileSystem.writeAsStringAsync(fileUri, base64data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert("Success", `File downloaded to: ${fileUri}`);

        // Share the file if available
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("File download error:", error);
      Alert.alert("Error", "Failed to download file.");
    }
  };

  // Approve KYC
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

  // Reject KYC
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
      </View>
    );
  }

  if (!kyc) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>KYC not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>KYC Detail</Text>
      <Text style={styles.label}>Name: {kyc.userName}</Text>
      <Text style={styles.label}>Phone: {kyc.userPhone}</Text>
      <Text style={styles.label}>Role: {kyc.roleType}</Text>
      <Text style={styles.label}>Document Type: {kyc.docType}</Text>
      <Text style={styles.label}>Status: {kyc.status}</Text>

      <TouchableOpacity style={styles.downloadBtn} onPress={downloadFile}>
        <Text style={styles.downloadText}>Download Document</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Reason for rejection"
        value={reason}
        onChangeText={setReason}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={handleApprove}>
          <Text style={styles.btnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={handleReject}>
          <Text style={styles.btnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0f4f7" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
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
  btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: "center", marginHorizontal: 5 },
  approveBtn: { backgroundColor: "#4CAF50" },
  rejectBtn: { backgroundColor: "#FF3B30" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

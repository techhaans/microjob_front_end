// // import React, { useState, useEffect } from "react";
// // import {
// //   View,
// //   Text,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   Alert,
// //   StyleSheet,
// // } from "react-native";
// // import * as DocumentPicker from "expo-document-picker";
// // import { uploadPosterKyc, getPosterKycHistory } from "../api/poster";

// // const ALLOWED_TYPES = ["PAN_CARD", "AADHAR_CARD", "VOTER_ID", "PASSPORT"];

// // export default function PosterKycUpload() {
// //   const [uploading, setUploading] = useState(false);
// //   const [kycHistory, setKycHistory] = useState([]);

// //   useEffect(() => {
// //     fetchKycHistory();
// //   }, []);

// //   const fetchKycHistory = async () => {
// //     try {
// //       const res = await getPosterKycHistory();
// //       setKycHistory(res?.data || []);
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   };

// //   const handleUploadKyc = async () => {
// //     try {
// //       const doc = await DocumentPicker.getDocumentAsync({
// //         type: ["image/*", "application/pdf"],
// //         copyToCacheDirectory: true,
// //       });
// //       if (doc.canceled) return;
// //       const file = doc.assets[0];
// //       const docType = ALLOWED_TYPES[0]; // Could show a picker in real app
// //       const formData = new FormData();
// //       formData.append("file", {
// //         uri: file.uri,
// //         name: file.name,
// //         type: file.mimeType || "application/octet-stream",
// //       });

// //       setUploading(true);
// //       const res = await uploadPosterKyc({ formData, docType });
// //       if (res.status === "SUCCESS") {
// //         Alert.alert("✅ Success", "KYC uploaded successfully!");
// //         fetchKycHistory();
// //       } else {
// //         Alert.alert("❌ Failed", res.message || "Upload failed");
// //       }
// //     } catch (err) {
// //       console.error(err);
// //       Alert.alert("Error", "KYC upload failed.");
// //     } finally {
// //       setUploading(false);
// //     }
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <TouchableOpacity
// //         style={styles.button}
// //         onPress={handleUploadKyc}
// //         disabled={uploading}
// //       >
// //         {uploading ? (
// //           <ActivityIndicator color="#fff" />
// //         ) : (
// //           <Text style={styles.buttonText}>Upload KYC</Text>
// //         )}
// //       </TouchableOpacity>

// //       <Text style={styles.sectionTitle}>KYC History</Text>
// //       {kycHistory.length === 0 ? (
// //         <Text style={styles.emptyText}>No KYC records found.</Text>
// //       ) : (
// //         kycHistory.map((item, i) => (
// //           <View key={i} style={styles.kycCard}>
// //             <Text>📄 {item.docType}</Text>
// //             <Text>Status: {item.status}</Text>
// //             {item.rejectionReason && (
// //               <Text>❌ Reason: {item.rejectionReason}</Text>
// //             )}
// //           </View>
// //         ))
// //       )}
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { padding: 20 },
// //   button: {
// //     backgroundColor: "#28a745",
// //     padding: 12,
// //     borderRadius: 10,
// //     alignItems: "center",
// //     marginBottom: 20,
// //   },
// //   buttonText: { color: "#fff", fontWeight: "bold" },
// //   sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
// //   emptyText: { color: "#666", fontStyle: "italic" },
// //   kycCard: {
// //     padding: 10,
// //     backgroundColor: "#f0f0f0",
// //     borderRadius: 8,
// //     marginBottom: 8,
// //   },
// // });
// // screens/PosterKycUpload.js
// import React, { useState } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { uploadPosterKyc } from "../api/poster";

// export default function PosterKycUpload({ navigation }) {
//   const [fileUri, setFileUri] = useState(null);
//   const [docType, setDocType] = useState("ID_PROOF");
//   const [loading, setLoading] = useState(false);

//   const pickFile = async () => {
//     const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!granted) return Alert.alert("Permission", "Allow access to photos.");
//     const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
//     if (!res.canceled) setFileUri(res.assets[0].uri);
//   };

//   const handleUpload = async () => {
//     if (!fileUri) return Alert.alert("Validation", "Please choose a file.");
//     setLoading(true);
//     try {
//       const formData = new FormData();
//       const filename = fileUri.split("/").pop();
//       const match = /\.(\w+)$/.exec(filename || "");
//       const type = match ? `image/${match[1]}` : "image/jpeg";
//       formData.append("file", { uri: fileUri, name: filename, type });
//       const res = await uploadPosterKyc({ formData, docType });
//       if (res.status === "SUCCESS") {
//         Alert.alert("Success", "KYC uploaded successfully");
//         navigation.goBack();
//       } else {
//         Alert.alert("Error", res.message || "Upload failed");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Upload failed");
//     } finally { setLoading(false); }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Upload KYC Document</Text>
//       <TouchableOpacity style={styles.pickBtn} onPress={pickFile}><Text style={styles.pickText}>Choose File</Text></TouchableOpacity>
//       {fileUri && <Text style={{ marginTop: 8 }}>Selected: {fileUri.split("/").pop()}</Text>}

//       <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload} disabled={loading}>
//         {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.uploadText}>Upload</Text>}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: "#f2f6fb" },
//   title: { fontSize: 20, fontWeight: "700", color: "#0b4da0", marginBottom: 12 },
//   pickBtn: { backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#e6eefb", alignItems: "center" },
//   pickText: { color: "#0b78ff", fontWeight: "700" },
//   uploadBtn: { backgroundColor: "#0b78ff", padding: 14, borderRadius: 12, marginTop: 16, alignItems: "center" },
//   uploadText: { color: "#fff", fontWeight: "700" },
// });
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { uploadPosterKyc, getPosterKycHistory, deletePosterKyc } from "../api/poster";

const ALLOWED_DOC_TYPES = ["PanCard", "AadharCard", "VoterID", "Passport"];

export default function PosterKycUpload() {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState(ALLOWED_DOC_TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [kycHistory, setKycHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  useEffect(() => {
    fetchKycHistory();
  }, []);

  const fetchKycHistory = async () => {
    try {
      setFetchingHistory(true);
      const res = await getPosterKycHistory();
      setKycHistory(res?.data || []);
    } catch (err) {
      console.error("KYC history fetch error:", err);
      Alert.alert("Error", "Failed to fetch KYC history.");
    } finally {
      setFetchingHistory(false);
    }
  };

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });
      if (res.type === "cancel") return;
      setFile(res);
    } catch (err) {
      console.error("Document pick error:", err);
      Alert.alert("Error", "Failed to pick document.");
    }
  };

  const handleUpload = async () => {
    if (!file) return Alert.alert("Validation", "Please choose a file.");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      });

      const res = await uploadPosterKyc(formData, docType);
      if (res.status === "SUCCESS") {
        Alert.alert("Success", "KYC uploaded successfully!");
        setFile(null);
        fetchKycHistory();
      } else {
        Alert.alert("Error", res.message || "Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", "KYC upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete KYC",
      "Are you sure you want to delete this KYC document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePosterKyc(id);
              Alert.alert("Deleted", "KYC deleted successfully!");
              fetchKycHistory();
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete KYC.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload KYC Document</Text>

      <TouchableOpacity style={styles.pickBtn} onPress={pickFile}>
        <Text style={styles.pickText}>{file ? "Change File" : "Choose File"}</Text>
      </TouchableOpacity>
      {file && <Text style={styles.fileName}>Selected: {file.name}</Text>}

      <TouchableOpacity
        style={[styles.uploadBtn, { opacity: loading ? 0.7 : 1 }]}
        onPress={handleUpload}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.uploadText}>Upload</Text>}
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>KYC History</Text>
      {fetchingHistory ? (
        <ActivityIndicator size="large" color="#0b78ff" />
      ) : kycHistory.length === 0 ? (
        <Text style={styles.emptyText}>No KYC records found.</Text>
      ) : (
        <FlatList
          data={kycHistory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.kycCard}>
              <Text>📄 {item.docType}</Text>
              <Text>Status: {item.status}</Text>
              {item.reason && <Text>❌ Reason: {item.reason}</Text>}
              <Text>📅 {new Date(item.createdAt).toLocaleString()}</Text>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f2f6fb" },
  title: { fontSize: 20, fontWeight: "700", color: "#0b4da0", marginBottom: 12 },
  pickBtn: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6eefb",
    alignItems: "center",
    marginBottom: 8,
  },
  pickText: { color: "#0b78ff", fontWeight: "700" },
  fileName: { marginBottom: 8, color: "#333" },
  uploadBtn: {
    backgroundColor: "#0b78ff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  uploadText: { color: "#fff", fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  emptyText: { color: "#666", fontStyle: "italic" },
  kycCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  deleteBtn: {
    marginTop: 6,
    backgroundColor: "#ff4c4c",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  deleteText: { color: "#fff", fontWeight: "700" },
});

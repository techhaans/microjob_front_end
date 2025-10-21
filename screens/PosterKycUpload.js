// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Platform,
// } from "react-native";
// import * as DocumentPicker from "expo-document-picker";
// import { Picker } from "@react-native-picker/picker";
// import { useNavigation } from "@react-navigation/native";
// import {
//   uploadPosterKyc,
//   getPosterKycHistory,
//   deletePosterKyc,
// } from "../api/poster";

// const ALLOWED_DOC_TYPES = ["PanCard", "AadharCard", "VoterID", "Passport"];

// export default function PosterKycUpload() {
//   const navigation = useNavigation();
//   const [file, setFile] = useState(null);
//   const [docType, setDocType] = useState(ALLOWED_DOC_TYPES[0]);
//   const [loading, setLoading] = useState(false);
//   const [kycHistory, setKycHistory] = useState([]);
//   const [fetchingHistory, setFetchingHistory] = useState(true);

//   useEffect(() => {
//     fetchKycHistory();
//   }, []);

//   const fetchKycHistory = async () => {
//     try {
//       setFetchingHistory(true);
//       const res = await getPosterKycHistory();
//       setKycHistory(res?.data || []);
//     } catch (err) {
//       console.error("KYC history fetch error:", err);
//       Alert.alert("Error", "Failed to fetch KYC history.");
//     } finally {
//       setFetchingHistory(false);
//     }
//   };

//   // 🔹 Pick document
//   const pickFile = async () => {
//     try {
//       const res = await DocumentPicker.getDocumentAsync({
//         type: ["image/*", "application/pdf"],
//         copyToCacheDirectory: true,
//       });

//       if (res.type === "cancel") return;

//       // Ensure URI is valid
//       let fileUri = res.uri;
//       if (!fileUri) {
//         Alert.alert("Error", "Failed to get file URI.");
//         return;
//       }

//       if (Platform.OS === "android" && !fileUri.startsWith("file://")) {
//         fileUri = "file://" + fileUri;
//       }

//       // Determine mimeType
//       const mimeType =
//         res.mimeType ||
//         (res.name?.endsWith(".pdf") ? "application/pdf" : "image/*");

//       setFile({
//         uri: fileUri,
//         name: res.name || "kyc_document.pdf",
//         mimeType,
//       });

//       console.log("Selected file:", fileUri, res.name, mimeType);
//     } catch (err) {
//       console.error("Document pick error:", err);
//       Alert.alert("Error", "Failed to pick document.");
//     }
//   };

//   // 🔹 Upload file
//   const handleUpload = async () => {
//     if (!file || !file.uri) {
//       console.log("File object invalid:", file);
//       Alert.alert("Error", "Please select a file first.");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await uploadPosterKyc(docType, file);

//       if (res.status === "ERROR") {
//         Alert.alert("Error", res.message);
//       } else {
//         Alert.alert("✅ Success", "KYC uploaded successfully!");
//         setFile(null);
//         fetchKycHistory();
//       }
//     } catch (err) {
//       console.error("Upload error:", err);
//       Alert.alert("Error", "Failed to upload KYC.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 Delete KYC document
//   const handleDelete = (id) => {
//     Alert.alert(
//       "Delete KYC",
//       "Are you sure you want to delete this KYC document?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await deletePosterKyc(id);
//               Alert.alert("Deleted", "KYC deleted successfully!");
//               fetchKycHistory();
//             } catch (err) {
//               console.error("Delete error:", err);
//               Alert.alert("Error", "Failed to delete KYC.");
//             }
//           },
//         },
//       ]
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         style={styles.backButton}
//         onPress={() => navigation.goBack()}
//       >
//         <Text style={styles.backText}>←</Text>
//       </TouchableOpacity>

//       <Text style={styles.title}>Upload KYC Document</Text>

//       <View style={styles.pickerWrapper}>
//         <Text style={styles.label}>Select Document Type</Text>
//         <Picker
//           selectedValue={docType}
//           onValueChange={(value) => setDocType(value)}
//           style={styles.picker}
//         >
//           {ALLOWED_DOC_TYPES.map((type) => (
//             <Picker.Item key={type} label={type} value={type} />
//           ))}
//         </Picker>
//       </View>

//       <TouchableOpacity style={styles.pickBtn} onPress={pickFile}>
//         <Text style={styles.pickText}>
//           {file ? "Change File" : "Choose File"}
//         </Text>
//       </TouchableOpacity>

//       {file && <Text style={styles.fileName}>📎 {file.name}</Text>}

//       <TouchableOpacity
//         style={[styles.uploadBtn, { opacity: loading ? 0.6 : 1 }]}
//         onPress={handleUpload}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.uploadText}>Upload</Text>
//         )}
//       </TouchableOpacity>

//       <Text style={styles.sectionTitle}>KYC History</Text>

//       {fetchingHistory ? (
//         <ActivityIndicator size="large" color="#0b78ff" />
//       ) : kycHistory.length === 0 ? (
//         <Text style={styles.emptyText}>No KYC records found.</Text>
//       ) : (
//         <FlatList
//           data={kycHistory}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={({ item }) => (
//             <View style={styles.kycCard}>
//               <Text style={styles.cardTitle}>{item.docType}</Text>
//               <Text>Status: {item.status}</Text>
//               {item.reason && <Text>❌ Reason: {item.reason}</Text>}
//               <Text style={styles.timestamp}>
//                 📅 {new Date(item.createdAt).toLocaleString()}
//               </Text>

//               <TouchableOpacity
//                 style={styles.deleteBtn}
//                 onPress={() => handleDelete(item.id)}
//               >
//                 <Text style={styles.deleteText}>Delete</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: "#f7faff" },
//   backButton: { marginBottom: 8 },
//   backText: { fontSize: 36, color: "#2196f3", fontWeight: "600" },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#0b4da0",
//     marginBottom: 16,
//   },
//   label: { fontSize: 14, color: "#555", marginBottom: 4 },
//   pickerWrapper: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#dce3f0",
//   },
//   picker: { width: "100%" },
//   pickBtn: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#e6eefb",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   pickText: { color: "#0b78ff", fontWeight: "700" },
//   fileName: { marginBottom: 8, color: "#333", fontStyle: "italic" },
//   uploadBtn: {
//     backgroundColor: "#0b78ff",
//     padding: 14,
//     borderRadius: 12,
//     marginBottom: 20,
//     alignItems: "center",
//   },
//   uploadText: { color: "#fff", fontWeight: "700" },
//   sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
//   emptyText: { color: "#666", fontStyle: "italic" },
//   kycCard: {
//     backgroundColor: "#fff",
//     padding: 14,
//     borderRadius: 10,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//     elevation: 2,
//   },
//   cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
//   timestamp: { color: "#666", marginTop: 4 },
//   deleteBtn: {
//     marginTop: 6,
//     backgroundColor: "#ff4c4c",
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 6,
//     alignSelf: "flex-start",
//   },
//   deleteText: { color: "#fff", fontWeight: "700" },
// });

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function PosterKYCUpload({ navigation }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Pick either image or PDF
  const pickFile = async () => {
    try {
      Alert.alert(
        "Select File Type",
        "Choose which type of file to upload",
        [
          {
            text: "Image",
            onPress: async () => {
              const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== "granted") {
                Alert.alert(
                  "Permission required",
                  "Please allow access to your gallery"
                );
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                quality: 1,
              });

              if (!result.canceled && result.assets?.length > 0) {
                const asset = result.assets[0];
                setFile({
                  uri: asset.uri,
                  name: "poster_kyc_image.jpg",
                  type: "image/jpeg",
                });
              }
            },
          },
          {
            text: "PDF",
            onPress: async () => {
              const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
              });

              if (result.type !== "cancel") {
                setFile({
                  uri: result.uri,
                  name: result.name || "poster_kyc_document.pdf",
                  type: "application/pdf",
                });
              }
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
        { cancelable: true }
      );
    } catch (err) {
      console.error("File pick error:", err);
      Alert.alert("Error", "Failed to pick a file.");
    }
  };

  // ✅ Upload file to Poster profile KYC API
  const handleUpload = async () => {
    if (!file || !file.uri) {
      Alert.alert("Error", "Please select a file first.");
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");

      // Android fix for missing file:// prefix
      let fileUri = file.uri;
      if (Platform.OS === "android" && !fileUri.startsWith("file://")) {
        fileUri = "file://" + fileUri;
      }

      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        name: file.name,
        type: file.type,
      });

      const res = await axios.post(
        `http://192.168.156.218:8080/api/poster/profile/doc/upload?docType=PanCard`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert(
        "✅ Success",
        res.data.message || "KYC uploaded successfully!"
      );
      setFile(null);
      navigation.goBack();
    } catch (err) {
      console.error("Upload Error:", err);
      Alert.alert("Upload Failed", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Poster Profile - Upload KYC</Text>

      <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
        <Text style={styles.filePickerText}>
          {file ? "Change File" : "Choose File (Image or PDF)"}
        </Text>
      </TouchableOpacity>

      {file && file.type.startsWith("image/") && (
        <Image source={{ uri: file.uri }} style={styles.preview} />
      )}

      <TouchableOpacity
        style={styles.uploadBtn}
        onPress={handleUpload}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.uploadText}>Upload KYC</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f0f4f7",
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#333" },
  filePicker: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  filePickerText: { fontSize: 16, color: "#555" },
  preview: { width: 250, height: 250, borderRadius: 10, marginBottom: 20 },
  uploadBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 12,
  },
  uploadText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});

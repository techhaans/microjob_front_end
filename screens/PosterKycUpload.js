import React, { useState, useEffect } from "react";
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
import { Ionicons } from "@expo/vector-icons";

export default function PosterKYCUpload({ navigation }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null); // ✅ for KYC review status
  const [statusLoading, setStatusLoading] = useState(true);

  // ✅ Fetch KYC status on screen load
  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    try {
      setStatusLoading(true);
      const token = await AsyncStorage.getItem("authToken");

      setKycStatus(res.data.status); // Example: "Pending Review"
    } catch (err) {
      console.error("Status fetch error:", err);
      setKycStatus("Not Uploaded");
    } finally {
      setStatusLoading(false);
    }
  };

  // ✅ File Picker
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
                  "Please allow access to your gallery",
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
        { cancelable: true },
      );
    } catch (err) {
      console.error("File pick error:", err);
      Alert.alert("Error", "Failed to pick a file.");
    }
  };

  // ✅ Upload File
  const handleUpload = async () => {
    if (!file || !file.uri) {
      Alert.alert("Error", "Please select a file first.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");

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
        `http://192.168.1.40:8080/api/poster/profile/doc/upload?docType=PanCard`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Alert.alert(
        "✅ Success",
        res.data.message || "KYC uploaded successfully!",
      );
      setFile(null);
      fetchKycStatus(); // ✅ Refresh status after upload
    } catch (err) {
      console.error("Upload Error:", err);
      Alert.alert("Upload Failed", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper for color based on status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "#28a745";
      case "pending":
      case "pending review":
        return "#ffc107";
      case "rejected":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload KYC</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Poster Profile - KYC Upload</Text>

        {/* ✅ Show KYC Status */}
        {statusLoading ? (
          <ActivityIndicator color="#007bff" style={{ marginBottom: 10 }} />
        ) : (
          <Text
            style={[styles.statusText, { color: getStatusColor(kycStatus) }]}
          >
            Status: {kycStatus || "Not Uploaded"}
          </Text>
        )}

        <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
          <Ionicons name="cloud-upload-outline" size={24} color="#007bff" />
          <Text style={styles.filePickerText}>
            {file ? "Change File" : "Choose File (Image or PDF)"}
          </Text>
        </TouchableOpacity>

        {file && file.type.startsWith("image/") && (
          <Image source={{ uri: file.uri }} style={styles.preview} />
        )}

        <TouchableOpacity
          style={[styles.uploadBtn, loading && { opacity: 0.7 }]}
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={20} color="#fff" />
              <Text style={styles.uploadText}>Upload KYC</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fbff",
    paddingHorizontal: 15,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007bff",
    marginLeft: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  filePicker: {
    backgroundColor: "#e9f1ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filePickerText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#007bff",
    fontWeight: "500",
  },
  preview: {
    width: 250,
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },
  uploadBtn: {
    backgroundColor: "#007bff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 12,
  },
  uploadText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 6,
  },
});



import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Replace with your API function or inline fetch
const uploadPosterKyc = async (fileUri, docType, token) => {
  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    name: fileUri.split("/").pop(),
    type: "application/octet-stream", // generic; can adjust
  });
  formData.append("docType", docType);

  const res = await fetch(
    "http://192.168.156.218:8080/api/poster/profile/doc/upload",
    {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.json();
};

export default function PosterKycEdit({ navigation, route }) {
  const { profile } = route.params || {};

  const [fileUri, setFileUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [kycType, setKycType] = useState(profile?.kycType || "PanCard");
  const [kycStatus, setKycStatus] = useState(profile?.kycStatus || "PENDING");
  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
    });

    if (result.type === "success") {
      // New format: result.uri is directly available
      const uri = result.uri || (result.assets && result.assets[0]?.uri);

      if (!uri) {
        Alert.alert("Error", "Failed to get file URI");
        return;
      }

      setFileUri(uri);
      const fileName = uri.split("/").pop();
      Alert.alert("File Selected", fileName);
    }
  };

  const handleUpload = async () => {
    if (!fileUri) return Alert.alert("Please select a file first!");
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await uploadPosterKyc(fileUri, kycType, token);

      if (res.status === "SUCCESS") {
        Alert.alert("✅ Uploaded!", res.message || "KYC uploaded successfully");
        setFileUri(null);
        setKycStatus("PENDING"); // backend will now show pending
      } else {
        Alert.alert("❌ Failed", res.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      Alert.alert("Error", "Could not upload file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Upload KYC Document</Text>

      <Text style={{ marginBottom: 8, fontWeight: "700" }}>KYC Type:</Text>
      <Text style={styles.kycType}>{kycType}</Text>

      {fileUri && (
        <Image
          source={{ uri: fileUri }}
          style={{
            width: "100%",
            height: 200,
            marginVertical: 10,
            borderRadius: 8,
          }}
        />
      )}

      <TouchableOpacity style={styles.chooseBtn} onPress={handlePickFile}>
        <Text style={styles.chooseText}>📂 Choose File</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.uploadBtn, loading && { backgroundColor: "gray" }]}
        onPress={handleUpload}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.uploadText}>⬆️ Upload Now</Text>
        )}
      </TouchableOpacity>

      <Text style={{ marginTop: 20, fontWeight: "700" }}>
        Current KYC Status:{" "}
        <Text style={{ color: kycStatus === "VERIFIED" ? "green" : "orange" }}>
          {kycStatus}
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f7f8fc" },
  backBtn: { marginBottom: 20 },
  backText: { fontSize: 18, color: "#007bff" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  kycType: {
    backgroundColor: "#f1f3f5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  chooseBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  chooseText: { color: "#fff", fontWeight: "700" },
  uploadBtn: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  uploadText: { color: "#fff", fontWeight: "700" },
});

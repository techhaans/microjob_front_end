// PosterKycEdit.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { uploadPosterKyc } from "../api/poster";

export default function PosterKycEdit({ navigation, route }) {
  const { profile } = route.params || {};
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------- Pick File ----------------
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      // ✅ Handle both old and new DocumentPicker formats
      if (result.assets && result.assets.length > 0) {
        const pickedFile = result.assets[0];
        setFile({
          uri: pickedFile.uri,
          name: pickedFile.name || "document",
          type:
            pickedFile.mimeType ||
            (pickedFile.name?.endsWith(".pdf")
              ? "application/pdf"
              : "image/jpeg"),
        });
        Alert.alert("✅ File Selected", pickedFile.name || "Unnamed file");
      } else if (result.uri) {
        // For older SDKs
        setFile({
          uri: result.uri,
          name: result.name || "document",
          type: result.mimeType || "application/octet-stream",
        });
        Alert.alert("✅ File Selected", result.name || "Unnamed file");
      } else {
        console.log("User cancelled file picker");
      }
    } catch (err) {
      console.error("Picker error:", err);
      Alert.alert("Error", "Failed to pick file");
    }
  };

  // ---------------- Upload File ----------------
  const handleUpload = async () => {
    if (!file || !file.uri) {
      return Alert.alert("Please select a file first");
    }

    try {
      setLoading(true);
      const res = await uploadPosterKyc(file.uri, "PanCard"); // change docType if needed
      Alert.alert("✅ Success", res.message || "KYC uploaded successfully!");
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      Alert.alert(
        "❌ Upload Error",
        err.response?.data?.message || err.message || "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upload Your KYC Document</Text>

      {file?.uri && (
        <View style={{ marginBottom: 15, alignItems: "center" }}>
          {file.name?.endsWith(".pdf") ? (
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              PDF Selected: {file.name}
            </Text>
          ) : (
            <Image
              source={{ uri: file.uri }}
              style={{
                width: "100%",
                height: 200,
                borderRadius: 10,
                resizeMode: "contain",
              }}
            />
          )}
        </View>
      )}

      <TouchableOpacity style={styles.pickButton} onPress={pickFile}>
        <Text style={styles.pickButtonText}>📂 Choose File</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.uploadButton,
          { backgroundColor: loading ? "gray" : "#28a745" },
        ]}
        onPress={handleUpload}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.uploadButtonText}>⬆️ Upload Now</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f7f8fc",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#007bff",
    marginBottom: 20,
    textAlign: "center",
  },
  pickButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  pickButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  uploadButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

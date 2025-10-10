
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { uploadDoerKyc } from "../api/doer";

export default function KycUploadScreen() {
  const [fileUri, setFileUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setFileUri(uri);
      Alert.alert("File Selected", uri.split("/").pop());
    }
  };

  const handleUpload = async () => {
    if (!fileUri) return Alert.alert("Please select a file first!");
    setLoading(true);
    try {
      const res = await uploadDoerKyc(fileUri, "PanCard"); // or AadharCard, etc.
      Alert.alert("✅ Success", res.message || "Uploaded successfully!");
      setFileUri(null);
    } catch (err) {
      Alert.alert(
        "❌ Upload Failed",
        err.response?.data?.message || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Upload KYC Document
      </Text>

      {fileUri && (
        <Image
          source={{ uri: fileUri }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 10,
            marginBottom: 15,
            resizeMode: "contain",
          }}
        />
      )}

      <TouchableOpacity
        onPress={handlePickFile}
        style={{
          backgroundColor: "#007bff",
          padding: 12,
          borderRadius: 8,
          marginBottom: 10,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          📂 Choose File
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleUpload}
        disabled={loading}
        style={{
          backgroundColor: loading ? "gray" : "#28a745",
          padding: 12,
          borderRadius: 8,
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white", textAlign: "center" }}>
            ⬆️ Upload Now
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

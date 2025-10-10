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
import { useNavigation } from "@react-navigation/native";
import {
  uploadPosterKyc,
  getPosterKycHistory,
  deletePosterKyc,
} from "../api/poster";

const ALLOWED_DOC_TYPES = ["PanCard", "AadharCard", "VoterID", "Passport"];

export default function PosterKycUpload() {
  const navigation = useNavigation();
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
    Alert.alert("Delete KYC", "Are you sure you want to delete this KYC document?", [
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
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← </Text>
      </TouchableOpacity>

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
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.uploadText}>Upload</Text>
        )}
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
  backButton: {
    marginBottom: 8,
    paddingVertical: 6,
  },
  backText: {
    fontSize: 36,
    
    color: "#2196f3",
    fontWeight: "600",
  },
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

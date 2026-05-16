// corret codeeee....
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
import * as FileSystem from "expo-file-system/legacy"; // ✅ legacy import fixes errors
import * as Sharing from "expo-sharing";

import { fetchPendingKyc, approveKyc, rejectKyc } from "../api/admin";

export default function AdminKycDetail({ route, navigation }) {
  const { kycId } = route.params;
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [downloading, setDownloading] = useState(false);

  const BASE_URL = "http://192.168.1.40:8080"; // Update to HTTPS in production

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
          "This KYC request is no longer available.",
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

      const fileUrl = `${BASE_URL}/api/admin/kyc/file/${kyc.id}`;

      // Determine extension (PDF or JPG)
      const fileExt = kyc.fileType === "pdf" ? "pdf" : "jpg";
      const fileName = `KYC_${kyc.id}.${fileExt}`;
      const localUri = FileSystem.documentDirectory + fileName;

      // Download using legacy API
      const downloadResumable = FileSystem.createDownloadResumable(
        fileUrl,
        localUri,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { uri } = await downloadResumable.downloadAsync();
      console.log("File downloaded to", uri);

      // Share or alert
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Downloaded", `File saved at: ${uri}`);
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

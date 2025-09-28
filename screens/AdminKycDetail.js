import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://192.168.1.6:8080/api";

export default function AdminKycDetail({ route, navigation }) {
  const { kycId } = route.params;
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchKycDetail();
  }, []);

  const fetchKycDetail = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("adminToken");
      const res = await axios.get(`${BASE_URL}/admin/kyc/${kycId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKyc(res.data.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch KYC details");
    } finally {
      setLoading(false);
    }
  };

  const approveKyc = async () => {
    try {
      const token = await AsyncStorage.getItem("adminToken");
      await axios.post(
        `${BASE_URL}/admin/kyc/${kycId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("Success", "KYC Approved");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", "Failed to approve KYC");
    }
  };

  const rejectKyc = async () => {
    if (!rejectReason.trim()) {
      Alert.alert("Error", "Please enter a reason");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("adminToken");
      await axios.post(
        `${BASE_URL}/admin/kyc/${kycId}/reject?reason=${encodeURIComponent(
          rejectReason
        )}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("Success", "KYC Rejected");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", "Failed to reject KYC");
    }
  };

  if (loading || !kyc) {
    return (
      <ActivityIndicator size="large" style={{ flex: 1 }} color="#2196f3" />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{kyc.userName}</Text>
      <Text>Email: {kyc.userEmail}</Text>
      <Text>Phone: {kyc.userPhone}</Text>
      <Text>Document Type: {kyc.docType}</Text>
      <Text>Status: {kyc.status}</Text>

      {kyc.docUrl && (
        <TouchableOpacity onPress={() => Linking.openURL(kyc.docUrl)}>
          <Image source={{ uri: kyc.docUrl }} style={styles.docImage} />
          <Text style={styles.downloadText}>View / Download Document</Text>
        </TouchableOpacity>
      )}

      {!kyc.approved && (
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.approveBtn} onPress={approveKyc}>
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reject Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Reason for Rejection</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter reason..."
              value={rejectReason}
              onChangeText={setRejectReason}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={rejectKyc}>
                <Text style={styles.btnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f4f4" },
  name: { fontSize: 22, fontWeight: "bold" },
  docImage: {
    width: "100%",
    height: 250,
    marginVertical: 15,
    borderRadius: 10,
  },
  downloadText: { textAlign: "center", color: "#2196f3", marginBottom: 15 },
  btnRow: { flexDirection: "row", justifyContent: "space-between" },
  approveBtn: {
    flex: 1,
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
    marginRight: 5,
    alignItems: "center",
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    marginLeft: 5,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end" },
  cancelBtn: {
    backgroundColor: "gray",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  confirmBtn: { backgroundColor: "red", padding: 10, borderRadius: 8 },
});

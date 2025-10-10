import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function AdminKycCard({ kyc, onPress }) {
  const navigation = useNavigation();

  return (
    <View>
      {/* 🔙 Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* KYC Card */}
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <Text style={styles.name}>{kyc.userName}</Text>
        <Text>Phone: {kyc.userPhone}</Text>
        <Text>Document Type: {kyc.docType}</Text>
        <Text>Status: {kyc.status}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginBottom: 10,
    padding: 10,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 16,
    color: "#2196f3",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
});

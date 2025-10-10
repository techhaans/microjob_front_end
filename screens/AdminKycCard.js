import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function AdminKycCard({ kyc, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{kyc.userName}</Text>
      <Text>Phone: {kyc.userPhone}</Text>
      <Text>Document Type: {kyc.docType}</Text>
      <Text>Status: {kyc.status}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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

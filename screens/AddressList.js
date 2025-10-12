import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPosterAddresses, deleteAddress } from "../api/poster";

export default function AddressList({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await getPosterAddresses();
      if (res?.data && Array.isArray(res.data)) {
        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAddresses(sorted);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error("❌ Error fetching addresses:", error);
      Alert.alert("Error", "Failed to fetch addresses.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAddress(id);
              Alert.alert("Deleted", "Address removed successfully.");
              fetchAddresses();
            } catch (error) {
              console.error("❌ Delete error:", error);
              Alert.alert("Error", "Failed to delete address.");
            }
          },
        },
      ]
    );
  };

  const handleAdd = () => {
    navigation.navigate("AddressForm", { mode: "add" });
  };

  const handleEdit = (address) => {
    navigation.navigate("AddressForm", { mode: "edit", address });
  };

  const handleSelect = async (address) => {
    try {
      await AsyncStorage.setItem("selectedAddress", JSON.stringify(address));
      Alert.alert("Success", "Address selected!");
      navigation.goBack(); // return to dashboard
    } catch (err) {
      console.error("[Select Address Error]", err);
      Alert.alert("Error", "Failed to select address.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6EB5FF" />
        <Text style={{ color: "#ccc", marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>📍 Address List</Text>

      {addresses.length === 0 ? (
        <Text style={styles.noData}>No saved addresses found.</Text>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.addressBox}>
              <Text style={styles.label}>{item.label || "No Label"}</Text>
              <Text style={styles.text}>Area: {item.area || "-"}</Text>
              <Text style={styles.text}>PIN: {item.pinCode || "-"}</Text>
              <Text style={styles.dateText}>
                🕒 {new Date(item.createdAt).toLocaleString()}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.actionText}>Select</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.actionText}>Edit / Update</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
        <Text style={styles.addBtnText}>➕ Add New Address</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: {
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#333",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  backBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20, color: "#6EB5FF", textAlign: "center" },
  addressBox: {
    backgroundColor: "#1E1E1E",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderColor: "#333",
    borderWidth: 1,
  },
  label: { color: "#6EB5FF", fontWeight: "700", fontSize: 16 },
  text: { color: "#ddd", marginTop: 4, fontSize: 14 },
  dateText: { color: "#888", marginTop: 6, fontSize: 12 },
  noData: { color: "#aaa", textAlign: "center", marginTop: 30, fontSize: 16 },
  actions: { flexDirection: "row", marginTop: 10, justifyContent: "flex-end" },
  selectBtn: { backgroundColor: "#0b78ff", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, marginRight: 6 },
  editBtn: { backgroundColor: "#FFA500", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginRight: 6 },
  deleteBtn: { backgroundColor: "#FF4C4C", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  actionText: { color: "#fff", fontWeight: "700" },
  addBtn: { marginTop: 20, backgroundColor: "#6EB5FF", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  addBtnText: { color: "#000", fontWeight: "700", fontSize: 16 },
});

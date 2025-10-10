
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { getPosterAddresses, deleteAddress } from "../api/poster"; // ✅ Import APIs

export default function AddressList({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch all addresses
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
      Alert.alert("Error", "Failed to fetch address history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // 🔹 Delete address
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
              fetchAddresses(); // refresh list
            } catch (error) {
              console.error("❌ Delete error:", error);
              Alert.alert("Error", "Failed to delete address.");
            }
          },
        },
      ]
    );
  };

  // 🔄 Loading indicator
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
      <Text style={styles.title}>📍 Address History</Text>

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
                  style={styles.editBtn}
                  onPress={() => navigation.navigate("AddressForm", { address: item })}
                >
                  <Text style={styles.actionText}>Edit</Text>
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

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#121212" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#6EB5FF",
    textAlign: "center",
  },
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
  editBtn: {
    backgroundColor: "#FFA500",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  deleteBtn: {
    backgroundColor: "#FF4C4C",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionText: { color: "#fff", fontWeight: "700" },
  backBtn: {
    marginTop: 20,
    backgroundColor: "#6EB5FF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  backBtnText: { color: "#000", fontWeight: "700", fontSize: 16 },
});

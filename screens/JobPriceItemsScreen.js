import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  addJobPriceItem,
  getJobPriceItems,
  updateJobPriceItem,
  deleteJobPriceItem,
} from "../api/poster";

export default function JobPriceItemsScreen({ route }) {
  const { jobId } = route.params; // Pass jobId from previous screen
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [priceRupees, setPriceRupees] = useState("");

  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const res = await getJobPriceItems(jobId);
    if (res?.status === "SUCCESS") {
      setItems(res.data?.priceItems || []);
    } else {
      Alert.alert("Error", res?.message || "Failed to load price items.");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!label.trim() || !priceRupees) {
      return Alert.alert("Validation Error", "Label and price are required.");
    }

    const data = {
      label: label.trim(),
      description: description.trim(),
      priceRupees: Number(priceRupees),
    };

    let res;
    if (editingItem) {
      res = await updateJobPriceItem(jobId, editingItem.id, data);
    } else {
      res = await addJobPriceItem(jobId, data);
    }

    if (res?.status === "SUCCESS") {
      Alert.alert("✅ Success", "Item saved successfully!");
      setLabel("");
      setDescription("");
      setPriceRupees("");
      setEditingItem(null);
      loadItems();
    } else {
      Alert.alert("❌ Error", res?.message || "Failed to save item.");
    }
  };

  const handleDelete = async (itemId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: async () => {
            const res = await deleteJobPriceItem(jobId, itemId);
            if (res?.status === "SUCCESS") {
              Alert.alert("✅ Deleted", "Item removed.");
              loadItems();
            } else {
              Alert.alert("❌ Error", res?.message || "Failed to delete item.");
            }
          },
        },
      ]
    );
  };

  const handleEdit = (item) => {
    setLabel(item.label);
    setDescription(item.description);
    setPriceRupees(String(item.priceRupees));
    setEditingItem(item);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Job Price Items</Text>

      <TextInput
        style={styles.input}
        placeholder="Label (e.g., Labor, Materials)"
        value={label}
        onChangeText={setLabel}
      />
      <TextInput
        style={[styles.input, { height: 60 }]}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Price (₹)"
        keyboardType="numeric"
        value={priceRupees}
        onChangeText={setPriceRupees}
      />

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btnText}>
          {editingItem ? "Update" : "Add"} Item
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
                <Text style={styles.itemPrice}>₹ {item.priceRupees}</Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={() => handleEdit(item)}
                  style={[styles.actionBtn, { backgroundColor: "#007bff" }]}
                >
                  <Text style={{ color: "#fff" }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  style={[styles.actionBtn, { backgroundColor: "red" }]}
                >
                  <Text style={{ color: "#fff" }}>Del</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f8f9fa" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#007bff",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  btn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  item: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  itemLabel: { fontWeight: "700", fontSize: 16 },
  itemDesc: { color: "gray" },
  itemPrice: { color: "#007bff", fontWeight: "700", marginTop: 5 },
  actionBtn: {
    padding: 8,
    borderRadius: 6,
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});

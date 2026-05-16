import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  fetchJobDetails,
  updateJob,
  updatePriceItem,
  addPriceItem,
  deletePriceItem,
} from "../api/poster"; // Ensure these are exported

export default function UpdateJobScreen({ navigation, route }) {
  const { jobId } = route.params;

  const [loading, setLoading] = useState(true);
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    categoryCode: "",
    amountInRs: 0,
    addressId: null,
    deadLine: "",
    jobType: "PHYSICAL",
    priceItems: [],
  });

  const [newPriceLabel, setNewPriceLabel] = useState("");
  const [newPriceDesc, setNewPriceDesc] = useState("");
  const [newPriceAmount, setNewPriceAmount] = useState("");

  useEffect(() => {
    loadJobDetails();
  }, []);

  const loadJobDetails = async () => {
    setLoading(true);
    try {
      const res = await fetchJobDetails(jobId);
      if (res?.status === "SUCCESS") {
        setJobData({
          ...res.data,
          priceItems: res.data.priceItems || [],
        });
      }
    } catch (err) {
      console.warn("[Fetch Job Error]", err);
      Alert.alert("Error", "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Job Update ----------
  const handleUpdateJob = async () => {
    try {
      const payload = {
        title: jobData.title,
        description: jobData.description,
        categoryCode: jobData.categoryCode,
        amountInRs: jobData.amountInRs,
        addressId: jobData.addressId,
        deadLine: jobData.deadLine,
        jobType: jobData.jobType,
      };
      const res = await updateJob(jobId, payload);
      if (res?.status === "SUCCESS") {
        Alert.alert("Success", "Job updated successfully");
        navigation.goBack();
      } else {
        Alert.alert("Error", "Failed to update job");
      }
    } catch (err) {
      console.warn(err);
      Alert.alert("Error", "Something went wrong");
    }
  };

  // ---------- Price Items ----------
  const handleUpdatePriceItem = async (itemId, index) => {
    const item = jobData.priceItems[index];
    try {
      const res = await updatePriceItem(jobId, itemId, {
        label: item.label,
        description: item.description,
        priceRupees: item.priceRupees,
      });
      if (res?.status === "SUCCESS") {
        setJobData((prev) => ({
          ...prev,
          priceItems: res.data.priceItems,
        }));
        Alert.alert("Success", "Item updated successfully");
      }
    } catch (err) {
      console.warn(err);
      Alert.alert("Error", "Failed to update price item");
    }
  };

  const handleAddPriceItem = async () => {
    if (!newPriceLabel || !newPriceAmount) {
      Alert.alert("Error", "Label and Price are required");
      return;
    }
    try {
      const res = await addPriceItem(jobId, {
        label: newPriceLabel,
        description: newPriceDesc,
        priceRupees: Number(newPriceAmount),
      });
      if (res?.status === "SUCCESS") {
        setJobData((prev) => ({
          ...prev,
          priceItems: res.data.priceItems,
        }));
        setNewPriceLabel("");
        setNewPriceDesc("");
        setNewPriceAmount("");
      }
    } catch (err) {
      console.warn(err);
      Alert.alert("Error", "Failed to add price item");
    }
  };

  const handleDeletePriceItem = async (itemId) => {
    try {
      const res = await deletePriceItem(jobId, itemId);
      if (res?.status === "SUCCESS") {
        setJobData((prev) => ({
          ...prev,
          priceItems: prev.priceItems.filter((i) => i.id !== itemId),
        }));
      }
    } catch (err) {
      console.warn(err);
      Alert.alert("Error", "Failed to delete price item");
    }
  };

  // ---------- Render Price Item ----------
  const renderPriceItem = ({ item, index }) => (
    <View style={styles.priceItem}>
      <TextInput
        style={styles.priceInput}
        value={item.label}
        onChangeText={(text) =>
          setJobData((prev) => {
            const temp = [...prev.priceItems];
            temp[index].label = text;
            return { ...prev, priceItems: temp };
          })
        }
      />
      <TextInput
        style={styles.priceInput}
        value={item.description}
        onChangeText={(text) =>
          setJobData((prev) => {
            const temp = [...prev.priceItems];
            temp[index].description = text;
            return { ...prev, priceItems: temp };
          })
        }
      />
      <TextInput
        style={styles.priceInput}
        keyboardType="numeric"
        value={String(item.priceRupees)}
        onChangeText={(text) =>
          setJobData((prev) => {
            const temp = [...prev.priceItems];
            temp[index].priceRupees = Number(text);
            return { ...prev, priceItems: temp };
          })
        }
      />
      <View style={{ flexDirection: "row", marginTop: 4 }}>
        <TouchableOpacity
          style={styles.updateBtn}
          onPress={() => handleUpdatePriceItem(item.id, index)}
        >
          <Text style={{ color: "#fff" }}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeletePriceItem(item.id)}
        >
          <Text style={{ color: "#fff" }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0b78ff" />
      </View>
    );

  return (
    <FlatList
      data={jobData.priceItems}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderPriceItem}
      contentContainerStyle={{ padding: 16 }}
      ListHeaderComponent={
        <>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={jobData.title}
            onChangeText={(text) => setJobData({ ...jobData, title: text })}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={jobData.description}
            onChangeText={(text) =>
              setJobData({ ...jobData, description: text })
            }
            multiline
          />

          <Text style={[styles.label, { marginTop: 16 }]}>
            Add New Price Item
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Label"
            value={newPriceLabel}
            onChangeText={setNewPriceLabel}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={newPriceDesc}
            onChangeText={setNewPriceDesc}
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            keyboardType="numeric"
            value={newPriceAmount}
            onChangeText={setNewPriceAmount}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddPriceItem}>
            <Text style={{ color: "#fff" }}>Add Price Item</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateJob}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Save Job</Text>
          </TouchableOpacity>
        </>
      }
    />
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  label: { fontWeight: "700", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  priceItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  priceInput: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  updateBtn: {
    backgroundColor: "#0b78ff",
    padding: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteBtn: {
    backgroundColor: "#e74c3c",
    padding: 6,
    borderRadius: 6,
  },
  addBtn: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: "#0b78ff",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 40,
  },
});

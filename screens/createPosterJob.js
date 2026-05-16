import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  createPosterJob,
  fetchCategories,
  fetchPosterAddresses,
  fetchPosterProfile,
  addJobPriceItem,
} from "../api/poster";

export default function CreateJobScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [categories, setCategories] = useState([]);
  const [amountInRs, setAmountInRs] = useState(0);
  const [deadline, setDeadline] = useState(new Date());
  const [addressId, setAddressId] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [jobType, setJobType] = useState("PHYSICAL");
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Image URL (manual or gallery)
  const [photoUrl, setPhotoUrl] = useState("");

  // Price items
  const [priceItems, setPriceItems] = useState([]);
  const [label, setLabel] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [radiusInKm, setRadiusInKm] = useState("2");

  // -------------------- IMAGE PICKER --------------------
  const pickImageFromGallery = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          return Alert.alert("Permission Required", "Allow access to gallery!");
        }
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled) {
        // convert to base64 URL
        const base64Url = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setPhotoUrl(base64Url);
      }
    } catch (err) {
      console.error("Image Picker Error:", err);
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  // -------------------- INITIAL DATA --------------------
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [catRes, addrRes] = await Promise.all([
          fetchCategories(),
          fetchPosterAddresses(),
        ]);
        if (catRes?.status === "SUCCESS") setCategories(catRes.data);
        if (addrRes?.status === "SUCCESS") {
          setAddresses(addrRes.data);
          if (addrRes.data.length === 1)
            setAddressId(String(addrRes.data[0].id));
        }
      } catch (err) {
        console.error("Init fetch error:", err);
      } finally {
        setLoadingCategories(false);
        setLoadingAddresses(false);
      }
    };
    loadInitial();
  }, []);

  // -------------------- PRICE ITEMS TOTAL --------------------
  useEffect(() => {
    const total = priceItems.reduce(
      (sum, item) => sum + (item.priceRupees || 0),
      0,
    );
    setAmountInRs(total);
  }, [priceItems]);

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (selectedDate) setDeadline(selectedDate);
  };

  const handleAddOrUpdateItem = () => {
    if (!label.trim() || !price.trim())
      return Alert.alert("Error", "Enter both label and price.");
    const parsedPrice = parseInt(price, 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0)
      return Alert.alert("Error", "Enter a valid numeric price.");

    if (editingId) {
      const updated = priceItems.map((item) =>
        item.id === editingId
          ? {
              ...item,
              label: label.trim(),
              description: itemDescription,
              priceRupees: parsedPrice,
            }
          : item,
      );
      setPriceItems(updated);
      setEditingId(null);
    } else {
      setPriceItems([
        ...priceItems,
        {
          id: Date.now(),
          label: label.trim(),
          description: itemDescription,
          priceRupees: parsedPrice,
        },
      ]);
    }

    setLabel("");
    setItemDescription("");
    setPrice("");
  };

  const handleEditItem = (item) => {
    setEditingId(item.id);
    setLabel(item.label);
    setItemDescription(item.description || "");
    setPrice(String(item.priceRupees));
  };

  const handleRemoveItem = (id) => {
    Alert.alert("Confirm Delete", "Remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => setPriceItems(priceItems.filter((i) => i.id !== id)),
        style: "destructive",
      },
    ]);
  };

  // -------------------- CREATE JOB --------------------
  const handleCreateJob = async () => {
    try {
      setLoading(true);
      const profileRes = await fetchPosterProfile();
      if (!profileRes?.data?.KycStatus)
        return Alert.alert(
          "KYC Required",
          "Please complete or wait for KYC approval.",
        );

      if (!title || !description || !categoryCode)
        return Alert.alert("Error", "Please fill all required fields.");

      const payload = {
        title,
        description,
        categoryCode,
        amountInRs,
        deadline: deadline.toISOString(),
        jobType,
        addressId: jobType === "PHYSICAL" ? Number(addressId) : null,
        photoUrl: photoUrl || null, // can be base64 or normal URL
        radiusInKm: jobType === "PHYSICAL" ? Number(radiusInKm) : null,
      };

      const res = await createPosterJob(payload);
      if (res?.status === "SUCCESS") {
        const jobId = res?.data?.id || res?.data?.jobId;
        for (const item of priceItems) {
          await addJobPriceItem(jobId, {
            label: item.label,
            description: item.description || "",
            priceRupees: item.priceRupees,
          });
        }

        Alert.alert("✅ Success", "Job and items created successfully!");
        // Reset form
        setTitle("");
        setDescription("");
        setCategoryCode("");
        setAmountInRs(0);
        setDeadline(new Date());
        setAddressId("");
        setJobType("PHYSICAL");
        setPhotoUrl("");
        setRadiusInKm("2");
        setPriceItems([]);
      } else {
        Alert.alert("❌ Error", res?.message || "Failed to create job.");
      }
    } catch (err) {
      console.error("Create Job Error:", err);
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories || loadingAddresses) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create New Job</Text>

      <TextInput
        style={styles.input}
        placeholder="Job Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Description"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Select Category:</Text>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.code}
          style={[
            styles.categoryItem,
            categoryCode === String(cat.code) && { backgroundColor: "#007bff" },
          ]}
          onPress={() => setCategoryCode(String(cat.code))}
        >
          <Text
            style={{
              color: categoryCode === String(cat.code) ? "#fff" : "#000",
            }}
          >
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}

      {/* ---------------- IMAGE ---------------- */}
      <Text style={styles.label}>Job Photo:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Image URL (optional)"
        value={photoUrl}
        onChangeText={setPhotoUrl}
      />
      <TouchableOpacity style={styles.addBtn} onPress={pickImageFromGallery}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          Pick from Gallery
        </Text>
      </TouchableOpacity>
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={{ width: "100%", height: 200, marginBottom: 10 }}
        />
      ) : null}

      <TextInput
        style={[styles.input, { backgroundColor: "#e9ecef" }]}
        placeholder="Total Amount (₹)"
        value={amountInRs.toString()}
        editable={false}
      />

      {/* ---------------- PRICE ITEMS ---------------- */}
      <Text style={[styles.label, { marginTop: 20 }]}>Job Price Items:</Text>
      <View style={styles.priceBox}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Item Label"
          value={label}
          onChangeText={setLabel}
        />
        <TextInput
          style={[styles.input, { flex: 1, marginLeft: 5 }]}
          placeholder="Price ₹"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
      </View>
      <TextInput
        style={[styles.input, { marginBottom: 10 }]}
        placeholder="Description (optional)"
        value={itemDescription}
        onChangeText={setItemDescription}
      />
      <TouchableOpacity style={styles.addBtn} onPress={handleAddOrUpdateItem}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          {editingId ? "Update Item" : "Add Item"}
        </Text>
      </TouchableOpacity>

      {priceItems.length > 0 && (
        <View style={{ marginTop: 10 }}>
          {priceItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={{ flex: 1 }}>
                {item.label} - ₹{item.priceRupees}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={() => handleEditItem(item)}>
                  <Text style={{ color: "orange", marginRight: 10 }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                  <Text style={{ color: "red" }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <Text style={styles.totalText}>Total: ₹{amountInRs}</Text>
        </View>
      )}

      {/* ---------------- DEADLINE ---------------- */}
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <View pointerEvents="none">
          <TextInput
            style={styles.input}
            placeholder="Select Deadline"
            value={deadline ? deadline.toISOString().split("T")[0] : ""}
            editable={false}
          />
        </View>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={deadline}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      {/* ---------------- ADDRESS ---------------- */}
      {jobType === "PHYSICAL" && (
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.label}>Select Address:</Text>
          {addresses.map((addr) => (
            <TouchableOpacity
              key={addr.id}
              style={[
                styles.addressItem,
                addressId === String(addr.id) && { backgroundColor: "#007bff" },
              ]}
              onPress={() => setAddressId(String(addr.id))}
            >
              <Text
                style={{
                  color: addressId === String(addr.id) ? "#fff" : "#000",
                }}
              >
                {addr.label} — {addr.area} ({addr.pinCode})
              </Text>
            </TouchableOpacity>
          ))}
          <TextInput
            style={styles.input}
            placeholder="Radius in Km (default 2)"
            keyboardType="numeric"
            value={radiusInKm}
            onChangeText={setRadiusInKm}
          />
        </View>
      )}

      {/* ---------------- CREATE BUTTON ---------------- */}
      <TouchableOpacity
        style={[styles.btn, loading && { backgroundColor: "gray" }]}
        onPress={handleCreateJob}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Create Job</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f7f8fc" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#007bff",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  label: { fontWeight: "700", marginBottom: 5 },
  categoryItem: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 5,
  },
  addressItem: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 5,
  },
  priceBox: { flexDirection: "row", marginBottom: 10 },
  addBtn: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  itemRow: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#eee",
  },
  totalText: {
    fontWeight: "700",
    textAlign: "right",
    fontSize: 16,
    marginTop: 5,
  },
  btn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

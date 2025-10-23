
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
  Keyboard,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createPosterJob, fetchCategories, fetchPosterAddresses } from "../api/poster";

export default function CreateJobScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [categories, setCategories] = useState([]);
  const [amountPaise, setAmountPaise] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [addressId, setAddressId] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // ✅ Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        if (res?.status === "SUCCESS" && res.data) {
          setCategories(res.data); // array of { code, name }
        } else {
          Alert.alert("Error", res.message || "Failed to fetch categories");
        }
      } catch (err) {
        console.error("Categories Fetch Error:", err);
        Alert.alert("Error", "Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // ✅ Fetch addresses
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const res = await fetchPosterAddresses();
        if (res?.status === "SUCCESS" && res.data) {
          setAddresses(res.data);
          // Auto-select if only one address
          if (res.data.length === 1) {
            setAddressId(String(res.data[0].id));
          }
        } else {
          Alert.alert("Error", res.message || "Failed to load addresses");
        }
      } catch (err) {
        console.error("Addresses Fetch Error:", err);
        Alert.alert("Error", "Could not load addresses");
      } finally {
        setLoadingAddresses(false);
      }
    };
    loadAddresses();
  }, []);

  // ✅ Date picker handlers
  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (selectedDate) setDeadline(selectedDate);
  };

  const handleOpenPicker = () => {
    Keyboard.dismiss();
    setShowPicker(true);
  };

  // ✅ Create job
  const handleCreateJob = async () => {
    if (
      !title ||
      !description ||
      !categoryCode ||
      !amountPaise ||
      !deadline ||
      !addressId
    ) {
      return Alert.alert("Validation Error", "Please fill all fields");
    }

    try {
      setLoading(true);

      const payload = {
        title,
        description,
        categoryCode: Number(categoryCode),
        amountPaise: Number(amountPaise),
        deadline: deadline.toISOString(),
        addressId: Number(addressId),
      };

      const res = await createPosterJob(payload);

      if (res.status === "SUCCESS") {
        Alert.alert("✅ Job Created", `Job ID: ${res.data.id}`, [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);

        // Reset fields
        setTitle("");
        setDescription("");
        setCategoryCode("");
        setAmountPaise("");
        setDeadline(new Date());
        setAddressId("");
      } else {
        Alert.alert("❌ Error", res.message || "Failed to create job");
      }
    } catch (err) {
      console.error("Job Create Error:", err);
      Alert.alert("❌ Error", "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loading state
  if (loadingCategories || loadingAddresses)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading data...</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create New Job</Text>

      {/* ✅ Job Title */}
      <TextInput
        style={styles.input}
        placeholder="Job Title"
        value={title}
        onChangeText={setTitle}
      />

      {/* ✅ Description */}
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Description"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      {/* ✅ Category Selection */}
      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontWeight: "700", marginBottom: 5 }}>
          Select Category:
        </Text>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.code}
            style={[
              styles.categoryItem,
              categoryCode === String(cat.code) && {
                backgroundColor: "#007bff",
              },
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
      </View>

      {/* ✅ Amount */}
      <TextInput
        style={styles.input}
        placeholder="Amount (Paise)"
        keyboardType="numeric"
        value={amountPaise}
        onChangeText={setAmountPaise}
      />

      {/* ✅ Deadline */}
      <TouchableOpacity onPress={handleOpenPicker}>
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
          value={deadline || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      {/* ✅ Address Selection */}
      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontWeight: "700", marginBottom: 5 }}>
          Select Address:
        </Text>

        {addresses.length === 0 && (
          <Text style={{ color: "gray" }}>
            No saved addresses found. Please add one in your profile.
          </Text>
        )}

        {addresses.map((addr) => (
          <TouchableOpacity
            key={addr.id}
            style={[
              styles.addressItem,
              addressId === String(addr.id) && { backgroundColor: "#007bff" },
            ]}
            onPress={() => setAddressId(String(addr.id))}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{
                  color: addressId === String(addr.id) ? "#fff" : "#000",
                  flexShrink: 1,
                }}
              >
                {addr.label} — {addr.area} ({addr.pinCode})
              </Text>
              {addressId === String(addr.id) && (
                <Text style={{ color: "#fff", fontWeight: "bold" }}>✔</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ✅ Submit Button */}
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
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
  },
  btn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
});

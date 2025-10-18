import React, { useState } from "react";
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
  Button,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createPosterJob } from "../api/poster";

export default function CreateJobScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [amountPaise, setAmountPaise] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [addressId, setAddressId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // ✅ Date Picker handler
  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === "android") setShowPicker(false); // hide picker on Android
    if (selectedDate) setDeadline(selectedDate); // set picked date
  };

  const handleOpenPicker = () => {
    Keyboard.dismiss();
    setShowPicker(true);
  };

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
        deadline: deadline.toISOString(), // ✅ backend expects ISO format
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
      <TextInput
        style={styles.input}
        placeholder="Category Code (number)"
        keyboardType="numeric"
        value={categoryCode}
        onChangeText={setCategoryCode}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount (Paise)"
        keyboardType="numeric"
        value={amountPaise}
        onChangeText={setAmountPaise}
      />

      {/* ✅ Date Picker */}
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

      <TextInput
        style={styles.input}
        placeholder="Address ID"
        keyboardType="numeric"
        value={addressId}
        onChangeText={setAddressId}
      />

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
});

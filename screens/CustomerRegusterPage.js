import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { registerDoer } from "../api/doer";

export default function CustomerReg({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Error states for each field
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required!";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      newErrors.email = "Enter a valid email!";
    if (!/^[6-9]\d{9}$/.test(phone.trim()))
      newErrors.phone = "Enter a valid 10-digit phone!";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;

    const payload = {
      name,
      email,
      phoneNo: formattedPhone,
    };

    try {
      await registerDoer(payload);
      setLoading(false);
      navigation.navigate("LoginPage");
    } catch (err) {
      setLoading(false);

      // Always catch errors safely
      console.error("Registration Error:", err);

      if (err.response?.status === 409) {
        setErrors({ api: "User already exists!" });
      } else if (err.response?.status === 400) {
        setErrors({ api: "Invalid data. Please check the fields." });
      } else {
        // Don’t show raw 503 or server errors → friendly message
        setErrors({ api: "Server is busy. Please try again later." });
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Customer Registration</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Phone (10 digits)"
        keyboardType="phone-pad"
        value={phone}
        maxLength={10}
        onChangeText={setPhone}
      />
      {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Registering..." : "Register"}
        </Text>
      </TouchableOpacity>

      {errors.api && <Text style={styles.error}>{errors.api}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 30, backgroundColor: "#f9f9f9" },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 50 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#1877F2",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  error: { color: "red", marginBottom: 10, fontWeight: "600" },
});

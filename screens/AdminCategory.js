import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  fetchAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/admin";

export default function AdminCategory({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newSkillName, setNewSkillName] = useState("");
  const [editing, setEditing] = useState(null);

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetchAllCategories();
      const list = res?.data?.data || [];

      const data = list.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        displayName: item.displayName,
        skillName: item.skillName,
      }));

      setCategories(data);
    } catch (err) {
      console.error("Fetch categories failed:", err);
      Alert.alert("Error", "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Save or Update
  const handleSave = async () => {
    if (!newName.trim() || !newDisplayName.trim() || !newSkillName.trim()) {
      Alert.alert("Validation", "Please fill all fields.");
      return;
    }

    try {
      setSaving(true);
      if (editing?.id) {
        // Update category
        await updateCategory(editing.id, {
          name: newName,
          displayName: newDisplayName,
          skillName: newSkillName,
        });
        Alert.alert("Success", "Category updated successfully!");
      } else {
        if (!newCode.trim()) {
          Alert.alert("Validation", "Please enter a category code.");
          return;
        }
        await createCategory({
          code: newCode,
          name: newName,
          displayName: newDisplayName,
          skillName: newSkillName,
        });
        Alert.alert("Success", "Category created successfully!");
      }

      setEditing(null);
      setNewCode("");
      setNewName("");
      setNewDisplayName("");
      setNewSkillName("");
      await loadCategories();
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  // Delete category
  const handleDelete = (id) => {
    if (!id) return;

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this category?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);
              await deleteCategory(id);
              Alert.alert("Deleted", "Category removed successfully.");
              await loadCategories();
            } catch (err) {
              console.error(
                "Delete failed:",
                err.response?.data || err.message,
              );
              Alert.alert("Error", "Failed to delete category");
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  // Edit handler
  const handleEdit = (cat) => {
    setEditing(cat);
    setNewCode(cat.code);
    setNewName(cat.name);
    setNewDisplayName(cat.displayName || "");
    setNewSkillName(cat.skillName || "");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fc" }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Categories</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <TextInput
          style={[
            styles.input,
            editing ? { backgroundColor: "#eee", color: "#666" } : {},
          ]}
          placeholder="Category Code"
          value={newCode}
          onChangeText={setNewCode}
          editable={!editing}
        />
        <TextInput
          style={styles.input}
          placeholder="Category Name"
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          style={styles.input}
          placeholder="Display Name"
          value={newDisplayName}
          onChangeText={setNewDisplayName}
        />
        <TextInput
          style={styles.input}
          placeholder="Skill Name"
          value={newSkillName}
          onChangeText={setNewSkillName}
        />
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveText}>
            {editing ? "Update Category" : "Add Category"}
          </Text>
        </TouchableOpacity>

        {editing && (
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: "#777" }]}
            onPress={() => {
              setEditing(null);
              setNewCode("");
              setNewName("");
              setNewDisplayName("");
              setNewSkillName("");
            }}
          >
            <Text style={styles.saveText}>Cancel Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2196f3"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          contentContainerStyle={{ padding: 15 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>ID: {item.id}</Text>
              <Text style={styles.cardText}>Code: {item.code}</Text>
              <Text style={styles.cardText}>Name: {item.name}</Text>
              <Text style={styles.cardText}>Display: {item.displayName}</Text>
              <Text style={styles.cardText}>Skill: {item.skillName}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#2196f3" }]}
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.btnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#ff3b30" }]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#2196f3",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  backText: { color: "#fff", fontSize: 16 },
  form: {
    padding: 15,
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 10,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  saveBtn: {
    backgroundColor: "#2196f3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  saveText: { color: "#fff", fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    elevation: 2,
  },
  cardText: { fontSize: 16 },
  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  btnText: { color: "#fff", fontWeight: "600" },
});

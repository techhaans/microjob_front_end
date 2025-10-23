// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   FlatList,
// //   Alert,
// //   ActivityIndicator,
// //   StyleSheet,
// // } from "react-native";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import {
// //   fetchAllCategories,
// //   createCategory,
// //   updateCategory,
// //   deleteCategory,
// // } from "../api/admin"; // ✅ your API file

// // export default function AdminCategory({ navigation }) {
// //   const [categories, setCategories] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [newCode, setNewCode] = useState("");
// //   const [newName, setNewName] = useState("");
// //   const [editing, setEditing] = useState(null); // {id, name, code}

// //   // Load categories
// //   const loadCategories = async () => {
// //     try {
// //       setLoading(true);
// //       const res = await fetchAllCategories();
// //       setCategories(res.data?.data || []);
// //     } catch (err) {
// //       console.error("Fetch categories failed:", err);
// //       Alert.alert("Error", "Failed to load categories.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     loadCategories();
// //   }, []);

// //   // Create or update category
// //   const handleSave = async () => {
// //     if (!newCode.trim() || !newName.trim()) {
// //       Alert.alert("Validation", "Please enter both code and name");
// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       if (editing) {
// //         await updateCategory(editing.id, { name: newName });
// //         Alert.alert("Success", "Category updated successfully!");
// //       } else {
// //         await createCategory({ code: newCode, name: newName });
// //         Alert.alert("Success", "Category created successfully!");
// //       }
// //       setNewCode("");
// //       setNewName("");
// //       setEditing(null);
// //       loadCategories();
// //     } catch (err) {
// //       console.error("Save error:", err);
// //       Alert.alert("Error", "Failed to save category");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Delete category
// //   const handleDelete = (id) => {
// //     Alert.alert("Confirm Delete", "Are you sure?", [
// //       { text: "Cancel", style: "cancel" },
// //       {
// //         text: "Delete",
// //         style: "destructive",
// //         onPress: async () => {
// //           try {
// //             setLoading(true);
// //             await deleteCategory(id);
// //             Alert.alert("Deleted", "Category removed.");
// //             loadCategories();
// //           } catch (err) {
// //             console.error("Delete failed:", err);
// //             Alert.alert("Error", "Failed to delete category");
// //           } finally {
// //             setLoading(false);
// //           }
// //         },
// //       },
// //     ]);
// //   };

// //   // Edit category
// //   const handleEdit = (cat) => {
// //     setEditing(cat);
// //     setNewCode(cat.code);
// //     setNewName(cat.name);
// //   };

// //   return (
// //     <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fc" }}>
// //       <View style={styles.header}>
// //         <Text style={styles.headerTitle}>Manage Categories</Text>
// //         <TouchableOpacity onPress={() => navigation.goBack()}>
// //           <Text style={styles.backText}>← Back</Text>
// //         </TouchableOpacity>
// //       </View>

// //       <View style={styles.form}>
// //         <TextInput
// //           style={styles.input}
// //           placeholder="Category Code"
// //           value={newCode}
// //           editable={!editing} // prevent editing code
// //           onChangeText={setNewCode}
// //         />
// //         <TextInput
// //           style={styles.input}
// //           placeholder="Category Name"
// //           value={newName}
// //           onChangeText={setNewName}
// //         />
// //         <TouchableOpacity
// //           style={styles.saveBtn}
// //           onPress={handleSave}
// //           disabled={loading}
// //         >
// //           <Text style={styles.saveText}>
// //             {editing ? "Update Category" : "Add Category"}
// //           </Text>
// //         </TouchableOpacity>

// //         {editing && (
// //           <TouchableOpacity
// //             style={[styles.saveBtn, { backgroundColor: "#777" }]}
// //             onPress={() => {
// //               setEditing(null);
// //               setNewCode("");
// //               setNewName("");
// //             }}
// //           >
// //             <Text style={styles.saveText}>Cancel Edit</Text>
// //           </TouchableOpacity>
// //         )}
// //       </View>

// //       {loading ? (
// //         <ActivityIndicator
// //           size="large"
// //           color="#2196f3"
// //           style={{ marginTop: 20 }}
// //         />
// //       ) : (
// //         <FlatList
// //           data={categories}
// //           keyExtractor={(item, index) => index.toString()}
// //           contentContainerStyle={{ padding: 15 }}
// //           renderItem={({ item }) => (
// //             <View style={styles.card}>
// //               <Text style={styles.cardText}>Code: {item.code}</Text>
// //               <Text style={styles.cardText}>Name: {item.name}</Text>
// //               <View style={styles.actions}>
// //                 <TouchableOpacity
// //                   style={[styles.btn, { backgroundColor: "#2196f3" }]}
// //                   onPress={() => handleEdit(item)}
// //                 >
// //                   <Text style={styles.btnText}>Edit</Text>
// //                 </TouchableOpacity>
// //                 <TouchableOpacity
// //                   style={[styles.btn, { backgroundColor: "#ff3b30" }]}
// //                   onPress={() => handleDelete(item.id)}
// //                 >
// //                   <Text style={styles.btnText}>Delete</Text>
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //           )}
// //         />
// //       )}
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   header: {
// //     backgroundColor: "#2196f3",
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     padding: 15,
// //   },
// //   headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
// //   backText: { color: "#fff", fontSize: 16 },
// //   form: {
// //     padding: 15,
// //     backgroundColor: "#fff",
// //     margin: 10,
// //     borderRadius: 10,
// //     elevation: 2,
// //   },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //     borderRadius: 8,
// //     padding: 10,
// //     marginVertical: 5,
// //   },
// //   saveBtn: {
// //     backgroundColor: "#2196f3",
// //     padding: 12,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginVertical: 5,
// //   },
// //   saveText: { color: "#fff", fontWeight: "700" },
// //   card: {
// //     backgroundColor: "#fff",
// //     borderRadius: 10,
// //     padding: 15,
// //     marginVertical: 8,
// //     elevation: 2,
// //   },
// //   cardText: { fontSize: 16 },
// //   actions: {
// //     flexDirection: "row",
// //     justifyContent: "flex-end",
// //     marginTop: 10,
// //   },
// //   btn: {
// //     paddingVertical: 6,
// //     paddingHorizontal: 12,
// //     borderRadius: 6,
// //     marginLeft: 10,
// //   },
// //   btnText: { color: "#fff", fontWeight: "600" },
// // });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   fetchAllCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from "../api/admin"; // ✅ Ensure correct endpoints

// export default function AdminCategory({ navigation }) {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newCode, setNewCode] = useState("");
//   const [newName, setNewName] = useState("");
//   const [editing, setEditing] = useState(null); // {code, name}

//   // 🔄 Load categories
//   const loadCategories = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchAllCategories();
//       const data = res.data?.data || [];
//       setCategories(data);
//     } catch (err) {
//       console.error("Fetch categories failed:", err);
//       Alert.alert("Error", "Failed to load categories.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   // 💾 Create or Update
//   const handleSave = async () => {
//     if (!newCode.trim() || !newName.trim()) {
//       Alert.alert("Validation", "Please enter both code and name");
//       return;
//     }

//     try {
//       setLoading(true);
//       if (editing) {
//         // 🔁 Update existing
//         await updateCategory(editing.code, { name: newName });
//         Alert.alert("Success", "Category updated successfully!");
//       } else {
//         // ➕ Create new
//         await createCategory({ code: newCode, name: newName });
//         Alert.alert("Success", "Category created successfully!");
//       }

//       // Reset inputs and reload data
//       setNewCode("");
//       setNewName("");
//       setEditing(null);
//       await loadCategories();
//     } catch (err) {
//       console.error("Save error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to save category");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ❌ Delete
//   const handleDelete = (code) => {
//     Alert.alert("Confirm Delete", "Are you sure?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             setLoading(true);
//             await deleteCategory(code);
//             Alert.alert("Deleted", "Category removed.");
//             await loadCategories(); // 🔄 auto-refresh after delete
//           } catch (err) {
//             console.error("Delete failed:", err.response?.data || err.message);
//             Alert.alert("Error", "Failed to delete category");
//           } finally {
//             setLoading(false);
//           }
//         },
//       },
//     ]);
//   };

//   // ✏️ Edit
//   const handleEdit = (cat) => {
//     setEditing(cat);
//     setNewCode(cat.code);
//     setNewName(cat.name);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fc" }}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Manage Categories</Text>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>
//       </View>

//       {/* 🔹 Form */}
//       <View style={styles.form}>
//         <TextInput
//           style={styles.input}
//           placeholder="Category Code"
//           value={newCode}
//           editable={!editing} // prevent editing code
//           onChangeText={setNewCode}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Category Name"
//           value={newName}
//           onChangeText={setNewName}
//         />

//         <TouchableOpacity
//           style={styles.saveBtn}
//           onPress={handleSave}
//           disabled={loading}
//         >
//           <Text style={styles.saveText}>
//             {editing ? "Update Category" : "Add Category"}
//           </Text>
//         </TouchableOpacity>

//         {editing && (
//           <TouchableOpacity
//             style={[styles.saveBtn, { backgroundColor: "#777" }]}
//             onPress={() => {
//               setEditing(null);
//               setNewCode("");
//               setNewName("");
//             }}
//           >
//             <Text style={styles.saveText}>Cancel Edit</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* 🔹 List */}
//       {loading ? (
//         <ActivityIndicator
//           size="large"
//           color="#2196f3"
//           style={{ marginTop: 20 }}
//         />
//       ) : (
//         <FlatList
//           data={categories}
//           keyExtractor={(item, index) => item.code || index.toString()}
//           contentContainerStyle={{ padding: 15 }}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.cardText}>Code: {item.code}</Text>
//               <Text style={styles.cardText}>Name: {item.name}</Text>
//               <View style={styles.actions}>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#2196f3" }]}
//                   onPress={() => handleEdit(item)}
//                 >
//                   <Text style={styles.btnText}>Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#ff3b30" }]}
//                   onPress={() => handleDelete(item.code)}
//                 >
//                   <Text style={styles.btnText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: "#2196f3",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 15,
//   },
//   headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
//   backText: { color: "#fff", fontSize: 16 },
//   form: {
//     padding: 15,
//     backgroundColor: "#fff",
//     margin: 10,
//     borderRadius: 10,
//     elevation: 2,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 5,
//   },
//   saveBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 5,
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 8,
//     elevation: 2,
//   },
//   cardText: { fontSize: 16 },
//   actions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginTop: 10,
//   },
//   btn: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginLeft: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "600" },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   fetchAllCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from "../api/admin";

// export default function AdminCategory({ navigation }) {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newCode, setNewCode] = useState("");
//   const [newName, setNewName] = useState("");
//   const [editing, setEditing] = useState(null); // { id, code, name }

//   // 🔄 Load all categories
//   const loadCategories = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchAllCategories();
//       const data = res.data?.data || [];
//       setCategories(data);
//     } catch (err) {
//       console.error("Fetch categories failed:", err);
//       Alert.alert("Error", "Failed to load categories.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   // 💾 Create or Update
//   const handleSave = async () => {
//     if (!newCode.trim() || !newName.trim()) {
//       Alert.alert("Validation", "Please enter both code and name");
//       return;
//     }

//     try {
//       setLoading(true);
//       if (editing) {
//         // 🔁 Update existing (use id!)
//         await updateCategory(editing.id, { name: newName });
//         Alert.alert("Success", "Category updated successfully!");
//       } else {
//         // ➕ Create new
//         await createCategory({ code: newCode, name: newName });
//         Alert.alert("Success", "Category created successfully!");
//       }

//       setNewCode("");
//       setNewName("");
//       setEditing(null);
//       await loadCategories();
//     } catch (err) {
//       console.error("Save error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to save category");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ❌ Delete by ID
//   const handleDelete = (id) => {
//     Alert.alert(
//       "Confirm Delete",
//       "Are you sure you want to delete this category?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               setLoading(true);
//               await deleteCategory(id); // ✅ Use id
//               Alert.alert("Deleted", "Category removed successfully.");
//               await loadCategories();
//             } catch (err) {
//               console.error(
//                 "Delete failed:",
//                 err.response?.data || err.message
//               );
//               Alert.alert("Error", "Failed to delete category");
//             } finally {
//               setLoading(false);
//             }
//           },
//         },
//       ]
//     );
//   };

//   // ✏️ Edit mode
//   const handleEdit = (cat) => {
//     setEditing(cat);
//     setNewCode(cat.code);
//     setNewName(cat.name);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fc" }}>
//       {/* 🔹 Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Manage Categories</Text>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>
//       </View>

//       {/* 🔹 Form */}
//       <View style={styles.form}>
//         <TextInput
//           style={styles.input}
//           placeholder="Category Code"
//           value={newCode}
//           editable={!editing} // prevent editing code when updating
//           onChangeText={setNewCode}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Category Name"
//           value={newName}
//           onChangeText={setNewName}
//         />

//         <TouchableOpacity
//           style={styles.saveBtn}
//           onPress={handleSave}
//           disabled={loading}
//         >
//           <Text style={styles.saveText}>
//             {editing ? "Update Category" : "Add Category"}
//           </Text>
//         </TouchableOpacity>

//         {editing && (
//           <TouchableOpacity
//             style={[styles.saveBtn, { backgroundColor: "#777" }]}
//             onPress={() => {
//               setEditing(null);
//               setNewCode("");
//               setNewName("");
//             }}
//           >
//             <Text style={styles.saveText}>Cancel Edit</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* 🔹 List */}
//       {loading ? (
//         <ActivityIndicator
//           size="large"
//           color="#2196f3"
//           style={{ marginTop: 20 }}
//         />
//       ) : (
//         <FlatList
//           data={categories}
//           keyExtractor={(item, index) =>
//             item.id?.toString() || index.toString()
//           }
//           contentContainerStyle={{ padding: 15 }}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.cardText}>Code: {item.code}</Text>
//               <Text style={styles.cardText}>Name: {item.name}</Text>
//               <View style={styles.actions}>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#2196f3" }]}
//                   onPress={() => handleEdit(item)}
//                 >
//                   <Text style={styles.btnText}>Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#ff3b30" }]}
//                   onPress={() => handleDelete(item.id)} // ✅ Use id here
//                 >
//                   <Text style={styles.btnText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: "#2196f3",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 15,
//   },
//   headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
//   backText: { color: "#fff", fontSize: 16 },
//   form: {
//     padding: 15,
//     backgroundColor: "#fff",
//     margin: 10,
//     borderRadius: 10,
//     elevation: 2,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 5,
//   },
//   saveBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 5,
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 8,
//     elevation: 2,
//   },
//   cardText: { fontSize: 16 },
//   actions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginTop: 10,
//   },
//   btn: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginLeft: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "600" },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   fetchAllCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from "../api/admin"; // ✅ correct API imports

// export default function AdminCategory({ navigation }) {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newCode, setNewCode] = useState("");
//   const [newName, setNewName] = useState("");
//   const [editing, setEditing] = useState(null); // stores category object

//   // 🔄 Fetch categories
//   const loadCategories = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchAllCategories();
//       const data = res.data?.data || [];
//       setCategories(data);
//     } catch (err) {
//       console.error("Fetch categories failed:", err);
//       Alert.alert("Error", "Failed to load categories.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   // 💾 Create or Update category
//   const handleSave = async () => {
//     if (!newCode.trim() || !newName.trim()) {
//       Alert.alert("Validation", "Please enter both code and name");
//       return;
//     }

//     try {
//       setLoading(true);
//       if (editing) {
//         // 🔁 Update by ID (primary key)
//         await updateCategory(editing.id, { name: newName });
//         Alert.alert("Success", "Category updated successfully!");
//       } else {
//         // ➕ Create new category
//         await createCategory({ code: newCode, name: newName });
//         Alert.alert("Success", "Category created successfully!");
//       }

//       // Reset fields and reload
//       setNewCode("");
//       setNewName("");
//       setEditing(null);
//       await loadCategories();
//     } catch (err) {
//       console.error("Save error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to save category");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ❌ Delete category by ID
//   const handleDelete = (id) => {
//     Alert.alert("Confirm Delete", "Are you sure?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             setLoading(true);
//             await deleteCategory(id);
//             Alert.alert("Deleted", "Category removed.");
//             await loadCategories();
//           } catch (err) {
//             console.error("Delete failed:", err.response?.data || err.message);
//             Alert.alert("Error", "Failed to delete category");
//           } finally {
//             setLoading(false);
//           }
//         },
//       },
//     ]);
//   };

//   // ✏️ Edit category
//   const handleEdit = (cat) => {
//     setEditing(cat);
//     setNewCode(cat.code);
//     setNewName(cat.name);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fc" }}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Manage Categories</Text>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>
//       </View>

//       {/* 🔹 Form */}
//       <View style={styles.form}>
//         <TextInput
//           style={styles.input}
//           placeholder="Category Code"
//           value={newCode}
//           editable={!editing} // prevent code change while editing
//           onChangeText={setNewCode}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Category Name"
//           value={newName}
//           onChangeText={setNewName}
//         />

//         <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
//           <Text style={styles.saveText}>
//             {editing ? "Update Category" : "Add Category"}
//           </Text>
//         </TouchableOpacity>

//         {editing && (
//           <TouchableOpacity
//             style={[styles.saveBtn, { backgroundColor: "#777" }]}
//             onPress={() => {
//               setEditing(null);
//               setNewCode("");
//               setNewName("");
//             }}
//           >
//             <Text style={styles.saveText}>Cancel Edit</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* 🔹 List */}
//       {loading ? (
//         <ActivityIndicator
//           size="large"
//           color="#2196f3"
//           style={{ marginTop: 20 }}
//         />
//       ) : (
//         <FlatList
//           data={categories}
//           keyExtractor={(item, index) =>
//             item.id ? item.id.toString() : index.toString()
//           }
//           contentContainerStyle={{ padding: 15 }}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.cardText}>ID: {item.id}</Text>
//               <Text style={styles.cardText}>Code: {item.code}</Text>
//               <Text style={styles.cardText}>Name: {item.name}</Text>

//               <View style={styles.actions}>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#2196f3" }]}
//                   onPress={() => handleEdit(item)}
//                 >
//                   <Text style={styles.btnText}>Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#ff3b30" }]}
//                   onPress={() => handleDelete(item.id)}
//                 >
//                   <Text style={styles.btnText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: "#2196f3",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 15,
//   },
//   headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
//   backText: { color: "#fff", fontSize: 16 },
//   form: {
//     padding: 15,
//     backgroundColor: "#fff",
//     margin: 10,
//     borderRadius: 10,
//     elevation: 2,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 5,
//   },
//   saveBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 5,
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 8,
//     elevation: 2,
//   },
//   cardText: { fontSize: 16 },
//   actions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginTop: 10,
//   },
//   btn: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginLeft: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "600" },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   fetchAllCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from "../api/admin";

// export default function AdminCategory({ navigation }) {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newCode, setNewCode] = useState("");
//   const [newName, setNewName] = useState("");
//   const [editing, setEditing] = useState(null); // store category object

//   // 🔄 Fetch categories safely
//   const loadCategories = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchAllCategories();
//       const data = (res.data?.data || []).map((item, index) => ({
//         id: item.id ?? index, // fallback if id missing
//         code: item.code,
//         name: item.name,
//       }));
//       setCategories(data);
//     } catch (err) {
//       console.error("Fetch categories failed:", err);
//       Alert.alert("Error", "Failed to load categories.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   // 💾 Save (Create or Update)
//   const handleSave = async () => {
//     if (!newCode.trim() || !newName.trim()) {
//       Alert.alert("Validation", "Please enter both code and name");
//       return;
//     }

//     try {
//       setLoading(true);
//       if (editing) {
//         await updateCategory(editing.id, { name: newName });
//         Alert.alert("Success", "Category updated successfully!");
//       } else {
//         await createCategory({ code: newCode, name: newName });
//         Alert.alert("Success", "Category created successfully!");
//       }
//       setNewCode("");
//       setNewName("");
//       setEditing(null);
//       await loadCategories(); // auto-refresh
//     } catch (err) {
//       console.error("Save error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to save category");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ❌ Delete safely
//   const handleDelete = (id) => {
//     Alert.alert("Confirm Delete", "Are you sure?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             setLoading(true);
//             await deleteCategory(id);
//             Alert.alert("Deleted", "Category removed.");
//             await loadCategories(); // auto-refresh
//           } catch (err) {
//             console.error("Delete failed:", err.response?.data || err.message);
//             Alert.alert("Error", "Failed to delete category");
//           } finally {
//             setLoading(false);
//           }
//         },
//       },
//     ]);
//   };

//   // ✏️ Edit
//   const handleEdit = (cat) => {
//     setEditing(cat);
//     setNewCode(cat.code);
//     setNewName(cat.name);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fc" }}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Manage Categories</Text>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Form */}
//       <View style={styles.form}>
//         <TextInput
//           style={styles.input}
//           placeholder="Category Code"
//           value={newCode}
//           editable={!editing}
//           onChangeText={setNewCode}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Category Name"
//           value={newName}
//           onChangeText={setNewName}
//         />
//         <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
//           <Text style={styles.saveText}>
//             {editing ? "Update Category" : "Add Category"}
//           </Text>
//         </TouchableOpacity>
//         {editing && (
//           <TouchableOpacity
//             style={[styles.saveBtn, { backgroundColor: "#777" }]}
//             onPress={() => {
//               setEditing(null);
//               setNewCode("");
//               setNewName("");
//             }}
//           >
//             <Text style={styles.saveText}>Cancel Edit</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* List */}
//       {loading ? (
//         <ActivityIndicator
//           size="large"
//           color="#2196f3"
//           style={{ marginTop: 20 }}
//         />
//       ) : (
//         <FlatList
//           data={categories}
//           keyExtractor={(item, index) =>
//             item.id ? item.id.toString() : index.toString()
//           }
//           contentContainerStyle={{ padding: 15 }}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.cardText}>ID: {item.id}</Text>
//               <Text style={styles.cardText}>Code: {item.code}</Text>
//               <Text style={styles.cardText}>Name: {item.name}</Text>
//               <View style={styles.actions}>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#2196f3" }]}
//                   onPress={() => handleEdit(item)}
//                 >
//                   <Text style={styles.btnText}>Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#ff3b30" }]}
//                   onPress={() => handleDelete(item.id)}
//                 >
//                   <Text style={styles.btnText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: "#2196f3",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 15,
//   },
//   headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
//   backText: { color: "#fff", fontSize: 16 },
//   form: {
//     padding: 15,
//     backgroundColor: "#fff",
//     margin: 10,
//     borderRadius: 10,
//     elevation: 2,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 5,
//   },
//   saveBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 5,
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 8,
//     elevation: 2,
//   },
//   cardText: { fontSize: 16 },
//   actions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginTop: 10,
//   },
//   btn: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginLeft: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "600" },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   fetchAllCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from "../api/admin";

// export default function AdminCategory({ navigation }) {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newCode, setNewCode] = useState("");
//   const [newName, setNewName] = useState("");
//   const [editing, setEditing] = useState(null); // store category object

//   // 🔄 Fetch categories safely
//   const loadCategories = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchAllCategories();
//       const data = (res.data?.data || []).map((item, index) => ({
//         id: item.id ?? index, // fallback if id missing
//         code: item.code,
//         name: item.name,
//       }));
//       setCategories(data);
//     } catch (err) {
//       console.error("Fetch categories failed:", err);
//       Alert.alert("Error", "Failed to load categories.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   // 💾 Save (Create or Update)
//   const handleSave = async () => {
//     if (!newCode.trim() || !newName.trim()) {
//       Alert.alert("Validation", "Please enter both code and name");
//       return;
//     }

//     try {
//       setLoading(true);
//       if (editing) {
//         await updateCategory(editing.id, { name: newName });
//         Alert.alert("Success", "Category updated successfully!");
//       } else {
//         await createCategory({ code: newCode, name: newName });
//         Alert.alert("Success", "Category created successfully!");
//       }
//       setNewCode("");
//       setNewName("");
//       setEditing(null);
//       await loadCategories(); // auto-refresh
//     } catch (err) {
//       console.error("Save error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to save category");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ❌ Delete safely
//   const handleDelete = (id) => {
//     Alert.alert("Confirm Delete", "Are you sure?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             setLoading(true);
//             await deleteCategory(id);
//             Alert.alert("Deleted", "Category removed.");
//             await loadCategories(); // auto-refresh
//           } catch (err) {
//             console.error("Delete failed:", err.response?.data || err.message);
//             Alert.alert("Error", "Failed to delete category");
//           } finally {
//             setLoading(false);
//           }
//         },
//       },
//     ]);
//   };

//   // ✏️ Edit
//   const handleEdit = (cat) => {
//     setEditing(cat);
//     setNewCode(cat.code);
//     setNewName(cat.name);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fc" }}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Manage Categories</Text>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Form */}
//       <View style={styles.form}>
//         <TextInput
//           style={styles.input}
//           placeholder="Category Code"
//           value={newCode}
//           editable={!editing}
//           onChangeText={setNewCode}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Category Name"
//           value={newName}
//           onChangeText={setNewName}
//         />
//         <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
//           <Text style={styles.saveText}>
//             {editing ? "Update Category" : "Add Category"}
//           </Text>
//         </TouchableOpacity>
//         {editing && (
//           <TouchableOpacity
//             style={[styles.saveBtn, { backgroundColor: "#777" }]}
//             onPress={() => {
//               setEditing(null);
//               setNewCode("");
//               setNewName("");
//             }}
//           >
//             <Text style={styles.saveText}>Cancel Edit</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* List */}
//       {loading ? (
//         <ActivityIndicator
//           size="large"
//           color="#2196f3"
//           style={{ marginTop: 20 }}
//         />
//       ) : (
//         <FlatList
//           data={categories}
//           keyExtractor={(item, index) =>
//             item.id ? item.id.toString() : index.toString()
//           }
//           contentContainerStyle={{ padding: 15 }}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.cardText}>ID: {item.id}</Text>
//               <Text style={styles.cardText}>Code: {item.code}</Text>
//               <Text style={styles.cardText}>Name: {item.name}</Text>
//               <View style={styles.actions}>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#2196f3" }]}
//                   onPress={() => handleEdit(item)}
//                 >
//                   <Text style={styles.btnText}>Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#ff3b30" }]}
//                   onPress={() => handleDelete(item.id)}
//                 >
//                   <Text style={styles.btnText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: "#2196f3",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 15,
//   },
//   headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
//   backText: { color: "#fff", fontSize: 16 },
//   form: {
//     padding: 15,
//     backgroundColor: "#fff",
//     margin: 10,
//     borderRadius: 10,
//     elevation: 2,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 5,
//   },
//   saveBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 5,
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 8,
//     elevation: 2,
//   },
//   cardText: { fontSize: 16 },
//   actions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginTop: 10,
//   },
//   btn: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginLeft: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "600" },
// });

// // corret codde
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   fetchAllCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from "../api/admin";

// export default function AdminCategory({ navigation }) {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newCode, setNewCode] = useState("");
//   const [newName, setNewName] = useState("");
//   const [editing, setEditing] = useState(null); // store category object

//   // 🔄 Fetch categories
//   const loadCategories = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchAllCategories();
//       const data = res.data?.data || [];
//       setCategories(data);
//     } catch (err) {
//       console.error("Fetch categories failed:", err);
//       Alert.alert("Error", "Failed to load categories.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   // 💾 Save (Create or Update)
//   const handleSave = async () => {
//     if (!newCode.trim() || !newName.trim()) {
//       Alert.alert("Validation", "Please enter both code and name");
//       return;
//     }

//     try {
//       setLoading(true);
//       if (editing) {
//         await updateCategory(editing.code, { name: newName });
//         Alert.alert("Success", "Category updated successfully!");
//       } else {
//         await createCategory({ code: newCode, name: newName });
//         Alert.alert("Success", "Category created successfully!");
//       }
//       setNewCode("");
//       setNewName("");
//       setEditing(null);
//       await loadCategories();
//     } catch (err) {
//       console.error("Save error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to save category");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ❌ Delete
//   const handleDelete = (code) => {
//     Alert.alert("Confirm Delete", "Are you sure?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             setLoading(true);
//             await deleteCategory(code);
//             Alert.alert("Deleted", "Category removed.");
//             await loadCategories();
//           } catch (err) {
//             console.error("Delete failed:", err.response?.data || err.message);
//             Alert.alert("Error", "Failed to delete category");
//           } finally {
//             setLoading(false);
//           }
//         },
//       },
//     ]);
//   };

//   // ✏️ Edit
//   const handleEdit = (cat) => {
//     setEditing(cat);
//     setNewCode(cat.code);
//     setNewName(cat.name);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fc" }}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Manage Categories</Text>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Form */}
//       <View style={styles.form}>
//         <TextInput
//           style={styles.input}
//           placeholder="Category Code"
//           value={newCode}
//           editable={!editing} // cannot edit code when editing
//           onChangeText={setNewCode}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Category Name"
//           value={newName}
//           onChangeText={setNewName}
//         />
//         <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
//           <Text style={styles.saveText}>
//             {editing ? "Update Category" : "Add Category"}
//           </Text>
//         </TouchableOpacity>
//         {editing && (
//           <TouchableOpacity
//             style={[styles.saveBtn, { backgroundColor: "#777" }]}
//             onPress={() => {
//               setEditing(null);
//               setNewCode("");
//               setNewName("");
//             }}
//           >
//             <Text style={styles.saveText}>Cancel Edit</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* List */}
//       {loading ? (
//         <ActivityIndicator
//           size="large"
//           color="#2196f3"
//           style={{ marginTop: 20 }}
//         />
//       ) : (
//         <FlatList
//           data={categories}
//           keyExtractor={(item) => item.code} // use code as unique key
//           contentContainerStyle={{ padding: 15 }}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.cardText}>Code: {item.code}</Text>
//               <Text style={styles.cardText}>Name: {item.name}</Text>
//               <View style={styles.actions}>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#2196f3" }]}
//                   onPress={() => handleEdit(item)}
//                 >
//                   <Text style={styles.btnText}>Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#ff3b30" }]}
//                   onPress={() => handleDelete(item.code)} // use code
//                 >
//                   <Text style={styles.btnText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: "#2196f3",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 15,
//   },
//   headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
//   backText: { color: "#fff", fontSize: 16 },
//   form: {
//     padding: 15,
//     backgroundColor: "#fff",
//     margin: 10,
//     borderRadius: 10,
//     elevation: 2,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 5,
//   },
//   saveBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 5,
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 8,
//     elevation: 2,
//   },
//   cardText: { fontSize: 16 },
//   actions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginTop: 10,
//   },
//   btn: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginLeft: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "600" },
// });
// // corret codde

// corret codde

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   fetchAllCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from "../api/admin"; // make sure these API helpers use 'id'

// export default function AdminCategory({ navigation }) {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newCode, setNewCode] = useState("");
//   const [newName, setNewName] = useState("");
//   const [editing, setEditing] = useState(null); // store category object
//   const loadCategories = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchAllCategories();
//       const data = (res.data?.data || []).map((item, index) => ({
//         id: item.id ?? index, // fallback to index if id missing
//         code: item.code,
//         name: item.name,
//       }));
//       setCategories(data);
//     } catch (err) {
//       console.error("Fetch categories failed:", err);
//       Alert.alert("Error", "Failed to load categories.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   // 💾 Save (Create or Update)
//   const handleSave = async () => {
//     if (!newCode.trim() || !newName.trim()) {
//       Alert.alert("Validation", "Please enter both code and name");
//       return;
//     }

//     try {
//       setLoading(true);
//       if (editing) {
//         // Update using primary key 'id'
//         await updateCategory(editing.id, { name: newName });
//         Alert.alert("Success", "Category updated successfully!");
//       } else {
//         await createCategory({ code: newCode, name: newName });
//         Alert.alert("Success", "Category created successfully!");
//       }
//       setNewCode("");
//       setNewName("");
//       setEditing(null);
//       await loadCategories();
//     } catch (err) {
//       console.error("Save error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to save category");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ❌ Delete
//   const handleDelete = (id) => {
//     Alert.alert("Confirm Delete", "Are you sure?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             setLoading(true);
//             await deleteCategory(id); // use primary key
//             Alert.alert("Deleted", "Category removed.");
//             await loadCategories();
//           } catch (err) {
//             console.error("Delete failed:", err.response?.data || err.message);
//             Alert.alert("Error", "Failed to delete category");
//           } finally {
//             setLoading(false);
//           }
//         },
//       },
//     ]);
//   };

//   // ✏️ Edit
//   const handleEdit = (cat) => {
//     setEditing(cat);
//     setNewCode(cat.code); // keep code for display
//     setNewName(cat.name);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fc" }}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Manage Categories</Text>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Form */}
//       <View style={styles.form}>
//         <TextInput
//           style={styles.input}
//           placeholder="Category Code"
//           value={newCode}
//           editable={!editing} // cannot edit code when editing
//           onChangeText={setNewCode}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Category Name"
//           value={newName}
//           onChangeText={setNewName}
//         />
//         <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
//           <Text style={styles.saveText}>
//             {editing ? "Update Category" : "Add Category"}
//           </Text>
//         </TouchableOpacity>
//         {editing && (
//           <TouchableOpacity
//             style={[styles.saveBtn, { backgroundColor: "#777" }]}
//             onPress={() => {
//               setEditing(null);
//               setNewCode("");
//               setNewName("");
//             }}
//           >
//             <Text style={styles.saveText}>Cancel Edit</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* List */}
//       {loading ? (
//         <ActivityIndicator
//           size="large"
//           color="#2196f3"
//           style={{ marginTop: 20 }}
//         />
//       ) : (
//         <FlatList
//           data={categories}
//           keyExtractor={(item) => item.id.toString()} // use primary key
//           contentContainerStyle={{ padding: 15 }}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.cardText}>ID: {item.id}</Text>
//               <Text style={styles.cardText}>Code: {item.code}</Text>
//               <Text style={styles.cardText}>Name: {item.name}</Text>
//               <View style={styles.actions}>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#2196f3" }]}
//                   onPress={() => handleEdit(item)}
//                 >
//                   <Text style={styles.btnText}>Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#ff3b30" }]}
//                   onPress={() => handleDelete(item.id)} // delete using primary key
//                 >
//                   <Text style={styles.btnText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: "#2196f3",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 15,
//   },
//   headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
//   backText: { color: "#fff", fontSize: 16 },
//   form: {
//     padding: 15,
//     backgroundColor: "#fff",
//     margin: 10,
//     borderRadius: 10,
//     elevation: 2,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 5,
//   },
//   saveBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 5,
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 8,
//     elevation: 2,
//   },
//   cardText: { fontSize: 16 },
//   actions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginTop: 10,
//   },
//   btn: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginLeft: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "600" },
// });

//2 corret code

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   fetchAllCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from "../api/admin"; // ensure these APIs use 'id'

// export default function AdminCategory({ navigation }) {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newCode, setNewCode] = useState("");
//   const [newName, setNewName] = useState("");
//   const [editing, setEditing] = useState(null); // stores the editing category object

//   // 🔄 Fetch categories safely
//   const loadCategories = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchAllCategories();
//       // map and ensure every item has an 'id'
//       const data = (res.data?.data || []).map((item, index) => ({
//         id: item.id ?? index, // fallback if id missing
//         code: item.code,
//         name: item.name,
//       }));
//       setCategories(data);
//     } catch (err) {
//       console.error("Fetch categories failed:", err);
//       Alert.alert("Error", "Failed to load categories.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   // 💾 Create or Update category
//   const handleSave = async () => {
//     const trimmedCode = newCode.trim();
//     const trimmedName = newName.trim();

//     if (!trimmedCode || !trimmedName) {
//       Alert.alert("Validation", "Please enter both code and name");
//       return;
//     }

//     try {
//       setLoading(true);
//       if (editing) {
//         // 🔁 Update category using primary key
//         await updateCategory(editing.id, { name: trimmedName });
//         Alert.alert("Success", "Category updated successfully!");
//       } else {
//         // ➕ Create new category
//         await createCategory({ code: trimmedCode, name: trimmedName });
//         Alert.alert("Success", "Category created successfully!");
//       }

//       setNewCode("");
//       setNewName("");
//       setEditing(null);
//       await loadCategories(); // refresh list
//     } catch (err) {
//       console.error("Save error:", err.response?.data || err.message || err);
//       Alert.alert("Error", "Failed to save category");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ❌ Delete category safely
//   const handleDelete = (id) => {
//     if (!id) {
//       Alert.alert("Error", "Invalid category ID");
//       return;
//     }

//     Alert.alert("Confirm Delete", "Are you sure?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             setLoading(true);
//             await deleteCategory(id);
//             Alert.alert("Deleted", "Category removed.");
//             await loadCategories();
//           } catch (err) {
//             console.error(
//               "Delete failed:",
//               err.response?.data || err.message || err
//             );
//             Alert.alert("Error", "Failed to delete category");
//           } finally {
//             setLoading(false);
//           }
//         },
//       },
//     ]);
//   };

//   // ✏️ Edit category
//   const handleEdit = (cat) => {
//     if (!cat?.id) return; // safety check
//     setEditing(cat);
//     setNewCode(cat.code); // show code but disable editing
//     setNewName(cat.name);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fc" }}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Manage Categories</Text>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Form */}
//       <View style={styles.form}>
//         <TextInput
//           style={styles.input}
//           placeholder="Category Code"
//           value={newCode}
//           editable={!editing} // cannot edit code when updating
//           onChangeText={setNewCode}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Category Name"
//           value={newName}
//           onChangeText={setNewName}
//         />
//         <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
//           <Text style={styles.saveText}>
//             {editing ? "Update Category" : "Add Category"}
//           </Text>
//         </TouchableOpacity>
//         {editing && (
//           <TouchableOpacity
//             style={[styles.saveBtn, { backgroundColor: "#777" }]}
//             onPress={() => {
//               setEditing(null);
//               setNewCode("");
//               setNewName("");
//             }}
//           >
//             <Text style={styles.saveText}>Cancel Edit</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* List */}
//       {loading ? (
//         <ActivityIndicator
//           size="large"
//           color="#2196f3"
//           style={{ marginTop: 20 }}
//         />
//       ) : (
//         <FlatList
//           data={categories}
//           keyExtractor={(item) => item.id.toString()}
//           contentContainerStyle={{ padding: 15 }}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.cardText}>ID: {item.id}</Text>
//               <Text style={styles.cardText}>Code: {item.code}</Text>
//               <Text style={styles.cardText}>Name: {item.name}</Text>
//               <View style={styles.actions}>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#2196f3" }]}
//                   onPress={() => handleEdit(item)}
//                 >
//                   <Text style={styles.btnText}>Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#ff3b30" }]}
//                   onPress={() => handleDelete(item.id)}
//                 >
//                   <Text style={styles.btnText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: "#2196f3",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 15,
//   },
//   headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
//   backText: { color: "#fff", fontSize: 16 },
//   form: {
//     padding: 15,
//     backgroundColor: "#fff",
//     margin: 10,
//     borderRadius: 10,
//     elevation: 2,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 5,
//   },
//   saveBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 5,
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 8,
//     elevation: 2,
//   },
//   cardText: { fontSize: 16 },
//   actions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginTop: 10,
//   },
//   btn: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginLeft: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "600" },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   fetchAllCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from "../api/admin";

// export default function AdminCategory({ navigation }) {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newCode, setNewCode] = useState("");
//   const [newName, setNewName] = useState("");
//   const [editing, setEditing] = useState(null); // current category being edited

//   // 🔄 Load categories
//   const loadCategories = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchAllCategories();

//       // ✅ Support both {data: []} or {data: {content: []}}
//       const list = res?.data?.data?.content || res?.data?.data || [];

//       // ✅ Ensure we always use real DB ID
//       const data = list.map((item) => ({
//         id: item.id, // DB primary key
//         code: item.code,
//         name: item.name,
//       }));

//       setCategories(data);
//     } catch (err) {
//       console.error("Fetch categories failed:", err);
//       Alert.alert("Error", "Failed to load categories.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   // 💾 Create or update category
//   const handleSave = async () => {
//     if (!newCode.trim() || !newName.trim()) {
//       Alert.alert("Validation", "Please enter both code and name");
//       return;
//     }

//     try {
//       setLoading(true);
//       if (editing) {
//         await updateCategory(editing.id, { name: newName });
//         Alert.alert("Success", "Category updated successfully!");
//       } else {
//         await createCategory({ code: newCode, name: newName });
//         Alert.alert("Success", "Category created successfully!");
//       }

//       // Reset
//       setNewCode("");
//       setNewName("");
//       setEditing(null);
//       await loadCategories(); // refresh list
//     } catch (err) {
//       console.error("Save error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to save category");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ❌ Delete category
//   const handleDelete = (id) => {
//     Alert.alert(
//       "Confirm Delete",
//       "Are you sure you want to delete this category?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               setLoading(true);
//               await deleteCategory(id);
//               Alert.alert("Deleted", "Category removed successfully.");
//               await loadCategories();
//             } catch (err) {
//               console.error(
//                 "Delete failed:",
//                 err.response?.data || err.message
//               );
//               Alert.alert("Error", "Failed to delete category");
//             } finally {
//               setLoading(false);
//             }
//           },
//         },
//       ]
//     );
//   };

//   // ✏️ Edit category
//   const handleEdit = (cat) => {
//     setEditing(cat);
//     setNewCode(cat.code);
//     setNewName(cat.name);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fc" }}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Manage Categories</Text>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>
//       </View>

//       {/* ✅ Form */}
//       <View style={styles.form}>
//         <TextInput
//           style={styles.input}
//           placeholder="Category Code"
//           value={newCode}
//           editable={!editing}
//           onChangeText={setNewCode}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Category Name"
//           value={newName}
//           onChangeText={setNewName}
//         />
//         <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
//           <Text style={styles.saveText}>
//             {editing ? "Update Category" : "Add Category"}
//           </Text>
//         </TouchableOpacity>
//         {editing && (
//           <TouchableOpacity
//             style={[styles.saveBtn, { backgroundColor: "#777" }]}
//             onPress={() => {
//               setEditing(null);
//               setNewCode("");
//               setNewName("");
//             }}
//           >
//             <Text style={styles.saveText}>Cancel Edit</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* ✅ List */}
//       {loading ? (
//         <ActivityIndicator
//           size="large"
//           color="#2196f3"
//           style={{ marginTop: 20 }}
//         />
//       ) : (
//         <FlatList
//           data={categories}
//           keyExtractor={(item) => item.id?.toString()}
//           contentContainerStyle={{ padding: 15 }}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.cardText}>ID: {item.id}</Text>
//               <Text style={styles.cardText}>Code: {item.code}</Text>
//               <Text style={styles.cardText}>Name: {item.name}</Text>

//               <View style={styles.actions}>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#2196f3" }]}
//                   onPress={() => handleEdit(item)}
//                 >
//                   <Text style={styles.btnText}>Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#ff3b30" }]}
//                   onPress={() => handleDelete(item.id)}
//                 >
//                   <Text style={styles.btnText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: "#2196f3",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 15,
//   },
//   headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
//   backText: { color: "#fff", fontSize: 16 },
//   form: {
//     padding: 15,
//     backgroundColor: "#fff",
//     margin: 10,
//     borderRadius: 10,
//     elevation: 2,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 5,
//   },
//   saveBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 5,
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 8,
//     elevation: 2,
//   },
//   cardText: { fontSize: 16 },
//   actions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginTop: 10,
//   },
//   btn: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginLeft: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "600" },
// });
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   fetchAllCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from "../api/admin";

// export default function AdminCategory({ navigation }) {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true); // fetch loading
//   const [saving, setSaving] = useState(false); // API save/delete loading
//   const [newCode, setNewCode] = useState("");
//   const [newName, setNewName] = useState("");
//   const [editing, setEditing] = useState(null); // currently edited category

//   // 🔄 Load categories from backend
//   const loadCategories = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchAllCategories();
//       const list = res?.data?.data?.content || res?.data?.data || [];

//       // Map to use actual DB primary key
//       const data = list.map((item) => ({
//         id: item.id,
//         code: item.code,
//         name: item.name,
//       }));

//       setCategories(data);
//     } catch (err) {
//       console.error("Fetch categories failed:", err);
//       Alert.alert("Error", "Failed to load categories.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   // 💾 Create or update category
//   const handleSave = async () => {
//     if (!newCode.trim() || !newName.trim()) {
//       Alert.alert("Validation", "Please enter both code and name");
//       return;
//     }

//     try {
//       setSaving(true);
//       if (editing) {
//         if (!editing.id) {
//           Alert.alert("Error", "Cannot update: category ID missing");
//           return;
//         }
//         await updateCategory(editing.id, { code: newCode, name: newName });
//         Alert.alert("Success", "Category updated successfully!");
//       } else {
//         await createCategory({ code: newCode, name: newName });
//         Alert.alert("Success", "Category created successfully!");
//       }

//       // Reset form
//       setEditing(null);
//       setNewCode("");
//       setNewName("");
//       await loadCategories(); // refresh list
//     } catch (err) {
//       console.error("Save error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to save category");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ❌ Delete category
//   const handleDelete = (id) => {
//     Alert.alert(
//       "Confirm Delete",
//       "Are you sure you want to delete this category?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               setSaving(true);
//               await deleteCategory(id);
//               Alert.alert("Deleted", "Category removed successfully.");
//               await loadCategories();
//             } catch (err) {
//               console.error(
//                 "Delete failed:",
//                 err.response?.data || err.message
//               );
//               Alert.alert("Error", "Failed to delete category");
//             } finally {
//               setSaving(false);
//             }
//           },
//         },
//       ]
//     );
//   };

//   // ✏️ Edit category
//   const handleEdit = (cat) => {
//     if (!cat?.id) return; // safeguard
//     setEditing(cat);
//     setNewCode(cat.code);
//     setNewName(cat.name);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fc" }}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Manage Categories</Text>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Form */}
//       <View style={styles.form}>
//         <TextInput
//           style={styles.input}
//           placeholder="Category Code"
//           value={newCode}
//           editable={true} // allow editing code
//           onChangeText={setNewCode}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Category Name"
//           value={newName}
//           onChangeText={setNewName}
//         />
//         <TouchableOpacity
//           style={styles.saveBtn}
//           onPress={handleSave}
//           disabled={saving}
//         >
//           <Text style={styles.saveText}>
//             {editing ? "Update Category" : "Add Category"}
//           </Text>
//         </TouchableOpacity>
//         {editing && (
//           <TouchableOpacity
//             style={[styles.saveBtn, { backgroundColor: "#777" }]}
//             onPress={() => {
//               setEditing(null);
//               setNewCode("");
//               setNewName("");
//             }}
//           >
//             <Text style={styles.saveText}>Cancel Edit</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {/* Category List */}
//       {loading ? (
//         <ActivityIndicator
//           size="large"
//           color="#2196f3"
//           style={{ marginTop: 20 }}
//         />
//       ) : (
//         <FlatList
//           data={categories}
//           keyExtractor={(item) => item.id?.toString()}
//           contentContainerStyle={{ padding: 15 }}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.cardText}>ID: {item.id}</Text>{" "}
//               {/* DB primary key */}
//               <Text style={styles.cardText}>Code: {item.code}</Text>
//               <Text style={styles.cardText}>Name: {item.name}</Text>
//               <View style={styles.actions}>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#2196f3" }]}
//                   onPress={() => handleEdit(item)}
//                 >
//                   <Text style={styles.btnText}>Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#ff3b30" }]}
//                   onPress={() => handleDelete(item.id)}
//                 >
//                   <Text style={styles.btnText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: "#2196f3",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 15,
//   },
//   headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
//   backText: { color: "#fff", fontSize: 16 },
//   form: {
//     padding: 15,
//     backgroundColor: "#fff",
//     margin: 10,
//     borderRadius: 10,
//     elevation: 2,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 5,
//   },
//   saveBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 5,
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 8,
//     elevation: 2,
//   },
//   cardText: { fontSize: 16 },
//   actions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginTop: 10,
//   },
//   btn: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginLeft: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "600" },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   fetchAllCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from "../api/admin";

// export default function AdminCategory({ navigation }) {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [newCode, setNewCode] = useState("");
//   const [newName, setNewName] = useState("");
//   const [editing, setEditing] = useState(null);

//   const loadCategories = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchAllCategories();
//       const list = res?.data?.data || [];
//       const data = list.map((item) => ({
//         id: item.id, // DB primary key
//         code: item.code,
//         name: item.name,
//       }));
//       setCategories(data);
//     } catch (err) {
//       console.error("Fetch categories failed:", err);
//       Alert.alert("Error", "Failed to load categories.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadCategories();
//   }, []);

//   const handleSave = async () => {
//     if (!newCode.trim() || !newName.trim()) {
//       Alert.alert("Validation", "Please enter both code and name");
//       return;
//     }

//     try {
//       setSaving(true);
//       if (editing) {
//         if (!editing.id) {
//           Alert.alert("Error", "Cannot update: category ID missing");
//           return;
//         }
//         await updateCategory(editing.id, { code: newCode, name: newName });
//         Alert.alert("Success", "Category updated successfully!");
//       } else {
//         await createCategory({ code: newCode, name: newName });
//         Alert.alert("Success", "Category created successfully!");
//       }
//       setEditing(null);
//       setNewCode("");
//       setNewName("");
//       await loadCategories();
//     } catch (err) {
//       console.error("Save error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to save category");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = (id) => {
//     Alert.alert(
//       "Confirm Delete",
//       "Are you sure you want to delete this category?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               setSaving(true);
//               await deleteCategory(id);
//               Alert.alert("Deleted", "Category removed successfully.");
//               await loadCategories();
//             } catch (err) {
//               console.error(
//                 "Delete failed:",
//                 err.response?.data || err.message
//               );
//               Alert.alert("Error", "Failed to delete category");
//             } finally {
//               setSaving(false);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleEdit = (cat) => {
//     if (!cat?.id) return;
//     setEditing(cat);
//     setNewCode(cat.code);
//     setNewName(cat.name);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fc" }}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Manage Categories</Text>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.backText}>← Back</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.form}>
//         <TextInput
//           style={styles.input}
//           placeholder="Category Code"
//           value={newCode}
//           onChangeText={setNewCode}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Category Name"
//           value={newName}
//           onChangeText={setNewName}
//         />
//         <TouchableOpacity
//           style={styles.saveBtn}
//           onPress={handleSave}
//           disabled={saving}
//         >
//           <Text style={styles.saveText}>
//             {editing ? "Update Category" : "Add Category"}
//           </Text>
//         </TouchableOpacity>
//         {editing && (
//           <TouchableOpacity
//             style={[styles.saveBtn, { backgroundColor: "#777" }]}
//             onPress={() => {
//               setEditing(null);
//               setNewCode("");
//               setNewName("");
//             }}
//           >
//             <Text style={styles.saveText}>Cancel Edit</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       {loading ? (
//         <ActivityIndicator
//           size="large"
//           color="#2196f3"
//           style={{ marginTop: 20 }}
//         />
//       ) : (
//         <FlatList
//           data={categories}
//           keyExtractor={(item) => item.id?.toString()}
//           contentContainerStyle={{ padding: 15 }}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.cardText}>ID: {item.id}</Text>
//               <Text style={styles.cardText}>Code: {item.code}</Text>
//               <Text style={styles.cardText}>Name: {item.name}</Text>
//               <View style={styles.actions}>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#2196f3" }]}
//                   onPress={() => handleEdit(item)}
//                 >
//                   <Text style={styles.btnText}>Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.btn, { backgroundColor: "#ff3b30" }]}
//                   onPress={() => handleDelete(item.id)}
//                 >
//                   <Text style={styles.btnText}>Delete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: "#2196f3",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 15,
//   },
//   headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
//   backText: { color: "#fff", fontSize: 16 },
//   form: {
//     padding: 15,
//     backgroundColor: "#fff",
//     margin: 10,
//     borderRadius: 10,
//     elevation: 2,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 5,
//   },
//   saveBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginVertical: 5,
//   },
//   saveText: { color: "#fff", fontWeight: "700" },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 8,
//     elevation: 2,
//   },
//   cardText: { fontSize: 16 },
//   actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
//   btn: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     marginLeft: 10,
//   },
//   btnText: { color: "#fff", fontWeight: "600" },
// });
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
  const [editing, setEditing] = useState(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetchAllCategories();
      const list = res?.data?.data || [];
      const data = list.map((item, index) => ({
        id: item.id, // DB primary key
        code: item.code,
        name: item.name,
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

  const handleSave = async () => {
    if (!newCode.trim() || !newName.trim()) {
      Alert.alert("Validation", "Please enter both code and name");
      return;
    }

    try {
      setSaving(true);
      if (editing?.id) {
        await updateCategory(editing.id, { code: newCode, name: newName });
        Alert.alert("Success", "Category updated successfully!");
      } else {
        await createCategory({ code: newCode, name: newName });
        Alert.alert("Success", "Category created successfully!");
      }
      setEditing(null);
      setNewCode("");
      setNewName("");
      await loadCategories();
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
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
                err.response?.data || err.message
              );
              Alert.alert("Error", "Failed to delete category");
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (cat) => {
    if (!cat?.id) return;
    setEditing(cat);
    setNewCode(cat.code);
    setNewName(cat.name);
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
          style={styles.input}
          placeholder="Category Code"
          value={newCode}
          onChangeText={setNewCode}
        />
        <TextInput
          style={styles.input}
          placeholder="Category Name"
          value={newName}
          onChangeText={setNewName}
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

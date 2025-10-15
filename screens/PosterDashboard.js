// import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Modal,
//   Platform,
//   KeyboardAvoidingView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Location from "expo-location";
// import { Ionicons } from "@expo/vector-icons";
// import { fetchPosterProfile, logoutPoster, createPosterJob } from "../api/poster";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// export default function PosterDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [sidebarVisible, setSidebarVisible] = useState(false);
//   const [selectedAddress, setSelectedAddress] = useState(null);

//   // Post Job States
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [category, setCategory] = useState("Delivery");
//   const [price, setPrice] = useState("");
//   const [location, setLocation] = useState(null);
//   const [deadline, setDeadline] = useState("");

//   const scrollRef = useRef();

//   // Header & Logout
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Poster Dashboard",
//       headerLeft: () => (
//         <TouchableOpacity onPress={() => setSidebarVisible(true)} style={{ marginLeft: 12 }}>
//           <Ionicons name="menu" size={26} color="#000" />
//         </TouchableOpacity>
//       ),
//       headerRight: () => (
//         <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
//           <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // Load profile and selected address on focus
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", async () => {
//       await loadProfile();
//       const addr = await AsyncStorage.getItem("selectedAddress");
//       if (addr) setSelectedAddress(JSON.parse(addr));
//     });
//     return unsubscribe;
//   }, [navigation]);

//   // Periodic refresh of selected address
//   useEffect(() => {
//     const interval = setInterval(async () => {
//       const addr = await AsyncStorage.getItem("selectedAddress");
//       if (addr) setSelectedAddress(JSON.parse(addr));
//     }, 15000); // refresh every 15 sec
//     return () => clearInterval(interval);
//   }, []);

//   // Get user location once
//   useEffect(() => {
//     getLocation();
//   }, []);

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await fetchPosterProfile();
//       if (res?.status === "SUCCESS" && res.data) {
//         setProfile(res.data);
//         await AsyncStorage.setItem("posterProfile", JSON.stringify(res.data));
//       } else {
//         setProfile(null);
//         Alert.alert("Info", "No profile found. Please complete your profile.");
//         navigation.reset({ index: 0, routes: [{ name: "PosterProfileEdit" }] });
//       }
//     } catch (err) {
//       console.error("[Profile Error]", err);
//       Alert.alert("Error", "Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getLocation = async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert("Permission Denied", "Location permission is required.");
//         return;
//       }
//       const loc = await Location.getCurrentPositionAsync({});
//       setLocation({
//         latitude: Number(loc.coords.latitude.toFixed(5)),
//         longitude: Number(loc.coords.longitude.toFixed(5)),
//       });
//     } catch (err) {
//       console.error("[Location Error]", err);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logoutPoster();
//       await AsyncStorage.removeItem("posterProfile");
//       navigation.replace("LoginPage");
//     } catch (err) {
//       Alert.alert("Error", "Logout failed");
//     }
//   };

//   const handlePostJob = async () => {
//     if (title.length < 5 || title.length > 80)
//       return Alert.alert("Error", "Title must be 5–80 characters.");
//     if (description.length < 10 || description.length > 300)
//       return Alert.alert("Error", "Description must be 10–300 characters.");
//     const priceNum = Number(price);
//     if (!priceNum || priceNum < 30 || priceNum > 5000)
//       return Alert.alert("Error", "Price must be between ₹30 and ₹5000.");
//     if (!location) return Alert.alert("Error", "Location is required.");

//     try {
//       const jobData = {
//         title,
//         description,
//         category,
//         price: priceNum,
//         location,
//         deadline,
//       };

//       const res = await createPosterJob(jobData);
//       if (res.status === "SUCCESS") {
//         Alert.alert("Success", "Job posted successfully!");
//         setTitle("");
//         setDescription("");
//         setCategory("Delivery");
//         setPrice("");
//         setDeadline("");
//       } else {
//         Alert.alert("Error", res.message || "Failed to post job.");
//       }
//     } catch (err) {
//       console.error("[Post Job Error]", err);
//       Alert.alert("Error", "Failed to post job.");
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#0b78ff" />
//       </View>
//     );

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: "#f7fbff" }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <KeyboardAwareScrollView
//         contentContainerStyle={styles.container}
//         enableOnAndroid={true}
//         extraScrollHeight={20}
//         ref={scrollRef}
//       >
//         {/* Sidebar */}
//         <Modal
//           visible={sidebarVisible}
//           animationType="slide"
//           transparent
//           onRequestClose={() => setSidebarVisible(false)}
//         >
//           <View style={styles.overlay}>
//             <View style={styles.sidebar}>
//               <TouchableOpacity onPress={() => setSidebarVisible(false)} style={{ marginBottom: 12 }}>
//                 <Ionicons name="close" size={26} color="#000" />
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => {
//                   setSidebarVisible(false);
//                   navigation.navigate("PosterProfileView");
//                 }}
//               >
//                 <Text style={styles.menuText}>👤 View Profile</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => {
//                   setSidebarVisible(false);
//                   navigation.navigate("PosterProfileEdit", { isEdit: true });
//                 }}
//               >
//                 <Text style={styles.menuText}>✏️ Edit Profile</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => {
//                   setSidebarVisible(false);
//                   navigation.navigate("AddressList");
//                 }}
//               >
//                 <Text style={styles.menuText}>📍 Manage Addresses</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.menuItem}
//                 onPress={() => {
//                   setSidebarVisible(false);
//                   navigation.navigate("PosterKycUpload");
//                 }}
//               >
//                 <Text style={styles.menuText}>🪪 Upload KYC</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>

//         {/* Header */}
//         <Text style={styles.header}>
//           Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""} 👋
//         </Text>

//         {/* Selected Address */}
//         {selectedAddress && (
//           <View style={styles.selectedAddressBox}>
//             <Text style={styles.selectedAddressTitle}>🏠 Selected Address</Text>
//             <Text style={styles.selectedAddressText}>
//               {selectedAddress.label} - {selectedAddress.area}, PIN: {selectedAddress.pinCode}
//             </Text>
//           </View>
//         )}

//         {/* Post Job Form */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Post Job</Text>

//           <TextInput
//             placeholder="Title e.g., Collect medicine"
//             value={title}
//             onChangeText={setTitle}
//             style={styles.input}
//           />
//           <TextInput
//             placeholder="Description"
//             value={description}
//             onChangeText={setDescription}
//             style={[styles.input, { height: 80 }]}
//             multiline
//           />
//           <TextInput
//             placeholder="Category (Delivery / Queueing / Help at home / Other)"
//             value={category}
//             onChangeText={setCategory}
//             style={styles.input}
//           />
//           <TextInput
//             placeholder="Price (₹)"
//             value={price}
//             onChangeText={setPrice}
//             style={styles.input}
//             keyboardType="numeric"
//           />
//           <TextInput
//             placeholder={`Location ${location ? `(Lat: ${location.latitude}, Lon: ${location.longitude})` : ""}`}
//             editable={false}
//             style={styles.input}
//           />
//           <TextInput
//             placeholder="Deadline (optional)"
//             value={deadline}
//             onChangeText={setDeadline}
//             style={styles.input}
//           />

//           <TouchableOpacity style={styles.btn} onPress={handlePostJob}>
//             <Text style={styles.btnText}>POST JOB</Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAwareScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", flexDirection: "row" },
//   sidebar: { backgroundColor: "#fff", width: "70%", padding: 20, paddingTop: 36, borderTopRightRadius: 20, borderBottomRightRadius: 20 },
//   menuItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
//   menuText: { fontSize: 16, color: "#333" },
//   container: { padding: 20, paddingBottom: 40 },
//   header: { fontSize: 22, fontWeight: "700", marginBottom: 12, color: "#0b4da0" },
//   selectedAddressBox: { backgroundColor: "#f0f8ff", padding: 12, borderRadius: 8, marginBottom: 14, borderWidth: 1, borderColor: "#0b78ff" },
//   selectedAddressTitle: { fontSize: 14, fontWeight: "700", color: "#0b78ff", marginBottom: 4 },
//   selectedAddressText: { fontSize: 14, color: "#333" },
//   card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
//   cardTitle: { fontSize: 16, fontWeight: "700", color: "#0b4da0", marginBottom: 12 },
//   input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 14, backgroundColor: "#f7f7f7" },
//   btn: { backgroundColor: "#0b78ff", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 8 },
//   btnText: { color: "#fff", fontWeight: "700" },
//   logoutBtn: { backgroundColor: "#e74c3c", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 10 },
// });
import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { fetchPosterProfile, logoutPoster, createPosterJob } from "../api/poster";

export default function PosterDashboard({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Job fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Delivery");
  const [price, setPrice] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const scrollRef = useRef();

  // Header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Poster Dashboard",
      headerLeft: () => (
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={{ marginLeft: 12 }}>
          <Ionicons name="menu" size={26} color="#000" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Load profile & address
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      await loadProfile();
      const addr = await AsyncStorage.getItem("selectedAddress");
      if (addr) setSelectedAddress(JSON.parse(addr));
    });
    return unsubscribe;
  }, [navigation]);

  // Location permission
  useEffect(() => {
    getLocation();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await fetchPosterProfile();
      if (res?.status === "SUCCESS" && res.data) {
        setProfile(res.data);
        await AsyncStorage.setItem("posterProfile", JSON.stringify(res.data));
      } else {
        setProfile(null);
        Alert.alert("Info", "No profile found. Please complete your profile.");
        navigation.reset({ index: 0, routes: [{ name: "PosterProfileEdit" }] });
      }
    } catch (err) {
      console.error("[Profile Error]", err);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      await Location.getCurrentPositionAsync({});
    } catch (err) {
      console.error("[Location Error]", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutPoster();
      await AsyncStorage.removeItem("posterProfile");
      navigation.replace("LoginPage");
    } catch (err) {
      Alert.alert("Error", "Logout failed");
    }
  };

  // Post Job
  const handlePostJob = async () => {
    if (!title.trim()) return Alert.alert("Error", "Enter job title.");
    if (!description.trim()) return Alert.alert("Error", "Enter job description.");
    if (!price || isNaN(price)) return Alert.alert("Error", "Enter valid price in ₹.");
    if (!selectedAddress) return Alert.alert("Error", "Select an address first.");

    const amountPaise = parseInt(price) * 100;

    const categoryMap = {
      Delivery: 1,
      Queueing: 2,
      "Help at home": 3,
      Other: 4,
    };
    const categoryCode = categoryMap[category] || 4;

    const jobData = {
      title: title.trim(),
      description: description.trim(),
      categoryCode,
      amountPaise,
      deadline: deadline ? deadline.toISOString() : new Date().toISOString(),
      addressId: selectedAddress.id,
    };

    try {
      setLoading(true);
      const res = await createPosterJob(jobData);
      if (res?.status === "SUCCESS" || res?.status === "OK") {
        Alert.alert("Success", "Job created successfully!");
        setTitle("");
        setDescription("");
        setCategory("Delivery");
        setPrice("");
        setDeadline(null);
      } else {
        Alert.alert("Error", res?.message || "Failed to create job.");
      }
    } catch (err) {
      console.error("[Post Job Error]", err);
      Alert.alert("Error", "Something went wrong while posting job.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0b78ff" />
      </View>
    );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f7fbff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid={true}
        extraScrollHeight={20}
        ref={scrollRef}
      >
        {/* Sidebar Modal */}
        <Modal
          visible={sidebarVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setSidebarVisible(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.sidebar}>
              <TouchableOpacity onPress={() => setSidebarVisible(false)} style={{ marginBottom: 12 }}>
                <Ionicons name="close" size={26} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setSidebarVisible(false);
                  navigation.navigate("PosterProfileView");
                }}
              >
                <Text style={styles.menuText}>👤 View Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setSidebarVisible(false);
                  navigation.navigate("PosterProfileEdit", { isEdit: true });
                }}
              >
                <Text style={styles.menuText}>✏️ Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setSidebarVisible(false);
                  navigation.navigate("AddressList");
                }}
              >
                <Text style={styles.menuText}>📍 Manage Addresses</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setSidebarVisible(false);
                  navigation.navigate("PosterKycUpload");
                }}
              >
                <Text style={styles.menuText}>🪪 Upload KYC</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Header */}
        <Text style={styles.header}>
          Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""} 👋
        </Text>

        {/* Selected Address */}
        {selectedAddress && (
          <View style={styles.selectedAddressBox}>
            <Text style={styles.selectedAddressTitle}>🏠 Selected Address</Text>
            <Text style={styles.selectedAddressText}>
              {selectedAddress.label} - {selectedAddress.area}, PIN: {selectedAddress.pinCode}
            </Text>
          </View>
        )}

        {/* Post Job Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Post New Job</Text>

          <TextInput placeholder="Job Title" value={title} onChangeText={setTitle} style={styles.input} />
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { height: 80 }]}
            multiline
          />

          {/* Category Selector */}
          <View style={styles.categoryContainer}>
            {["Delivery", "Queueing", "Help at home", "Other"].map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.categoryBtn, category === c && { backgroundColor: "#0b78ff" }]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.categoryText, category === c && { color: "#fff" }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput placeholder="Price (₹)" value={price} onChangeText={setPrice} style={styles.input} keyboardType="numeric" />

          {/* Deadline Picker */}
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text style={{ color: deadline ? "#000" : "#aaa" }}>
              {deadline ? `Deadline: ${deadline.toLocaleString()}` : "Select Deadline"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={deadline || new Date()}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDeadline(selectedDate);
              }}
            />
          )}

          <TouchableOpacity style={styles.btn} onPress={handlePostJob}>
            <Text style={styles.btnText}>POST JOB</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", flexDirection: "row" },
  sidebar: { backgroundColor: "#fff", width: "70%", padding: 20, paddingTop: 36, borderTopRightRadius: 20, borderBottomRightRadius: 20 },
  menuItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
  menuText: { fontSize: 16, color: "#333" },
  container: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 12, color: "#0b4da0" },
  selectedAddressBox: { backgroundColor: "#f0f8ff", padding: 12, borderRadius: 8, marginBottom: 14, borderWidth: 1, borderColor: "#0b78ff" },
  selectedAddressTitle: { fontSize: 14, fontWeight: "700", color: "#0b78ff", marginBottom: 4 },
  selectedAddressText: { fontSize: 14, color: "#333" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0b4da0", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 14, backgroundColor: "#f7f7f7" },
  categoryContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  categoryBtn: { borderWidth: 1, borderColor: "#0b78ff", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, marginRight: 6, marginBottom: 6 },
  categoryText: { color: "#0b78ff", fontSize: 13 },
  btn: { backgroundColor: "#0b78ff", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 8 },
  btnText: { color: "#fff", fontWeight: "700" },
  logoutBtn: { backgroundColor: "#e74c3c", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 10 },
});

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   ActivityIndicator,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { fetchProfile } from "../api/doer";

// export default function ProfileScreen({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   const loadProfile = async () => {
//     try {
//       const token = await AsyncStorage.getItem("authToken");
//       if (!token) {
//         Alert.alert("Error", "Not logged in");
//         navigation.goBack();
//         return;
//       }
//       const res = await fetchProfile(token);
//       setProfile(res.data.data);
//     } catch (err) {
//       console.error("Profile Fetch Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Unable to fetch profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" />
//         <Text>Loading profile...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Image
//         source={{ uri: profile?.avatarUrl || "https://i.pravatar.cc/100" }}
//         style={styles.avatar}
//       />
//       <Text style={styles.name}>{profile.name}</Text>
//       <Text style={styles.email}>{profile.email}</Text>

//       <TouchableOpacity
//         style={styles.optionBtn}
//         onPress={() => navigation.navigate("KYCPage")}
//       >
//         <Text style={styles.optionText}>
//           {profile.kycVerified ? "✅ KYC Verified" : "❌ Upload KYC"}
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.optionBtn}
//         onPress={() => Alert.alert("Bank Details", "Bank info screen")}
//       >
//         <Text style={styles.optionText}>🏦 Bank Details</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.optionBtn}
//         onPress={() => Alert.alert("Address", "Address info screen")}
//       >
//         <Text style={styles.optionText}>📍 Address</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.optionBtn}
//         onPress={() => Alert.alert("History", "Service history screen")}
//       >
//         <Text style={styles.optionText}>📜 History</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, alignItems: "center", padding: 20, backgroundColor: "#f4f4f4" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
//   name: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
//   email: { fontSize: 16, color: "gray", marginBottom: 20 },
//   optionBtn: {
//     backgroundColor: "#2196f3",
//     padding: 15,
//     width: "90%",
//     borderRadius: 10,
//     alignItems: "center",
//     marginVertical: 8,
//   },
//   optionText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });

// // corret code............................................................................................................................
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchProfile } from "../api/doer";

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Not logged in");
        navigation.goBack();
        return;
      }
      const res = await fetchProfile(token);
      setProfile(res.data.data);
    } catch (err) {
      console.error("Profile Fetch Error:", err.response?.data || err.message);
      Alert.alert("Error", "Unable to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsWrapper}>
        <TouchableOpacity
          style={styles.optionBtn}
          onPress={() => Alert.alert("Bank Details", "Bank info screen")}
        >
          <Text style={styles.optionText}>🏦 Bank Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionBtn}
          onPress={() => Alert.alert("Address", "Address info screen")}
        >
          <Text style={styles.optionText}>📍 Address</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionBtn}
          onPress={() => Alert.alert("History", "Service history screen")}
        >
          <Text style={styles.optionText}>📜 History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 25,
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  name: { fontSize: 26, fontWeight: "700", color: "#222", marginBottom: 5 },
  email: { fontSize: 16, color: "#555" },
  optionsWrapper: { paddingHorizontal: 20 },
  optionBtn: {
    backgroundColor: "#2196f3",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  optionText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

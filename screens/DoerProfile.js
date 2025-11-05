// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   TouchableOpacity,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import { useFocusEffect } from "@react-navigation/native";

// export default function DoerProfile({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       console.log("Refreshing DoerProfile screen...");
//       loadProfile();
//     }, [])
//   );

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const storedProfile = await AsyncStorage.getItem("doerProfile");

//       if (storedProfile) {
//         const parsed = JSON.parse(storedProfile);
//         console.log("Stored profile:", parsed);

//         // handle any nested structure (some APIs wrap data inside `data`)
//         const profileData = parsed?.data?.data || parsed?.data || parsed;

//         setProfile({
//           name: profileData.name || "N/A",
//           phone: profileData.phone || "N/A",
//           email: profileData.email || "N/A",
//           bio: profileData.bio || "No bio available",
//           skills: profileData.skills || [],
//           isPhoneVerified:
//             profileData.isPhoneVerified !== undefined
//               ? profileData.isPhoneVerified
//               : false,
//           isVerified: !!profileData.isVerified,
//           verificationStatus: profileData.verificationStatus || "Pending",
//           kycLevel: profileData.kycLevel ?? 0,
//         });
//       } else {
//         setProfile(null);
//       }
//     } catch (err) {
//       console.log("Failed to load profile", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#4a90e2" />
//         <Text style={{ marginTop: 10, color: "#555" }}>Loading profile...</Text>
//       </View>
//     );

//   if (!profile)
//     return (
//       <View style={styles.center}>
//         <Text style={{ color: "#555", fontSize: 16 }}>No profile found</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Back button */}
//       <TouchableOpacity
//         style={{ marginBottom: 20 }}
//         onPress={() => navigation.goBack()}
//       >
//         <Ionicons name="arrow-back" size={26} color="#000" />
//       </TouchableOpacity>

//       <Text style={styles.headerText}>Doer Profile</Text>

//       {/* Basic Info */}
//       <View style={styles.card}>
//         <Text style={styles.label}>Name</Text>
//         <Text style={styles.value}>{profile.name}</Text>

//         <Text style={styles.label}>Phone</Text>
//         <Text style={styles.value}>{profile.phone}</Text>

//         <Text style={styles.label}>Email</Text>
//         <Text style={styles.value}>{profile.email}</Text>

//         <Text style={styles.label}>Bio</Text>
//         <Text style={styles.value}>{profile.bio}</Text>

//         <Text style={styles.label}>Skills</Text>
//         <Text style={styles.value}>
//           {profile.skills.length ? profile.skills.join(", ") : "No skills added"}
//         </Text>
//       </View>

//       {/* Verification Info */}
//       <View style={styles.card}>
//         <Text style={styles.label}>📞 Phone Verified</Text>
//         <Text style={[styles.value, { color: profile.isPhoneVerified ? "green" : "red" }]}>
//           {profile.isPhoneVerified ? "Yes" : "No"}
//         </Text>

//         <Text style={styles.label}>🪪 KYC Level</Text>
//         <Text style={styles.value}>{profile.kycLevel}</Text>

//         <Text style={styles.label}>📋 Verification Status</Text>
//         <Text style={styles.value}>{profile.verificationStatus}</Text>

//         <Text style={styles.label}>✅ Profile Verified</Text>
//         <Text style={[styles.value, { color: profile.isVerified ? "green" : "orange" }]}>
//           {profile.isVerified ? "Yes" : "No"}
//         </Text>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#f2f6fc", paddingBottom: 30 },
//   headerText: {
//     fontSize: 28,
//     fontWeight: "700",
//     marginBottom: 20,
//     color: "#4a90e2",
//     textAlign: "center",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   label: { fontWeight: "700", color: "#555", marginTop: 10, fontSize: 14 },
//   value: { fontSize: 16, marginTop: 3, color: "#333" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
// });
// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   TouchableOpacity,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";
// import { useFocusEffect } from "@react-navigation/native";

// export default function DoerProfile({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       console.log("Refreshing DoerProfile screen...");
//       loadProfile();
//     }, [])
//   );

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const storedProfile = await AsyncStorage.getItem("doerProfile");

//       if (storedProfile) {
//         const parsed = JSON.parse(storedProfile);
//         console.log("Stored profile:", parsed);

//         // handle nested data (if wrapped inside `data` object)
//         const profileData = parsed?.data?.data || parsed?.data || parsed;

//         // ✅ Normalize field names for consistency
//         const normalizedProfile = {
//           name: profileData.name || "N/A",
//           phone: profileData.phone || "N/A",
//           email: profileData.email || "N/A",
//           bio: profileData.bio || "No bio available",
//           skills: profileData.skills || [],
//           // Handle both `isPhoneVerified` and `is_phone_verified`
//           isPhoneVerified:
//             profileData.isPhoneVerified !== undefined
//               ? profileData.isPhoneVerified
//               : profileData.is_phone_verified || false,
//           isVerified: !!profileData.isVerified,
//           verificationStatus: profileData.verificationStatus || "Pending",
//           kycLevel: profileData.kycLevel ?? 0,
//           createdAt: profileData.createdAt || null,
//           updatedAt: profileData.updatedAt || null,
//         };

//         setProfile(normalizedProfile);

//         // ✅ Re-save normalized data (so future reads are always camelCase)
//         await AsyncStorage.setItem(
//           "doerProfile",
//           JSON.stringify(normalizedProfile)
//         );
//       } else {
//         setProfile(null);
//       }
//     } catch (err) {
//       console.log("Failed to load profile", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#4a90e2" />
//         <Text style={{ marginTop: 10, color: "#555" }}>Loading profile...</Text>
//       </View>
//     );

//   if (!profile)
//     return (
//       <View style={styles.center}>
//         <Text style={{ color: "#555", fontSize: 16 }}>No profile found</Text>
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Back button */}
//       <TouchableOpacity
//         style={{ marginBottom: 20 }}
//         onPress={() => navigation.goBack()}
//       >
//         <Ionicons name="arrow-back" size={26} color="#000" />
//       </TouchableOpacity>

//       <Text style={styles.headerText}>Doer Profile</Text>

//       {/* Basic Info */}
//       <View style={styles.card}>
//         <Text style={styles.label}>Name</Text>
//         <Text style={styles.value}>{profile.name}</Text>

//         <Text style={styles.label}>Phone</Text>
//         <Text style={styles.value}>{profile.phone}</Text>

//         <Text style={styles.label}>Email</Text>
//         <Text style={styles.value}>{profile.email}</Text>

//         <Text style={styles.label}>Bio</Text>
//         <Text style={styles.value}>{profile.bio}</Text>

//         <Text style={styles.label}>Skills</Text>
//         <Text style={styles.value}>
//           {profile.skills.length ? profile.skills.join(", ") : "No skills added"}
//         </Text>
//       </View>

//       {/* Verification Info */}
//       <View style={styles.card}>
//         <Text style={styles.label}>📞 Phone Verified</Text>
//         <Text
//           style={[
//             styles.value,
//             { color: profile.isPhoneVerified ? "green" : "red" },
//           ]}
//         >
//           {profile.isPhoneVerified ? "Yes" : "No"}
//         </Text>

//         <Text style={styles.label}>🪪 KYC Level</Text>
//         <Text style={styles.value}>{profile.kycLevel}</Text>

//         <Text style={styles.label}>📋 Verification Status</Text>
//         <Text style={styles.value}>{profile.verificationStatus}</Text>

//         <Text style={styles.label}>✅ Profile Verified</Text>
//         <Text
//           style={[
//             styles.value,
//             { color: profile.isVerified ? "green" : "orange" },
//           ]}
//         >
//           {profile.isVerified ? "Yes" : "No"}
//         </Text>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#f2f6fc", paddingBottom: 30 },
//   headerText: {
//     fontSize: 28,
//     fontWeight: "700",
//     marginBottom: 20,
//     color: "#4a90e2",
//     textAlign: "center",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   label: { fontWeight: "700", color: "#555", marginTop: 10, fontSize: 14 },
//   value: { fontSize: 16, marginTop: 3, color: "#333" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
// });
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

export default function DoerProfile({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("Refreshing DoerProfile screen...");
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      setLoading(true);
      const storedProfile = await AsyncStorage.getItem("doerProfile");

      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        console.log("Stored profile:", parsed);

        // ✅ Handle nested structure safely
        const profileData = parsed?.data?.data || parsed?.data || parsed;

        // ✅ Normalize and use only backend’s `isPhoneVerified` field
        const normalizedProfile = {
          name: profileData.name || "N/A",
          phone: profileData.phone || "N/A",
          email: profileData.email || "N/A",
          bio: profileData.bio || "No bio available",
          skills: profileData.skills || [],
          isPhoneVerified: profileData.isPhoneVerified ?? false,
          isVerified: profileData.isVerified ?? false,
          verificationStatus: profileData.verificationStatus || "NOT_VERIFIED",
          kycLevel: profileData.kycLevel ?? 0,
          createdAt: profileData.createdAt || null,
          updatedAt: profileData.updatedAt || null,
        };

        setProfile(normalizedProfile);

        // ✅ Save normalized data for future reads
        await AsyncStorage.setItem(
          "doerProfile",
          JSON.stringify(normalizedProfile)
        );
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.log("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={{ marginTop: 10, color: "#555" }}>Loading profile...</Text>
      </View>
    );

  if (!profile)
    return (
      <View style={styles.center}>
        <Text style={{ color: "#555", fontSize: 16 }}>No profile found</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🔙 Back button */}
      <TouchableOpacity
        style={{ marginBottom: 20 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={26} color="#000" />
      </TouchableOpacity>

      <Text style={styles.headerText}>Doer Profile</Text>

      {/* 🧍 Basic Info */}
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{profile.name}</Text>

        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{profile.phone}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{profile.email}</Text>

        <Text style={styles.label}>Bio</Text>
        <Text style={styles.value}>{profile.bio}</Text>

        <Text style={styles.label}>Skills</Text>
        <Text style={styles.value}>
          {profile.skills.length
            ? profile.skills.join(", ")
            : "No skills added"}
        </Text>
      </View>

      {/* 🔒 Verification Info */}
      <View style={styles.card}>
        <Text style={styles.label}>📞 Phone Verified</Text>
        <Text
          style={[
            styles.value,
            { color: profile.isPhoneVerified ? "green" : "red" },
          ]}
        >
          {profile.isPhoneVerified ? "Yes" : "No"}
        </Text>

        <Text style={styles.label}>🪪 KYC Level</Text>
        <Text style={styles.value}>{profile.kycLevel}</Text>

        <Text style={styles.label}>📋 Verification Status</Text>
        <Text style={styles.value}>{profile.verificationStatus}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f2f6fc", paddingBottom: 30 },
  headerText: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    color: "#4a90e2",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  label: { fontWeight: "700", color: "#555", marginTop: 10, fontSize: 14 },
  value: { fontSize: 16, marginTop: 3, color: "#333" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function Dashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadProfile();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const loadProfile = async () => {
//     try {
//       const storedProfile = await AsyncStorage.getItem("doerProfile");
//       if (storedProfile) {
//         setProfile(JSON.parse(storedProfile));
//       } else {
//         setProfile(null);
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = async () => {
//     await AsyncStorage.removeItem("authToken");
//     await AsyncStorage.removeItem("doerProfile");
//     navigation.reset({ index: 0, routes: [{ name: "RoleSelect" }] });
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text style={{ marginTop: 10 }}>Loading profile...</Text>
//       </View>
//     );
//   }

//   // Sample jobs (dummy data)
//   const jobs = [
//     { id: 1, title: "Pick up documents", price: 150, distance: 0.8, time: 20 },
//     { id: 2, title: "Bring groceries", price: 100, distance: 1.2, time: 30 },
//     { id: 3, title: "Clean garage", price: 200, distance: 1.5, time: 45 },
//   ];

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
//       {/* First-time user */}
//       {!profile ? (
//         <View style={styles.centerContent}>
//           <Text style={styles.welcomeText}>
//             Welcome! Complete your profile to continue.
//           </Text>
//           <TouchableOpacity
//             style={[styles.profileBtn, styles.editBtn]}
//             onPress={() => navigation.replace("EditProfile")}
//           >
//             <Text style={styles.profileBtnText}>Complete Profile</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <>
//           {/* User Info */}
//           <View style={styles.header}>
//             <Text style={styles.name}>Hi, {profile?.name || "User"}</Text>
//             <View style={styles.buttonGroup}>
//               <TouchableOpacity
//                 style={[styles.profileBtn, styles.editBtn]}
//                 onPress={() => navigation.navigate("EditProfile", { profile })}
//               >
//                 <Text style={styles.profileBtnText}>EDIT PROFILE</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.profileBtn, styles.viewBtn]}
//                 onPress={() => navigation.navigate("DoerProfile", { profile })}
//               >
//                 <Text style={styles.profileBtnText}>VIEW PROFILE</Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Bio Section */}
//           <View style={styles.bioSection}>
//             <Text style={styles.bioText}>{profile?.bio || "No bio available"}</Text>
//             <Text style={styles.bioText}>
//               Skills: {profile?.skills?.join(", ") || "No skills"}
//             </Text>
//           </View>

//           {/* Jobs List */}
//           <Text style={styles.sectionTitle}>Available Jobs</Text>
//           {jobs.map((job) => (
//             <View key={job.id} style={styles.jobCard}>
//               <Text style={styles.jobTitle}>{job.title}</Text>
//               <Text style={styles.jobInfo}>💰 ₹{job.price}</Text>
//               <Text style={styles.jobInfo}>📍 {job.distance} km</Text>
//               <Text style={styles.jobInfo}>🕒 {job.time} min</Text>
//             </View>
//           ))}
//         </>
//       )}

//       {/* Logout */}
//       <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
//         <Text style={styles.logoutBtnText}>Logout</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 15, backgroundColor: "#f5f7fa" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   centerContent: { alignItems: "center", marginVertical: 40 },

//   welcomeText: { fontSize: 18, textAlign: "center", marginBottom: 20 },

//   header: { marginBottom: 20 },
//   name: { fontSize: 24, fontWeight: "700", color: "#333", marginBottom: 15 },

//   buttonGroup: { flexDirection: "row", justifyContent: "flex-start" },
//   profileBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginHorizontal: 5,
//   },
//   editBtn: { backgroundColor: "#1976D2" },
//   viewBtn: { backgroundColor: "#4CAF50" },
//   profileBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },

//   bioSection: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 20,
//     elevation: 3,
//   },
//   bioText: { fontSize: 16, color: "#555", marginBottom: 5 },

//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#333",
//     marginBottom: 10,
//   },
//   jobCard: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 15,
//     elevation: 2,
//   },
//   jobTitle: { fontSize: 16, fontWeight: "600", marginBottom: 5, color: "#333" },
//   jobInfo: { fontSize: 14, color: "#555", marginBottom: 2 },

//   logoutBtn: {
//     backgroundColor: "#ff4d4d",
//     paddingVertical: 15,
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: 20,
//   },
//   logoutBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function Dashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadProfile();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const loadProfile = async () => {
//     setLoading(true);
//     try {
//       const storedProfile = await AsyncStorage.getItem("doerProfile");
//       if (storedProfile) setProfile(JSON.parse(storedProfile));
//       else setProfile(null);
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = async () => {
//     await AsyncStorage.removeItem("authToken");
//     await AsyncStorage.removeItem("doerProfile");
//     navigation.reset({ index: 0, routes: [{ name: "RoleSelect" }] });
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text>Loading profile...</Text>
//       </View>
//     );

//   const jobs = [
//     { id: 1, title: "Pick up documents", price: 150, distance: 0.8, time: 20 },
//     { id: 2, title: "Bring groceries", price: 100, distance: 1.2, time: 30 },
//     { id: 3, title: "Clean garage", price: 200, distance: 1.5, time: 45 },
//   ];

//   return (
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={{ paddingBottom: 40 }}
//     >
//       {!profile ? (
//         <View style={styles.centerContent}>
//           <Text style={styles.welcomeText}>
//             Welcome! Complete your profile to continue.
//           </Text>
//           <TouchableOpacity
//             style={[styles.profileBtn, styles.editBtn]}
//             onPress={() => navigation.replace("EditProfile")}
//           >
//             <Text style={styles.profileBtnText}>Complete Profile</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <>
//           <View style={styles.header}>
//             <Text style={styles.name}>Hi, {profile?.name || "User"}</Text>
//             <View style={styles.buttonGroup}>
//               <TouchableOpacity
//                 style={[styles.profileBtn, styles.editBtn]}
//                 onPress={() => navigation.navigate("EditProfile")}
//               >
//                 <Text style={styles.profileBtnText}>EDIT PROFILE</Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           <View style={styles.bioSection}>
//             <Text style={styles.bioText}>
//               {profile?.bio || "No bio available"}
//             </Text>
//             <Text style={styles.bioText}>
//               Skills: {profile?.skills?.join(", ") || "No skills"}
//             </Text>
//             {profile?.is_phone_verified && (
//               <Text style={{ color: "green", fontWeight: "700" }}>
//                 ✅ Phone Verified
//               </Text>
//             )}
//             {profile?.kycLevel > 0 && (
//               <Text
//                 style={{
//                   color: profile.is_phone_verified ? "green" : "orange",
//                 }}
//               >
//                 {profile.is_phone_verified ? "KYC Verified" : "KYC Pending"}
//               </Text>
//             )}
//           </View>

//           <Text style={styles.sectionTitle}>Available Jobs</Text>
//           {jobs.map((job) => (
//             <View key={job.id} style={styles.jobCard}>
//               <Text style={styles.jobTitle}>{job.title}</Text>
//               <Text style={styles.jobInfo}>💰 ₹{job.price}</Text>
//               <Text style={styles.jobInfo}>📍 {job.distance} km</Text>
//               <Text style={styles.jobInfo}>🕒 {job.time} min</Text>
//             </View>
//           ))}
//         </>
//       )}

//       <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
//         <Text style={styles.logoutBtnText}>Logout</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 15, backgroundColor: "#f5f7fa" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   centerContent: { alignItems: "center", marginVertical: 40 },
//   welcomeText: { fontSize: 18, textAlign: "center", marginBottom: 20 },
//   header: { marginBottom: 20 },
//   name: { fontSize: 24, fontWeight: "700", color: "#333", marginBottom: 15 },
//   buttonGroup: { flexDirection: "row", justifyContent: "flex-start" },
//   profileBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginHorizontal: 5,
//   },
//   editBtn: { backgroundColor: "#1976D2" },
//   profileBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
//   bioSection: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 20,
//     elevation: 3,
//   },
//   bioText: { fontSize: 16, color: "#555", marginBottom: 5 },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#333",
//     marginBottom: 10,
//   },
//   jobCard: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 15,
//     elevation: 2,
//   },
//   jobTitle: { fontSize: 16, fontWeight: "600", marginBottom: 5, color: "#333" },
//   jobInfo: { fontSize: 14, color: "#555", marginBottom: 2 },
//   logoutBtn: {
//     backgroundColor: "#ff4d4d",
//     paddingVertical: 15,
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: 20,
//   },
//   logoutBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
// });
// import React, { useEffect, useState, useLayoutEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Modal,
//   Alert,
//   ScrollView,
//   Platform,
//   KeyboardAvoidingView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Ionicons } from "@expo/vector-icons";

// export default function DoerDashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [sidebarVisible, setSidebarVisible] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   const jobs = [
//     { id: 1, title: "Pick up documents", price: 150, distance: 0.8, time: 20 },
//     { id: 2, title: "Bring groceries", price: 100, distance: 1.2, time: 30 },
//     { id: 3, title: "Clean garage", price: 200, distance: 1.5, time: 45 },
//   ];

//   // ---------- Header ----------
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerShown: true,
//       title: "Doer Dashboard",
//       headerLeft: () => (
//         <TouchableOpacity
//           onPress={() => setSidebarVisible(true)}
//           style={{ marginLeft: 12 }}
//         >
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

//   // ---------- Load Profile ----------
//   useEffect(() => {
//     const unsubscribe = navigation.addListener("focus", () => {
//       loadProfile();
//     });
//     return unsubscribe;
//   }, [navigation]);

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const storedProfile = await AsyncStorage.getItem("doerProfile");
//       if (storedProfile) {
//         const data = JSON.parse(storedProfile);
//         setProfile(data);
//       } else {
//         setProfile(null);
//         Alert.alert("Profile Missing", "Please complete your profile.");
//         navigation.reset({ index: 0, routes: [{ name: "EditProfile" }] });
//       }
//     } catch (err) {
//       console.warn("[Profile Error]", err.message || err);
//       setProfile(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------- Logout ----------
//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.removeItem("authToken");
//       await AsyncStorage.removeItem("doerProfile");
//       navigation.reset({ index: 0, routes: [{ name: "RoleSelect" }] });
//     } catch (err) {
//       console.warn("[Logout Error]", err.message || err);
//       Alert.alert("Error", "Logout failed. Please try again.");
//     }
//   };

//   if (loading)
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#0b78ff" />
//       </View>
//     );

//   // ---------- Sidebar ----------
//   const Sidebar = () => (
//     <Modal
//       visible={sidebarVisible}
//       animationType="slide"
//       transparent
//       onRequestClose={() => setSidebarVisible(false)}
//     >
//       <View style={styles.overlay}>
//         <View style={styles.sidebar}>
//           <TouchableOpacity
//             onPress={() => setSidebarVisible(false)}
//             style={{ marginBottom: 12 }}
//           >
//             <Ionicons name="close" size={26} color="#000" />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() => {
//               setSidebarVisible(false);
//               navigation.navigate("DoerProfile");
//             }}
//           >
//             <Text style={styles.menuText}>👤 View Profile</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() => {
//               setSidebarVisible(false);
//               navigation.navigate("EditProfile");
//             }}
//           >
//             <Text style={styles.menuText}>✏️ Edit Profile</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.menuItem,
//               !profile?.is_phone_verified && { opacity: 0.5 },
//             ]}
//             disabled={!profile?.is_phone_verified}
//             onPress={() => {
//               if (!profile?.is_phone_verified) {
//                 Alert.alert("Phone not verified", "Verify your phone first.");
//                 return;
//               }
//               setSidebarVisible(false);
//               navigation.navigate("DoerKycUpload");
//             }}
//           >
//             <Text style={styles.menuText}>🪪 Upload KYC</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );

//   // ---------- Render Job ----------
//   const renderJob = ({ item }) => (
//     <View style={styles.jobCard}>
//       <Text style={styles.jobTitle}>{item.title}</Text>
//       <Text style={styles.jobMeta}>💰 ₹{item.price}</Text>
//       <Text style={styles.jobMeta}>📍 {item.distance} km</Text>
//       <Text style={styles.jobMeta}>🕒 {item.time} min</Text>
//     </View>
//   );

//   return (
//     <>
//       <Sidebar />

//       <FlatList
//         data={jobs}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={renderJob}
//         onRefresh={loadProfile}
//         refreshing={refreshing}
//         contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
//         ListHeaderComponent={
//           <>
//             <Text style={styles.header}>
//               Welcome{profile?.name ? `, ${profile.name}` : ""} 👋
//             </Text>

//             <View style={styles.card}>
//               <Text style={styles.label}>📞 Phone Verified</Text>
//               <Text
//                 style={[
//                   styles.value,
//                   { color: profile?.is_phone_verified ? "green" : "red" },
//                 ]}
//               >
//                 {profile?.is_phone_verified ? "Yes" : "No"}
//               </Text>

//               <Text style={styles.label}>🪪 KYC Level</Text>
//               <Text style={styles.value}>{profile?.kycLevel ?? 0}</Text>

//               <Text style={styles.label}>📋 Verification Status</Text>
//               <Text style={styles.value}>
//                 {profile?.verificationStatus || "Unknown"}
//               </Text>

//               <Text style={styles.label}>✅ Profile Verified</Text>
//               <Text
//                 style={[
//                   styles.value,
//                   { color: profile?.isVerified ? "green" : "orange" },
//                 ]}
//               >
//                 {profile?.isVerified ? "Yes" : "No"}
//               </Text>
//             </View>

//             <Text style={styles.sectionHeader}>📋 Available Jobs</Text>
//           </>
//         }
//         ListEmptyComponent={
//           <Text style={{ textAlign: "center", color: "#555", marginTop: 20 }}>
//             No jobs available right now.
//           </Text>
//         }
//       />
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 12,
//     color: "#0b4da0",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   label: { fontSize: 14, color: "#555", marginTop: 4 },
//   value: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
//   jobCard: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   jobTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
//   jobMeta: { fontSize: 13, color: "#555", marginTop: 2 },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginTop: 10,
//     marginBottom: 10,
//     color: "#0b4da0",
//   },
//   logoutBtn: {
//     backgroundColor: "#e74c3c",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//     marginRight: 10,
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.3)",
//     flexDirection: "row",
//   },
//   sidebar: {
//     backgroundColor: "#fff",
//     width: "70%",
//     padding: 20,
//     paddingTop: 36,
//     borderTopRightRadius: 20,
//     borderBottomRightRadius: 20,
//   },
//   menuItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
//   menuText: { fontSize: 16, color: "#333" },
// });
import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function DoerDashboard({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const jobs = [
    { id: 1, title: "Pick up documents", price: 150, distance: 0.8, time: 20 },
    { id: 2, title: "Bring groceries", price: 100, distance: 1.2, time: 30 },
    { id: 3, title: "Clean garage", price: 200, distance: 1.5, time: 45 },
  ];

  // ---------- Header ----------
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Doer Dashboard",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => setSidebarVisible(true)}
          style={{ marginLeft: 12 }}
        >
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

  // ---------- Load Profile ----------
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const storedProfile = await AsyncStorage.getItem("doerProfile");
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        setProfile(null);
        Alert.alert("Profile Missing", "Please complete your profile.");
        navigation.reset({ index: 0, routes: [{ name: "EditProfile" }] });
      }
    } catch (err) {
      console.warn("[Profile Error]", err.message || err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Logout ----------
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("doerProfile");
      navigation.reset({ index: 0, routes: [{ name: "RoleSelect" }] });
    } catch (err) {
      console.warn("[Logout Error]", err.message || err);
      Alert.alert("Error", "Logout failed. Please try again.");
    }
  };

  // ---------- Sidebar ----------
  const Sidebar = () => (
    <Modal
      visible={sidebarVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setSidebarVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.sidebar}>
          <TouchableOpacity
            onPress={() => setSidebarVisible(false)}
            style={{ marginBottom: 12 }}
          >
            <Ionicons name="close" size={26} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setSidebarVisible(false);
              navigation.navigate("DoerProfile");
            }}
          >
            <Text style={styles.menuText}>👤 View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setSidebarVisible(false);
              navigation.navigate("EditProfile");
            }}
          >
            <Text style={styles.menuText}>✏️ Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              !profile?.isPhoneVerified && { opacity: 0.5 },
            ]}
            disabled={!profile?.isPhoneVerified}
            onPress={() => {
              if (!profile?.isPhoneVerified) {
                Alert.alert("Phone not verified", "Verify your phone first.");
                return;
              }
              setSidebarVisible(false);
              navigation.navigate("KYCPage");
            }}
          >
            <Text style={styles.menuText}>🪪 Upload KYC</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ---------- Render Job ----------
  const renderJob = ({ item }) => (
    <View style={styles.jobCard}>
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.jobMeta}>💰 ₹{item.price}</Text>
      <Text style={styles.jobMeta}>📍 {item.distance} km</Text>
      <Text style={styles.jobMeta}>🕒 {item.time} min</Text>
    </View>
  );

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0b78ff" />
      </View>
    );

  return (
    <>
      <Sidebar />

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderJob}
        onRefresh={loadProfile}
        refreshing={refreshing}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>
              Welcome{profile?.name ? `, ${profile.name}` : ""} 👋
            </Text>

            <View style={styles.card}>
              <Text style={styles.label}>📞 Phone Verified</Text>
              <Text
                style={[
                  styles.value,
                  { color: profile?.isPhoneVerified ? "green" : "red" },
                ]}
              >
                {profile?.isPhoneVerified ? "Yes" : "No"}
              </Text>

              <Text style={styles.label}>🪪 KYC Level</Text>
              <Text style={styles.value}>{profile?.kycLevel ?? 0}</Text>

              <Text style={styles.label}>📋 Verification Status</Text>
              <Text style={styles.value}>
                {profile?.verificationStatus || "Unknown"}
              </Text>

              <Text style={styles.label}>✅ Profile Verified</Text>
              <Text
                style={[
                  styles.value,
                  { color: profile?.isVerified ? "green" : "orange" },
                ]}
              >
                {profile?.isVerified ? "Yes" : "No"}
              </Text>
            </View>

            <Text style={styles.sectionHeader}>📋 Available Jobs</Text>
          </>
        }
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#555", marginTop: 20 }}>
            No jobs available right now.
          </Text>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#0b4da0",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  label: { fontSize: 14, color: "#555", marginTop: 4 },
  value: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  jobTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
  jobMeta: { fontSize: 13, color: "#555", marginTop: 2 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 10,
    color: "#0b4da0",
  },
  logoutBtn: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    flexDirection: "row",
  },
  sidebar: {
    backgroundColor: "#fff",
    width: "70%",
    padding: 20,
    paddingTop: 36,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  menuItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
  menuText: { fontSize: 16, color: "#333" },
});

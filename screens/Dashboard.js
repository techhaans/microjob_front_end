
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { fetchDoerProfile, logoutDoer } from "../api/doer";

// export default function Dashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("authToken");
//       if (!token) {
//         navigation.replace("RoleSelect");
//         return;
//       }

//       const res = await fetchDoerProfile(token);
//       if (res?.status === "SUCCESS") setProfile(res.data);
//       else throw new Error("Profile not found");
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Unable to load profile. Please login again.");
//       await AsyncStorage.removeItem("authToken");
//       navigation.replace("RoleSelect");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logoutDoer();
//       await AsyncStorage.removeItem("authToken");
//       navigation.replace("LoginPage");
//     } catch (err) {
//       Alert.alert("Error", "Logout failed");
//     }
//   };

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   if (loading)
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text style={{ marginTop: 10 }}>Loading Dashboard...</Text>
//       </View>
//     );

//   if (!profile)
//     return (
//       <View style={styles.centered}>
//         <Text>No profile found.</Text>
//         <TouchableOpacity style={styles.btn} onPress={loadProfile}>
//           <Text style={styles.btnText}>Reload</Text>
//         </TouchableOpacity>
//       </View>
//     );

//   // Dummy jobs for UI
//   const jobs = [
//     { id: 1, title: "Pick up documents", price: 150, distance: 0.8, time: 20 },
//     { id: 2, title: "Bring groceries", price: 100, distance: 1.2, time: 30 },
//     { id: 3, title: "Clean garage", price: 200, distance: 1.5, time: 45 },
//   ];

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
//       {/* Profile Card */}
//       <View style={styles.profileCard}>
//         <Text style={styles.nameText}>Hi, {profile.fullName || "User"}!</Text>
//         <Text style={styles.infoText}>Email: {profile.email}</Text>
//         <Text style={styles.infoText}>Phone: {profile.phone || "Not added"}</Text>
//         <Text style={styles.infoText}>KYC: {profile.kycStatus || "PENDING"}</Text>
//         <Text style={styles.infoText}>
//           Skills: {profile.skills?.join(", ") || "No skills added"}
//         </Text>
//         <Text style={styles.infoText}>Bio: {profile.bio || "No bio available"}</Text>

//         {/* Buttons */}
//         <View style={styles.buttonGroup}>
//           <TouchableOpacity
//             style={[styles.btn, styles.editBtn]}
//             onPress={() => navigation.navigate("EditProfile", { profile })}
//           >
//             <Text style={styles.btnText}>EDIT PROFILE</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.btn, styles.viewBtn]}
//             onPress={() => navigation.navigate("DoerProfile", { profile })}
//           >
//             <Text style={styles.btnText}>VIEW PROFILE</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Jobs List */}
//       <Text style={styles.sectionTitle}>Available Jobs</Text>
//       {jobs.map((job) => (
//         <View key={job.id} style={styles.jobCard}>
//           <Text style={styles.jobTitle}>{job.title}</Text>
//           <Text style={styles.jobInfo}>💰 ₹{job.price}</Text>
//           <Text style={styles.jobInfo}>📍 {job.distance} km</Text>
//           <Text style={styles.jobInfo}>🕒 {job.time} min</Text>
//         </View>
//       ))}

//       {/* Logout */}
//       <TouchableOpacity style={[styles.btn, styles.logoutBtn]} onPress={handleLogout}>
//         <Text style={styles.btnText}>Logout</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 15, backgroundColor: "#f5f7fa" },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },

//   profileCard: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 20,
//     elevation: 3,
//   },
//   nameText: { fontSize: 22, fontWeight: "700", marginBottom: 10, color: "#333" },
//   infoText: { fontSize: 14, color: "#555", marginBottom: 4 },

//   buttonGroup: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
//   btn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginHorizontal: 5,
//     marginTop: 5,
//   },
//   editBtn: { backgroundColor: "#1976D2" },
//   viewBtn: { backgroundColor: "#4CAF50" },
//   logoutBtn: { backgroundColor: "#ff4d4d", marginTop: 20 },

//   sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10, color: "#333" },
//   jobCard: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 12,
//     elevation: 2,
//   },
//   jobTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4, color: "#333" },
//   jobInfo: { fontSize: 14, color: "#555" },
//   btnText: { color: "#fff", fontWeight: "700" },
// });


// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   ScrollView,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { fetchDoerProfile, logoutDoer } from "../api/doer";

// export default function Dashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//  const loadProfile = async () => {
//   try {
//     setLoading(true);
//     const token = await AsyncStorage.getItem("authToken");
//     if (!token) {
//       navigation.replace("RoleSelect");
//       return;
//     }

//     const res = await fetchDoerProfile(token);

//     if (res?.status === "SUCCESS") {
//       setProfile(res.data); // existing user
//     } else if (res?.message === "No Data") {
//       // NEW USER: Create a minimal profile with email
//       const email = await AsyncStorage.getItem("userEmail");
//       setProfile({
//         email,
//         fullName: "",
//         phone: "",
//         bio: "",
//         skills: [],
//         kycStatus: "PENDING",
//       });
//     } else {
//       throw new Error("Unable to fetch profile");
//     }
//   } catch (err) {
//     console.error(err);
//     Alert.alert("Error", "Unable to load profile. Please login again.");
//     await AsyncStorage.removeItem("authToken");
//     navigation.replace("RoleSelect");
//   } finally {
//     setLoading(false);
//   }
// };


//   const handleLogout = async () => {
//     try {
//       await logoutDoer();
//       await AsyncStorage.removeItem("authToken");
//       await AsyncStorage.removeItem("userEmail");
//       navigation.replace("LoginPage");
//     } catch (err) {
//       Alert.alert("Error", "Logout failed");
//     }
//   };

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   if (loading)
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text style={{ marginTop: 10 }}>Loading Dashboard...</Text>
//       </View>
//     );

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
//       {/* Profile Card */}
//       <View style={styles.profileCard}>
//         <Text style={styles.nameText}>
//           Hi, {profile.fullName || "New User"}!
//         </Text>
//         <Text style={styles.infoText}>Email: {profile.email}</Text>
//         <Text style={styles.infoText}>
//           Phone: {profile.phone || "Not added"}
//         </Text>
//         <Text style={styles.infoText}>
//           KYC: {profile.kycStatus || "PENDING"}
//         </Text>
//         <Text style={styles.infoText}>
//           Skills: {profile.skills?.join(", ") || "No skills added"}
//         </Text>
//         <Text style={styles.infoText}>Bio: {profile.bio || "No bio available"}</Text>

//         {/* Buttons */}
//         <View style={styles.buttonGroup}>
//           <TouchableOpacity
//             style={[styles.btn, styles.editBtn]}
//             onPress={() => navigation.navigate("EditProfile", { profile })}
//           >
//             <Text style={styles.btnText}>
//               {profile.fullName ? "EDIT PROFILE" : "COMPLETE PROFILE"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Dummy jobs */}
//       <Text style={styles.sectionTitle}>Available Jobs</Text>
//       {[1, 2, 3].map((i) => (
//         <View key={i} style={styles.jobCard}>
//           <Text style={styles.jobTitle}>Job {i}</Text>
//           <Text style={styles.jobInfo}>💰 ₹{i * 100}</Text>
//           <Text style={styles.jobInfo}>📍 {i * 1.2} km</Text>
//           <Text style={styles.jobInfo}>🕒 {i * 15} min</Text>
//         </View>
//       ))}

//       {/* Logout */}
//       <TouchableOpacity style={[styles.btn, styles.logoutBtn]} onPress={handleLogout}>
//         <Text style={styles.btnText}>Logout</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 15, backgroundColor: "#f5f7fa" },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },

//   profileCard: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 20,
//     elevation: 3,
//   },
//   nameText: { fontSize: 22, fontWeight: "700", marginBottom: 10, color: "#333" },
//   infoText: { fontSize: 14, color: "#555", marginBottom: 4 },

//   buttonGroup: { flexDirection: "row", justifyContent: "flex-start", marginTop: 10 },
//   btn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginHorizontal: 5,
//     marginTop: 5,
//   },
//   editBtn: { backgroundColor: "#1976D2" },
//   logoutBtn: { backgroundColor: "#ff4d4d", marginTop: 20 },

//   sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10, color: "#333" },
//   jobCard: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 12,
//     elevation: 2,
//   },
//   jobTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4, color: "#333" },
//   jobInfo: { fontSize: 14, color: "#555" },
//   btnText: { color: "#fff", fontWeight: "700" },
// });


// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   ScrollView,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { fetchDoerProfile, logoutDoer } from "../api/doer";

// export default function Dashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("authToken");
//       if (!token) {
//         navigation.replace("RoleSelect");
//         return;
//       }

//       const res = await fetchDoerProfile(token);

//       if (res?.status === "SUCCESS") {
//         setProfile(res.data); // existing user
//       } else if (res?.message === "No Data") {
//         // NEW USER: Create a minimal profile with email
//         const email = await AsyncStorage.getItem("userEmail");
//         setProfile({
//           email,
//           fullName: "",
//           phone: "",
//           bio: "",
//           skills: [],
//           kycStatus: "PENDING",
//         });
//       } else {
//         throw new Error("Unable to fetch profile");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Unable to load profile. Please login again.");
//       await AsyncStorage.removeItem("authToken");
//       navigation.replace("RoleSelect");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logoutDoer();
//       await AsyncStorage.multiRemove(["authToken", "userEmail"]);
//       navigation.replace("LoginPage");
//     } catch (err) {
//       Alert.alert("Error", "Logout failed");
//     }
//   };

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   if (loading)
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text style={{ marginTop: 10 }}>Loading Dashboard...</Text>
//       </View>
//     );

//   if (!profile)
//     return (
//       <View style={styles.centered}>
//         <Text>No profile found.</Text>
//         <TouchableOpacity style={styles.btn} onPress={loadProfile}>
//           <Text style={styles.btnText}>Reload</Text>
//         </TouchableOpacity>
//       </View>
//     );

//   return (
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={{ paddingBottom: 40 }}
//     >
//       {/* Profile Card */}
//       <View style={styles.profileCard}>
//         <Text style={styles.nameText}>
//           Hi, {profile.fullName || "New User"}!
//         </Text>
//         <Text style={styles.infoText}>Email: {profile.email}</Text>
//         <Text style={styles.infoText}>
//           Phone: {profile.phone || "Not added"}
//         </Text>
//         <Text style={styles.infoText}>
//           KYC: {profile.kycStatus || "PENDING"}
//         </Text>
//         <Text style={styles.infoText}>
//           Skills: {profile.skills?.join(", ") || "No skills added"}
//         </Text>
//         <Text style={styles.infoText}>Bio: {profile.bio || "No bio available"}</Text>

//         {/* Buttons */}
//         <View style={styles.buttonGroup}>
//           <TouchableOpacity
//             style={[styles.btn, styles.editBtn]}
//             onPress={() => navigation.navigate("EditProfile", { profile })}
//           >
//             <Text style={styles.btnText}>
//               {profile.fullName ? "EDIT PROFILE" : "COMPLETE PROFILE"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Dummy jobs */}
//       <Text style={styles.sectionTitle}>Available Jobs</Text>
//       {[1, 2, 3].map((i) => (
//         <View key={i} style={styles.jobCard}>
//           <Text style={styles.jobTitle}>Job {i}</Text>
//           <Text style={styles.jobInfo}>💰 ₹{i * 100}</Text>
//           <Text style={styles.jobInfo}>📍 {i * 1.2} km</Text>
//           <Text style={styles.jobInfo}>🕒 {i * 15} min</Text>
//         </View>
//       ))}

//       {/* Logout */}
//       <TouchableOpacity
//         style={[styles.btn, styles.logoutBtn]}
//         onPress={handleLogout}
//       >
//         <Text style={styles.btnText}>Logout</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 15, backgroundColor: "#f5f7fa" },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },

//   profileCard: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 20,
//     elevation: 3,
//   },
//   nameText: { fontSize: 22, fontWeight: "700", marginBottom: 10, color: "#333" },
//   infoText: { fontSize: 14, color: "#555", marginBottom: 4 },

//   buttonGroup: { flexDirection: "row", justifyContent: "flex-start", marginTop: 10 },
//   btn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginHorizontal: 5,
//     marginTop: 5,
//   },
//   editBtn: { backgroundColor: "#1976D2" },
//   logoutBtn: { backgroundColor: "#ff4d4d", marginTop: 20 },

//   sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10, color: "#333" },
//   jobCard: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 12,
//     elevation: 2,
//   },
//   jobTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4, color: "#333" },
//   jobInfo: { fontSize: 14, color: "#555" },
//   btnText: { color: "#fff", fontWeight: "700" },
// });
//fetch detailss corret
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   ScrollView,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { fetchDoerProfile, logoutDoer } from "../api/doer";

// export default function Dashboard({ navigation }) {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const loadProfile = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("authToken");
//       if (!token) {
//         navigation.replace("RoleSelect");
//         return;
//       }

//       const res = await fetchDoerProfile(token);

//       if (res?.status === "SUCCESS") {
//         setProfile(res.data); // Existing user
//       } else if (res?.message === "No Data") {
//         // NEW USER: minimal profile
//         const email = await AsyncStorage.getItem("userEmail");
//         setProfile({
//           email,
//           fullName: "",
//           phone: "",
//           bio: "",
//           skills: [],
//           kycStatus: "PENDING",
//         });
//       } else {
//         throw new Error("Unable to fetch profile");
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Unable to load profile. Please login again.");
//       await AsyncStorage.removeItem("authToken");
//       navigation.replace("RoleSelect");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logoutDoer();
//       await AsyncStorage.removeItem("authToken");
//       await AsyncStorage.removeItem("userEmail");
//       navigation.replace("LoginPage");
//     } catch (err) {
//       Alert.alert("Error", "Logout failed");
//     }
//   };

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   if (loading)
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text style={{ marginTop: 10 }}>Loading Dashboard...</Text>
//       </View>
//     );

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
//       {/* Profile Card */}
//       <View style={styles.profileCard}>
//         <Text style={styles.nameText}>
//           Hi, {profile.fullName || "New User"}!
//         </Text>
//         <Text style={styles.infoText}>Email: {profile.email}</Text>
//         <Text style={styles.infoText}>
//           Phone: {profile.phone || "Not added"}
//         </Text>
//         <Text style={styles.infoText}>
//           KYC: {profile.kycStatus || "PENDING"}
//         </Text>
//         <Text style={styles.infoText}>
//           Skills: {profile.skills?.join(", ") || "No skills added"}
//         </Text>
//         <Text style={styles.infoText}>Bio: {profile.bio || "No bio available"}</Text>

//         {/* Buttons */}
//         <View style={styles.buttonGroup}>
//           <TouchableOpacity
//             style={[styles.btn, styles.editBtn]}
//             onPress={() =>
//               navigation.navigate("EditProfile", {
//                 profile,
//                 isNewUser: !profile.fullName,
//                 onProfileSaved: loadProfile, // refresh dashboard after save
//               })
//             }
//           >
//             <Text style={styles.btnText}>
//               {profile.fullName ? "EDIT PROFILE" : "COMPLETE PROFILE"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Dummy jobs */}
//       <Text style={styles.sectionTitle}>Available Jobs</Text>
//       {[1, 2, 3].map((i) => (
//         <View key={i} style={styles.jobCard}>
//           <Text style={styles.jobTitle}>Job {i}</Text>
//           <Text style={styles.jobInfo}>💰 ₹{i * 100}</Text>
//           <Text style={styles.jobInfo}>📍 {i * 1.2} km</Text>
//           <Text style={styles.jobInfo}>🕒 {i * 15} min</Text>
//         </View>
//       ))}

//       {/* Logout */}
//       <TouchableOpacity style={[styles.btn, styles.logoutBtn]} onPress={handleLogout}>
//         <Text style={styles.btnText}>Logout</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 15, backgroundColor: "#f5f7fa" },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },

//   profileCard: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 20,
//     elevation: 3,
//   },
//   nameText: { fontSize: 22, fontWeight: "700", marginBottom: 10, color: "#333" },
//   infoText: { fontSize: 14, color: "#555", marginBottom: 4 },

//   buttonGroup: { flexDirection: "row", justifyContent: "flex-start", marginTop: 10 },
//   btn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginHorizontal: 5,
//     marginTop: 5,
//   },
//   editBtn: { backgroundColor: "#1976D2" },
//   logoutBtn: { backgroundColor: "#ff4d4d", marginTop: 20 },

//   sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10, color: "#333" },
//   jobCard: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 12,
//     elevation: 2,
//   },
//   jobTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4, color: "#333" },
//   jobInfo: { fontSize: 14, color: "#555" },
//   btnText: { color: "#fff", fontWeight: "700" },
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
//     try {
//       const storedProfile = await AsyncStorage.getItem("doerProfile");
//       if (storedProfile) {
//         setProfile(JSON.parse(storedProfile));
//       } else {
//         navigation.reset({ index: 0, routes: [{ name: "EditProfile" }] });
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
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={{ paddingBottom: 30 }}
//     >
//       {/* User Info */}
//       <View style={styles.header}>
//         <Text style={styles.name}>Hi, {profile?.name || "User"}</Text>
//         <View style={styles.buttonGroup}>
//           <TouchableOpacity
//             style={[styles.profileBtn, styles.editBtn]}
//             onPress={() => navigation.navigate("EditProfile", { profile })}
//           >
//             <Text style={styles.profileBtnText}>EDIT PROFILE</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.profileBtn, styles.viewBtn]}
//             onPress={() => navigation.navigate("DoerProfile", { profile })}
//           >
//             <Text style={styles.profileBtnText}>VIEW PROFILE</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Bio Section */}
//       <View style={styles.bioSection}>
//         <Text style={styles.bioText}>{profile?.bio || "No bio available"}</Text>
//         <Text style={styles.bioText}>
//           Skills: {profile?.skills?.join(", ") || "No skills"}
//         </Text>
//       </View>

//       {/* Jobs List */}
//       <Text style={styles.sectionTitle}>Available Jobs</Text>
//       {jobs.map((job) => (
//         <View key={job.id} style={styles.jobCard}>
//           <Text style={styles.jobTitle}>{job.title}</Text>
//           <Text style={styles.jobInfo}>💰 ₹{job.price}</Text>
//           <Text style={styles.jobInfo}>📍 {job.distance} km</Text>
//           <Text style={styles.jobInfo}>🕒 {job.time} min</Text>
//         </View>
//       ))}

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

//   header: { marginBottom: 20 },
//   name: { fontSize: 24, fontWeight: "700", color: "#333", marginBottom: 15 },

//   buttonGroup: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
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
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Dashboard({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const loadProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem("doerProfile");
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("doerProfile");
    navigation.reset({ index: 0, routes: [{ name: "RoleSelect" }] });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  // Sample jobs (dummy data)
  const jobs = [
    { id: 1, title: "Pick up documents", price: 150, distance: 0.8, time: 20 },
    { id: 2, title: "Bring groceries", price: 100, distance: 1.2, time: 30 },
    { id: 3, title: "Clean garage", price: 200, distance: 1.5, time: 45 },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* First-time user */}
      {!profile ? (
        <View style={styles.centerContent}>
          <Text style={styles.welcomeText}>
            Welcome! Complete your profile to continue.
          </Text>
          <TouchableOpacity
            style={[styles.profileBtn, styles.editBtn]}
            onPress={() => navigation.replace("EditProfile")}
          >
            <Text style={styles.profileBtnText}>Complete Profile</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* User Info */}
          <View style={styles.header}>
            <Text style={styles.name}>Hi, {profile?.name || "User"}</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.profileBtn, styles.editBtn]}
                onPress={() => navigation.navigate("EditProfile", { profile })}
              >
                <Text style={styles.profileBtnText}>EDIT PROFILE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.profileBtn, styles.viewBtn]}
                onPress={() => navigation.navigate("DoerProfile", { profile })}
              >
                <Text style={styles.profileBtnText}>VIEW PROFILE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bio Section */}
          <View style={styles.bioSection}>
            <Text style={styles.bioText}>{profile?.bio || "No bio available"}</Text>
            <Text style={styles.bioText}>
              Skills: {profile?.skills?.join(", ") || "No skills"}
            </Text>
          </View>

          {/* Jobs List */}
          <Text style={styles.sectionTitle}>Available Jobs</Text>
          {jobs.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobInfo}>💰 ₹{job.price}</Text>
              <Text style={styles.jobInfo}>📍 {job.distance} km</Text>
              <Text style={styles.jobInfo}>🕒 {job.time} min</Text>
            </View>
          ))}
        </>
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f7fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  centerContent: { alignItems: "center", marginVertical: 40 },

  welcomeText: { fontSize: 18, textAlign: "center", marginBottom: 20 },

  header: { marginBottom: 20 },
  name: { fontSize: 24, fontWeight: "700", color: "#333", marginBottom: 15 },

  buttonGroup: { flexDirection: "row", justifyContent: "flex-start" },
  profileBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  editBtn: { backgroundColor: "#1976D2" },
  viewBtn: { backgroundColor: "#4CAF50" },
  profileBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  bioSection: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  bioText: { fontSize: 16, color: "#555", marginBottom: 5 },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  jobCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  jobTitle: { fontSize: 16, fontWeight: "600", marginBottom: 5, color: "#333" },
  jobInfo: { fontSize: 14, color: "#555", marginBottom: 2 },

  logoutBtn: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  logoutBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
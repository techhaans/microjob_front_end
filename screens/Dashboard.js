

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
//             style={styles.profileBtn}
//             onPress={() => navigation.navigate("EditProfile", { profile })}
//           >
//             <Text style={styles.profileBtnText}>EDIT PROFILE</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.profileBtn}
//             onPress={() => navigation.navigate("DoerProfile")}
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

//   header: {
//     marginBottom: 20,
//   },
//   name: { fontSize: 24, fontWeight: "700", color: "#333", marginBottom: 15 },

//   buttonGroup: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 10,
//   },
//   profileBtn: {
//     flex: 1,
//     paddingVertical: 10,
//     borderRadius: 10,
//     alignItems: "center",
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
        navigation.reset({ index: 0, routes: [{ name: "EditProfile" }] });
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
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

  header: { marginBottom: 20 },
  name: { fontSize: 24, fontWeight: "700", color: "#333", marginBottom: 15 },

  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
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

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
//   TouchableOpacity,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";

// const BASE_URL = "http://192.168.60.218:8080/api";

// export default function SuperAdminDashboard({ navigation }) {
//   const [doers, setDoers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loadingMore, setLoadingMore] = useState(false);

//   useEffect(() => {
//     fetchDoers(0, true);
//   }, []);

//   // 🔹 Fetch Doers API
//   const fetchDoers = async (pageNum = 0, reset = false) => {
//     if (pageNum > totalPages && !reset) return;

//     if (reset) setLoading(true);
//     else setLoadingMore(true);

//     try {
//       const token = await AsyncStorage.getItem("superAdminToken");
//       if (!token) {
//         Alert.alert("Access Denied", "Please login again.");
//         return navigation.replace("SuperAdminLogin");
//       }

//       const res = await axios.get(
//         `${BASE_URL}/admin/kyc/all_doers?page=${pageNum}&size=5&sort=createdAt&sort=asc`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const data = res.data?.data;
//       if (!data) throw new Error("Invalid response");

//       if (reset) setDoers(data.content || []);
//       else setDoers((prev) => [...prev, ...(data.content || [])]);

//       setPage(data.page);
//       setTotalPages(data.totalPages);
//     } catch (err) {
//       console.error("Fetch Doers Error:", err.response?.data || err.message);
//       Alert.alert("Error", "Failed to fetch doers.");
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   };

//   const handleLogout = async () => {
//     await AsyncStorage.removeItem("superAdminToken");
//     navigation.replace("RoleSelect");
//   };

//   const handleRegisterNavigation = async () => {
//     const token = await AsyncStorage.getItem("superAdminToken");
//     if (!token) {
//       Alert.alert("Access Denied", "Super Admin must login first");
//       return navigation.replace("SuperAdminLogin");
//     }
//     navigation.navigate("AdminRegister");
//   };

//   if (loading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2196f3" />
//         <Text style={{ marginTop: 10 }}>Loading doers...</Text>
//       </View>
//     );

//   return (
//     <ScrollView style={styles.container}>
//       <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
//         <Text style={styles.logoutText}>Logout</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.registerBtn}
//         onPress={handleRegisterNavigation}
//       >
//         <Text style={styles.registerText}>Register New Admin</Text>
//       </TouchableOpacity>

//       <Text style={styles.title}>All Doers</Text>

//       {doers.length === 0 ? (
//         <Text style={styles.empty}>No doers found</Text>
//       ) : (
//         doers.map((d) => (
//           <View key={d.userId} style={styles.card}>
//             <Text style={styles.name}>{d.name}</Text>
//             <Text>Bio: {d.bio || "N/A"}</Text>
//             <Text>Skills: {d.skills?.join(", ") || "N/A"}</Text>
//             <Text>KYC Level: {d.kycLevel}</Text>
//             <Text>Status: {d.verificationStatus}</Text>
//             <Text>Verified: {d.isVerified ? "✅ Yes" : "❌ No"}</Text>
//           </View>
//         ))
//       )}

//       {page < totalPages - 1 && (
//         <TouchableOpacity
//           style={styles.loadMoreBtn}
//           onPress={() => fetchDoers(page + 1)}
//           disabled={loadingMore}
//         >
//           <Text style={styles.loadMoreText}>
//             {loadingMore ? "Loading..." : "Load More"}
//           </Text>
//         </TouchableOpacity>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 15, backgroundColor: "#f0f4f7" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   title: { fontSize: 22, fontWeight: "bold", marginVertical: 15 },
//   card: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 15,
//   },
//   name: { fontSize: 18, fontWeight: "600" },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
//   logoutBtn: {
//     alignSelf: "flex-end",
//     backgroundColor: "#ff3b30",
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   registerBtn: {
//     backgroundColor: "#4caf50",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 15,
//     alignItems: "center",
//   },
//   registerText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
//   loadMoreBtn: {
//     backgroundColor: "#2196f3",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 20,
//     alignItems: "center",
//   },
//   loadMoreText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://192.168.60.218:8080/api";

export default function SuperAdminDashboard({ navigation }) {
  const [kycType, setKycType] = useState("DOER"); // "DOER" or "POSTER"
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchKycData("DOER");
  }, []);

  // 🔹 Fetch KYC data based on type
  const fetchKycData = async (type) => {
    setKycType(type);
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("superAdminToken");
      if (!token) {
        Alert.alert("Access Denied", "Please login again.");
        return navigation.replace("SuperAdminLogin");
      }

      const endpoint =
        type === "DOER"
          ? `${BASE_URL}/admin/kyc/all_doers?page=0&size=10&sort=createdAt&sort=asc`
          : `${BASE_URL}/admin/kyc/all_posters?page=0&size=10&sort=createdAt&sort=asc`;

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const content = res.data?.data?.content || [];
      setDataList(content);
    } catch (err) {
      console.error("Fetch KYC Error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to load KYC data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("superAdminToken");
    navigation.replace("RoleSelect");
  };

  const handleRegisterNavigation = async () => {
    const token = await AsyncStorage.getItem("superAdminToken");
    if (!token) {
      Alert.alert("Access Denied", "Super Admin must login first");
      return navigation.replace("SuperAdminLogin");
    }
    navigation.navigate("AdminRegister");
  };

  return (
    <ScrollView style={styles.container}>
      {/* 🔹 Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* 🔹 Register Admin */}
      <TouchableOpacity
        style={styles.registerBtn}
        onPress={handleRegisterNavigation}
      >
        <Text style={styles.registerText}>Register New Admin</Text>
      </TouchableOpacity>

      {/* 🔹 KYC Switch Buttons */}
      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[
            styles.switchBtn,
            kycType === "DOER" && styles.activeSwitchBtn,
          ]}
          onPress={() => fetchKycData("DOER")}
        >
          <Text
            style={[
              styles.switchText,
              kycType === "DOER" && styles.activeSwitchText,
            ]}
          >
            👷 View Doer KYC
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.switchBtn,
            kycType === "POSTER" && styles.activeSwitchBtn,
          ]}
          onPress={() => fetchKycData("POSTER")}
        >
          <Text
            style={[
              styles.switchText,
              kycType === "POSTER" && styles.activeSwitchText,
            ]}
          >
            📢 View Poster KYC
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>
        {kycType === "DOER" ? "All Doers" : "All Posters"}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2196f3" style={{ marginTop: 20 }} />
      ) : dataList.length === 0 ? (
        <Text style={styles.empty}>No {kycType.toLowerCase()}s found</Text>
      ) : (
        dataList.map((item, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            {kycType === "DOER" ? (
              <>
                <Text>Bio: {item.bio || "N/A"}</Text>
                <Text>Skills: {item.skills?.join(", ") || "N/A"}</Text>
                <Text>KYC Level: {item.kycLevel}</Text>
                <Text>Status: {item.verificationStatus}</Text>
                <Text>Verified: {item.isVerified ? "✅ Yes" : "❌ No"}</Text>
              </>
            ) : (
              <>
                <Text>Email: {item.email}</Text>
                <Text>Phone: {item.phone}</Text>
                <Text>About: {item.about || "N/A"}</Text>
                <Text>KYC Status: {item.KycStatus ? "✅ Verified" : "❌ Pending"}</Text>
                {item.addresses && item.addresses.length > 0 && (
                  <Text>
                    Address: {item.addresses[0].area} ({item.addresses[0].pinCode})
                  </Text>
                )}
              </>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f0f4f7" },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 15 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  name: { fontSize: 18, fontWeight: "600" },
  empty: { fontSize: 16, color: "gray", marginVertical: 10 },
  logoutBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#ff3b30",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  registerBtn: {
    backgroundColor: "#4caf50",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  registerText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  switchBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
  },
  activeSwitchBtn: {
    backgroundColor: "#2196f3",
  },
  switchText: { fontWeight: "bold", color: "#333" },
  activeSwitchText: { color: "#fff" },
});

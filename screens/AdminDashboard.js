// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Alert,
//   Modal,
//   TextInput,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";

// const BASE_URL = "http://192.168.1.6:8080/api";

// export default function AdminKycScreen({ navigation }) {
//   const [kycList, setKycList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(0);
//   const [rejectModalVisible, setRejectModalVisible] = useState(false);
//   const [rejectReason, setRejectReason] = useState("");
//   const [selectedId, setSelectedId] = useState(null);

//   const size = 20;

//   useEffect(() => {
//     fetchPendingKyc(page);
//   }, [page]);

//   // ---------------- FETCH PENDING KYC ----------------
//   const fetchPendingKyc = async (pageNo = 0) => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return navigation.replace("AdminLogin");

//       const res = await axios.get(
//         `${BASE_URL}/admin/kyc/pending?page=${pageNo}&size=${size}&sort=createdAt,DESC`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setKycList(res.data.data.content || []);
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//       Alert.alert("Error", "Failed to fetch KYC requests");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------------- APPROVE KYC ----------------
//   const approveKyc = async (id) => {
//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       await axios.post(
//         `${BASE_URL}/admin/kyc/${id}/approve`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       Alert.alert("Success", "KYC Approved");
//       fetchPendingKyc(page);
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//       Alert.alert("Error", "Failed to approve KYC");
//     }
//   };

//   // ---------------- OPEN REJECT MODAL ----------------
//   const openRejectModal = (id) => {
//     setSelectedId(id);
//     setRejectModalVisible(true);
//   };

//   // ---------------- SUBMIT REJECT ----------------
//   const handleReject = async () => {
//     if (!rejectReason.trim()) {
//       Alert.alert("Error", "Please enter a reason");
//       return;
//     }
//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       await axios.post(
//         `${BASE_URL}/admin/kyc/${selectedId}/reject?reason=${encodeURIComponent(
//           rejectReason
//         )}`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       Alert.alert("Success", "KYC Rejected");
//       setRejectReason("");
//       setRejectModalVisible(false);
//       fetchPendingKyc(page);
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//       Alert.alert("Error", "Failed to reject KYC");
//     }
//   };

//   // ---------------- LOGOUT ----------------
//   const handleLogout = async () => {
//     await AsyncStorage.removeItem("adminToken");
//     navigation.replace("RoleSelect");
//   };

//   if (loading) {
//     return <ActivityIndicator size="large" style={{ flex: 1 }} color="#2196f3" />;
//   }

//   return (
//     <ScrollView style={styles.container}>
//       {/* Logout Button */}
//       <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
//         <Text style={styles.logoutText}>Logout</Text>
//       </TouchableOpacity>

//       <Text style={styles.title}>Pending KYC Requests</Text>
//       {kycList.length === 0 ? (
//         <Text style={styles.empty}>No pending KYC requests</Text>
//       ) : (
//         kycList.map((kyc) => (
//           <View key={kyc.id} style={styles.card}>
//             <Text style={styles.name}>Name: {kyc.userName}</Text>
//             <Text>Phone: {kyc.userPhone}</Text>
//             <Text>Document Type: {kyc.docType}</Text>
//             <Text>Status: {kyc.status}</Text>

//             <View style={styles.actions}>
//               <TouchableOpacity
//                 style={styles.approveBtn}
//                 onPress={() => approveKyc(kyc.id)}
//               >
//                 <Text style={styles.btnText}>Approve</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.rejectBtn}
//                 onPress={() => openRejectModal(kyc.id)}
//               >
//                 <Text style={styles.btnText}>Reject</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         ))
//       )}

//       {/* Reject Modal */}
//       <Modal
//         visible={rejectModalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setRejectModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalBox}>
//             <Text style={styles.modalTitle}>Reject KYC</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter rejection reason"
//               value={rejectReason}
//               onChangeText={setRejectReason}
//             />
//             <View style={styles.modalActions}>
//               <TouchableOpacity
//                 style={styles.cancelBtn}
//                 onPress={() => setRejectModalVisible(false)}
//               >
//                 <Text style={styles.btnText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.confirmBtn} onPress={handleReject}>
//                 <Text style={styles.btnText}>Submit</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 15, backgroundColor: "#f0f4f7" },
//   title: { fontSize: 22, fontWeight: "bold", marginVertical: 15 },
//   card: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 15 },
//   name: { fontSize: 18, fontWeight: "600" },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
//   actions: { flexDirection: "row", marginTop: 10 },
//   approveBtn: {
//     flex: 1,
//     backgroundColor: "green",
//     padding: 10,
//     borderRadius: 8,
//     marginRight: 5,
//     alignItems: "center",
//   },
//   rejectBtn: {
//     flex: 1,
//     backgroundColor: "red",
//     padding: 10,
//     borderRadius: 8,
//     marginLeft: 5,
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "bold" },

//   // Logout button
//   logoutBtn: {
//     alignSelf: "flex-end",
//     backgroundColor: "#ff3b30",
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

//   // Modal
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   modalBox: {
//     width: "80%",
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 20,
//   },
//   modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//   },
//   modalActions: { flexDirection: "row", justifyContent: "flex-end" },
//   cancelBtn: {
//     backgroundColor: "gray",
//     padding: 10,
//     borderRadius: 8,
//     marginRight: 10,
//   },
//   confirmBtn: {
//     backgroundColor: "red",
//     padding: 10,
//     borderRadius: 8,
//   },
// });

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://192.168.1.6:8080/api";

export default function AdminDashboard({ navigation }) {
  const [kycList, setKycList] = useState([]); // always array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingKyc();
  }, []);

  const fetchPendingKyc = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("adminToken");
      if (!token) return navigation.replace("AdminLogin");

      const res = await axios.get(`${BASE_URL}/admin/kyc/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("KYC API Response:", res.data);

      // Safely extract array
      let list = [];
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (Array.isArray(res.data.data)) {
        list = res.data.data;
      } else {
        list = []; // fallback
      }

      setKycList(list);
    } catch (err) {
      console.error("Fetch KYC Error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch KYC requests");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("adminToken");
    navigation.replace("RoleSelect");
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" style={{ flex: 1 }} color="#2196f3" />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Pending KYC Requests</Text>

      {kycList.length === 0 ? (
        <Text style={styles.empty}>No pending KYC requests</Text>
      ) : (
        kycList.map((kyc) => (
          <TouchableOpacity
            key={kyc.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("AdminKycDetail", { kycId: kyc.id })
            }
          >
            <Text style={styles.name}>Name: {kyc.userName || "N/A"}</Text>
            <Text>Phone: {kyc.userPhone || "N/A"}</Text>
            <Text>Document Type: {kyc.docType || "N/A"}</Text>
            <Text>Status: {kyc.status || "N/A"}</Text>
            <Text style={styles.viewText}>Tap to view details</Text>
          </TouchableOpacity>
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
  viewText: { marginTop: 10, color: "#2196f3", fontWeight: "600" },
  logoutBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#ff3b30",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  logoutText: { color: "#fff", fontWeight: "bold" },
});

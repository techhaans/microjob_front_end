// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   ActivityIndicator,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import AdminKycCard from "../screens/AdminKycCard";

// const BASE_URL = "http://192.168.60.218:8080/api"; // ✅ Fixed URL

// export default function AdminKycScreen({ navigation }) {
//   const [kycList, setKycList] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchPendingKyc();
//   }, []);

//   const fetchPendingKyc = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       if (!token) return navigation.replace("AdminLogin");

//       const res = await axios.get(`${BASE_URL}/admin/kyc/pending`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setKycList(res.data.data || []);
//     } catch (err) {
//       console.error(err.response?.data || err.message);
//       Alert.alert("Error", "Failed to fetch KYC requests");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading)
//     return <ActivityIndicator size="large" style={{ flex: 1 }} color="#2196f3" />;

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Pending KYC Requests</Text>
//       {kycList.length === 0 ? (
//         <Text style={styles.empty}>No pending KYC requests</Text>
//       ) : (
//         kycList.map((kyc) => (
//           <AdminKycCard
//             key={kyc.id}
//             kyc={kyc}
//             onPress={() =>
//               navigation.navigate("AdminKycDetail", { kycId: kyc.id })
//             }
//           />
//         ))
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 15, backgroundColor: "#f0f4f7" },
//   title: { fontSize: 22, fontWeight: "bold", marginVertical: 15 },
//   empty: { fontSize: 16, color: "gray", marginVertical: 10 },
// });


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { getPendingKycs, approveKyc, rejectKyc } from "../api/admin";

export default function AdminKycScreen({ navigation }) {
  const [kycs, setKycs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPendingKycs = async () => {
    try {
      setLoading(true);
      const data = await getPendingKycs();
      setKycs(data);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveKyc(id);
      Alert.alert("Success", "KYC approved successfully!");
      loadPendingKycs();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleReject = async (id) => {
    Alert.prompt(
      "Reject Reason",
      "Please enter reason for rejection",
      async (reason) => {
        if (!reason) return;
        try {
          await rejectKyc(id, reason);
          Alert.alert("Rejected", "KYC rejected successfully!");
          loadPendingKycs();
        } catch (err) {
          Alert.alert("Error", err.message);
        }
      }
    );
  };

  useEffect(() => {
    loadPendingKycs();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.userName}</Text>
      <Text>Phone: {item.userPhone}</Text>
      <Text>Document: {item.docType}</Text>

      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#4CAF50" }]}
          onPress={() => handleApprove(item.id)}
        >
          <Text style={styles.btnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#F44336" }]}
          onPress={() => handleReject(item.id)}
        >
          <Text style={styles.btnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending KYC Approvals</Text>
      {kycs.length === 0 ? (
        <Text style={styles.noData}>No pending KYCs</Text>
      ) : (
        <FlatList
          data={kycs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshing={loading}
          onRefresh={loadPendingKycs}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f8f9fa" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 10, textAlign: "center" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: "700" },
  btnRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  btn: {
    flex: 0.48,
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  noData: { textAlign: "center", marginTop: 30, fontSize: 16, color: "#666" },
});

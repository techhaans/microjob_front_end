// import React, { useEffect, useState } from "react";
// import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
// import { fetchPendingKyc, approveKyc, rejectKyc, downloadKycFile } from "../api/admin.js";

// export default function AdminKycScreen() {
//   const [kycList, setKycList] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => { loadKyc(); }, []);

//   const loadKyc = async () => {
//     setLoading(true);
//     try {
//       const res = await fetchPendingKyc();
//       setKycList(res.data || []);
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to fetch KYC");
//     } finally { setLoading(false); }
//   };

//   const handleApprove = async (id) => { await approveKyc(id); loadKyc(); };
//   const handleReject = async (id) => { await rejectKyc(id); loadKyc(); };
//   const handleDownload = async (id) => {
//     try {
//       const res = await downloadKycFile(id);
//       Alert.alert("Downloaded", "File downloaded successfully (handle blob saving separately)");
//     } catch (err) { console.error(err); Alert.alert("Error", "Failed to download"); }
//   };

//   if (loading) return <ActivityIndicator size="large" style={{ flex:1, justifyContent:"center" }} />;

//   return (
//     <ScrollView style={styles.container}>
//       {kycList.map(k => (
//         <View key={k.id} style={styles.card}>
//           <Text>Name: {k.name}</Text>
//           <Text>Email: {k.email}</Text>
//           <View style={{ flexDirection:"row", marginTop:10 }}>
//             <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(k.id)}><Text style={{color:"#fff"}}>Approve</Text></TouchableOpacity>
//             <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(k.id)}><Text style={{color:"#fff"}}>Reject</Text></TouchableOpacity>
//             <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload(k.id)}><Text style={{color:"#fff"}}>Download</Text></TouchableOpacity>
//           </View>
//         </View>
//       ))}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container:{ flex:1, padding:20, backgroundColor:"#f0f4f7" },
//   card:{ backgroundColor:"#fff", padding:15, borderRadius:12, marginBottom:15 },
//   approveBtn:{ backgroundColor:"green", padding:10, borderRadius:8, marginRight:5 },
//   rejectBtn:{ backgroundColor:"red", padding:10, borderRadius:8, marginRight:5 },
//   downloadBtn:{ backgroundColor:"blue", padding:10, borderRadius:8 }
// });

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import AdminKycCard from "../screens/AdminKycCard"; // import your card component

const BASE_URL = "http://192.168.1.6:8080/api";

export default function AdminKycScreen({ navigation }) {
  const [kycList, setKycList] = useState([]);
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

      setKycList(res.data.data || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch KYC requests");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pending KYC Requests</Text>
      {kycList.length === 0 ? (
        <Text style={styles.empty}>No pending KYC requests</Text>
      ) : (
        kycList.map((kyc) => (
          <AdminKycCard
            key={kyc.id}
            kyc={kyc}
            onPress={() =>
              navigation.navigate("AdminDoerProfile", { doerId: kyc.id })
            }
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f0f4f7" },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 15 },
  empty: { fontSize: 16, color: "gray", marginVertical: 10 },
});

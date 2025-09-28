// import React, { useEffect, useState } from "react";
// import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { fetchDoerById, approveKYC, rejectKYC } from "../api/admin.js";

// export default function AdminDoerProfile({ route, navigation }) {
//   const { doerId } = route.params;
//   const [doer, setDoer] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [rejectReason, setRejectReason] = useState("");

//   useEffect(() => {
//     loadDoer();
//   }, []);

//   const loadDoer = async () => {
//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       const res = await fetchDoerById(token, doerId);
//       setDoer(res.data);
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Cannot fetch doer data");
//     }
//   };

//   const handleApprove = async () => {
//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       await approveKYC(token, doerId);
//       Alert.alert("Success", "KYC Approved");
//       loadDoer();
//     } catch (err) {
//       Alert.alert("Error", err.response?.data?.message || err.message);
//     }
//   };

//   const handleReject = async () => {
//     if (!rejectReason.trim()) {
//       Alert.alert("Validation", "Please enter a reason for rejection");
//       return;
//     }

//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       await rejectKYC(token, doerId, rejectReason); // send reason to backend
//       Alert.alert("Success", "KYC Rejected");
//       setModalVisible(false);
//       setRejectReason("");
//       loadDoer();
//     } catch (err) {
//       Alert.alert("Error", err.response?.data?.message || err.message);
//     }
//   };

//   if (!doer) return <Text>Loading...</Text>;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.name}>{doer.name}</Text>
//       <Text style={styles.email}>{doer.email}</Text>
//       <Text>Phone: {doer.phone}</Text>
//       <Text>KYC Status: {doer.kycVerified ? "Approved" : "Pending"}</Text>

//       {doer.kycImage && (
//         <Image source={{ uri: doer.kycImage }} style={styles.kycImage} />
//       )}

//       {!doer.kycVerified && (
//         <View style={styles.btnRow}>
//           <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
//             <Text style={styles.btnText}>Approve</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.rejectBtn}
//             onPress={() => setModalVisible(true)}
//           >
//             <Text style={styles.btnText}>Reject</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Modal for Reject Reason */}
//       <Modal visible={modalVisible} transparent animationType="slide">
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Reason for Rejection</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter reason..."
//               value={rejectReason}
//               onChangeText={setRejectReason}
//             />
//             <View style={styles.modalBtnRow}>
//               <TouchableOpacity
//                 style={[styles.modalBtn, { backgroundColor: "red" }]}
//                 onPress={handleReject}
//               >
//                 <Text style={styles.btnText}>Submit</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.modalBtn, { backgroundColor: "gray" }]}
//                 onPress={() => {
//                   setModalVisible(false);
//                   setRejectReason("");
//                 }}
//               >
//                 <Text style={styles.btnText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container:{flex:1,padding:20,backgroundColor:"#f4f4f4"},
//   name:{fontSize:22,fontWeight:"bold"},
//   email:{fontSize:16,color:"gray",marginBottom:10},
//   kycImage:{width:"100%",height:250,borderRadius:10,marginVertical:15},
//   btnRow:{flexDirection:"row",justifyContent:"space-between"},
//   approveBtn:{backgroundColor:"green",padding:15,borderRadius:10,flex:0.48,alignItems:"center"},
//   rejectBtn:{backgroundColor:"red",padding:15,borderRadius:10,flex:0.48,alignItems:"center"},
//   btnText:{color:"#fff",fontWeight:"bold"},

//   // Modal
//   modalContainer:{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"rgba(0,0,0,0.5)"},
//   modalContent:{width:"80%",backgroundColor:"#fff",padding:20,borderRadius:12},
//   modalTitle:{fontSize:18,fontWeight:"bold",marginBottom:15,textAlign:"center"},
//   input:{borderWidth:1,borderColor:"#ccc",borderRadius:8,padding:10,marginBottom:15},
//   modalBtnRow:{flexDirection:"row",justifyContent:"space-between"},
//   modalBtn:{flex:0.48,padding:12,borderRadius:10,alignItems:"center"}
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Modal,
//   TextInput,
//   ScrollView,
//   Linking,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { fetchDoerById, approveKYC, rejectKYC } from "../api/admin.js";

// export default function AdminDoerProfile({ route, navigation }) {
//   const { doerId } = route.params;
//   const [doer, setDoer] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [rejectReason, setRejectReason] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadDoer();
//   }, []);

//   const loadDoer = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       const res = await fetchDoerById(token, doerId);
//       setDoer(res.data);
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Cannot fetch doer data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApprove = async () => {
//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       await approveKYC(token, doerId);
//       Alert.alert("Success", "KYC Approved");
//       loadDoer();
//     } catch (err) {
//       Alert.alert("Error", err.response?.data?.message || err.message);
//     }
//   };

//   const handleReject = async () => {
//     if (!rejectReason.trim()) {
//       Alert.alert("Validation", "Please enter a reason");
//       return;
//     }
//     try {
//       const token = await AsyncStorage.getItem("adminToken");
//       await rejectKYC(token, doerId, rejectReason);
//       Alert.alert("Success", "KYC Rejected");
//       setModalVisible(false);
//       setRejectReason("");
//       loadDoer();
//     } catch (err) {
//       Alert.alert("Error", err.response?.data?.message || err.message);
//     }
//   };

//   if (loading || !doer) return <Text style={{ padding: 20 }}>Loading...</Text>;

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.name}>{doer.name}</Text>
//       <Text style={styles.email}>{doer.email}</Text>
//       <Text>Phone: {doer.phone}</Text>
//       <Text>Status: {doer.kycVerified ? "Approved" : "Pending"}</Text>

//       {doer.kycImage && (
//         <TouchableOpacity
//           onPress={() => Linking.openURL(doer.kycImage)}
//           style={styles.viewKycBtn}
//         >
//           <Text style={styles.btnText}>View / Download KYC</Text>
//         </TouchableOpacity>
//       )}

//       {!doer.kycVerified && (
//         <View style={styles.btnRow}>
//           <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
//             <Text style={styles.btnText}>Approve</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.rejectBtn}
//             onPress={() => setModalVisible(true)}
//           >
//             <Text style={styles.btnText}>Reject</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Reject Modal */}
//       <Modal visible={modalVisible} transparent animationType="slide">
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Reason for Rejection</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter reason..."
//               value={rejectReason}
//               onChangeText={setRejectReason}
//             />
//             <View style={styles.modalBtnRow}>
//               <TouchableOpacity
//                 style={[styles.modalBtn, { backgroundColor: "red" }]}
//                 onPress={handleReject}
//               >
//                 <Text style={styles.btnText}>Submit</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.modalBtn, { backgroundColor: "gray" }]}
//                 onPress={() => {
//                   setModalVisible(false);
//                   setRejectReason("");
//                 }}
//               >
//                 <Text style={styles.btnText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 20, backgroundColor: "#f4f4f4" },
//   name: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
//   email: { fontSize: 16, color: "gray", marginBottom: 10 },
//   viewKycBtn: {
//     backgroundColor: "#2196f3",
//     padding: 15,
//     borderRadius: 10,
//     marginVertical: 15,
//     alignItems: "center",
//   },
//   btnRow: { flexDirection: "row", justifyContent: "space-between" },
//   approveBtn: {
//     flex: 0.48,
//     backgroundColor: "green",
//     padding: 15,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   rejectBtn: {
//     flex: 0.48,
//     backgroundColor: "red",
//     padding: 15,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "bold" },

//   // Modal
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   modalContent: {
//     width: "80%",
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 12,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 15,
//     textAlign: "center",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//   },
//   modalBtnRow: { flexDirection: "row", justifyContent: "space-between" },
//   modalBtn: { flex: 0.48, padding: 12, borderRadius: 10, alignItems: "center" },
// });
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Linking,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://192.168.1.6:8080/api";

export default function AdminKycDetail({ route, navigation }) {
  const { kycId } = route.params;
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKycDetail();
  }, []);

  const fetchKycDetail = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("adminToken");
      if (!token) return navigation.replace("AdminLogin");

      const res = await axios.get(`${BASE_URL}/admin/kyc/${kycId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setKyc(res.data.data); // Assuming backend returns { data: {...} }
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch KYC details");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !kyc) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} color="#2196f3" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Name:</Text>
      <Text style={styles.value}>{kyc.userName}</Text>

      <Text style={styles.label}>Phone:</Text>
      <Text style={styles.value}>{kyc.userPhone}</Text>

      <Text style={styles.label}>Document Type:</Text>
      <Text style={styles.value}>{kyc.docType}</Text>

      <Text style={styles.label}>Status:</Text>
      <Text style={styles.value}>{kyc.status}</Text>

      {kyc.downloadUrl && (
        <>
          <Text style={styles.label}>KYC Document:</Text>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => Linking.openURL(`${BASE_URL}${kyc.downloadUrl}`)}
          >
            <Text style={styles.btnText}>View / Download</Text>
          </TouchableOpacity>

          <Image
            source={{ uri: `${BASE_URL}${kyc.downloadUrl}` }}
            style={styles.image}
            resizeMode="contain"
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  label: { fontWeight: "bold", fontSize: 16, marginTop: 10 },
  value: { fontSize: 16, marginBottom: 5 },
  viewBtn: {
    backgroundColor: "#2196f3",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: "#e1e1e1",
  },
});

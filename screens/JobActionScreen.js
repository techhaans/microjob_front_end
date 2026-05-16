
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getJobInterests,
  acceptJobInterest,
  rejectJobInterest,
  markNotificationRead,
} from "../api/poster";

export default function JobActionScreen({ route, navigation }) {
  const { jobId, notificationId } = route.params || {};

  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  /* ===============================
     LOAD POSTER ID
  =============================== */
  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem("currentUserId");
      if (id) setLoggedInUserId(Number(id));
    })();
  }, []);

  /* ===============================
     LOAD INTERESTS
  =============================== */
  useEffect(() => {
    loadInterests();
    if (notificationId) {
      markNotificationRead(notificationId).catch(() => {});
    }
  }, [jobId]);

  const loadInterests = async () => {
    setLoading(true);
    try {
      const res = await getJobInterests(jobId);
      setInterests(res?.data || []);
    } catch {
      Alert.alert("Error", "Unable to load job interests");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     ACCEPT / REJECT
  =============================== */
  const handleAccept = async (interestId) => {
    Alert.alert(
      "Confirm Accept",
      "This will assign the job to this doer. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: async () => {
            setLoading(true);
            try {
              await acceptJobInterest(jobId, interestId);
              Alert.alert("Success", "Doer Accepted");
              loadInterests();
            } catch {
              Alert.alert("Error", "Accept Failed");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (interestId) => {
    Alert.alert(
      "Reject Doer",
      "This doer will not be able to contact you again for this job.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          onPress: async () => {
            setLoading(true);
            try {
              await rejectJobInterest(jobId, interestId);
              Alert.alert("Rejected", "Doer Rejected");
              loadInterests();
            } catch {
              Alert.alert("Error", "Reject Failed");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  /* ===============================
     RENDER INTEREST
  =============================== */
  const renderInterestItem = ({ item }) => {
    const canChat = item.status !== "REJECTED";
    const canAcceptReject = item.status === "PENDING";

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.doerName}</Text>
        <Text style={styles.text}>⭐ Rating: {item.ratingAvg || "N/A"}</Text>
        <Text style={styles.text}>KYC: {item.kycStatus}</Text>
        <Text style={styles.text}>Message: {item.message}</Text>
        <Text style={styles.status}>Status: {item.status}</Text>

        {/* CHAT — ALLOWED BEFORE & AFTER ACCEPT */}
        {canChat && (
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() =>
              navigation.navigate("ChatRoomScreen", {
                jobId,
                currentUserId: loggedInUserId,
                otherUserId: item.doerId,
              })
            }
          >
            <Text style={styles.btnText}>Chat</Text>
          </TouchableOpacity>
        )}

        {/* ACCEPT / REJECT — ONLY WHEN PENDING */}
        {canAcceptReject && (
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => handleAccept(item.interestId)}
            >
              <Text style={styles.btnText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => handleReject(item.interestId)}
            >
              <Text style={styles.btnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  /* ===============================
     LOADING
  =============================== */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  /* ===============================
     UI
  =============================== */
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Job ID: {jobId}</Text>

      {interests.length === 0 ? (
        <Text style={styles.noData}>No interests found.</Text>
      ) : (
        <FlatList
          data={interests}
          keyExtractor={(item) => item.interestId.toString()}
          renderItem={renderInterestItem}
        />
      )}
    </View>
  );
}

/* ===============================
   STYLES
=============================== */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f7f9fc" },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 15 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 3,
  },
  name: { fontSize: 18, fontWeight: "700", marginBottom: 5 },
  text: { fontSize: 14, marginBottom: 4, color: "#555" },
  status: {
    fontSize: 14,
    fontWeight: "600",
    marginVertical: 6,
    color: "#0b74ff",
  },
  row: { flexDirection: "row", marginTop: 10 },
  acceptBtn: {
    flex: 1,
    backgroundColor: "green",
    padding: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: "red",
    padding: 12,
    borderRadius: 6,
  },
  chatBtn: {
    backgroundColor: "#0b78ff",
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  noData: { textAlign: "center", color: "#666", marginTop: 20, fontSize: 16 },
});

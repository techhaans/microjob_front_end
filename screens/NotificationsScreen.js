// NotificationsScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { fetchNotifications } from "../api/poster";

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await fetchNotifications();
      setNotifications(res.data.content || []);
    } catch (err) {
      console.log("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (notif) => {
    navigation.navigate("JobActionScreen", {
      job: notif.job, // optional full job object
      jobId: notif.jobId,
      notificationId: notif.id,
      interestId: notif.interestId,
    });
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  if (!notifications.length)
    return (
      <View style={styles.center}>
        <Text>No notifications</Text>
      </View>
    );

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.notifItem,
            { backgroundColor: item.isRead ? "#f0f0f0" : "#fff" },
          ]}
          onPress={() => handlePress(item)}
        >
          <Text style={styles.notifText}>{item.message}</Text>
          <Text style={styles.notifStatus}>{item.isRead ? "Seen" : "New"}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  notifItem: { padding: 15, borderBottomWidth: 1, borderColor: "#ddd" },
  notifText: { fontSize: 16 },
  notifStatus: { fontSize: 12, color: "gray" },
});

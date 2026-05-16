// JobCard.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function JobCard({ job, loading, onOpenActions }) {
  const getStatusColor = (s) =>
    s === "POSTED" ? "#e6f0ff" : s === "COMPLETED" ? "#e6fff2" : "#fff4e6";

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {job.category || "No Category"} • {job.addressLabel || "No Address"}
          </Text>
        </View>

        <View style={[styles.badge, { backgroundColor: getStatusColor(job.status) }]}>
          <Text style={[styles.badgeText, { color: job.status === "POSTED" ? "#0b78ff" : job.status === "COMPLETED" ? "#047857" : "#b45309" }]}>
            {job.status}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.info}>
          <Ionicons name="cash-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>₹ {job.totalPriceRupees || 0}</Text>
        </View>

        <View style={styles.info}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : ""}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.viewBtn} onPress={() => onOpenActions(job)} disabled={loading}>
          <Ionicons name="ellipsis-horizontal" size={16} color="#fff" />
          <Text style={styles.viewText}>{loading ? "Working..." : "View Details"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },
  subtitle: { color: "#6b7280", fontSize: 13 },
  badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  info: { flexDirection: "row", alignItems: "center" },
  infoText: { marginLeft: 8, color: "#374151", fontWeight: "700" },
  footer: { marginTop: 12, alignItems: "flex-start" },
  viewBtn: {
    backgroundColor: "#0b78ff",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  viewText: { color: "#fff", fontWeight: "700", marginLeft: 8 },
});

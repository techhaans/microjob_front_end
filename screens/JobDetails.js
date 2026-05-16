import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Button } from "react-native-web";

const BASE_URL = "http://192.168.1.40:8080"; // ⚠️ replace with your backend URL

export default function JobDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { jobId } = route.params;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);

      let params = {};

      // ✅ Try to use stored location for instant speed
      const lastLat = await AsyncStorage.getItem("lastLat");
      const lastLon = await AsyncStorage.getItem("lastLon");

      if (lastLat && lastLon) {
        params = { lat: parseFloat(lastLat), lon: parseFloat(lastLon) };
      } else {
        // fallback: check permission & get fast location
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === "granted") {
          const lastLoc = await Location.getLastKnownPositionAsync({});
          if (lastLoc) {
            params = {
              lat: lastLoc.coords.latitude,
              lon: lastLoc.coords.longitude,
            };
          } else {
            // fallback (rare)
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Lowest,
            });
            params = {
              lat: loc.coords.latitude,
              lon: loc.coords.longitude,
            };
          }
        }
      }

      const token = await AsyncStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}` };

      const { data } = await axios.get(
        `${BASE_URL}/api/doer/jobs/${jobId}/details`,
        { headers, params },
      );

      setJob(data?.data || null);
    } catch (err) {
      console.error("Job Details Error:", err.message);
      Alert.alert("Error", "Unable to fetch job details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );

  if (!job)
    return (
      <View style={styles.loader}>
        <Text style={{ color: "#6b7280" }}>Job not found.</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ position: "absolute", left: 16 }}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Job Details</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.category}>{job.category || "—"}</Text>

          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.description}>
            {job.description || "No description available"}
          </Text>

          {job.amountInRs > 0 && (
            <>
              <Text style={styles.sectionHeader}>Total Amount</Text>
              <Text style={styles.amount}>₹ {job.amountInRs}</Text>
            </>
          )}

          {job.priceItems?.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Price Breakdown</Text>
              {job.priceItems.map((item) => (
                <View key={item.id} style={styles.priceItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.priceLabel}>{item.label}</Text>
                    <Text style={styles.priceDesc}>{item.description}</Text>
                  </View>
                  <Text style={styles.priceValue}>₹ {item.priceRupees}</Text>
                </View>
              ))}
            </>
          )}

          <Text style={styles.sectionHeader}>Address</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color="#2563eb" />
            <Text style={styles.metaText}>{job.addressLabel || "—"}</Text>
          </View>

          {job.distanceKm && (
            <Text style={styles.metaSub}>
              {job.distanceKm.toFixed(1)} km away
            </Text>
          )}

          <Text style={styles.sectionHeader}>Posted By</Text>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={16} color="#2563eb" />
            <Text style={styles.metaText}>{job.posterName || "—"}</Text>
          </View>

          <Text style={styles.postedAgo}>Posted {job.postedAgo || "—"}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  topBar: {
    height: 56,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  topTitle: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
  scrollContainer: { padding: 16, paddingBottom: 60 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  category: {
    color: "#2563eb",
    fontWeight: "600",
    marginBottom: 12,
  },
  sectionHeader: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  description: {
    color: "#4b5563",
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  amount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#16a34a",
    marginTop: 4,
  },
  priceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 8,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  priceLabel: {
    fontWeight: "600",
    color: "#111827",
  },
  priceDesc: {
    fontSize: 12,
    color: "#6b7280",
  },
  priceValue: {
    fontWeight: "700",
    color: "#16a34a",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  metaText: {
    color: "#111827",
    marginLeft: 6,
    fontSize: 14,
  },
  metaSub: {
    color: "#6b7280",
    fontSize: 13,
    marginLeft: 22,
  },
  postedAgo: {
    marginTop: 12,
    fontSize: 13,
    color: "#6b7280",
  },
});

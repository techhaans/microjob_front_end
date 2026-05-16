// screens/PosterDashboard.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Image } from "react-native";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import {
  fetchPosterProfile,
  logoutPoster,
  getPosterJobs,
  deletePosterJob,
  fetchCategories,
  fetchPosterAddresses,
  getPosterJobPriceItems,
  addPosterJobPriceItem,
  updatePosterJobPriceItem,
  deletePosterJobPriceItem,
  markJobPartial,
  confirmJobCompleted,
} from "../api/poster";

const { width, height } = Dimensions.get("window");

export default function PosterDashboard({ navigation }) {
  // mounted guard
  const mountedRef = useRef(true);

  // data
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [jobStatusFilter, setJobStatusFilter] = useState("POSTED");
  const [categories, setCategories] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // sidebar animation
  const slideAnim = useRef(new Animated.Value(-width * 0.72)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // items modal
  const [itemsModalVisible, setItemsModalVisible] = useState(false);
  const [selectedJobItems, setSelectedJobItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [modalJobTitle, setModalJobTitle] = useState("");
  const [activeJobId, setActiveJobId] = useState(null);

  // add/edit item fields
  const [editingItem, setEditingItem] = useState(null);
  const [itemLabel, setItemLabel] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  // per-job loading (ids)
  const [loadingJobIds, setLoadingJobIds] = useState([]);

  // action sheet
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    mountedRef.current = true;
    loadAll();

    const unsub = navigation.addListener("focus", () => {
      loadAll();
    });

    return () => {
      mountedRef.current = false;
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, jobStatusFilter]);

  const loadAll = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    await Promise.allSettled([
      loadProfile(),
      loadJobs(jobStatusFilter),
      loadCategories(),
      loadAddresses(),
    ]);
    if (mountedRef.current) setLoading(false);
  }, [jobStatusFilter]);

  const loadProfile = async () => {
    try {
      const res = await fetchPosterProfile();
      if (res?.status === "SUCCESS" && res.data && mountedRef.current) {
        setProfile(res.data);
        await AsyncStorage.setItem("posterProfile", JSON.stringify(res.data));
      } else if (mountedRef.current) setProfile(null);
    } catch (err) {
      console.warn("[Profile Error]", err);
      if (mountedRef.current) setProfile(null);
    }
  };

  const loadJobs = async (status = "POSTED") => {
    if (!mountedRef.current) return;
    setRefreshing(true);
    try {
      const res = await getPosterJobs(0, 50, status);
      if (mountedRef.current) setJobs(res?.data ?? []);
    } catch (err) {
      console.warn("[Jobs Error]", err);
      if (mountedRef.current) setJobs([]);
    } finally {
      if (mountedRef.current) setRefreshing(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetchCategories();
      if (res?.status === "SUCCESS" && mountedRef.current)
        setCategories(res.data);
    } catch (err) {
      console.warn("[Categories Error]", err);
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await fetchPosterAddresses();
      if (res?.status === "SUCCESS" && mountedRef.current)
        setAddresses(res.data);
    } catch (err) {
      console.warn("[Addresses Error]", err);
    }
  };

  // Sidebar animations
  const openSidebar = () => {
    setSidebarOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0.45,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width * 0.72,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setSidebarOpen(false));
  };

  const toggleSidebar = () => (sidebarOpen ? closeSidebar() : openSidebar());

  // Logout
  const handleLogout = async () => {
    try {
      await logoutPoster();
      navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
    } catch (err) {
      console.warn("[Logout Error]", err);
      Alert.alert("Error", "Logout failed.");
    }
  };

  // Job actions
  const setJobLoading = (jobId, loadingOn) => {
    setLoadingJobIds((prev) =>
      loadingOn ? [...prev, jobId] : prev.filter((i) => i !== jobId),
    );
  };

  const handleDeleteJob = (jobId) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this job?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setJobLoading(jobId, true);
          try {
            await deletePosterJob(jobId);
            Alert.alert("Deleted", "Job deleted successfully");
            await loadJobs(jobStatusFilter);
          } catch (err) {
            console.warn("[Delete Job Error]", err);
            Alert.alert("Error", "Failed to delete job");
          } finally {
            setJobLoading(jobId, false);
          }
        },
      },
    ]);
  };

  const handleMarkPartial = async (jobId) => {
    setJobLoading(jobId, true);
    try {
      const res = await markJobPartial(jobId);
      if (res?.status === "SUCCESS") {
        Alert.alert("Success", "Job marked as partially completed");
        await loadJobs(jobStatusFilter);
      } else Alert.alert("Error", res?.message || "Failed to mark partial");
    } catch (err) {
      console.warn("[Mark Partial Error]", err);
      Alert.alert("Error", "Failed to mark partial");
    } finally {
      setJobLoading(jobId, false);
    }
  };

  const handleConfirmCompleted = async (jobId) => {
    setJobLoading(jobId, true);
    try {
      const res = await confirmJobCompleted(jobId);
      if (res?.status === "SUCCESS") {
        Alert.alert("Success", "Job confirmed as completed");
        await loadJobs(jobStatusFilter);
      } else
        Alert.alert("Error", res?.message || "Failed to confirm completion");
    } catch (err) {
      console.warn("[Confirm Completed Error]", err);
      Alert.alert("Error", "Failed to confirm completion");
    } finally {
      setJobLoading(jobId, false);
    }
  };

  // Items modal
  const openItemsModal = async (job) => {
    if (!job) return;
    setItemsModalVisible(true);
    setSelectedJobItems([]);
    setItemsLoading(true);
    setModalJobTitle(job.title || "Job Items");
    setActiveJobId(job.id);
    setEditingItem(null);
    setItemLabel("");
    setItemDescription("");
    setItemPrice("");

    try {
      const res = await getPosterJobPriceItems(job.id);
      if (mountedRef.current) setSelectedJobItems(res?.data?.priceItems || []);
    } catch (err) {
      console.warn("[Job Price Items Error]", err);
      if (mountedRef.current) setSelectedJobItems([]);
    } finally {
      if (mountedRef.current) setItemsLoading(false);
    }
  };

  const loadJobItems = async (jobId) => {
    if (!jobId) return;
    setItemsLoading(true);
    try {
      const res = await getPosterJobPriceItems(jobId);
      if (mountedRef.current) setSelectedJobItems(res?.data?.priceItems || []);
    } catch (err) {
      console.warn("[Reload Items Error]", err);
      if (mountedRef.current) setSelectedJobItems([]);
    } finally {
      if (mountedRef.current) setItemsLoading(false);
    }
  };

  const handleAddOrUpdateItem = async () => {
    if (!itemLabel.trim() || !itemPrice.trim()) {
      Alert.alert("Error", "Label and Price are required");
      return;
    }
    const priceNum = parseFloat(itemPrice);
    if (isNaN(priceNum)) {
      Alert.alert("Error", "Price must be a valid number");
      return;
    }
    if (!activeJobId) {
      Alert.alert("Error", "Active job unavailable");
      return;
    }

    const payload = {
      label: itemLabel.trim(),
      description: itemDescription.trim(),
      priceRupees: priceNum,
      totalPriceRupees: 0,
    };

    try {
      if (editingItem && editingItem.id) {
        await updatePosterJobPriceItem(activeJobId, editingItem.id, payload);
        Alert.alert("Updated", "Item updated successfully");
      } else {
        await addPosterJobPriceItem(activeJobId, payload);
        Alert.alert("Added", "Item added successfully");
      }

      // reset
      setItemLabel("");
      setItemDescription("");
      setItemPrice("");
      setEditingItem(null);

      await loadJobItems(activeJobId);
      await loadJobs(jobStatusFilter);
    } catch (err) {
      console.warn("[Add/Update Item Error]", err);
      Alert.alert("Error", "Failed to save item");
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemLabel(item.label || "");
    setItemDescription(item.description || "");
    setItemPrice(item.priceRupees?.toString() || "");
  };

  const handleDeleteItem = (itemId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePosterJobPriceItem(activeJobId, itemId);
              Alert.alert("Deleted", "Item deleted successfully");
              if (editingItem && editingItem.id === itemId) {
                setEditingItem(null);
                setItemLabel("");
                setItemDescription("");
                setItemPrice("");
              }
              await loadJobItems(activeJobId);
              await loadJobs(jobStatusFilter);
            } catch (err) {
              console.warn("[Delete Item Error]", err);
              Alert.alert("Error", "Failed to delete item");
            }
          },
        },
      ],
    );
  };

  // Action sheet handlers
  const openJobActions = (job) => {
    setSelectedJob(job);
    setActionSheetVisible(true);
  };

  const closeActionSheet = () => {
    setActionSheetVisible(false);
    setSelectedJob(null);
  };

  // small helpers
  const formatDate = (d) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  const getStatusColor = (status) => {
    if (status === "POSTED") return "#e6f0ff";
    if (status === "ACCEPTED" || status === "IN_PROGRESS") return "#fff4e6";
    if (status === "COMPLETED") return "#e6fff2";
    return "#f3f4f6";
  };

  // // Job card renderer
  // const renderJobItem = ({ item }) => {
  //   const isLoading = loadingJobIds.includes(item.id);
  //   return (
  //     <View style={styles.jobCard}>
  //       <View style={styles.jobHeader}>
  //         <View style={{ flex: 1 }}>

  //           <Text style={styles.jobTitle} numberOfLines={1}>
  //             {item.title}
  //           </Text>
  //           <Text style={styles.jobSubtitle} numberOfLines={1}>
  //             {item.category || "No Category"} •{" "}
  //             {item.addressLabel || "No Address"}
  //           </Text>
  //         </View>

  //         <View
  //           style={[
  //             styles.statusBadge,
  //             { backgroundColor: getStatusColor(item.status) },
  //           ]}
  //         >
  //           <Text
  //             style={[
  //               styles.statusText,
  //               {
  //                 color:
  //                   item.status === "POSTED"
  //                     ? "#0b78ff"
  //                     : item.status === "ACCEPTED" ||
  //                       item.status === "IN_PROGRESS"
  //                     ? "#b45309"
  //                     : "#047857",
  //               },
  //             ]}
  //           >
  //             {item.status}
  //           </Text>
  //         </View>
  //       </View>

  //       <View style={styles.jobBody}>
  //         <View style={styles.jobInfoRow}>
  //           <Ionicons name="cash-outline" size={16} color="#6b7280" />
  //           <Text style={styles.jobInfoText}>
  //             ₹ {item.totalPriceRupees || 0}
  //           </Text>
  //         </View>

  //         <View style={styles.jobInfoRow}>
  //           <Ionicons name="calendar-outline" size={16} color="#6b7280" />
  //           <Text style={styles.jobInfoText}>{formatDate(item.createdAt)}</Text>
  //         </View>
  //       </View>

  //       <View
  //         style={[
  //           styles.cardFooter,
  //           { flexDirection: "row", alignItems: "center" },
  //         ]}
  //       >
  //         <TouchableOpacity
  //           style={styles.viewBtn}
  //           activeOpacity={0.8}
  //           onPress={() => openJobActions(item)}
  //           disabled={isLoading}
  //         >
  //           {isLoading ? (
  //             <ActivityIndicator size="small" color="#fff" />
  //           ) : (
  //             <>
  //               <Ionicons name="ellipsis-horizontal" size={16} color="#fff" />
  //               <Text style={styles.viewBtnText}>Actions</Text>
  //             </>
  //           )}
  //         </TouchableOpacity>
  //         <TouchableOpacity
  //           onPress={() =>
  //             navigation.navigate("ChatRoomScreen", { jobId: item.id })
  //           }
  //         >
  //           <Text>Chat</Text>
  //         </TouchableOpacity>

  //         <TouchableOpacity
  //           style={{ marginLeft: 12, padding: 8 }}
  //           onPress={() =>
  //             navigation.navigate("JobActionScreen", { jobId: item.id })
  //           }
  //         >
  //           <Ionicons name="notifications-outline" size={22} color="#0b78ff" />
  //         </TouchableOpacity>
  //       </View>
  //     </View>
  //   );
  // };

  // if (loading) {
  //   return (
  //     <View style={styles.loader}>
  //       <ActivityIndicator size="large" color="#0b78ff" />
  //     </View>
  //   );
  // }
  // Job card renderer
  // const renderJobItem = ({ item }) => {
  //   const isLoading = loadingJobIds.includes(item.id);

  //   return (
  //     <View style={styles.jobCard}>
  //       {/* 🔵 TOP IMAGE */}
  //       {/* TOP IMAGE */}
  //       {item.proofUrl && item.proofUrl !== "N/A" && item.proofUrl !== "" && (
  //         <Image
  //           source={{ uri: item.proofUrl }}
  //           style={styles.jobImage}
  //           resizeMode="cover"
  //         />
  //       )}

  //       {/* HEADER */}
  //       <View style={styles.jobHeader}>
  //         <View style={{ flex: 1 }}>
  //           <Text style={styles.jobTitle} numberOfLines={1}>
  //             {item.title}
  //           </Text>
  //           <Text style={styles.jobSubtitle} numberOfLines={1}>
  //             {item.category || "No Category"} •{" "}
  //             {item.addressLabel || "No Address"}
  //           </Text>
  //         </View>

  //         <View
  //           style={[
  //             styles.statusBadge,
  //             { backgroundColor: getStatusColor(item.status) },
  //           ]}
  //         >
  //           <Text
  //             style={[
  //               styles.statusText,
  //               {
  //                 color:
  //                   item.status === "POSTED"
  //                     ? "#0b78ff"
  //                     : item.status === "ACCEPTED" ||
  //                       item.status === "IN_PROGRESS"
  //                     ? "#b45309"
  //                     : "#047857",
  //               },
  //             ]}
  //           >
  //             {item.status}
  //           </Text>
  //         </View>
  //       </View>

  //       {/* BODY */}
  //       <View style={styles.jobBody}>
  //         <View style={styles.jobInfoRow}>
  //           <Ionicons name="cash-outline" size={16} color="#6b7280" />
  //           <Text style={styles.jobInfoText}>
  //             ₹ {item.totalPriceRupees || 0}
  //           </Text>
  //         </View>

  //         <View style={styles.jobInfoRow}>
  //           <Ionicons name="calendar-outline" size={16} color="#6b7280" />
  //           <Text style={styles.jobInfoText}>{formatDate(item.createdAt)}</Text>
  //         </View>
  //       </View>

  //       {/* FOOTER */}
  //       <View
  //         style={[
  //           styles.cardFooter,
  //           { flexDirection: "row", alignItems: "center" },
  //         ]}
  //       >
  //         <TouchableOpacity
  //           style={styles.viewBtn}
  //           activeOpacity={0.8}
  //           onPress={() => openJobActions(item)}
  //           disabled={isLoading}
  //         >
  //           {isLoading ? (
  //             <ActivityIndicator size="small" color="#fff" />
  //           ) : (
  //             <>
  //               <Ionicons name="ellipsis-horizontal" size={16} color="#fff" />
  //               <Text style={styles.viewBtnText}>Actions</Text>
  //             </>
  //           )}
  //         </TouchableOpacity>

  //         <TouchableOpacity
  //           onPress={() =>
  //             navigation.navigate("ChatRoomScreen", { jobId: item.id })
  //           }
  //           style={{ marginLeft: 10 }}
  //         >
  //           <Text>Chat</Text>
  //         </TouchableOpacity>

  //         <TouchableOpacity
  //           style={{ marginLeft: 12, padding: 8 }}
  //           onPress={() =>
  //             navigation.navigate("JobActionScreen", { jobId: item.id })
  //           }
  //         >
  //           <Ionicons name="notifications-outline" size={22} color="#0b78ff" />
  //         </TouchableOpacity>
  //       </View>
  //     </View>
  //   );
  // };
  const renderJobItem = ({ item }) => {
    const isLoading = loadingJobIds.includes(item.id);

    const openJobActions = (job) => {
      navigation.navigate("JobActionScreen", {
        jobId: job.id,
        // no notificationId here, only needed when coming from notifications
      });
    };

    const openChat = (job) => {
      navigation.navigate("ChatRoomScreen", { jobId: job.id });
    };

    const openJobFromNotification = (job) => {
      navigation.navigate("JobActionScreen", {
        jobId: job.id,
        notificationId: job.notificationId || null, // optional
      });
    };

    return (
      <View style={styles.jobCard}>
        {/* TOP IMAGE */}
        {item.proofUrl && item.proofUrl !== "N/A" && item.proofUrl !== "" && (
          <Image
            source={{ uri: item.proofUrl }}
            style={styles.jobImage}
            resizeMode="cover"
          />
        )}

        {/* HEADER */}
        <View style={styles.jobHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.jobSubtitle} numberOfLines={1}>
              {item.category || "No Category"} •{" "}
              {item.addressLabel || "No Address"}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    item.status === "POSTED"
                      ? "#0b78ff"
                      : item.status === "ACCEPTED" ||
                          item.status === "IN_PROGRESS"
                        ? "#b45309"
                        : "#047857",
                },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        {/* BODY */}
        <View style={styles.jobBody}>
          <View style={styles.jobInfoRow}>
            <Ionicons name="cash-outline" size={16} color="#6b7280" />
            <Text style={styles.jobInfoText}>
              ₹ {item.totalPriceRupees || 0}
            </Text>
          </View>

          <View style={styles.jobInfoRow}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.jobInfoText}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View
          style={[
            styles.cardFooter,
            { flexDirection: "row", alignItems: "center" },
          ]}
        >
          {/* Actions Button */}
          <TouchableOpacity
            style={styles.viewBtn}
            activeOpacity={0.8}
            onPress={() => openJobActions(item)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="ellipsis-horizontal" size={16} color="#fff" />
                <Text style={styles.viewBtnText}>Actions</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Chat Button */}
          <TouchableOpacity
            onPress={() => openChat(item)}
            style={{ marginLeft: 10 }}
          >
            <Text>Chat</Text>
          </TouchableOpacity>

          {/* Notification Icon */}
          <TouchableOpacity
            style={{ marginLeft: 12, padding: 8 }}
            onPress={() => openJobFromNotification(item)}
          >
            <Ionicons name="notifications-outline" size={22} color="#0b78ff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: StatusBar.currentHeight || 0 }]}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.iconBtn}>
            <Ionicons name="menu" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Poster Dashboard</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateJobScreen")}
            style={styles.createBtn}
          >
            <Ionicons name="add-circle" size={18} color="#fff" />
            <Text style={styles.createBtnText}>Create Job</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={{ marginLeft: 12 }}>
            <Ionicons name="log-out-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting + Filters */}
      <View style={styles.headerWrap}>
        <Text style={styles.header}>
          Welcome {profile?.name?.split(" ")[0] || ""} 👋
        </Text>

        <View style={styles.filterContainer}>
          {["POSTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterBtn,
                {
                  backgroundColor:
                    jobStatusFilter === status ? "#0b78ff" : "#eef2ff",
                },
              ]}
              onPress={() => {
                setJobStatusFilter(status);
                loadJobs(status);
              }}
            >
              <Text
                style={{
                  color: jobStatusFilter === status ? "#fff" : "#111827",
                  fontWeight: "700",
                }}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Job List */}
      <FlatList
        data={jobs}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderJobItem}
        refreshing={refreshing}
        onRefresh={() => loadJobs(jobStatusFilter)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        ListEmptyComponent={() => (
          <View style={{ padding: 20 }}>
            <Text style={{ textAlign: "center", color: "#6b7280" }}>
              No jobs found
            </Text>
          </View>
        )}
      />

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={toggleSidebar}
          />
        </Animated.View>
      )}

      {/* Sidebar */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
      >
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Menu</Text>
          <TouchableOpacity onPress={toggleSidebar}>
            <Ionicons name="close" size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={toggleSidebar}>
          <Ionicons name="home-outline" size={20} color="#2563eb" />
          <Text style={styles.menuText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleSidebar();
            navigation.navigate("PosterProfileView");
          }}
        >
          <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
          <Text style={styles.menuText}>View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleSidebar();
            navigation.navigate("PosterProfileEdit");
          }}
        >
          <MaterialIcons name="edit" size={20} color="#2563eb" />
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleSidebar();
            navigation.navigate("PosterKyc");
          }}
        >
          <Ionicons name="document-text-outline" size={20} color="#2563eb" />
          <Text style={styles.menuText}>KYC</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleSidebar();
            navigation.navigate("ChatBotScreen");
          }}
        >
          <MaterialIcons name="chat" size={20} color="#2563eb" />
          <Text style={styles.menuText}>Chat Bot</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleSidebar();
            navigation.navigate("SupportScreen");
          }}
        >
          <Ionicons name="help-circle-outline" size={20} color="#2563eb" />
          <Text style={styles.menuText}>Customer Support</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[styles.menuItem, { paddingVertical: 16 }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={[styles.menuText, { color: "#ef4444" }]}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Action Sheet */}
      <Modal
        visible={actionSheetVisible}
        animationType="slide"
        transparent
        onRequestClose={closeActionSheet}
      >
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={closeActionSheet}
        />
        <View style={styles.actionSheet}>
          <Text style={styles.sheetTitle}>{selectedJob?.title}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <ActionRow
              icon="list"
              label="View Items"
              onPress={() => {
                openItemsModal(selectedJob);
                closeActionSheet();
              }}
            />
            <ActionRow
              icon="create-outline"
              label="Edit Price Items"
              onPress={() => {
                openItemsModal(selectedJob);
                closeActionSheet();
              }}
            />

            {selectedJob?.status !== "COMPLETED" && (
              <ActionRow
                icon="alert-circle"
                label="Mark Partial"
                onPress={() => {
                  closeActionSheet();
                  handleMarkPartial(selectedJob.id);
                }}
              />
            )}

            {selectedJob?.status !== "COMPLETED" && (
              <ActionRow
                icon="checkmark-circle"
                label="Mark Complete"
                onPress={() => {
                  closeActionSheet();
                  handleConfirmCompleted(selectedJob.id);
                }}
              />
            )}

            <ActionRow
              icon="trash"
              label="Delete Job"
              danger
              onPress={() => {
                closeActionSheet();
                handleDeleteJob(selectedJob.id);
              }}
            />

            <TouchableOpacity
              style={styles.closeSheetBtn}
              onPress={closeActionSheet}
            >
              <Text style={styles.closeSheetText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Items Modal */}
      <Modal
        visible={itemsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setItemsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.itemsOverlay}>
            <View style={styles.itemsContainer}>
              <View style={styles.itemsHeader}>
                <Text style={styles.itemsTitle}>{modalJobTitle}</Text>
                <TouchableOpacity onPress={() => setItemsModalVisible(false)}>
                  <Ionicons name="close" size={22} color="#111827" />
                </TouchableOpacity>
              </View>

              {itemsLoading ? (
                <ActivityIndicator
                  size="large"
                  color="#0b78ff"
                  style={{ marginTop: 20 }}
                />
              ) : (
                <>
                  <FlatList
                    data={selectedJobItems}
                    keyExtractor={(it) => String(it.id)}
                    style={{ maxHeight: height * 0.45 }}
                    contentContainerStyle={{ paddingBottom: 8 }}
                    ListEmptyComponent={() => (
                      <View style={{ padding: 12 }}>
                        <Text style={{ textAlign: "center", color: "#6b7280" }}>
                          No items available
                        </Text>
                      </View>
                    )}
                    renderItem={({ item }) => (
                      <View style={styles.itemCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemLabel}>{item.label}</Text>
                          {item.description ? (
                            <Text style={styles.itemDesc}>
                              {item.description}
                            </Text>
                          ) : null}
                        </View>

                        <View
                          style={{ alignItems: "flex-end", marginLeft: 12 }}
                        >
                          <Text style={styles.itemPrice}>
                            ₹ {item.priceRupees}
                          </Text>
                          <View style={{ flexDirection: "row", marginTop: 8 }}>
                            <TouchableOpacity
                              style={styles.iconSmallBtn}
                              onPress={() => handleEditItem(item)}
                            >
                              <Ionicons
                                name="create-outline"
                                size={16}
                                color="#0b78ff"
                              />
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.iconSmallBtn, { marginLeft: 8 }]}
                              onPress={() =>
                                Alert.alert(
                                  "Confirm Delete",
                                  "Delete this item?",
                                  [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                      text: "Delete",
                                      style: "destructive",
                                      onPress: () => handleDeleteItem(item.id),
                                    },
                                  ],
                                )
                              }
                            >
                              <Ionicons
                                name="trash-outline"
                                size={16}
                                color="#ef4444"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )}
                  />

                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    style={{ marginTop: 8 }}
                  >
                    <TextInput
                      placeholder="Label"
                      value={itemLabel}
                      onChangeText={setItemLabel}
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Description"
                      value={itemDescription}
                      onChangeText={setItemDescription}
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Price (₹)"
                      value={itemPrice}
                      onChangeText={setItemPrice}
                      keyboardType="numeric"
                      style={styles.input}
                    />

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 8,
                      }}
                    >
                      <TouchableOpacity
                        style={[styles.primaryBtn, { flex: 1, marginRight: 8 }]}
                        onPress={handleAddOrUpdateItem}
                      >
                        <Text style={styles.primaryBtnText}>
                          {editingItem ? "Update Item" : "Add Item"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.secondaryBtn, { flex: 1 }]}
                        onPress={() => {
                          setEditingItem(null);
                          setItemLabel("");
                          setItemDescription("");
                          setItemPrice("");
                        }}
                      >
                        <Text style={styles.secondaryBtnText}>Reset</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={[styles.secondaryBtn, { marginTop: 12 }]}
                      onPress={() => setItemsModalVisible(false)}
                    >
                      <Text style={styles.secondaryBtnText}>Close</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/* --- ActionRow --- */
function ActionRow({ icon, label, onPress, danger = false }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.actionRow, danger && { backgroundColor: "#fff7f6" }]}
    >
      <View style={styles.actionIcon}>
        <Ionicons
          name={icon}
          size={18}
          color={danger ? "#ef4444" : "#0b78ff"}
        />
      </View>
      <Text style={[styles.actionLabel, danger && { color: "#ef4444" }]}>
        {label}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={18}
        color="#9ca3af"
        style={{ marginLeft: "auto" }}
      />
    </TouchableOpacity>
  );
}

/* --- Styles (kept & slightly improved) --- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  // Topbar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0b78ff",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: { marginRight: 12 },
  topTitle: { color: "#fff", fontWeight: "700", fontSize: 18 },

  createBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  createBtnText: { color: "#fff", fontWeight: "700", marginLeft: 6 },

  headerWrap: { padding: 16 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  filterContainer: { flexDirection: "row", marginBottom: 6, flexWrap: "wrap" },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },

  // job card
  jobCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  jobHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  jobTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  jobSubtitle: { color: "#6b7280", fontSize: 13 },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: "700" },

  jobBody: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  jobInfoRow: { flexDirection: "row", alignItems: "center" },
  jobInfoText: { marginLeft: 8, color: "#374151", fontWeight: "700" },

  cardFooter: { marginTop: 12, alignItems: "flex-start" },
  viewBtn: {
    backgroundColor: "#0b78ff",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  viewBtnText: { color: "#fff", fontWeight: "700", marginLeft: 8 },

  // overlay/sidebar
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 9,
  },

  // sidebar
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    width: width * 0.72,
    height: "100%",
    backgroundColor: "#fff",
    padding: 18,
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    elevation: 6,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  sidebarTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  menuText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#2563eb",
    fontWeight: "600",
  },

  // action sheet
  sheetOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  actionSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    maxHeight: height * 0.7,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#fafafa",
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionLabel: { fontSize: 16, fontWeight: "700" },

  closeSheetBtn: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  closeSheetText: { fontSize: 16, fontWeight: "700", color: "#111827" },

  // items modal
  itemsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 16,
  },
  itemsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    maxHeight: height * 0.9,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemsTitle: { fontSize: 18, fontWeight: "700" },

  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  itemLabel: { fontWeight: "700", fontSize: 15, color: "#111827" },
  itemDesc: { color: "#6b7280", marginTop: 4 },
  itemPrice: { fontWeight: "700", color: "#111827" },

  iconSmallBtn: { backgroundColor: "#f3f4f6", padding: 6, borderRadius: 8 },

  // form
  input: {
    borderWidth: 1,
    borderColor: "#e6e7ee",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  primaryBtn: {
    backgroundColor: "#0b78ff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  jobImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: 10,
  },

  primaryBtnText: { color: "#fff", fontWeight: "700" },
  secondaryBtn: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#111827", fontWeight: "700" },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});

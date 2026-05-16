// DoerDashboard.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Animated,
  FlatList,
  Alert,
  ScrollView,
  Switch,
  Modal,
  RefreshControl,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useDebouncedCallback } from "use-debounce";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import {
  fetchDoerProfile,
  fetchAvailableJobs,
  fetchCurrentJobs,
  fetchJobHistory,
  sendInterest,
  withdrawInterest,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  fetchProcessJobs,
  startJob,
  resumeJob,
  pauseJob,
  partialJob,
  completeJob,
  cancelJob,
  reportFakeJob,
  logoutDoer,
} from "../api/doer";

/* ---------------- Config ---------------- */
const LOCAL_PROCESS_JOBS = "LOCAL_PROCESS_JOBS";
const DOER_PROFILE_KEY = "doerProfile";
const POLL_INTERVAL_MS = 8000; // background polling interval (8s) - adjust if needed

/* ---------------- Notification handler ---------------- */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/* ---------------- Status constants (matching backend) ---------------- */
const STATUS = {
  POSTED: "POSTED",
  ACCEPTED: "ACCEPTED",
  IN_PROGRESS: "IN_PROGRESS",
  PAUSED: "PAUSED",
  PARTIALLY_COMPLETED: "PARTIALLY_COMPLETED",
  COMPLETED_AWAIT_CONFIRM: "COMPLETED_AWAIT_CONFIRM",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  FAKE_REPORTED: "FAKE_REPORTED",
};

const STATUS_ACTIONS = {
  [STATUS.POSTED]: ["interest"],
  [STATUS.ACCEPTED]: ["start"],
  [STATUS.IN_PROGRESS]: ["pause", "partial", "done", "cancel", "fake"],
  [STATUS.PAUSED]: ["resume", "cancel", "fake"],
  [STATUS.PARTIALLY_COMPLETED]: ["resume", "done", "fake"],
  [STATUS.COMPLETED_AWAIT_CONFIRM]: ["fake"],
  [STATUS.CONFIRMED]: [],
  [STATUS.CANCELLED]: [],
  [STATUS.FAKE_REPORTED]: [],
};

/* ---------------- Component ---------------- */
export default function DoerDashboard() {
  const navigation = useNavigation();

  // UI state
  const [profile, setProfile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [availableJobs, setAvailableJobs] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [processJobs, setProcessJobs] = useState([]);
  const [jobHistory, setJobHistory] = useState([]);

  const [radius, setRadius] = useState(5);
  const [location, setLocation] = useState(null);
  const [liveTrackingEnabled, setLiveTrackingEnabled] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [interestMap, setInterestMap] = useState({});
  const [actionLoadingMap, setActionLoadingMap] = useState({});
  const [activeTab, setActiveTab] = useState("available");

  // notifications
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] =
    useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifRefreshing, setNotifRefreshing] = useState(false);

  // refs + animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const locationWatcherRef = useRef(null);
  const mountedRef = useRef(true);
  const notificationListenerRef = useRef(null);
  const responseListenerRef = useRef(null);
  const pollTimerRef = useRef(null);

  // debounce loader
  const debouncedLoadJobs = useDebouncedCallback(async (coords, rad) => {
    if (!coords) return;
    await loadAvailableJobs(coords, rad);
  }, 700);

  // animate in
  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  /* ---------------- lifecycle ---------------- */
  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      try {
        await loadProfile();
        await loadLocalProcessJobs(); // early load local cached process jobs (survive logout)
        // fetch server-side process jobs as well (merge)
        await tryFetchProcessJobs();
        await loadAllJobLists(true); // initial load, fast
        await startLocationFlow();
        await fetchUnreadCount();
        await registerForPushNotifications();

        // listeners
        notificationListenerRef.current =
          Notifications.addNotificationReceivedListener(() => {
            // quick refresh on incoming notification
            loadAllJobLists();
            if (location) loadAvailableJobs(location, radius);
            fetchUnreadCount();
          });

        responseListenerRef.current =
          Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response?.notification?.request?.content?.data;
            const jobId = data?.jobId;
            if (jobId) navigation.navigate("JobDetails", { jobId });
            loadAllJobLists();
            if (location) loadAvailableJobs(location, radius);
            fetchUnreadCount();
          });

        // start polling
        startPolling();
      } catch (err) {
        console.warn("startup error:", err);
      } finally {
        if (mountedRef.current) {
          setInitialLoading(false);
          animateIn();
        }
      }
    })();

    return () => {
      mountedRef.current = false;
      stopLocationWatcher();
      stopPolling();
      if (notificationListenerRef.current)
        notificationListenerRef.current.remove();
      if (responseListenerRef.current) responseListenerRef.current.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refresh when screen focused
  useFocusEffect(
    useCallback(() => {
      // Immediate refresh on focus
      loadAllJobLists();
      fetchUnreadCount();
    }, []),
  );

  // persist processJobs whenever changed
  useEffect(() => {
    persistProcessJobs(processJobs).catch((e) =>
      console.warn("persistProcessJobs error", e),
    );
  }, [processJobs]);

  // live tracking toggle -> start/stop watcher
  useEffect(() => {
    if (liveTrackingEnabled) startLocationWatcher();
    else stopLocationWatcher();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveTrackingEnabled]);

  /* ---------------- Polling helpers ---------------- */
  const startPolling = () => {
    stopPolling();
    pollTimerRef.current = setInterval(() => {
      // poll lists for small updates
      loadAllJobLists().catch(() => {});
      fetchUnreadCount().catch(() => {});
    }, POLL_INTERVAL_MS);
  };
  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  /* ---------------- helpers: id normalization ---------------- */
  const getJobId = (j) =>
    typeof j === "object" && j ? (j.jobId ?? j.id ?? j.job_id ?? null) : j;
  // const normalizeStatus = (s) => (s || "").toString().toUpperCase();
  const normalizeStatus = (s) => {
    if (!s) return "";
    switch (s.toLowerCase()) {
      case "accepted":
        return STATUS.ACCEPTED;
      case "in_progress":
        return STATUS.IN_PROGRESS;
      case "paused":
        return STATUS.PAUSED;
      case "partially_completed":
        return STATUS.PARTIALLY_COMPLETED;
      case "completed_await_confirm":
        return STATUS.COMPLETED_AWAIT_CONFIRM;
      case "confirmed":
        return STATUS.CONFIRMED;
      case "cancelled":
        return STATUS.CANCELLED;
      case "fake_reported":
        return STATUS.FAKE_REPORTED;
      default:
        return s.toUpperCase(); // fallback
    }
  };

  /* ---------------- persistence for process jobs ---------------- */
  const persistProcessJobs = async (jobs) => {
    try {
      await AsyncStorage.setItem(
        LOCAL_PROCESS_JOBS,
        JSON.stringify(jobs ?? []),
      );
    } catch (err) {
      console.warn("persistProcessJobs", err);
    }
  };

  const loadLocalProcessJobs = async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_PROCESS_JOBS);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        // keep unique by id
        setProcessJobs((prev) => {
          const map = new Map(prev.map((p) => [getJobId(p), p]));
          parsed.forEach((p) => map.set(getJobId(p), p));
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.warn("loadLocalProcessJobs", err);
    }
  };

  const upsertLocalProcess = async (job) => {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_PROCESS_JOBS);
      const parsed = raw ? JSON.parse(raw) : [];
      const map = new Map((parsed || []).map((j) => [getJobId(j), j]));
      map.set(getJobId(job), job);
      const arr = Array.from(map.values());
      await AsyncStorage.setItem(LOCAL_PROCESS_JOBS, JSON.stringify(arr));
    } catch (err) {
      console.warn("upsertLocalProcess", err);
    }
  };

  const removeFromLocalProcess = async (jobId) => {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_PROCESS_JOBS);
      if (!raw) return;
      const parsed = JSON.parse(raw) || [];
      const filtered = parsed.filter((j) => getJobId(j) !== jobId);
      await AsyncStorage.setItem(LOCAL_PROCESS_JOBS, JSON.stringify(filtered));
    } catch (err) {
      console.warn("removeFromLocalProcess", err);
    }
  };

  /* ---------------- Loaders ---------------- */
  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem(DOER_PROFILE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
        // refresh in background
        fetchDoerProfile()
          .then((res) => {
            const serverProfile = res?.data || res;
            if (serverProfile) {
              setProfile(serverProfile);
              AsyncStorage.setItem(
                DOER_PROFILE_KEY,
                JSON.stringify(serverProfile),
              ).catch(() => {});
            }
          })
          .catch(() => {});
      } else {
        const res = await fetchDoerProfile();
        const serverProfile = res?.data || res;
        if (serverProfile) {
          setProfile(serverProfile);
          await AsyncStorage.setItem(
            DOER_PROFILE_KEY,
            JSON.stringify(serverProfile),
          );
        }
      }
    } catch (err) {
      console.warn("loadProfile error", err);
      setProfile(null);
    }
  };

  // unified loader: fetch current jobs and partition
  const loadAllJobLists = async (fast = false) => {
    // fast flag: skip some heavy stuff if necessary (not used heavily now)
    if (!fast) setLoadingJobs(true);
    try {
      // ensure available jobs are loaded (use debounced loader when location present)
      if (location) await loadAvailableJobs(location, radius);
      else await startLocationFlow();

      // fetch current jobs (doer / active + process) - server 'current' returns jobs assigned to doer,
      // we partition them into Accepted (active) and process statuses
      const curRes = await fetchCurrentJobs();
      const curJobs =
        curRes?.data?.content ||
        curRes?.data ||
        curRes?.content ||
        curRes ||
        [];
      const curArr = Array.isArray(curJobs) ? curJobs : [];

      const activeArr = [];
      const procArr = [];

      curArr.forEach((j) => {
        const s = normalizeStatus(j.status);
        if (s === STATUS.ACCEPTED) activeArr.push(j);
        else if (
          [
            STATUS.IN_PROGRESS,
            STATUS.PAUSED,
            STATUS.PARTIALLY_COMPLETED,
            STATUS.COMPLETED_AWAIT_CONFIRM,
          ].includes(s)
        ) {
          procArr.push(j);
        } else {
          // fallback: treat unknown as active
          activeArr.push(j);
        }
      });

      // Merge server proc arr with local cached processJobs to show local-only entries (persisted)
      const merged = new Map();
      procArr.forEach((p) => merged.set(String(getJobId(p)), p));

      // include local entries not on server (for offline/previous session)
      const localRaw = await AsyncStorage.getItem(LOCAL_PROCESS_JOBS);
      const localArr = localRaw ? JSON.parse(localRaw) : [];
      (Array.isArray(localArr) ? localArr : []).forEach((lp) => {
        const id = String(getJobId(lp));
        if (!merged.has(id)) merged.set(id, lp);
      });

      setActiveJobs(activeArr);
      setProcessJobs(Array.from(merged.values()));

      // load history (past jobs)
      try {
        const histRes = await fetchJobHistory(0, 30, ["updatedAt,desc"]);
        const histJobs =
          histRes?.data?.content ||
          histRes?.data ||
          histRes?.content ||
          histRes ||
          [];
        const historyFiltered = (
          Array.isArray(histJobs) ? histJobs : []
        ).filter((j) => {
          const s = normalizeStatus(j.status);
          // we treat CONFIRMED as completed (your backend used CONFIRMED)
          return [
            STATUS.CONFIRMED,
            STATUS.CANCELLED,
            STATUS.FAKE_REPORTED,
          ].includes(s);
        });
        setJobHistory(historyFiltered);
      } catch (he) {
        console.warn("fetchJobHistory error", he);
      }
    } catch (err) {
      console.warn("loadAllJobLists error:", err);
    } finally {
      if (!fast) setLoadingJobs(false);
    }
  };

  const tryFetchProcessJobs = async () => {
    // call fetchProcessJobs (if available in API) to get server-side process list directly and merge
    try {
      if (typeof fetchProcessJobs === "function") {
        const res = await fetchProcessJobs();
        const serverProc =
          res?.data?.content || res?.data || res?.content || res || [];
        if (Array.isArray(serverProc) && serverProc.length) {
          // merge with local
          setProcessJobs((prev) => {
            const map = new Map(prev.map((p) => [String(getJobId(p)), p]));
            serverProc.forEach((p) => map.set(String(getJobId(p)), p));
            return Array.from(map.values());
          });
        }
      }
    } catch (err) {
      // not fatal
      // console.warn("tryFetchProcessJobs err", err);
    }
  };

  const loadAvailableJobs = async (coords = location, rad = radius) => {
    if (!coords) return;
    setLoadingJobs(true);
    try {
      const res = await fetchAvailableJobs(coords.lat, coords.lon, rad, 0, 50, [
        "postedAgo,desc",
      ]);
      const jobs = res?.data?.content || res?.data || res?.content || res || [];
      const postedOnly = (Array.isArray(jobs) ? jobs : []).filter(
        (j) => normalizeStatus(j.status) === STATUS.POSTED,
      );
      setAvailableJobs(postedOnly);
    } catch (err) {
      console.warn("loadAvailableJobs error", err?.message || err);
      setAvailableJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadNotifications = async (onlyUnread = false, page = 0, size = 40) => {
    try {
      setNotificationsLoading(true);
      const res = await getNotifications(onlyUnread, page, size);
      const list = res?.data?.content || res?.data || res?.content || res || [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn("loadNotifications error", err);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadNotificationCount();
      let count = 0;
      if (res == null) count = 0;
      else if (typeof res === "number") count = res;
      else if (typeof res === "object" && !Array.isArray(res))
        count = Object.values(res).reduce((s, v) => s + Number(v || 0), 0);
      else count = Number(res) || 0;
      if (res && typeof res === "object" && res.unreadCount != null) {
        count = Number(res.unreadCount) || count;
      }
      setUnreadCount(count || 0);
    } catch (err) {
      console.warn("fetchUnreadCount error", err);
      setUnreadCount(0);
    }
  };

  const handleOpenNotifications = async () => {
    setNotificationsModalVisible(true);
    await loadNotifications(false, 0, 40);
    await fetchUnreadCount();
  };

  const handleMarkAsRead = async (notif) => {
    try {
      if (!notif?.id) return;
      await markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
      );
      await fetchUnreadCount();
      const jobId = notif?.jobId;
      if (jobId) {
        setNotificationsModalVisible(false);
        navigation.navigate("JobDetails", { jobId });
      }
    } catch (err) {
      console.warn("markNotificationRead error", err);
      Alert.alert("Error", "Unable to mark notification read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await fetchUnreadCount();
      Alert.alert("Done", "All notifications marked as read");
    } catch (err) {
      console.warn("markAllNotificationsRead error", err);
      Alert.alert("Error", "Unable to mark all notifications read");
    }
  };

  const onRefreshNotifications = async () => {
    setNotifRefreshing(true);
    await loadNotifications(false, 0, 40);
    await fetchUnreadCount();
    setNotifRefreshing(false);
  };

  /* ---------------- Location helpers ---------------- */
  const startLocationFlow = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission not granted");
        return;
      }

      let last = null;
      try {
        last = await Location.getLastKnownPositionAsync();
      } catch (e) {}

      if (last && mountedRef.current) {
        const coords = {
          lat: last.coords.latitude,
          lon: last.coords.longitude,
        };
        setLocation(coords);
        debouncedLoadJobs(coords, radius);
      } else {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            maximumAge: 10000,
            timeout: 5000,
          });
          if (loc?.coords && mountedRef.current) {
            const coords = {
              lat: loc.coords.latitude,
              lon: loc.coords.longitude,
            };
            setLocation(coords);
            debouncedLoadJobs(coords, radius);
          }
        } catch (e) {
          console.warn("startLocationFlow slow gps", e?.message || e);
        }
      }
    } catch (err) {
      console.warn("startLocationFlow error", err);
    }
  };

  const startLocationWatcher = async () => {
    if (locationWatcherRef.current) return;
    try {
      const options = {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 25,
      };
      locationWatcherRef.current = await Location.watchPositionAsync(
        options,
        (loc) => {
          if (!loc?.coords) return;
          const newCoords = {
            lat: loc.coords.latitude,
            lon: loc.coords.longitude,
          };
          setLocation(newCoords);
          debouncedLoadJobs(newCoords, radius);
        },
      );
    } catch (err) {
      console.warn("startLocationWatcher error", err);
    }
  };

  const stopLocationWatcher = () => {
    if (locationWatcherRef.current) {
      try {
        locationWatcherRef.current.remove();
      } catch (e) {}
      locationWatcherRef.current = null;
    }
  };

  /* ---------------- Push registration ---------------- */
  const registerForPushNotifications = async () => {
    try {
      if (!Constants.isDevice) {
        console.warn("Must use physical device for Push Notifications");
        return null;
      }
      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        });
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.warn("Push notification permission denied");
        return null;
      }
      const tokenObj = await Notifications.getExpoPushTokenAsync();
      const token = tokenObj?.data;
      await AsyncStorage.setItem("pushToken", token);
      return token;
    } catch (err) {
      console.warn("registerForPushNotifications error:", err);
      return null;
    }
  };

  /* ---------------- Interest & Actions ---------------- */
  const isActionLoading = (jobId) => !!actionLoadingMap[jobId];
  const isInterestSending = (jobId) => !!interestMap[jobId];

  const handleSendInterest = async (jobId) => {
    try {
      setInterestMap((p) => ({ ...p, [jobId]: true }));
      // optimistic feedback: show spinner, then call API
      const res = await sendInterest(jobId, "I am interested");
      Alert.alert("Success", res?.message || "Interest sent!");
      // reload lists fast
      await loadAllJobLists();
    } catch (err) {
      console.warn("sendInterest error", err);
      const msg =
        err?.response?.data?.message || err?.message || "Something went wrong";
      Alert.alert("Error", msg);
    } finally {
      setInterestMap((p) => ({ ...p, [jobId]: false }));
    }
  };

  const handleWithdrawInterest = async (jobIdOrInterestId) => {
    try {
      setInterestMap((p) => ({ ...p, [jobIdOrInterestId]: true }));
      await withdrawInterest(jobIdOrInterestId);
      Alert.alert("Success", "Interest withdrawn.");
      await loadAllJobLists();
    } catch (err) {
      console.warn("withdrawInterest error", err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Unable to withdraw",
      );
    } finally {
      setInterestMap((p) => ({ ...p, [jobIdOrInterestId]: false }));
    }
  };

  const performJobApi = async (action, jobId) => {
    switch (action) {
      case "start":
        return await startJob(jobId);
      case "pause":
        return await pauseJob(jobId);
      case "resume":
        return await resumeJob(jobId);
      case "partial":
        return await partialJob(jobId);
      case "done":
        return await completeJob(jobId);
      case "cancel":
        return await cancelJob(jobId);
      case "fake":
        return await reportFakeJob(jobId);
      default:
        throw new Error("Unknown action: " + action);
    }
  };

  const handleJobAction = async (action, jobId) => {
    // optimistic local update pattern:
    // 1) set loading
    // 2) update local lists immediately where safe
    // 3) call API
    // 4) apply server updated job (if returned)
    // 5) reload lists in background for final consistency
    try {
      setActionLoadingMap((p) => ({ ...p, [jobId]: true }));

      // optimistic local changes for start -> move from active to process
      if (action === "start") {
        // remove from active immediately
        setActiveJobs((prev) =>
          prev.filter((j) => String(getJobId(j)) !== String(jobId)),
        );
        // add placeholder to process right away (so UI is instant)
        const placeholder = {
          id: jobId,
          jobId,
          status: STATUS.IN_PROGRESS,
          title: "In progress",
          description: "",
        };
        setProcessJobs((prev) => {
          const map = new Map(prev.map((p) => [String(getJobId(p)), p]));
          map.set(String(jobId), placeholder);
          return Array.from(map.values());
        });
        upsertLocalProcess(placeholder).catch(() => {});
      }

      // call server
      const res = await performJobApi(action, jobId);
      const updatedJob =
        res?.data?.data || res?.data || res?.job || res?.data?.id
          ? res?.data
          : null;

      // apply server returned job where possible
      if (updatedJob) {
        const sid = String(getJobId(updatedJob));
        const st = normalizeStatus(updatedJob.status);

        // if server says it's a process status, ensure it's in processJobs
        if (
          [
            STATUS.IN_PROGRESS,
            STATUS.PAUSED,
            STATUS.PARTIALLY_COMPLETED,
            STATUS.COMPLETED_AWAIT_CONFIRM,
          ].includes(st)
        ) {
          setProcessJobs((prev) => {
            const map = new Map(prev.map((p) => [String(getJobId(p)), p]));
            map.set(sid, updatedJob);
            return Array.from(map.values());
          });
          // persist if still a process status
          upsertLocalProcess(updatedJob).catch(() => {});
        } else {
          // else remove from local process lists
          setProcessJobs((prev) =>
            prev.filter((p) => String(getJobId(p)) !== sid),
          );
          removeFromLocalProcess(sid).catch(() => {});
        }

        // if it's accepted then put in activeJobs
        if (st === STATUS.ACCEPTED) {
          setActiveJobs((prev) => {
            const map = new Map(prev.map((p) => [String(getJobId(p)), p]));
            map.set(sid, updatedJob);
            return Array.from(map.values());
          });
        } else {
          // ensure activeJobs doesn't hold this job if moved
          setActiveJobs((prev) =>
            prev.filter((p) => String(getJobId(p)) !== sid),
          );
        }

        // if final state -> move to history
        if (
          [STATUS.CONFIRMED, STATUS.CANCELLED, STATUS.FAKE_REPORTED].includes(
            st,
          )
        ) {
          setJobHistory((prev) => [updatedJob, ...(prev || [])]);
          setProcessJobs((prev) =>
            prev.filter((p) => String(getJobId(p)) !== sid),
          );
          setActiveJobs((prev) =>
            prev.filter((p) => String(getJobId(p)) !== sid),
          );
          removeFromLocalProcess(sid).catch(() => {});
        }
      } else {
        // If no updated job returned for non-start actions - reload lists to sync
      }

      Alert.alert("Success", res?.message || `${action} successful`);
      // background reload for final consistency (non-blocking)
      Promise.allSettled([loadAllJobLists(), fetchUnreadCount()]).catch(
        () => {},
      );
    } catch (err) {
      console.warn("handleJobAction error", err);
      const msg =
        err?.response?.data?.details?.status ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to perform action. Try again.";
      Alert.alert("Error", msg);
      // on error: reload lists to revert optimistic UI
      loadAllJobLists().catch(() => {});
    } finally {
      setActionLoadingMap((p) => ({ ...p, [jobId]: false }));
    }
  };

  const handleLogout = async () => {
    try {
      await logoutDoer();
      stopLocationWatcher();
      // intentionally keep LOCAL_PROCESS_JOBS so re-login sees them
      navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
    } catch {
      Alert.alert("Error", "Unable to logout. Try again.");
    }
  };

  /* ---------------- Render helpers ---------------- */
  const getCurrentDoerId = () => profile?.id ?? profile?.doerId ?? null;

  const isJobAssignedToMe = (job) => {
    const assigned =
      job.assignedDoerId ??
      job.doerId ??
      job.assignedToId ??
      job.doer?.id ??
      job.assigneeId ??
      null;
    const me = getCurrentDoerId();
    if (!assigned || !me) return false;
    try {
      return Number(assigned) === Number(me);
    } catch {
      return String(assigned) === String(me);
    }
  };

  const getMyInterest = (job) => {
    if (!job) return null;
    if (job.myInterest) return job.myInterest;
    if (Array.isArray(job.interests)) {
      const mine = job.interests.find(
        (it) =>
          it.isMine ||
          it.doerId === getCurrentDoerId() ||
          it.doer?.id === getCurrentDoerId(),
      );
      if (mine) return mine;
    }
    return null;
  };

  const isInterestPending = (job) => {
    const mi = getMyInterest(job);
    if (!mi) {
      const s = job.interestStatus || job.myInterestStatus || null;
      if (!s) return false;
      const su = s.toString().toUpperCase();
      return su === "PENDING" || su === "REQUESTED";
    }
    const st = (mi.status || mi.interestStatus || "").toString().toUpperCase();
    return st === "PENDING" || st === "REQUESTED";
  };

  const isInterestAccepted = (job) => {
    const mi = getMyInterest(job);
    if (!mi) {
      const s = job.interestStatus || job.myInterestStatus || null;
      if (!s) return false;
      const su = s.toString().toUpperCase();
      return su === "ACCEPTED" || su === "SELECTED";
    }
    const st = (mi.status || mi.interestStatus || "").toString().toUpperCase();
    return st === "ACCEPTED" || st === "SELECTED";
  };

  const renderActionButtons = (job) => {
    const status = normalizeStatus(job.status);
    const jobId = getJobId(job);
    const loading = loadingJobs[jobId] || false;

    const Btn = ({ title, onPress, bg = "#2563eb" }) => (
      <TouchableOpacity
        style={[
          styles.smallBtnBase,
          { backgroundColor: bg, opacity: loading ? 0.6 : 1 },
        ]}
        onPress={onPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "600" }}>{title}</Text>
        )}
      </TouchableOpacity>
    );

    switch (status) {
      case STATUS.POSTED:
        return (
          <Btn
            title={
              isInterestPending(job) ? "Withdraw Interest" : "Send Interest"
            }
            onPress={() =>
              isInterestPending(job)
                ? handleWithdrawInterest(getMyInterest(job)?.id ?? jobId)
                : handleSendInterest(jobId)
            }
            bg={isInterestPending(job) ? "#ef4444" : "#2563eb"}
          />
        );

      case STATUS.ACCEPTED:
        return (
          <Btn
            title="Start Job"
            onPress={() => handleJobAction("start", jobId)}
            bg="#16a34a"
          />
        );

      case STATUS.IN_PROGRESS:
        return (
          <>
            <Btn
              title="Pause"
              onPress={() => handleJobAction("pause", jobId)}
              bg="#f59e0b"
            />
            <Btn
              title="Mark Done"
              onPress={() => handleJobAction("done", jobId)}
              bg="#16a34a"
            />
          </>
        );

      case STATUS.PAUSED:
        return (
          <>
            <Btn
              title="Resume"
              onPress={() => handleJobAction("resume", jobId)}
              bg="#2563eb"
            />
            <Btn
              title="Cancel"
              onPress={() => handleJobAction("cancel", jobId)}
              bg="#ef4444"
            />
          </>
        );

      case STATUS.PARTIALLY_COMPLETED:
        return (
          <Btn
            title="Mark Done"
            onPress={() => handleJobAction("done", jobId)}
            bg="#16a34a"
          />
        );

      case STATUS.COMPLETED_AWAIT_CONFIRM:
        return (
          <Text style={{ color: "#6b7280", fontWeight: "700" }}>
            Awaiting Poster Confirmation
          </Text>
        );

      default:
        return null;
    }
  };

  const renderJobCard = ({ item, index }) => {
    const jobId = getJobId(item);
    const statusUpper = normalizeStatus(item.status);
    const statusColor =
      statusUpper === STATUS.CONFIRMED
        ? "#22c55e"
        : [STATUS.IN_PROGRESS, STATUS.PARTIALLY_COMPLETED].includes(statusUpper)
          ? "#2563eb"
          : "#f59e0b";

    return (
      <Animated.View
        key={`${jobId}-${index}`}
        style={[
          styles.jobCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.title}>
            {item.title || item.jobTitle || "Untitled job"}
          </Text>
          <View
            style={[styles.statusTag, { backgroundColor: statusColor + "22" }]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status || "UNKNOWN"}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.desc} numberOfLines={2}>
          {item.description ||
            item.jobDescription ||
            "No description available"}
        </Text>

        {/* Meta Info */}
        {Number(item.amountInRs) > 0 && (
          <View style={styles.metaRow}>
            <Ionicons name="cash-outline" size={16} color="#475569" />
            <Text
              style={[styles.metaText, { fontWeight: "700", color: "#16a34a" }]}
            >
              ₹ {item.amountInRs}
            </Text>
            {item.distanceKm != null && (
              <Text style={[styles.metaText, { marginLeft: 10 }]}>
                {Number(item.distanceKm).toFixed(1)} km away
              </Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          {activeTab === "available" && (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: "#2563eb", marginRight: 8 },
              ]}
              onPress={() => handleSendInterest(jobId)}
              disabled={isInterestSending(jobId)}
            >
              {isInterestSending(jobId) ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionText}>
                  {(item.myInterestStatus || item.interestStatus || "")
                    .toString()
                    .toUpperCase() === "PENDING"
                    ? "Interest Pending"
                    : "Send Interest"}
                </Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: "#6b7280", marginRight: 8 },
            ]}
            onPress={() => navigation.navigate("JobDetails", { jobId })}
          >
            <Text style={styles.actionText}>View Details</Text>
          </TouchableOpacity>

          {/* Chat Button */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#10b981" }]}
            onPress={() => navigation.navigate("ChatRoomScreen", { jobId })}
          >
            <Text style={styles.actionText}>Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Status Action Buttons */}
        <View style={{ flexDirection: "row", marginTop: 12 }}>
          {renderActionButtons(item)}
        </View>
      </Animated.View>
    );
  };

  const renderProfileSection = () => {
    const acceptedCount = (activeJobs || []).length;
    const completedCount = (jobHistory || []).length;
    const rating = profile?.rating ?? 4.7;

    return (
      <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{
            backgroundColor: "#2563eb",
            padding: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#fff" }}>
            {profile?.name || "Doer"}
          </Text>
          <Text style={{ color: "#f3f4f6", marginTop: 4 }}>
            {profile?.phone || "No phone"}
          </Text>
          <Text style={{ color: "#cbd5e1", marginTop: 2 }}>
            Member since {profile?.createdAt?.slice(0, 10) || "—"}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            paddingVertical: 16,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>
              {acceptedCount}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>Active Jobs</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>
              {completedCount}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>Completed</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#111827" }}>
              {rating.toFixed(1)}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 12 }}>Rating</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Personal Information
          </Text>
          {[
            ["Email", profile?.email],
            ["Bio", profile?.bio],
            [
              "Skills",
              Array.isArray(profile?.skills)
                ? profile.skills.join(", ")
                : profile?.skills || "—",
            ],
          ].map(([label, value], idx) => (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderBottomWidth: 0.5,
                borderColor: "#e5e7eb",
                paddingVertical: 8,
              }}
            >
              <Text style={{ fontWeight: "600", color: "#374151" }}>
                {label}
              </Text>
              <Text
                style={{
                  color: "#111827",
                  flex: 1,
                  textAlign: "right",
                  marginLeft: 10,
                }}
              >
                {value || "—"}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#111827",
              marginBottom: 12,
            }}
          >
            Actions
          </Text>

          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate("DoerProfile")}
          >
            <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
            <Text style={styles.profileBtnText}>View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Ionicons name="create-outline" size={20} color="#2563eb" />
            <Text style={styles.profileBtnText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.profileBtn,
              { opacity: profile?.isPhoneVerified ? 1 : 0.5 },
            ]}
            disabled={!profile?.isPhoneVerified}
            onPress={() => {
              if (!profile?.isPhoneVerified) {
                Alert.alert("Phone not verified", "Verify your phone first.");
                return;
              }
              navigation.navigate("KYCPage");
            }}
          >
            <Ionicons name="document-text-outline" size={20} color="#2563eb" />
            <Text style={styles.profileBtnText}>Upload KYC</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.profileBtn, { borderColor: "#ef4444" }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={[styles.profileBtnText, { color: "#ef4444" }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    );
  };

  /* ---------------- Render ---------------- */
  if (initialLoading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#111827" barStyle="light-content" />

      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Doer Dashboard</Text>

        <View
          style={{
            position: "absolute",
            right: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{ marginRight: 12 }}
            onPress={handleOpenNotifications}
            accessibilityLabel="Open notifications"
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications modal */}
      <Modal
        visible={notificationsModalVisible}
        animationType="slide"
        onRequestClose={() => setNotificationsModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 16,
              borderBottomWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700" }}>
              Notifications
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={handleMarkAllRead}
                style={{ marginRight: 12 }}
              >
                <Text style={{ color: "#2563eb", fontWeight: "600" }}>
                  Mark all read
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setNotificationsModalVisible(false)}
              >
                <Text style={{ color: "#ef4444", fontWeight: "600" }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={notifications ?? []}
            keyExtractor={(n) => String(n.id)}
            refreshControl={
              <RefreshControl
                refreshing={notifRefreshing}
                onRefresh={onRefreshNotifications}
              />
            }
            ListEmptyComponent={
              <Text
                style={{ textAlign: "center", color: "#6b7280", marginTop: 40 }}
              >
                No notifications
              </Text>
            }
            renderItem={({ item: n }) => (
              <TouchableOpacity
                onPress={() => handleMarkAsRead(n)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: n.isRead ? "#f8fafc" : "#eef2ff",
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: n.isRead ? "#e6e7eb" : "#e0e7ff",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontWeight: n.isRead ? "600" : "800" }}>
                    {n.title || "Notification"}
                  </Text>
                  <Text style={{ color: "#6b7280", fontSize: 12 }}>
                    {n.createdAt
                      ? n.createdAt.slice(0, 16).replace("T", " ")
                      : ""}
                  </Text>
                </View>
                <Text style={{ color: "#374151", marginTop: 6 }}>
                  {n.message}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ padding: 16 }}
          />
        </SafeAreaView>
      </Modal>

      {/* small controls */}
      <View
        style={{
          padding: 12,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "700" }}>
            Location:{" "}
            {location
              ? `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
              : "Unavailable"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ marginRight: 8, color: "#374151" }}>Live</Text>
            <Switch
              value={liveTrackingEnabled}
              onValueChange={setLiveTrackingEnabled}
            />
          </View>
        </View>

        {location == null && (
          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#b91c1c", flex: 1 }}>
              Location not available yet. Jobs will appear when location is
              determined.
            </Text>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={startLocationFlow}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* TABS */}
      <View style={{ flex: 1 }}>
        {activeTab === "available" && (
          <View style={{ flex: 1 }}>
            <View style={styles.radiusBox}>
              <Text style={styles.radiusText}>
                Search Radius: {radius.toFixed(1)} km —{" "}
                {(availableJobs || []).length} jobs found
              </Text>
              <View style={styles.radiusOptions}>
                {[1, 3, 5, 10, 15, 30].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.radiusBtn,
                      radius === r && { backgroundColor: "#2563eb" },
                    ]}
                    onPress={() => {
                      setRadius(r);
                      if (location) debouncedLoadJobs(location, r);
                      else startLocationFlow();
                    }}
                  >
                    <Text style={{ color: radius === r ? "#fff" : "#111827" }}>
                      {r} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={1}
                maximumValue={30}
                step={0.5}
                value={radius}
                onValueChange={(val) => {
                  setRadius(val);
                  if (location) debouncedLoadJobs(location, val);
                }}
                minimumTrackTintColor="#2563eb"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#2563eb"
              />
            </View>

            {loadingJobs && (
              <View style={{ padding: 10, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#2563eb" />
              </View>
            )}

            <FlatList
              data={availableJobs ?? []}
              keyExtractor={(item) => String(getJobId(item) ?? Math.random())}
              renderItem={renderJobCard}
              contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
              ListEmptyComponent={() =>
                !profile?.isKYCCompleted ? (
                  <Text style={styles.emptyText}>
                    Complete your KYC first to see available jobs.
                  </Text>
                ) : (
                  <Text style={styles.emptyText}>
                    No nearby jobs. Try increasing the search radius.
                  </Text>
                )
              }
            />
          </View>
        )}

        {activeTab === "current" && (
          <FlatList
            data={activeJobs ?? []}
            keyExtractor={(item) => String(getJobId(item) ?? Math.random())}
            renderItem={renderJobCard}
            contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No active jobs.</Text>
            }
          />
        )}

        {activeTab === "process" && (
          <FlatList
            data={processJobs ?? []}
            keyExtractor={(item) => String(getJobId(item) ?? Math.random())}
            renderItem={renderJobCard}
            contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No jobs in process.</Text>
            }
          />
        )}

        {activeTab === "history" &&
          normalizeStatus(item.status) === STATUS.CONFIRMED && (
            <TouchableOpacity
              style={{
                marginTop: 10,
                backgroundColor: "#2563eb",
                paddingVertical: 8,
                borderRadius: 8,
                alignItems: "center",
              }}
              onPress={() => navigation.navigate("DoerInvoice", { job: item })}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                Download Invoice
              </Text>
            </TouchableOpacity>
          )}

        {activeTab === "profile" && renderProfileSection()}
      </View>

      {/* bottom nav */}
      <View style={styles.bottomNav}>
        {[
          { key: "available", icon: "briefcase-outline", label: "Available" },
          { key: "current", icon: "flash-outline", label: "Active" },
          { key: "process", icon: "sync-outline", label: "Process" },
          { key: "history", icon: "time-outline", label: "History" },
          { key: "profile", icon: "person-outline", label: "Profile" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={22}
              color={activeTab === tab.key ? "#2563eb" : "#9ca3af"}
            />
            <Text
              style={[
                styles.navLabel,
                { color: activeTab === tab.key ? "#2563eb" : "#9caaf" },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    height: 56,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  topTitle: { color: "#fff", fontWeight: "800", fontSize: 18 },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#ef4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  radiusBox: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },
  radiusText: { fontWeight: "700", color: "#111827", marginBottom: 6 },
  radiusOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  radiusBtn: { padding: 6, borderRadius: 6, backgroundColor: "#e5e7eb" },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },
  desc: { fontSize: 13, color: "#4b5563", marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  metaText: { fontSize: 13, color: "#475569", marginLeft: 4 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "600" },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { color: "#fff", fontWeight: "600" },
  smallBtnBase: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
    marginRight: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
    marginTop: 40,
  },
  profileBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#fff",
  },
  profileBtnText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    elevation: 10,
  },
  navItem: { alignItems: "center", justifyContent: "center" },
  navLabel: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  smallBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
});

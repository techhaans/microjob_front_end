// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   fetchPosterProfile,
//   updatePosterProfile,
//   sendPosterPhoneOtp,
//   verifyPosterPhoneOtp,
// } from "../api/poster";

// export default function PosterProfileScreen() {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [profile, setProfile] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     about: "",
//     isPhoneVerified: false,
//   });

//   const [otpSessionId, setOtpSessionId] = useState(null);
//   const [otp, setOtp] = useState("");
//   const [sendingOtp, setSendingOtp] = useState(false);
//   const [verifyingOtp, setVerifyingOtp] = useState(false);

//   // Load profile on mount
//   const loadProfile = async () => {
//     setLoading(true);
//     try {
//       const data = await fetchPosterProfile();
//       setProfile({
//         name: data.name || "",
//         email: data.email || "",
//         phone: data.phone || "",
//         about: data.about || "",
//         isPhoneVerified: data.isPhoneVerified || false,
//       });
//     } catch (err) {
//       console.error("Fetch Profile Error:", err);
//       // Handle new user
//       if (err.response?.status === 400) {
//         // Optionally prefill email from JWT or AsyncStorage
//         const token = await AsyncStorage.getItem("authToken");
//         let email = "";
//         if (token) {
//           const payload = JSON.parse(atob(token.split(".")[1]));
//           email = payload.email || "";
//         }
//         setProfile({
//           name: "",
//           email,
//           phone: "",
//           about: "",
//           isPhoneVerified: false,
//         });
//       } else {
//         Alert.alert("Error", "Failed to fetch profile");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadProfile();
//   }, []);

//   // Save profile
//   const handleSave = async () => {
//     if (!profile.name || !profile.phone) {
//       return Alert.alert("Error", "Name and Phone are required");
//     }
//     setSaving(true);
//     try {
//       const res = await updatePosterProfile({
//         Name: profile.name,
//         phone: profile.phone,
//         about: profile.about,
//       });
//       Alert.alert("Success", "Profile saved successfully");
//       setProfile((prev) => ({ ...prev, isPhoneVerified: false }));
//     } catch (err) {
//       console.error("Save Profile Error:", err);
//       Alert.alert("Error", "Failed to save profile");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Send OTP
//   const handleSendOtp = async () => {
//     if (!profile.phone) return Alert.alert("Error", "Phone number is required");
//     setSendingOtp(true);
//     try {
//       const res = await sendPosterPhoneOtp();
//       if (res.status === "SUCCESS") {
//         setOtpSessionId(res.data.sessionId);
//         Alert.alert("OTP Sent", res.data.message || "OTP sent successfully");
//       } else {
//         Alert.alert("Error", res.message || "Failed to send OTP");
//       }
//     } catch (err) {
//       console.error("Send OTP Error:", err);
//       Alert.alert("Error", "Failed to send OTP");
//     } finally {
//       setSendingOtp(false);
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     if (!otpSessionId || !otp) return Alert.alert("Error", "Enter OTP first");
//     setVerifyingOtp(true);
//     try {
//       const res = await verifyPosterPhoneOtp(otpSessionId, otp);
//       if (res.status === "SUCCESS") {
//         Alert.alert("Success", res.message || "Phone verified successfully");
//         setProfile((prev) => ({ ...prev, isPhoneVerified: true }));
//       } else {
//         Alert.alert("Error", res.message || "OTP verification failed");
//       }
//     } catch (err) {
//       console.error("Verify OTP Error:", err);
//       Alert.alert("Error", "OTP verification failed");
//     } finally {
//       setVerifyingOtp(false);
//     }
//   };

//   if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.label}>Email</Text>
//       <TextInput
//         style={[styles.input, { backgroundColor: "#eee" }]}
//         value={profile.email}
//         editable={false}
//       />

//       <Text style={styles.label}>Name</Text>
//       <TextInput
//         style={styles.input}
//         value={profile.name}
//         onChangeText={(text) => setProfile({ ...profile, name: text })}
//       />

//       <Text style={styles.label}>Phone</Text>
//       <TextInput
//         style={styles.input}
//         value={profile.phone}
//         onChangeText={(text) => setProfile({ ...profile, phone: text })}
//         placeholder="+919876543210"
//       />

//       <Text style={styles.label}>About</Text>
//       <TextInput
//         style={styles.input}
//         value={profile.about}
//         onChangeText={(text) => setProfile({ ...profile, about: text })}
//         multiline
//       />

//       <TouchableOpacity
//         style={styles.button}
//         onPress={handleSave}
//         disabled={saving}
//       >
//         <Text style={styles.buttonText}>
//           {saving ? "Saving..." : "Save Profile"}
//         </Text>
//       </TouchableOpacity>

//       {!profile.isPhoneVerified && profile.phone ? (
//         <>
//           <TouchableOpacity
//             style={[styles.button, { backgroundColor: "#007bff" }]}
//             onPress={handleSendOtp}
//             disabled={sendingOtp}
//           >
//             <Text style={styles.buttonText}>
//               {sendingOtp ? "Sending OTP..." : "Send OTP"}
//             </Text>
//           </TouchableOpacity>

//           {otpSessionId && (
//             <>
//               <TextInput
//                 style={styles.input}
//                 value={otp}
//                 onChangeText={setOtp}
//                 placeholder="Enter OTP"
//                 keyboardType="number-pad"
//               />
//               <TouchableOpacity
//                 style={[styles.button, { backgroundColor: "#28a745" }]}
//                 onPress={handleVerifyOtp}
//                 disabled={verifyingOtp}
//               >
//                 <Text style={styles.buttonText}>
//                   {verifyingOtp ? "Verifying..." : "Verify OTP"}
//                 </Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </>
//       ) : (
//         profile.phone && (
//           <Text style={{ color: "green", marginTop: 10 }}>
//             Phone Verified ✅
//           </Text>
//         )
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#fff", flex: 1 },
//   label: { fontWeight: "bold", marginTop: 10 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//     padding: 10,
//     marginTop: 5,
//   },
//   button: {
//     backgroundColor: "#ff6b6b",
//     padding: 15,
//     borderRadius: 5,
//     marginTop: 15,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "bold" },
// });
import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Buffer } from "buffer"; // For decoding JWT
import {
  fetchPosterProfile,
  updatePosterProfile,
  sendPosterPhoneOtp,
  verifyPosterPhoneOtp,
} from "../api/poster";

export default function PosterProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    about: "",
    isPhoneVerified: false,
  });

  const [otpSessionId, setOtpSessionId] = useState(null);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // ---------- Header with Back Button ----------
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Profile",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 12 }}
        >
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // ---------- Load Profile ----------
  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchPosterProfile();

      if (data && (data.name || data.email || data.phone)) {
        // Use API data if available
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          about: data.about || "",
          isPhoneVerified: data.isPhoneVerified || false,
        });
      } else {
        // Fallback to token
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const payload = JSON.parse(
            Buffer.from(token.split(".")[1], "base64").toString()
          );
          setProfile({
            name: payload.name || "",
            email: payload.email || "",
            phone: "",
            about: "",
            isPhoneVerified: false,
          });
        } else {
          setProfile({
            name: "",
            email: "",
            phone: "",
            about: "",
            isPhoneVerified: false,
          });
        }
      }
    } catch (err) {
      console.error("Fetch Profile Error:", err);
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        const payload = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );
        setProfile({
          name: payload.name || "",
          email: payload.email || "",
          phone: "",
          about: "",
          isPhoneVerified: false,
        });
      } else {
        Alert.alert("Error", "Failed to fetch profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ---------- Save Profile ----------
  const handleSave = async () => {
    if (!profile.name || !profile.phone) {
      return Alert.alert("Error", "Name and Phone are required");
    }
    setSaving(true);
    try {
      await updatePosterProfile({
        Name: profile.name,
        phone: profile.phone,
        about: profile.about,
      });
      Alert.alert("Success", "Profile saved successfully");
      setProfile((prev) => ({ ...prev, isPhoneVerified: false }));
    } catch (err) {
      console.error("Save Profile Error:", err);
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Send OTP ----------
  const handleSendOtp = async () => {
    if (!profile.phone) return Alert.alert("Error", "Phone number is required");
    setSendingOtp(true);
    try {
      const res = await sendPosterPhoneOtp();
      if (res.status === "SUCCESS") {
        setOtpSessionId(res.data.sessionId);
        Alert.alert("OTP Sent", res.data.message || "OTP sent successfully");
      } else {
        Alert.alert("Error", res.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP Error:", err);
      Alert.alert("Error", "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // ---------- Verify OTP ----------
  const handleVerifyOtp = async () => {
    if (!otpSessionId || !otp) return Alert.alert("Error", "Enter OTP first");
    setVerifyingOtp(true);
    try {
      const res = await verifyPosterPhoneOtp(otpSessionId, otp);
      if (res.status === "SUCCESS") {
        Alert.alert("Success", res.message || "Phone verified successfully");
        setProfile((prev) => ({ ...prev, isPhoneVerified: true }));
      } else {
        Alert.alert("Error", res.message || "OTP verification failed");
      }
    } catch (err) {
      console.error("Verify OTP Error:", err);
      Alert.alert("Error", "OTP verification failed");
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container}>
      {/* ---------- Display logged-in user info ---------- */}
      <View style={styles.profileHeader}>
        <Text style={styles.welcomeText}>
          Welcome, {profile.name || "User"} 👋
        </Text>
        {profile.about ? (
          <Text style={styles.aboutText}>{profile.about}</Text>
        ) : null}
      </View>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, { backgroundColor: "#eee" }]}
        value={profile.email}
        editable={false}
      />

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={profile.name}
        onChangeText={(text) => setProfile({ ...profile, name: text })}
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={profile.phone}
        onChangeText={(text) => setProfile({ ...profile, phone: text })}
        placeholder="+919876543210"
      />

      <Text style={styles.label}>About</Text>
      <TextInput
        style={styles.input}
        value={profile.about}
        onChangeText={(text) => setProfile({ ...profile, about: text })}
        multiline
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Saving..." : "Save Profile"}
        </Text>
      </TouchableOpacity>

      {!profile.isPhoneVerified && profile.phone ? (
        <>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#007bff" }]}
            onPress={handleSendOtp}
            disabled={sendingOtp}
          >
            <Text style={styles.buttonText}>
              {sendingOtp ? "Sending OTP..." : "Send OTP"}
            </Text>
          </TouchableOpacity>

          {otpSessionId && (
            <>
              <TextInput
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter OTP"
                keyboardType="number-pad"
              />
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#28a745" }]}
                onPress={handleVerifyOtp}
                disabled={verifyingOtp}
              >
                <Text style={styles.buttonText}>
                  {verifyingOtp ? "Verifying..." : "Verify OTP"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </>
      ) : (
        profile.phone && (
          <Text style={{ color: "green", marginTop: 10 }}>
            Phone Verified ✅
          </Text>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  profileHeader: { marginBottom: 20, alignItems: "flex-start" },
  welcomeText: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  aboutText: { fontSize: 14, color: "#555" },
  label: { fontWeight: "bold", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  button: {
    backgroundColor: "#ff6b6b",
    padding: 15,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

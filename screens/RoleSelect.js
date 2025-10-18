


// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   ActivityIndicator,
//   BackHandler,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   selectRole,
//   fetchDoerProfile,
//   fetchPosterProfile,
// } from "../api/auth";

// export default function RoleSelect({ navigation }) {
//   const [loading, setLoading] = useState(false);

//   // ✅ Override hardware back button
//   useEffect(() => {
//     const backAction = () => {
//       navigation.reset({
//         index: 0,
//         routes: [{ name: "LoginPage" }],
//       });
//       return true; // prevent default behavior
//     };

//     const backHandler = BackHandler.addEventListener(
//       "hardwareBackPress",
//       backAction
//     );

//     return () => backHandler.remove();
//   }, []);

//   const handleRoleSelect = async (role) => {
//     try {
//       setLoading(true);

//       // 1️⃣ Select role
//       const res = await selectRole(role);
//       if (res.status !== "SUCCESS") {
//         Alert.alert("Error", res.message || "Role selection failed");
//         return;
//       }

//       const { accessToken, refreshToken } = res.data || {};
//       if (accessToken) await AsyncStorage.setItem("authToken", accessToken);
//       if (refreshToken)
//         await AsyncStorage.setItem("refreshToken", refreshToken);
//       await AsyncStorage.setItem("userRole", role.toUpperCase());

//       Alert.alert("Success", `Role selected: ${role}`);

//       // 2️⃣ Fetch profile based on role
//       let profile = null;
//       if (role.toUpperCase() === "DOER") {
//         const profileRes = await fetchDoerProfile();
//         if (profileRes?.status === "SUCCESS") profile = profileRes.data;
//         await AsyncStorage.setItem("doerProfile", JSON.stringify(profile || {}));
//       } else {
//         const profileRes = await fetchPosterProfile();
//         if (profileRes?.status === "SUCCESS") profile = profileRes.data;
//         await AsyncStorage.setItem("posterProfile", JSON.stringify(profile || {}));
//       }

//       // 3️⃣ Navigate to dashboard
//       const routeName =
//         role.toUpperCase() === "DOER" ? "Dashboard" : "PosterDashboard";

//       navigation.reset({
//         index: 0,
//         routes: [{ name: routeName }],
//       });
//     } catch (err) {
//       console.error("[RoleSelect Error]", err);
//       Alert.alert(
//         "Error",
//         err.response?.data?.message || err.message || "Failed to select role"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Select Your Role</Text>

//       {loading ? (
//         <ActivityIndicator size="large" color="#1E90FF" />
//       ) : (
//         <>
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => handleRoleSelect("DOER")}
//           >
//             <Text style={styles.buttonText}>DOER</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => handleRoleSelect("POSTER")}
//           >
//             <Text style={styles.buttonText}>POSTER</Text>
//           </TouchableOpacity>
//         </>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#071A52",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 24,
//     color: "#fff",
//     fontWeight: "bold",
//     marginBottom: 40,
//   },
//   button: {
//     backgroundColor: "#1E90FF",
//     paddingVertical: 15,
//     borderRadius: 10,
//     width: "80%",
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   buttonText: { color: "#fff", fontWeight: "600", fontSize: 18 },
// });
// ✅ screens/RoleSelect.js
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   ActivityIndicator,
//   BackHandler,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   selectRole,
//   fetchDoerProfile,
//   fetchPosterProfile,
// } from "../api/auth";

// export default function RoleSelect({ navigation }) {
//   const [loading, setLoading] = useState(false);

//   // ✅ Override hardware back button
//   useEffect(() => {
//     const backAction = () => {
//       navigation.reset({
//         index: 0,
//         routes: [{ name: "LoginPage" }],
//       });
//       return true; // prevent default behavior
//     };

//     const backHandler = BackHandler.addEventListener(
//       "hardwareBackPress",
//       backAction
//     );

//     return () => backHandler.remove();
//   }, []);

//   const handleRoleSelect = async (role) => {
//     try {
//       setLoading(true);

//       // 1️⃣ Select role
//       const res = await selectRole(role);
//       if (res.status !== "SUCCESS") {
//         Alert.alert("Error", res.message || "Role selection failed");
//         return;
//       }

//       const { accessToken, refreshToken } = res.data || {};

//       if (accessToken) {
//         await AsyncStorage.setItem("authToken", accessToken);
//         console.log("Access Token:", accessToken); // ✅ log access token
//       }
//       if (refreshToken) {
//         await AsyncStorage.setItem("refreshToken", refreshToken);
//         console.log("Refresh Token:", refreshToken); // ✅ log refresh token
//       }

//       await AsyncStorage.setItem("userRole", role.toUpperCase());
//       console.log("Selected Role:", role.toUpperCase()); // ✅ log role

//       Alert.alert("Success", `Role selected: ${role}`);

//       // 2️⃣ Fetch profile based on role
//       let profile = null;
//       if (role.toUpperCase() === "DOER") {
//         const profileRes = await fetchDoerProfile();
//         if (profileRes?.status === "SUCCESS") profile = profileRes.data;
//         await AsyncStorage.setItem("doerProfile", JSON.stringify(profile || {}));
//       } else {
//         const profileRes = await fetchPosterProfile();
//         if (profileRes?.status === "SUCCESS") profile = profileRes.data;
//         await AsyncStorage.setItem("posterProfile", JSON.stringify(profile || {}));
//       }

//       // 3️⃣ Navigate to dashboard
//       const routeName =
//         role.toUpperCase() === "DOER" ? "Dashboard" : "PosterDashboard";

//       navigation.reset({
//         index: 0,
//         routes: [{ name: routeName }],
//       });
//     } catch (err) {
//       console.error("[RoleSelect Error]", err);
//       Alert.alert(
//         "Error",
//         err.response?.data?.message || err.message || "Failed to select role"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Select Your Role</Text>

//       {loading ? (
//         <ActivityIndicator size="large" color="#1E90FF" />
//       ) : (
//         <>
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => handleRoleSelect("DOER")}
//           >
//             <Text style={styles.buttonText}>DOER</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => handleRoleSelect("POSTER")}
//           >
//             <Text style={styles.buttonText}>POSTER</Text>
//           </TouchableOpacity>
//         </>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#071A52",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 24,
//     color: "#fff",
//     fontWeight: "bold",
//     marginBottom: 40,
//   },
//   button: {
//     backgroundColor: "#1E90FF",
//     paddingVertical: 15,
//     borderRadius: 10,
//     width: "80%",
//     alignItems: "center",
//     marginVertical: 10,
//   },
//   buttonText: { color: "#fff", fontWeight: "600", fontSize: 18 },
// });
//corret code

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { selectRole, fetchDoerProfile, fetchPosterProfile } from "../api/auth";

export default function RoleSelect({ navigation }) {
  const [loading, setLoading] = useState(false);

  // ✅ Override hardware back button
  useEffect(() => {
    const backAction = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginPage" }],
      });
      return true; // prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const handleRoleSelect = async (role) => {
    try {
      setLoading(true);

      // 1️⃣ Select role
      const res = await selectRole(role);

      if (res.status !== "SUCCESS") {
        Alert.alert("Error", res.message || "Role selection failed");
        return;
      }

      const { accessToken, refreshToken, email } = res.data || {};

      if (!accessToken) {
        Alert.alert("Error", "No access token returned");
        return;
      }

      await AsyncStorage.setItem("authToken", accessToken);
      if (refreshToken) await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("userRole", role.toUpperCase());

      // Only store email if it exists
      if (email) await AsyncStorage.setItem("userEmail", email);

      console.log("[RoleSelect] Access Token:", accessToken);
      console.log("[RoleSelect] Refresh Token:", refreshToken);
      console.log("[RoleSelect] Email:", email);

      Alert.alert("Success", `Selected Role: ${role}`);

      // 2️⃣ Fetch profile based on role
      let profile = null;

      if (role.toUpperCase() === "DOER") {
        try {
          const profileRes = await fetchDoerProfile();
          if (profileRes?.status === "SUCCESS") profile = profileRes.data;
        } catch (err) {
          console.warn("[RoleSelect] No profile found, new user");
          const storedEmail = email || (await AsyncStorage.getItem("userEmail"));
          profile = {
            email: storedEmail,
            fullName: "",
            phone: "",
            bio: "",
            skills: [],
            kycStatus: "PENDING",
          };
        }
        await AsyncStorage.setItem("doerProfile", JSON.stringify(profile));
      } else {
        try {
          const profileRes = await fetchPosterProfile();
          if (profileRes?.status === "SUCCESS") profile = profileRes.data;
        } catch (err) {
          console.warn("[RoleSelect] No poster profile found, new user");
          const storedEmail = email || (await AsyncStorage.getItem("userEmail"));
          profile = {
            email: storedEmail,
            Name: "",
            phone: "",
            about: "",
          };
        }
        await AsyncStorage.setItem("posterProfile", JSON.stringify(profile));
      }

      // 3️⃣ Navigate to dashboard
      const routeName = role.toUpperCase() === "DOER" ? "Dashboard" : "PosterDashboard";
      navigation.reset({
        index: 0,
        routes: [{ name: routeName }],
      });
    } catch (err) {
      console.error("[RoleSelect Error]", err);
      Alert.alert(
        "Error",
        err.response?.data?.message || err.message || "Failed to select role"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Role</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1E90FF" />
      ) : (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleRoleSelect("DOER")}
          >
            <Text style={styles.buttonText}>DOER</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleRoleSelect("POSTER")}
          >
            <Text style={styles.buttonText}>POSTER</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071A52",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#1E90FF",
    paddingVertical: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 18 },
});

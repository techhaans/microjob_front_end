// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   Alert,
//   Platform,
//   ActivityIndicator,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";

// export default function KYCPage({ navigation }) {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // ✅ Pick image only (no PDF option)
//   const pickFile = async () => {
//     try {
//       const { status } =
//         await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert(
//           "Permission required",
//           "Please allow access to your gallery"
//         );
//         return;
//       }

//       const result = await ImagePicker.launchImageLibraryAsync({
//         allowsEditing: true,
//         quality: 1,
//       });

//       if (!result.canceled && result.assets?.length > 0) {
//         const asset = result.assets[0];
//         setFile({
//           uri: asset.uri,
//           name: "kyc_image.jpg",
//           type: "image/jpeg",
//         });
//       }
//     } catch (err) {
//       if (__DEV__) console.log("File pick error:", err);
//       Alert.alert("Error", "Failed to pick a file.");
//     }
//   };

//   // ✅ Upload file to backend
//   const handleUpload = async () => {
//     if (!file || !file.uri) {
//       Alert.alert("Error", "Please select an image first.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const token = await AsyncStorage.getItem("authToken");

//       // Android emulator uses 10.0.2.2 to reach localhost
//       const BASE_URL =
//         Platform.OS === "android"
//           ? "http://10.0.2.2:8080"
//           : "http://localhost:8080";

//       // Fix Android file:// prefix if missing
//       let fileUri = file.uri;
//       if (Platform.OS === "android" && !fileUri.startsWith("file://")) {
//         fileUri = "file://" + fileUri;
//       }

//       const formData = new FormData();
//       formData.append("file", {
//         uri: fileUri,
//         name: file.name,
//         type: file.type,
//       });

//       const res = await axios.post(
//         `${BASE_URL}/api/doer/profile/doc/upload?docType=PanCard`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       Alert.alert(
//         "✅ Success",
//         res.data?.message || "KYC uploaded successfully!"
//       );
//       setFile(null);
//       navigation.goBack();
//     } catch (err) {
//       // 🔍 Log only in dev mode
//       if (__DEV__)
//         console.log("📡 Upload Error:", err.response?.data || err.message);

//       // Extract meaningful backend message
//       const backendMsg =
//         err.response?.data?.details?.message ||
//         err.response?.data?.message ||
//         err.response?.data?.error ||
//         err.message ||
//         "Something went wrong.";

//       // ✅ Handle specific backend scenarios
//       if (backendMsg.includes("Already uploaded")) {
//         Alert.alert(
//           "ℹ️ Info",
//           "Your KYC is already uploaded and pending review."
//         );
//       } else if (
//         err.message?.includes("Network Error") ||
//         err.code === "ERR_NETWORK"
//       ) {
//         Alert.alert(
//           "Connection Error",
//           "Server not reachable. Please check your Wi-Fi or backend connection."
//         );
//       } else if (backendMsg.includes("File too large")) {
//         Alert.alert(
//           "⚠️ File Error",
//           "File too large! Maximum allowed size is 2MB."
//         );
//       } else {
//         Alert.alert("Upload Failed", backendMsg);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Upload KYC</Text>

//       <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
//         <Text style={styles.filePickerText}>
//           {file ? "Change Image" : "Choose KYC Image"}
//         </Text>
//       </TouchableOpacity>

//       {file && file.type?.startsWith("image/") && (
//         <Image source={{ uri: file.uri }} style={styles.preview} />
//       )}

//       <TouchableOpacity
//         style={[styles.uploadBtn, loading && { opacity: 0.7 }]}
//         onPress={handleUpload}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator size="small" color="#fff" />
//         ) : (
//           <Text style={styles.uploadText}>Upload KYC</Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     alignItems: "center",
//     backgroundColor: "#f0f4f7",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#333",
//   },
//   filePicker: {
//     backgroundColor: "#fff",
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//     borderRadius: 12,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#ccc",
//   },
//   filePickerText: {
//     fontSize: 16,
//     color: "#555",
//   },
//   preview: {
//     width: 250,
//     height: 250,
//     borderRadius: 10,
//     marginBottom: 20,
//   },
//   uploadBtn: {
//     backgroundColor: "#2196f3",
//     paddingVertical: 15,
//     paddingHorizontal: 60,
//     borderRadius: 12,
//   },
//   uploadText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 18,
//   },
// });
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons"; // 👈 Import icons (for back arrow)

export default function KYCPage({ navigation }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Pick image only (no PDF option)
  const pickFile = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow access to your gallery"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setFile({
          uri: asset.uri,
          name: "kyc_image.jpg",
          type: "image/jpeg",
        });
      }
    } catch (err) {
      if (__DEV__) console.log("File pick error:", err);
      Alert.alert("Error", "Failed to pick a file.");
    }
  };

  // ✅ Upload file to backend
  const handleUpload = async () => {
    if (!file || !file.uri) {
      Alert.alert("Error", "Please select an image first.");
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");

      const BASE_URL =
        Platform.OS === "android"
          ? "http://192.168.1.40:8080"
          : "http://192.168.1.40:8080";

      let fileUri = file.uri;
      if (Platform.OS === "android" && !fileUri.startsWith("file://")) {
        fileUri = "file://" + fileUri;
      }

      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        name: file.name,
        type: file.type,
      });

      const res = await axios.post(
        `${BASE_URL}/api/doer/profile/doc/upload?docType=PanCard`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert(
        "✅ Success",
        res.data?.message || "KYC uploaded successfully!"
      );
      setFile(null);
      navigation.navigate("Dashboard"); // ✅ Go to Dashboard
    } catch (err) {
      if (__DEV__)
        console.log("📡 Upload Error:", err.response?.data || err.message);

      const backendMsg =
        err.response?.data?.details?.message ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong.";

      if (backendMsg.includes("Already uploaded")) {
        Alert.alert(
          "ℹ️ Info",
          "Your KYC is already uploaded and pending review."
        );
      } else if (
        err.message?.includes("Network Error") ||
        err.code === "ERR_NETWORK"
      ) {
        Alert.alert(
          "Connection Error",
          "Server not reachable. Please check your Wi-Fi or backend connection."
        );
      } else if (backendMsg.includes("File too large")) {
        Alert.alert(
          "⚠️ File Error",
          "File too large! Maximum allowed size is 2MB."
        );
      } else {
        Alert.alert("Upload Failed", backendMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 👈 Back Arrow */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Dashboard")}
      >
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Upload KYC</Text>

      <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
        <Text style={styles.filePickerText}>
          {file ? "Change Image" : "Choose KYC Image"}
        </Text>
      </TouchableOpacity>

      {file && file.type?.startsWith("image/") && (
        <Image source={{ uri: file.uri }} style={styles.preview} />
      )}

      <TouchableOpacity
        style={[styles.uploadBtn, loading && { opacity: 0.7 }]}
        onPress={handleUpload}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.uploadText}>Upload KYC</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f0f4f7",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    marginTop: 60,
  },
  filePicker: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  filePickerText: {
    fontSize: 16,
    color: "#555",
  },
  preview: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  uploadBtn: {
    backgroundColor: "#2196f3",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 12,
  },
  uploadText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

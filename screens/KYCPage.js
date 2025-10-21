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
//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert("Permission required", "Please allow access to your gallery");
//       return;
//     }

//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         allowsEditing: true,
//         quality: 1,
//         // remove deprecated MediaTypeOptions
//       });

//       if (!result.canceled && result.assets?.length > 0) {
//         setImage(result.assets[0]);
//       }
//     } catch (err) {
//       console.error("Image Picker Error:", err);
//       Alert.alert("Error", "Failed to pick image");
//     }
//   };

//   const handleUpload = async () => {
//     if (!image) return Alert.alert("Error", "Please select an image first!");
//     setLoading(true);

//     try {
//       const token = await AsyncStorage.getItem("authToken");

//       const formData = new FormData();
//       formData.append("file", {
//         uri:
//           Platform.OS === "android"
//             ? image.uri
//             : image.uri.replace("file://", ""),
//         name: "kyc.jpg",
//         type: "image/jpeg",
//       });

//       const res = await axios.post(
//         `http://192.168.156.218:8080/api/doer/doc/upload?docType=PAN`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       Alert.alert("Success", res.data.message || "KYC uploaded successfully!");
//       navigation.goBack();
//     } catch (err) {
//       console.error("Upload Error:", err);
//       Alert.alert("Upload Failed", err.response?.data?.message || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Upload KYC</Text>

//       <TouchableOpacity style={styles.filePicker} onPress={pickImage}>
//         <Text style={styles.filePickerText}>
//           {image ? "Change Image" : "Choose Image"}
//         </Text>
//       </TouchableOpacity>

//       {image && <Image source={{ uri: image.uri }} style={styles.preview} />}

//       <TouchableOpacity
//         style={styles.uploadBtn}
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
//   title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#333" },
//   filePicker: {
//     backgroundColor: "#fff",
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//     borderRadius: 12,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#ccc",
//   },
//   filePickerText: { fontSize: 16, color: "#555" },
//   preview: { width: 250, height: 250, borderRadius: 10, marginBottom: 20 },
//   uploadBtn: {
//     backgroundColor: "#2196f3",
//     paddingVertical: 15,
//     paddingHorizontal: 60,
//     borderRadius: 12,
//   },
//   uploadText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
// });

// // corret code............................................................................................................................
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
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function KYCPage({ navigation }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Pick either image or PDF file
  const pickFile = async () => {
    try {
      Alert.alert(
        "Select File Type",
        "Choose which type of file to upload",
        [
          {
            text: "Image",
            onPress: async () => {
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
            },
          },
          {
            text: "PDF",
            onPress: async () => {
              const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
              });

              if (result.type !== "cancel") {
                setFile({
                  uri: result.uri,
                  name: result.name || "kyc_document.pdf",
                  type: "application/pdf",
                });
              }
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
        { cancelable: true }
      );
    } catch (err) {
      console.error("File pick error:", err);
      Alert.alert("Error", "Failed to pick a file.");
    }
  };

  // ✅ Upload file
  const handleUpload = async () => {
    if (!file || !file.uri) {
      Alert.alert("Error", "Please select a file first.");
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");

      // Android may need file:// prefix
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
        `http://192.168.156.218:8080/api/doer/profile/doc/upload?docType=PanCard`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("✅ Success", res.data.message || "KYC uploaded successfully!");
      setFile(null);
      navigation.goBack();
    } catch (err) {
      console.error("Upload Error:", err);
      Alert.alert("Upload Failed", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload KYC</Text>

      <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
        <Text style={styles.filePickerText}>
          {file ? "Change File" : "Choose File (Image or PDF)"}
        </Text>
      </TouchableOpacity>

      {file && file.type.startsWith("image/") && (
        <Image source={{ uri: file.uri }} style={styles.preview} />
      )}

      <TouchableOpacity
        style={styles.uploadBtn}
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
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#333" },
  filePicker: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  filePickerText: { fontSize: 16, color: "#555" },
  preview: { width: 250, height: 250, borderRadius: 10, marginBottom: 20 },
  uploadBtn: {
    backgroundColor: "#2196f3",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 12,
  },
  uploadText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});

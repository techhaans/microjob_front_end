// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
// } from "react-native";
// import { registerDoer } from "../api/doer";

// export default function RegisterPage({ navigation }) {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [bio, setBio] = useState("");
//   const [skills, setSkills] = useState("");
//   const [status, setStatus] = useState("");

//   const validateInputs = () => {
//     if (!name.trim()) return "Name is required!";
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
//       return "Enter a valid email!";
//     if (!/^[6-9]\d{9}$/.test(phone)) return "Enter a valid 10-digit phone!";
//     return null;
//   };

//   const handleRegister = async () => {
//     const errMsg = validateInputs();
//     if (errMsg) {
//       setStatus(errMsg);
//       return;
//     }

//     const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
//     const skillsArray = skills ? skills.split(",").map((s) => s.trim()) : [];

//     const payload = {
//       name,
//       email,
//       phoneNo: formattedPhone,
//       bio,
//       skills: skillsArray,
//     };

//     try {
//       const res = await registerDoer(payload);
//       Alert.alert("Success", res.data?.message || "Registered successfully!");
//       navigation.navigate("LoginPage");
//     } catch (err) {
//       console.error("Registration Error:", err.response?.data || err.message);
//       if (err.response?.status === 409) setStatus("User already exists!");
//       else if (err.response?.status === 400) setStatus("Invalid data");
//       else setStatus("Something went wrong");
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Register as Doer</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Name"
//         value={name}
//         onChangeText={setName}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         keyboardType="email-address"
//         value={email}
//         onChangeText={setEmail}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Phone (10 digits)"
//         keyboardType="phone-pad"
//         value={phone}
//         maxLength={10}
//         onChangeText={setPhone}
//       />
//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Bio"
//         value={bio}
//         onChangeText={setBio}
//         multiline
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Skills (comma separated)"
//         value={skills}
//         onChangeText={setSkills}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleRegister}>
//         <Text style={styles.buttonText}>Register</Text>
//       </TouchableOpacity>
//       {status ? <Text style={styles.error}>{status}</Text> : null}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 20 },
//   title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//   },
//   button: {
//     backgroundColor: "#28a745",
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   error: { color: "red", marginTop: 10, fontWeight: "600" },
// });

// // corret code............................................................................................................................

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
// } from "react-native";

// ✅ Make sure this matches your file path & function name in api/doer.js
// import { registerDoer } from "../api/doer";

// export default function RegisterPage({ navigation }) {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [bio, setBio] = useState("");
//   const [skills, setSkills] = useState("");
//   const [status, setStatus] = useState("");

//   // ✅ Input validation
//   const validateInputs = () => {
//     if (!name.trim()) return "Name is required!";
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
//       return "Enter a valid email!";
//     if (!/^[6-9]\d{9}$/.test(phone)) return "Enter a valid 10-digit phone!";
//     return null;
//   };

//   // ✅ Handle registration
//   const handleRegister = async () => {
//     const errMsg = validateInputs();
//     if (errMsg) {
//       setStatus(errMsg);
//       return;
//     }

//     const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
//     const skillsArray = skills ? skills.split(",").map((s) => s.trim()) : [];

//     const payload = {
//       name,
//       email,
//       phoneNo: formattedPhone,
//       bio,
//       skills: skillsArray,
//     };

//     try {
//       const res = await registerDoer(payload); // call API
//       Alert.alert("Success", res?.message || "Registered successfully!");
//       navigation.navigate("LoginPage");
//     } catch (err) {
//       console.error("Registration Error:", err.response?.data || err.message);

//       if (err.response?.status === 409) setStatus("User already exists!");
//       else if (err.response?.status === 400) setStatus("Invalid data");
//       else setStatus("Something went wrong");
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Register as Doer</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Name"
//         value={name}
//         onChangeText={setName}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         keyboardType="email-address"
//         value={email}
//         onChangeText={setEmail}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Phone (10 digits)"
//         keyboardType="phone-pad"
//         value={phone}
//         maxLength={10}
//         onChangeText={setPhone}
//       />

//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Bio"
//         value={bio}
//         onChangeText={setBio}
//         multiline
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Skills (comma separated)"
//         value={skills}
//         onChangeText={setSkills}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleRegister}>
//         <Text style={styles.buttonText}>Register</Text>
//       </TouchableOpacity>

//       {status ? <Text style={styles.error}>{status}</Text> : null}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 20, backgroundColor: "#f9f9f9" },
//   title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//   },
//   button: {
//     backgroundColor: "#28a745",
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   error: { color: "red", marginTop: 10, fontWeight: "600" },
// });

// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { registerDoer } from "../api/doer";

// export default function RegisterPage({ navigation }) {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [bio, setBio] = useState("");
//   const [skills, setSkills] = useState("");
//   const [status, setStatus] = useState(""); // For UI error messages
//   const [loading, setLoading] = useState(false); // Optional loading state

//   const validateInputs = () => {
//     if (!name.trim()) return "Name is required!";
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
//       return "Enter a valid email!";
//     if (!/^[6-9]\d{9}$/.test(phone)) return "Enter a valid 10-digit phone!";
//     return null;
//   };

//   const handleRegister = async () => {
//     const errMsg = validateInputs();
//     if (errMsg) {
//       setStatus(errMsg);
//       return;
//     }

//     setLoading(true);
//     const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
//     const skillsArray = skills ? skills.split(",").map((s) => s.trim()) : [];

//     const payload = {
//       name,
//       email,
//       phoneNo: formattedPhone,
//       bio,
//       skills: skillsArray,
//     };

//     try {
//       const res = await registerDoer(payload);
//       setLoading(false);

//       // Registration success
//       setStatus(""); // clear previous errors
//       navigation.navigate("LoginPage"); // redirect to login page
//     } catch (err) {
//       setLoading(false);
//       console.error("Registration Error:", err.response?.data || err.message);

//       // Handle backend errors and display in UI
//       if (err.response?.status === 409) setStatus("User already exists!");
//       else if (err.response?.status === 400)
//         setStatus("Invalid data. Check input fields.");
//       else setStatus("Something went wrong. Try again.");
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Register as Doer</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Name"
//         value={name}
//         onChangeText={setName}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         keyboardType="email-address"
//         value={email}
//         onChangeText={setEmail}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Phone (10 digits)"
//         keyboardType="phone-pad"
//         value={phone}
//         maxLength={10}
//         onChangeText={setPhone}
//       />

//       <TextInput
//         style={[styles.input, { height: 80 }]}
//         placeholder="Bio"
//         value={bio}
//         onChangeText={setBio}
//         multiline
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Skills (comma separated)"
//         value={skills}
//         onChangeText={setSkills}
//       />

//       <TouchableOpacity
//         style={styles.button}
//         onPress={handleRegister}
//         disabled={loading}
//       >
//         <Text style={styles.buttonText}>
//           {loading ? "Registering..." : "Register"}
//         </Text>
//       </TouchableOpacity>

//       {status ? <Text style={styles.error}>{status}</Text> : null}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 20, backgroundColor: "#f9f9f9" },
//   title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 15,
//     backgroundColor: "#fff",
//   },
//   button: {
//     backgroundColor: "#28a745",
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   error: { color: "red", marginTop: 10, fontWeight: "600" },
// });

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { registerDoer } from "../api/doer";

export default function RegisterPage({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [status, setStatus] = useState(""); 
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!name.trim()) return "Name is required!";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email!";
    if (!/^[6-9]\d{9}$/.test(phone)) return "Enter a valid 10-digit phone!";
    return null;
  };

  const handleRegister = async () => {
    const errMsg = validateInputs();
    if (errMsg) {
      setStatus(errMsg);
      return;
    }

    setLoading(true);
    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
    const skillsArray = skills ? skills.split(",").map((s) => s.trim()) : [];

    const payload = {
      name,
      email,
      phoneNo: formattedPhone,
      bio,
      skills: skillsArray,
    };

    try {
      const res = await registerDoer(payload);
      setLoading(false);
      setStatus(""); 
      navigation.navigate("LoginPage");
    } catch (err) {
      setLoading(false);
      console.error("Registration Error:", err.response?.data || err.message);

      if (err.response?.status === 409) setStatus("User already exists!");
      else if (err.response?.status === 400) setStatus("Invalid data. Check input fields.");
      else setStatus("Something went wrong. Try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register as Doer</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone (10 digits)"
        keyboardType="phone-pad"
        value={phone}
        maxLength={10}
        onChangeText={setPhone}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Skills (comma separated)"
        value={skills}
        onChangeText={setSkills}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Registering..." : "Register"}
        </Text>
      </TouchableOpacity>

      {status ? <Text style={styles.error}>{status}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#28a745",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  error: { color: "red", marginTop: 10, fontWeight: "600" },
});

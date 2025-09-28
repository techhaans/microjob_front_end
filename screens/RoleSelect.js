import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

export default function RoleSelect({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Logo / Image on top */}
      <View style={styles.logoWrapper}>
        <Image
          source={require("../images/logo1.jpg")} // Replace with your logo image path
          style={styles.logo}
        />
      </View>

      <Text style={styles.title}>Select Role</Text>

      {/* Role Buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("LoginPage")}
      >
        <Text style={styles.btnText}>Doer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("AdminLogin")}
      >
        <Text style={styles.btnText}>Admin</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("SuperAdminLogin")}
      >
        <Text style={styles.btnText}>Super Admin</Text>
      </TouchableOpacity>

      {/* Footer Text */}
      <Text style={styles.footerText}>Micro Job : TechHaans PVT LTD</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: 20,
  },
  logoWrapper: {
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    borderRadius: 60,
    backgroundColor: "#fff", // optional for better shadow effect
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60, // makes the logo round
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  button: {
    backgroundColor: "#2196f3",
    padding: 15,
    width: "60%",
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  footerText: {
    marginTop: 30,
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
});

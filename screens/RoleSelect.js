
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
} from "react-native";

export default function RoleSelect({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoWrapper}>
        <Image
          source={require("../images/logo1.jpg")}
          style={styles.logo}
        />
      </View>

      <Text style={styles.title}>Select Role</Text>

      {/* Doer Login triggers modal */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      {/* Admin Login */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("AdminLogin")}
      >
        <Text style={styles.btnText}>Admin</Text>
      </TouchableOpacity>

      {/* Super Admin Login */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("SuperAdminLogin")}
      >
        <Text style={styles.btnText}>Super Admin</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>Micro Job : TechHaans PVT LTD</Text>

      {/* Modal for Doer / Poster selection */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Login as:</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("LoginPage"); // Doer login
              }}
            >
              <Text style={styles.modalBtnText}>Doer Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate("PosterLogin"); // Poster login
              }}
            >
              <Text style={styles.modalBtnText}>Poster Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: "#ccc" }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f4f4f4", padding: 20 },
  logoWrapper: { marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 5, elevation: 5, borderRadius: 60, backgroundColor: "#fff" },
  logo: { width: 120, height: 120, borderRadius: 60 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30, color: "#333" },
  button: { backgroundColor: "#2196f3", padding: 15, width: "60%", borderRadius: 10, marginVertical: 10, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  footerText: { marginTop: 30, fontSize: 14, color: "#777", textAlign: "center" },

  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 12, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  modalButton: { backgroundColor: "#2196f3", padding: 12, width: "100%", borderRadius: 8, marginVertical: 5, alignItems: "center" },
  modalBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

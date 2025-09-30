// screens/SplashScreen.js
import React, { useEffect } from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window"); // Full device screen size

export default function SplashScreen({ navigation, route }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Navigate to RoleSelect or initial route
      navigation.replace(route.params?.initialRoute || "RoleSelect");
    }, 3500); // 3 sec splash

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Fullscreen Splash Image */}
      <Image
        source={require("../assets/spanishpic.png")}
        style={styles.fullImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    position: "absolute",
    width: width,
    height: height,
    resizeMode: "cover", // 🔹 change to "contain" if you want no cropping
  },
});

import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Text } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

const GOOGLE_KEY = "YOUR_GOOGLE_MAPS_KEY"; // IMPORTANT

export default function RouteMap() {
  const route = useRoute();
  const navigation = useNavigation();

  const { jobLat, jobLon, title } = route.params;

  const [doerLocation, setDoerLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    getInitialLocation();
    const interval = setInterval(() => getInitialLocation(), 3000);
    return () => clearInterval(interval);
  }, []);

  const getInitialLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const newLoc = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };

    setDoerLocation(newLoc);

    fetchRoute(newLoc);
  };

  const fetchRoute = async (from) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${from.latitude},${from.longitude}&destination=${jobLat},${jobLon}&key=${GOOGLE_KEY}`;

      const { data } = await axios.get(url);

      const points =
        data.routes[0].overview_polyline.points;

      const decoded = decodePolyline(points);

      setRouteCoords(decoded);
    } catch (err) {
      console.log("Route Error:", err.message);
    }
  };

  // Decode Google polyline
  const decodePolyline = (t) => {
    let points = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < t.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;
      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  };

  if (!doerLocation)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Map */}
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: doerLocation.latitude,
          longitude: doerLocation.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
      >
        {/* Doer Live Location */}
        <Marker
          coordinate={doerLocation}
          title="You"
          pinColor="blue"
        />

        {/* Job Location */}
        <Marker
          coordinate={{ latitude: jobLat, longitude: jobLon }}
          title={title}
          pinColor="red"
        />

        {/* Route between them */}
        <Polyline
          coordinates={routeCoords}
          strokeWidth={5}
          strokeColor="#2563eb"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    zIndex: 10,
    top: 40,
    left: 20,
    backgroundColor: "#000000aa",
    padding: 10,
    borderRadius: 50,
  },
});

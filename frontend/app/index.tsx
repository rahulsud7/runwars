import 'text-encoding-polyfill';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import * as h3 from 'h3-js';
import HexMap from '../components/HexMap';

const H3_RESOLUTION = 9;

export interface HexPoly {
  id: string;
  coordinates: { latitude: number; longitude: number }[];
}

export default function Index() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hexPolygons, setHexPolygons] = useState<HexPoly[]>([]);
  const [hexCount, setHexCount] = useState(0);
  const mapRef = useRef<any>(null);
  const visitedRef = useRef<Set<string>>(new Set());
  const lastHexRef = useRef<string | null>(null);

  const processH3 = useCallback((lat: number, lng: number) => {
    try {
      const hexId = h3.latLngToCell(lat, lng, H3_RESOLUTION);

      // Skip if same hex as last check (most common case)
      if (hexId === lastHexRef.current) return;
      lastHexRef.current = hexId;

      // Skip if already visited
      if (visitedRef.current.has(hexId)) return;
      visitedRef.current.add(hexId);

      const boundary = h3.cellToBoundary(hexId);
      const coordinates = boundary.map(([bLat, bLng]: [number, number]) => ({
        latitude: bLat,
        longitude: bLng,
      }));

      setHexPolygons((prev) => [...prev, { id: hexId, coordinates }]);
      setHexCount(visitedRef.current.size);
    } catch (e) {
      // h3 computation failed silently — don't crash the app
    }
  }, []);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission is required to track your movement.');
        return;
      }

      try {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(current);
        processH3(current.coords.latitude, current.coords.longitude);
      } catch {
        setErrorMsg('Unable to get current location.');
        return;
      }

      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5,
          timeInterval: 2000,
        },
        (loc) => {
          setLocation(loc);
          processH3(loc.coords.latitude, loc.coords.longitude);

          mapRef.current?.animateToRegion(
            {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              latitudeDelta: 0.004,
              longitudeDelta: 0.004,
            },
            500
          );
        }
      );
    })();

    return () => {
      sub?.remove();
    };
  }, [processH3]);

  if (errorMsg) {
    return (
      <View testID="error-screen" style={styles.centerContainer}>
        <View style={styles.glassCard}>
          <Text testID="error-icon" style={styles.errorIcon}>⚠</Text>
          <Text testID="error-message" style={styles.errorText}>{errorMsg}</Text>
          <Text style={styles.errorHint}>
            Please enable location in your device settings.
          </Text>
        </View>
      </View>
    );
  }

  if (!location) {
    return (
      <View testID="loading-screen" style={styles.centerContainer}>
        <View style={styles.glassCard}>
          <ActivityIndicator testID="loading-indicator" size="large" color="#60A5FA" />
          <Text style={styles.loadingText}>Acquiring GPS signal...</Text>
        </View>
      </View>
    );
  }

  return (
    <HexMap
      mapRef={mapRef}
      latitude={location.coords.latitude}
      longitude={location.coords.longitude}
      hexPolygons={hexPolygons}
      hexCount={hexCount}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#080C14',
    paddingHorizontal: 24,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  errorIcon: {
    fontSize: 36,
    marginBottom: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  errorHint: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    textAlign: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginTop: 16,
  },
});

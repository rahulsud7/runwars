import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { latLngToCell, cellToBoundary } from 'h3-js';
import HexMap from '../components/HexMap';

const H3_RESOLUTION = 9;

interface HexPoly {
  id: string;
  coordinates: { latitude: number; longitude: number }[];
}

export default function Index() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [visitedHexIds, setVisitedHexIds] = useState<Set<string>>(new Set());
  const mapRef = useRef<any>(null);

  const hexPolygons: HexPoly[] = useMemo(() => {
    return Array.from(visitedHexIds).map((h3Index) => {
      const boundary = cellToBoundary(h3Index);
      return {
        id: h3Index,
        coordinates: boundary.map(([lat, lng]: [number, number]) => ({
          latitude: lat,
          longitude: lng,
        })),
      };
    });
  }, [visitedHexIds]);

  const processH3 = useCallback((lat: number, lng: number) => {
    const h3Index = latLngToCell(lat, lng, H3_RESOLUTION);
    setVisitedHexIds((prev) => {
      if (prev.has(h3Index)) return prev;
      const next = new Set(prev);
      next.add(h3Index);
      return next;
    });
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
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>⚠</Text>
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
        <ActivityIndicator testID="loading-indicator" size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Acquiring GPS signal...</Text>
      </View>
    );
  }

  return (
    <HexMap
      mapRef={mapRef}
      latitude={location.coords.latitude}
      longitude={location.coords.longitude}
      hexPolygons={hexPolygons}
      hexCount={visitedHexIds.size}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
  },
  errorCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 16,
  },
});

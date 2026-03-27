import '../shims/textdecoder';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import * as h3 from 'h3-js';
import HexMap from '../components/HexMap';

const H3_RESOLUTION = 9;
const MAX_TRAIL = 50;

export interface HexPoly {
  id: string;
  coordinates: { latitude: number; longitude: number }[];
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface RunStats {
  distance: number;
  elapsedSeconds: number;
  speed: number;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const r1 = (lat1 * Math.PI) / 180;
  const r2 = (lat2 * Math.PI) / 180;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(r1) * Math.cos(r2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Index() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hexPolygons, setHexPolygons] = useState<HexPoly[]>([]);
  const [hexCount, setHexCount] = useState(0);
  const [lastCapturedHex, setLastCapturedHex] = useState<string | null>(null);
  const [trailPoints, setTrailPoints] = useState<LatLng[]>([]);
  const [stats, setStats] = useState<RunStats>({ distance: 0, elapsedSeconds: 0, speed: 0 });
  const [activeTab, setActiveTab] = useState<'map' | 'dashboard'>('map');

  const mapRef = useRef<any>(null);
  const visitedRef = useRef<Set<string>>(new Set());
  const lastHexRef = useRef<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastLocRef = useRef<LatLng | null>(null);
  const totalDistRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const processH3 = useCallback((lat: number, lng: number) => {
    try {
      const hexId = h3.latLngToCell(lat, lng, H3_RESOLUTION);
      if (hexId === lastHexRef.current) return;
      lastHexRef.current = hexId;
      if (visitedRef.current.has(hexId)) return;
      visitedRef.current.add(hexId);

      const boundary = h3.cellToBoundary(hexId);
      const coordinates = boundary.map(([bLat, bLng]: [number, number]) => ({
        latitude: bLat,
        longitude: bLng,
      }));

      setHexPolygons((prev) => [...prev, { id: hexId, coordinates }]);
      setHexCount(visitedRef.current.size);
      setLastCapturedHex(hexId);
      setTimeout(() => setLastCapturedHex((c) => (c === hexId ? null : c)), 1500);
    } catch {
      // silent
    }
  }, []);

  const updateTrailAndStats = useCallback((lat: number, lng: number) => {
    const point: LatLng = { latitude: lat, longitude: lng };

    setTrailPoints((prev) => {
      const next = [...prev, point];
      return next.length > MAX_TRAIL ? next.slice(next.length - MAX_TRAIL) : next;
    });

    if (lastLocRef.current) {
      const d = haversine(lastLocRef.current.latitude, lastLocRef.current.longitude, lat, lng);
      if (d > 1 && d < 500) {
        totalDistRef.current += d;
        const elapsed = startTimeRef.current
          ? (Date.now() - startTimeRef.current) / 1000
          : 1;
        const speedKmh = elapsed > 0 ? (totalDistRef.current / elapsed) * 3.6 : 0;
        setStats((prev) => ({ ...prev, distance: totalDistRef.current, speed: speedKmh }));
      }
    }
    lastLocRef.current = point;
  }, []);

  // Elapsed-time ticker
  useEffect(() => {
    if (location && !startTimeRef.current) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const s = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
        setStats((prev) => ({ ...prev, elapsedSeconds: s }));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [location]);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission is required to track your movement.');
        return;
      }

      try {
        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(current);
        processH3(current.coords.latitude, current.coords.longitude);
        updateTrailAndStats(current.coords.latitude, current.coords.longitude);
      } catch {
        setErrorMsg('Unable to get current location.');
        return;
      }

      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 2000 },
        (loc) => {
          setLocation(loc);
          processH3(loc.coords.latitude, loc.coords.longitude);
          updateTrailAndStats(loc.coords.latitude, loc.coords.longitude);

          if (mapRef.current) {
            mapRef.current.animateCamera(
              { center: { latitude: loc.coords.latitude, longitude: loc.coords.longitude } },
              { duration: 800 }
            );
          }
        }
      );
    })();

    return () => { sub?.remove(); };
  }, [processH3, updateTrailAndStats]);

  if (errorMsg) {
    return (
      <View testID="error-screen" style={styles.center}>
        <View style={styles.glassCard}>
          <Text testID="error-icon" style={styles.errIcon}>⚠</Text>
          <Text testID="error-message" style={styles.errText}>{errorMsg}</Text>
          <Text style={styles.errHint}>Please enable location in your device settings.</Text>
        </View>
      </View>
    );
  }

  if (!location) {
    return (
      <View testID="loading-screen" style={styles.center}>
        <View style={styles.glassCard}>
          <ActivityIndicator testID="loading-indicator" size="large" color="#60A5FA" />
          <Text style={styles.loadText}>Acquiring GPS signal...</Text>
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
      lastCapturedHex={lastCapturedHex}
      trailPoints={trailPoints}
      stats={stats}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#080C14',
    paddingHorizontal: 24,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  errIcon: { fontSize: 36, marginBottom: 16 },
  errText: {
    color: '#FCA5A5',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  errHint: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' },
  loadText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 16 },
});

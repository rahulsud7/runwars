import '../shims/textdecoder';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import * as h3 from 'h3-js';
import HexMap from '../components/HexMap';
import {
  AuthScreen,
  SummaryScreen,
  DashboardScreen,
  ClubsScreen,
  ProfileScreen,
} from '../components/Screens';

// ── CONFIG ──
const H3_RES = 9;
const MAX_TRAIL = 50;

// GPS FILTERS
const MIN_DISTANCE = 2;   // ignore jitter <2m
const MAX_JUMP = 100;     // ignore unrealistic jumps

// ── TYPES ──
// ── TYPES (EXPORT THESE) ──
export type Screen =
  | 'auth'
  | 'map'
  | 'summary'
  | 'dashboard'
  | 'clubs'
  | 'profile';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface HexPoly {
  id: string;
  coordinates: LatLng[];
}

export interface RunStats {
  distance: number;
  elapsedSeconds: number;
  speed: number;
  hexCount: number;
}

export interface RunRecord {
  id: string;
  date: string;
  hexes: number;
  distance: number;
  duration: number;
  speed: number;
}

// ── DISTANCE ──
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Index() {

  // NAV
  const [screen, setScreen] = useState<Screen>('auth');

  // LOCATION
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  // RUN STATE
  const [isRunning, setIsRunning] = useState(false);
  const [hexPolygons, setHexPolygons] = useState<HexPoly[]>([]);
  const [hexCount, setHexCount] = useState(0);
  const [trail, setTrail] = useState<LatLng[]>([]);
  const [streak, setStreak] = useState(0);

  const [runStats, setRunStats] = useState<RunStats>({
    distance: 0,
    elapsedSeconds: 0,
    speed: 0,
    hexCount: 0,
  });

  // HISTORY
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [pending, setPending] = useState<RunStats | null>(null);

  // REFS
  const mapRef = useRef<any>(null);
const [lastCapturedHex, setLastCapturedHex] = useState<string | null>(null);
  const visited = useRef<Set<string>>(new Set());
  const lastHex = useRef<string | null>(null);
  const lastLoc = useRef<LatLng | null>(null);
  const totalDist = useRef(0);
  const startTime = useRef<number | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<any>(null);
  const streakTimer = useRef<any>(null);

  // ───────── LOCATION INIT ─────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(loc);
    })();
  }, []);

  // ───────── H3 ─────────
  const processH3 = useCallback((lat: number, lng: number) => {
    const hex = h3.latLngToCell(lat, lng, H3_RES);

    if (hex === lastHex.current) return;
    lastHex.current = hex;

    if (visited.current.has(hex)) return;

    visited.current.add(hex);
    setLastCapturedHex(hex);

// remove highlight after 1.5s
setTimeout(() => {
  setLastCapturedHex((c) => (c === hex ? null : c));
}, 1500);

    const boundary = h3.cellToBoundary(hex);
    const coords = boundary.map(([lat, lng]: [number, number]) => ({
      latitude: lat,
      longitude: lng,
    }));

    setHexPolygons((p) => [...p, { id: hex, coordinates: coords }]);
    setHexCount(visited.current.size);

    // 🔥 streak
    setStreak((s) => s + 1);
    if (streakTimer.current) clearTimeout(streakTimer.current);
    streakTimer.current = setTimeout(() => setStreak(0), 5000);
  }, []);

  // ───────── GPS PROCESSING ─────────
  const processLocation = (lat: number, lng: number) => {
    const point = { latitude: lat, longitude: lng };

    if (lastLoc.current) {
      const d = haversine(
        lastLoc.current.latitude,
        lastLoc.current.longitude,
        lat,
        lng
      );

     // ignore jitter + unrealistic spikes
if (d < 3 || d > 30) return;// ignore teleport jumps

// ignore if accuracy is bad
if (location?.coords.accuracy && location.coords.accuracy > 20) return;

      totalDist.current += d;

      const elapsed = startTime.current
        ? (Date.now() - startTime.current) / 1000
        : 1;

    const instantSpeed = (d / 1) * 3.6; // m/s → km/h
const smoothedSpeed =
  (runStats.speed * 0.7) + (instantSpeed * 0.3);

const speed = Math.min(smoothedSpeed, 20); // cap at human max

      setRunStats((p) => ({
        ...p,
        distance: totalDist.current,
        speed,
      }));
    }

    lastLoc.current = point;

    setTrail((p) => {
      const next = [...p, point];
      return next.length > MAX_TRAIL ? next.slice(-MAX_TRAIL) : next;
    });

    processH3(lat, lng);
  };

  // ───────── START RUN ─────────
  const startRun = async () => {
    setIsRunning(true);
    setTrail([]);
    setStreak(0);

    totalDist.current = 0;
    lastLoc.current = null;
    startTime.current = Date.now();

    timerRef.current = setInterval(() => {
      const t = Math.floor((Date.now() - (startTime.current ?? 0)) / 1000);
      setRunStats((p) => ({ ...p, elapsedSeconds: t }));
    }, 1000);

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        distanceInterval: 3,
        timeInterval: 1000,
      },
      (loc) => {
        setLocation(loc);
        processLocation(loc.coords.latitude, loc.coords.longitude);
      }
    );
  };

  // ───────── END RUN ─────────
  const endRun = () => {
    setIsRunning(false);

    watchRef.current?.remove();
    clearInterval(timerRef.current);

    const elapsed = Math.floor((Date.now() - (startTime.current ?? 0)) / 1000);

    const result: RunStats = {
      distance: totalDist.current,
      elapsedSeconds: elapsed,
      speed: elapsed > 0 ? (totalDist.current / elapsed) * 3.6 : 0,
      hexCount: visited.current.size,
    };

    setPending(result);
    setScreen('summary');
  };

  // ───────── SAVE ─────────
  const saveRun = () => {
    if (!pending) return;

    setRuns((r) => [
      {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        hexes: pending.hexCount,
        distance: pending.distance,
        duration: pending.elapsedSeconds,
        speed: pending.speed,
      },
      ...r,
    ]);

    setPending(null);
    setScreen('dashboard');
  };

  // ───────── UI FLOW ─────────

  if (screen === 'auth') return <AuthScreen onEnter={() => setScreen('map')} />;

  if (screen === 'summary' && pending)
    return <SummaryScreen stats={pending} onSave={saveRun} />;

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={styles.txt}>Getting GPS...</Text>
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
  trailPoints={trail}
  stats={runStats}
  isRunning={isRunning}
  onStartRun={startRun}
  onEndRun={endRun}
  currentScreen={screen}
  onNavigate={setScreen}
  streak={streak}
/>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#080C14' },
  txt: { color: '#aaa', marginTop: 10 },
});
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

// ── Constants ──
const H3_RES = 9;
const MAX_TRAIL = 50;

// ── Types ──
export interface LatLng { latitude: number; longitude: number }
export interface HexPoly { id: string; coordinates: LatLng[] }
export interface RunStats { distance: number; elapsedSeconds: number; speed: number; hexCount: number }
export interface RunRecord { id: string; date: string; hexes: number; distance: number; duration: number; speed: number }

export type Screen = 'auth' | 'map' | 'summary' | 'dashboard' | 'clubs' | 'profile';

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const r1 = (lat1 * Math.PI) / 180, r2 = (lat2 * Math.PI) / 180;
  const dLat = ((lat2 - lat1) * Math.PI) / 180, dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(r1) * Math.cos(r2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ══════════════════════════════════════
//  APP CONTROLLER
// ══════════════════════════════════════
export default function Index() {
  // ── Navigation ──
  const [screen, setScreen] = useState<Screen>('auth');

  // ── User ──
  const user = { name: 'Runner_42', avatar: null };

  // ── Location ──
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [locReady, setLocReady] = useState(false);

  // ── Run state ──
  const [isRunning, setIsRunning] = useState(false);
  const [hexPolygons, setHexPolygons] = useState<HexPoly[]>([]);
  const [hexCount, setHexCount] = useState(0);
  const [lastCapturedHex, setLastCapturedHex] = useState<string | null>(null);
  const [trailPoints, setTrailPoints] = useState<LatLng[]>([]);
  const [runStats, setRunStats] = useState<RunStats>({ distance: 0, elapsedSeconds: 0, speed: 0, hexCount: 0 });

  // ── History ──
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [totalStats, setTotalStats] = useState({ hexes: 0, distance: 0, runs: 0, avgSpeed: 0 });

  // ── Clubs ──
  const [joinedClub, setJoinedClub] = useState<string | null>(null);

  // ── Pending summary ──
  const [pendingSummary, setPendingSummary] = useState<RunStats | null>(null);

  // ── Refs ──
  const mapRef = useRef<any>(null);
  const visitedRef = useRef<Set<string>>(new Set());
  const lastHexRef = useRef<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastLocRef = useRef<LatLng | null>(null);
  const totalDistRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchSubRef = useRef<Location.LocationSubscription | null>(null);
  const sessionHexCountRef = useRef(0);

  // ── H3 Processing ──
  const processH3 = useCallback((lat: number, lng: number) => {
    try {
      const hexId = h3.latLngToCell(lat, lng, H3_RES);
      if (hexId === lastHexRef.current) return;
      lastHexRef.current = hexId;
      if (visitedRef.current.has(hexId)) return;
      visitedRef.current.add(hexId);

      const boundary = h3.cellToBoundary(hexId);
      const coordinates = boundary.map(([bLat, bLng]: [number, number]) => ({
        latitude: bLat, longitude: bLng,
      }));

      setHexPolygons((p) => [...p, { id: hexId, coordinates }]);
      sessionHexCountRef.current += 1;
      setHexCount(visitedRef.current.size);
      setLastCapturedHex(hexId);
      setTimeout(() => setLastCapturedHex((c) => (c === hexId ? null : c)), 1500);
    } catch { /* silent */ }
  }, []);

  // ── Trail + Stats ──
  const updateTrail = useCallback((lat: number, lng: number) => {
    const pt: LatLng = { latitude: lat, longitude: lng };
    setTrailPoints((p) => {
      const n = [...p, pt];
      return n.length > MAX_TRAIL ? n.slice(n.length - MAX_TRAIL) : n;
    });
    if (lastLocRef.current) {
      const d = haversine(lastLocRef.current.latitude, lastLocRef.current.longitude, lat, lng);
      if (d > 1 && d < 500) {
        totalDistRef.current += d;
        const elapsed = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 1;
        const spd = elapsed > 0 ? (totalDistRef.current / elapsed) * 3.6 : 0;
        setRunStats((p) => ({ ...p, distance: totalDistRef.current, speed: spd, hexCount: sessionHexCountRef.current }));
      }
    }
    lastLocRef.current = pt;
  }, []);

  // ── Request permission + initial location on map screen ──
  useEffect(() => {
    if (screen !== 'map' || locReady) return;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocError('Location permission required.'); return; }
      try {
        const cur = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(cur);
        setLocReady(true);
      } catch { setLocError('Unable to get location.'); }
    })();
  }, [screen, locReady]);

  // ── Start Run ──
  const startRun = useCallback(async () => {
    setIsRunning(true);
    sessionHexCountRef.current = 0;
    totalDistRef.current = 0;
    lastLocRef.current = null;
    setTrailPoints([]);
    setRunStats({ distance: 0, elapsedSeconds: 0, speed: 0, hexCount: 0 });
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const s = Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000);
      setRunStats((p) => ({ ...p, elapsedSeconds: s }));
    }, 1000);

    if (location) {
      processH3(location.coords.latitude, location.coords.longitude);
      updateTrail(location.coords.latitude, location.coords.longitude);
    }

    watchSubRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 2000 },
      (loc) => {
        setLocation(loc);
        processH3(loc.coords.latitude, loc.coords.longitude);
        updateTrail(loc.coords.latitude, loc.coords.longitude);
        mapRef.current?.animateCamera(
          { center: { latitude: loc.coords.latitude, longitude: loc.coords.longitude } },
          { duration: 800 }
        );
      }
    );
  }, [location, processH3, updateTrail]);

  // ── End Run ──
  const endRun = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    watchSubRef.current?.remove();
    watchSubRef.current = null;

    const elapsed = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
    const finalStats: RunStats = {
      distance: totalDistRef.current,
      elapsedSeconds: elapsed,
      speed: elapsed > 0 ? (totalDistRef.current / elapsed) * 3.6 : 0,
      hexCount: sessionHexCountRef.current,
    };
    setPendingSummary(finalStats);
    setScreen('summary');
  }, []);

  // ── Save Run ──
  const saveRun = useCallback(() => {
    if (!pendingSummary) { setScreen('dashboard'); return; }
    const record: RunRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      hexes: pendingSummary.hexCount,
      distance: pendingSummary.distance,
      duration: pendingSummary.elapsedSeconds,
      speed: pendingSummary.speed,
    };
    setRuns((p) => [record, ...p]);
    setTotalStats((p) => {
      const newRuns = p.runs + 1;
      const newDist = p.distance + record.distance;
      const newHex = p.hexes + record.hexes;
      const totalSpeed = p.avgSpeed * p.runs + record.speed;
      return { hexes: newHex, distance: newDist, runs: newRuns, avgSpeed: newRuns > 0 ? totalSpeed / newRuns : 0 };
    });
    setPendingSummary(null);
    setScreen('dashboard');
  }, [pendingSummary]);

  // ── Cleanup on unmount ──
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    watchSubRef.current?.remove();
  }, []);

  // ══════ RENDER ══════

  if (screen === 'auth') {
    return <AuthScreen onEnter={() => setScreen('map')} />;
  }

  if (screen === 'summary' && pendingSummary) {
    return <SummaryScreen stats={pendingSummary} onSave={saveRun} />;
  }

  if (screen === 'dashboard') {
    return (
      <DashboardScreen
        totalStats={totalStats}
        runs={runs}
        hexCount={hexCount}
        currentScreen={screen}
        onNavigate={setScreen}
      />
    );
  }

  if (screen === 'clubs') {
    return (
      <ClubsScreen
        joinedClub={joinedClub}
        onJoin={setJoinedClub}
        currentScreen={screen}
        onNavigate={setScreen}
      />
    );
  }

  if (screen === 'profile') {
    return (
      <ProfileScreen
        user={user}
        totalStats={totalStats}
        hexCount={hexCount}
        runsCount={runs.length}
        currentScreen={screen}
        onNavigate={setScreen}
      />
    );
  }

  // ── Map screen ──
  if (locError) {
    return (
      <View testID="error-screen" style={st.center}>
        <View style={st.glass}>
          <Text style={st.errIcon}>⚠</Text>
          <Text testID="error-message" style={st.errTxt}>{locError}</Text>
          <Text style={st.errHint}>Enable location in device settings.</Text>
        </View>
      </View>
    );
  }

  if (!location) {
    return (
      <View testID="loading-screen" style={st.center}>
        <View style={st.glass}>
          <ActivityIndicator testID="loading-indicator" size="large" color="#60A5FA" />
          <Text style={st.loadTxt}>Acquiring GPS signal...</Text>
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
      stats={runStats}
      isRunning={isRunning}
      onStartRun={startRun}
      onEndRun={endRun}
      currentScreen={screen}
      onNavigate={setScreen}
    />
  );
}

const st = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#080C14', paddingHorizontal: 24 },
  glass: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 32, alignItems: 'center', width: '100%', maxWidth: 320 },
  errIcon: { fontSize: 36, marginBottom: 16 },
  errTxt: { color: '#FCA5A5', fontSize: 15, fontWeight: '600', textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  errHint: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' },
  loadTxt: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 16 },
});

import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Platform,
} from 'react-native';
import MapView, { Marker, Polygon, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import type { Screen } from '../app/index';

interface LatLng { latitude: number; longitude: number }
interface HexPoly { id: string; coordinates: LatLng[] }
interface RunStats { distance: number; elapsedSeconds: number; speed: number; hexCount: number }

interface Props {
  latitude: number;
  longitude: number;
  hexPolygons: HexPoly[];
  hexCount: number;
  lastCapturedHex: string | null;
  trailPoints: LatLng[];
  stats: RunStats;
  isRunning: boolean;
  onStartRun: () => void;
  onEndRun: () => void;
  currentScreen: Screen;
  onNavigate: (s: Screen) => void;
  mapRef: React.RefObject<any>;
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sc = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`;
}
function fmtDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`;
}

const DARK_MAP = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5a5a7a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a4a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a3a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1525' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

export default function HexMap({
  latitude, longitude, hexPolygons, hexCount, lastCapturedHex,
  trailPoints, stats, isRunning, onStartRun, onEndRun,
  currentScreen, onNavigate, mapRef,
}: Props) {
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (lastCapturedHex) {
      flashAnim.setValue(1);
      Animated.timing(flashAnim, { toValue: 0, duration: 1000, useNativeDriver: true }).start();
    }
  }, [lastCapturedHex, flashAnim]);

  return (
    <View testID="map-screen" style={s.container}>
      <MapView
        ref={mapRef}
        testID="map-view"
        style={s.map}
        initialRegion={{ latitude, longitude, latitudeDelta: 0.004, longitudeDelta: 0.004 }}
        customMapStyle={DARK_MAP}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
        showsTraffic={false}
      >
        {trailPoints.length > 1 && (
          <Polyline coordinates={trailPoints} strokeColor="rgba(167,139,250,0.6)" strokeWidth={3} />
        )}
        {hexPolygons.map((hex) => (
          <Polygon
            key={hex.id}
            coordinates={hex.coordinates}
            fillColor={hex.id === lastCapturedHex ? 'rgba(96,165,250,0.45)' : 'rgba(96,165,250,0.18)'}
            strokeColor={hex.id === lastCapturedHex ? 'rgba(147,197,253,0.8)' : 'rgba(96,165,250,0.4)'}
            strokeWidth={hex.id === lastCapturedHex ? 2 : 1}
          />
        ))}
        <Marker coordinate={{ latitude, longitude }} anchor={{ x: 0.5, y: 0.5 }} flat tracksViewChanges={false}>
          <View style={s.dotOuter}><View style={s.dotPulse} /><View style={s.dotCore} /></View>
        </Marker>
      </MapView>

      {/* Flash overlay */}
      <Animated.View pointerEvents="none" style={[s.flash, { opacity: flashAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.25] }) }]} />

      {/* ── Top card ── */}
      <View testID="stats-overlay" style={s.topCard}>
        <View>
          <Text style={s.brand}>RunWars</Text>
          <Text style={s.brandSub}>{isRunning ? 'Run Active' : 'Ready'}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text testID="hex-count" style={s.hexVal}>{hexCount}</Text>
          <Text style={s.hexLbl}>hexes</Text>
        </View>
      </View>

      {/* ── Bottom stats (visible during run) ── */}
      {isRunning && (
        <View testID="bottom-panel" style={s.bottomPanel}>
          <View style={s.statCol}>
            <Ionicons name="navigate-outline" size={14} color="#60A5FA" />
            <Text style={s.statVal}>{fmtDist(stats.distance)}</Text>
            <Text style={s.statLbl}>distance</Text>
          </View>
          <View style={s.divider} />
          <View style={s.statCol}>
            <Ionicons name="time-outline" size={14} color="#60A5FA" />
            <Text style={s.statVal}>{fmtTime(stats.elapsedSeconds)}</Text>
            <Text style={s.statLbl}>time</Text>
          </View>
          <View style={s.divider} />
          <View style={s.statCol}>
            <Ionicons name="speedometer-outline" size={14} color="#60A5FA" />
            <Text style={s.statVal}>{stats.speed.toFixed(1)}</Text>
            <Text style={s.statLbl}>km/h</Text>
          </View>
        </View>
      )}

      {/* ── Start / End Run button ── */}
      <TouchableOpacity
        testID={isRunning ? 'end-run-btn' : 'start-run-btn'}
        style={[s.runBtn, isRunning && s.runBtnEnd]}
        onPress={isRunning ? onEndRun : onStartRun}
        activeOpacity={0.8}
      >
        <Ionicons name={isRunning ? 'stop-circle' : 'play'} size={22} color={isRunning ? '#fff' : '#080C14'} />
        <Text style={[s.runBtnTxt, isRunning && s.runBtnTxtEnd]}>
          {isRunning ? 'End Run' : 'Start Run'}
        </Text>
      </TouchableOpacity>

      {/* ── Coords pill ── */}
      <View testID="coords-overlay" style={s.coordsPill}>
        <View style={s.coordsDot} />
        <Text style={s.coordsTxt}>{latitude.toFixed(5)}, {longitude.toFixed(5)}</Text>
      </View>

      {/* ── Tab bar ── */}
      <View testID="main-tab-bar" style={s.tabBar}>
        {([
          { key: 'map', icon: 'map', label: 'Map' },
          { key: 'dashboard', icon: 'stats-chart', label: 'Stats' },
          { key: 'clubs', icon: 'people', label: 'Clubs' },
          { key: 'profile', icon: 'person', label: 'Profile' },
        ] as { key: Screen; icon: any; label: string }[]).map((t) => (
          <TouchableOpacity
            key={t.key}
            testID={`tab-${t.key}`}
            style={s.tabItem}
            onPress={() => onNavigate(t.key)}
            activeOpacity={0.7}
          >
            <Ionicons name={t.icon} size={20} color={currentScreen === t.key ? '#60A5FA' : 'rgba(255,255,255,0.3)'} />
            <Text style={[s.tabLbl, currentScreen === t.key && s.tabLblActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const GL = { backgroundColor: 'rgba(8,12,20,0.78)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' };

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080C14' },
  map: { flex: 1 },

  dotOuter: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  dotPulse: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(96,165,250,0.15)' },
  dotCore: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#60A5FA', borderWidth: 2.5, borderColor: '#fff', shadowColor: '#60A5FA', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8, elevation: 6 },

  flash: { ...StyleSheet.absoluteFillObject, backgroundColor: '#60A5FA' },

  topCard: { position: 'absolute', top: 56, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...GL, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14 },
  brand: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  brandSub: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 1 },
  hexVal: { color: '#60A5FA', fontSize: 28, fontWeight: '800', lineHeight: 32 },
  hexLbl: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },

  bottomPanel: { position: 'absolute', bottom: 158, left: 16, right: 16, flexDirection: 'row', ...GL, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 8 },
  statCol: { flex: 1, alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: 3 },
  statLbl: { color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 1 },
  divider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.08)' },

  runBtn: { position: 'absolute', bottom: 104, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#60A5FA', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 28 },
  runBtnEnd: { backgroundColor: 'rgba(239,68,68,0.8)' },
  runBtnTxt: { color: '#080C14', fontSize: 16, fontWeight: '800' },
  runBtnTxtEnd: { color: '#fff' },

  coordsPill: { position: 'absolute', bottom: 74, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', ...GL, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  coordsDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34D399', marginRight: 8 },
  coordsTxt: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) },

  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: 'rgba(8,12,20,0.92)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingBottom: 28, paddingTop: 10 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabLbl: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '600', marginTop: 4 },
  tabLblActive: { color: '#60A5FA' },
});

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import MapView, { Marker, Polygon, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

interface LatLng { latitude: number; longitude: number }
interface HexPoly { id: string; coordinates: LatLng[] }
interface RunStats { distance: number; elapsedSeconds: number; speed: number }

interface Props {
  latitude: number;
  longitude: number;
  hexPolygons: HexPoly[];
  hexCount: number;
  lastCapturedHex: string | null;
  trailPoints: LatLng[];
  stats: RunStats;
  activeTab: 'map' | 'dashboard';
  onTabChange: (tab: 'map' | 'dashboard') => void;
  mapRef: React.RefObject<any>;
}

// ── Helpers ──
function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}
function fmtDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`;
}

// ── Dark map style ──
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

// ── Mock clubs ──
const CLUBS = [
  {
    name: 'Downtown Runners',
    icon: 'footsteps-outline' as const,
    members: [
      { name: 'Alex M.', hexes: 142 },
      { name: 'Jordan K.', hexes: 98 },
      { name: 'Sam W.', hexes: 76 },
    ],
  },
  {
    name: 'Hex Hunters',
    icon: 'flash-outline' as const,
    members: [
      { name: 'Riley P.', hexes: 210 },
      { name: 'Casey L.', hexes: 185 },
      { name: 'Drew T.', hexes: 134 },
      { name: 'Morgan B.', hexes: 91 },
    ],
  },
];

// ══════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════
export default function HexMap({
  latitude,
  longitude,
  hexPolygons,
  hexCount,
  lastCapturedHex,
  trailPoints,
  stats,
  activeTab,
  onTabChange,
  mapRef,
}: Props) {
  // Capture flash animation
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (lastCapturedHex) {
      flashAnim.setValue(1);
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }).start();
    }
  }, [lastCapturedHex, flashAnim]);

  const flashOpacity = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  // ── Map View ──
  const renderMap = () => (
    <View style={s.flex1}>
      <MapView
        ref={mapRef}
        testID="map-view"
        style={s.flex1}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.004,
          longitudeDelta: 0.004,
        }}
        customMapStyle={DARK_MAP}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
        showsTraffic={false}
      >
        {/* Trail polyline */}
        {trailPoints.length > 1 && (
          <Polyline
            coordinates={trailPoints}
            strokeColor="rgba(96, 165, 250, 0.5)"
            strokeWidth={3}
          />
        )}

        {/* Hex territory */}
        {hexPolygons.map((hex) => (
          <Polygon
            key={hex.id}
            coordinates={hex.coordinates}
            fillColor={
              hex.id === lastCapturedHex
                ? 'rgba(96, 165, 250, 0.45)'
                : 'rgba(96, 165, 250, 0.18)'
            }
            strokeColor={
              hex.id === lastCapturedHex
                ? 'rgba(147, 197, 253, 0.8)'
                : 'rgba(96, 165, 250, 0.4)'
            }
            strokeWidth={hex.id === lastCapturedHex ? 2 : 1}
          />
        ))}

        {/* User blue dot */}
        <Marker
          testID="user-marker"
          coordinate={{ latitude, longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
          flat
          tracksViewChanges={false}
        >
          <View style={s.dotOuter}>
            <View style={s.dotPulse} />
            <View style={s.dotCore} />
          </View>
        </Marker>
      </MapView>

      {/* Capture flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[s.flashOverlay, { opacity: flashOpacity }]}
      />

      {/* ── Top glass card ── */}
      <View testID="stats-overlay" style={s.topCard}>
        <View style={s.topLeft}>
          <Text style={s.brand}>RunWars</Text>
          <Text style={s.brandSub}>Territory Tracker</Text>
        </View>
        <View style={s.topRight}>
          <Text testID="hex-count" style={s.hexVal}>{hexCount}</Text>
          <Text style={s.hexLbl}>hexes</Text>
        </View>
      </View>

      {/* ── Bottom glass panel ── */}
      <View testID="bottom-panel" style={s.bottomPanel}>
        <View style={s.statCol}>
          <Ionicons name="navigate-outline" size={16} color="#60A5FA" />
          <Text style={s.statVal}>{fmtDist(stats.distance)}</Text>
          <Text style={s.statLbl}>distance</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statCol}>
          <Ionicons name="time-outline" size={16} color="#60A5FA" />
          <Text style={s.statVal}>{fmtTime(stats.elapsedSeconds)}</Text>
          <Text style={s.statLbl}>time</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statCol}>
          <Ionicons name="speedometer-outline" size={16} color="#60A5FA" />
          <Text style={s.statVal}>{stats.speed.toFixed(1)}</Text>
          <Text style={s.statLbl}>km/h</Text>
        </View>
      </View>

      {/* ── Coords pill ── */}
      <View testID="coords-overlay" style={s.coordsPill}>
        <View style={s.coordsDot} />
        <Text style={s.coordsText}>
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </Text>
      </View>
    </View>
  );

  // ── Dashboard View ──
  const renderDashboard = () => (
    <ScrollView
      testID="dashboard-screen"
      style={s.dashScroll}
      contentContainerStyle={s.dashContent}
    >
      <Text style={s.dashTitle}>Dashboard</Text>
      <Text style={s.dashSub}>This Run</Text>

      {/* Stats grid */}
      <View style={s.statsGrid}>
        <View style={s.statsCard}>
          <Ionicons name="cube-outline" size={22} color="#60A5FA" />
          <Text style={s.cardVal}>{hexCount}</Text>
          <Text style={s.cardLbl}>Hexes</Text>
        </View>
        <View style={s.statsCard}>
          <Ionicons name="navigate-outline" size={22} color="#34D399" />
          <Text style={s.cardVal}>{fmtDist(stats.distance)}</Text>
          <Text style={s.cardLbl}>Distance</Text>
        </View>
        <View style={s.statsCard}>
          <Ionicons name="time-outline" size={22} color="#FBBF24" />
          <Text style={s.cardVal}>{fmtTime(stats.elapsedSeconds)}</Text>
          <Text style={s.cardLbl}>Duration</Text>
        </View>
        <View style={s.statsCard}>
          <Ionicons name="speedometer-outline" size={22} color="#F472B6" />
          <Text style={s.cardVal}>{stats.speed.toFixed(1)}</Text>
          <Text style={s.cardLbl}>Avg km/h</Text>
        </View>
      </View>

      {/* Clubs */}
      <Text style={s.sectionTitle}>Clubs</Text>
      {CLUBS.map((club) => (
        <View key={club.name} style={s.clubCard}>
          <View style={s.clubHeader}>
            <Ionicons name={club.icon} size={18} color="#60A5FA" />
            <Text style={s.clubName}>{club.name}</Text>
            <Text style={s.clubCount}>{club.members.length} members</Text>
          </View>
          {club.members.map((m, i) => (
            <View key={m.name} style={s.lbRow}>
              <Text style={s.lbRank}>{i + 1}</Text>
              <Text style={s.lbName}>{m.name}</Text>
              <Text style={s.lbHex}>{m.hexes} hexes</Text>
            </View>
          ))}
        </View>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // ══════ RENDER ══════
  return (
    <View testID="map-screen" style={s.container}>
      {activeTab === 'map' ? renderMap() : renderDashboard()}

      {/* ── Tab toggle ── */}
      <View testID="tab-bar" style={s.tabBar}>
        <TouchableOpacity
          testID="tab-map"
          style={[s.tab, activeTab === 'map' && s.tabActive]}
          onPress={() => onTabChange('map')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="map"
            size={18}
            color={activeTab === 'map' ? '#60A5FA' : 'rgba(255,255,255,0.35)'}
          />
          <Text style={[s.tabText, activeTab === 'map' && s.tabTextActive]}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="tab-dashboard"
          style={[s.tab, activeTab === 'dashboard' && s.tabActive]}
          onPress={() => onTabChange('dashboard')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="stats-chart"
            size={18}
            color={activeTab === 'dashboard' ? '#60A5FA' : 'rgba(255,255,255,0.35)'}
          />
          <Text style={[s.tabText, activeTab === 'dashboard' && s.tabTextActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════
const GLASS = {
  backgroundColor: 'rgba(8, 12, 20, 0.75)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080C14' },
  flex1: { flex: 1 },

  // Dot marker
  dotOuter: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  dotPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(96,165,250,0.15)',
  },
  dotCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#60A5FA',
    borderWidth: 2.5,
    borderColor: '#fff',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },

  // Capture flash
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#60A5FA',
  },

  // Top card
  topCard: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...GLASS,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  topLeft: { flexShrink: 1 },
  brand: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  brandSub: { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: '500', marginTop: 1 },
  topRight: { alignItems: 'flex-end' },
  hexVal: { color: '#60A5FA', fontSize: 28, fontWeight: '800', lineHeight: 32 },
  hexLbl: { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: '500' },

  // Bottom panel
  bottomPanel: {
    position: 'absolute',
    bottom: 96,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...GLASS,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statCol: { flex: 1, alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 4 },
  statLbl: { color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: '500', marginTop: 2 },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // Coords pill
  coordsPill: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    ...GLASS,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  coordsDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34D399', marginRight: 8 },
  coordsText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },

  // Tab bar
  tabBar: {
    position: 'absolute',
    bottom: 36,
    alignSelf: 'center',
    flexDirection: 'row',
    ...GLASS,
    borderRadius: 24,
    padding: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tabActive: { backgroundColor: 'rgba(96,165,250,0.12)' },
  tabText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  tabTextActive: { color: '#60A5FA' },

  // Dashboard
  dashScroll: { flex: 1, backgroundColor: '#080C14' },
  dashContent: { paddingTop: 64, paddingHorizontal: 20, paddingBottom: 20 },
  dashTitle: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  dashSub: { color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 20 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  statsCard: {
    width: '47%' as any,
    ...GLASS,
    borderRadius: 16,
    padding: 18,
    alignItems: 'flex-start',
  },
  cardVal: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 10 },
  cardLbl: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '500', marginTop: 2 },

  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },

  clubCard: {
    ...GLASS,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  clubName: { color: '#fff', fontSize: 15, fontWeight: '700', marginLeft: 8, flex: 1 },
  clubCount: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },

  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  lbRank: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
    fontWeight: '700',
    width: 24,
  },
  lbName: { color: '#fff', fontSize: 14, fontWeight: '500', flex: 1 },
  lbHex: { color: '#60A5FA', fontSize: 13, fontWeight: '600' },
});

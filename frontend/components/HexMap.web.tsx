import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

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

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}
function fmtDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`;
}

const CLUBS = [
  { name: 'Downtown Runners', members: [{ name: 'Alex M.', hexes: 142 }, { name: 'Jordan K.', hexes: 98 }, { name: 'Sam W.', hexes: 76 }] },
  { name: 'Hex Hunters', members: [{ name: 'Riley P.', hexes: 210 }, { name: 'Casey L.', hexes: 185 }, { name: 'Drew T.', hexes: 134 }, { name: 'Morgan B.', hexes: 91 }] },
];

export default function HexMap({ latitude, longitude, hexPolygons, hexCount, stats, activeTab, onTabChange }: Props) {
  return (
    <View testID="web-fallback-screen" style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.brand}>RunWars</Text>
          <Text style={s.brandSub}>Territory Tracker</Text>
        </View>

        <Text style={s.coords}>{latitude.toFixed(6)}, {longitude.toFixed(6)}</Text>

        {/* Stats grid */}
        <View style={s.grid}>
          <View style={s.card}>
            <Text testID="hex-count-web" style={[s.cardVal, { color: '#60A5FA' }]}>{hexCount}</Text>
            <Text style={s.cardLbl}>Hexes</Text>
          </View>
          <View style={s.card}>
            <Text style={[s.cardVal, { color: '#34D399' }]}>{fmtDist(stats.distance)}</Text>
            <Text style={s.cardLbl}>Distance</Text>
          </View>
          <View style={s.card}>
            <Text style={[s.cardVal, { color: '#FBBF24' }]}>{fmtTime(stats.elapsedSeconds)}</Text>
            <Text style={s.cardLbl}>Duration</Text>
          </View>
          <View style={s.card}>
            <Text style={[s.cardVal, { color: '#F472B6' }]}>{stats.speed.toFixed(1)}</Text>
            <Text style={s.cardLbl}>km/h</Text>
          </View>
        </View>

        {/* Captured hexes */}
        {hexPolygons.length > 0 && (
          <View style={s.hexSection}>
            <Text style={s.sectionTitle}>Captured H3 Indexes</Text>
            {hexPolygons.slice(0, 10).map((h) => (
              <Text key={h.id} style={s.hexItem}>{h.id}</Text>
            ))}
            {hexPolygons.length > 10 && (
              <Text style={s.hexItem}>...and {hexPolygons.length - 10} more</Text>
            )}
          </View>
        )}

        {/* Clubs */}
        <Text style={s.sectionTitle}>Clubs</Text>
        {CLUBS.map((club) => (
          <View key={club.name} style={s.clubCard}>
            <Text style={s.clubName}>{club.name}</Text>
            {club.members.map((m, i) => (
              <View key={m.name} style={s.lbRow}>
                <Text style={s.lbRank}>{i + 1}</Text>
                <Text style={s.lbName}>{m.name}</Text>
                <Text style={s.lbHex}>{m.hexes} hexes</Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={s.hint}>Open in Expo Go for the full map experience.</Text>
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Tab bar */}
      <View style={s.tabBar}>
        <TouchableOpacity
          style={[s.tab, activeTab === 'map' && s.tabActive]}
          onPress={() => onTabChange('map')}
        >
          <Text style={[s.tabText, activeTab === 'map' && s.tabTextActive]}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, activeTab === 'dashboard' && s.tabActive]}
          onPress={() => onTabChange('dashboard')}
        >
          <Text style={[s.tabText, activeTab === 'dashboard' && s.tabTextActive]}>Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const GL = { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' };

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080C14' },
  scroll: { flex: 1 },
  content: { paddingTop: 64, paddingHorizontal: 20, paddingBottom: 20, alignItems: 'center' },
  header: { ...GL, borderRadius: 16, paddingHorizontal: 28, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  brand: { color: '#fff', fontSize: 28, fontWeight: '800' },
  brandSub: { color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 },
  coords: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'monospace', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%', marginBottom: 24 },
  card: { width: '47%' as any, ...GL, borderRadius: 16, padding: 18, alignItems: 'center' },
  cardVal: { fontSize: 24, fontWeight: '800' },
  cardLbl: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 },
  hexSection: { ...GL, borderRadius: 12, padding: 16, width: '100%', marginBottom: 24 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12, width: '100%' },
  hexItem: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'monospace', marginBottom: 4 },
  clubCard: { ...GL, borderRadius: 16, padding: 16, width: '100%', marginBottom: 12 },
  clubName: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  lbRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  lbRank: { color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: '700', width: 24 },
  lbName: { color: '#fff', fontSize: 14, flex: 1 },
  lbHex: { color: '#60A5FA', fontSize: 13, fontWeight: '600' },
  hint: { color: 'rgba(255,255,255,0.2)', fontSize: 12, textAlign: 'center', marginTop: 20 },
  tabBar: {
    position: 'absolute',
    bottom: 36,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(8,12,20,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 4,
  },
  tab: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  tabActive: { backgroundColor: 'rgba(96,165,250,0.12)' },
  tabText: { color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#60A5FA' },
});

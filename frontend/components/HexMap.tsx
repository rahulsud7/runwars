import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Polygon, Polyline } from 'react-native-maps';

import {
  DashboardScreen,
  ClubsScreen,
  ProfileScreen,
} from './Screens';

import type { Screen, RunStats } from '../app/index';

// ───────── TYPES ─────────
interface LatLng {
  latitude: number;
  longitude: number;
}

interface HexPoly {
  id: string;
  coordinates: LatLng[];
}

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
  mapRef: React.RefObject<MapView>;
  streak: number;
}

// ───────── COMPONENT ─────────
export default function HexMap(props: Props) {
  const {
    latitude,
    longitude,
    hexPolygons,
    hexCount,
    lastCapturedHex,
    trailPoints,
    stats,
    isRunning,
    onStartRun,
    onEndRun,
    currentScreen,
    onNavigate,
    mapRef,
    streak,
  } = props;

  // ───────── ROUTING (NO TS ERRORS) ─────────
  if (currentScreen !== 'map') {
    if (currentScreen === 'dashboard') {
      return (
        <DashboardScreen
          totalStats={{
            hexes: hexCount,
            distance: stats.distance,
            runs: 1,
            avgSpeed: stats.speed,
          }}
          runs={[]}
          currentScreen={currentScreen}
          onNavigate={onNavigate}
        />
      );
    }

    if (currentScreen === 'clubs') {
      return (
        <ClubsScreen
          currentScreen={currentScreen}
          onNavigate={onNavigate}
        />
      );
    }

    if (currentScreen === 'profile') {
      return (
        <ProfileScreen
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          user={{ name: 'Rahul' }}
          totalStats={{ distance: stats.distance }}
        />
      );
    }

    return null;
  }

  // ───────── MAP UI ─────────
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation
        followsUserLocation
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* HEXES */}
        {hexPolygons.map((hex) => (
          <Polygon
            key={hex.id}
            coordinates={hex.coordinates}
            strokeColor={
              hex.id === lastCapturedHex ? '#00D4FF' : 'rgba(0,212,255,0.25)'
            }
            fillColor="rgba(0,212,255,0.08)"
            strokeWidth={2}
          />
        ))}

        {/* TRAIL */}
        {trailPoints.length > 1 && (
          <Polyline
            coordinates={trailPoints}
            strokeColor="#FF4D9D"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* TOP GLASS BAR */}
      <View style={styles.topBar}>
        <Text style={styles.title}>RunWars</Text>
        <Text style={styles.hex}>{hexCount} hexes</Text>
      </View>

      {/* STREAK */}
      {streak > 1 && (
        <View style={styles.streak}>
          <Text style={styles.streakText}>🔥 {streak} streak</Text>
        </View>
      )}

      {/* STATS HUD */}
      <View style={styles.stats}>
        <Stat label="Distance" value={`${Math.round(stats.distance)} m`} />
        <Stat
          label="Time"
          value={`${Math.floor(stats.elapsedSeconds / 60)}:${String(
            stats.elapsedSeconds % 60
          ).padStart(2, '0')}`}
        />
        <Stat label="Speed" value={`${stats.speed.toFixed(1)} km/h`} />
      </View>

      {/* RUN BUTTON */}
      <TouchableOpacity
        style={[styles.runBtn, isRunning && styles.endBtn]}
        onPress={isRunning ? onEndRun : onStartRun}
      >
        <Text style={styles.runText}>
          {isRunning ? 'End Run' : 'Start Run'}
        </Text>
      </TouchableOpacity>

      {/* TAB BAR */}
      <View style={styles.tabBar}>
        <Tab label="Map" active={true} onPress={() => onNavigate('map')} />
        <Tab label="Stats" onPress={() => onNavigate('dashboard')} />
        <Tab label="Clubs" onPress={() => onNavigate('clubs')} />
        <Tab label="Profile" onPress={() => onNavigate('profile')} />
      </View>
    </View>
  );
}

// ───────── SMALL COMPONENTS ─────────
function Stat({ label, value }: any) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Tab({ label, active, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={active ? styles.activeTab : styles.tab}>{label}</Text>
    </TouchableOpacity>
  );
}

// ───────── STYLES ─────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050A14' },

  topBar: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  hex: { color: '#00D4FF' },

  streak: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,212,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: { color: '#00D4FF', fontWeight: '800' },

  stats: {
    position: 'absolute',
    bottom: 130,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: { alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
  statLabel: { color: '#888', fontSize: 12 },

  runBtn: {
    position: 'absolute',
    bottom: 70,
    alignSelf: 'center',
    backgroundColor: '#00D4FF',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 30,
  },
  endBtn: { backgroundColor: '#ff4d4d' },
  runText: { color: '#000', fontWeight: '800' },

  tabBar: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tab: { color: '#777' },
  activeTab: { color: '#00D4FF', fontWeight: '800' },
});
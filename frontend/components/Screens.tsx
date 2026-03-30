import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Screen, RunStats, RunRecord } from '../app/index';

const BG = '#050A14';

// ───────── HELPERS ─────────
const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const fmtDist = (m: number) =>
  m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`;

// ───────── GLASS CARD ─────────
const Glass = ({ children }: any) => (
  <View style={styles.glass}>{children}</View>
);

// ───────── TAB BAR (FIXED) ─────────
function TabBar({
  current,
  onNavigate,
}: {
  current: Screen;
  onNavigate: (s: Screen) => void;
}) {
  const tabs: { key: Screen; icon: any }[] = [
    { key: 'map', icon: 'map' },
    { key: 'dashboard', icon: 'stats-chart' },
    { key: 'clubs', icon: 'people' },
    { key: 'profile', icon: 'person' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((t) => (
        <TouchableOpacity key={t.key} onPress={() => onNavigate(t.key)}>
          <Ionicons
            name={t.icon}
            size={24}
            color={current === t.key ? '#00D4FF' : 'rgba(255,255,255,0.4)'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ───────── AUTH ─────────
export function AuthScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <View style={styles.auth}>
      <Text style={styles.logo}>RunWars</Text>
      <Text style={styles.tag}>Dominate your city</Text>

      <TouchableOpacity style={styles.cta} onPress={onEnter}>
        <Text style={styles.ctaText}>ENTER ARENA</Text>
      </TouchableOpacity>
    </View>
  );
}

// ───────── SUMMARY (UPGRADED) ─────────
export function SummaryScreen({
  stats,
  onSave,
}: {
  stats: RunStats;
  onSave: () => void;
}) {
  const share = () => {
    Alert.alert(
      'Share Coming 🚀',
      'Next step: export this as a PNG (Strava style)'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.center}>
        <Text style={styles.title}>RUN COMPLETE</Text>

        <View style={styles.grid}>
          <Glass>
            <Text style={styles.bigBlue}>{stats.hexCount}</Text>
            <Text style={styles.label}>Hexes</Text>
          </Glass>

          <Glass>
            <Text style={styles.bigGreen}>{fmtDist(stats.distance)}</Text>
            <Text style={styles.label}>Distance</Text>
          </Glass>

          <Glass>
            <Text style={styles.bigYellow}>{fmtTime(stats.elapsedSeconds)}</Text>
            <Text style={styles.label}>Time</Text>
          </Glass>

          <Glass>
            <Text style={styles.bigPink}>{stats.speed.toFixed(1)}</Text>
            <Text style={styles.label}>km/h</Text>
          </Glass>
        </View>

        <TouchableOpacity style={styles.cta} onPress={onSave}>
          <Text style={styles.ctaText}>SAVE RUN</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={share}>
          <Text style={styles.secondaryText}>SHARE RUN</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ───────── DASHBOARD (SAFE) ─────────
export function DashboardScreen({
  totalStats,
  runs,
  currentScreen,
  onNavigate,
}: any) {
  const safeStats = totalStats || {
    hexes: 0,
    distance: 0,
    runs: 0,
    avgSpeed: 0,
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.title}>Dashboard</Text>

        <View style={styles.grid}>
          <Glass>
            <Text style={styles.bigBlue}>{safeStats.hexes}</Text>
            <Text style={styles.label}>Hexes</Text>
          </Glass>

          <Glass>
            <Text style={styles.bigGreen}>{fmtDist(safeStats.distance)}</Text>
            <Text style={styles.label}>Distance</Text>
          </Glass>

          <Glass>
            <Text style={styles.bigYellow}>{safeStats.runs}</Text>
            <Text style={styles.label}>Runs</Text>
          </Glass>

          <Glass>
            <Text style={styles.bigPink}>
              {safeStats.avgSpeed.toFixed(1)}
            </Text>
            <Text style={styles.label}>Avg Speed</Text>
          </Glass>
        </View>

        <Text style={styles.section}>Recent Runs</Text>

        {(runs || []).map((r: RunRecord) => (
          <View key={r.id} style={styles.row}>
            <Text style={styles.rowText}>{r.date}</Text>
            <Text style={styles.rowText}>{fmtDist(r.distance)}</Text>
            <Text style={styles.rowText}>{r.hexes} hex</Text>
          </View>
        ))}
      </ScrollView>

      <TabBar current={currentScreen} onNavigate={onNavigate} />
    </View>
  );
}

// ───────── CLUBS ─────────
export function ClubsScreen({ currentScreen, onNavigate }: any) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.title}>Clubs</Text>

        {['Mohali Militia', 'Hex Hunters', 'Downtown Runners'].map((c) => (
          <Glass key={c}>
            <Text style={styles.club}>{c}</Text>
          </Glass>
        ))}
      </ScrollView>

      <TabBar current={currentScreen} onNavigate={onNavigate} />
    </View>
  );
}

// ───────── PROFILE ─────────
export function ProfileScreen({
  user,
  totalStats,
  currentScreen,
  onNavigate,
}: any) {
  const safeStats = totalStats || { distance: 0 };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.center}>
        <Text style={styles.logo}>{user?.name || 'Runner'}</Text>

        <Glass>
          <Text style={styles.label}>Total Distance</Text>
          <Text style={styles.bigGreen}>
            {fmtDist(safeStats.distance)}
          </Text>
        </Glass>
      </ScrollView>

      <TabBar current={currentScreen} onNavigate={onNavigate} />
    </View>
  );
}

// ───────── STYLES ─────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  pad: { padding: 20 },
  center: { alignItems: 'center', paddingTop: 80 },

  logo: { color: '#fff', fontSize: 42, fontWeight: '900' },
  tag: { color: '#aaa', marginBottom: 40 },

  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 20 },

  glass: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  bigBlue: { fontSize: 24, fontWeight: '800', color: '#00D4FF' },
  bigGreen: { fontSize: 24, fontWeight: '800', color: '#22FF88' },
  bigYellow: { fontSize: 24, fontWeight: '800', color: '#FFD600' },
  bigPink: { fontSize: 24, fontWeight: '800', color: '#FF4D9D' },

  label: { color: '#888', fontSize: 12 },

  section: { color: '#fff', fontSize: 18, marginTop: 20 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowText: { color: '#ccc' },

  club: { color: '#fff', fontSize: 16 },

  cta: {
    backgroundColor: '#00D4FF',
    padding: 16,
    borderRadius: 30,
    marginTop: 30,
  },
  ctaText: {
    color: '#000',
    fontWeight: '800',
  },

  secondaryBtn: {
    marginTop: 10,
    padding: 12,
  },
  secondaryText: {
    color: '#00D4FF',
    fontWeight: '700',
  },

  auth: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
});
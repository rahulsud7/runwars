import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Screen, RunStats, RunRecord } from '../app/index';

// ── Shared ──
const GL = { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' } as const;
const BG = '#080C14';

function fmtTime(s: number) { const m = Math.floor(s / 60); const sc = s % 60; return `${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`; }
function fmtDist(m: number) { return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`; }

// ── Bottom Tab Bar ──
function TabBar({ current, onNavigate }: { current: Screen; onNavigate: (s: Screen) => void }) {
  const tabs: { key: Screen; icon: any; label: string }[] = [
    { key: 'map', icon: 'map', label: 'Map' },
    { key: 'dashboard', icon: 'stats-chart', label: 'Stats' },
    { key: 'clubs', icon: 'people', label: 'Clubs' },
    { key: 'profile', icon: 'person', label: 'Profile' },
  ];
  return (
    <View testID="main-tab-bar" style={tb.bar}>
      {tabs.map((t) => (
        <TouchableOpacity
          key={t.key}
          testID={`tab-${t.key}`}
          style={tb.item}
          onPress={() => onNavigate(t.key)}
          activeOpacity={0.7}
        >
          <Ionicons name={t.icon} size={20} color={current === t.key ? '#60A5FA' : 'rgba(255,255,255,0.3)'} />
          <Text style={[tb.label, current === t.key && tb.labelActive]}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const tb = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: 'rgba(8,12,20,0.92)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingBottom: 28, paddingTop: 10 },
  item: { flex: 1, alignItems: 'center' },
  label: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '600', marginTop: 4 },
  labelActive: { color: '#60A5FA' },
});

// ══════════════════════════════════════
//  1. AUTH SCREEN
// ══════════════════════════════════════
export function AuthScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <View testID="auth-screen" style={a.container}>
      <View style={a.glow} />
      <Text style={a.brand}>RunWars</Text>
      <Text style={a.tagline}>Claim your territory</Text>
      <TouchableOpacity testID="enter-btn" style={a.btn} onPress={onEnter} activeOpacity={0.8}>
        <Ionicons name="flash" size={20} color="#080C14" />
        <Text style={a.btnText}>Enter Arena</Text>
      </TouchableOpacity>
      <Text style={a.hint}>GPS-powered hex territory game</Text>
    </View>
  );
}
const a = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(96,165,250,0.06)' },
  brand: { color: '#fff', fontSize: 48, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  tagline: { color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: '500', marginBottom: 48 },
  btn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#60A5FA', paddingHorizontal: 36, paddingVertical: 16, borderRadius: 28, gap: 10 },
  btnText: { color: '#080C14', fontSize: 17, fontWeight: '800' },
  hint: { color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 32 },
});

// ══════════════════════════════════════
//  3. RUN SUMMARY SCREEN
// ══════════════════════════════════════
export function SummaryScreen({ stats, onSave }: { stats: RunStats; onSave: () => void }) {
  return (
    <SafeAreaView testID="summary-screen" style={su.container}>
      <ScrollView contentContainerStyle={su.content}>
        <Ionicons name="trophy" size={48} color="#FBBF24" style={{ marginBottom: 16 }} />
        <Text style={su.title}>Run Complete!</Text>
        <Text style={su.sub}>Great effort out there</Text>

        <View style={su.grid}>
          <View style={su.card}>
            <Text style={[su.val, { color: '#60A5FA' }]}>{stats.hexCount}</Text>
            <Text style={su.lbl}>Hexes Captured</Text>
          </View>
          <View style={su.card}>
            <Text style={[su.val, { color: '#34D399' }]}>{fmtDist(stats.distance)}</Text>
            <Text style={su.lbl}>Distance</Text>
          </View>
          <View style={su.card}>
            <Text style={[su.val, { color: '#FBBF24' }]}>{fmtTime(stats.elapsedSeconds)}</Text>
            <Text style={su.lbl}>Duration</Text>
          </View>
          <View style={su.card}>
            <Text style={[su.val, { color: '#F472B6' }]}>{stats.speed.toFixed(1)}</Text>
            <Text style={su.lbl}>Avg km/h</Text>
          </View>
        </View>

        <TouchableOpacity testID="save-run-btn" style={su.btn} onPress={onSave} activeOpacity={0.8}>
          <Ionicons name="checkmark-circle" size={20} color="#080C14" />
          <Text style={su.btnTxt}>Save Run</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const su = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { paddingTop: 80, paddingHorizontal: 24, alignItems: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%', marginBottom: 40 },
  card: { width: '47%' as any, ...GL, borderRadius: 16, padding: 20, alignItems: 'center' },
  val: { fontSize: 26, fontWeight: '800' },
  lbl: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '500', marginTop: 4 },
  btn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#34D399', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24, gap: 8 },
  btnTxt: { color: '#080C14', fontSize: 16, fontWeight: '800' },
});

// ══════════════════════════════════════
//  4. DASHBOARD SCREEN
// ══════════════════════════════════════
export function DashboardScreen({ totalStats, runs, hexCount, currentScreen, onNavigate }: {
  totalStats: { hexes: number; distance: number; runs: number; avgSpeed: number };
  runs: RunRecord[];
  hexCount: number;
  currentScreen: Screen;
  onNavigate: (s: Screen) => void;
}) {
  return (
    <View testID="dashboard-screen" style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView contentContainerStyle={d.content}>
        <Text style={d.title}>Dashboard</Text>
        <Text style={d.sub}>Your RunWars stats</Text>

        <View style={d.grid}>
          {[
            { val: String(totalStats.hexes || hexCount), lbl: 'Total Hexes', color: '#60A5FA', icon: 'cube-outline' },
            { val: fmtDist(totalStats.distance), lbl: 'Distance', color: '#34D399', icon: 'navigate-outline' },
            { val: String(totalStats.runs), lbl: 'Total Runs', color: '#FBBF24', icon: 'fitness-outline' },
            { val: totalStats.avgSpeed.toFixed(1), lbl: 'Avg km/h', color: '#F472B6', icon: 'speedometer-outline' },
          ].map((item) => (
            <View key={item.lbl} style={d.card}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
              <Text style={[d.val, { color: item.color }]}>{item.val}</Text>
              <Text style={d.lbl}>{item.lbl}</Text>
            </View>
          ))}
        </View>

        <Text style={d.section}>Recent Runs</Text>
        {runs.length === 0 ? (
          <View style={d.empty}>
            <Ionicons name="footsteps-outline" size={32} color="rgba(255,255,255,0.15)" />
            <Text style={d.emptyTxt}>No runs yet. Start your first run!</Text>
          </View>
        ) : (
          runs.slice(0, 10).map((r) => (
            <View key={r.id} style={d.runRow}>
              <View style={{ flex: 1 }}>
                <Text style={d.runDate}>{r.date}</Text>
                <Text style={d.runDetail}>{fmtDist(r.distance)} · {fmtTime(r.duration)} · {r.hexes} hexes</Text>
              </View>
              <Text style={d.runSpeed}>{r.speed.toFixed(1)} km/h</Text>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
      <TabBar current={currentScreen} onNavigate={onNavigate} />
    </View>
  );
}
const d = StyleSheet.create({
  content: { paddingTop: 64, paddingHorizontal: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  sub: { color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  card: { width: '47%' as any, ...GL, borderRadius: 16, padding: 18, alignItems: 'flex-start' },
  val: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  lbl: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  section: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  empty: { ...GL, borderRadius: 16, padding: 32, alignItems: 'center' },
  emptyTxt: { color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 10 },
  runRow: { ...GL, borderRadius: 14, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  runDate: { color: '#fff', fontSize: 14, fontWeight: '600' },
  runDetail: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  runSpeed: { color: '#60A5FA', fontSize: 14, fontWeight: '700' },
});

// ══════════════════════════════════════
//  5. CLUBS SCREEN
// ══════════════════════════════════════
const CLUBS_DATA = [
  { id: 'mohali', name: 'Mohali Militia', icon: 'shield-outline' as const, members: [{ name: 'Arjun S.', hexes: 312 }, { name: 'Priya K.', hexes: 287 }, { name: 'Ravi M.', hexes: 198 }] },
  { id: 'hunters', name: 'Hex Hunters', icon: 'flash-outline' as const, members: [{ name: 'Riley P.', hexes: 210 }, { name: 'Casey L.', hexes: 185 }, { name: 'Drew T.', hexes: 134 }, { name: 'Morgan B.', hexes: 91 }] },
  { id: 'downtown', name: 'Downtown Runners', icon: 'footsteps-outline' as const, members: [{ name: 'Alex M.', hexes: 142 }, { name: 'Jordan K.', hexes: 98 }, { name: 'Sam W.', hexes: 76 }] },
];

export function ClubsScreen({ joinedClub, onJoin, currentScreen, onNavigate }: {
  joinedClub: string | null;
  onJoin: (id: string | null) => void;
  currentScreen: Screen;
  onNavigate: (s: Screen) => void;
}) {
  return (
    <View testID="clubs-screen" style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView contentContainerStyle={c.content}>
        <Text style={c.title}>Clubs</Text>
        <Text style={c.sub}>Join a crew, dominate territory</Text>

        {CLUBS_DATA.map((club) => {
          const isJoined = joinedClub === club.id;
          const totalHexes = club.members.reduce((sum, m) => sum + m.hexes, 0);
          return (
            <View key={club.id} style={c.card}>
              <View style={c.header}>
                <Ionicons name={club.icon} size={20} color="#60A5FA" />
                <Text style={c.name}>{club.name}</Text>
                <Text style={c.memberCount}>{totalHexes} hexes</Text>
              </View>
              {club.members.map((m, i) => (
                <View key={m.name} style={c.row}>
                  <Text style={c.rank}>{i + 1}</Text>
                  <Text style={c.mName}>{m.name}</Text>
                  <Text style={c.mHex}>{m.hexes}</Text>
                </View>
              ))}
              <TouchableOpacity
                testID={`join-${club.id}`}
                style={[c.joinBtn, isJoined && c.joinedBtn]}
                onPress={() => onJoin(isJoined ? null : club.id)}
                activeOpacity={0.7}
              >
                <Text style={[c.joinTxt, isJoined && c.joinedTxt]}>
                  {isJoined ? 'Joined ✓' : 'Join Club'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
      <TabBar current={currentScreen} onNavigate={onNavigate} />
    </View>
  );
}
const c = StyleSheet.create({
  content: { paddingTop: 64, paddingHorizontal: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  sub: { color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 24 },
  card: { ...GL, borderRadius: 16, padding: 16, marginBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  name: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8, flex: 1 },
  memberCount: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  rank: { color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: '700', width: 24 },
  mName: { color: '#fff', fontSize: 14, flex: 1 },
  mHex: { color: '#60A5FA', fontSize: 13, fontWeight: '600' },
  joinBtn: { marginTop: 12, alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(96,165,250,0.4)' },
  joinedBtn: { backgroundColor: 'rgba(96,165,250,0.15)', borderColor: '#60A5FA' },
  joinTxt: { color: 'rgba(96,165,250,0.7)', fontSize: 13, fontWeight: '700' },
  joinedTxt: { color: '#60A5FA' },
});

// ══════════════════════════════════════
//  6. PROFILE SCREEN
// ══════════════════════════════════════
export function ProfileScreen({ user, totalStats, hexCount, runsCount, currentScreen, onNavigate }: {
  user: { name: string; avatar: null };
  totalStats: { hexes: number; distance: number; runs: number; avgSpeed: number };
  hexCount: number;
  runsCount: number;
  currentScreen: Screen;
  onNavigate: (s: Screen) => void;
}) {
  return (
    <View testID="profile-screen" style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView contentContainerStyle={p.content}>
        <View style={p.avatarWrap}>
          <View style={p.avatar}>
            <Ionicons name="person" size={36} color="rgba(255,255,255,0.5)" />
          </View>
          <Text style={p.name}>{user.name}</Text>
          <Text style={p.tag}>Territory Warrior</Text>
        </View>

        <View style={p.grid}>
          {[
            { val: String(totalStats.hexes || hexCount), lbl: 'Hexes', color: '#60A5FA' },
            { val: fmtDist(totalStats.distance), lbl: 'Distance', color: '#34D399' },
            { val: String(totalStats.runs || runsCount), lbl: 'Runs', color: '#FBBF24' },
            { val: `${totalStats.avgSpeed.toFixed(1)}`, lbl: 'Avg km/h', color: '#F472B6' },
          ].map((item) => (
            <View key={item.lbl} style={p.card}>
              <Text style={[p.val, { color: item.color }]}>{item.val}</Text>
              <Text style={p.lbl}>{item.lbl}</Text>
            </View>
          ))}
        </View>

        <View style={p.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color="rgba(255,255,255,0.3)" />
          <Text style={p.infoTxt}>Profile data is stored locally. Backend sync coming soon.</Text>
        </View>
      </ScrollView>
      <TabBar current={currentScreen} onNavigate={onNavigate} />
    </View>
  );
}
const p = StyleSheet.create({
  content: { paddingTop: 72, paddingHorizontal: 20, alignItems: 'center' },
  avatarWrap: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, ...GL, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  name: { color: '#fff', fontSize: 22, fontWeight: '800' },
  tag: { color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%', marginBottom: 24 },
  card: { width: '47%' as any, ...GL, borderRadius: 16, padding: 18, alignItems: 'center' },
  val: { fontSize: 24, fontWeight: '800' },
  lbl: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 },
  infoCard: { ...GL, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoTxt: { color: 'rgba(255,255,255,0.3)', fontSize: 12, flex: 1 },
});

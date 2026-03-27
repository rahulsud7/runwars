import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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

function fmtTime(s: number) { const m = Math.floor(s / 60); const sc = s % 60; return `${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`; }
function fmtDist(m: number) { return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`; }

export default function HexMap({ latitude, longitude, hexPolygons, hexCount, stats, isRunning, onStartRun, onEndRun, currentScreen, onNavigate }: Props) {
  return (
    <View testID="web-fallback-screen" style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.header}><Text style={s.brand}>RunWars</Text><Text style={s.sub}>Territory Tracker</Text></View>
        <Text style={s.coords}>{latitude.toFixed(6)}, {longitude.toFixed(6)}</Text>
        <View style={s.grid}>
          <View style={s.card}><Text testID="hex-count-web" style={[s.val,{color:'#60A5FA'}]}>{hexCount}</Text><Text style={s.lbl}>Hexes</Text></View>
          <View style={s.card}><Text style={[s.val,{color:'#34D399'}]}>{fmtDist(stats.distance)}</Text><Text style={s.lbl}>Distance</Text></View>
          <View style={s.card}><Text style={[s.val,{color:'#FBBF24'}]}>{fmtTime(stats.elapsedSeconds)}</Text><Text style={s.lbl}>Duration</Text></View>
          <View style={s.card}><Text style={[s.val,{color:'#F472B6'}]}>{stats.speed.toFixed(1)}</Text><Text style={s.lbl}>km/h</Text></View>
        </View>
        <TouchableOpacity testID={isRunning?'end-run-btn':'start-run-btn'} style={[s.btn, isRunning && s.btnEnd]} onPress={isRunning ? onEndRun : onStartRun}>
          <Text style={[s.btnTxt, isRunning && s.btnTxtEnd]}>{isRunning ? 'End Run' : 'Start Run'}</Text>
        </TouchableOpacity>
        {hexPolygons.length > 0 && (<View style={s.hexSec}><Text style={s.secTitle}>Captured H3 Indexes</Text>{hexPolygons.slice(0,8).map(h=>(<Text key={h.id} style={s.hexItem}>{h.id}</Text>))}</View>)}
        <Text style={s.hint}>Open in Expo Go for the full map experience.</Text>
        <View style={{height:80}} />
      </ScrollView>
      <View style={s.tabBar}>
        {(['map','dashboard','clubs','profile'] as Screen[]).map(t=>(<TouchableOpacity key={t} testID={`tab-${t}`} style={s.tab} onPress={()=>onNavigate(t)}><Text style={[s.tabTxt, currentScreen===t && s.tabTxtA]}>{t.charAt(0).toUpperCase()+t.slice(1)}</Text></TouchableOpacity>))}
      </View>
    </View>
  );
}

const GL = {backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.08)'};
const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#080C14'},
  content:{paddingTop:64,paddingHorizontal:20,alignItems:'center'},
  header:{...GL,borderRadius:16,paddingHorizontal:28,paddingVertical:16,alignItems:'center',marginBottom:16},
  brand:{color:'#fff',fontSize:28,fontWeight:'800'},
  sub:{color:'rgba(255,255,255,0.35)',fontSize:12,marginTop:2},
  coords:{color:'rgba(255,255,255,0.4)',fontSize:13,fontFamily:'monospace',marginBottom:20},
  grid:{flexDirection:'row',flexWrap:'wrap',gap:12,width:'100%',marginBottom:24},
  card:{width:'47%' as any,...GL,borderRadius:16,padding:18,alignItems:'center'},
  val:{fontSize:24,fontWeight:'800'},
  lbl:{color:'rgba(255,255,255,0.4)',fontSize:12,marginTop:4},
  btn:{backgroundColor:'#60A5FA',paddingHorizontal:32,paddingVertical:14,borderRadius:24,marginBottom:24},
  btnEnd:{backgroundColor:'rgba(239,68,68,0.8)'},
  btnTxt:{color:'#080C14',fontSize:16,fontWeight:'800'},
  btnTxtEnd:{color:'#fff'},
  hexSec:{...GL,borderRadius:12,padding:16,width:'100%',marginBottom:24},
  secTitle:{color:'#fff',fontSize:14,fontWeight:'700',marginBottom:8},
  hexItem:{color:'rgba(255,255,255,0.3)',fontSize:11,fontFamily:'monospace',marginBottom:3},
  hint:{color:'rgba(255,255,255,0.2)',fontSize:12,marginTop:12},
  tabBar:{position:'absolute',bottom:0,left:0,right:0,flexDirection:'row',backgroundColor:'rgba(8,12,20,0.92)',borderTopWidth:1,borderTopColor:'rgba(255,255,255,0.06)',paddingBottom:28,paddingTop:12},
  tab:{flex:1,alignItems:'center'},
  tabTxt:{color:'rgba(255,255,255,0.3)',fontSize:12,fontWeight:'600'},
  tabTxtA:{color:'#60A5FA'},
});

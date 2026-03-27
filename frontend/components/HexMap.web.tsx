import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface HexPoly {
  id: string;
  coordinates: { latitude: number; longitude: number }[];
}

interface HexMapProps {
  latitude: number;
  longitude: number;
  hexPolygons: HexPoly[];
  hexCount: number;
  mapRef: React.RefObject<any>;
}

export default function HexMap({ latitude, longitude, hexPolygons, hexCount }: HexMapProps) {
  return (
    <View testID="web-fallback-screen" style={styles.container}>
      <Text style={styles.title}>HexTracker</Text>
      <Text style={styles.subtitle}>GPS → H3 Territory Tracker</Text>

      <Text style={styles.coords}>
        {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </Text>

      <View style={styles.statsCard}>
        <Text style={styles.statsLabel}>Hexes Captured</Text>
        <Text testID="hex-count-web" style={styles.statsValue}>{hexCount}</Text>
      </View>

      <Text style={styles.hint}>
        Open on a mobile device via Expo Go for the full map experience.
      </Text>

      {hexPolygons.length > 0 && (
        <ScrollView style={styles.hexList} contentContainerStyle={styles.hexListContent}>
          <Text style={styles.hexListTitle}>Captured H3 Indexes:</Text>
          {hexPolygons.slice(0, 20).map((hex) => (
            <Text key={hex.id} style={styles.hexItem}>{hex.id}</Text>
          ))}
          {hexPolygons.length > 20 && (
            <Text style={styles.hexItem}>...and {hexPolygons.length - 20} more</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 20,
  },
  coords: {
    color: '#94a3b8',
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 200,
    marginBottom: 24,
  },
  statsLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statsValue: {
    color: '#3B82F6',
    fontSize: 48,
    fontWeight: '800',
  },
  hint: {
    color: '#475569',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },
  hexList: {
    width: '100%',
    maxWidth: 360,
    maxHeight: 200,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  hexListContent: {
    padding: 16,
  },
  hexListTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  hexItem: {
    color: '#64748b',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});

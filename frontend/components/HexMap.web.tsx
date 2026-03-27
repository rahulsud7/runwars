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
      {/* Glass header */}
      <View style={styles.headerCard}>
        <Text style={styles.brandName}>RunWars</Text>
        <Text style={styles.brandTag}>Territory Tracker</Text>
      </View>

      <Text style={styles.coords}>
        {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </Text>

      <View style={styles.statsCard}>
        <Text testID="hex-count-web" style={styles.statsValue}>{hexCount}</Text>
        <Text style={styles.statsLabel}>hexes captured</Text>
      </View>

      <Text style={styles.hint}>
        Open in Expo Go for the full map experience.
      </Text>

      {hexPolygons.length > 0 && (
        <ScrollView style={styles.hexList} contentContainerStyle={styles.hexListContent}>
          <Text style={styles.hexListTitle}>Captured H3 Indexes</Text>
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
    backgroundColor: '#080C14',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  headerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  brandName: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandTag: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  coords: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 200,
    marginBottom: 24,
  },
  statsValue: {
    color: '#60A5FA',
    fontSize: 52,
    fontWeight: '800',
    lineHeight: 56,
  },
  statsLabel: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  hint: {
    color: 'rgba(255, 255, 255, 0.25)',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },
  hexList: {
    width: '100%',
    maxWidth: 360,
    maxHeight: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  hexListContent: {
    padding: 16,
  },
  hexListTitle: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  hexItem: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});

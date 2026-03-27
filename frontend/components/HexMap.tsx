import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';

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

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5a5a7a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a4a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a3a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1525' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e1e3a' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2a2a4a' }] },
];

export default function HexMap({ latitude, longitude, hexPolygons, hexCount, mapRef }: HexMapProps) {
  return (
    <View testID="map-screen" style={styles.container}>
      <MapView
        ref={mapRef}
        testID="map-view"
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.004,
          longitudeDelta: 0.004,
        }}
        customMapStyle={DARK_MAP_STYLE}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
        showsTraffic={false}
      >
        {/* Blue dot user marker */}
        <Marker
          testID="user-marker"
          coordinate={{ latitude, longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
          flat
          tracksViewChanges={false}
        >
          <View style={styles.dotOuter}>
            <View style={styles.dotPulse} />
            <View style={styles.dotCore} />
          </View>
        </Marker>

        {/* H3 territory polygons */}
        {hexPolygons.map((hex) => (
          <Polygon
            key={hex.id}
            coordinates={hex.coordinates}
            fillColor="rgba(96, 165, 250, 0.18)"
            strokeColor="rgba(96, 165, 250, 0.45)"
            strokeWidth={1}
          />
        ))}
      </MapView>

      {/* ── Glass header card ── */}
      <View testID="stats-overlay" style={styles.headerCard}>
        <View style={styles.headerLeft}>
          <Text style={styles.brandName}>RunWars</Text>
          <Text style={styles.brandTag}>Territory Tracker</Text>
        </View>
        <View style={styles.headerRight}>
          <Text testID="hex-count" style={styles.hexValue}>{hexCount}</Text>
          <Text style={styles.hexLabel}>hexes</Text>
        </View>
      </View>

      {/* ── Coords pill ── */}
      <View testID="coords-overlay" style={styles.coordsPill}>
        <View style={styles.coordsDot} />
        <Text style={styles.coordsText}>
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080C14',
  },
  map: {
    flex: 1,
  },

  // Blue dot marker
  dotOuter: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
  },
  dotCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#60A5FA',
    borderWidth: 2.5,
    borderColor: '#ffffff',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },

  // Glass header card
  headerCard: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 12, 20, 0.72)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLeft: {
    flexShrink: 1,
  },
  brandName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandTag: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  hexValue: {
    color: '#60A5FA',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
  },
  hexLabel: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 11,
    fontWeight: '500',
  },

  // Coords pill
  coordsPill: {
    position: 'absolute',
    bottom: 44,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 12, 20, 0.72)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  coordsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 8,
  },
  coordsText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    letterSpacing: 0.3,
  },
});

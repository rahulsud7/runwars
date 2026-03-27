import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';

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
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
      >
        <Marker
          testID="user-marker"
          coordinate={{ latitude, longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
          flat
        >
          <View style={styles.markerOuter}>
            <View style={styles.markerInner} />
          </View>
        </Marker>

        {hexPolygons.map((hex) => (
          <Polygon
            key={hex.id}
            coordinates={hex.coordinates}
            fillColor="rgba(59, 130, 246, 0.25)"
            strokeColor="rgba(59, 130, 246, 0.6)"
            strokeWidth={1.5}
          />
        ))}
      </MapView>

      <View testID="stats-overlay" style={styles.statsOverlay}>
        <Text style={styles.statsLabel}>HEXES</Text>
        <Text testID="hex-count" style={styles.statsValue}>{hexCount}</Text>
      </View>

      <View testID="coords-overlay" style={styles.coordsOverlay}>
        <Text style={styles.coordsText}>
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  map: {
    flex: 1,
  },
  markerOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3B82F6',
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  statsOverlay: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 72,
  },
  statsLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  statsValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  coordsOverlay: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  coordsText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
});

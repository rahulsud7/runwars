# RunWars - GPS Territory Tracker

## Overview
A React Native Expo app that converts real-time GPS movement into H3 hexagonal tiles, visually showing captured territory on a dark-themed map with Apple glass-style UI.

## Features
- **GPS Tracking**: High-accuracy foreground location via expo-location with watchPosition
- **H3 Hex Capture**: `import * as h3 from 'h3-js'` (namespace import to avoid utf-16le crash), resolution 9
- **Territory Rendering**: Hex polygons on native map via react-native-maps `<Polygon />`
- **Blue Dot Marker**: Custom marker with pulse effect for live position
- **Glass-Style UI**: Semi-transparent dark panels with subtle borders (Apple-inspired)
- **Dark Map Theme**: Custom Google Maps style for dark aesthetic
- **Ref-Based Dedup**: visitedRef + lastHexRef prevent unnecessary re-renders
- **Web Fallback**: Text-based view with H3 indexes when react-native-maps unavailable

## Architecture
- `app/index.tsx` — Business logic (location, H3 processing, state)
- `components/HexMap.tsx` — Native map (react-native-maps + polygons)
- `components/HexMap.web.tsx` — Web fallback (Metro platform resolution)
- `app/_layout.tsx` — Root layout with text-encoding-polyfill

## Dependencies
- expo-location@19.0.8, react-native-maps@1.20.1, h3-js@4.4.0, text-encoding-polyfill@0.6.7

## Key Fix
Changed `import { latLngToCell } from 'h3-js'` → `import * as h3 from 'h3-js'` to resolve Hermes utf-16le encoding crash.

# RunWars - GPS Territory Tracker

## Overview
Premium fitness + territory game (Strava × game hybrid). Converts real-time GPS movement into H3 hex tiles on a dark-themed map with Apple glass-style UI, stats tracking, and mock social clubs.

## Features
- **GPS Tracking**: High-accuracy foreground location (expo-location, watchPosition)
- **H3 Hex Capture**: Resolution 9, ref-based dedup, animated capture flash
- **Trail Path**: Polyline of last 50 GPS points
- **Live Stats**: Distance (haversine), elapsed time, speed (km/h)
- **Dashboard**: Stats cards, activity summary, Map/Dashboard tab toggle
- **Mock Clubs**: Downtown Runners + Hex Hunters with leaderboards
- **Dark Map**: Custom Google Maps style, blue dot marker with pulse
- **Glass UI**: Semi-transparent dark panels, subtle borders, consistent theme

## Architecture
- `app/index.tsx` — All business logic, state management, GPS processing
- `components/HexMap.tsx` — Native map + dashboard + animations + overlays
- `components/HexMap.web.tsx` — Web fallback with full dashboard
- `shims/textdecoder.ts` — Hermes TextDecoder utf-16le polyfill
- `scripts/patch-h3.sh` — Postinstall h3-js patch for Hermes

## h3-js Fix
Patched `new TextDecoder("utf-16le")` → try-catch in all h3-js dist files. UTF16Decoder is declared but never used, making patch safe. Postinstall script auto-applies on `yarn install`.

## Dependencies
expo-location, react-native-maps, h3-js (patched), text-encoding-polyfill, @expo/vector-icons (Ionicons)

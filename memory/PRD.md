# HexTracker - GPS Territory Tracker

## Overview
A React Native Expo app that converts real-time GPS location into H3 hexagonal tiles and visually displays captured territory on a map.

## Features
- **Location Tracking**: Foreground GPS tracking with high accuracy via expo-location
- **H3 Hex Conversion**: Real-time lat/lng → H3 index (resolution 9) via h3-js v4
- **Territory Rendering**: Hex polygons on native map using react-native-maps `<Polygon />`
- **Blue Dot Marker**: Custom marker for user's live position
- **Stats Overlay**: Live hex count + coordinates display
- **Web Fallback**: Text-based view with H3 indexes when map unavailable

## Architecture
- **Single screen**: `app/index.tsx` (all business logic)
- **Platform components**: `components/HexMap.tsx` (native map) + `components/HexMap.web.tsx` (web fallback)
- **No backend** / **No persistence** (yet)

## Dependencies
- expo-location@19.0.8
- react-native-maps@1.20.1
- h3-js@4.4.0

## Future Enhancements
- Persistent hex storage (AsyncStorage/MongoDB)
- Leaderboard & gamification (compete for territory coverage)
- Background location tracking
- Resolution selector (zoom-based hex granularity)

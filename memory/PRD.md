# RunWars - GPS Territory Tracker

## Overview
A React Native Expo app that converts real-time GPS movement into H3 hexagonal tiles, visually showing captured territory on a dark-themed map with Apple glass-style UI.

## Critical Fix Applied
**h3-js "Unknown encoding: utf-16le" crash** — Root cause: h3-js uses Emscripten-compiled WASM code that calls `new TextDecoder("utf-16le")` at module init (line 368 in h3-js.js). Hermes (React Native JS engine) only supports utf-8 in TextDecoder. Fix: Direct source patch wrapping the call in try-catch. `UTF16Decoder` is declared but never used in h3-js, making the patch safe. A postinstall script (`scripts/patch-h3.sh`) ensures the patch survives `yarn install`.

## Architecture
- `app/index.tsx` — Business logic + TextDecoder shim import
- `shims/textdecoder.ts` — Fallback TextDecoder polyfill for utf-16le
- `components/HexMap.tsx` — Native map with dark theme + glass overlays
- `components/HexMap.web.tsx` — Web fallback  
- `scripts/patch-h3.sh` — Postinstall h3-js patch for Hermes

## Dependencies
- expo-location@19.0.8, react-native-maps@1.20.1, h3-js@4.4.0, text-encoding-polyfill@0.6.7

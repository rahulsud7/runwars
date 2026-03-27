#!/bin/bash
# Patch h3-js to fix "Unknown encoding: utf-16le" on Hermes (React Native)
# UTF16Decoder is declared but never used in h3-js; wrapping in try-catch is safe.

H3_DIR="node_modules/h3-js/dist"

for file in "$H3_DIR/h3-js.js" "$H3_DIR/h3-js.es.js" "$H3_DIR/browser/h3-js.js" "$H3_DIR/browser/h3-js.es.js"; do
  if [ -f "$file" ]; then
    sed -i 's/var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;/var UTF16Decoder; try { UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined; } catch(e) { UTF16Decoder = undefined; }/' "$file"
  fi
done

# UMD version (minified)
UMD="$H3_DIR/h3-js.umd.js"
if [ -f "$UMD" ]; then
  sed -i 's/"undefined"!=typeof TextDecoder\&\&new TextDecoder("utf-16le")/function(){try{return"undefined"!=typeof TextDecoder\&\&new TextDecoder("utf-16le")}catch(e){return undefined}}()/' "$UMD"
fi

echo "h3-js patched for Hermes compatibility"

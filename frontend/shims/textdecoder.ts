/**
 * TextDecoder shim for Hermes engine (React Native).
 * Hermes provides TextDecoder but only supports 'utf-8'.
 * h3-js requires 'utf-16le' at module init time (Emscripten compiled code).
 * This shim wraps the native TextDecoder to add utf-16le support.
 * MUST be imported before h3-js.
 */

const OriginalTextDecoder =
  typeof globalThis !== 'undefined' && globalThis.TextDecoder
    ? globalThis.TextDecoder
    : typeof global !== 'undefined' && (global as any).TextDecoder
      ? (global as any).TextDecoder
      : undefined;

// Quick check: does the native TextDecoder already handle utf-16le?
let needsShim = false;
if (OriginalTextDecoder) {
  try {
    new OriginalTextDecoder('utf-16le');
  } catch {
    needsShim = true;
  }
}

if (needsShim && OriginalTextDecoder) {
  class TextDecoderShim {
    private _isUtf16le: boolean;
    private _native: any;
    readonly encoding: string;

    constructor(label: string = 'utf-8', options?: { fatal?: boolean }) {
      const norm = (label || 'utf-8').toLowerCase().trim().replace(/[^a-z0-9]/g, '');

      if (norm === 'utf16le' || norm === 'utf16' || norm === 'ucs2') {
        this._isUtf16le = true;
        this._native = null;
        this.encoding = 'utf-16le';
      } else {
        this._isUtf16le = false;
        this._native = new OriginalTextDecoder(label, options);
        this.encoding = this._native.encoding;
      }
    }

    decode(input?: BufferSource, options?: { stream?: boolean }): string {
      if (this._isUtf16le) {
        if (!input) return '';
        const bytes = new Uint8Array(
          (input as ArrayBuffer).byteLength !== undefined
            ? (input as any).buffer || input
            : input as ArrayBuffer,
          (input as any).byteOffset || 0,
          (input as any).byteLength || (input as any).length || 0
        );
        let result = '';
        for (let i = 0; i < bytes.length - 1; i += 2) {
          result += String.fromCharCode(bytes[i] | (bytes[i + 1] << 8));
        }
        return result;
      }
      return this._native.decode(input, options);
    }
  }

  // Override globally
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).TextDecoder = TextDecoderShim;
  }
  if (typeof global !== 'undefined') {
    (global as any).TextDecoder = TextDecoderShim;
  }
}

export {};

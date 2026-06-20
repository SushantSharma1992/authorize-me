// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// jsdom (jest's test env) has no Web Crypto or TextEncoder. Polyfill from Node.
import { webcrypto } from 'crypto';
import { TextEncoder, TextDecoder } from 'util';

// defineProperty (not plain assignment) in case the env exposes a read-only `crypto`.
if (!global.crypto || !global.crypto.subtle) {
  Object.defineProperty(global, 'crypto', {
    value: webcrypto,
    configurable: true,
    writable: true,
  });
}
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

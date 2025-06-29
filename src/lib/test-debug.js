// Test to verify debug mode behavior
import { isDebugMode } from '../debug.js';

// Mock import.meta.env for testing
const originalEnv = globalThis.import?.meta?.env;

function mockEnv(env: { DEV: boolean; PROD: boolean }) {
  if (globalThis.import?.meta) {
    globalThis.import.meta.env = env;
  }
}

function restoreEnv() {
  if (globalThis.import?.meta && originalEnv) {
    globalThis.import.meta.env = originalEnv;
  }
}

// Test cases
const testUser = { name: 'Floofy', email: 'floofy@example.com' };
const regularUser = { name: 'John', email: 'john@example.com' };

console.log('Testing debug mode...');

// Test 1: Development mode with developer account
mockEnv({ DEV: true, PROD: false });
console.log('DEV + Developer:', isDebugMode(testUser)); // Should be true

// Test 2: Development mode with regular user
console.log('DEV + Regular user:', isDebugMode(regularUser)); // Should be false

// Test 3: Production mode with developer account (should never show)
mockEnv({ DEV: false, PROD: true });
console.log('PROD + Developer:', isDebugMode(testUser)); // Should be false

// Test 4: Production mode with regular user
console.log('PROD + Regular user:', isDebugMode(regularUser)); // Should be false

// Test 5: No user
console.log('No user:', isDebugMode(undefined)); // Should be false

restoreEnv();
console.log('Debug mode tests completed.');

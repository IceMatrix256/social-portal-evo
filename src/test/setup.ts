import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Gun.js
vi.mock('gun', () => ({
  default: vi.fn(() => ({
    get: vi.fn().mockReturnThis(),
    put: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis()
  }))
}));

// Mock IPFS
vi.mock('ipfs-core', () => ({
  create: vi.fn(() => Promise.resolve({
    add: vi.fn(),
    cat: vi.fn(),
    pin: { add: vi.fn() },
    stop: vi.fn()
  }))
}));

// Mock Nostr NDK
vi.mock('@nostr-dev-kit/ndk', () => ({
  default: vi.fn()
}));

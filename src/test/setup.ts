// Test setup file for TAMV MD-X4
import '@testing-library/jest-dom';

// Mock WebXR
class MockXRSession {
  addEventListener() {}
  removeEventListener() {}
  end() {
    return Promise.resolve();
  }
  requestReferenceSpace() {
    return Promise.resolve({
      getPose() {
        return null;
      },
    });
  }
}

class MockXRSystem {
  isSessionSupported() {
    return Promise.resolve(true);
  }
  requestSession() {
    return Promise.resolve(new MockXRSession());
  }
}

// Setup global mocks
beforeAll(() => {
  // Mock navigator.xr
  Object.defineProperty(global.navigator, 'xr', {
    value: new MockXRSystem(),
    writable: true,
  });

  // Mock crypto.randomUUID
  if (!global.crypto) {
    global.crypto = {
      randomUUID: () => Math.random().toString(36).substring(2, 15),
    } as Crypto;
  } else if (!global.crypto.randomUUID) {
    global.crypto.randomUUID = () => Math.random().toString(36).substring(2, 15);
  }
});

// Cleanup between tests
afterEach(() => {
  vi.clearAllMocks();
});

// Global test utilities
export const mockUser = {
  id: 'user-123',
  email: 'test@tamv.io',
  username: 'testuser',
  displayName: 'Test User',
};

export const mockWorld = {
  id: 'world-456',
  title: 'Test World',
  description: 'A test world',
  worldType: 'gallery' as const,
  isPublic: true,
  ownerId: 'user-123',
};

export const mockAsset = {
  id: 'asset-789',
  name: 'Test Asset',
  assetType: 'model' as const,
  ownerId: 'user-123',
  worldId: 'world-456',
};

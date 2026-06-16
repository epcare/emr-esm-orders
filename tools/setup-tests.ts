import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Extend global interface with jest-like properties
declare global {
  const jest: {
    mock: (modulePath: string) => void;
    mocked: <T>(fn: T) => T;
    spyOn: typeof vi.spyOn;
    fn: typeof vi.fn;
    clearAllMocks: () => void;
    resetAllMocks: () => void;
    restoreAllMocks: () => void;
  };
  const global: typeof globalThis & {
    jest: typeof jest;
    ResizeObserver: typeof ResizeObserver;
  };
  interface Window {
    openmrsBase: string;
    spaBase: string;
    getOpenmrsSpaBase: () => string;
  }
}

// Mock swr module globally before tests run
vi.mock('swr', () => {
  const createSWRMock = () => {
    // Default implementation
    let currentImplementation = () => ({ data: undefined, error: undefined, isLoading: false, isValidating: false });

    const mockFn = vi.fn((...args: Array<unknown>) => {
      if (typeof currentImplementation === 'function') {
        return (currentImplementation as any)(...args);
      }
      return currentImplementation;
    });

    mockFn.mockImplementation = function(implementation: any) {
      currentImplementation = implementation;
      return mockFn;
    };

    mockFn.mockReturnValue = function(value: any) {
      const swrResponse = {
        data: value?.data ?? value,
        error: value?.error ?? undefined,
        isLoading: value?.isLoading ?? false,
        isValidating: value?.isValidating ?? false,
        mutate: value?.mutate ?? vi.fn(),
      };
      currentImplementation = () => swrResponse;
      return mockFn;
    };

    mockFn.mockResolvedValue = function(value: any) {
      const swrResponse = {
        data: value?.data ?? value,
        error: value?.error ?? undefined,
        isLoading: false,
        isValidating: false,
        mutate: vi.fn(),
      };
      currentImplementation = () => swrResponse;
      return mockFn;
    };

    return mockFn;
  };

  const useSWR = createSWRMock();
  (useSWR as any).default = useSWR;

  return {
    default: useSWR,
  };
});

// Intercept jest.mock calls
const originalJest = {
  mock: (modulePath: string) => {
    // Already handled by vi.mock above
  },
  mocked: <T>(fn: T): T => {
    // Vitest vi.fn() already has all the necessary properties
    // Just return the function as-is with type assertion
    return fn as any;
  },
  spyOn: vi.spyOn,
  fn: vi.fn,
  clearAllMocks: () => {
    vi.clearAllMocks();
  },
  resetAllMocks: () => {
    vi.resetAllMocks();
  },
  restoreAllMocks: () => {
    vi.restoreAllMocks();
  },
};

// Add Jest-like methods to vitest fn
// These need to be added to the prototype so all vi.fn() instances have them
Object.assign(vi.fn.prototype, {
  mockImplementation(this: any, implementation: any) {
    // Store the implementation
    this._mockImplementation = implementation;
    // Use vitest's mockImplementation which properly handles the function
    // But we need to wrap it to handle the SWR case
    const originalImplementation = implementation;
    this.__implementation = implementation;
    return this;
  },
  mockReturnValue(this: any, value: any) {
    this.mockReturnValueValue = value;
    this.__implementation = () => value;
    return this;
  },
  mockReturnValueOnce(this: any, value: any) {
    if (!this._mockReturnValueOnceValues) {
      this._mockReturnValueOnceValues = [];
    }
    this._mockReturnValueOnceValues.push(value);

    // If this is the first mockReturnValueOnce, set up the implementation
    if (this._mockReturnValueOnceValues.length === 1) {
      const originalImpl = this._mockImplementation || ((() => undefined) as any);
      let callCount = 0;
      this.__implementation = function(this: any, ...args: any[]) {
        callCount++;
        const onceValues = (this as any)._mockReturnValueOnceValues || [];
        if (callCount <= onceValues.length) {
          return onceValues[callCount - 1];
        }
        return typeof originalImpl === 'function' ? originalImpl.apply(this, args) : originalImpl;
      };
    }
    return this;
  },
  mockResolvedValue(this: any, value: any) {
    this.mockResolvedValueValue = value;
    this.__implementation = () => Promise.resolve(value);
    return this;
  },
  mockRejectedValue(this: any, value: any) {
    this.mockRejectedValueValue = value;
    this.__implementation = () => Promise.reject(value);
    return this;
  },
});

global.jest = originalJest;

window.openmrsBase = '/openmrs';
window.spaBase = '/spa';
window.getOpenmrsSpaBase = () => '/openmrs/spa/';
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock ResizeObserver for Carbon components
(globalThis as any).ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// Suppress single-spa warnings
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('single-spa')) {
    return;
  }
  originalWarn(...args);
};

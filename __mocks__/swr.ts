import { vi } from 'vitest';

// Create a mock function that behaves like Jest mocks with mockImplementation
function createMockFunction(implementation?: any) {
  const fn = vi.fn(implementation);

  // Store the mock implementations
  let mockImpl = implementation;
  let mockReturnValueValue: any;
  let mockReturnValueOnceValues: any[] = [];
  let mockResolvedValueValue: any;
  let mockRejectedValueValue: any;

  // The actual implementation
  const impl = (...args: any[]) => {
    // Check for mockReturnValueOnce first
    if (mockReturnValueOnceValues.length > 0) {
      return mockReturnValueOnceValues.shift();
    }
    // Then check for mockReturnValue
    if (mockReturnValueValue !== undefined) {
      return mockReturnValueValue;
    }
    // Then check for mockResolvedValue
    if (mockResolvedValueValue !== undefined) {
      return Promise.resolve(mockResolvedValueValue);
    }
    // Then check for mockRejectedValue
    if (mockRejectedValueValue !== undefined) {
      return Promise.reject(mockRejectedValueValue);
    }
    // Finally, use mockImpl
    if (typeof mockImpl === 'function') {
      return mockImpl(...args);
    }
    return mockImpl;
  };

  fn.mockImplementation = (impl: any) => {
    mockImpl = impl;
    return fn;
  };

  fn.mockReturnValue = (value: any) => {
    mockReturnValueValue = value;
    mockResolvedValueValue = undefined;
    mockRejectedValueValue = undefined;
    return fn;
  };

  fn.mockReturnValueOnce = (value: any) => {
    mockReturnValueOnceValues.push(value);
    return fn;
  };

  fn.mockResolvedValue = (value: any) => {
    mockResolvedValueValue = value;
    mockReturnValueValue = undefined;
    mockRejectedValueValue = undefined;
    return fn;
  };

  fn.mockRejectedValue = (value: any) => {
    mockRejectedValueValue = value;
    mockReturnValueValue = undefined;
    mockResolvedValueValue = undefined;
    return fn;
  };

  fn.mockClear = () => {
    mockImpl = undefined;
    mockReturnValueValue = undefined;
    mockReturnValueOnceValues = [];
    mockResolvedValueValue = undefined;
    mockRejectedValueValue = undefined;
    fn.mockClear = () => fn;
    return fn;
  };

  fn.mockReset = () => {
    mockImpl = undefined;
    mockReturnValueValue = undefined;
    mockReturnValueOnceValues = [];
    mockResolvedValueValue = undefined;
    mockRejectedValueValue = undefined;
    return fn;
  };

  // Make the function return the implementation result
  fn.mockImplementation((...args: any[]) => impl(...args));

  return fn;
}

// Mock useSWR hook - default returns undefined (to be mocked by tests)
const useSWR = createMockFunction(() => undefined);
useSWR.default = useSWR;

export default useSWR;

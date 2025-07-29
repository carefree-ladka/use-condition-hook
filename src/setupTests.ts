// src/setupTests.ts
import '@testing-library/jest-dom';

// Mock console methods to avoid noise in tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeEach(() => {
  // Reset console mocks before each test
  console.warn = jest.fn();
  console.error = jest.fn();
  console.log = jest.fn();
});

afterEach(() => {
  // Clean up mocks after each test
  jest.clearAllMocks();
});

afterAll(() => {
  // Restore original console methods
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

// Global test utilities
export const mockConsole = {
  warn: () => console.warn as jest.MockedFunction<typeof console.warn>,
  error: () => console.error as jest.MockedFunction<typeof console.error>,
  log: () => console.log as jest.MockedFunction<typeof console.log>,
};

import '@testing-library/jest-dom';
import { vi } from 'vitest';

declare global {
  interface Window {
    openmrsBase: string;
    spaBase: string;
    getOpenmrsSpaBase: () => string;
  }
}

const jest = {
  mock: (modulePath: string, factory?: () => unknown) => {
    vi.mock(modulePath, factory);
  },
  fn: vi.fn,
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultNameSpace: string) => defaultNameSpace,
  }),
}));

window.openmrsBase = '/openmrs';
window.spaBase = '/spa';
window.getOpenmrsSpaBase = () => '/openmrs/spa/';
window.HTMLElement.prototype.scrollIntoView = jest.fn();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

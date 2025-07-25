import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock window.URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "mock-url");
global.URL.revokeObjectURL = vi.fn();

// Mock HTMLCanvasElement.getContext for Three.js/WebGL
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  canvas: {
    width: 800,
    height: 600,
  },
  createShader: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  createProgram: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  useProgram: vi.fn(),
  getExtension: vi.fn(),
  getParameter: vi.fn(() => 1024),
  disable: vi.fn(),
  enable: vi.fn(),
  clearColor: vi.fn(),
  clear: vi.fn(),
})) as unknown as CanvasRenderingContext2D;

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
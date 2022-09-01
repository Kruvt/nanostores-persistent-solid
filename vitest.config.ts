import { defineConfig } from 'vitest/config';
import solid from 'vite-plugin-solid';

export default defineConfig({
  test: {
    environment: 'jsdom',
    transformMode: {
      web: [/.[jt]sx?/]
    },
    deps: {
      inline: [/solid-js/]
    },
    threads: false,
    isolate: false,
    setupFiles: ['./vitest.setup.ts']
  },
  plugins: [solid()],
  resolve: {
    conditions: ['development', 'browser']
  }
});

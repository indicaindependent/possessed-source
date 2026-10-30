import path from 'node:path';

// *.test.js files are harness-agnostic suites; *.spec.js files are the vitest runners for them.
// (Plain object: vitest runs via npx and isn't a project dependency.)
export default {
  resolve: {
    alias: {
      'base44:runtime/actors': path.resolve(import.meta.dirname, 'tests/mocks/actorRuntime.js'),
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  test: { include: ['tests/**/*.spec.js'], environment: 'node' },
};
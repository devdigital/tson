import { defineConfig } from 'vitest/config'
// import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    // viteTsconfigPaths(),
  ],
  test: {
    // include: [
    //   '__tests__/**/*.ts',
    //   '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    // ],
    // environment: 'jsdom',
    globals: true,
    // setupFiles: './test-setup.js',
  },
})

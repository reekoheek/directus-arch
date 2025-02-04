import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import basicSsl from '@vitejs/plugin-basic-ssl';
// import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    basicSsl(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   // devOptions: {
    //   //   enabled: true,
    //   // },
    //   workbox: {
    //     globPatterns: [
    //       '**/*.{js,css,html,ico,png,svg,webmanifest}',
    //     ],
    //   },
    // }),
  ],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 9443,
    https: true,
  },
});

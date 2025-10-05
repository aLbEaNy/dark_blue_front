import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  server: {
    host: true, // escucha en toda la red (0.0.0.0)
    port: 4200,
    strictPort: true,
    allowedHosts: 'all'// aquí tu nombre personalizado
  }
});

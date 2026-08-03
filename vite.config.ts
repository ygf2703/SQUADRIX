import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const landingFiles: Record<string, { file: string; type: string }> = {
  '/': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/privacy.html': { file: 'privacy.html', type: 'text/html; charset=utf-8' },
  '/landing/index.html': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/landing/styles.css': { file: 'styles.css', type: 'text/css; charset=utf-8' },
  '/landing/overrides.css': { file: 'overrides.css', type: 'text/css; charset=utf-8' },
  '/landing/config.js': { file: 'config.js', type: 'text/javascript; charset=utf-8' },
};

function landingDevServer(): Plugin {
  return {
    name: 'squadrix-landing-dev-server',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
        const asset = landingFiles[pathname];
        if (!asset) return next();
        response.statusCode = 200;
        response.setHeader('Content-Type', asset.type);
        response.end(readFileSync(resolve(__dirname, 'landing', asset.file)));
      });
    },
  };
}

export default defineConfig({ plugins: [react(), landingDevServer()] });

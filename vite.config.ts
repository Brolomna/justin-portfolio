import { defineConfig } from 'vite';

// Static single-page build: index.html is the whole site,
// public/ is copied verbatim (toolkit module + preview page).
export default defineConfig({
  base: './',
});

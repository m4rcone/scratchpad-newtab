import { defineConfig, type Plugin } from 'vite';

/**
 * KaTeX declares each face three times — woff2, woff and ttf — so a browser
 * from 2015 can read it. Vite copies every file a `url()` names, which is two
 * unread copies of some sixty fonts. The manifest already refuses to install
 * below Chrome 120, and woff2 has been supported since Chrome 36, so the older
 * two are dropped here rather than shipped and never requested.
 */
function katexWoff2Only(): Plugin {
  return {
    name: 'katex-woff2-only',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('katex') || !id.endsWith('.css')) return null;
      return code.replace(/src:[^;}]+/g, (declaration) => {
        const woff2 = declaration.match(
          /url\(([^)]+\.woff2)\)\s*format\(['"]woff2['"]\)/,
        );
        return woff2 ? `src:url(${woff2[1]}) format('woff2')` : declaration;
      });
    },
  };
}

// MV3 extension build: every extension page is its own HTML entry point.
// The manifest and the icons come from `public/` and are copied verbatim.
export default defineConfig({
  root: 'src',
  publicDir: '../public',
  plugins: [katexWoff2Only()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'chrome120',
    modulePreload: { polyfill: false },
    // The extension is local: sourcemaps cost no open time and help debugging.
    sourcemap: true,
    // Mermaid splits its renderers itself, and every one of them is past
    // Rollup's default line — a warning about chunks that are loaded on demand
    // and never over the network is noise, so the threshold is raised.
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      input: {
        newtab: 'src/newtab/index.html',
      },
    },
  },
});

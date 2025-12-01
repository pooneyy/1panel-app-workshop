import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import Unocss from 'unocss/vite';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import VueI18n from '@intlify/unplugin-vue-i18n/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import packageJson from './package.json'; // https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      fullInstall: true,
      include: [resolve(__dirname, 'locales/**')],
      strictMessage: false,
      escapeHtml: false,
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        'vue-i18n',
        {
          'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
        },
      ],
      vueTemplate: true,
      dts: true,
    }),
    Icons({ compiler: 'vue3' }),
    vue(),
    svgLoader(),
    Components({
      dirs: ['src/'],
      extensions: ['vue'],
      include: [/\.vue$/, /\.vue\?vue/],
      resolvers: [NaiveUiResolver(), IconsResolver({ prefix: 'icon' })],
      dts: true,
    }),
    Unocss(),
    nodePolyfills({
      include: ['buffer', 'process', 'util'],
      globals: { Buffer: true, global: true, process: true },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    __VUEUSE_OPTIONS_API__: 'false',
    'import.meta.env.PACKAGE_NAME': JSON.stringify(packageJson.name),
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
  },
  build: {
    target: 'esnext',
    minify: true,
    reportCompressedSize: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'es',
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('/naive-ui/')) {
              return 'naive-ui';
            }
            if ( id.includes('/vue/') || id.includes('/vue-router/') || id.includes('/vue-i18n/')
              || id.includes('/pinia/') || id.includes('/@vueuse/') || id.includes('/@guolao/vue-monaco-editor/')
              || id.includes('/dompurify/') || id.includes('/file-saver/') || id.includes("/js-base64/")
              || id.includes('/jszip/') || id.includes("/lodash/") || id.includes('/marked/')){
              return 'vendor';
            }
            if (id.includes('/monaco-editor/')) {
              return 'monaco-editor';
            }
            if (id.includes('/highlight.js/')) {
              if (id.includes('/highlight.js/lib/')) {
                if ( id.includes('/languages/m') || id.includes('/languages/i')
                  || id.includes('/languages/a') || id.includes('/languages/b')
                  || id.includes('/languages/c') || id.includes('/languages/d')
                  || id.includes('/languages/e') || id.includes('/languages/f')
                  || id.includes('/languages/g')) {
                  return 'highlight.js-1';
                }
                return 'highlight.js-2';
              }
            }
          }
          return undefined;
        },
      },
    },
  },
});

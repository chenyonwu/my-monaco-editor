import { defineConfig } from 'vite';
import Path from 'path';
import vue from '@vitejs/plugin-vue';
import WindiCSS from 'vite-plugin-windicss';
import Legacy from '@vitejs/plugin-legacy';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

const ComponentResolver = name => {
  return { importName: name, path: `@/components/index.js`};
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    WindiCSS(),
    Legacy({
      targets: ['> 1%, last 1 version, ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: true,
    }),
    AutoImport({
      imports: ['vue'],
      dts: 'src/auto-import.d.ts',
    }),
    Components({
      dts: false,
      resolvers: [ ComponentResolver ],
    }),
    monacoEditorPlugin.default({
      languageWorkers: ['editorWorkerService', 'json'],
      customWorkers: [
        {
          label: 'typescript',
          entry: 'monaco-editor/esm/vs/language/typescript/ts.worker',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': `${Path.resolve(__dirname, 'src')}`,
    },
  },
  server: {
    host: true,
    port: 12581,
  },
});

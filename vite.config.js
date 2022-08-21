import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import WindiCSS from 'vite-plugin-windicss';
import Legacy from '@vitejs/plugin-legacy';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';

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
  ],
})

import {
  defineConfig,
  presetAttributify,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss';

export default defineConfig({
  presets: [presetUno(), presetAttributify({
    ignoreAttributes: ['size'],
  }), presetTypography()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      primary: '#005eeb',
    },
  },
  shortcuts: {
    'pretty-scrollbar': 'w-full of-auto',
    'divider': 'h-1px bg-current op-10',
    'bg-surface': 'bg-#ffffff dark:bg-#232323',
    'bg-background': 'bg-#f1f5f9 dark:bg-#1c1c1c',
  },
  preflights: [
    {
      getCSS: () => `
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: var(--scrollbar-track, #f1f1f1);
        }
        
        ::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb, #bdbdbd);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb, #999);
        }
        
        .dark ::-webkit-scrollbar-track {
          background: #2a2a2a;
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background: #555;
        }
        
        .dark ::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
      `,
    },
  ],
});

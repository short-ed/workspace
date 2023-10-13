import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    ['btn', 'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
    ['icon-btn', 'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-600'],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],

  theme: {
    colors: {
      primary: '#008A60',
    },
  },
  rules: [
    ['pattern-dots', {
      '--pt-dots-opacity': '5%',
      'background-image': 'radial-gradient(hsla(0, 0%, 100%, var(--pt-dots-opacity)) 1px, transparent 1px)',
      'background-size': '16px 16px',
    }, {
      autocomplete: 'pattern-dots',
    }],
    ['pattern-grid', {
      '--pt-grid-opacity': '3%',
      'background-image': ''
        + 'linear-gradient(hsla(0, 0%, 100%, var(--pt-grid-opacity)) 2px, transparent 2px), '
        + 'linear-gradient(90deg, hsla(0, 0%, 100%, var(--pt-grid-opacity)) 2px, transparent 2px), '
        + 'linear-gradient(hsla(0, 0%, 100%, calc(var(--pt-grid-opacity) - 1%)) 1px, transparent 1px), '
        + 'linear-gradient(90deg, hsla(0, 0%, 100%, calc(var(--pt-grid-opacity) - 1%)) 1px, transparent 1px)',
      'background-size': '100px 100px, 100px 100px, 20px 20px, 20px 20px',
      'background-position': '-1px -1px, -1px -1px, 0 0, 0 0',
    }, {
      autocomplete: 'pattern-grid',
    }],
  ],
})

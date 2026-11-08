import { defineConfig, presetWind4, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [presetWind4()],
  content: {
    pipeline: {
      exclude: ['node_modules']
    }
  },
  safelist: [],
  transformers: [
    transformerDirectives() // 启用指令转换器
  ],
  theme: {}
})

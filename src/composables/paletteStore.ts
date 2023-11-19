import { Color } from '../types';
import { defineStore } from 'pinia';

export interface ColorPalette {
  current: number
  colors: Color[]
}

export const usePaletteStore = defineStore('palette', {
  state: (): ColorPalette => ({
    current: 0,
    colors: [
      { index: 0, r: 0, g: 0, b: 0, a: 1 },
      { index: 1, r: 1, g: 0, b: 0, a: 1 },
      { index: 2, r: 0, g: 1, b: 0, a: 1 },
      { index: 3, r: 0, g: 0, b: 1, a: 1 },
    ],
  }),
  getters: {
    colorByIndex: (state) => ((index: number) => state.colors.find(color => color.index == index)),
    currentColor: (state) => state.colors.find(color => color.index == state.current),
  },
  actions: {
    selectColorByIndex(index: number) {
      if (!this.colors.some(color => color.index == index)) {
        return;
      }
      this.current = index;
    },
  },
})

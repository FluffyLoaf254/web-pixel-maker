<script setup lang="ts">
import { Color } from '../types';
import { usePaletteStore } from '../composables/paletteStore';

const store = usePaletteStore();

const colorStyle = (color?: Color) => {
  if (!color) {
    return 'background-position: 0 0, 0 0.5rem; background-size: 1rem 0.5rem, 1rem 0.5rem; background-repeat: no-repeat; background-image: linear-gradient(to right, #f0f0f0 0, #f0f0f0 50%, #c0c0c0 50%, #c0c0c0 100%), linear-gradient(to left, #f0f0f0 0, #f0f0f0 50%, #c0c0c0 50%, #c0c0c0 100%);';
  }
  let style = 'background-color: rgba(';
  style += [color.r, color.g, color.b].map(value => value * 255).join(', ');
  style += ', ' + color.a;
  style += ');';

  return style;
}
</script>

<template>
  <div class="absolute left-4 top-4 bg-slate-100 dark:bg-slate-700 p-4 rounded-lg z-10 shadow-lg">
    <div class="grid grid-cols-8 gap-1">
      <button v-for="index in 256" class="w-4 h-4 box-content border border-slate-300 hover:border-black focus:outline-none focus:ring ring-blue-500" :class="{ ring: store.current == (index - 1) }" :style="colorStyle(store.colorByIndex(index - 1))" @click="store.selectColorByIndex(index - 1)"></button>
    </div>
  </div>
</template>

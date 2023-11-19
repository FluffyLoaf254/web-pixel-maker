<script setup lang="ts">
import { ref } from 'vue';
import HeaderBar from './HeaderBar.vue';
import CanvasPanel from './CanvasPanel.vue';
import ColorPalette from './ColorPalette.vue';
import FooterBar from './FooterBar.vue';
import GuidedTutorial from './GuidedTutorial.vue';

const tutorial = ref<typeof GuidedTutorial|null>(null);

const showTutorial = () => {
  tutorial.value?.begin();
};
</script>

<template>
  <div class="grid grid-cols-1 h-full w-full">
    <header-bar @tutorial="showTutorial">WebPixelMaker</header-bar>
    <div class="relative flex min-h-0">
      <color-palette />
      <canvas-panel />
    </div>
    <footer-bar />
    <guided-tutorial ref="tutorial" />
  </div>
</template>

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
  <div class="flex flex-col h-full w-full divide-y divide-white dark:divide-black">
    <header-bar @tutorial="showTutorial">WebPixelMaker</header-bar>
    <div class="relative grow flex w-full h-full">
      <color-palette />
      <canvas-panel />
    </div>
    <footer-bar />
    <guided-tutorial ref="tutorial" />
  </div>
</template>

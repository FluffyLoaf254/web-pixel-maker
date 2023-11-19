<script setup lang="ts">
import { onMounted, ref, computed, watch, nextTick, onUnmounted } from 'vue';
import { Position } from '../types';
import { useDocumentStore } from '../composables/documentStore';
import PixelCanvas from './PixelCanvas.vue';
import { storeToRefs } from 'pinia';

const documentStore = useDocumentStore();

const { zoom: scale } = storeToRefs(documentStore);

const scaleMultiplier = computed(() => Math.pow(2, scale.value));

const zoom = (event: WheelEvent) => {
  event.deltaY > 0 ? documentStore.increaseZoom() : documentStore.decreaseZoom();
};

const convertPixelsToRem = (pixels: number): number => {
  return pixels / parseFloat(getComputedStyle(document.documentElement).fontSize);
};

const panel = ref<HTMLDivElement | null>(null);

const position = computed<Position>(() => ({
  x: convertPixelsToRem((panelOffsetWidth.value + width.value * scaleMultiplier.value) / 2),
  y: convertPixelsToRem((panelOffsetHeight.value + height.value * scaleMultiplier.value) / 2),
}));

const width = ref(128);
const height = ref(128);

const panelOffsetWidth = ref(0);
const panelOffsetHeight = ref(0);

const setPanelOffsetDimensions = () => {
  if (!panel.value) {
    return;
  }
  panelOffsetWidth.value = panel.value.offsetWidth;
  panelOffsetHeight.value = panel.value.offsetHeight;
}

const setPanelScroll = () => {
  if (!panel.value) {
    return;
  }
  panel.value.scrollLeft = (scrollTarget.value.x + 1) * (panel.value.scrollWidth - panel.value.clientWidth) / 2;
  panel.value.scrollTop = (scrollTarget.value.y + 1) * (panel.value.scrollHeight - panel.value.clientHeight) / 2;
}

watch(scale, () => nextTick(() => setPanelScroll()));

const panelWidth = computed(() => convertPixelsToRem(panelOffsetWidth.value + width.value * scaleMultiplier.value));
const panelHeight = computed(() => convertPixelsToRem(panelOffsetHeight.value + height.value * scaleMultiplier.value));

const scrollTarget = ref<Position>({
  x: 0,
  y: 0,
});

const scrollLeft = ref(0);
const scrollTop = ref(0);

watch(scrollLeft, (value) => {
  if (panel.value) {
    panel.value.scrollLeft = value;
  }
});

watch(scrollTop, (value) => {
  if (panel.value) {
    panel.value.scrollTop = value;
  }
});

const reset = () => {
  setPanelOffsetDimensions();
  nextTick(() => {
    if (!panel.value) {
      return;
    }
    panel.value.scrollLeft = (panel.value.scrollWidth - panel.value.clientWidth) / 2;
    panel.value.scrollTop = (panel.value.scrollHeight - panel.value.clientHeight) / 2;
  });
};

const scroll = () => {
  if (!panel.value) {
    return;
  }
  const x = (panel.value.scrollLeft / (panel.value.scrollWidth - panel.value.clientWidth) * 2) - 1;
  const y = (panel.value.scrollTop / (panel.value.scrollHeight - panel.value.clientHeight) * 2) - 1;
  scrollTarget.value = { x, y };
};

onMounted(() => {
  reset();
  window.addEventListener('resize', reset);
});

onUnmounted(() => window.removeEventListener('resize', reset));

const canvas = ref<typeof PixelCanvas | null>(null);
</script>

<template>
  <div class="relative overflow-scroll w-full h-full bg-gradient-to-tr from-sky-500 to-teal-500" ref="panel" @scroll.passive="scroll" @mouseleave.stop="canvas?.endDraw" @mouseup.stop="canvas?.endDraw">
    <div class="relative" :style="{ width: panelWidth + 'rem', height: panelHeight + 'rem' }" @wheel.prevent="zoom" style="background-size: 3rem 3rem; background-image: conic-gradient(at 1rem 1rem, transparent 75%, rgba(255, 255, 255, 0.5) 75%);">
      <pixel-canvas ref="canvas" :style="{ left: position.x + 'rem', top: position.y + 'rem' }" :scale="scaleMultiplier" :width="width" :height="height" />
    </div>
  </div>
</template>

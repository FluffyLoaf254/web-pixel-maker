<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { WebPixelDocument } from '../libraries/WebPixelDocument';
import { usePaletteStore } from '../composables/paletteStore';

interface Props {
  width: number
  height: number
  scale: number
}

const props = defineProps<Props>();

const canvas = ref<HTMLCanvasElement | null>(null);

interface Size {
  width: number
  height: number
}

const canvasSize = ref<Size>({
  width: props.width,
  height: props.height,
});

const paletteStore = usePaletteStore();

watch(() => paletteStore.currentColor, (value) => {
  console.log(value);
  if (!value) {
    return;
  }

  doc?.setColor(value)
});

let doc: WebPixelDocument | null = null;

const handleMouseMove = (event: MouseEvent) => {
  doc?.setPosition(event.offsetX / (canvasSize.value.width * props.scale), event.offsetY / (canvasSize.value.height * props.scale));
};

const handleMouseEnter = (event: MouseEvent) => {
  doc?.clearPositions();
  handleMouseMove(event);
}

const render = () => {
  doc?.render();
  requestAnimationFrame(() => render());
}

onMounted(async () => {
  if (canvas.value) {
    doc = new WebPixelDocument(canvas.value, {
      width: canvasSize.value.width,
      height: canvasSize.value.height
    });
    await doc.setup();
    render();
  }
});

const startDraw = (event: MouseEvent) => {
  doc?.startDraw();
  handleMouseMove(event);
}

const endDraw = (event: MouseEvent) => {
  handleMouseMove(event);
  doc?.endDraw();
}

const convertPixelsToRem = (pixels: number): number => {
  return pixels / parseFloat(getComputedStyle(document.documentElement).fontSize);
};

defineExpose({
  endDraw,
  handleMouseMove,
});
</script>

<template>
  <div class="absolute bg-white shadow-sm" :style="{ 'margin-top': convertPixelsToRem(-canvasSize.width * scale / 2) + 'rem', 'margin-left': convertPixelsToRem(-canvasSize.height * scale / 2) + 'rem' }">
    <canvas class="canvas cursor-none" :width="canvasSize.width" :height="canvasSize.height" :style="{ width: convertPixelsToRem(canvasSize.width * scale) + 'rem', height: convertPixelsToRem(canvasSize.height * scale) + 'rem' }" @mousemove.stop="handleMouseMove" @mousedown.left.stop="startDraw" @mouseup.stop="endDraw" @mouseleave.stop="handleMouseMove" @mouseenter.stop="handleMouseEnter" ref="canvas"></canvas>
  </div>
</template>

<style scoped>
.canvas {
  image-rendering: pixelated;
  animation: fix-image-rendering-bug .1s;
}

@keyframes fix-image-rendering-bug {
  from { opacity: 0.9; }
  to { opacity: 1; }
}
</style>

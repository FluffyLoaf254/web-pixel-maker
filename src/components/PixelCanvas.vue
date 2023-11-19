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

  document?.setColor(value)
});

let document: WebPixelDocument | null = null;

const handleMouseMove = (event: MouseEvent) => {
  document?.setPosition(event.offsetX / (canvasSize.value.width * props.scale), event.offsetY / (canvasSize.value.height * props.scale));
};

const handleMouseEnter = (event: MouseEvent) => {
  document?.clearPositions();
  handleMouseMove(event);
}

const render = () => {
  document?.render();
  requestAnimationFrame(() => render());
}

onMounted(async () => {
  if (canvas.value) {
    document = new WebPixelDocument(canvas.value, {
      width: canvasSize.value.width,
      height: canvasSize.value.height
    });
    await document.setup();
    render();
  }
});

const startDraw = (event: MouseEvent) => {
  document?.startDraw();
  handleMouseMove(event);
}

const endDraw = (event: MouseEvent) => {
  handleMouseMove(event);
  document?.endDraw();
}

defineExpose({
  endDraw,
  handleMouseMove,
});
</script>

<template>
  <div class="absolute bg-white shadow-sm" :style="{ 'margin-top': -(canvasSize.width * scale / 2) + 'px', 'margin-left': -(canvasSize.height * scale / 2) + 'px' }">
    <canvas class="canvas cursor-none" :width="canvasSize.width" :height="canvasSize.height" :style="{ width: canvasSize.width * scale + 'px', height: canvasSize.height * scale + 'px' }" @mousemove.stop="handleMouseMove" @mousedown.left.stop="startDraw" @mouseup.stop="endDraw" @mouseleave.stop="handleMouseMove" @mouseenter.stop="handleMouseEnter" ref="canvas"></canvas>
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

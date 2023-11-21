<script setup lang="ts">
import PixelEditor from './components/PixelEditor.vue';
import { useSettingsStore } from './composables/settingsStore';

const store = useSettingsStore();
</script>

<template>
  <div class="w-full h-full" :class="{ dark: store.dark }">
    <pixel-editor />
  </div>
</template>

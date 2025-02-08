<script setup lang="ts">
import { ref } from 'vue';
import IconButton from './IconButton.vue';
import SettingsMenu from './SettingsMenu.vue';

type Emits = {
  tutorial: []
}

defineEmits<Emits>();

const settingsOpen = ref(false);
</script>

<template>
  <div class="bg-white dark:bg-slate-700 py-4 px-4 md:px-8 w-full flex gap-4 justify-between items-center">
    <h1 class="text-blue-500 dark:text-blue-400 text-xl font-semibold">
      <slot></slot>
    </h1>
    <div class="flex gap-4 items-center">
      <icon-button @click="settingsOpen = !settingsOpen" label="Guided Tutorial">
        <cog-6-tooth-icon class="w-5 h-5" />
      </icon-button>
      <div class="relative">
        <settings-menu v-if="settingsOpen" @tutorial="$emit('tutorial')" @mouseleave="settingsOpen = false" @focusout="settingsOpen = false" />
      </div>
    </div>
  </div>
</template>

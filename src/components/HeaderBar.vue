<script setup lang="ts">
import IconButton from './IconButton.vue';
import { InformationCircleIcon } from '@heroicons/vue/24/solid';

type Emits = {
  tutorial: []
};

defineEmits<Emits>();
</script>

<template>
  <div class="bg-white py-4 px-4 md:px-8 w-full flex gap-4 justify-between items-center">
    <h1 class="text-blue-500 text-xl font-semibold">
      <slot></slot>
    </h1>
    <div class="flex gap-4 items-center">
      <icon-button @click="$emit('tutorial')" label="Guided Tutorial">
        <information-circle-icon class="w-5 h-5" />
      </icon-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import IconButton from './IconButton.vue';
import InputLabel from './InputLabel.vue';
import FormInput from './FormInput.vue';
import { MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from '@heroicons/vue/24/solid';
import { useDocumentStore } from '../composables/documentStore';
import { storeToRefs } from 'pinia';

const store = useDocumentStore();
const { zoom } = storeToRefs(store);
</script>

<template>
  <div class="bg-white py-4 px-4 md:px-8 w-full flex justify-end gap-4 items-center dark:bg-slate-700">
    <icon-button @click="store.decreaseZoom" data-tutorial="Decrease the zoom level of the document." label="Zoom Out">
      <magnifying-glass-minus-icon class="w-5 h-5" />
    </icon-button>
    <icon-button @click="store.increaseZoom" data-tutorial="Increase the zoom level of the document." label="Zoom In">
      <magnifying-glass-plus-icon class="w-5 h-5" />
    </icon-button>
    <form-input name="zoom" class="w-20" id="zoom" :model-value="zoom * 100" @update:model-value="(value: string | number) => store.setZoom(Number(value) / 100)" type="number" min="100" max="800" step="100" data-tutorial="Here, you can set the zoom level manually." />
    <input-label value="Zoom" for="zoom" />
  </div>
</template>

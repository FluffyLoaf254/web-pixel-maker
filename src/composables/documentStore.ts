import { defineStore } from 'pinia';

export interface DocumentSettings {
  width: number
  height: number
  zoom: number
}

export const useDocumentStore = defineStore('document', {
  state: (): DocumentSettings => ({
    width: 128,
    height: 128,
    zoom: 2,
  }),
  getters: {
    //
  },
  actions: {
    increaseZoom() {
      this.setZoom(this.zoom + 1);
    },
    decreaseZoom() {
      this.setZoom(this.zoom - 1)
    },
    setZoom(zoom: number) {
      this.zoom = Math.min(8, Math.max(1, zoom));
    },
  },
})

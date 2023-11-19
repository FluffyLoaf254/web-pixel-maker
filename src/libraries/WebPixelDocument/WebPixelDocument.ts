import WebPixelRenderer from './WebPixelRenderer';
import WebPixelDocumentConfig from './WebPixelDocumentConfig';
import { Color } from '../../types';

class WebPixelDocument {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  renderer: WebPixelRenderer | null = null;
  positions: number[] = [];
  currentPosition: number[] = [-1, -1];
  color: number[] = [0, 0, 0, 1];
  drawing: boolean = false;

  constructor(canvas: HTMLCanvasElement, config: WebPixelDocumentConfig) {
    this.canvas = canvas;
    this.width = config.width;
    this.height = config.height;
  }

  async setup() {
    if (!navigator.gpu) {
      throw Error("WebGPU not supported.");
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw Error("Couldn't request WebGPU adapter.");
    }

    const device = await adapter.requestDevice();

    const context = this.canvas.getContext("webgpu");
    if (!context) {
      throw Error("Couldn't request WebGPU context.");
    }

    this.renderer = new WebPixelRenderer(context, device, {
      textureWidth: this.width,
      textureHeight: this.height,
    });
  }

  setPosition(x: number, y: number) {
    if (this.drawing) {
      this.positions.push(x);
      this.positions.push(y);
    }
    this.currentPosition = [x, y];
  }

  setColor({ r, g, b, a }: Color) {
    this.color = [r, g, b, a];
  }

  clearPositions() {
    this.positions = [];
  }

  startDraw() {
    this.drawing = true;
  }

  endDraw() {
    this.drawing = false;
    this.positions = [];
  }

  render() {
    this.renderer?.setDrawColor(this.color);
    this.renderer?.setDrawPosition(this.currentPosition);
    if (this.positions.length) {
      this.renderer?.setDrawPositions(this.positions);
      this.renderer?.draw();
      this.positions = this.drawing ? this.positions.slice(-2) : [];
    }
    this.renderer?.render();
    this.renderer?.submit();
  }
}

export default WebPixelDocument;

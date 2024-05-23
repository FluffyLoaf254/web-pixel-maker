import WebPixelRendererConfig from './WebPixelRendererConfig';
import renderShader from '../../shaders/render.wgsl?raw';
import computeShader from '../../shaders/compute.wgsl?raw';

class WebPixelRenderer {
  context: GPUCanvasContext;
  device: GPUDevice;
  encoder: GPUCommandEncoder | null = null;

  texture: GPUTexture;
  textureWidth: number;
  textureHeight: number;
  renderPipeline: GPURenderPipeline;
  renderBindGroup: GPUBindGroup;
  computePipeline: GPUComputePipeline;
  computeBindGroup: GPUBindGroup;
  vertexBuffer: GPUBuffer;
  colorBuffer: GPUBuffer;
  positionBuffer: GPUBuffer;
  positionsBuffer: GPUBuffer;

  drawPosition: number[];
  drawPositions: number[];
  drawColor: number[];

  constructor(context: GPUCanvasContext, device: GPUDevice, config: WebPixelRendererConfig) {
    this.context = context
    this.device = device;
    this.textureWidth = config.textureWidth;
    this.textureHeight = config.textureHeight;
    this.drawPosition = [-1, -1];
    this.drawPositions = [];
    this.drawColor = [0, 0, 0, 1];

    this.context.configure({
      device: this.device,
      format: navigator.gpu.getPreferredCanvasFormat(),
      alphaMode: "premultiplied",
    });

    const renderProperties = this.setupRenderPipeline();
    this.renderPipeline = renderProperties.renderPipeline;
    this.renderBindGroup = renderProperties.renderBindGroup;
    this.vertexBuffer = renderProperties.vertexBuffer;
    this.colorBuffer = renderProperties.colorBuffer;
    this.positionBuffer = renderProperties.positionBuffer;
    this.texture = renderProperties.texture;
    const computeProperties = this.setupComputePipeline();
    this.computePipeline = computeProperties.computePipeline;
    this.computeBindGroup = computeProperties.computeBindGroup;
    this.positionsBuffer = computeProperties.positionsBuffer;
  }

  setDrawColor(color: number[]) {
    this.drawColor = color;
  }

  setDrawPosition(position: number[]) {
    this.drawPosition = position;
  }

  setDrawPositions(positions: number[]) {
    this.drawPositions = positions;
  }

  setupRenderPipeline(): {
    renderPipeline: GPURenderPipeline
    renderBindGroup: GPUBindGroup
    vertexBuffer: GPUBuffer
    colorBuffer: GPUBuffer
    positionBuffer: GPUBuffer
    texture: GPUTexture
  } {
    const renderShaderModule = this.device.createShaderModule({
      code: renderShader,
    });

    const texture = this.device.createTexture({
      size: {
        width: this.textureWidth,
        height: this.textureHeight,
      },
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.STORAGE_BINDING,
    });
    
    if (!texture) {
      throw Error("Couldn't create texture.");
    }

    const vertices = new Float32Array([
      1, 1, 0, 1, // position
      1, 0, // uv
      -1, 1, 0, 1, 
      0, 0, 
      1, -1, 0, 1, 
      1, 1, 
      -1, -1, 0, 1, 
      0, 1,
    ]);

    const vertexBuffer = this.device.createBuffer({
      size: vertices.byteLength, // make it big enough to store vertices in
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    this.device.queue.writeBuffer(vertexBuffer, 0, vertices, 0, vertices.length);

    const vertexBuffers: GPUVertexBufferLayout[] = [
      {
        attributes: [
          {
            shaderLocation: 0, // position
            offset: 0,
            format: "float32x4",
          },
          {
            shaderLocation: 1, // uv
            offset: 16,
            format: "float32x2",
          },
        ],
        arrayStride: 24,
        stepMode: "vertex",
      },
    ];

    const color = new Float32Array(this.drawColor);

    const colorBuffer = this.device.createBuffer({
      size: color.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const position = new Float32Array(this.drawPosition);

    const positionBuffer = this.device.createBuffer({
      size: position.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'non-filtering' } },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float', multisampled: false } },
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
        { binding: 3, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
      ],
    });

    const layout = this.device.createPipelineLayout({
      bindGroupLayouts: [
        bindGroupLayout,
      ]
    });

    const renderPipeline = this.device.createRenderPipeline({
      vertex: {
        module: renderShaderModule,
        entryPoint: "vertex_main",
        buffers: vertexBuffers,
      },
      fragment: {
        module: renderShaderModule,
        entryPoint: "fragment_main",
        targets: [
          {
            format: navigator.gpu.getPreferredCanvasFormat(),
          },
        ],
      },
      primitive: {
        topology: "triangle-strip",
      },
      layout,
    });

    const sampler = this.device.createSampler({
      magFilter: 'nearest',
      minFilter: 'nearest',
    });

    const renderBindGroup = this.device.createBindGroup({
      layout: renderPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: sampler },
        { binding: 1, resource: texture.createView() },
        { binding: 2, resource: { buffer: colorBuffer } },
        { binding: 3, resource: { buffer: positionBuffer } },
      ],
    });

    return {
      renderPipeline,
      renderBindGroup,
      vertexBuffer,
      colorBuffer,
      positionBuffer,
      texture,
    };
  }

  setupComputePipeline(): {
    computePipeline: GPUComputePipeline
    computeBindGroup: GPUBindGroup
    positionsBuffer: GPUBuffer
  } {
    const computeShaderModule = this.device.createShaderModule({
      code: computeShader,
    });

    const computeBindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, storageTexture: { access: 'write-only', format: 'rgba8unorm' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
      ],
    });

    const computePipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [
        computeBindGroupLayout,
      ]
    });

    const positionsBuffer = this.device.createBuffer({
      size: 2 * 10 * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    const computePipeline = this.device.createComputePipeline({
      compute: {
        module: computeShaderModule,
        entryPoint: "compute_main",
      },
      layout: computePipelineLayout,
    });

    const computeBindGroup = this.device.createBindGroup({
      layout: computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: this.texture.createView() },
        { binding: 1, resource: { buffer: this.colorBuffer }},
        { binding: 2, resource: { buffer: positionsBuffer }},
      ],
    });

    return {
      computePipeline,
      computeBindGroup,
      positionsBuffer,
    };
  }

  render() {
    this.encoder = this.encoder ?? this.device.createCommandEncoder();

    const position = new Float32Array(this.drawPosition);
    this.device.queue.writeBuffer(this.positionBuffer, 0, position);
    const color = new Float32Array(this.drawColor);
    this.device.queue.writeBuffer(this.colorBuffer, 0, color);

    this.encoder.clearBuffer(this.positionsBuffer);
    
    const renderPass = this.encoder.beginRenderPass({
      colorAttachments: [
        {
          clearValue: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
          view: this.context.getCurrentTexture().createView(),
        },
      ],
    });

    renderPass.setPipeline(this.renderPipeline);
    renderPass.setVertexBuffer(0, this.vertexBuffer);
    renderPass.setBindGroup(0, this.renderBindGroup);
    renderPass.draw(4);

    renderPass.end();
  }

  draw() {
    this.encoder = this.encoder ?? this.device.createCommandEncoder();

    const positions = new Float32Array(this.drawPositions.slice(0, 20));
    this.device.queue.writeBuffer(this.positionsBuffer, 0, positions);
    const computePass = this.encoder.beginComputePass();
    
    computePass.setPipeline(this.computePipeline);
    computePass.setBindGroup(0, this.computeBindGroup);
    computePass.dispatchWorkgroups(positions.length / 2);

    computePass.end();
  }

  submit() {
    if (this.encoder) {
      this.device.queue.submit([this.encoder.finish()]);
    }
    this.encoder = null;
  }
}

export default WebPixelRenderer;

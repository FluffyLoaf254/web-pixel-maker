struct VertexOut {
    @builtin(position) position : vec4f,
    @location(0) uvs : vec2f,
}

@vertex
fn vertex_main(@location(0) position: vec4f, @location(1) uvs: vec2f) -> VertexOut
{
    var output : VertexOut;
    output.position = position;
    output.uvs = uvs;
    return output;
}

@group(0) @binding(0) var sam: sampler;
@group(0) @binding(1) var tex: texture_2d<f32>;
@group(0) @binding(2) var<uniform> color: vec4f;
@group(0) @binding(3) var<uniform> pos: vec2f;

@fragment
fn fragment_main(fragData: VertexOut) -> @location(0) vec4f
{
    var dim: vec2<u32> = textureDimensions(tex);
    var pixelSize: vec2f = vec2f(1) / vec2f(dim);
    var posFloor: vec2f = floor(pos * vec2f(dim)) / vec2f(dim);
    var posCeil: vec2f = floor(pos * vec2f(dim) + 1) / vec2f(dim);
    var col = textureSample(tex, sam, fragData.uvs);
    if (fragData.uvs.x >= posFloor.x && fragData.uvs.x < posCeil.x
    && fragData.uvs.y >= posFloor.y && fragData.uvs.y < posCeil.y) {
    col = color;
    }
    return col;
}
@group(0) @binding(0) var tex: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<uniform> color: vec4f;
@group(0) @binding(2) var<storage, read> positions: array<vec2f>;

@compute @workgroup_size(10)
fn compute_main(@builtin(workgroup_id) ids: vec3<u32>)
{
    var pos_index: u32 = ids.x;
    var pos: vec2f = positions[pos_index];
    var dim: vec2<u32> = textureDimensions(tex);
    var prev: vec2f = positions[pos_index];
    if (pos_index > 0) {
    prev = positions[pos_index - 1];
    }
    var dist: f32 = distance(prev, pos);
    var pixelSize: vec2f = vec2f(1) / vec2f(dim);
    textureStore(tex, vec2<u32>(vec2f(dim) * pos), color);
    for (var index: f32 = 0; index < dist; index += pixelSize.x) {
    var texel: vec2<u32> = vec2<u32>(vec2f(dim) * mix(prev, pos, index / dist));
    textureStore(tex, texel, color);
    }
}

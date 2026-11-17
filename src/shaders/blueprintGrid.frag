uniform vec3 uGridColor;
uniform vec3 uMajorColor;
uniform vec3 uBackgroundColor;
uniform float uCellSize;
uniform float uMajorStep;
uniform float uFadeDistance;

varying vec3 vWorldPosition;

float gridLine(vec2 coord, float scale, float lineWidth) {
  vec2 scaled = coord / scale;
  vec2 grid = abs(fract(scaled - 0.5) - 0.5) / fwidth(scaled);
  float line = min(grid.x, grid.y);
  return 1.0 - min(line / lineWidth, 1.0);
}

void main() {
  vec2 xz = vWorldPosition.xz;
  float minorGrid = gridLine(xz, uCellSize, 0.9);
  float majorGrid = gridLine(xz, uCellSize * uMajorStep, 1.15);

  float dist = length(xz - vec2(0.0, -5.0));
  float radialFade = 1.0 - smoothstep(uFadeDistance * 0.35, uFadeDistance, dist);

  vec3 color = uBackgroundColor;
  color = mix(color, uGridColor, minorGrid * 0.16 * radialFade);
  color = mix(color, uMajorColor, majorGrid * 0.34 * radialFade);

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}

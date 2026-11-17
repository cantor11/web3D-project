uniform float uTime;
uniform vec3 uBaseColor;
uniform vec3 uPulseColor;
uniform float uSpeed;
uniform float uDensity;

varying vec2 vUv;

void main() {
  float flow = fract(vUv.x * uDensity - uTime * uSpeed);
  float head = smoothstep(0.0, 0.16, flow) * (1.0 - smoothstep(0.16, 0.52, flow));
  float core = pow(head, 1.8);

  float tubeShade = 0.45 + 0.55 * abs(sin(vUv.y * 3.14159));
  vec3 color = mix(uBaseColor * 0.72, uPulseColor * 1.18, core) * tubeShade;
  float alpha = mix(0.7, 0.98, core);

  gl_FragColor = vec4(color, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}

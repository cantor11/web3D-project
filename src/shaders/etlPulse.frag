uniform float uTime;
uniform vec3 uBaseColor;
uniform vec3 uPulseColor;
uniform float uSpeed;
uniform float uDensity;

varying vec2 vUv;

void main() {
  float flow = fract(vUv.x * uDensity - uTime * uSpeed);
  float head = smoothstep(0.0, 0.14, flow) * (1.0 - smoothstep(0.14, 0.55, flow));
  float core = pow(head, 2.2);

  float railGlow = 0.25 + 0.75 * abs(sin(vUv.y * 3.14159));
  vec3 color = mix(uBaseColor * 0.35, uPulseColor * 2.2, core) * railGlow;
  float alpha = mix(0.28, 1.0, core);

  gl_FragColor = vec4(color, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}

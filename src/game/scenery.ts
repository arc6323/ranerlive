import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { WeatherId } from "./types";

export type Biome = {
  id: string;
  name: string;
  weather: WeatherId;
  night: boolean;
  fog: number;
  fogNear: number;
  fogFar: number;
  hemiSky: number;
  hemiGround: number;
  hemiInt: number;
  sun: number;
  sunInt: number;
  sunDir: [number, number, number];
  ground: number;
  road: number;
  skyTop: number;
  skyHorizon: number;
  sunColor: number;
};

export const BIOMES: Biome[] = [
  {
    id: "taiga",
    name: "Тайга",
    weather: "sun",
    night: false,
    fog: 0xb0b8a8,
    fogNear: 38,
    fogFar: 165,
    hemiSky: 0x9eb6c8,
    hemiGround: 0x3d4a32,
    hemiInt: 0.72,
    sun: 0xfff1d0,
    sunInt: 2.35,
    sunDir: [0.38, 0.84, 0.22],
    ground: 0x4a6a40,
    road: 0x9a9690,
    skyTop: 0x5e8ab8,
    skyHorizon: 0xdcc8a4,
    sunColor: 0xffe6b0,
  },
  {
    id: "storm",
    name: "Мокрая трасса",
    weather: "rain",
    night: false,
    fog: 0x4a5560,
    fogNear: 18,
    fogFar: 110,
    hemiSky: 0x4a5568,
    hemiGround: 0x2a3028,
    hemiInt: 0.42,
    sun: 0x9aadc0,
    sunInt: 0.65,
    sunDir: [0.15, 0.9, 0.1],
    ground: 0x3a463c,
    road: 0x6a6e74,
    skyTop: 0x2e3848,
    skyHorizon: 0x6a7380,
    sunColor: 0xc0c8d4,
  },
  {
    id: "tundra",
    name: "Тундра",
    weather: "snow",
    night: false,
    fog: 0xd4dce4,
    fogNear: 28,
    fogFar: 140,
    hemiSky: 0xe8eef4,
    hemiGround: 0xc0c8d0,
    hemiInt: 0.85,
    sun: 0xf0f4ff,
    sunInt: 1.15,
    sunDir: [0.25, 0.78, 0.4],
    ground: 0xd8e2ea,
    road: 0xb8c0c8,
    skyTop: 0x9eb0c4,
    skyHorizon: 0xe8eef4,
    sunColor: 0xffffff,
  },
  {
    id: "canyon",
    name: "Каньон",
    weather: "hail",
    night: false,
    fog: 0x3a4048,
    fogNear: 16,
    fogFar: 95,
    hemiSky: 0x3a4050,
    hemiGround: 0x2a2830,
    hemiInt: 0.32,
    sun: 0xc0c8d8,
    sunInt: 0.45,
    sunDir: [0.2, 0.7, 0.15],
    ground: 0x6a5340,
    road: 0x5a5854,
    skyTop: 0x1c2430,
    skyHorizon: 0x5a5050,
    sunColor: 0xd8dce8,
  },
  {
    id: "nightwood",
    name: "Ночной бор",
    weather: "sun",
    night: true,
    fog: 0x121820,
    fogNear: 22,
    fogFar: 120,
    hemiSky: 0x1a2838,
    hemiGround: 0x101410,
    hemiInt: 0.28,
    sun: 0xa8c4e8,
    sunInt: 0.55,
    sunDir: [-0.2, 0.75, 0.35],
    ground: 0x1a281c,
    road: 0x3a3e44,
    skyTop: 0x05080e,
    skyHorizon: 0x1a2430,
    sunColor: 0xd0dcec,
  },
];

export function createSky() {
  const uniforms = {
    uTop: { value: new THREE.Color(0x5e8ab8) },
    uHorizon: { value: new THREE.Color(0xdcc8a4) },
    uSun: { value: new THREE.Vector3(0.38, 0.84, 0.22).normalize() },
    uSunColor: { value: new THREE.Color(0xffe6b0) },
    uSunSize: { value: 0.018 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vDir;
      uniform vec3 uTop;
      uniform vec3 uHorizon;
      uniform vec3 uSun;
      uniform vec3 uSunColor;
      uniform float uSunSize;
      void main() {
        float h = clamp(vDir.y * 0.55 + 0.42, 0.0, 1.0);
        vec3 col = mix(uHorizon, uTop, pow(h, 0.85));
        float sun = smoothstep(uSunSize * 3.5, uSunSize * 0.2, 1.0 - dot(normalize(vDir), uSun));
        col += uSunColor * sun;
        col += uSunColor * 0.14 * pow(max(0.0, dot(normalize(vDir), uSun)), 8.0);
        float band = smoothstep(0.02, 0.18, vDir.y) * smoothstep(0.42, 0.16, vDir.y);
        float cloud = sin(vDir.x * 8.0 + vDir.z * 3.0) * 0.5 + 0.5;
        cloud *= sin(vDir.x * 3.5 - vDir.z * 6.0) * 0.5 + 0.5;
        col = mix(col, mix(uHorizon, vec3(1.0), 0.35), band * cloud * 0.22);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(220, 24, 16), mat);
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}

export function createPineNeedles() {
  const layers = [
    { r: 1.45, h: 2.15, y: 1.35 },
    { r: 1.12, h: 1.85, y: 2.25 },
    { r: 0.78, h: 1.55, y: 3.15 },
    { r: 0.48, h: 1.15, y: 3.85 },
  ];
  const geos = layers.map((l) => {
    const c = new THREE.ConeGeometry(l.r, l.h, 8);
    c.translate(0, l.y, 0);
    return c;
  });
  const merged = mergeGeometries(geos, false)!;
  geos.forEach((g) => g.dispose());
  return merged;
}
export function createPineTrunk() {
  const g = new THREE.CylinderGeometry(0.11, 0.2, 1.35, 6);
  g.translate(0, 0.62, 0);
  return g;
}
export function createBushGeo() {
  const a = new THREE.IcosahedronGeometry(0.55, 0);
  a.translate(0, 0.4, 0);
  const b = new THREE.IcosahedronGeometry(0.38, 0);
  b.translate(0.28, 0.32, 0.1);
  const c = new THREE.IcosahedronGeometry(0.32, 0);
  c.translate(-0.22, 0.28, -0.12);
  const merged = mergeGeometries([a, b, c], false)!;
  a.dispose();
  b.dispose();
  c.dispose();
  return merged;
}
export function createRockGeo() {
  const g = new THREE.IcosahedronGeometry(0.7, 0);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, pos.getY(i) * 0.65);
    pos.setX(i, pos.getX(i) * (0.8 + ((i * 13) % 7) * 0.04));
  }
  g.computeVertexNormals();
  return g;
}
export function createCoinGeo() {
  const g = new THREE.CylinderGeometry(0.28, 0.28, 0.05, 12);
  g.rotateZ(Math.PI / 2);
  return g;
}

export function createRidgeline() {
  const g = new THREE.Group();
  g.name = "ridge";
  const mat = new THREE.MeshStandardMaterial({
    color: 0x3a463c,
    roughness: 0.96,
    flatShading: true,
  });
  const specs: [number, number, number, number, number, number][] = [
    [-48, -4, -70, 28, 18, 22],
    [-28, -6, -85, 22, 14, 18],
    [36, -5, -78, 26, 16, 20],
    [58, -4, -92, 32, 20, 24],
    [-62, -8, -100, 24, 12, 18],
    [14, -10, -110, 40, 11, 28],
  ];
  for (const [x, y, z, sx, sy, sz] of specs) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    m.receiveShadow = true;
    g.add(m);
  }
  return g;
}

export function makeCrate() {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x6a4a28, roughness: 0.86 });
  const band = new THREE.MeshStandardMaterial({ color: 0x2a241c, roughness: 0.5, metalness: 0.3 });
  const box = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.95, 0.95, 2, 0.06), wood);
  box.position.y = 0.48;
  box.castShadow = true;
  const strap = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.08, 1.0, 1, 0.02), band);
  strap.position.y = 0.48;
  g.add(box, strap);
  return g;
}

export function makeBarrier() {
  const g = new THREE.Group();
  const conc = new THREE.MeshStandardMaterial({ color: 0x9a958c, roughness: 0.78 });
  const stripe = new THREE.MeshStandardMaterial({ color: 0xb43c1c, roughness: 0.55 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.72, 0.38, 2, 0.08), conc);
  body.position.y = 0.36;
  body.castShadow = true;
  const s = new THREE.Mesh(new RoundedBoxGeometry(1.16, 0.12, 0.4, 1, 0.04), stripe);
  s.position.y = 0.42;
  g.add(body, s);
  return g;
}

export function makeBarrel() {
  const g = new THREE.Group();
  const or = new THREE.MeshStandardMaterial({ color: 0xb85a1a, roughness: 0.55, metalness: 0.25 });
  const ring = new THREE.MeshStandardMaterial({ color: 0x2a2a2c, roughness: 0.4, metalness: 0.5 });
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.85, 16), or);
  c.position.y = 0.43;
  c.castShadow = true;
  const r = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.03, 6, 10), ring);
  r.rotation.x = Math.PI / 2;
  r.position.y = 0.55;
  g.add(c, r);
  return g;
}

export function makeBoulder() {
  const g = new THREE.Group();
  const rock = new THREE.MeshStandardMaterial({ color: 0x6a6864, roughness: 0.92, flatShading: true });
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 1), rock);
  m.position.y = 0.4;
  m.scale.set(1.1, 0.85, 1.0);
  m.castShadow = true;
  g.add(m);
  return g;
}

export function makeOverhead() {
  const g = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color: 0x3a3e44, roughness: 0.4, metalness: 0.7 });
  const bar = new THREE.MeshStandardMaterial({ color: 0xb8a040, roughness: 0.45, metalness: 0.3 });
  const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 0.12), steel);
  p1.position.set(-1.15, 1.1, 0);
  const p2 = p1.clone();
  p2.position.x = 1.15;
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 0.14), steel);
  top.position.y = 2.2;
  const hang = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.12), bar);
  hang.position.y = 1.45;
  g.add(p1, p2, top, hang);
  return g;
}

export function makeRamp() {
  const g = new THREE.Group();
  const plank = new THREE.MeshStandardMaterial({ color: 0x6a5340, roughness: 0.78 });
  const stripe = new THREE.MeshStandardMaterial({ color: 0xc45c1a, roughness: 0.5 });
  const geo = new THREE.BoxGeometry(2.05, 0.16, 3.4);
  const mesh = new THREE.Mesh(geo, plank);
  mesh.rotation.x = -0.42;
  mesh.position.set(0, 0.55, 0);
  mesh.castShadow = true;
  const s = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 3.2), stripe);
  s.rotation.x = -0.42;
  s.position.set(-0.6, 0.64, 0);
  const s2 = s.clone();
  s2.position.x = 0.6;
  g.add(mesh, s, s2);
  return g;
}

export function makeCone() {
  const g = new THREE.Group();
  const or = new THREE.MeshStandardMaterial({ color: 0xd06020, roughness: 0.6 });
  const wh = new THREE.MeshStandardMaterial({ color: 0xe8e0d4, roughness: 0.5 });
  const c = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 8), or);
  c.position.y = 0.36;
  c.castShadow = true;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.08, 8), wh);
  band.position.y = 0.32;
  g.add(c, band);
  return g;
}

export type ObstacleKind = "crate" | "barrier" | "barrel" | "boulder" | "overhead" | "ramp" | "cones";

export function makeObstacle(kind: ObstacleKind) {
  if (kind === "crate") return makeCrate();
  if (kind === "barrier") return makeBarrier();
  if (kind === "barrel") return makeBarrel();
  if (kind === "boulder") return makeBoulder();
  if (kind === "overhead") return makeOverhead();
  if (kind === "ramp") return makeRamp();
  const g = new THREE.Group();
  const a = makeCone();
  a.position.x = -0.32;
  const b = makeCone();
  b.position.x = 0.32;
  g.add(a, b);
  return g;
}

const _dummy = new THREE.Object3D();

export class WeatherFx {
  points: THREE.Points;
  private pos: Float32Array;
  private n: number;
  kind: WeatherId = "sun";
  lightning = 0;
  private mat: THREE.PointsMaterial;

  constructor() {
    this.n = 900;
    this.pos = new Float32Array(this.n * 3);
    for (let i = 0; i < this.n; i++) {
      this.pos[i * 3] = (Math.random() - 0.5) * 28;
      this.pos[i * 3 + 1] = Math.random() * 16;
      this.pos[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    this.mat = new THREE.PointsMaterial({
      color: 0xc8d4e0,
      size: 0.08,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      sizeAttenuation: true,
    });
    this.points = new THREE.Points(geo, this.mat);
    this.points.frustumCulled = false;
  }

  setKind(kind: WeatherId) {
    this.kind = kind;
    if (kind === "sun") {
      this.mat.opacity = 0;
      this.points.visible = false;
      return;
    }
    this.points.visible = true;
    if (kind === "rain") {
      this.mat.color.set(0x9ab0c4);
      this.mat.size = 0.055;
      this.mat.opacity = 0.55;
    } else if (kind === "snow") {
      this.mat.color.set(0xf2f6fa);
      this.mat.size = 0.11;
      this.mat.opacity = 0.85;
    } else {
      this.mat.color.set(0xd8e0e8);
      this.mat.size = 0.13;
      this.mat.opacity = 0.7;
    }
  }

  update(dt: number, cam: THREE.Camera, speed: number) {
    if (this.kind === "sun") {
      this.lightning *= Math.exp(-8 * dt);
      return;
    }
    this.points.position.copy(cam.position);
    const fall =
      this.kind === "snow" ? 4.5 : this.kind === "rain" ? 18 + speed * 0.15 : 22 + speed * 0.2;
    const drift = this.kind === "snow" ? 1.4 : this.kind === "hail" ? 0.4 : 0.8;
    for (let i = 0; i < this.n; i++) {
      const o = i * 3;
      this.pos[o + 1] -= fall * dt;
      this.pos[o] += Math.sin(i + performance.now() * 0.001) * drift * dt;
      this.pos[o + 2] += speed * dt * 0.15;
      if (this.pos[o + 1] < -4) {
        this.pos[o + 1] = 12 + Math.random() * 6;
        this.pos[o] = (Math.random() - 0.5) * 28;
        this.pos[o + 2] = (Math.random() - 0.5) * 36;
      }
    }
    (this.points.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    if (this.kind === "hail" && Math.random() < 0.012) this.lightning = 1;
    this.lightning *= Math.exp(-6 * dt);
  }
}

export { _dummy };

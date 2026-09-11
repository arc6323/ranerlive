import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { CharacterId } from "./types";

function mat(
  color: number,
  opts?: { roughness?: number; metalness?: number; emissive?: number; emi?: number; flat?: boolean },
) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts?.roughness ?? 0.74,
    metalness: opts?.metalness ?? 0.06,
    emissive: opts?.emissive ?? 0x000000,
    emissiveIntensity: opts?.emi ?? 0,
    flatShading: opts?.flat ?? false,
  });
}

function add(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  material: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
  rx = 0,
  ry = 0,
  rz = 0,
  sx = 1,
  sy = 1,
  sz = 1,
) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.scale.set(sx, sy, sz);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

const PAL: Record<
  CharacterId,
  {
    fur: number;
    dark: number;
    light: number;
    jacket: number;
    iris: number;
    ear: number;
    accent: number;
    socks: number;
  }
> = {
  fox: {
    fur: 0xd4682a,
    dark: 0x1a120e,
    light: 0xf0dcc4,
    jacket: 0x3a281c,
    iris: 0xe8a010,
    ear: 0xe09078,
    accent: 0xc45d28,
    socks: 0x1c1410,
  },
  wolf: {
    fur: 0x8a929c,
    dark: 0x242830,
    light: 0xe4eaf0,
    jacket: 0x1a1e24,
    iris: 0xd4a018,
    ear: 0xc4b0a0,
    accent: 0x6a7380,
    socks: 0x3a4048,
  },
  hare: {
    fur: 0xd4b090,
    dark: 0x3a2a1c,
    light: 0xf6eee4,
    jacket: 0x3a4a32,
    iris: 0x2a1c12,
    ear: 0xecc0b0,
    accent: 0xc9a07a,
    socks: 0xf0e6d8,
  },
};

export type Rider = {
  group: THREE.Group;
  hip: THREE.Group;
  head: THREE.Group;
  tail: THREE.Object3D;
  earL: THREE.Object3D;
  earR: THREE.Object3D;
  armL: THREE.Object3D;
  armR: THREE.Object3D;
  thighL: THREE.Object3D;
  thighR: THREE.Object3D;
  shinL: THREE.Object3D;
  shinR: THREE.Object3D;
  id: CharacterId;
  pose: (seated: number, lean: number, t: number, jump: number, slide: number) => void;
};

export function createRider(id: CharacterId): Rider {
  const p = PAL[id];
  const g = new THREE.Group();
  g.name = `rider-${id}`;

  const fur = mat(p.fur, { roughness: 0.92 });
  const dark = mat(p.dark, { roughness: 0.5 });
  const light = mat(p.light, { roughness: 0.88 });
  const jacket = mat(p.jacket, { roughness: 0.58, metalness: 0.14 });
  const iris = mat(p.iris, { roughness: 0.28, metalness: 0.25, emissive: p.iris, emi: 0.18 });
  const earIn = mat(p.ear, { roughness: 0.82 });
  const eyeWhite = mat(0xf6f2ea, { roughness: 0.32 });
  const nose = mat(0x120a08, { roughness: 0.28 });
  const boot = mat(0x1a1612, { roughness: 0.48, metalness: 0.1 });
  const glove = mat(0x2c241c, { roughness: 0.52 });
  const socks = mat(p.socks, { roughness: 0.86 });
  const lens = mat(0x1a2830, { roughness: 0.08, metalness: 0.7, emissive: 0x0a1820, emi: 0.25 });
  const strap = mat(0x1a1816, { roughness: 0.45, metalness: 0.2 });
  const zip = mat(0xb8b0a4, { roughness: 0.35, metalness: 0.55 });

  const sph = new THREE.SphereGeometry(1, 18, 14);
  const cap = new THREE.CapsuleGeometry(1, 1, 6, 12);
  const cone = new THREE.ConeGeometry(1, 1, 12);

  const hip = new THREE.Group();
  hip.position.y = 0.62;
  g.add(hip);

  add(hip, sph, fur, 0, 0.02, 0.02, 0, 0, 0, 0.22, 0.16, 0.18);

  const torso = new THREE.Group();
  torso.position.y = 0.2;
  hip.add(torso);
  add(torso, cap, fur, 0, 0.1, 0, 0, 0, 0, 0.16, 0.22, 0.14);
  add(torso, cap, jacket, 0, 0.14, 0.02, 0.08, 0, 0, 0.185, 0.22, 0.155);
  add(torso, sph, jacket, 0, 0.26, 0.02, 0, 0, 0, 0.17, 0.11, 0.15);
  add(torso, sph, light, 0, 0.02, 0.14, 0, 0, 0, 0.12, 0.15, 0.06);
  add(torso, new THREE.TorusGeometry(0.13, 0.028, 8, 16), jacket, 0, 0.3, 0.02, Math.PI / 2, 0, 0);
  add(torso, new THREE.BoxGeometry(0.02, 0.22, 0.01), zip, 0, 0.12, 0.17);
  add(torso, sph, dark, 0, 0.0, 0.02, 0, 0, 0, 0.2, 0.05, 0.16);

  const neck = add(torso, cap, fur, 0, 0.34, 0.02, 0, 0, 0, 0.075, 0.09, 0.075);

  const head = new THREE.Group();
  head.position.set(0, 0.46, 0.04);
  torso.add(head);
  void neck;

  const headW = id === "wolf" ? 0.205 : id === "hare" ? 0.18 : 0.195;
  const headH = id === "wolf" ? 0.185 : id === "hare" ? 0.175 : 0.18;
  add(head, sph, fur, 0, 0.02, -0.01, 0, 0, 0, headW, headH, 0.18);
  add(head, sph, fur, 0, 0.0, 0.05, 0, 0, 0, headW * 0.92, headH * 0.9, 0.16);
  add(head, sph, light, 0, -0.02, 0.07, 0, 0, 0, 0.13, 0.11, 0.11);
  add(head, sph, fur, -0.11, 0.0, 0.02, 0, 0, 0, 0.075, 0.07, 0.075);
  add(head, sph, fur, 0.11, 0.0, 0.02, 0, 0, 0, 0.075, 0.07, 0.075);

  const snoutLen = id === "wolf" ? 0.22 : id === "hare" ? 0.09 : 0.16;
  add(head, sph, light, 0, -0.03, 0.13, 0, 0, 0, 0.095, 0.075, snoutLen * 0.75);
  add(head, sph, light, 0, -0.035, 0.13 + snoutLen * 0.45, 0, 0, 0, 0.058, 0.048, snoutLen * 0.48);
  add(head, sph, nose, 0, -0.04, 0.14 + snoutLen * 0.72, 0, 0, 0, 0.034, 0.028, 0.04);
  add(head, sph, dark, -0.014, -0.055, 0.12 + snoutLen * 0.35, 0, 0, 0, 0.013, 0.009, 0.02);
  add(head, sph, dark, 0.014, -0.055, 0.12 + snoutLen * 0.35, 0, 0, 0, 0.013, 0.009, 0.02);

  const browY = id === "wolf" ? 0.075 : 0.058;
  add(head, sph, dark, -0.072, browY, 0.13, 0, 0, 0.15, 0.05, 0.02, 0.032);
  add(head, sph, dark, 0.072, browY, 0.13, 0, 0, -0.15, 0.05, 0.02, 0.032);

  const eye = (x: number) => {
    const eg = new THREE.Group();
    eg.position.set(x, 0.038, 0.14);
    head.add(eg);
    add(eg, sph, eyeWhite, 0, 0, 0, 0, 0, 0, 0.045, 0.05, 0.03);
    add(eg, sph, iris, x > 0 ? -0.004 : 0.004, 0, 0.016, 0, 0, 0, 0.028, 0.032, 0.02);
    add(eg, sph, dark, x > 0 ? -0.004 : 0.004, 0, 0.028, 0, 0, 0, 0.013, 0.015, 0.011);
    add(eg, sph, eyeWhite, 0.01, 0.014, 0.032, 0, 0, 0, 0.008, 0.008, 0.006);
  };
  eye(-0.072);
  eye(0.072);

  const earL = new THREE.Group();
  const earR = new THREE.Group();
  if (id === "hare") {
    earL.position.set(-0.07, 0.15, -0.02);
    earR.position.set(0.07, 0.15, -0.02);
    add(earL, cap, fur, 0, 0.36, 0, 0.1, 0, 0.14, 0.045, 0.54, 0.03);
    add(earL, cap, earIn, 0, 0.34, 0.012, 0.1, 0, 0.14, 0.024, 0.48, 0.013);
    add(earL, sph, fur, 0, 0.02, 0, 0, 0, 0, 0.052, 0.042, 0.042);
    add(earR, cap, fur, 0, 0.36, 0, 0.1, 0, -0.14, 0.045, 0.54, 0.03);
    add(earR, cap, earIn, 0, 0.34, 0.012, 0.1, 0, -0.14, 0.024, 0.48, 0.013);
    add(earR, sph, fur, 0, 0.02, 0, 0, 0, 0, 0.052, 0.042, 0.042);
  } else {
    const earH = id === "wolf" ? 0.22 : 0.19;
    earL.position.set(-0.11, 0.14, -0.02);
    earR.position.set(0.11, 0.14, -0.02);
    add(earL, cone, fur, 0, earH * 0.55, 0, 0.12, 0, 0.26, 0.07, earH, 0.048);
    add(earL, cone, earIn, 0, earH * 0.48, 0.014, 0.12, 0, 0.26, 0.04, earH * 0.72, 0.022);
    add(earL, sph, dark, 0, earH * 0.02, -0.01, 0, 0, 0, 0.042, 0.032, 0.032);
    add(earR, cone, fur, 0, earH * 0.55, 0, 0.12, 0, -0.26, 0.07, earH, 0.048);
    add(earR, cone, earIn, 0, earH * 0.48, 0.014, 0.12, 0, -0.26, 0.04, earH * 0.72, 0.022);
    add(earR, sph, dark, 0, earH * 0.02, -0.01, 0, 0, 0, 0.042, 0.032, 0.032);
  }
  head.add(earL, earR);

  const goggles = new THREE.Group();
  goggles.position.set(0, 0.055, 0.04);
  head.add(goggles);
  add(goggles, new THREE.TorusGeometry(0.05, 0.011, 8, 14), strap, -0.07, 0.02, 0.1);
  add(goggles, new THREE.TorusGeometry(0.05, 0.011, 8, 14), strap, 0.07, 0.02, 0.1);
  add(goggles, sph, lens, -0.07, 0.02, 0.1, 0, 0, 0, 0.042, 0.042, 0.02);
  add(goggles, sph, lens, 0.07, 0.02, 0.1, 0, 0, 0, 0.042, 0.042, 0.02);
  add(goggles, cap, strap, 0, 0.02, 0.1, 0, 0, Math.PI / 2, 0.012, 0.052, 0.012);
  add(goggles, new THREE.TorusGeometry(0.17, 0.012, 6, 18, Math.PI), strap, 0, 0.04, -0.02, 0.4, 0, 0);

  const makeArm = (side: number) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.21, 0.22, 0);
    torso.add(arm);
    add(arm, sph, jacket, 0, 0, 0, 0, 0, 0, 0.058, 0.052, 0.058);
    add(arm, cap, jacket, 0, -0.13, 0, 0, 0, 0, 0.05, 0.15, 0.05);
    add(arm, sph, glove, 0, -0.3, 0.02, 0, 0, 0, 0.055, 0.05, 0.058);
    add(arm, sph, glove, side * 0.032, -0.32, 0.052, 0, 0, 0, 0.024, 0.022, 0.032);
    return arm;
  };
  const armL = makeArm(-1);
  const armR = makeArm(1);

  const makeLeg = (side: number) => {
    const thigh = new THREE.Group();
    thigh.position.set(side * 0.11, -0.02, 0);
    hip.add(thigh);
    const thighR = id === "hare" ? 0.09 : 0.072;
    add(thigh, cap, id === "hare" ? light : fur, 0, -0.15, 0, 0, 0, 0, thighR, 0.16, thighR);
    const shin = new THREE.Group();
    shin.position.set(0, -0.3, 0);
    thigh.add(shin);
    add(shin, cap, socks, 0, -0.1, 0, 0, 0, 0, 0.052, 0.12, 0.052);
    const footScale = id === "hare" ? 1.45 : 1;
    add(shin, sph, boot, 0, -0.23, 0.05, 0, 0, 0, 0.078 * footScale, 0.044, 0.13 * footScale);
    add(shin, sph, boot, 0, -0.245, 0.125 * footScale, 0, 0, 0, 0.052 * footScale, 0.032, 0.062 * footScale);
    return { thigh, shin };
  };
  const legL = makeLeg(-1);
  const legR = makeLeg(1);

  const tail = new THREE.Group();
  tail.position.set(0, 0.04, -0.16);
  hip.add(tail);
  if (id === "hare") {
    add(tail, sph, light, 0, 0.05, -0.08, 0, 0, 0, 0.1, 0.1, 0.1);
    add(tail, sph, light, 0, 0.06, -0.12, 0, 0, 0, 0.07, 0.07, 0.07);
  } else if (id === "wolf") {
    add(tail, cap, fur, 0, -0.02, -0.18, 1.05, 0, 0, 0.055, 0.22, 0.055);
    add(tail, cap, fur, 0, -0.06, -0.38, 1.15, 0, 0, 0.048, 0.18, 0.048);
    add(tail, sph, dark, 0, -0.1, -0.55, 0, 0, 0, 0.05, 0.042, 0.06);
  } else {
    add(tail, sph, fur, 0, 0.04, -0.1, 0, 0, 0, 0.13, 0.11, 0.15);
    add(tail, sph, fur, 0, 0.02, -0.24, 0, 0, 0, 0.12, 0.1, 0.15);
    add(tail, sph, fur, 0, 0.0, -0.38, 0, 0, 0, 0.1, 0.085, 0.13);
    add(tail, sph, fur, 0, -0.02, -0.5, 0, 0, 0, 0.075, 0.065, 0.1);
    add(tail, sph, light, 0, -0.03, -0.6, 0, 0, 0, 0.055, 0.048, 0.075);
  }

  const scale = id === "wolf" ? 1.12 : id === "hare" ? 0.94 : 1.04;
  g.scale.setScalar(scale);

  const pose = (seated: number, lean: number, t: number, jump: number, slide: number) => {
    const s = seated;
    const idle = Math.sin(t * 2.2);
    const breath = Math.sin(t * 1.6) * 0.012;
    hip.position.y = lerpNum(0.7, 0.52, s) + breath * (1 - s) * 0.4;
    hip.position.x = lean * 0.08;
    hip.rotation.z = -lean * 0.18;
    hip.rotation.x = lerpNum(0.04 + idle * 0.02, 0.38, s) + jump * 0.04 - slide * 0.35;
    g.position.x = lerpNum(1.18, 0, s);
    g.position.y = lerpNum(0, 0.12, s) - slide * 0.22;
    g.position.z = lerpNum(0.22, 0.04, s);
    g.rotation.y = lerpNum(-1.05, Math.PI, s);

    torso.rotation.x = lerpNum(0.05, 0.16, s);
    head.rotation.x = lerpNum(0.05, 0.1, s) - jump * 0.1;
    head.rotation.y = idle * 0.08 * (1 - s);
    head.rotation.z = -lean * 0.1;

    armL.rotation.x = lerpNum(0.12, -1.12, s);
    armR.rotation.x = lerpNum(0.08, -1.12, s);
    armL.rotation.z = lerpNum(0.22, 0.48, s);
    armR.rotation.z = lerpNum(-0.22, -0.48, s);
    armL.rotation.y = lerpNum(0.15, 0.35, s);
    armR.rotation.y = lerpNum(-0.15, -0.35, s);

    legL.thigh.rotation.x = lerpNum(0.1, -1.18, s) + (id === "hare" ? 0.35 * (1 - s) : 0);
    legR.thigh.rotation.x = lerpNum(0.14, -1.15, s) + (id === "hare" ? 0.35 * (1 - s) : 0);
    legL.shin.rotation.x = lerpNum(0.08, 1.08, s);
    legR.shin.rotation.x = lerpNum(0.1, 1.05, s);

    tail.rotation.x = lerpNum(0.35, 0.15, s) + Math.sin(t * 5) * 0.12;
    tail.rotation.y = Math.sin(t * 3.4) * 0.25;
    earL.rotation.z = 0.12 + Math.sin(t * 4.1) * 0.05;
    earR.rotation.z = -0.12 + Math.cos(t * 3.7) * 0.05;
    if (id === "hare") {
      earL.rotation.x = -0.15 + Math.sin(t * 6) * 0.08 + jump * 0.2;
      earR.rotation.x = -0.12 + Math.cos(t * 6.2) * 0.08 + jump * 0.2;
    }
  };

  pose(0, 0, 0, 0, 0);

  return {
    group: g,
    hip,
    head,
    tail,
    earL,
    earR,
    armL,
    armR,
    thighL: legL.thigh,
    thighR: legR.thigh,
    shinL: legL.shin,
    shinR: legR.shin,
    id,
    pose,
  };
}

function lerpNum(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export type Quad = {
  group: THREE.Group;
  wheels: THREE.Mesh[];
  handle: THREE.Group;
  spots: THREE.SpotLight[];
  headMats: THREE.MeshStandardMaterial[];
  setLights: (on: boolean, night: boolean) => void;
  spin: (speed: number, dt: number) => void;
  bob: (t: number, speed: number, jump: number) => void;
};

export function createQuad(accent: number): Quad {
  const group = new THREE.Group();
  group.name = "atv";

  const metal = mat(0x1c1e24, { roughness: 0.34, metalness: 0.78 });
  const metal2 = mat(0x2a3038, { roughness: 0.3, metalness: 0.68 });
  const paint = mat(accent, { roughness: 0.42, metalness: 0.28 });
  const paintDark = mat(accent, { roughness: 0.48, metalness: 0.22 });
  paintDark.color.multiplyScalar(0.72);
  const rubber = mat(0x141414, { roughness: 0.94, metalness: 0.04 });
  const rim = mat(0xd0ccc4, { roughness: 0.22, metalness: 0.85 });
  const seat = mat(0x2a221c, { roughness: 0.82 });
  const glass = mat(0xf4ecd8, { roughness: 0.12, metalness: 0.45, emissive: 0xfff0c8, emi: 0.4 });
  const tail = mat(0xb02418, { roughness: 0.35, metalness: 0.35, emissive: 0xa02018, emi: 0.45 });
  const plastic = mat(0x18181a, { roughness: 0.5 });

  const sph = new THREE.SphereGeometry(1, 14, 10);
  const cap = new THREE.CapsuleGeometry(1, 1, 6, 12);
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 14);

  const body = new THREE.Group();
  body.position.y = 0.42;
  group.add(body);

  add(body, new RoundedBoxGeometry(0.72, 0.22, 1.55, 3, 0.08), metal, 0, -0.02, 0.04);
  add(body, new RoundedBoxGeometry(0.62, 0.16, 1.15, 3, 0.06), paint, 0, 0.12, 0.02);
  add(body, sph, metal, 0, 0.0, 0.04, 0, 0, 0, 0.34, 0.14, 0.52);
  add(body, new RoundedBoxGeometry(0.55, 0.2, 0.42, 2, 0.08), paint, 0, 0.08, -0.62);
  add(body, sph, paint, 0, 0.06, -0.72, 0, 0, 0, 0.26, 0.12, 0.22);
  add(body, new RoundedBoxGeometry(0.5, 0.14, 0.32, 2, 0.05), metal2, 0, 0.02, 0.72);
  add(body, cap, seat, 0, 0.22, 0.08, Math.PI / 2, 0, 0, 0.12, 0.3, 0.15);
  add(body, sph, seat, 0, 0.26, 0.26, 0, 0, 0, 0.15, 0.09, 0.17);
  add(body, new RoundedBoxGeometry(0.9, 0.07, 0.28, 2, 0.03), plastic, 0, -0.12, -0.55);

  const handle = new THREE.Group();
  handle.position.set(0, 0.28, -0.5);
  body.add(handle);
  add(handle, cyl, metal, 0, 0.0, 0.04, 0.4, 0, 0, 0.02, 0.22, 0.02);
  add(handle, cyl, metal, 0, 0.12, 0, 0, 0, Math.PI / 2, 0.02, 0.78, 0.02);
  add(handle, cyl, plastic, -0.36, 0.12, 0, 0, 0, Math.PI / 2, 0.032, 0.12, 0.032);
  add(handle, cyl, plastic, 0.36, 0.12, 0, 0, 0, Math.PI / 2, 0.032, 0.12, 0.032);
  add(handle, sph, plastic, -0.4, 0.12, 0, 0, 0, 0, 0.032, 0.032, 0.032);
  add(handle, sph, plastic, 0.4, 0.12, 0, 0, 0, 0, 0.032, 0.032, 0.032);

  add(body, sph, metal2, -0.22, 0.08, -0.78, 0, 0, 0, 0.07, 0.06, 0.06);
  add(body, sph, metal2, 0.22, 0.08, -0.78, 0, 0, 0, 0.07, 0.06, 0.06);
  const hlL = add(body, sph, glass, -0.22, 0.08, -0.86, 0, 0, 0, 0.065, 0.06, 0.045);
  const hlR = add(body, sph, glass, 0.22, 0.08, -0.86, 0, 0, 0, 0.065, 0.06, 0.045);
  add(body, sph, tail, -0.18, 0.06, 0.86, 0, 0, 0, 0.038, 0.032, 0.028);
  add(body, sph, tail, 0.18, 0.06, 0.86, 0, 0, 0, 0.038, 0.032, 0.028);
  add(body, new RoundedBoxGeometry(0.44, 0.08, 0.34, 2, 0.04), metal2, 0, 0.14, 0.7);
  add(body, cyl, metal, -0.16, 0.28, 0.58, 0, 0, 0, 0.014, 0.2, 0.014);
  add(body, cyl, metal, 0.16, 0.28, 0.58, 0, 0, 0, 0.014, 0.2, 0.014);
  add(body, cyl, metal, 0, 0.38, 0.58, 0, 0, Math.PI / 2, 0.014, 0.34, 0.014);

  const fender = new RoundedBoxGeometry(0.38, 0.1, 0.5, 2, 0.05);
  const wells: [number, number, number][] = [
    [-0.48, 0.08, -0.56],
    [0.48, 0.08, -0.56],
    [-0.48, 0.08, 0.6],
    [0.48, 0.08, 0.6],
  ];
  for (const [x, y, z] of wells) {
    add(body, fender, paint, x, y, z, 0.12, 0, x < 0 ? 0.18 : -0.18);
    add(body, new RoundedBoxGeometry(0.16, 0.08, 0.42, 1, 0.03), paintDark, x * 0.7, y - 0.06, z);
  }

  const wheels: THREE.Mesh[] = [];
  const tire = new THREE.TorusGeometry(0.23, 0.075, 10, 22);
  const hub = new THREE.CylinderGeometry(0.1, 0.1, 0.15, 12);
  hub.rotateZ(Math.PI / 2);
  const disc = new THREE.CylinderGeometry(0.155, 0.155, 0.045, 12);
  disc.rotateZ(Math.PI / 2);
  const positions: [number, number, number][] = [
    [-0.5, 0.28, -0.56],
    [0.5, 0.28, -0.56],
    [-0.5, 0.28, 0.6],
    [0.5, 0.28, 0.6],
  ];
  for (const [x, y, z] of positions) {
    const w = add(group, tire, rubber, x, y, z, 0, Math.PI / 2, 0);
    add(group, hub, rim, x, y, z);
    add(group, disc, metal2, x, y, z);
    wheels.push(w);
  }

  const spots: THREE.SpotLight[] = [];
  const makeSpot = (x: number) => {
    const spot = new THREE.SpotLight(0xfff2d0, 0, 42, 0.42, 0.5, 1.15);
    spot.position.set(x, 0.58, -0.9);
    const tgt = new THREE.Object3D();
    tgt.position.set(x * 0.3, 0.1, -16);
    group.add(spot, tgt);
    spot.target = tgt;
    spots.push(spot);
  };
  makeSpot(-0.22);
  makeSpot(0.22);

  const headMats = [hlL.material, hlR.material] as THREE.MeshStandardMaterial[];

  return {
    group,
    wheels,
    handle,
    spots,
    headMats,
    setLights(on, night) {
      const i = on ? (night ? 5.2 : 2.8) : 0.15;
      for (const s of spots) s.intensity = i;
      for (const m of headMats) m.emissiveIntensity = on ? (night ? 1.4 : 0.7) : 0.12;
    },
    spin(speed, dt) {
      const d = (speed / 0.28) * dt;
      for (const w of wheels) w.rotation.x += d;
    },
    bob(t, speed, jump) {
      body.position.y = 0.42 + Math.sin(t * 18) * Math.min(0.018, speed * 0.00045) + jump * 0;
      handle.rotation.z = 0;
    },
  };
}

export function accentOf(id: CharacterId) {
  return PAL[id].accent;
}

export function createMenuSet() {
  const g = new THREE.Group();
  g.name = "menu-set";
  const wood = mat(0x6a4a28, { roughness: 0.86 });
  const band = mat(0x2a241c, { roughness: 0.5, metalness: 0.3 });
  const rust = mat(0x8a4a22, { roughness: 0.62, metalness: 0.2 });
  const glass = mat(0xffe6a0, { roughness: 0.2, metalness: 0.1, emissive: 0xffc878, emi: 0.7 });
  const post = mat(0x3a2a1c, { roughness: 0.88 });

  const crate = new THREE.Group();
  add(crate, new RoundedBoxGeometry(0.7, 0.55, 0.7, 2, 0.04), wood, 0, 0.28, 0);
  add(crate, new RoundedBoxGeometry(0.74, 0.06, 0.74, 1, 0.02), band, 0, 0.28, 0);
  crate.position.set(1.15, 0, 1.35);
  crate.rotation.y = 0.35;
  g.add(crate);

  const can = new THREE.Group();
  add(can, new THREE.CylinderGeometry(0.14, 0.16, 0.38, 10), rust, 0, 0.2, 0);
  add(can, new THREE.TorusGeometry(0.08, 0.018, 6, 10), band, 0, 0.4, 0, Math.PI / 2, 0, 0);
  can.position.set(0.55, 0, 1.55);
  g.add(can);

  const lamp = new THREE.Group();
  add(lamp, new THREE.CylinderGeometry(0.03, 0.04, 0.35, 8), post, 0, 0.2, 0);
  add(lamp, new THREE.SphereGeometry(0.09, 10, 8), glass, 0, 0.42, 0);
  lamp.position.set(-0.35, 0, 1.15);
  const light = new THREE.PointLight(0xffc070, 1.1, 6, 1.6);
  light.position.set(0, 0.45, 0);
  lamp.add(light);
  g.add(lamp);

  add(g, new THREE.CylinderGeometry(0.05, 0.07, 1.35, 6), post, 2.15, 0.68, 0.4);
  add(g, new RoundedBoxGeometry(0.7, 0.38, 0.06, 1, 0.02), wood, 2.15, 1.22, 0.42);

  return g;
}

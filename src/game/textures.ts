import * as THREE from "three";

function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number) {
  return noise(x, y) * 0.55 + noise(x * 2.1, y * 2.1) * 0.3 + noise(x * 4.3, y * 4.3) * 0.15;
}

function canvasTex(
  size: number,
  paint: (ctx: CanvasRenderingContext2D, size: number) => void,
  wrap = true,
) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  paint(ctx, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = tex.wrapT = wrap ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

export function makeRoadTexture() {
  return canvasTex(1024, (ctx, s) => {
    const img = ctx.createImageData(s, s);
    const d = img.data;
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const n = fbm(x * 0.07, y * 0.07);
        const n2 = noise(x * 0.4, y * 0.4);
        const base = 28 + n * 18 + n2 * 8;
        const i = (y * s + x) * 4;
        d[i] = base + 4;
        d[i + 1] = base;
        d[i + 2] = base - 2;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    const laneW = s / 3;
    ctx.strokeStyle = "rgba(232, 220, 190, 0.78)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(8, s);
    ctx.moveTo(s - 8, 0);
    ctx.lineTo(s - 8, s);
    ctx.stroke();

    ctx.strokeStyle = "rgba(232, 220, 190, 0.55)";
    ctx.lineWidth = 5;
    ctx.setLineDash([42, 36]);
    ctx.beginPath();
    ctx.moveTo(laneW, 0);
    ctx.lineTo(laneW, s);
    ctx.moveTo(laneW * 2, 0);
    ctx.lineTo(laneW * 2, s);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    for (let i = 0; i < 40; i++) {
      const x = (hash(i, 9) * s) | 0;
      const y = (hash(i, 3) * s) | 0;
      ctx.fillRect(x, y, 18 + hash(i, 1) * 40, 2);
    }
  });
}

export function makeGroundTexture(kind: "grass" | "dirt" | "snow" | "rock") {
  return canvasTex(512, (ctx, s) => {
    const img = ctx.createImageData(s, s);
    const d = img.data;
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const n = fbm(x * 0.045, y * 0.045);
        const n2 = noise(x * 0.2, y * 0.2);
        let r = 0,
          g = 0,
          b = 0;
        if (kind === "grass") {
          r = 48 + n * 30 + n2 * 12;
          g = 62 + n * 38;
          b = 34 + n * 16;
        } else if (kind === "dirt") {
          r = 78 + n * 28;
          g = 58 + n * 18;
          b = 38 + n * 10;
        } else if (kind === "snow") {
          const c = 214 + n * 28 + n2 * 10;
          r = c;
          g = c + 2;
          b = c + 6;
        } else {
          r = 72 + n * 36;
          g = 68 + n * 28;
          b = 62 + n * 22;
        }
        const i = (y * s + x) * 4;
        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  });
}

export function makeMetalTexture() {
  return canvasTex(256, (ctx, s) => {
    const img = ctx.createImageData(s, s);
    const d = img.data;
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const n = noise(x * 0.3, y * 0.08);
        const v = 40 + n * 50;
        const i = (y * s + x) * 4;
        d[i] = v + 8;
        d[i + 1] = v;
        d[i + 2] = v - 4;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  });
}

export function disposeTex(t: THREE.Texture | null | undefined) {
  t?.dispose();
}

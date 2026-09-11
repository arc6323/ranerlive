import * as THREE from "three";
import {
  BASE_SPEED,
  BIOME_LEN,
  BUSHES_PER_SEG,
  CHAR_STATS,
  COINS_PER_SEG,
  COYOTE,
  GRAVITY,
  JUMP_BUFFER,
  JUMP_VY,
  LANE_WIDTH,
  MAX_SPEED,
  RAMP_VY,
  ROCKS_PER_SEG,
  ROAD_WIDTH,
  SEGMENT_COUNT,
  SEGMENT_LEN,
  SLIDE_TIME,
  SPEED_GAIN,
  TOTAL_TRACK,
  TREES_PER_SEG,
  WARMUP_DIST,
  clamp,
  easeOutCubic,
  expDamp,
  laneX,
  lerp,
  mulberry,
  rand,
  smoothstep,
} from "./config";
import { Input } from "./input";
import { AudioEngine } from "./audio";
import { makeGroundTexture, makeRoadTexture } from "./textures";
import { accentOf, createMenuSet, createQuad, createRider, type Quad, type Rider } from "./models";
import {
  BIOMES,
  WeatherFx,
  createBushGeo,
  createCoinGeo,
  createPineNeedles,
  createPineTrunk,
  createRidgeline,
  createRockGeo,
  createSky,
  makeObstacle,
  type ObstacleKind,
} from "./scenery";
import { loadSave, writeSave } from "./persist";
import type { CharacterId, HudState, Phase, WeatherId } from "./types";
import { BIOME_LABEL } from "./types";

type Obstacle = {
  mesh: THREE.Group;
  kind: ObstacleKind;
  lane: number;
  z: number;
  w: number;
  h: number;
  d: number;
  active: boolean;
  deadly: boolean;
  overhead: boolean;
  ramp: boolean;
};

type Pickup = {
  mesh: THREE.Group;
  kind: "magnet" | "shield" | "star";
  lane: number;
  z: number;
  active: boolean;
};

type SceneryItem = {
  x: number;
  y: number;
  z: number;
  s: number;
  ry: number;
  alive: boolean;
  lane: number;
  collected: boolean;
};

const DUMMY = new THREE.Object3D();
const _color = new THREE.Color();
const _color2 = new THREE.Color();
const _look = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _dirA = new THREE.Vector3();
const _dirB = new THREE.Vector3();

function hitbox(kind: ObstacleKind) {
  switch (kind) {
    case "crate":
      return { w: 1.05, h: 1.0, d: 1.05, deadly: true, overhead: false, ramp: false };
    case "barrier":
      return { w: 1.2, h: 0.78, d: 0.5, deadly: true, overhead: false, ramp: false };
    case "barrel":
      return { w: 0.8, h: 0.9, d: 0.8, deadly: true, overhead: false, ramp: false };
    case "boulder":
      return { w: 1.2, h: 0.95, d: 1.1, deadly: true, overhead: false, ramp: false };
    case "overhead":
      return { w: 2.2, h: 2.4, d: 0.4, deadly: true, overhead: true, ramp: false };
    case "ramp":
      return { w: 2.1, h: 1.3, d: 3.2, deadly: false, overhead: false, ramp: true };
    default:
      return { w: 1.1, h: 0.72, d: 0.6, deadly: true, overhead: false, ramp: false };
  }
}

function isJumpable(kind: ObstacleKind) {
  return kind === "barrier" || kind === "cones" || kind === "barrel";
}

export class Game {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private world = new THREE.Group();
  private player = new THREE.Group();
  private input: Input;
  private audio = new AudioEngine();
  private rider!: Rider;
  private quad!: Quad;
  private sky: ReturnType<typeof createSky>;
  private weather = new WeatherFx();
  private hemi: THREE.HemisphereLight;
  private sun: THREE.DirectionalLight;
  private fill: THREE.DirectionalLight;
  private fog: THREE.Fog;
  private roadMesh: THREE.InstancedMesh;
  private groundL: THREE.InstancedMesh;
  private groundR: THREE.InstancedMesh;
  private needles: THREE.InstancedMesh;
  private trunks: THREE.InstancedMesh;
  private bushes: THREE.InstancedMesh;
  private rocks: THREE.InstancedMesh;
  private coinsMesh: THREE.InstancedMesh;
  private roadMat: THREE.MeshStandardMaterial;
  private groundMat: THREE.MeshStandardMaterial;
  private shadowBlob: THREE.Mesh;
  private shieldRing: THREE.Mesh;
  private ridge: THREE.Group;
  private menuSet: THREE.Group;
  private obstacles: Obstacle[] = [];
  private pickups: Pickup[] = [];
  private trees: SceneryItem[] = [];
  private rockItems: SceneryItem[] = [];
  private bushItems: SceneryItem[] = [];
  private coins: SceneryItem[] = [];
  private segs: number[] = [];
  private disposed = false;
  private last = performance.now();
  private acc = 0;
  private time = 0;
  private hudAcc = 0;
  private phase: Phase = "menu";
  private character: CharacterId;
  private lane = 0;
  private laneSmooth = 0;
  private speed = 0;
  private distance = 0;
  private score = 0;
  private coinsN = 0;
  private best: number;
  private y = 0;
  private vy = 0;
  private grounded = true;
  private slideT = 0;
  private coyote = 0;
  private jumpBuf = 0;
  private introT = 0;
  private seated = 0;
  private crashT = 0;
  private trauma = 0;
  private hitstop = 0;
  private iFrames = 0;
  private magnetT = 0;
  private shieldOn = false;
  private multiT = 0;
  private muted: boolean;
  private tutorial: boolean;
  private lastSpawn = -40;
  private safeLane = 0;
  private biomeT = 0;
  private weatherId: WeatherId = "sun";
  private biomeName = BIOMES[0]!.name;
  private mobile: boolean;
  private reduce: boolean;
  private rng = mulberry(0x9e3779b9);
  private pendingLeft = false;
  private pendingRight = false;
  private onHud: (s: HudState) => void;
  private canvas: HTMLCanvasElement;
  private ro: ResizeObserver;
  private visHandler: () => void;
  private onWinResize: () => void;
  private sizeTimers: number[] = [];
  private ctxLost: (e: Event) => void;
  private save;

  constructor(canvas: HTMLCanvasElement, onHud: (s: HudState) => void, root?: HTMLElement | null) {
    this.canvas = canvas;
    this.onHud = onHud;
    this.save = loadSave();
    this.character = this.save.character;
    this.best = this.save.best;
    this.muted = this.save.muted;
    this.tutorial = !this.save.seenTutorial;
    this.mobile =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 720;
    this.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !this.mobile,
      powerPreference: this.mobile ? "default" : "high-performance",
      alpha: false,
      failIfMajorPerformanceCaveat: false,
      depth: true,
      stencil: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.mobile ? 1.35 : 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.14;
    this.renderer.shadowMap.enabled = !this.mobile;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setClearColor(0x8aa8c0);

    this.scene = new THREE.Scene();
    this.fog = new THREE.Fog(BIOMES[0]!.fog, BIOMES[0]!.fogNear, BIOMES[0]!.fogFar);
    this.scene.fog = this.fog;
    this.camera = new THREE.PerspectiveCamera(58, 1, 0.12, 280);

    this.hemi = new THREE.HemisphereLight(0x9eb6c8, 0x3d4a32, 0.72);
    this.sun = new THREE.DirectionalLight(0xfff1d0, 2.35);
    this.sun.position.set(18, 42, 12);
    this.sun.castShadow = !this.mobile;
    this.sun.shadow.mapSize.set(this.mobile ? 512 : 1024, this.mobile ? 512 : 1024);
    this.sun.shadow.camera.near = 4;
    this.sun.shadow.camera.far = 90;
    this.sun.shadow.camera.left = -28;
    this.sun.shadow.camera.right = 28;
    this.sun.shadow.camera.top = 22;
    this.sun.shadow.camera.bottom = -18;
    this.sun.shadow.bias = -0.0008;
    this.fill = new THREE.DirectionalLight(0xa8c0d8, 0.28);
    this.fill.position.set(-12, 10, -8);
    this.scene.add(this.hemi, this.sun, this.sun.target, this.fill);

    this.sky = createSky();
    this.scene.add(this.sky.mesh);
    this.scene.add(this.weather.points);

    this.world.name = "world";
    this.player.name = "player";
    this.player.frustumCulled = false;
    this.scene.add(this.world, this.player);

    const roadTex = makeRoadTexture();
    roadTex.repeat.set(1, 1);
    this.roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.82,
      metalness: 0.04,
      color: 0x9a9690,
    });
    const grass = makeGroundTexture("grass");
    grass.repeat.set(4, 2);
    this.groundMat = new THREE.MeshStandardMaterial({
      map: grass,
      roughness: 0.95,
      color: 0x8aa070,
    });

    const roadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, SEGMENT_LEN);
    roadGeo.rotateX(-Math.PI / 2);
    this.roadMesh = new THREE.InstancedMesh(roadGeo, this.roadMat, SEGMENT_COUNT);
    this.roadMesh.receiveShadow = true;
    this.roadMesh.frustumCulled = false;

    const gGeo = new THREE.PlaneGeometry(36, SEGMENT_LEN);
    gGeo.rotateX(-Math.PI / 2);
    this.groundL = new THREE.InstancedMesh(gGeo, this.groundMat, SEGMENT_COUNT);
    this.groundR = new THREE.InstancedMesh(gGeo, this.groundMat, SEGMENT_COUNT);
    this.groundL.receiveShadow = true;
    this.groundR.receiveShadow = true;
    this.groundL.frustumCulled = false;
    this.groundR.frustumCulled = false;

    const nGeo = createPineNeedles();
    const tGeo = createPineTrunk();
    const needleMat = new THREE.MeshStandardMaterial({
      color: 0x2f4a32,
      roughness: 0.9,
      flatShading: true,
    });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.86 });
    const treeN = SEGMENT_COUNT * TREES_PER_SEG;
    this.needles = new THREE.InstancedMesh(nGeo, needleMat, treeN);
    this.trunks = new THREE.InstancedMesh(tGeo, trunkMat, treeN);
    this.needles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.trunks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.needles.castShadow = !this.mobile;
    this.needles.frustumCulled = false;
    this.trunks.frustumCulled = false;
    this.needles.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(treeN * 3), 3);
    this.trunks.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(treeN * 3), 3);

    const bushN = SEGMENT_COUNT * BUSHES_PER_SEG;
    const bushMat = new THREE.MeshStandardMaterial({
      color: 0x3a5a32,
      roughness: 0.92,
      flatShading: true,
    });
    this.bushes = new THREE.InstancedMesh(createBushGeo(), bushMat, bushN);
    this.bushes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.bushes.castShadow = !this.mobile;
    this.bushes.frustumCulled = false;
    this.bushes.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(bushN * 3), 3);

    const rockN = SEGMENT_COUNT * ROCKS_PER_SEG;
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x6a6862,
      roughness: 0.94,
      flatShading: true,
    });
    this.rocks = new THREE.InstancedMesh(createRockGeo(), rockMat, rockN);
    this.rocks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.rocks.castShadow = !this.mobile;
    this.rocks.receiveShadow = true;
    this.rocks.frustumCulled = false;

    const coinN = SEGMENT_COUNT * COINS_PER_SEG;
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xe8c35a,
      roughness: 0.28,
      metalness: 0.7,
      emissive: 0xa07820,
      emissiveIntensity: 0.35,
    });
    this.coinsMesh = new THREE.InstancedMesh(createCoinGeo(), coinMat, coinN);
    this.coinsMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.coinsMesh.frustumCulled = false;
    this.coinsMesh.castShadow = false;

    this.world.add(
      this.roadMesh,
      this.groundL,
      this.groundR,
      this.needles,
      this.trunks,
      this.bushes,
      this.rocks,
      this.coinsMesh,
    );

    this.ridge = createRidgeline();
    this.scene.add(this.ridge);
    this.menuSet = createMenuSet();
    this.scene.add(this.menuSet);

    const blob = new THREE.Mesh(
      new THREE.CircleGeometry(0.85, 16),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      }),
    );
    blob.rotation.x = -Math.PI / 2;
    blob.position.y = 0.03;
    this.shadowBlob = blob;
    this.scene.add(blob);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.045, 8, 24),
      new THREE.MeshBasicMaterial({
        color: 0xd8d2c8,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    ring.rotation.x = Math.PI / 2;
    this.shieldRing = ring;
    this.player.add(ring);

    this.buildPools();
    this.layoutTrack(true);
    this.buildPlayer();
    this.placeMenu();

    this.input = new Input(root || canvas.parentElement || canvas);
    this.input.onUnlock = () => {
      this.audio.unlock();
      this.audio.setMuted(this.muted);
    };
    this.audio.setMuted(this.muted);

    this.visHandler = () => {
      if (document.hidden) {
        if (this.phase === "playing") this.pause();
      } else {
        this.audio.resume();
        this.last = performance.now();
      }
    };
    document.addEventListener("visibilitychange", this.visHandler);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas.parentElement || canvas);
    this.onWinResize = () => this.resize();
    window.addEventListener("resize", this.onWinResize);
    window.addEventListener("orientationchange", this.onWinResize);
    this.ctxLost = (e: Event) => {
      e.preventDefault();
    };
    canvas.addEventListener("webglcontextlost", this.ctxLost);
    this.resize();
    this.placeMenu();
    this.bindControlsTest();
    this.pushHud(true);
    this.visual(0);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setAnimationLoop((t) => this.loop(t));
    window.__gameReady = true;
    this.sizeTimers = [50, 180, 500].map((ms) => window.setTimeout(() => this.resize(), ms));
  }

  startFromMenu() {
    if (this.phase !== "menu") return;
    this.audio.unlock();
    this.phase = "intro";
    this.introT = 0;
    this.menuSet.visible = false;
    this.tutorial = false;
    this.save.seenTutorial = true;
    writeSave(this.save);
    this.pushHud(true);
  }

  selectCharacter(id: CharacterId) {
    if (this.phase !== "menu") return;
    if (this.character === id) return;
    this.character = id;
    this.save.character = id;
    writeSave(this.save);
    this.buildPlayer();
    this.placeMenu();
    this.pushHud(true);
  }

  pause() {
    if (this.phase !== "playing") return;
    this.phase = "paused";
    this.audio.setEngine(0, false);
    this.pushHud(true);
  }

  resume() {
    if (this.phase !== "paused") return;
    this.phase = "playing";
    this.last = performance.now();
    this.pushHud(true);
  }

  retry() {
    if (this.phase !== "dead" && this.phase !== "paused") return;
    this.resetRun(true);
  }

  backToMenu() {
    this.resetRun(false);
  }

  toggleMute() {
    this.muted = !this.muted;
    this.save.muted = this.muted;
    writeSave(this.save);
    this.audio.unlock();
    this.audio.setMuted(this.muted);
    this.pushHud(true);
  }

  dispose() {
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    this.input.dispose();
    this.audio.dispose();
    this.ro.disconnect();
    window.removeEventListener("resize", this.onWinResize);
    window.removeEventListener("orientationchange", this.onWinResize);
    this.canvas.removeEventListener("webglcontextlost", this.ctxLost);
    for (const id of this.sizeTimers) clearTimeout(id);
    document.removeEventListener("visibilitychange", this.visHandler);
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach((m) => this.disposeMat(m));
      else if (mat) this.disposeMat(mat);
    });
    this.renderer.dispose();
    if (window.__controlsTest) delete window.__controlsTest;
    window.__gameReady = false;
  }

  private disposeMat(m: THREE.Material) {
    const std = m as THREE.MeshStandardMaterial;
    std.map?.dispose();
    m.dispose();
  }

  private buildPlayer() {
    for (const c of [...this.player.children]) {
      if (c === this.shieldRing) continue;
      this.player.remove(c);
    }
    this.quad = createQuad(accentOf(this.character));
    this.rider = createRider(this.character);
    this.player.add(this.quad.group, this.rider.group);
    this.quad.setLights(this.phase !== "menu", this.currentBiome().night);
  }

  private buildPools() {
    const kinds: ObstacleKind[] = [
      "crate",
      "barrier",
      "barrel",
      "boulder",
      "overhead",
      "ramp",
      "cones",
    ];
    for (let i = 0; i < 22; i++) {
      const kind = kinds[i % kinds.length]!;
      const mesh = makeObstacle(kind);
      mesh.visible = false;
      this.world.add(mesh);
      const hb = hitbox(kind);
      this.obstacles.push({ mesh, kind, lane: 0, z: 0, active: false, ...hb });
    }
    const mkPickup = (kind: Pickup["kind"], color: number) => {
      const g = new THREE.Group();
      const m = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.32, 0),
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.25,
          metalness: 0.45,
          emissive: color,
          emissiveIntensity: 0.45,
        }),
      );
      m.position.y = 0.7;
      m.castShadow = true;
      g.add(m);
      g.visible = false;
      this.world.add(g);
      this.pickups.push({ mesh: g, kind, lane: 0, z: 0, active: false });
    };
    mkPickup("magnet", 0xc45c4a);
    mkPickup("magnet", 0xc45c4a);
    mkPickup("shield", 0xd8d2c8);
    mkPickup("shield", 0xd8d2c8);
    mkPickup("star", 0xe8c35a);
    mkPickup("star", 0xe8c35a);
  }

  private layoutTrack(initial: boolean) {
    this.segs.length = 0;
    this.trees.length = 0;
    this.rockItems.length = 0;
    this.bushItems.length = 0;
    this.coins.length = 0;
    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const z = 10 - i * SEGMENT_LEN;
      this.segs.push(z);
    }
    const treeN = SEGMENT_COUNT * TREES_PER_SEG;
    for (let i = 0; i < treeN; i++) {
      const seg = Math.floor(i / TREES_PER_SEG);
      const z = this.segs[seg]! + rand(-SEGMENT_LEN * 0.42, SEGMENT_LEN * 0.42);
      const side = i % 2 === 0 ? -1 : 1;
      const far = i % 5 === 0;
      this.trees.push({
        x: side * (ROAD_WIDTH * 0.5 + (far ? rand(10, 22) : rand(2.6, 12))),
        y: 0,
        z,
        s: far ? rand(1.4, 2.2) : rand(0.85, 1.55),
        ry: rand(0, Math.PI * 2),
        alive: true,
        lane: 0,
        collected: false,
      });
    }
    const rockN = SEGMENT_COUNT * ROCKS_PER_SEG;
    for (let i = 0; i < rockN; i++) {
      const seg = Math.floor(i / ROCKS_PER_SEG);
      const side = i % 2 === 0 ? -1 : 1;
      this.rockItems.push({
        x: side * (ROAD_WIDTH * 0.5 + rand(2.0, 14)),
        y: 0,
        z: this.segs[seg]! + rand(-8, 8),
        s: rand(0.5, 1.6),
        ry: rand(0, 3),
        alive: true,
        lane: 0,
        collected: false,
      });
    }
    const bushN = SEGMENT_COUNT * BUSHES_PER_SEG;
    for (let i = 0; i < bushN; i++) {
      const seg = Math.floor(i / BUSHES_PER_SEG);
      const side = i % 2 === 0 ? -1 : 1;
      this.bushItems.push({
        x: side * (ROAD_WIDTH * 0.5 + rand(1.7, 9)),
        y: 0,
        z: this.segs[seg]! + rand(-9, 9),
        s: rand(0.7, 1.4),
        ry: rand(0, Math.PI * 2),
        alive: true,
        lane: 0,
        collected: false,
      });
    }
    const coinN = SEGMENT_COUNT * COINS_PER_SEG;
    for (let i = 0; i < coinN; i++) {
      this.coins.push({
        x: 0,
        y: 0.7,
        z: -40,
        s: 1,
        ry: 0,
        alive: false,
        lane: 0,
        collected: false,
      });
    }
    if (initial) this.writeInstances(0);
  }

  private currentBiome() {
    const idx = Math.floor(this.distance / BIOME_LEN) % BIOMES.length;
    return BIOMES[idx]!;
  }

  private biomeBlend() {
    const u = this.distance / BIOME_LEN;
    const i0 = Math.floor(u) % BIOMES.length;
    const i1 = (i0 + 1) % BIOMES.length;
    const f = u - Math.floor(u);
    const t = smoothstep((f - 0.86) / 0.14);
    return { a: BIOMES[i0]!, b: BIOMES[i1]!, t };
  }

  private placeMenu() {
    this.phase = "menu";
    this.speed = 0;
    this.lane = 0;
    this.laneSmooth = 0;
    this.y = 0;
    this.vy = 0;
    this.seated = 0;
    this.player.position.set(ROAD_WIDTH * 0.5 + 1.55, 0, 0.35);
    this.player.rotation.set(0, 0, 0);
    this.quad.group.rotation.set(0, 0.82, 0);
    this.world.position.set(0, 0, 0);
    this.world.rotation.set(0, 0, 0);
    this.quad.setLights(false, false);
    this.clearHazards();
    this.menuSet.visible = true;
    this.menuSet.position.set(this.player.position.x, 0, this.player.position.z);
    const cam = this.menuCam();
    this.camera.position.copy(cam.pos);
    this.camera.lookAt(cam.look);
    this.camera.fov = cam.fov;
    this.camera.updateProjectionMatrix();
  }

  private menuCam() {
    const px = this.player.position.x;
    const pz = this.player.position.z;
    if (this.mobile) {
      return {
        pos: new THREE.Vector3(px + 2.25, 1.78, pz + 4.2),
        look: new THREE.Vector3(px - 0.1, 1.15, pz - 0.2),
        fov: 46,
      };
    }
    return {
      pos: new THREE.Vector3(px + 2.45, 1.18, pz + 2.55),
      look: new THREE.Vector3(px + 0.45, 0.72, pz + 0.05),
      fov: 36,
    };
  }

  private resetRun(autoStart: boolean) {
    this.distance = 0;
    this.score = 0;
    this.coinsN = 0;
    this.speed = 0;
    this.lane = 0;
    this.laneSmooth = 0;
    this.y = 0;
    this.vy = 0;
    this.slideT = 0;
    this.magnetT = 0;
    this.multiT = 0;
    this.shieldOn = false;
    this.iFrames = 0;
    this.crashT = 0;
    this.trauma = 0;
    this.lastSpawn = -40;
    this.safeLane = 0;
    this.rng = mulberry((Math.random() * 1e9) | 0);
    this.player.rotation.set(0, 0, 0);
    this.quad.group.rotation.set(0, 0, 0);
    this.clearHazards();
    this.layoutTrack(true);
    if (autoStart) {
      this.player.position.set(0, 0, 0);
      this.seated = 1;
      this.phase = "playing";
      this.speed = BASE_SPEED * CHAR_STATS[this.character].speedMul * 0.85;
      this.quad.setLights(true, this.currentBiome().night);
    } else {
      this.buildPlayer();
      this.placeMenu();
    }
    this.pushHud(true);
  }

  private clearHazards() {
    for (const o of this.obstacles) {
      o.active = false;
      o.mesh.visible = false;
    }
    for (const p of this.pickups) {
      p.active = false;
      p.mesh.visible = false;
    }
    for (const c of this.coins) {
      c.alive = false;
      c.collected = false;
    }
  }

  private resize() {
    const w = Math.max(1, Math.floor(window.innerWidth || this.canvas.clientWidth || 1));
    const h = Math.max(1, Math.floor(window.innerHeight || this.canvas.clientHeight || 1));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.mobile = window.matchMedia("(pointer: coarse)").matches || w < 720;
  }

  private loop(now: number) {
    if (this.disposed) return;
    const raw = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    if (this.phase === "paused") {
      this.renderer.render(this.scene, this.camera);
      return;
    }
    if (this.hitstop > 0) {
      this.hitstop -= raw;
      this.renderer.render(this.scene, this.camera);
      return;
    }
    this.acc += raw;
    const step = 1 / 60;
    while (this.acc >= step) {
      this.fixed(step);
      this.acc -= step;
    }
    this.visual(raw);
    this.renderer.render(this.scene, this.camera);
    this.hudAcc += raw;
    if (this.hudAcc > 0.08) {
      this.hudAcc = 0;
      this.pushHud(false);
    }
  }

  private fixed(dt: number) {
    this.time += dt;
    const act = this.input.sample();
    if (this.phase === "menu") {
      if (act.startPressed || act.jumpPressed) this.startFromMenu();
      if (this.input.keys.has("Digit1")) this.selectCharacter("fox");
      if (this.input.keys.has("Digit2")) this.selectCharacter("wolf");
      if (this.input.keys.has("Digit3")) this.selectCharacter("hare");
      this.handleMenuTap();
      this.audio.setEngine(0, false);
      return;
    }
    if (this.phase === "intro") {
      this.introT += dt;
      const t = this.introT;
      this.seated = smoothstep(t / (this.reduce ? 0.2 : 0.42));
      const ontoRoad = easeOutCubic(clamp((t - 0.18) / 0.42, 0, 1));
      this.player.position.x = lerp(ROAD_WIDTH * 0.5 + 1.55, 0, ontoRoad);
      this.player.position.z = lerp(0.35, 0, ontoRoad);
      this.quad.group.rotation.y = lerp(0.82, 0, ontoRoad);
      if (t > 0.35) {
        const stats = CHAR_STATS[this.character];
        this.speed = lerp(0, BASE_SPEED * stats.speedMul * 0.7, clamp((t - 0.35) / 0.5, 0, 1));
        this.quad.setLights(true, this.currentBiome().night);
      }
      if (act.leftPressed) this.pendingLeft = true;
      if (act.rightPressed) this.pendingRight = true;
      this.scrollWorld(dt);
      if (t > (this.reduce ? 0.45 : 0.72)) {
        this.phase = "playing";
        this.player.position.set(0, this.y, 0);
        this.quad.group.rotation.y = 0;
        this.camera.position.set(0, 1.95, 4.1);
        this.camera.lookAt(0, 0.65, -2.8);
      }
      return;
    }
    if (this.phase === "dead") {
      this.crashT += dt;
      this.speed = expDamp(this.speed, 0, 3.2, dt);
      this.scrollWorld(dt);
      this.player.position.y = Math.max(0, this.y);
      this.quad.group.rotation.z = Math.min(1.1, this.crashT * 1.6);
      this.quad.group.rotation.x = Math.min(0.5, this.crashT * 0.7);
      this.audio.setEngine(0, false);
      if (act.startPressed && this.crashT > 0.4) this.retry();
      if (act.pausePressed && this.crashT > 0.4) this.backToMenu();
      return;
    }

    if (act.pausePressed) {
      this.pause();
      return;
    }

    const stats = CHAR_STATS[this.character];
    const target = Math.min(MAX_SPEED, BASE_SPEED + this.distance * SPEED_GAIN) * stats.speedMul;
    this.speed = expDamp(this.speed, target, 1.1, dt);

    if (act.leftPressed || this.pendingLeft) this.tryLane(-1);
    if (act.rightPressed || this.pendingRight) this.tryLane(1);
    this.pendingLeft = this.pendingRight = false;

    this.laneSmooth = expDamp(this.laneSmooth, laneX(this.lane), 14, dt);
    this.world.position.x = -this.laneSmooth;

    if (act.jumpPressed) this.jumpBuf = JUMP_BUFFER;
    if (act.slidePressed && this.grounded) {
      this.slideT = SLIDE_TIME;
    }
    this.jumpBuf = Math.max(0, this.jumpBuf - dt);
    if (this.grounded) this.coyote = COYOTE;
    else this.coyote = Math.max(0, this.coyote - dt);
    if (this.jumpBuf > 0 && (this.grounded || this.coyote > 0)) {
      this.vy = JUMP_VY * stats.jumpMul;
      this.grounded = false;
      this.jumpBuf = 0;
      this.coyote = 0;
      this.audio.jump();
    }
    this.slideT = Math.max(0, this.slideT - dt);

    this.vy -= GRAVITY * dt;
    this.y += this.vy * dt;
    if (this.y <= 0) {
      if (!this.grounded && this.vy < -6) {
        this.trauma = Math.min(1, this.trauma + 0.18);
        this.audio.land();
      }
      this.y = 0;
      this.vy = 0;
      this.grounded = true;
    }

    this.iFrames = Math.max(0, this.iFrames - dt);
    this.magnetT = Math.max(0, this.magnetT - dt);
    this.multiT = Math.max(0, this.multiT - dt);

    this.scrollWorld(dt);
    this.distance += this.speed * dt;
    const multi = this.multiT > 0 ? 2 : 1;
    this.score = Math.floor(this.distance * 2.15) + this.coinsN * 10 * multi;

    this.spawn(dt);
    this.collide();
    this.collect();

    this.audio.setEngine(clamp(this.speed / MAX_SPEED, 0, 1), true);
    this.quad.spin(this.speed, dt);
  }

  private tryLane(dir: number) {
    const next = clamp(this.lane + dir, -1, 1);
    if (next === this.lane) return;
    this.lane = next;
    this.audio.whoosh();
    if (navigator.vibrate) navigator.vibrate(8);
  }

  private scrollWorld(dt: number) {
    const dz = this.speed * dt;
    for (let i = 0; i < this.segs.length; i++) {
      this.segs[i] += dz;
      if (this.segs[i]! > 18) this.segs[i] -= TOTAL_TRACK;
    }
    for (const t of this.trees) {
      t.z += dz;
      if (t.z > 22) {
        t.z -= TOTAL_TRACK;
        const side = this.rng() < 0.5 ? -1 : 1;
        const far = this.rng() < 0.22;
        t.x = side * (ROAD_WIDTH * 0.5 + (far ? 10 + this.rng() * 12 : 2.6 + this.rng() * 9));
        t.s = far ? 1.4 + this.rng() * 0.8 : 0.85 + this.rng() * 0.7;
      }
    }
    for (const r of this.rockItems) {
      r.z += dz;
      if (r.z > 22) {
        r.z -= TOTAL_TRACK;
        const side = this.rng() < 0.5 ? -1 : 1;
        r.x = side * (ROAD_WIDTH * 0.5 + 2.4 + this.rng() * 12);
      }
    }
    for (const b of this.bushItems) {
      b.z += dz;
      if (b.z > 22) {
        b.z -= TOTAL_TRACK;
        const side = this.rng() < 0.5 ? -1 : 1;
        b.x = side * (ROAD_WIDTH * 0.5 + 1.7 + this.rng() * 8);
        b.s = 0.7 + this.rng() * 0.7;
      }
    }
    for (const c of this.coins) {
      if (!c.alive) continue;
      if (!c.collected) c.z += dz;
      if (c.z > 14 && !c.collected) {
        c.alive = false;
      }
    }
    for (const o of this.obstacles) {
      if (!o.active) continue;
      o.z += dz;
      o.mesh.position.set(laneX(o.lane), 0, o.z);
      if (o.z > 16) {
        o.active = false;
        o.mesh.visible = false;
      }
    }
    for (const p of this.pickups) {
      if (!p.active) continue;
      p.z += dz;
      p.mesh.position.set(laneX(p.lane), 0, p.z);
      p.mesh.rotation.y += dt * 2.4;
      if (p.z > 16) {
        p.active = false;
        p.mesh.visible = false;
      }
    }
  }

  private spawn(_dt: number) {
    if (this.distance < WARMUP_DIST) return;
    const gap = 15 + this.speed * 0.32;
    if (this.distance - this.lastSpawn < gap) return;
    this.lastSpawn = this.distance;
    const z = -Math.max(88, this.speed * 1.65);
    const diff = clamp(this.distance / 2200, 0, 1);
    if (this.distance > 280 && this.rng() < 0.18) this.safeLane = ([-1, 0, 1] as const)[(this.rng() * 3) | 0]!;
    const other = ([-1, 0, 1] as const).filter((l) => l !== this.safeLane);
    const roll = this.rng();

    if (roll < 0.16) {
      this.placeCoins(this.safeLane, z, 6, 0.7);
      return;
    }
    if (roll < 0.28) {
      this.placeObstacle("ramp", this.safeLane, z);
      this.placeCoins(this.safeLane, z - 4, 5, 1.4);
      return;
    }
    if (roll < 0.36 && diff > 0.12) {
      this.placeObstacle("overhead", this.safeLane, z);
      this.placeCoins(this.safeLane, z + 2, 3, 0.55);
      return;
    }
    if (roll < 0.44) {
      this.placeBonus(z);
      this.placeCoins(this.safeLane, z - 6, 4, 0.7);
      return;
    }
    if (roll < 0.72 || diff < 0.2) {
      const lane = other[(this.rng() * other.length) | 0]!;
      const kinds: ObstacleKind[] = ["crate", "boulder", "barrier", "barrel", "cones"];
      this.placeObstacle(kinds[(this.rng() * kinds.length) | 0]!, lane, z);
      if (this.rng() < 0.45) this.placeCoins(this.safeLane, z, 4, 0.7);
      return;
    }
    this.placeObstacle("crate", other[0]!, z);
    this.placeObstacle(this.rng() < 0.5 ? "boulder" : "barrel", other[1]!, z);
    this.placeCoins(this.safeLane, z, 5, 0.7);
  }

  private placeObstacle(kind: ObstacleKind, lane: number, z: number) {
    const slot = this.obstacles.find((o) => !o.active && o.kind === kind) || this.obstacles.find((o) => !o.active);
    if (!slot) return;
    if (slot.kind !== kind) {
      this.world.remove(slot.mesh);
      slot.mesh = makeObstacle(kind);
      this.world.add(slot.mesh);
      slot.kind = kind;
      Object.assign(slot, hitbox(kind));
    }
    slot.active = true;
    slot.lane = lane;
    slot.z = z;
    slot.mesh.visible = true;
    slot.mesh.position.set(laneX(lane), 0, z);
  }

  private placeCoins(lane: number, z: number, n: number, y: number) {
    let placed = 0;
    for (const c of this.coins) {
      if (c.alive) continue;
      c.alive = true;
      c.collected = false;
      c.lane = lane;
      c.x = laneX(lane);
      c.y = y + (placed % 2 === 0 ? 0 : 0.15);
      c.z = z - placed * 1.7;
      placed++;
      if (placed >= n) break;
    }
  }

  private placeBonus(z: number) {
    const kinds: Pickup["kind"][] = ["magnet", "shield", "star"];
    const kind = kinds[(this.rng() * kinds.length) | 0]!;
    const slot = this.pickups.find((p) => !p.active && p.kind === kind) || this.pickups.find((p) => !p.active);
    if (!slot) return;
    slot.active = true;
    slot.kind = kind;
    slot.lane = this.safeLane;
    slot.z = z;
    slot.mesh.visible = true;
    slot.mesh.position.set(laneX(this.safeLane), 0, z);
  }

  private collide() {
    const px = this.laneSmooth;
    const pHalfW = 0.48;
    const py = this.y;
    const prevSpeed = this.speed;
    for (const o of this.obstacles) {
      if (!o.active) continue;
      const ox = laneX(o.lane);
      const half = o.d * 0.5;
      const prevZ = o.z - prevSpeed * (1 / 60);
      const zHit = prevZ - half < 1.05 && o.z + half > -0.85;
      if (!zHit) continue;
      if (Math.abs(px - ox) > pHalfW + o.w * 0.5 - 0.05) continue;
      if (o.ramp) {
        if (py < 0.55 && this.vy <= 2) {
          this.vy = RAMP_VY * CHAR_STATS[this.character].jumpMul;
          this.grounded = false;
          this.audio.jump();
        }
        continue;
      }
      if (o.overhead) {
        if (this.slideT > 0 || py > 0.85) continue;
        this.hit();
        continue;
      }
      if (isJumpable(o.kind) && py + 0.12 > o.h) continue;
      if (py > o.h + 0.12) continue;
      this.hit();
    }
  }

  private hit() {
    if (this.iFrames > 0 || this.phase !== "playing") return;
    if (this.shieldOn) {
      this.shieldOn = false;
      this.iFrames = 1.15;
      this.trauma = Math.min(1, this.trauma + 0.45);
      this.hitstop = 0.06;
      this.audio.crash();
      return;
    }
    this.phase = "dead";
    this.crashT = 0;
    this.trauma = 1;
    this.hitstop = 0.09;
    this.audio.crash();
    this.audio.setEngine(0, false);
    if (this.score > this.best) {
      this.best = this.score;
      this.save.best = this.best;
      writeSave(this.save);
    }
    this.pushHud(true);
  }

  private collect() {
    const mag = this.magnetT > 0 ? 3.4 * CHAR_STATS[this.character].magnetMul : 0.95;
    const magZ = this.magnetT > 0 ? 11 : 1.3;
    for (const c of this.coins) {
      if (!c.alive || c.collected) continue;
      const dx = c.x - this.laneSmooth;
      if (this.magnetT > 0 && Math.abs(c.z) < magZ && Math.abs(dx) < mag + 2.2) {
        c.x = expDamp(c.x, this.laneSmooth, 10, 1 / 60);
        c.z = expDamp(c.z, 0.2, 8, 1 / 60);
        c.y = expDamp(c.y, 0.9 + this.y, 8, 1 / 60);
      }
      if (Math.abs(c.z) < 1.15 && Math.abs(c.x - this.laneSmooth) < mag && this.y < c.y + 1.1) {
        c.collected = true;
        c.alive = false;
        this.coinsN += 1;
        this.audio.coin();
      }
    }
    for (const p of this.pickups) {
      if (!p.active) continue;
      if (Math.abs(p.z) > 1.2) continue;
      if (Math.abs(laneX(p.lane) - this.laneSmooth) > 1.05) continue;
      p.active = false;
      p.mesh.visible = false;
      this.audio.bonus();
      if (p.kind === "magnet") this.magnetT = 7.5;
      if (p.kind === "shield") {
        this.shieldOn = true;
        this.iFrames = Math.max(this.iFrames, 0.4);
      }
      if (p.kind === "star") this.multiT = 8.5;
    }
  }

  private visual(dt: number) {
    const lean = clamp((this.laneSmooth - laneX(this.lane)) * -0.35, -1, 1);
    const hop =
      this.phase === "intro" ? Math.sin(smoothstep(this.introT / 0.42) * Math.PI) * 0.55 : 0;
    const seated = this.phase === "menu" ? 0 : this.phase === "intro" ? this.seated : 1;
    this.rider.pose(seated, lean + this.world.position.x * 0.02, this.time, this.y * 0.2, this.slideT > 0 ? 1 : 0);
    if (this.phase === "intro") this.rider.group.position.y += hop;
    this.player.position.y = this.phase === "menu" || this.phase === "intro" ? hop * 0 : this.y;
    if (this.phase === "intro") this.player.position.y = 0;
    this.menuSet.visible = this.phase === "menu";
    if (this.phase === "intro" && this.introT > 0.12) this.menuSet.visible = false;

    const bankSrc = this.phase === "playing" ? -this.world.position.x * 0.04 : 0;
    const bank = this.reduce ? bankSrc * 0.2 : bankSrc;
    this.world.rotation.z = expDamp(this.world.rotation.z, clamp(bank, -0.12, 0.12), 8, dt);

    this.quad.bob(this.time, this.speed, this.y);
    this.shadowBlob.position.x = this.player.position.x;
    this.shadowBlob.position.z = this.player.position.z;
    const so = this.y > 0.05 ? clamp(1 - this.y / 4, 0.08, 1) : 1;
    (this.shadowBlob.material as THREE.MeshBasicMaterial).opacity = 0.28 * so;
    this.shadowBlob.scale.setScalar(1.15 + this.y * 0.25);

    this.shieldRing.position.y = 0.85;
    const sm = this.shieldRing.material as THREE.MeshBasicMaterial;
    sm.opacity = this.shieldOn ? 0.55 + Math.sin(this.time * 8) * 0.12 : 0;
    this.shieldRing.visible = this.shieldOn;
    this.shieldRing.rotation.z = this.time * 1.4;

    this.trauma = Math.max(0, this.trauma - dt * 1.8);
    this.writeInstances(this.time);
    this.applyBiome(dt);
    this.weather.update(dt, this.camera, this.speed);
    this.updateCamera(dt);
    this.sky.mesh.position.copy(this.camera.position);
  }

  private writeInstances(t: number) {
    const halfRoad = ROAD_WIDTH * 0.5;
    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const z = this.segs[i]!;
      DUMMY.position.set(0, 0, z);
      DUMMY.rotation.set(0, 0, 0);
      DUMMY.scale.set(1, 1, 1);
      DUMMY.updateMatrix();
      this.roadMesh.setMatrixAt(i, DUMMY.matrix);
      DUMMY.position.set(-(halfRoad + 18), -0.02, z);
      DUMMY.updateMatrix();
      this.groundL.setMatrixAt(i, DUMMY.matrix);
      DUMMY.position.set(halfRoad + 18, -0.02, z);
      DUMMY.updateMatrix();
      this.groundR.setMatrixAt(i, DUMMY.matrix);
    }
    this.roadMesh.instanceMatrix.needsUpdate = true;
    this.groundL.instanceMatrix.needsUpdate = true;
    this.groundR.instanceMatrix.needsUpdate = true;

    const { a, b, t: bt } = this.biomeBlend();
    for (let i = 0; i < this.trees.length; i++) {
      const tr = this.trees[i]!;
      DUMMY.position.set(tr.x, 0, tr.z);
      DUMMY.rotation.set(0, tr.ry, 0);
      DUMMY.scale.set(tr.s, tr.s, tr.s);
      DUMMY.updateMatrix();
      this.needles.setMatrixAt(i, DUMMY.matrix);
      this.trunks.setMatrixAt(i, DUMMY.matrix);
      const snow = lerp(a.weather === "snow" ? 1 : 0, b.weather === "snow" ? 1 : 0, bt);
      _color.setHex(i % 3 === 0 ? 0x2a4a30 : i % 3 === 1 ? 0x335238 : 0x243e2a);
      _color2.set(0xd8e4dc);
      _color.lerp(_color2, snow);
      this.needles.setColorAt(i, _color);
    }
    this.needles.instanceMatrix.needsUpdate = true;
    this.trunks.instanceMatrix.needsUpdate = true;
    if (this.needles.instanceColor) this.needles.instanceColor.needsUpdate = true;

    for (let i = 0; i < this.bushItems.length; i++) {
      const bu = this.bushItems[i]!;
      DUMMY.position.set(bu.x, 0, bu.z);
      DUMMY.rotation.set(0, bu.ry, 0);
      DUMMY.scale.set(bu.s, bu.s, bu.s);
      DUMMY.updateMatrix();
      this.bushes.setMatrixAt(i, DUMMY.matrix);
      const snow = lerp(a.weather === "snow" ? 1 : 0, b.weather === "snow" ? 1 : 0, bt);
      _color.setHex(i % 2 === 0 ? 0x3a5a32 : 0x2e4a28);
      _color2.set(0xc8d8cc);
      _color.lerp(_color2, snow);
      this.bushes.setColorAt(i, _color);
    }
    this.bushes.instanceMatrix.needsUpdate = true;
    if (this.bushes.instanceColor) this.bushes.instanceColor.needsUpdate = true;

    for (let i = 0; i < this.rockItems.length; i++) {
      const r = this.rockItems[i]!;
      DUMMY.position.set(r.x, 0.22 * r.s, r.z);
      DUMMY.rotation.set(0.1, r.ry, 0);
      DUMMY.scale.set(r.s, r.s * 0.8, r.s);
      DUMMY.updateMatrix();
      this.rocks.setMatrixAt(i, DUMMY.matrix);
    }
    this.rocks.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < this.coins.length; i++) {
      const c = this.coins[i]!;
      if (!c.alive) {
        DUMMY.position.set(0, -8, 40);
        DUMMY.scale.set(0, 0, 0);
      } else {
        DUMMY.position.set(c.x, c.y + Math.sin(t * 5 + i) * 0.08, c.z);
        DUMMY.rotation.set(0, t * 2.8 + i, 0.4);
        DUMMY.scale.set(1, 1, 1);
      }
      DUMMY.updateMatrix();
      this.coinsMesh.setMatrixAt(i, DUMMY.matrix);
    }
    this.coinsMesh.instanceMatrix.needsUpdate = true;
  }

  private applyBiome(_dt: number) {
    const { a, b, t } = this.biomeBlend();
    const fogC = new THREE.Color(a.fog).lerp(new THREE.Color(b.fog), t);
    this.fog.color.copy(fogC);
    this.fog.near = lerp(a.fogNear, b.fogNear, t);
    this.fog.far = lerp(a.fogFar, b.fogFar, t);
    this.hemi.color.lerpColors(new THREE.Color(a.hemiSky), new THREE.Color(b.hemiSky), t);
    this.hemi.groundColor.lerpColors(new THREE.Color(a.hemiGround), new THREE.Color(b.hemiGround), t);
    this.hemi.intensity = lerp(a.hemiInt, b.hemiInt, t);
    this.sun.color.lerpColors(new THREE.Color(a.sun), new THREE.Color(b.sun), t);
    this.sun.intensity = lerp(a.sunInt, b.sunInt, t) + this.weather.lightning * 3.5;
    _dirA.set(...a.sunDir).normalize();
    _dirB.set(...b.sunDir).normalize();
    _dirA.lerp(_dirB, t).normalize();
    this.sun.position.copy(_dirA).multiplyScalar(48);
    this.sun.target.position.set(0, 0, -20);

    this.sky.uniforms.uTop.value.lerpColors(new THREE.Color(a.skyTop), new THREE.Color(b.skyTop), t);
    this.sky.uniforms.uHorizon.value.lerpColors(
      new THREE.Color(a.skyHorizon),
      new THREE.Color(b.skyHorizon),
      t,
    );
    this.sky.uniforms.uSun.value.copy(_dirA);
    this.sky.uniforms.uSunColor.value.lerpColors(new THREE.Color(a.sunColor), new THREE.Color(b.sunColor), t);
    this.sky.uniforms.uSunSize.value = lerp(a.night ? 0.006 : 0.018, b.night ? 0.006 : 0.018, t);

    this.groundMat.color.lerpColors(new THREE.Color(a.ground), new THREE.Color(b.ground), t);
    this.roadMat.color.lerpColors(new THREE.Color(a.road), new THREE.Color(b.road), t);
    const wet = (a.weather === "rain" || a.weather === "hail" ? 1 - t : 0) + (b.weather === "rain" || b.weather === "hail" ? t : 0);
    this.roadMat.roughness = lerp(0.84, 0.22, wet);
    this.roadMat.metalness = lerp(0.03, 0.18, wet);

    const w = t > 0.5 ? b.weather : a.weather;
    if (w !== this.weatherId) {
      this.weatherId = w;
      this.weather.setKind(w);
      this.audio.setWeather(this.phase === "playing" || this.phase === "intro" ? w : "off");
    }
    this.biomeName = t > 0.5 ? b.name : a.name;
    this.biomeT = t;
    this.quad.setLights(this.phase !== "menu", (t > 0.5 ? b : a).night);
    this.renderer.toneMappingExposure = lerp(a.night ? 0.86 : 1.08, b.night ? 0.86 : 1.08, t);
  }

  private updateCamera(dt: number) {
    const shake = this.trauma * this.trauma;
    const sx = (Math.random() - 0.5) * shake * 0.35;
    const sy = (Math.random() - 0.5) * shake * 0.22;
    if (this.phase === "menu" || (this.phase === "intro" && this.introT < 0.28)) {
      const wob = this.reduce ? 0 : 1;
      const cam = this.menuCam();
      _desired.copy(cam.pos);
      _desired.x += Math.sin(this.time * 0.22) * 0.12 * wob;
      _desired.y += Math.sin(this.time * 0.19) * 0.04 * wob;
      _desired.z += Math.cos(this.time * 0.17) * 0.08 * wob;
      _look.copy(cam.look);
      this.camera.fov = expDamp(this.camera.fov, cam.fov, 6, dt);
      this.camera.updateProjectionMatrix();
      const k = this.time < 0.05 ? 40 : 3.2;
      this.camera.position.x = expDamp(this.camera.position.x, _desired.x, k, dt);
      this.camera.position.y = expDamp(this.camera.position.y, _desired.y, k, dt);
      this.camera.position.z = expDamp(this.camera.position.z, _desired.z, k, dt);
      this.camera.lookAt(_look);
      return;
    }
    const spd = this.speed / MAX_SPEED;
    this.camera.fov = expDamp(this.camera.fov, 52 + spd * 8, 3.4, dt);
    this.camera.updateProjectionMatrix();
    _desired.set(sx * 0.35, 1.85 + spd * 0.22 + this.y * 0.28, 3.75 + spd * 0.36);
    _look.set(0, 0.68 + this.y * 0.35, -2.55);
    const k = this.phase === "intro" ? 5.5 : 8.5;
    this.camera.position.x = expDamp(this.camera.position.x, _desired.x, k, dt);
    this.camera.position.y = expDamp(this.camera.position.y, _desired.y, k, dt);
    this.camera.position.z = expDamp(this.camera.position.z, _desired.z, k, dt);
    this.camera.lookAt(_look);
    const bank = clamp(-this.world.position.x * 0.05, -0.12, 0.12);
    this.camera.rotateZ(this.reduce ? 0 : -bank);
  }

  private handleMenuTap() {
    const tap = this.input.popTap();
    if (!tap) return;
    this.startFromMenu();
  }

  private pushHud(force: boolean) {
    void force;
    const state: HudState = {
      phase: this.phase,
      score: this.score,
      coins: this.coinsN,
      best: this.best,
      speedKmh: Math.round(this.speed * 3.6),
      weather: this.weatherId,
      biome: this.biomeName || BIOME_LABEL[this.weatherId],
      character: this.character,
      multiplier: this.multiT > 0 ? 2 : 1,
      shield: this.shieldOn,
      magnet: this.magnetT > 0,
      muted: this.muted,
      tutorial: this.tutorial && this.phase === "menu",
    };
    this.onHud(state);
  }

  private bindControlsTest() {
    window.__controlsTest = {
      getYaw: () => -this.laneSmooth * 0.22,
      getSpeed: () => this.speed,
      getPhase: () => this.phase,
      getPlayer: () => ({
        x: this.player.position.x,
        y: this.player.position.y,
        z: this.player.position.z,
        cx: this.camera.position.x,
        cy: this.camera.position.y,
        cz: this.camera.position.z,
      }),
      setKeys: (codes: string[]) => {
        if (this.phase === "menu" && codes.includes("KeyW")) this.startFromMenu();
        this.input.setKeys(codes);
      },
      setSteer: (v: number) => {
        if (v > 0.5) this.pendingLeft = true;
        if (v < -0.5) this.pendingRight = true;
      },
    };
  }
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setKeys?: (codes: string[]) => void;
      setSteer?: (v: number) => void;
      getPhase?: () => string;
      getPlayer?: () => { x: number; y: number; z: number; cx: number; cy: number; cz: number };
    };
    __gameReady?: boolean;
  }
}

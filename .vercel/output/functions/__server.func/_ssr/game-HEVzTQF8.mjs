import { t as BIOME_LABEL } from "./types-CclHiIqA.mjs";
import { A as Points, C as MeshBasicMaterial, D as PerspectiveCamera, E as OctahedronGeometry, F as ShaderMaterial, I as SphereGeometry, L as SpotLight, M as RepeatWrapping, N as SRGBColorSpace, O as PlaneGeometry, P as Scene, R as TorusGeometry, S as Mesh, T as Object3D, _ as Group, a as BufferAttribute, b as InstancedBufferAttribute, c as CapsuleGeometry, d as Color, f as ConeGeometry, g as Fog, h as DynamicDrawUsage, i as BoxGeometry, j as PointsMaterial, k as PointLight, l as CircleGeometry, m as DirectionalLight, n as RoundedBoxGeometry, o as BufferGeometry, p as CylinderGeometry, r as WebGLRenderer, s as CanvasTexture, t as mergeGeometries, u as ClampToEdgeWrapping, v as HemisphereLight, w as MeshStandardMaterial, x as InstancedMesh, y as IcosahedronGeometry, z as Vector3 } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/game-HEVzTQF8.js
var LANE_WIDTH = 3.35;
var ROAD_WIDTH = 11.15;
var SPEED_GAIN = .012;
var JUMP_VY = 13.4;
var RAMP_VY = 18.2;
var SLIDE_TIME = .62;
var COYOTE = .1;
var JUMP_BUFFER = .12;
var SAVE_KEY = "zverotrassa-v1";
var CHAR_STATS = {
	fox: {
		speedMul: 1.07,
		jumpMul: 1,
		magnetMul: 1
	},
	wolf: {
		speedMul: 1,
		jumpMul: 1,
		magnetMul: 1.55
	},
	hare: {
		speedMul: .98,
		jumpMul: 1.24,
		magnetMul: 1
	}
};
function clamp(v, a, b) {
	return Math.max(a, Math.min(b, v));
}
function lerp(a, b, t) {
	return a + (b - a) * t;
}
function smoothstep(t) {
	const x = clamp(t, 0, 1);
	return x * x * (3 - 2 * x);
}
function easeOutCubic(t) {
	const x = 1 - clamp(t, 0, 1);
	return 1 - x * x * x;
}
function expDamp(cur, tgt, lambda, dt) {
	return tgt + (cur - tgt) * Math.exp(-lambda * dt);
}
function rand(min, max) {
	return min + Math.random() * (max - min);
}
function laneX(lane) {
	return lane * LANE_WIDTH;
}
function mulberry(seed) {
	let s = seed | 0 || 1;
	return () => {
		s = Math.imul(s, 1664525) + 1013904223 | 0;
		return (s >>> 0) / 4294967296;
	};
}
var GAME_CODES = /* @__PURE__ */ new Set([
	"KeyW",
	"KeyA",
	"KeyS",
	"KeyD",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"Space",
	"Escape",
	"Enter",
	"KeyP"
]);
var Input = class {
	el;
	keys = /* @__PURE__ */ new Set();
	prev = /* @__PURE__ */ new Set();
	inject = [];
	injectEdge = /* @__PURE__ */ new Set();
	swipeLeft = false;
	swipeRight = false;
	swipeUp = false;
	swipeDown = false;
	tap = false;
	pointerId = null;
	startX = 0;
	startY = 0;
	lastX = 0;
	lastY = 0;
	moved = false;
	tapX = 0;
	tapY = 0;
	enabled = true;
	onUnlock;
	constructor(el) {
		this.el = el;
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onPointerDown = this.onPointerDown.bind(this);
		this.onPointerMove = this.onPointerMove.bind(this);
		this.onPointerUp = this.onPointerUp.bind(this);
		window.addEventListener("keydown", this.onKeyDown);
		window.addEventListener("keyup", this.onKeyUp);
		window.addEventListener("blur", this.onBlur);
		document.addEventListener("visibilitychange", this.onBlur);
		el.addEventListener("pointerdown", this.onPointerDown);
		el.addEventListener("pointermove", this.onPointerMove);
		el.addEventListener("pointerup", this.onPointerUp);
		el.addEventListener("pointercancel", this.onPointerUp);
	}
	dispose() {
		window.removeEventListener("keydown", this.onKeyDown);
		window.removeEventListener("keyup", this.onKeyUp);
		window.removeEventListener("blur", this.onBlur);
		document.removeEventListener("visibilitychange", this.onBlur);
		this.el.removeEventListener("pointerdown", this.onPointerDown);
		this.el.removeEventListener("pointermove", this.onPointerMove);
		this.el.removeEventListener("pointerup", this.onPointerUp);
		this.el.removeEventListener("pointercancel", this.onPointerUp);
	}
	setKeys(codes) {
		const prev = new Set(this.inject);
		this.inject = codes.slice();
		this.injectEdge.clear();
		for (const c of this.inject) if (!prev.has(c)) this.injectEdge.add(c);
	}
	popTap() {
		if (!this.tap) return null;
		this.tap = false;
		return {
			x: this.tapX,
			y: this.tapY
		};
	}
	sample() {
		const has = (c) => this.keys.has(c) || this.inject.includes(c);
		const edge = (c) => !this.prev.has(c) && this.keys.has(c) || this.injectEdge.has(c);
		const leftHeld = has("KeyA") || has("ArrowLeft");
		const rightHeld = has("KeyD") || has("ArrowRight");
		const jumpHeld = has("KeyW") || has("ArrowUp") || has("Space");
		const slideHeld = has("KeyS") || has("ArrowDown");
		const startHeld = has("Enter");
		const pauseHeld = has("Escape") || has("KeyP");
		const leftPressed = edge("KeyA") || edge("ArrowLeft") || this.swipeLeft;
		const rightPressed = edge("KeyD") || edge("ArrowRight") || this.swipeRight;
		const jumpPressed = edge("KeyW") || edge("ArrowUp") || edge("Space") || this.swipeUp;
		const slidePressed = edge("KeyS") || edge("ArrowDown") || this.swipeDown;
		const startPressed = edge("Enter") || edge("Space");
		const pausePressed = edge("Escape") || edge("KeyP");
		this.prev = new Set(this.keys);
		this.injectEdge.clear();
		this.swipeLeft = this.swipeRight = this.swipeUp = this.swipeDown = false;
		return {
			left: leftHeld,
			right: rightHeld,
			jump: jumpHeld,
			slide: slideHeld,
			start: startHeld,
			pause: pauseHeld,
			leftPressed,
			rightPressed,
			jumpPressed,
			slidePressed,
			startPressed,
			pausePressed
		};
	}
	onKeyDown(e) {
		this.onUnlock?.();
		if (!this.enabled) return;
		if (GAME_CODES.has(e.code)) e.preventDefault();
		this.keys.add(e.code);
	}
	onKeyUp(e) {
		this.keys.delete(e.code);
	}
	onBlur() {
		this.keys.clear();
	}
	onPointerDown(e) {
		this.onUnlock?.();
		if (!this.enabled) return;
		if (e.target?.closest?.("button, a, [data-ui]")) return;
		if (this.pointerId !== null) return;
		this.pointerId = e.pointerId;
		this.startX = this.lastX = e.clientX;
		this.startY = this.lastY = e.clientY;
		this.moved = false;
		try {
			this.el.setPointerCapture(e.pointerId);
		} catch {}
	}
	onPointerMove(e) {
		if (e.pointerId !== this.pointerId) return;
		this.lastX = e.clientX;
		this.lastY = e.clientY;
		if (Math.hypot(e.clientX - this.startX, e.clientY - this.startY) > 14) this.moved = true;
	}
	onPointerUp(e) {
		if (e.pointerId !== this.pointerId) return;
		const dx = this.lastX - this.startX;
		const dy = this.lastY - this.startY;
		const ax = Math.abs(dx);
		const ay = Math.abs(dy);
		if (this.moved && (ax > 36 || ay > 36)) {
			if (ax > ay) {
				if (dx < 0) this.swipeLeft = true;
				else this.swipeRight = true;
			} else if (dy < 0) this.swipeUp = true;
			else this.swipeDown = true;
		} else if (!this.moved) {
			this.tap = true;
			this.tapX = this.startX;
			this.tapY = this.startY;
		}
		this.pointerId = null;
	}
};
var AudioEngine = class {
	ctx = null;
	master = null;
	sfx = null;
	engineGain = null;
	engineOsc = null;
	engineOsc2 = null;
	noiseGain = null;
	weatherGain = null;
	weatherSrc = null;
	weatherFilter = null;
	noiseBuf = null;
	muted = false;
	unlocked = false;
	unlock() {
		if (this.unlocked && this.ctx?.state === "running") return;
		this.ensure();
		this.ctx?.resume();
		this.unlocked = true;
	}
	resume() {
		if (this.ctx?.state === "suspended") this.ctx.resume();
	}
	setMuted(v) {
		this.muted = v;
		this.ensure();
		this.master?.gain.setTargetAtTime(v ? 0 : 1, this.now(), .04);
	}
	setEngine(speed01, on) {
		this.ensure();
		if (!this.engineGain || !this.engineOsc || !this.engineOsc2 || !this.noiseGain) return;
		const t = this.now();
		if (!on) {
			this.engineGain.gain.setTargetAtTime(0, t, .08);
			this.noiseGain.gain.setTargetAtTime(0, t, .08);
			return;
		}
		const f = 42 + speed01 * 88;
		this.engineOsc.frequency.setTargetAtTime(f, t, .05);
		this.engineOsc2.frequency.setTargetAtTime(f * 2.02, t, .05);
		this.engineGain.gain.setTargetAtTime(.05 + speed01 * .07, t, .08);
		this.noiseGain.gain.setTargetAtTime(.018 + speed01 * .03, t, .08);
	}
	setWeather(kind) {
		this.ensure();
		if (!this.weatherGain || !this.weatherFilter || !this.ctx) return;
		const t = this.now();
		if (kind === "off" || kind === "sun") {
			this.weatherGain.gain.setTargetAtTime(0, t, .3);
			return;
		}
		if (kind === "rain") {
			this.weatherFilter.frequency.setTargetAtTime(1800, t, .2);
			this.weatherFilter.Q.setTargetAtTime(.4, t, .2);
			this.weatherGain.gain.setTargetAtTime(.045, t, .25);
		} else if (kind === "snow") {
			this.weatherFilter.frequency.setTargetAtTime(900, t, .2);
			this.weatherFilter.Q.setTargetAtTime(.2, t, .2);
			this.weatherGain.gain.setTargetAtTime(.03, t, .25);
		} else {
			this.weatherFilter.frequency.setTargetAtTime(3200, t, .2);
			this.weatherFilter.Q.setTargetAtTime(.7, t, .2);
			this.weatherGain.gain.setTargetAtTime(.055, t, .25);
		}
	}
	whoosh() {
		this.blip(180, 90, .09, .07, "highpass");
	}
	jump() {
		this.blip(420, 140, .14, .08, "sine");
	}
	land() {
		this.noiseBurst(.08, .05, 240);
	}
	coin() {
		this.ping(880, .07);
		this.ping(1320, .06, .04);
	}
	bonus() {
		this.ping(520, .1);
		this.ping(780, .1, .05);
		this.ping(1040, .12, .1);
	}
	crash() {
		this.noiseBurst(.28, .22, 140);
		this.blip(110, 40, .22, .16, "sawtooth");
	}
	dispose() {
		try {
			this.engineOsc?.stop();
			this.engineOsc2?.stop();
			this.weatherSrc?.stop();
		} catch {}
		this.ctx?.close();
		this.ctx = null;
	}
	ensure() {
		if (this.ctx) return;
		const Ctx = window.AudioContext || window.webkitAudioContext;
		this.ctx = new Ctx({ latencyHint: "interactive" });
		this.master = this.ctx.createGain();
		this.sfx = this.ctx.createGain();
		this.sfx.gain.value = .9;
		this.sfx.connect(this.master);
		this.master.connect(this.ctx.destination);
		this.master.gain.value = this.muted ? 0 : 1;
		this.noiseBuf = this.makeNoise(1);
		this.engineOsc = this.ctx.createOscillator();
		this.engineOsc.type = "sawtooth";
		this.engineOsc.frequency.value = 50;
		this.engineOsc2 = this.ctx.createOscillator();
		this.engineOsc2.type = "square";
		this.engineOsc2.frequency.value = 100;
		const engFilter = this.ctx.createBiquadFilter();
		engFilter.type = "lowpass";
		engFilter.frequency.value = 420;
		this.engineGain = this.ctx.createGain();
		this.engineGain.gain.value = 0;
		this.engineOsc.connect(engFilter);
		this.engineOsc2.connect(engFilter);
		engFilter.connect(this.engineGain);
		this.engineGain.connect(this.master);
		const nsrc = this.ctx.createBufferSource();
		nsrc.buffer = this.noiseBuf;
		nsrc.loop = true;
		const nfilter = this.ctx.createBiquadFilter();
		nfilter.type = "lowpass";
		nfilter.frequency.value = 500;
		this.noiseGain = this.ctx.createGain();
		this.noiseGain.gain.value = 0;
		nsrc.connect(nfilter);
		nfilter.connect(this.noiseGain);
		this.noiseGain.connect(this.master);
		this.weatherFilter = this.ctx.createBiquadFilter();
		this.weatherFilter.type = "bandpass";
		this.weatherFilter.frequency.value = 1600;
		this.weatherGain = this.ctx.createGain();
		this.weatherGain.gain.value = 0;
		this.weatherSrc = this.ctx.createBufferSource();
		this.weatherSrc.buffer = this.noiseBuf;
		this.weatherSrc.loop = true;
		this.weatherSrc.connect(this.weatherFilter);
		this.weatherFilter.connect(this.weatherGain);
		this.weatherGain.connect(this.master);
		this.engineOsc.start();
		this.engineOsc2.start();
		nsrc.start();
		this.weatherSrc.start();
	}
	now() {
		return this.ctx?.currentTime ?? 0;
	}
	makeNoise(seconds) {
		const ctx = this.ctx;
		const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
		const data = buf.getChannelData(0);
		for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
		return buf;
	}
	ping(freq, dur, delay = 0) {
		this.ensure();
		if (!this.ctx || !this.sfx) return;
		const t = this.now() + delay;
		const osc = this.ctx.createOscillator();
		osc.type = "sine";
		osc.frequency.setValueAtTime(freq, t);
		osc.frequency.exponentialRampToValueAtTime(freq * .7, t + dur);
		const g = this.ctx.createGain();
		g.gain.setValueAtTime(1e-4, t);
		g.gain.exponentialRampToValueAtTime(.12, t + .01);
		g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
		osc.connect(g);
		g.connect(this.sfx);
		osc.start(t);
		osc.stop(t + dur + .02);
		osc.onended = () => {
			osc.disconnect();
			g.disconnect();
		};
	}
	blip(from, to, dur, vol, type) {
		this.ensure();
		if (!this.ctx || !this.sfx) return;
		const t = this.now();
		if (type === "highpass") {
			const src = this.ctx.createBufferSource();
			src.buffer = this.noiseBuf;
			const f = this.ctx.createBiquadFilter();
			f.type = "highpass";
			f.frequency.value = from;
			const g = this.ctx.createGain();
			g.gain.setValueAtTime(vol, t);
			g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
			src.connect(f);
			f.connect(g);
			g.connect(this.sfx);
			src.start(t);
			src.stop(t + dur);
			src.onended = () => {
				src.disconnect();
				f.disconnect();
				g.disconnect();
			};
			return;
		}
		const osc = this.ctx.createOscillator();
		osc.type = type;
		osc.frequency.setValueAtTime(from, t);
		osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), t + dur);
		const g = this.ctx.createGain();
		g.gain.setValueAtTime(vol, t);
		g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
		osc.connect(g);
		g.connect(this.sfx);
		osc.start(t);
		osc.stop(t + dur);
		osc.onended = () => {
			osc.disconnect();
			g.disconnect();
		};
	}
	noiseBurst(dur, vol, cutoff) {
		this.ensure();
		if (!this.ctx || !this.sfx || !this.noiseBuf) return;
		const t = this.now();
		const src = this.ctx.createBufferSource();
		src.buffer = this.noiseBuf;
		const f = this.ctx.createBiquadFilter();
		f.type = "lowpass";
		f.frequency.setValueAtTime(cutoff * 3, t);
		f.frequency.exponentialRampToValueAtTime(cutoff, t + dur);
		const g = this.ctx.createGain();
		g.gain.setValueAtTime(vol, t);
		g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
		src.connect(f);
		f.connect(g);
		g.connect(this.sfx);
		src.start(t);
		src.stop(t + dur);
		src.onended = () => {
			src.disconnect();
			f.disconnect();
			g.disconnect();
		};
	}
};
function hash(x, y) {
	const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
	return n - Math.floor(n);
}
function noise(x, y) {
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
function fbm(x, y) {
	return noise(x, y) * .55 + noise(x * 2.1, y * 2.1) * .3 + noise(x * 4.3, y * 4.3) * .15;
}
function canvasTex(size, paint, wrap = true) {
	const c = document.createElement("canvas");
	c.width = c.height = size;
	paint(c.getContext("2d"), size);
	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	tex.anisotropy = 8;
	tex.wrapS = tex.wrapT = wrap ? RepeatWrapping : ClampToEdgeWrapping;
	tex.needsUpdate = true;
	return tex;
}
function makeRoadTexture() {
	return canvasTex(1024, (ctx, s) => {
		const img = ctx.createImageData(s, s);
		const d = img.data;
		for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
			const n = fbm(x * .07, y * .07);
			const n2 = noise(x * .4, y * .4);
			const base = 28 + n * 18 + n2 * 8;
			const i = (y * s + x) * 4;
			d[i] = base + 4;
			d[i + 1] = base;
			d[i + 2] = base - 2;
			d[i + 3] = 255;
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
			const x = hash(i, 9) * s | 0;
			const y = hash(i, 3) * s | 0;
			ctx.fillRect(x, y, 18 + hash(i, 1) * 40, 2);
		}
	});
}
function makeGroundTexture(kind) {
	return canvasTex(512, (ctx, s) => {
		const img = ctx.createImageData(s, s);
		const d = img.data;
		for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
			const n = fbm(x * .045, y * .045);
			const n2 = noise(x * .2, y * .2);
			let r = 0, g = 0, b = 0;
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
		ctx.putImageData(img, 0, 0);
	});
}
function mat(color, opts) {
	return new MeshStandardMaterial({
		color,
		roughness: opts?.roughness ?? .74,
		metalness: opts?.metalness ?? .06,
		emissive: opts?.emissive ?? 0,
		emissiveIntensity: opts?.emi ?? 0,
		flatShading: opts?.flat ?? false
	});
}
function add(parent, geo, material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
	const m = new Mesh(geo, material);
	m.position.set(x, y, z);
	m.rotation.set(rx, ry, rz);
	m.scale.set(sx, sy, sz);
	m.castShadow = true;
	m.receiveShadow = true;
	parent.add(m);
	return m;
}
var PAL = {
	fox: {
		fur: 13920298,
		dark: 1708558,
		light: 15785156,
		jacket: 3811356,
		iris: 15245328,
		ear: 14717048,
		accent: 12868904,
		socks: 1840144
	},
	wolf: {
		fur: 9081500,
		dark: 2369584,
		light: 15002352,
		jacket: 1711652,
		iris: 13934616,
		ear: 12890272,
		accent: 6976384,
		socks: 3817544
	},
	hare: {
		fur: 13938832,
		dark: 3811868,
		light: 16183012,
		jacket: 3820082,
		iris: 2759698,
		ear: 15515824,
		accent: 13213818,
		socks: 15787736
	}
};
function createRider(id) {
	const p = PAL[id];
	const g = new Group();
	g.name = `rider-${id}`;
	const fur = mat(p.fur, { roughness: .92 });
	const dark = mat(p.dark, { roughness: .5 });
	const light = mat(p.light, { roughness: .88 });
	const jacket = mat(p.jacket, {
		roughness: .58,
		metalness: .14
	});
	const iris = mat(p.iris, {
		roughness: .28,
		metalness: .25,
		emissive: p.iris,
		emi: .18
	});
	const earIn = mat(p.ear, { roughness: .82 });
	const eyeWhite = mat(16184042, { roughness: .32 });
	const nose = mat(1182216, { roughness: .28 });
	const boot = mat(1709586, {
		roughness: .48,
		metalness: .1
	});
	const glove = mat(2892828, { roughness: .52 });
	const socks = mat(p.socks, { roughness: .86 });
	const lens = mat(1714224, {
		roughness: .08,
		metalness: .7,
		emissive: 661536,
		emi: .25
	});
	const strap = mat(1710102, {
		roughness: .45,
		metalness: .2
	});
	const zip = mat(12103844, {
		roughness: .35,
		metalness: .55
	});
	const sph = new SphereGeometry(1, 18, 14);
	const cap = new CapsuleGeometry(1, 1, 6, 12);
	const cone = new ConeGeometry(1, 1, 12);
	const hip = new Group();
	hip.position.y = .62;
	g.add(hip);
	add(hip, sph, fur, 0, .02, .02, 0, 0, 0, .22, .16, .18);
	const torso = new Group();
	torso.position.y = .2;
	hip.add(torso);
	add(torso, cap, fur, 0, .1, 0, 0, 0, 0, .16, .22, .14);
	add(torso, cap, jacket, 0, .14, .02, .08, 0, 0, .185, .22, .155);
	add(torso, sph, jacket, 0, .26, .02, 0, 0, 0, .17, .11, .15);
	add(torso, sph, light, 0, .02, .14, 0, 0, 0, .12, .15, .06);
	add(torso, new TorusGeometry(.13, .028, 8, 16), jacket, 0, .3, .02, Math.PI / 2, 0, 0);
	add(torso, new BoxGeometry(.02, .22, .01), zip, 0, .12, .17);
	add(torso, sph, dark, 0, 0, .02, 0, 0, 0, .2, .05, .16);
	add(torso, cap, fur, 0, .34, .02, 0, 0, 0, .075, .09, .075);
	const head = new Group();
	head.position.set(0, .46, .04);
	torso.add(head);
	const headW = id === "wolf" ? .205 : id === "hare" ? .18 : .195;
	const headH = id === "wolf" ? .185 : id === "hare" ? .175 : .18;
	add(head, sph, fur, 0, .02, -.01, 0, 0, 0, headW, headH, .18);
	add(head, sph, fur, 0, 0, .05, 0, 0, 0, headW * .92, headH * .9, .16);
	add(head, sph, light, 0, -.02, .07, 0, 0, 0, .13, .11, .11);
	add(head, sph, fur, -.11, 0, .02, 0, 0, 0, .075, .07, .075);
	add(head, sph, fur, .11, 0, .02, 0, 0, 0, .075, .07, .075);
	const snoutLen = id === "wolf" ? .22 : id === "hare" ? .09 : .16;
	add(head, sph, light, 0, -.03, .13, 0, 0, 0, .095, .075, snoutLen * .75);
	add(head, sph, light, 0, -.035, .13 + snoutLen * .45, 0, 0, 0, .058, .048, snoutLen * .48);
	add(head, sph, nose, 0, -.04, .14 + snoutLen * .72, 0, 0, 0, .034, .028, .04);
	add(head, sph, dark, -.014, -.055, .12 + snoutLen * .35, 0, 0, 0, .013, .009, .02);
	add(head, sph, dark, .014, -.055, .12 + snoutLen * .35, 0, 0, 0, .013, .009, .02);
	const browY = id === "wolf" ? .075 : .058;
	add(head, sph, dark, -.072, browY, .13, 0, 0, .15, .05, .02, .032);
	add(head, sph, dark, .072, browY, .13, 0, 0, -.15, .05, .02, .032);
	const eye = (x) => {
		const eg = new Group();
		eg.position.set(x, .038, .14);
		head.add(eg);
		add(eg, sph, eyeWhite, 0, 0, 0, 0, 0, 0, .045, .05, .03);
		add(eg, sph, iris, x > 0 ? -.004 : .004, 0, .016, 0, 0, 0, .028, .032, .02);
		add(eg, sph, dark, x > 0 ? -.004 : .004, 0, .028, 0, 0, 0, .013, .015, .011);
		add(eg, sph, eyeWhite, .01, .014, .032, 0, 0, 0, .008, .008, .006);
	};
	eye(-.072);
	eye(.072);
	const earL = new Group();
	const earR = new Group();
	if (id === "hare") {
		earL.position.set(-.07, .15, -.02);
		earR.position.set(.07, .15, -.02);
		add(earL, cap, fur, 0, .36, 0, .1, 0, .14, .045, .54, .03);
		add(earL, cap, earIn, 0, .34, .012, .1, 0, .14, .024, .48, .013);
		add(earL, sph, fur, 0, .02, 0, 0, 0, 0, .052, .042, .042);
		add(earR, cap, fur, 0, .36, 0, .1, 0, -.14, .045, .54, .03);
		add(earR, cap, earIn, 0, .34, .012, .1, 0, -.14, .024, .48, .013);
		add(earR, sph, fur, 0, .02, 0, 0, 0, 0, .052, .042, .042);
	} else {
		const earH = id === "wolf" ? .22 : .19;
		earL.position.set(-.11, .14, -.02);
		earR.position.set(.11, .14, -.02);
		add(earL, cone, fur, 0, earH * .55, 0, .12, 0, .26, .07, earH, .048);
		add(earL, cone, earIn, 0, earH * .48, .014, .12, 0, .26, .04, earH * .72, .022);
		add(earL, sph, dark, 0, earH * .02, -.01, 0, 0, 0, .042, .032, .032);
		add(earR, cone, fur, 0, earH * .55, 0, .12, 0, -.26, .07, earH, .048);
		add(earR, cone, earIn, 0, earH * .48, .014, .12, 0, -.26, .04, earH * .72, .022);
		add(earR, sph, dark, 0, earH * .02, -.01, 0, 0, 0, .042, .032, .032);
	}
	head.add(earL, earR);
	const goggles = new Group();
	goggles.position.set(0, .055, .04);
	head.add(goggles);
	add(goggles, new TorusGeometry(.05, .011, 8, 14), strap, -.07, .02, .1);
	add(goggles, new TorusGeometry(.05, .011, 8, 14), strap, .07, .02, .1);
	add(goggles, sph, lens, -.07, .02, .1, 0, 0, 0, .042, .042, .02);
	add(goggles, sph, lens, .07, .02, .1, 0, 0, 0, .042, .042, .02);
	add(goggles, cap, strap, 0, .02, .1, 0, 0, Math.PI / 2, .012, .052, .012);
	add(goggles, new TorusGeometry(.17, .012, 6, 18, Math.PI), strap, 0, .04, -.02, .4, 0, 0);
	const makeArm = (side) => {
		const arm = new Group();
		arm.position.set(side * .21, .22, 0);
		torso.add(arm);
		add(arm, sph, jacket, 0, 0, 0, 0, 0, 0, .058, .052, .058);
		add(arm, cap, jacket, 0, -.13, 0, 0, 0, 0, .05, .15, .05);
		add(arm, sph, glove, 0, -.3, .02, 0, 0, 0, .055, .05, .058);
		add(arm, sph, glove, side * .032, -.32, .052, 0, 0, 0, .024, .022, .032);
		return arm;
	};
	const armL = makeArm(-1);
	const armR = makeArm(1);
	const makeLeg = (side) => {
		const thigh = new Group();
		thigh.position.set(side * .11, -.02, 0);
		hip.add(thigh);
		const thighR = id === "hare" ? .09 : .072;
		add(thigh, cap, id === "hare" ? light : fur, 0, -.15, 0, 0, 0, 0, thighR, .16, thighR);
		const shin = new Group();
		shin.position.set(0, -.3, 0);
		thigh.add(shin);
		add(shin, cap, socks, 0, -.1, 0, 0, 0, 0, .052, .12, .052);
		const footScale = id === "hare" ? 1.45 : 1;
		add(shin, sph, boot, 0, -.23, .05, 0, 0, 0, .078 * footScale, .044, .13 * footScale);
		add(shin, sph, boot, 0, -.245, .125 * footScale, 0, 0, 0, .052 * footScale, .032, .062 * footScale);
		return {
			thigh,
			shin
		};
	};
	const legL = makeLeg(-1);
	const legR = makeLeg(1);
	const tail = new Group();
	tail.position.set(0, .04, -.16);
	hip.add(tail);
	if (id === "hare") {
		add(tail, sph, light, 0, .05, -.08, 0, 0, 0, .1, .1, .1);
		add(tail, sph, light, 0, .06, -.12, 0, 0, 0, .07, .07, .07);
	} else if (id === "wolf") {
		add(tail, cap, fur, 0, -.02, -.18, 1.05, 0, 0, .055, .22, .055);
		add(tail, cap, fur, 0, -.06, -.38, 1.15, 0, 0, .048, .18, .048);
		add(tail, sph, dark, 0, -.1, -.55, 0, 0, 0, .05, .042, .06);
	} else {
		add(tail, sph, fur, 0, .04, -.1, 0, 0, 0, .13, .11, .15);
		add(tail, sph, fur, 0, .02, -.24, 0, 0, 0, .12, .1, .15);
		add(tail, sph, fur, 0, 0, -.38, 0, 0, 0, .1, .085, .13);
		add(tail, sph, fur, 0, -.02, -.5, 0, 0, 0, .075, .065, .1);
		add(tail, sph, light, 0, -.03, -.6, 0, 0, 0, .055, .048, .075);
	}
	const scale = id === "wolf" ? 1.12 : id === "hare" ? .94 : 1.04;
	g.scale.setScalar(scale);
	const pose = (seated, lean, t, jump, slide) => {
		const s = seated;
		const idle = Math.sin(t * 2.2);
		const breath = Math.sin(t * 1.6) * .012;
		hip.position.y = lerpNum(.7, .52, s) + breath * (1 - s) * .4;
		hip.position.x = lean * .08;
		hip.rotation.z = -lean * .18;
		hip.rotation.x = lerpNum(.04 + idle * .02, .38, s) + jump * .04 - slide * .35;
		g.position.x = lerpNum(1.18, 0, s);
		g.position.y = lerpNum(0, .12, s) - slide * .22;
		g.position.z = lerpNum(.22, .04, s);
		g.rotation.y = lerpNum(-1.05, Math.PI, s);
		torso.rotation.x = lerpNum(.05, .16, s);
		head.rotation.x = lerpNum(.05, .1, s) - jump * .1;
		head.rotation.y = idle * .08 * (1 - s);
		head.rotation.z = -lean * .1;
		armL.rotation.x = lerpNum(.12, -1.12, s);
		armR.rotation.x = lerpNum(.08, -1.12, s);
		armL.rotation.z = lerpNum(.22, .48, s);
		armR.rotation.z = lerpNum(-.22, -.48, s);
		armL.rotation.y = lerpNum(.15, .35, s);
		armR.rotation.y = lerpNum(-.15, -.35, s);
		legL.thigh.rotation.x = lerpNum(.1, -1.18, s) + (id === "hare" ? .35 * (1 - s) : 0);
		legR.thigh.rotation.x = lerpNum(.14, -1.15, s) + (id === "hare" ? .35 * (1 - s) : 0);
		legL.shin.rotation.x = lerpNum(.08, 1.08, s);
		legR.shin.rotation.x = lerpNum(.1, 1.05, s);
		tail.rotation.x = lerpNum(.35, .15, s) + Math.sin(t * 5) * .12;
		tail.rotation.y = Math.sin(t * 3.4) * .25;
		earL.rotation.z = .12 + Math.sin(t * 4.1) * .05;
		earR.rotation.z = -.12 + Math.cos(t * 3.7) * .05;
		if (id === "hare") {
			earL.rotation.x = -.15 + Math.sin(t * 6) * .08 + jump * .2;
			earR.rotation.x = -.12 + Math.cos(t * 6.2) * .08 + jump * .2;
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
		pose
	};
}
function lerpNum(a, b, t) {
	return a + (b - a) * t;
}
function createQuad(accent) {
	const group = new Group();
	group.name = "atv";
	const metal = mat(1842724, {
		roughness: .34,
		metalness: .78
	});
	const metal2 = mat(2764856, {
		roughness: .3,
		metalness: .68
	});
	const paint = mat(accent, {
		roughness: .42,
		metalness: .28
	});
	const paintDark = mat(accent, {
		roughness: .48,
		metalness: .22
	});
	paintDark.color.multiplyScalar(.72);
	const rubber = mat(1315860, {
		roughness: .94,
		metalness: .04
	});
	const rim = mat(13683908, {
		roughness: .22,
		metalness: .85
	});
	const seat = mat(2761244, { roughness: .82 });
	const glass = mat(16051416, {
		roughness: .12,
		metalness: .45,
		emissive: 16773320,
		emi: .4
	});
	const tail = mat(11543576, {
		roughness: .35,
		metalness: .35,
		emissive: 10493976,
		emi: .45
	});
	const plastic = mat(1579034, { roughness: .5 });
	const sph = new SphereGeometry(1, 14, 10);
	const cap = new CapsuleGeometry(1, 1, 6, 12);
	const cyl = new CylinderGeometry(1, 1, 1, 14);
	const body = new Group();
	body.position.y = .42;
	group.add(body);
	add(body, new RoundedBoxGeometry(.72, .22, 1.55, 3, .08), metal, 0, -.02, .04);
	add(body, new RoundedBoxGeometry(.62, .16, 1.15, 3, .06), paint, 0, .12, .02);
	add(body, sph, metal, 0, 0, .04, 0, 0, 0, .34, .14, .52);
	add(body, new RoundedBoxGeometry(.55, .2, .42, 2, .08), paint, 0, .08, -.62);
	add(body, sph, paint, 0, .06, -.72, 0, 0, 0, .26, .12, .22);
	add(body, new RoundedBoxGeometry(.5, .14, .32, 2, .05), metal2, 0, .02, .72);
	add(body, cap, seat, 0, .22, .08, Math.PI / 2, 0, 0, .12, .3, .15);
	add(body, sph, seat, 0, .26, .26, 0, 0, 0, .15, .09, .17);
	add(body, new RoundedBoxGeometry(.9, .07, .28, 2, .03), plastic, 0, -.12, -.55);
	const handle = new Group();
	handle.position.set(0, .28, -.5);
	body.add(handle);
	add(handle, cyl, metal, 0, 0, .04, .4, 0, 0, .02, .22, .02);
	add(handle, cyl, metal, 0, .12, 0, 0, 0, Math.PI / 2, .02, .78, .02);
	add(handle, cyl, plastic, -.36, .12, 0, 0, 0, Math.PI / 2, .032, .12, .032);
	add(handle, cyl, plastic, .36, .12, 0, 0, 0, Math.PI / 2, .032, .12, .032);
	add(handle, sph, plastic, -.4, .12, 0, 0, 0, 0, .032, .032, .032);
	add(handle, sph, plastic, .4, .12, 0, 0, 0, 0, .032, .032, .032);
	add(body, sph, metal2, -.22, .08, -.78, 0, 0, 0, .07, .06, .06);
	add(body, sph, metal2, .22, .08, -.78, 0, 0, 0, .07, .06, .06);
	const hlL = add(body, sph, glass, -.22, .08, -.86, 0, 0, 0, .065, .06, .045);
	const hlR = add(body, sph, glass, .22, .08, -.86, 0, 0, 0, .065, .06, .045);
	add(body, sph, tail, -.18, .06, .86, 0, 0, 0, .038, .032, .028);
	add(body, sph, tail, .18, .06, .86, 0, 0, 0, .038, .032, .028);
	add(body, new RoundedBoxGeometry(.44, .08, .34, 2, .04), metal2, 0, .14, .7);
	add(body, cyl, metal, -.16, .28, .58, 0, 0, 0, .014, .2, .014);
	add(body, cyl, metal, .16, .28, .58, 0, 0, 0, .014, .2, .014);
	add(body, cyl, metal, 0, .38, .58, 0, 0, Math.PI / 2, .014, .34, .014);
	const fender = new RoundedBoxGeometry(.38, .1, .5, 2, .05);
	for (const [x, y, z] of [
		[
			-.48,
			.08,
			-.56
		],
		[
			.48,
			.08,
			-.56
		],
		[
			-.48,
			.08,
			.6
		],
		[
			.48,
			.08,
			.6
		]
	]) {
		add(body, fender, paint, x, y, z, .12, 0, x < 0 ? .18 : -.18);
		add(body, new RoundedBoxGeometry(.16, .08, .42, 1, .03), paintDark, x * .7, y - .06, z);
	}
	const wheels = [];
	const tire = new TorusGeometry(.23, .075, 10, 22);
	const hub = new CylinderGeometry(.1, .1, .15, 12);
	hub.rotateZ(Math.PI / 2);
	const disc = new CylinderGeometry(.155, .155, .045, 12);
	disc.rotateZ(Math.PI / 2);
	for (const [x, y, z] of [
		[
			-.5,
			.28,
			-.56
		],
		[
			.5,
			.28,
			-.56
		],
		[
			-.5,
			.28,
			.6
		],
		[
			.5,
			.28,
			.6
		]
	]) {
		const w = add(group, tire, rubber, x, y, z, 0, Math.PI / 2, 0);
		add(group, hub, rim, x, y, z);
		add(group, disc, metal2, x, y, z);
		wheels.push(w);
	}
	const spots = [];
	const makeSpot = (x) => {
		const spot = new SpotLight(16773840, 0, 42, .42, .5, 1.15);
		spot.position.set(x, .58, -.9);
		const tgt = new Object3D();
		tgt.position.set(x * .3, .1, -16);
		group.add(spot, tgt);
		spot.target = tgt;
		spots.push(spot);
	};
	makeSpot(-.22);
	makeSpot(.22);
	const headMats = [hlL.material, hlR.material];
	return {
		group,
		wheels,
		handle,
		spots,
		headMats,
		setLights(on, night) {
			const i = on ? night ? 5.2 : 2.8 : .15;
			for (const s of spots) s.intensity = i;
			for (const m of headMats) m.emissiveIntensity = on ? night ? 1.4 : .7 : .12;
		},
		spin(speed, dt) {
			const d = speed / .28 * dt;
			for (const w of wheels) w.rotation.x += d;
		},
		bob(t, speed, jump) {
			body.position.y = .42 + Math.sin(t * 18) * Math.min(.018, speed * 45e-5) + jump * 0;
			handle.rotation.z = 0;
		}
	};
}
function accentOf(id) {
	return PAL[id].accent;
}
function createMenuSet() {
	const g = new Group();
	g.name = "menu-set";
	const wood = mat(6965800, { roughness: .86 });
	const band = mat(2761756, {
		roughness: .5,
		metalness: .3
	});
	const rust = mat(9062946, {
		roughness: .62,
		metalness: .2
	});
	const glass = mat(16770720, {
		roughness: .2,
		metalness: .1,
		emissive: 16763e3,
		emi: .7
	});
	const post = mat(3811868, { roughness: .88 });
	const crate = new Group();
	add(crate, new RoundedBoxGeometry(.7, .55, .7, 2, .04), wood, 0, .28, 0);
	add(crate, new RoundedBoxGeometry(.74, .06, .74, 1, .02), band, 0, .28, 0);
	crate.position.set(1.15, 0, 1.35);
	crate.rotation.y = .35;
	g.add(crate);
	const can = new Group();
	add(can, new CylinderGeometry(.14, .16, .38, 10), rust, 0, .2, 0);
	add(can, new TorusGeometry(.08, .018, 6, 10), band, 0, .4, 0, Math.PI / 2, 0, 0);
	can.position.set(.55, 0, 1.55);
	g.add(can);
	const lamp = new Group();
	add(lamp, new CylinderGeometry(.03, .04, .35, 8), post, 0, .2, 0);
	add(lamp, new SphereGeometry(.09, 10, 8), glass, 0, .42, 0);
	lamp.position.set(-.35, 0, 1.15);
	const light = new PointLight(16760944, 1.1, 6, 1.6);
	light.position.set(0, .45, 0);
	lamp.add(light);
	g.add(lamp);
	add(g, new CylinderGeometry(.05, .07, 1.35, 6), post, 2.15, .68, .4);
	add(g, new RoundedBoxGeometry(.7, .38, .06, 1, .02), wood, 2.15, 1.22, .42);
	return g;
}
var BIOMES = [
	{
		id: "taiga",
		name: "Тайга",
		weather: "sun",
		night: false,
		fog: 11581608,
		fogNear: 38,
		fogFar: 165,
		hemiSky: 10401480,
		hemiGround: 4016690,
		hemiInt: .72,
		sun: 16773584,
		sunInt: 2.35,
		sunDir: [
			.38,
			.84,
			.22
		],
		ground: 4876864,
		road: 10131088,
		skyTop: 6195896,
		skyHorizon: 14469284,
		sunColor: 16770736
	},
	{
		id: "storm",
		name: "Мокрая трасса",
		weather: "rain",
		night: false,
		fog: 4871520,
		fogNear: 18,
		fogFar: 110,
		hemiSky: 4871528,
		hemiGround: 2764840,
		hemiInt: .42,
		sun: 10137024,
		sunInt: .65,
		sunDir: [
			.15,
			.9,
			.1
		],
		ground: 3819068,
		road: 6975092,
		skyTop: 3029064,
		skyHorizon: 6976384,
		sunColor: 12634324
	},
	{
		id: "tundra",
		name: "Тундра",
		weather: "snow",
		night: false,
		fog: 13950180,
		fogNear: 28,
		fogFar: 140,
		hemiSky: 15265524,
		hemiGround: 12634320,
		hemiInt: .85,
		sun: 15791359,
		sunInt: 1.15,
		sunDir: [
			.25,
			.78,
			.4
		],
		ground: 14213866,
		road: 12107976,
		skyTop: 10399940,
		skyHorizon: 15265524,
		sunColor: 16777215
	},
	{
		id: "canyon",
		name: "Каньон",
		weather: "hail",
		night: false,
		fog: 3817544,
		fogNear: 16,
		fogFar: 95,
		hemiSky: 3817552,
		hemiGround: 2762800,
		hemiInt: .32,
		sun: 12634328,
		sunInt: .45,
		sunDir: [
			.2,
			.7,
			.15
		],
		ground: 6968128,
		road: 5920852,
		skyTop: 1844272,
		skyHorizon: 5918800,
		sunColor: 14212328
	},
	{
		id: "nightwood",
		name: "Ночной бор",
		weather: "sun",
		night: true,
		fog: 1185824,
		fogNear: 22,
		fogFar: 120,
		hemiSky: 1714232,
		hemiGround: 1053712,
		hemiInt: .28,
		sun: 11060456,
		sunInt: .55,
		sunDir: [
			-.2,
			.75,
			.35
		],
		ground: 1714204,
		road: 3817028,
		skyTop: 329742,
		skyHorizon: 1713200,
		sunColor: 13688044
	}
];
function createSky() {
	const uniforms = {
		uTop: { value: new Color(6195896) },
		uHorizon: { value: new Color(14469284) },
		uSun: { value: new Vector3(.38, .84, .22).normalize() },
		uSunColor: { value: new Color(16770736) },
		uSunSize: { value: .018 }
	};
	const mat = new ShaderMaterial({
		uniforms,
		side: 1,
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
    `
	});
	const mesh = new Mesh(new SphereGeometry(220, 24, 16), mat);
	mesh.frustumCulled = false;
	return {
		mesh,
		uniforms
	};
}
function createPineNeedles() {
	const geos = [
		{
			r: 1.45,
			h: 2.15,
			y: 1.35
		},
		{
			r: 1.12,
			h: 1.85,
			y: 2.25
		},
		{
			r: .78,
			h: 1.55,
			y: 3.15
		},
		{
			r: .48,
			h: 1.15,
			y: 3.85
		}
	].map((l) => {
		const c = new ConeGeometry(l.r, l.h, 8);
		c.translate(0, l.y, 0);
		return c;
	});
	const merged = mergeGeometries(geos, false);
	geos.forEach((g) => g.dispose());
	return merged;
}
function createPineTrunk() {
	const g = new CylinderGeometry(.11, .2, 1.35, 6);
	g.translate(0, .62, 0);
	return g;
}
function createBushGeo() {
	const a = new IcosahedronGeometry(.55, 0);
	a.translate(0, .4, 0);
	const b = new IcosahedronGeometry(.38, 0);
	b.translate(.28, .32, .1);
	const c = new IcosahedronGeometry(.32, 0);
	c.translate(-.22, .28, -.12);
	const merged = mergeGeometries([
		a,
		b,
		c
	], false);
	a.dispose();
	b.dispose();
	c.dispose();
	return merged;
}
function createRockGeo() {
	const g = new IcosahedronGeometry(.7, 0);
	const pos = g.attributes.position;
	for (let i = 0; i < pos.count; i++) {
		pos.setY(i, pos.getY(i) * .65);
		pos.setX(i, pos.getX(i) * (.8 + i * 13 % 7 * .04));
	}
	g.computeVertexNormals();
	return g;
}
function createCoinGeo() {
	const g = new CylinderGeometry(.28, .28, .05, 12);
	g.rotateZ(Math.PI / 2);
	return g;
}
function createRidgeline() {
	const g = new Group();
	g.name = "ridge";
	const mat = new MeshStandardMaterial({
		color: 3819068,
		roughness: .96,
		flatShading: true
	});
	for (const [x, y, z, sx, sy, sz] of [
		[
			-48,
			-4,
			-70,
			28,
			18,
			22
		],
		[
			-28,
			-6,
			-85,
			22,
			14,
			18
		],
		[
			36,
			-5,
			-78,
			26,
			16,
			20
		],
		[
			58,
			-4,
			-92,
			32,
			20,
			24
		],
		[
			-62,
			-8,
			-100,
			24,
			12,
			18
		],
		[
			14,
			-10,
			-110,
			40,
			11,
			28
		]
	]) {
		const m = new Mesh(new IcosahedronGeometry(1, 0), mat);
		m.position.set(x, y, z);
		m.scale.set(sx, sy, sz);
		m.receiveShadow = true;
		g.add(m);
	}
	return g;
}
function makeCrate() {
	const g = new Group();
	const wood = new MeshStandardMaterial({
		color: 6965800,
		roughness: .86
	});
	const band = new MeshStandardMaterial({
		color: 2761756,
		roughness: .5,
		metalness: .3
	});
	const box = new Mesh(new RoundedBoxGeometry(.95, .95, .95, 2, .06), wood);
	box.position.y = .48;
	box.castShadow = true;
	const strap = new Mesh(new RoundedBoxGeometry(1, .08, 1, 1, .02), band);
	strap.position.y = .48;
	g.add(box, strap);
	return g;
}
function makeBarrier() {
	const g = new Group();
	const conc = new MeshStandardMaterial({
		color: 10130828,
		roughness: .78
	});
	const stripe = new MeshStandardMaterial({
		color: 11811868,
		roughness: .55
	});
	const body = new Mesh(new RoundedBoxGeometry(1.15, .72, .38, 2, .08), conc);
	body.position.y = .36;
	body.castShadow = true;
	const s = new Mesh(new RoundedBoxGeometry(1.16, .12, .4, 1, .04), stripe);
	s.position.y = .42;
	g.add(body, s);
	return g;
}
function makeBarrel() {
	const g = new Group();
	const or = new MeshStandardMaterial({
		color: 12081690,
		roughness: .55,
		metalness: .25
	});
	const ring = new MeshStandardMaterial({
		color: 2763308,
		roughness: .4,
		metalness: .5
	});
	const c = new Mesh(new CylinderGeometry(.32, .35, .85, 16), or);
	c.position.y = .43;
	c.castShadow = true;
	const r = new Mesh(new TorusGeometry(.33, .03, 6, 10), ring);
	r.rotation.x = Math.PI / 2;
	r.position.y = .55;
	g.add(c, r);
	return g;
}
function makeBoulder() {
	const g = new Group();
	const rock = new MeshStandardMaterial({
		color: 6973540,
		roughness: .92,
		flatShading: true
	});
	const m = new Mesh(new IcosahedronGeometry(.62, 1), rock);
	m.position.y = .4;
	m.scale.set(1.1, .85, 1);
	m.castShadow = true;
	g.add(m);
	return g;
}
function makeOverhead() {
	const g = new Group();
	const steel = new MeshStandardMaterial({
		color: 3817028,
		roughness: .4,
		metalness: .7
	});
	const bar = new MeshStandardMaterial({
		color: 12099648,
		roughness: .45,
		metalness: .3
	});
	const p1 = new Mesh(new BoxGeometry(.12, 2.2, .12), steel);
	p1.position.set(-1.15, 1.1, 0);
	const p2 = p1.clone();
	p2.position.x = 1.15;
	const top = new Mesh(new BoxGeometry(2.5, .1, .14), steel);
	top.position.y = 2.2;
	const hang = new Mesh(new BoxGeometry(1.6, .7, .12), bar);
	hang.position.y = 1.45;
	g.add(p1, p2, top, hang);
	return g;
}
function makeRamp() {
	const g = new Group();
	const plank = new MeshStandardMaterial({
		color: 6968128,
		roughness: .78
	});
	const stripe = new MeshStandardMaterial({
		color: 12868634,
		roughness: .5
	});
	const geo = new BoxGeometry(2.05, .16, 3.4);
	const mesh = new Mesh(geo, plank);
	mesh.rotation.x = -.42;
	mesh.position.set(0, .55, 0);
	mesh.castShadow = true;
	const s = new Mesh(new BoxGeometry(.22, .04, 3.2), stripe);
	s.rotation.x = -.42;
	s.position.set(-.6, .64, 0);
	const s2 = s.clone();
	s2.position.x = .6;
	g.add(mesh, s, s2);
	return g;
}
function makeCone() {
	const g = new Group();
	const or = new MeshStandardMaterial({
		color: 13656096,
		roughness: .6
	});
	const wh = new MeshStandardMaterial({
		color: 15261908,
		roughness: .5
	});
	const c = new Mesh(new ConeGeometry(.22, .7, 8), or);
	c.position.y = .36;
	c.castShadow = true;
	const band = new Mesh(new CylinderGeometry(.16, .18, .08, 8), wh);
	band.position.y = .32;
	g.add(c, band);
	return g;
}
function makeObstacle(kind) {
	if (kind === "crate") return makeCrate();
	if (kind === "barrier") return makeBarrier();
	if (kind === "barrel") return makeBarrel();
	if (kind === "boulder") return makeBoulder();
	if (kind === "overhead") return makeOverhead();
	if (kind === "ramp") return makeRamp();
	const g = new Group();
	const a = makeCone();
	a.position.x = -.32;
	const b = makeCone();
	b.position.x = .32;
	g.add(a, b);
	return g;
}
new Object3D();
var WeatherFx = class {
	points;
	pos;
	n;
	kind = "sun";
	lightning = 0;
	mat;
	constructor() {
		this.n = 900;
		this.pos = new Float32Array(this.n * 3);
		for (let i = 0; i < this.n; i++) {
			this.pos[i * 3] = (Math.random() - .5) * 28;
			this.pos[i * 3 + 1] = Math.random() * 16;
			this.pos[i * 3 + 2] = (Math.random() - .5) * 36;
		}
		const geo = new BufferGeometry();
		geo.setAttribute("position", new BufferAttribute(this.pos, 3));
		this.mat = new PointsMaterial({
			color: 13161696,
			size: .08,
			transparent: true,
			opacity: 0,
			depthWrite: false,
			sizeAttenuation: true
		});
		this.points = new Points(geo, this.mat);
		this.points.frustumCulled = false;
	}
	setKind(kind) {
		this.kind = kind;
		if (kind === "sun") {
			this.mat.opacity = 0;
			this.points.visible = false;
			return;
		}
		this.points.visible = true;
		if (kind === "rain") {
			this.mat.color.set(10137796);
			this.mat.size = .055;
			this.mat.opacity = .55;
		} else if (kind === "snow") {
			this.mat.color.set(15922938);
			this.mat.size = .11;
			this.mat.opacity = .85;
		} else {
			this.mat.color.set(14213352);
			this.mat.size = .13;
			this.mat.opacity = .7;
		}
	}
	update(dt, cam, speed) {
		if (this.kind === "sun") {
			this.lightning *= Math.exp(-8 * dt);
			return;
		}
		this.points.position.copy(cam.position);
		const fall = this.kind === "snow" ? 4.5 : this.kind === "rain" ? 18 + speed * .15 : 22 + speed * .2;
		const drift = this.kind === "snow" ? 1.4 : this.kind === "hail" ? .4 : .8;
		for (let i = 0; i < this.n; i++) {
			const o = i * 3;
			this.pos[o + 1] -= fall * dt;
			this.pos[o] += Math.sin(i + performance.now() * .001) * drift * dt;
			this.pos[o + 2] += speed * dt * .15;
			if (this.pos[o + 1] < -4) {
				this.pos[o + 1] = 12 + Math.random() * 6;
				this.pos[o] = (Math.random() - .5) * 28;
				this.pos[o + 2] = (Math.random() - .5) * 36;
			}
		}
		this.points.geometry.attributes.position.needsUpdate = true;
		if (this.kind === "hail" && Math.random() < .012) this.lightning = 1;
		this.lightning *= Math.exp(-6 * dt);
	}
};
var VERSION = 1;
function defaults() {
	return {
		version: VERSION,
		best: 0,
		character: "fox",
		muted: false,
		seenTutorial: false
	};
}
function loadSave() {
	try {
		const raw = localStorage.getItem(SAVE_KEY);
		if (!raw) return defaults();
		const parsed = JSON.parse(raw);
		return {
			...defaults(),
			...parsed,
			version: VERSION
		};
	} catch {
		return defaults();
	}
}
function writeSave(data) {
	try {
		localStorage.setItem(SAVE_KEY, JSON.stringify({
			...data,
			version: VERSION
		}));
	} catch {}
}
var DUMMY = new Object3D();
var _color = new Color();
var _color2 = new Color();
var _look = new Vector3();
var _desired = new Vector3();
var _dirA = new Vector3();
var _dirB = new Vector3();
function hitbox(kind) {
	switch (kind) {
		case "crate": return {
			w: 1.05,
			h: 1,
			d: 1.05,
			deadly: true,
			overhead: false,
			ramp: false
		};
		case "barrier": return {
			w: 1.2,
			h: .78,
			d: .5,
			deadly: true,
			overhead: false,
			ramp: false
		};
		case "barrel": return {
			w: .8,
			h: .9,
			d: .8,
			deadly: true,
			overhead: false,
			ramp: false
		};
		case "boulder": return {
			w: 1.2,
			h: .95,
			d: 1.1,
			deadly: true,
			overhead: false,
			ramp: false
		};
		case "overhead": return {
			w: 2.2,
			h: 2.4,
			d: .4,
			deadly: true,
			overhead: true,
			ramp: false
		};
		case "ramp": return {
			w: 2.1,
			h: 1.3,
			d: 3.2,
			deadly: false,
			overhead: false,
			ramp: true
		};
		default: return {
			w: 1.1,
			h: .72,
			d: .6,
			deadly: true,
			overhead: false,
			ramp: false
		};
	}
}
function isJumpable(kind) {
	return kind === "barrier" || kind === "cones" || kind === "barrel";
}
var Game = class {
	renderer;
	scene;
	camera;
	world = new Group();
	player = new Group();
	input;
	audio = new AudioEngine();
	rider;
	quad;
	sky;
	weather = new WeatherFx();
	hemi;
	sun;
	fill;
	fog;
	roadMesh;
	groundL;
	groundR;
	needles;
	trunks;
	bushes;
	rocks;
	coinsMesh;
	roadMat;
	groundMat;
	shadowBlob;
	shieldRing;
	ridge;
	menuSet;
	obstacles = [];
	pickups = [];
	trees = [];
	rockItems = [];
	bushItems = [];
	coins = [];
	segs = [];
	disposed = false;
	last = performance.now();
	acc = 0;
	time = 0;
	hudAcc = 0;
	phase = "menu";
	character;
	lane = 0;
	laneSmooth = 0;
	speed = 0;
	distance = 0;
	score = 0;
	coinsN = 0;
	best;
	y = 0;
	vy = 0;
	grounded = true;
	slideT = 0;
	coyote = 0;
	jumpBuf = 0;
	introT = 0;
	seated = 0;
	crashT = 0;
	trauma = 0;
	hitstop = 0;
	iFrames = 0;
	magnetT = 0;
	shieldOn = false;
	multiT = 0;
	muted;
	tutorial;
	lastSpawn = -40;
	safeLane = 0;
	biomeT = 0;
	weatherId = "sun";
	biomeName = BIOMES[0].name;
	mobile;
	reduce;
	rng = mulberry(2654435769);
	pendingLeft = false;
	pendingRight = false;
	onHud;
	canvas;
	ro;
	visHandler;
	onWinResize;
	sizeTimers = [];
	ctxLost;
	save;
	constructor(canvas, onHud, root) {
		this.canvas = canvas;
		this.onHud = onHud;
		this.save = loadSave();
		this.character = this.save.character;
		this.best = this.save.best;
		this.muted = this.save.muted;
		this.tutorial = !this.save.seenTutorial;
		this.mobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 720;
		this.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		this.renderer = new WebGLRenderer({
			canvas,
			antialias: !this.mobile,
			powerPreference: this.mobile ? "default" : "high-performance",
			alpha: false,
			failIfMajorPerformanceCaveat: false,
			depth: true,
			stencil: false
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.mobile ? 1.35 : 2));
		this.renderer.outputColorSpace = SRGBColorSpace;
		this.renderer.toneMapping = 4;
		this.renderer.toneMappingExposure = 1.14;
		this.renderer.shadowMap.enabled = !this.mobile;
		this.renderer.shadowMap.type = 1;
		this.renderer.setClearColor(9087168);
		this.scene = new Scene();
		this.fog = new Fog(BIOMES[0].fog, BIOMES[0].fogNear, BIOMES[0].fogFar);
		this.scene.fog = this.fog;
		this.camera = new PerspectiveCamera(58, 1, .12, 280);
		this.hemi = new HemisphereLight(10401480, 4016690, .72);
		this.sun = new DirectionalLight(16773584, 2.35);
		this.sun.position.set(18, 42, 12);
		this.sun.castShadow = !this.mobile;
		this.sun.shadow.mapSize.set(this.mobile ? 512 : 1024, this.mobile ? 512 : 1024);
		this.sun.shadow.camera.near = 4;
		this.sun.shadow.camera.far = 90;
		this.sun.shadow.camera.left = -28;
		this.sun.shadow.camera.right = 28;
		this.sun.shadow.camera.top = 22;
		this.sun.shadow.camera.bottom = -18;
		this.sun.shadow.bias = -8e-4;
		this.fill = new DirectionalLight(11059416, .28);
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
		this.roadMat = new MeshStandardMaterial({
			map: roadTex,
			roughness: .82,
			metalness: .04,
			color: 10131088
		});
		const grass = makeGroundTexture("grass");
		grass.repeat.set(4, 2);
		this.groundMat = new MeshStandardMaterial({
			map: grass,
			roughness: .95,
			color: 9085040
		});
		const roadGeo = new PlaneGeometry(ROAD_WIDTH, 22);
		roadGeo.rotateX(-Math.PI / 2);
		this.roadMesh = new InstancedMesh(roadGeo, this.roadMat, 16);
		this.roadMesh.receiveShadow = true;
		this.roadMesh.frustumCulled = false;
		const gGeo = new PlaneGeometry(36, 22);
		gGeo.rotateX(-Math.PI / 2);
		this.groundL = new InstancedMesh(gGeo, this.groundMat, 16);
		this.groundR = new InstancedMesh(gGeo, this.groundMat, 16);
		this.groundL.receiveShadow = true;
		this.groundR.receiveShadow = true;
		this.groundL.frustumCulled = false;
		this.groundR.frustumCulled = false;
		const nGeo = createPineNeedles();
		const tGeo = createPineTrunk();
		const needleMat = new MeshStandardMaterial({
			color: 3099186,
			roughness: .9,
			flatShading: true
		});
		const trunkMat = new MeshStandardMaterial({
			color: 3811868,
			roughness: .86
		});
		const treeN = 224;
		this.needles = new InstancedMesh(nGeo, needleMat, treeN);
		this.trunks = new InstancedMesh(tGeo, trunkMat, treeN);
		this.needles.instanceMatrix.setUsage(DynamicDrawUsage);
		this.trunks.instanceMatrix.setUsage(DynamicDrawUsage);
		this.needles.castShadow = !this.mobile;
		this.needles.frustumCulled = false;
		this.trunks.frustumCulled = false;
		this.needles.instanceColor = new InstancedBufferAttribute(/* @__PURE__ */ new Float32Array(672), 3);
		this.trunks.instanceColor = new InstancedBufferAttribute(/* @__PURE__ */ new Float32Array(672), 3);
		const bushN = 128;
		const bushMat = new MeshStandardMaterial({
			color: 3824178,
			roughness: .92,
			flatShading: true
		});
		this.bushes = new InstancedMesh(createBushGeo(), bushMat, bushN);
		this.bushes.instanceMatrix.setUsage(DynamicDrawUsage);
		this.bushes.castShadow = !this.mobile;
		this.bushes.frustumCulled = false;
		this.bushes.instanceColor = new InstancedBufferAttribute(/* @__PURE__ */ new Float32Array(384), 3);
		const rockN = 96;
		const rockMat = new MeshStandardMaterial({
			color: 6973538,
			roughness: .94,
			flatShading: true
		});
		this.rocks = new InstancedMesh(createRockGeo(), rockMat, rockN);
		this.rocks.instanceMatrix.setUsage(DynamicDrawUsage);
		this.rocks.castShadow = !this.mobile;
		this.rocks.receiveShadow = true;
		this.rocks.frustumCulled = false;
		const coinN = 128;
		const coinMat = new MeshStandardMaterial({
			color: 15254362,
			roughness: .28,
			metalness: .7,
			emissive: 10516512,
			emissiveIntensity: .35
		});
		this.coinsMesh = new InstancedMesh(createCoinGeo(), coinMat, coinN);
		this.coinsMesh.instanceMatrix.setUsage(DynamicDrawUsage);
		this.coinsMesh.frustumCulled = false;
		this.coinsMesh.castShadow = false;
		this.world.add(this.roadMesh, this.groundL, this.groundR, this.needles, this.trunks, this.bushes, this.rocks, this.coinsMesh);
		this.ridge = createRidgeline();
		this.scene.add(this.ridge);
		this.menuSet = createMenuSet();
		this.scene.add(this.menuSet);
		const blob = new Mesh(new CircleGeometry(.85, 16), new MeshBasicMaterial({
			color: 0,
			transparent: true,
			opacity: .32,
			depthWrite: false
		}));
		blob.rotation.x = -Math.PI / 2;
		blob.position.y = .03;
		this.shadowBlob = blob;
		this.scene.add(blob);
		const ring = new Mesh(new TorusGeometry(.95, .045, 8, 24), new MeshBasicMaterial({
			color: 14209736,
			transparent: true,
			opacity: 0,
			depthWrite: false
		}));
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
		this.ctxLost = (e) => {
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
		this.sizeTimers = [
			50,
			180,
			500
		].map((ms) => window.setTimeout(() => this.resize(), ms));
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
	selectCharacter(id) {
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
			const mesh = obj;
			if (mesh.geometry) mesh.geometry.dispose();
			const mat = mesh.material;
			if (Array.isArray(mat)) mat.forEach((m) => this.disposeMat(m));
			else if (mat) this.disposeMat(mat);
		});
		this.renderer.dispose();
		if (window.__controlsTest) delete window.__controlsTest;
		window.__gameReady = false;
	}
	disposeMat(m) {
		m.map?.dispose();
		m.dispose();
	}
	buildPlayer() {
		for (const c of [...this.player.children]) {
			if (c === this.shieldRing) continue;
			this.player.remove(c);
		}
		this.quad = createQuad(accentOf(this.character));
		this.rider = createRider(this.character);
		this.player.add(this.quad.group, this.rider.group);
		this.quad.setLights(this.phase !== "menu", this.currentBiome().night);
	}
	buildPools() {
		const kinds = [
			"crate",
			"barrier",
			"barrel",
			"boulder",
			"overhead",
			"ramp",
			"cones"
		];
		for (let i = 0; i < 22; i++) {
			const kind = kinds[i % kinds.length];
			const mesh = makeObstacle(kind);
			mesh.visible = false;
			this.world.add(mesh);
			const hb = hitbox(kind);
			this.obstacles.push({
				mesh,
				kind,
				lane: 0,
				z: 0,
				active: false,
				...hb
			});
		}
		const mkPickup = (kind, color) => {
			const g = new Group();
			const m = new Mesh(new OctahedronGeometry(.32, 0), new MeshStandardMaterial({
				color,
				roughness: .25,
				metalness: .45,
				emissive: color,
				emissiveIntensity: .45
			}));
			m.position.y = .7;
			m.castShadow = true;
			g.add(m);
			g.visible = false;
			this.world.add(g);
			this.pickups.push({
				mesh: g,
				kind,
				lane: 0,
				z: 0,
				active: false
			});
		};
		mkPickup("magnet", 12868682);
		mkPickup("magnet", 12868682);
		mkPickup("shield", 14209736);
		mkPickup("shield", 14209736);
		mkPickup("star", 15254362);
		mkPickup("star", 15254362);
	}
	layoutTrack(initial) {
		this.segs.length = 0;
		this.trees.length = 0;
		this.rockItems.length = 0;
		this.bushItems.length = 0;
		this.coins.length = 0;
		for (let i = 0; i < 16; i++) {
			const z = 10 - i * 22;
			this.segs.push(z);
		}
		const treeN = 224;
		for (let i = 0; i < treeN; i++) {
			const seg = Math.floor(i / 14);
			const z = this.segs[seg] + rand(-9.24, 9.24);
			const side = i % 2 === 0 ? -1 : 1;
			const far = i % 5 === 0;
			this.trees.push({
				x: side * (ROAD_WIDTH * .5 + (far ? rand(10, 22) : rand(2.6, 12))),
				y: 0,
				z,
				s: far ? rand(1.4, 2.2) : rand(.85, 1.55),
				ry: rand(0, Math.PI * 2),
				alive: true,
				lane: 0,
				collected: false
			});
		}
		const rockN = 96;
		for (let i = 0; i < rockN; i++) {
			const seg = Math.floor(i / 6);
			const side = i % 2 === 0 ? -1 : 1;
			this.rockItems.push({
				x: side * (ROAD_WIDTH * .5 + rand(2, 14)),
				y: 0,
				z: this.segs[seg] + rand(-8, 8),
				s: rand(.5, 1.6),
				ry: rand(0, 3),
				alive: true,
				lane: 0,
				collected: false
			});
		}
		const bushN = 128;
		for (let i = 0; i < bushN; i++) {
			const seg = Math.floor(i / 8);
			const side = i % 2 === 0 ? -1 : 1;
			this.bushItems.push({
				x: side * (ROAD_WIDTH * .5 + rand(1.7, 9)),
				y: 0,
				z: this.segs[seg] + rand(-9, 9),
				s: rand(.7, 1.4),
				ry: rand(0, Math.PI * 2),
				alive: true,
				lane: 0,
				collected: false
			});
		}
		const coinN = 128;
		for (let i = 0; i < coinN; i++) this.coins.push({
			x: 0,
			y: .7,
			z: -40,
			s: 1,
			ry: 0,
			alive: false,
			lane: 0,
			collected: false
		});
		if (initial) this.writeInstances(0);
	}
	currentBiome() {
		return BIOMES[Math.floor(this.distance / 480) % BIOMES.length];
	}
	biomeBlend() {
		const u = this.distance / 480;
		const i0 = Math.floor(u) % BIOMES.length;
		const i1 = (i0 + 1) % BIOMES.length;
		const t = smoothstep((u - Math.floor(u) - .86) / .14);
		return {
			a: BIOMES[i0],
			b: BIOMES[i1],
			t
		};
	}
	placeMenu() {
		this.phase = "menu";
		this.speed = 0;
		this.lane = 0;
		this.laneSmooth = 0;
		this.y = 0;
		this.vy = 0;
		this.seated = 0;
		this.player.position.set(ROAD_WIDTH * .5 + 1.55, 0, .35);
		this.player.rotation.set(0, 0, 0);
		this.quad.group.rotation.set(0, .82, 0);
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
	menuCam() {
		const px = this.player.position.x;
		const pz = this.player.position.z;
		if (this.mobile) return {
			pos: new Vector3(px + 2.25, 1.78, pz + 4.2),
			look: new Vector3(px - .1, 1.15, pz - .2),
			fov: 46
		};
		return {
			pos: new Vector3(px + 2.45, 1.18, pz + 2.55),
			look: new Vector3(px + .45, .72, pz + .05),
			fov: 36
		};
	}
	resetRun(autoStart) {
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
		this.rng = mulberry(Math.random() * 1e9 | 0);
		this.player.rotation.set(0, 0, 0);
		this.quad.group.rotation.set(0, 0, 0);
		this.clearHazards();
		this.layoutTrack(true);
		if (autoStart) {
			this.player.position.set(0, 0, 0);
			this.seated = 1;
			this.phase = "playing";
			this.speed = 24 * CHAR_STATS[this.character].speedMul * .85;
			this.quad.setLights(true, this.currentBiome().night);
		} else {
			this.buildPlayer();
			this.placeMenu();
		}
		this.pushHud(true);
	}
	clearHazards() {
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
	resize() {
		const w = Math.max(1, Math.floor(window.innerWidth || this.canvas.clientWidth || 1));
		const h = Math.max(1, Math.floor(window.innerHeight || this.canvas.clientHeight || 1));
		this.renderer.setSize(w, h, false);
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
		this.mobile = window.matchMedia("(pointer: coarse)").matches || w < 720;
	}
	loop(now) {
		if (this.disposed) return;
		const raw = Math.min(.1, (now - this.last) / 1e3);
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
		if (this.hudAcc > .08) {
			this.hudAcc = 0;
			this.pushHud(false);
		}
	}
	fixed(dt) {
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
			this.seated = smoothstep(t / (this.reduce ? .2 : .42));
			const ontoRoad = easeOutCubic(clamp((t - .18) / .42, 0, 1));
			this.player.position.x = lerp(ROAD_WIDTH * .5 + 1.55, 0, ontoRoad);
			this.player.position.z = lerp(.35, 0, ontoRoad);
			this.quad.group.rotation.y = lerp(.82, 0, ontoRoad);
			if (t > .35) {
				const stats = CHAR_STATS[this.character];
				this.speed = lerp(0, 24 * stats.speedMul * .7, clamp((t - .35) / .5, 0, 1));
				this.quad.setLights(true, this.currentBiome().night);
			}
			if (act.leftPressed) this.pendingLeft = true;
			if (act.rightPressed) this.pendingRight = true;
			this.scrollWorld(dt);
			if (t > (this.reduce ? .45 : .72)) {
				this.phase = "playing";
				this.player.position.set(0, this.y, 0);
				this.quad.group.rotation.y = 0;
				this.camera.position.set(0, 1.95, 4.1);
				this.camera.lookAt(0, .65, -2.8);
			}
			return;
		}
		if (this.phase === "dead") {
			this.crashT += dt;
			this.speed = expDamp(this.speed, 0, 3.2, dt);
			this.scrollWorld(dt);
			this.player.position.y = Math.max(0, this.y);
			this.quad.group.rotation.z = Math.min(1.1, this.crashT * 1.6);
			this.quad.group.rotation.x = Math.min(.5, this.crashT * .7);
			this.audio.setEngine(0, false);
			if (act.startPressed && this.crashT > .4) this.retry();
			if (act.pausePressed && this.crashT > .4) this.backToMenu();
			return;
		}
		if (act.pausePressed) {
			this.pause();
			return;
		}
		const stats = CHAR_STATS[this.character];
		const target = Math.min(54, 24 + this.distance * SPEED_GAIN) * stats.speedMul;
		this.speed = expDamp(this.speed, target, 1.1, dt);
		if (act.leftPressed || this.pendingLeft) this.tryLane(-1);
		if (act.rightPressed || this.pendingRight) this.tryLane(1);
		this.pendingLeft = this.pendingRight = false;
		this.laneSmooth = expDamp(this.laneSmooth, laneX(this.lane), 14, dt);
		this.world.position.x = -this.laneSmooth;
		if (act.jumpPressed) this.jumpBuf = JUMP_BUFFER;
		if (act.slidePressed && this.grounded) this.slideT = SLIDE_TIME;
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
		this.vy -= 46 * dt;
		this.y += this.vy * dt;
		if (this.y <= 0) {
			if (!this.grounded && this.vy < -6) {
				this.trauma = Math.min(1, this.trauma + .18);
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
		this.audio.setEngine(clamp(this.speed / 54, 0, 1), true);
		this.quad.spin(this.speed, dt);
	}
	tryLane(dir) {
		const next = clamp(this.lane + dir, -1, 1);
		if (next === this.lane) return;
		this.lane = next;
		this.audio.whoosh();
		if (navigator.vibrate) navigator.vibrate(8);
	}
	scrollWorld(dt) {
		const dz = this.speed * dt;
		for (let i = 0; i < this.segs.length; i++) {
			this.segs[i] += dz;
			if (this.segs[i] > 18) this.segs[i] -= 352;
		}
		for (const t of this.trees) {
			t.z += dz;
			if (t.z > 22) {
				t.z -= 352;
				const side = this.rng() < .5 ? -1 : 1;
				const far = this.rng() < .22;
				t.x = side * (ROAD_WIDTH * .5 + (far ? 10 + this.rng() * 12 : 2.6 + this.rng() * 9));
				t.s = far ? 1.4 + this.rng() * .8 : .85 + this.rng() * .7;
			}
		}
		for (const r of this.rockItems) {
			r.z += dz;
			if (r.z > 22) {
				r.z -= 352;
				r.x = (this.rng() < .5 ? -1 : 1) * (ROAD_WIDTH * .5 + 2.4 + this.rng() * 12);
			}
		}
		for (const b of this.bushItems) {
			b.z += dz;
			if (b.z > 22) {
				b.z -= 352;
				b.x = (this.rng() < .5 ? -1 : 1) * (ROAD_WIDTH * .5 + 1.7 + this.rng() * 8);
				b.s = .7 + this.rng() * .7;
			}
		}
		for (const c of this.coins) {
			if (!c.alive) continue;
			if (!c.collected) c.z += dz;
			if (c.z > 14 && !c.collected) c.alive = false;
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
	spawn(_dt) {
		if (this.distance < 220) return;
		const gap = 15 + this.speed * .32;
		if (this.distance - this.lastSpawn < gap) return;
		this.lastSpawn = this.distance;
		const z = -Math.max(88, this.speed * 1.65);
		const diff = clamp(this.distance / 2200, 0, 1);
		if (this.distance > 280 && this.rng() < .18) this.safeLane = [
			-1,
			0,
			1
		][this.rng() * 3 | 0];
		const other = [
			-1,
			0,
			1
		].filter((l) => l !== this.safeLane);
		const roll = this.rng();
		if (roll < .16) {
			this.placeCoins(this.safeLane, z, 6, .7);
			return;
		}
		if (roll < .28) {
			this.placeObstacle("ramp", this.safeLane, z);
			this.placeCoins(this.safeLane, z - 4, 5, 1.4);
			return;
		}
		if (roll < .36 && diff > .12) {
			this.placeObstacle("overhead", this.safeLane, z);
			this.placeCoins(this.safeLane, z + 2, 3, .55);
			return;
		}
		if (roll < .44) {
			this.placeBonus(z);
			this.placeCoins(this.safeLane, z - 6, 4, .7);
			return;
		}
		if (roll < .72 || diff < .2) {
			const lane = other[this.rng() * other.length | 0];
			const kinds = [
				"crate",
				"boulder",
				"barrier",
				"barrel",
				"cones"
			];
			this.placeObstacle(kinds[this.rng() * kinds.length | 0], lane, z);
			if (this.rng() < .45) this.placeCoins(this.safeLane, z, 4, .7);
			return;
		}
		this.placeObstacle("crate", other[0], z);
		this.placeObstacle(this.rng() < .5 ? "boulder" : "barrel", other[1], z);
		this.placeCoins(this.safeLane, z, 5, .7);
	}
	placeObstacle(kind, lane, z) {
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
	placeCoins(lane, z, n, y) {
		let placed = 0;
		for (const c of this.coins) {
			if (c.alive) continue;
			c.alive = true;
			c.collected = false;
			c.lane = lane;
			c.x = laneX(lane);
			c.y = y + (placed % 2 === 0 ? 0 : .15);
			c.z = z - placed * 1.7;
			placed++;
			if (placed >= n) break;
		}
	}
	placeBonus(z) {
		const kinds = [
			"magnet",
			"shield",
			"star"
		];
		const kind = kinds[this.rng() * kinds.length | 0];
		const slot = this.pickups.find((p) => !p.active && p.kind === kind) || this.pickups.find((p) => !p.active);
		if (!slot) return;
		slot.active = true;
		slot.kind = kind;
		slot.lane = this.safeLane;
		slot.z = z;
		slot.mesh.visible = true;
		slot.mesh.position.set(laneX(this.safeLane), 0, z);
	}
	collide() {
		const px = this.laneSmooth;
		const pHalfW = .48;
		const py = this.y;
		const prevSpeed = this.speed;
		for (const o of this.obstacles) {
			if (!o.active) continue;
			const ox = laneX(o.lane);
			const half = o.d * .5;
			if (!(o.z - prevSpeed * (1 / 60) - half < 1.05 && o.z + half > -.85)) continue;
			if (Math.abs(px - ox) > pHalfW + o.w * .5 - .05) continue;
			if (o.ramp) {
				if (py < .55 && this.vy <= 2) {
					this.vy = RAMP_VY * CHAR_STATS[this.character].jumpMul;
					this.grounded = false;
					this.audio.jump();
				}
				continue;
			}
			if (o.overhead) {
				if (this.slideT > 0 || py > .85) continue;
				this.hit();
				continue;
			}
			if (isJumpable(o.kind) && py + .12 > o.h) continue;
			if (py > o.h + .12) continue;
			this.hit();
		}
	}
	hit() {
		if (this.iFrames > 0 || this.phase !== "playing") return;
		if (this.shieldOn) {
			this.shieldOn = false;
			this.iFrames = 1.15;
			this.trauma = Math.min(1, this.trauma + .45);
			this.hitstop = .06;
			this.audio.crash();
			return;
		}
		this.phase = "dead";
		this.crashT = 0;
		this.trauma = 1;
		this.hitstop = .09;
		this.audio.crash();
		this.audio.setEngine(0, false);
		if (this.score > this.best) {
			this.best = this.score;
			this.save.best = this.best;
			writeSave(this.save);
		}
		this.pushHud(true);
	}
	collect() {
		const mag = this.magnetT > 0 ? 3.4 * CHAR_STATS[this.character].magnetMul : .95;
		const magZ = this.magnetT > 0 ? 11 : 1.3;
		for (const c of this.coins) {
			if (!c.alive || c.collected) continue;
			const dx = c.x - this.laneSmooth;
			if (this.magnetT > 0 && Math.abs(c.z) < magZ && Math.abs(dx) < mag + 2.2) {
				c.x = expDamp(c.x, this.laneSmooth, 10, 1 / 60);
				c.z = expDamp(c.z, .2, 8, 1 / 60);
				c.y = expDamp(c.y, .9 + this.y, 8, 1 / 60);
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
				this.iFrames = Math.max(this.iFrames, .4);
			}
			if (p.kind === "star") this.multiT = 8.5;
		}
	}
	visual(dt) {
		const lean = clamp((this.laneSmooth - laneX(this.lane)) * -.35, -1, 1);
		const hop = this.phase === "intro" ? Math.sin(smoothstep(this.introT / .42) * Math.PI) * .55 : 0;
		const seated = this.phase === "menu" ? 0 : this.phase === "intro" ? this.seated : 1;
		this.rider.pose(seated, lean + this.world.position.x * .02, this.time, this.y * .2, this.slideT > 0 ? 1 : 0);
		if (this.phase === "intro") this.rider.group.position.y += hop;
		this.player.position.y = this.phase === "menu" || this.phase === "intro" ? hop * 0 : this.y;
		if (this.phase === "intro") this.player.position.y = 0;
		this.menuSet.visible = this.phase === "menu";
		if (this.phase === "intro" && this.introT > .12) this.menuSet.visible = false;
		const bankSrc = this.phase === "playing" ? -this.world.position.x * .04 : 0;
		const bank = this.reduce ? bankSrc * .2 : bankSrc;
		this.world.rotation.z = expDamp(this.world.rotation.z, clamp(bank, -.12, .12), 8, dt);
		this.quad.bob(this.time, this.speed, this.y);
		this.shadowBlob.position.x = this.player.position.x;
		this.shadowBlob.position.z = this.player.position.z;
		const so = this.y > .05 ? clamp(1 - this.y / 4, .08, 1) : 1;
		this.shadowBlob.material.opacity = .28 * so;
		this.shadowBlob.scale.setScalar(1.15 + this.y * .25);
		this.shieldRing.position.y = .85;
		const sm = this.shieldRing.material;
		sm.opacity = this.shieldOn ? .55 + Math.sin(this.time * 8) * .12 : 0;
		this.shieldRing.visible = this.shieldOn;
		this.shieldRing.rotation.z = this.time * 1.4;
		this.trauma = Math.max(0, this.trauma - dt * 1.8);
		this.writeInstances(this.time);
		this.applyBiome(dt);
		this.weather.update(dt, this.camera, this.speed);
		this.updateCamera(dt);
		this.sky.mesh.position.copy(this.camera.position);
	}
	writeInstances(t) {
		const halfRoad = ROAD_WIDTH * .5;
		for (let i = 0; i < 16; i++) {
			const z = this.segs[i];
			DUMMY.position.set(0, 0, z);
			DUMMY.rotation.set(0, 0, 0);
			DUMMY.scale.set(1, 1, 1);
			DUMMY.updateMatrix();
			this.roadMesh.setMatrixAt(i, DUMMY.matrix);
			DUMMY.position.set(-(halfRoad + 18), -.02, z);
			DUMMY.updateMatrix();
			this.groundL.setMatrixAt(i, DUMMY.matrix);
			DUMMY.position.set(halfRoad + 18, -.02, z);
			DUMMY.updateMatrix();
			this.groundR.setMatrixAt(i, DUMMY.matrix);
		}
		this.roadMesh.instanceMatrix.needsUpdate = true;
		this.groundL.instanceMatrix.needsUpdate = true;
		this.groundR.instanceMatrix.needsUpdate = true;
		const { a, b, t: bt } = this.biomeBlend();
		for (let i = 0; i < this.trees.length; i++) {
			const tr = this.trees[i];
			DUMMY.position.set(tr.x, 0, tr.z);
			DUMMY.rotation.set(0, tr.ry, 0);
			DUMMY.scale.set(tr.s, tr.s, tr.s);
			DUMMY.updateMatrix();
			this.needles.setMatrixAt(i, DUMMY.matrix);
			this.trunks.setMatrixAt(i, DUMMY.matrix);
			const snow = lerp(a.weather === "snow" ? 1 : 0, b.weather === "snow" ? 1 : 0, bt);
			_color.setHex(i % 3 === 0 ? 2771504 : i % 3 === 1 ? 3363384 : 2375210);
			_color2.set(14214364);
			_color.lerp(_color2, snow);
			this.needles.setColorAt(i, _color);
		}
		this.needles.instanceMatrix.needsUpdate = true;
		this.trunks.instanceMatrix.needsUpdate = true;
		if (this.needles.instanceColor) this.needles.instanceColor.needsUpdate = true;
		for (let i = 0; i < this.bushItems.length; i++) {
			const bu = this.bushItems[i];
			DUMMY.position.set(bu.x, 0, bu.z);
			DUMMY.rotation.set(0, bu.ry, 0);
			DUMMY.scale.set(bu.s, bu.s, bu.s);
			DUMMY.updateMatrix();
			this.bushes.setMatrixAt(i, DUMMY.matrix);
			const snow = lerp(a.weather === "snow" ? 1 : 0, b.weather === "snow" ? 1 : 0, bt);
			_color.setHex(i % 2 === 0 ? 3824178 : 3033640);
			_color2.set(13162700);
			_color.lerp(_color2, snow);
			this.bushes.setColorAt(i, _color);
		}
		this.bushes.instanceMatrix.needsUpdate = true;
		if (this.bushes.instanceColor) this.bushes.instanceColor.needsUpdate = true;
		for (let i = 0; i < this.rockItems.length; i++) {
			const r = this.rockItems[i];
			DUMMY.position.set(r.x, .22 * r.s, r.z);
			DUMMY.rotation.set(.1, r.ry, 0);
			DUMMY.scale.set(r.s, r.s * .8, r.s);
			DUMMY.updateMatrix();
			this.rocks.setMatrixAt(i, DUMMY.matrix);
		}
		this.rocks.instanceMatrix.needsUpdate = true;
		for (let i = 0; i < this.coins.length; i++) {
			const c = this.coins[i];
			if (!c.alive) {
				DUMMY.position.set(0, -8, 40);
				DUMMY.scale.set(0, 0, 0);
			} else {
				DUMMY.position.set(c.x, c.y + Math.sin(t * 5 + i) * .08, c.z);
				DUMMY.rotation.set(0, t * 2.8 + i, .4);
				DUMMY.scale.set(1, 1, 1);
			}
			DUMMY.updateMatrix();
			this.coinsMesh.setMatrixAt(i, DUMMY.matrix);
		}
		this.coinsMesh.instanceMatrix.needsUpdate = true;
	}
	applyBiome(_dt) {
		const { a, b, t } = this.biomeBlend();
		const fogC = new Color(a.fog).lerp(new Color(b.fog), t);
		this.fog.color.copy(fogC);
		this.fog.near = lerp(a.fogNear, b.fogNear, t);
		this.fog.far = lerp(a.fogFar, b.fogFar, t);
		this.hemi.color.lerpColors(new Color(a.hemiSky), new Color(b.hemiSky), t);
		this.hemi.groundColor.lerpColors(new Color(a.hemiGround), new Color(b.hemiGround), t);
		this.hemi.intensity = lerp(a.hemiInt, b.hemiInt, t);
		this.sun.color.lerpColors(new Color(a.sun), new Color(b.sun), t);
		this.sun.intensity = lerp(a.sunInt, b.sunInt, t) + this.weather.lightning * 3.5;
		_dirA.set(...a.sunDir).normalize();
		_dirB.set(...b.sunDir).normalize();
		_dirA.lerp(_dirB, t).normalize();
		this.sun.position.copy(_dirA).multiplyScalar(48);
		this.sun.target.position.set(0, 0, -20);
		this.sky.uniforms.uTop.value.lerpColors(new Color(a.skyTop), new Color(b.skyTop), t);
		this.sky.uniforms.uHorizon.value.lerpColors(new Color(a.skyHorizon), new Color(b.skyHorizon), t);
		this.sky.uniforms.uSun.value.copy(_dirA);
		this.sky.uniforms.uSunColor.value.lerpColors(new Color(a.sunColor), new Color(b.sunColor), t);
		this.sky.uniforms.uSunSize.value = lerp(a.night ? .006 : .018, b.night ? .006 : .018, t);
		this.groundMat.color.lerpColors(new Color(a.ground), new Color(b.ground), t);
		this.roadMat.color.lerpColors(new Color(a.road), new Color(b.road), t);
		const wet = (a.weather === "rain" || a.weather === "hail" ? 1 - t : 0) + (b.weather === "rain" || b.weather === "hail" ? t : 0);
		this.roadMat.roughness = lerp(.84, .22, wet);
		this.roadMat.metalness = lerp(.03, .18, wet);
		const w = t > .5 ? b.weather : a.weather;
		if (w !== this.weatherId) {
			this.weatherId = w;
			this.weather.setKind(w);
			this.audio.setWeather(this.phase === "playing" || this.phase === "intro" ? w : "off");
		}
		this.biomeName = t > .5 ? b.name : a.name;
		this.biomeT = t;
		this.quad.setLights(this.phase !== "menu", (t > .5 ? b : a).night);
		this.renderer.toneMappingExposure = lerp(a.night ? .86 : 1.08, b.night ? .86 : 1.08, t);
	}
	updateCamera(dt) {
		const shake = this.trauma * this.trauma;
		const sx = (Math.random() - .5) * shake * .35;
		(Math.random() - .5) * shake * .22;
		if (this.phase === "menu" || this.phase === "intro" && this.introT < .28) {
			const wob = this.reduce ? 0 : 1;
			const cam = this.menuCam();
			_desired.copy(cam.pos);
			_desired.x += Math.sin(this.time * .22) * .12 * wob;
			_desired.y += Math.sin(this.time * .19) * .04 * wob;
			_desired.z += Math.cos(this.time * .17) * .08 * wob;
			_look.copy(cam.look);
			this.camera.fov = expDamp(this.camera.fov, cam.fov, 6, dt);
			this.camera.updateProjectionMatrix();
			const k = this.time < .05 ? 40 : 3.2;
			this.camera.position.x = expDamp(this.camera.position.x, _desired.x, k, dt);
			this.camera.position.y = expDamp(this.camera.position.y, _desired.y, k, dt);
			this.camera.position.z = expDamp(this.camera.position.z, _desired.z, k, dt);
			this.camera.lookAt(_look);
			return;
		}
		const spd = this.speed / 54;
		this.camera.fov = expDamp(this.camera.fov, 52 + spd * 8, 3.4, dt);
		this.camera.updateProjectionMatrix();
		_desired.set(sx * .35, 1.85 + spd * .22 + this.y * .28, 3.75 + spd * .36);
		_look.set(0, .68 + this.y * .35, -2.55);
		const k = this.phase === "intro" ? 5.5 : 8.5;
		this.camera.position.x = expDamp(this.camera.position.x, _desired.x, k, dt);
		this.camera.position.y = expDamp(this.camera.position.y, _desired.y, k, dt);
		this.camera.position.z = expDamp(this.camera.position.z, _desired.z, k, dt);
		this.camera.lookAt(_look);
		const bank = clamp(-this.world.position.x * .05, -.12, .12);
		this.camera.rotateZ(this.reduce ? 0 : -bank);
	}
	handleMenuTap() {
		if (!this.input.popTap()) return;
		this.startFromMenu();
	}
	pushHud(force) {
		const state = {
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
			tutorial: this.tutorial && this.phase === "menu"
		};
		this.onHud(state);
	}
	bindControlsTest() {
		window.__controlsTest = {
			getYaw: () => -this.laneSmooth * .22,
			getSpeed: () => this.speed,
			getPhase: () => this.phase,
			getPlayer: () => ({
				x: this.player.position.x,
				y: this.player.position.y,
				z: this.player.position.z,
				cx: this.camera.position.x,
				cy: this.camera.position.y,
				cz: this.camera.position.z
			}),
			setKeys: (codes) => {
				if (this.phase === "menu" && codes.includes("KeyW")) this.startFromMenu();
				this.input.setKeys(codes);
			},
			setSteer: (v) => {
				if (v > .5) this.pendingLeft = true;
				if (v < -.5) this.pendingRight = true;
			}
		};
	}
};
//#endregion
export { Game };

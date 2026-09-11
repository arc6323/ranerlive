export type Actions = {
  left: boolean;
  right: boolean;
  jump: boolean;
  slide: boolean;
  start: boolean;
  pause: boolean;
  leftPressed: boolean;
  rightPressed: boolean;
  jumpPressed: boolean;
  slidePressed: boolean;
  startPressed: boolean;
  pausePressed: boolean;
};

const GAME_CODES = new Set([
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
  "KeyP",
]);

export class Input {
  keys = new Set<string>();
  private prev = new Set<string>();
  private inject: string[] = [];
  private injectEdge = new Set<string>();
  private swipeLeft = false;
  private swipeRight = false;
  private swipeUp = false;
  private swipeDown = false;
  private tap = false;
  private pointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;
  private moved = false;
  tapX = 0;
  tapY = 0;
  enabled = true;
  onUnlock?: () => void;

  constructor(private el: HTMLElement) {
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

  setKeys(codes: string[]) {
    const prev = new Set(this.inject);
    this.inject = codes.slice();
    this.injectEdge.clear();
    for (const c of this.inject) {
      if (!prev.has(c)) this.injectEdge.add(c);
    }
  }

  popTap(): { x: number; y: number } | null {
    if (!this.tap) return null;
    this.tap = false;
    return { x: this.tapX, y: this.tapY };
  }

  sample(): Actions {
    const has = (c: string) => this.keys.has(c) || this.inject.includes(c);
    const edge = (c: string) =>
      (!this.prev.has(c) && this.keys.has(c)) || this.injectEdge.has(c);

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
      pausePressed,
    };
  }

  private onKeyDown(e: KeyboardEvent) {
    this.onUnlock?.();
    if (!this.enabled) return;
    if (GAME_CODES.has(e.code)) e.preventDefault();
    this.keys.add(e.code);
  }

  private onKeyUp(e: KeyboardEvent) {
    this.keys.delete(e.code);
  }

  private onBlur() {
    this.keys.clear();
  }

  private onPointerDown(e: PointerEvent) {
    this.onUnlock?.();
    if (!this.enabled) return;
    const t = e.target as HTMLElement | null;
    if (t?.closest?.("button, a, [data-ui]")) return;
    if (this.pointerId !== null) return;
    this.pointerId = e.pointerId;
    this.startX = this.lastX = e.clientX;
    this.startY = this.lastY = e.clientY;
    this.moved = false;
    try {
      this.el.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  }

  private onPointerMove(e: PointerEvent) {
    if (e.pointerId !== this.pointerId) return;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    if (Math.hypot(e.clientX - this.startX, e.clientY - this.startY) > 14) {
      this.moved = true;
    }
  }

  private onPointerUp(e: PointerEvent) {
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
}

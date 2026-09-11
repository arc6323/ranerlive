import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameOverlay } from "@/components/game-overlay";
import type { Game } from "@/game/game";
import type { CharacterId, HudState } from "@/game/types";

export const Route = createFileRoute("/")({ component: Home });

void import("@/game/game");

const INITIAL: HudState = {
  phase: "menu",
  score: 0,
  coins: 0,
  best: 0,
  speedKmh: 0,
  weather: "sun",
  biome: "Тайга",
  character: "fox",
  multiplier: 1,
  shield: false,
  magnet: false,
  muted: false,
  tutorial: true,
};

const HERO: Record<CharacterId, string> = {
  fox: "/chars/fox-hero.jpg",
  wolf: "/chars/wolf-hero.jpg",
  hare: "/chars/hare-hero.jpg",
};

function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<HTMLElement>(null);
  const gameRef = useRef<Game | null>(null);
  const pendingStart = useRef(false);
  const [hud, setHud] = useState<HudState>(INITIAL);
  const [ready, setReady] = useState(false);
  const [queued, setQueued] = useState(false);
  const [live, setLive] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    let dead = false;
    let game: Game | null = null;
    const canvas = canvasRef.current;
    if (!canvas) return;

    import("@/game/game")
      .then(({ Game }) => {
        if (dead || !canvas) return;
        try {
          game = new Game(canvas, (s) => {
            if (dead) return;
            setHud(s);
            if (s.phase === "menu") setLive(false);
            else if (s.phase === "intro" || s.phase === "playing") setLive(true);
          }, shellRef.current);
          gameRef.current = game;
          setReady(true);
          if (pendingStart.current) {
            setLive(true);
            game.startFromMenu();
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "WebGL недоступен";
          setBootError(msg);
        }
      })
      .catch((err: unknown) => {
        setBootError(err instanceof Error ? err.message : "Не удалось загрузить трассу");
      });

    return () => {
      dead = true;
      game?.dispose();
      gameRef.current = null;
    };
  }, []);

  const onStart = useCallback(() => {
    setLive(true);
    const g = gameRef.current;
    if (g) {
      g.startFromMenu();
      return;
    }
    pendingStart.current = true;
    setQueued(true);
  }, []);
  const onSelect = useCallback((id: CharacterId) => {
    setHud((h) => ({ ...h, character: id }));
    gameRef.current?.selectCharacter(id);
  }, []);
  const onPause = useCallback(() => gameRef.current?.pause(), []);
  const onResume = useCallback(() => gameRef.current?.resume(), []);
  const onRetry = useCallback(() => gameRef.current?.retry(), []);
  const onMenu = useCallback(() => {
    setLive(false);
    gameRef.current?.backToMenu();
  }, []);
  const onMute = useCallback(() => gameRef.current?.toggleMute(), []);

  const showHero = !live && hud.phase === "menu";

  return (
    <main ref={shellRef} className="game-shell relative h-dvh w-full overflow-hidden">
      {showHero ? (
        <img
          src={HERO[hud.character]}
          alt=""
          width={720}
          height={1280}
          className="hero-fallback"
          draggable={false}
        />
      ) : null}
      <canvas
        ref={canvasRef}
        className="game-canvas"
        onContextMenu={(e) => e.preventDefault()}
      />
      <GameOverlay
        hud={live && hud.phase === "menu" ? { ...hud, phase: "intro" } : hud}
        ready={ready}
        queued={queued}
        bootError={bootError}
        onStart={onStart}
        onSelect={onSelect}
        onPause={onPause}
        onResume={onResume}
        onRetry={onRetry}
        onMenu={onMenu}
        onMute={onMute}
      />
    </main>
  );
}

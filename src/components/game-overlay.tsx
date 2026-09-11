import type { ReactNode } from "react";
import {
  Pause,
  Play,
  Volume2,
  VolumeX,
  RotateCcw,
  Shield,
  Magnet,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHARACTERS, type CharacterId, type HudState } from "@/game/types";
import { WEATHER_LABEL } from "@/game/types";
import { cn } from "@/lib/utils";

type Props = {
  hud: HudState;
  ready: boolean;
  queued: boolean;
  bootError: string | null;
  onStart: () => void;
  onSelect: (id: CharacterId) => void;
  onPause: () => void;
  onResume: () => void;
  onRetry: () => void;
  onMenu: () => void;
  onMute: () => void;
};

const CHAR_TONE: Record<CharacterId, string> = {
  fox: "bg-danger",
  wolf: "bg-muted",
  hare: "bg-accent",
};

export function GameOverlay({
  hud,
  ready,
  queued,
  bootError,
  onStart,
  onSelect,
  onPause,
  onResume,
  onRetry,
  onMenu,
  onMute,
}: Props) {
  const menu = hud.phase === "menu";
  const play = hud.phase === "playing" || hud.phase === "intro";
  const paused = hud.phase === "paused";
  const dead = hud.phase === "dead";
  const wait = !ready;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-fg">
      <div className="relative z-20 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-6">
        <div className="min-w-0">
          {menu ? (
            <div className="space-y-1">
              <p className="font-display text-xs font-semibold tracking-[0.22em] text-muted uppercase">
                Бесконечный раннер
              </p>
              <h1 className="font-display text-3xl font-semibold leading-none tracking-tight sm:text-5xl">
                Зверотрасса
              </h1>
              <p className="mt-2 max-w-sm text-sm text-muted">
                Квадроцикл стоит. Свайп сдвигает весь мир.
              </p>
            </div>
          ) : (
            <div className="pointer-events-none">
              <p className="font-display text-3xl font-semibold tabular-nums leading-none sm:text-4xl">
                {hud.score.toLocaleString("ru-RU")}
              </p>
              <p className="mt-1 text-xs text-muted">
                рекорд {hud.best.toLocaleString("ru-RU")}
              </p>
            </div>
          )}
        </div>

        <div className="pointer-events-auto relative z-20 flex items-center gap-2">
          {play ? (
            <Chip>
              <Gauge className="size-3.5" />
              <span className="tabular-nums">{hud.speedKmh}</span>
              <span className="text-muted">км/ч</span>
            </Chip>
          ) : null}
          <IconBtn label={hud.muted ? "Включить звук" : "Выключить звук"} onClick={onMute}>
            {hud.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </IconBtn>
          {play ? (
            <IconBtn label="Пауза" onClick={onPause}>
              <Pause className="size-4" />
            </IconBtn>
          ) : null}
        </div>
      </div>

      {play ? (
        <div className="absolute left-4 top-24 flex flex-col gap-2 sm:left-6 sm:top-28">
          <Chip>
            <span className="text-muted">монеты</span>
            <span className="tabular-nums">{hud.coins}</span>
          </Chip>
          {hud.multiplier > 1 ? <Chip>x{hud.multiplier}</Chip> : null}
          {hud.shield ? (
            <Chip>
              <Shield className="size-3.5" />
              щит
            </Chip>
          ) : null}
          {hud.magnet ? (
            <Chip>
              <Magnet className="size-3.5" />
              магнит
            </Chip>
          ) : null}
        </div>
      ) : null}

      {play ? (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4 pb-[env(safe-area-inset-bottom)]">
          <p className="rounded-lg border border-border bg-surface/80 px-3 py-1.5 text-xs text-muted">
            {hud.biome} · {WEATHER_LABEL[hud.weather]}
          </p>
        </div>
      ) : null}

      {menu ? (
        <button
          type="button"
          aria-label="Start"
          onClick={onStart}
          className="pointer-events-auto absolute inset-0 z-0 cursor-pointer bg-transparent"
        />
      ) : null}

      {menu ? (
        <div
          data-ui="menu"
          className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-bg via-bg/80 to-transparent px-3 pb-[max(0.8rem,env(safe-area-inset-bottom))] pt-16 sm:px-6"
        >
          <p className="mb-3 text-center text-sm text-muted">
            Нажмите на героя или квадроцикл — запрыгнет и выедет на трассу
          </p>
          <div className="mx-auto grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
            {(Object.keys(CHARACTERS) as CharacterId[]).map((id) => {
              const c = CHARACTERS[id];
              const on = hud.character === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelect(id)}
                  className={cn(
                    "flex items-center gap-2 overflow-hidden rounded-lg border p-1.5 text-left transition-colors duration-150 sm:block sm:rounded-xl sm:p-0",
                    on ? "border-border-strong bg-surface-2" : "border-border bg-surface/80 hover:border-border-strong",
                  )}
                >
                  <img
                    src={`/chars/${id}.jpg`}
                    alt=""
                    width={320}
                    height={320}
                    className="size-12 shrink-0 rounded-md object-cover sm:aspect-square sm:size-auto sm:w-full sm:rounded-none"
                  />
                  <span className="block min-w-0 px-0.5 sm:px-3 sm:py-2">
                    <span className={cn("mb-1 hidden size-2 rounded-full sm:block", CHAR_TONE[id])} />
                    <span className="block font-display text-sm font-semibold">{c.name}</span>
                    <span className="block text-xs text-muted">
                      {c.species} · {c.trait}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mx-auto mt-3 flex max-w-xl flex-col gap-2">
            <Button
              className="h-12 w-full rounded-xl sm:h-12"
              size="lg"
              onClick={onStart}
              aria-label="Start"
            >
              {bootError ? "Повторить" : wait ? "Заводим двигатель…" : "Поехать"}
              <span className="sr-only">Start</span>
            </Button>
          </div>
          {bootError ? (
            <p className="mt-2 text-center text-xs text-danger">
              Трасса не поднялась. Нажмите ещё раз.
            </p>
          ) : wait ? (
            <p className="mt-2 text-center text-xs text-subtle">
              {queued
                ? "Старт в очереди — мир ещё грузится."
                : "Грузим мир. Можно нажимать — старт уйдёт в очередь."}
            </p>
          ) : hud.best > 0 ? (
            <p className="mt-2 text-center text-xs text-subtle">
              Лучший заезд · {hud.best.toLocaleString("ru-RU")}
            </p>
          ) : (
            <p className="mt-2 text-center text-xs text-subtle">
              A / D или свайп — полосы · вверх — прыжок · вниз — скольжение
            </p>
          )}
        </div>
      ) : null}

      {paused || dead ? (
        <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-bg/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-panel">
            <p className="font-display text-2xl font-semibold tracking-tight">
              {dead ? "Занос" : "Пауза"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {dead
                ? "Мир остановился. Ещё круг?"
                : "Трасса ждёт. Свайп по-прежнему двигает мир, не байк."}
            </p>
            {dead ? (
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-surface-2 px-3 py-2">
                  <p className="text-xs text-muted">очки</p>
                  <p className="font-display text-xl tabular-nums">{hud.score.toLocaleString("ru-RU")}</p>
                </div>
                <div className="rounded-lg bg-surface-2 px-3 py-2">
                  <p className="text-xs text-muted">рекорд</p>
                  <p className="font-display text-xl tabular-nums">{hud.best.toLocaleString("ru-RU")}</p>
                </div>
              </div>
            ) : null}
            <div className="mt-5 flex flex-col gap-2">
              {dead ? (
                <Button size="lg" className="w-full rounded-xl" onClick={onRetry} aria-label="Start">
                  <RotateCcw className="size-4" />
                  Ещё раз
                </Button>
              ) : (
                <Button size="lg" className="w-full rounded-xl" onClick={onResume}>
                  <Play className="size-4" />
                  Дальше
                </Button>
              )}
              <Button variant="ghost" size="lg" className="w-full rounded-xl" onClick={onMenu}>
                К обочине
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface/80 px-2.5 text-xs tabular-nums">
      {children}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-11 items-center justify-center rounded-lg border border-border bg-surface/80 text-fg transition-colors duration-150 hover:border-border-strong"
    >
      {children}
    </button>
  );
}

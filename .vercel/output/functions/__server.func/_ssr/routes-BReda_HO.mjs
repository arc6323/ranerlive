import { i as __toESM } from "../_runtime.mjs";
import { n as CHARACTERS, r as WEATHER_LABEL } from "./types-CclHiIqA.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as RotateCcw, c as Magnet, i as Shield, l as Gauge, n as Volume2, o as Play, s as Pause, t as VolumeX } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BReda_HO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors transition-transform duration-150 ease-out select-none disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:bg-fg",
			ghost: "bg-transparent text-fg border border-border hover:border-border-strong hover:bg-surface-2",
			subtle: "bg-surface-2 text-fg hover:bg-surface"
		},
		size: {
			sm: "h-10 px-3.5 text-sm rounded-md",
			md: "h-12 px-5 text-sm rounded-lg",
			lg: "h-14 px-6 text-base rounded-xl"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		ref,
		...props
	});
});
Button.displayName = "Button";
var CHAR_TONE = {
	fox: "bg-danger",
	wolf: "bg-muted",
	hare: "bg-accent"
};
function GameOverlay({ hud, ready, queued, bootError, onStart, onSelect, onPause, onResume, onRetry, onMenu, onMute }) {
	const menu = hud.phase === "menu";
	const play = hud.phase === "playing" || hud.phase === "intro";
	const paused = hud.phase === "paused";
	const dead = hud.phase === "dead";
	const wait = !ready;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-10 text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-20 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0",
					children: menu ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xs font-semibold tracking-[0.22em] text-muted uppercase",
								children: "Бесконечный раннер"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-3xl font-semibold leading-none tracking-tight sm:text-5xl",
								children: "Зверотрасса"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-sm text-sm text-muted",
								children: "Квадроцикл стоит. Свайп сдвигает весь мир."
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-3xl font-semibold tabular-nums leading-none sm:text-4xl",
							children: hud.score.toLocaleString("ru-RU")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted",
							children: ["рекорд ", hud.best.toLocaleString("ru-RU")]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto relative z-20 flex items-center gap-2",
					children: [
						play ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "size-3.5" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: hud.speedKmh
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: "км/ч"
							})
						] }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
							label: hud.muted ? "Включить звук" : "Выключить звук",
							onClick: onMute,
							children: hud.muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
						}),
						play ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
							label: "Пауза",
							onClick: onPause,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
						}) : null
					]
				})]
			}),
			play ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-4 top-24 flex flex-col gap-2 sm:left-6 sm:top-28",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: "монеты"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: hud.coins
					})] }),
					hud.multiplier > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, { children: ["x", hud.multiplier] }) : null,
					hud.shield ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-3.5" }), "щит"] }) : null,
					hud.magnet ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Magnet, { className: "size-3.5" }), "магнит"] }) : null
				]
			}) : null,
			play ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute bottom-4 left-0 right-0 flex justify-center px-4 pb-[env(safe-area-inset-bottom)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rounded-lg border border-border bg-surface/80 px-3 py-1.5 text-xs text-muted",
					children: [
						hud.biome,
						" · ",
						WEATHER_LABEL[hud.weather]
					]
				})
			}) : null,
			menu ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Start",
				onClick: onStart,
				className: "pointer-events-auto absolute inset-0 z-0 cursor-pointer bg-transparent"
			}) : null,
			menu ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-ui": "menu",
				className: "pointer-events-auto absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-bg via-bg/80 to-transparent px-3 pb-[max(0.8rem,env(safe-area-inset-bottom))] pt-16 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 text-center text-sm text-muted",
						children: "Нажмите на героя или квадроцикл — запрыгнет и выедет на трассу"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto grid max-w-xl grid-cols-3 gap-2 sm:gap-3",
						children: Object.keys(CHARACTERS).map((id) => {
							const c = CHARACTERS[id];
							const on = hud.character === id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onSelect(id),
								className: cn("flex items-center gap-2 overflow-hidden rounded-lg border p-1.5 text-left transition-colors duration-150 sm:block sm:rounded-xl sm:p-0", on ? "border-border-strong bg-surface-2" : "border-border bg-surface/80 hover:border-border-strong"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: `/chars/${id}.jpg`,
									alt: "",
									width: 320,
									height: 320,
									className: "size-12 shrink-0 rounded-md object-cover sm:aspect-square sm:size-auto sm:w-full sm:rounded-none"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block min-w-0 px-0.5 sm:px-3 sm:py-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mb-1 hidden size-2 rounded-full sm:block", CHAR_TONE[id]) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block font-display text-sm font-semibold",
											children: c.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "block text-xs text-muted",
											children: [
												c.species,
												" · ",
												c.trait
											]
										})
									]
								})]
							}, id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto mt-3 flex max-w-xl flex-col gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "h-12 w-full rounded-xl sm:h-12",
							size: "lg",
							onClick: onStart,
							"aria-label": "Start",
							children: [bootError ? "Повторить" : wait ? "Заводим двигатель…" : "Поехать", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "Start"
							})]
						})
					}),
					bootError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-center text-xs text-danger",
						children: "Трасса не поднялась. Нажмите ещё раз."
					}) : wait ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-center text-xs text-subtle",
						children: queued ? "Старт в очереди — мир ещё грузится." : "Грузим мир. Можно нажимать — старт уйдёт в очередь."
					}) : hud.best > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-center text-xs text-subtle",
						children: ["Лучший заезд · ", hud.best.toLocaleString("ru-RU")]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-center text-xs text-subtle",
						children: "A / D или свайп — полосы · вверх — прыжок · вниз — скольжение"
					})
				]
			}) : null,
			paused || dead ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-bg/70 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl font-semibold tracking-tight",
							children: dead ? "Занос" : "Пауза"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: dead ? "Мир остановился. Ещё круг?" : "Трасса ждёт. Свайп по-прежнему двигает мир, не байк."
						}),
						dead ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 grid grid-cols-2 gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg bg-surface-2 px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "очки"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-xl tabular-nums",
									children: hud.score.toLocaleString("ru-RU")
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg bg-surface-2 px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "рекорд"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-xl tabular-nums",
									children: hud.best.toLocaleString("ru-RU")
								})]
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-col gap-2",
							children: [dead ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "lg",
								className: "w-full rounded-xl",
								onClick: onRetry,
								"aria-label": "Start",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Ещё раз"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "lg",
								className: "w-full rounded-xl",
								onClick: onResume,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), "Дальше"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "lg",
								className: "w-full rounded-xl",
								onClick: onMenu,
								children: "К обочине"
							})]
						})
					]
				})
			}) : null
		]
	});
}
function Chip({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface/80 px-2.5 text-xs tabular-nums",
		children
	});
}
function IconBtn({ children, onClick, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: "inline-flex size-11 items-center justify-center rounded-lg border border-border bg-surface/80 text-fg transition-colors duration-150 hover:border-border-strong",
		children
	});
}
var INITIAL = {
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
	tutorial: true
};
var HERO = {
	fox: "/chars/fox-hero.jpg",
	wolf: "/chars/wolf-hero.jpg",
	hare: "/chars/hare-hero.jpg"
};
function Home() {
	const canvasRef = (0, import_react.useRef)(null);
	const shellRef = (0, import_react.useRef)(null);
	const gameRef = (0, import_react.useRef)(null);
	const pendingStart = (0, import_react.useRef)(false);
	const [hud, setHud] = (0, import_react.useState)(INITIAL);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [queued, setQueued] = (0, import_react.useState)(false);
	const [live, setLive] = (0, import_react.useState)(false);
	const [bootError, setBootError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let dead = false;
		let game = null;
		const canvas = canvasRef.current;
		if (!canvas) return;
		import("./game-HEVzTQF8.mjs").then(({ Game }) => {
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
		}).catch((err) => {
			setBootError(err instanceof Error ? err.message : "Не удалось загрузить трассу");
		});
		return () => {
			dead = true;
			game?.dispose();
			gameRef.current = null;
		};
	}, []);
	const onStart = (0, import_react.useCallback)(() => {
		setLive(true);
		const g = gameRef.current;
		if (g) {
			g.startFromMenu();
			return;
		}
		pendingStart.current = true;
		setQueued(true);
	}, []);
	const onSelect = (0, import_react.useCallback)((id) => {
		setHud((h) => ({
			...h,
			character: id
		}));
		gameRef.current?.selectCharacter(id);
	}, []);
	const onPause = (0, import_react.useCallback)(() => gameRef.current?.pause(), []);
	const onResume = (0, import_react.useCallback)(() => gameRef.current?.resume(), []);
	const onRetry = (0, import_react.useCallback)(() => gameRef.current?.retry(), []);
	const onMenu = (0, import_react.useCallback)(() => {
		setLive(false);
		gameRef.current?.backToMenu();
	}, []);
	const onMute = (0, import_react.useCallback)(() => gameRef.current?.toggleMute(), []);
	const showHero = !live && hud.phase === "menu";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		ref: shellRef,
		className: "game-shell relative h-dvh w-full overflow-hidden",
		children: [
			showHero ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: HERO[hud.character],
				alt: "",
				width: 720,
				height: 1280,
				className: "hero-fallback",
				draggable: false
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "game-canvas",
				onContextMenu: (e) => e.preventDefault()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameOverlay, {
				hud: live && hud.phase === "menu" ? {
					...hud,
					phase: "intro"
				} : hud,
				ready,
				queued,
				bootError,
				onStart,
				onSelect,
				onPause,
				onResume,
				onRetry,
				onMenu,
				onMute
			})
		]
	});
}
//#endregion
export { Home as component };

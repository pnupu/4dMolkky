// The heads-up display and menus, as plain DOM over the canvas.

import "./styles.css";
import { PIN_RADIUS } from "../game/equipment";
import type { ThrowStyle } from "../game/field";
import { MAX_MISSES, type Match, TARGET_SCORE, type ThrowOutcome } from "../game/rules";

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  html = "",
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html) node.innerHTML = html;
  return node;
};

/** A pin as the compass draws it: position in the slice frame, in metres. */
export interface CompassDot {
  label: string;
  side: number;
  hidden: number;
  /** Ground (x, w), to turn the slice toward the dot when it is clicked. */
  x: number;
  w: number;
  skittle?: boolean;
}

export interface HudEvents {
  start: (names: string[]) => void;
  resume: () => void;
  menu: () => void;
  restart: () => void;
  cycleStyle: () => void;
  cycleLoft: () => void;
  /** Turn the slice so that ground point (x, w) lies in it. */
  turnTo: (x: number, w: number) => void;
  /** Touch buttons: turn the slice while held. -1, 0 or 1. */
  turnHold: (direction: number) => void;
}

export const STYLE_NAMES: Record<ThrowStyle, string> = {
  wide: "Wide",
  deep: "Deep",
  spear: "Spear",
};

const STYLE_HELP: Record<ThrowStyle, string> = {
  wide: "sideways, sweeps your slice",
  deep: "points into the 4th dimension, sweeps the hidden pins",
  spear: "end-on, hits one pin",
};

export class Hud {
  private readonly root: HTMLElement;
  private readonly scores = el("div", "scores");
  private readonly compassCanvas = el("canvas");
  private readonly compassAngle = el("span", "compass-angle");
  private readonly throwbar = el("div", "throwbar");
  private readonly powerFill = el("div", "power-fill");
  private readonly powerValue = el("span", "power-value", "0%");
  private readonly styleChip = el("button", "chip");
  private readonly loftChip = el("button", "chip");
  private readonly toast = el("div", "toast panel");
  private readonly turn = el("div", "turn panel");
  private readonly hint = el("div", "hint panel");
  private readonly menu = el("div", "overlay menu");
  private readonly pause = el("div", "overlay");
  private readonly over = el("div", "overlay");
  private readonly turners = el("div");
  private dots: CompassDot[] = [];
  private compassScale = 1;
  private playerCount = 1;
  /** Seconds of game time left for the toast and the hint. */
  private toastLeft = 0;
  private hintLeft = 0;

  constructor(private readonly events: HudEvents) {
    this.root = document.getElementById("hud")!;
    this.buildCompass();
    this.buildThrowbar();
    this.buildMenu();
    this.buildPause();
    this.root.append(this.scores, this.turn, this.hint, this.toast, this.throwbar);
    this.buildTurners();
    this.root.append(this.menu, this.pause, this.over);
    this.setPlaying(false);
  }

  // --- Building ----------------------------------------------------------------

  private buildCompass(): void {
    const panel = el("div", "compass panel");
    const head = el("div", "compass-head");
    head.append(el("span", "label", "4D compass"), this.compassAngle);
    const size = 208;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.compassCanvas.width = size * ratio;
    this.compassCanvas.height = size * ratio;
    this.compassCanvas.setAttribute("aria-label", "Pins around your slice of the fourth dimension");
    this.compassCanvas.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      const box = this.compassCanvas.getBoundingClientRect();
      const px = ((event.clientX - box.left) / box.width - 0.5) * 2;
      const py = -((event.clientY - box.top) / box.height - 0.5) * 2;
      let best: CompassDot | null = null;
      let bestDistance = 0.16;
      for (const dot of this.dots) {
        if (dot.skittle) continue;
        const d = Math.hypot(
          dot.side * this.compassScale - px,
          dot.hidden * this.compassScale - py,
        );
        if (d < bestDistance) {
          bestDistance = d;
          best = dot;
        }
      }
      if (best) this.events.turnTo(best.x, best.w);
    });
    const key = el("div", "compass-key");
    key.innerHTML = `<span><i class="key-dot" style="background:var(--below)"></i>blue side</span><span><i class="key-dot" style="background:var(--ink)"></i>your slice</span><span><i class="key-dot" style="background:var(--above)"></i>amber side</span>`;
    panel.append(head, this.compassCanvas, key);
    this.root.append(panel);
  }

  private buildThrowbar(): void {
    const power = el("div", "power panel");
    const track = el("div", "power-track");
    track.append(this.powerFill);
    power.append(el("span", "label", "Power"), track, this.powerValue);
    this.styleChip.type = "button";
    this.styleChip.addEventListener("pointerdown", (event) => event.stopPropagation());
    // Give focus back after a click: a focused button would also fire when Space,
    // the charge key, is released.
    this.styleChip.addEventListener("click", () => {
      this.styleChip.blur();
      this.events.cycleStyle();
    });
    this.loftChip.type = "button";
    this.loftChip.title = "How high the throw goes";
    this.loftChip.addEventListener("pointerdown", (event) => event.stopPropagation());
    this.loftChip.addEventListener("click", () => {
      this.loftChip.blur();
      this.events.cycleLoft();
    });
    const hints = el("div", "chips left");
    hints.append(
      el("span", "chip", "<kbd>Hold</kbd> charge, release to throw"),
      el("span", "chip", "<kbd>Scroll</kbd> or <kbd>Q</kbd><kbd>E</kbd> turn through 4D"),
    );
    const setup = el("div", "chips right");
    setup.append(this.loftChip, this.styleChip);
    this.throwbar.append(hints, power, setup);
  }

  /** Two buttons that turn the slice, for screens without a scroll wheel. */
  private buildTurners(): void {
    this.turners.className = "turners";
    for (const [direction, label, glyph] of [
      [-1, "Turn the view one way through the fourth dimension", "\u21ba"],
      [1, "Turn the view the other way through the fourth dimension", "\u21bb"],
    ] as const) {
      const button = el("button", "turner panel", glyph);
      button.type = "button";
      button.setAttribute("aria-label", label);
      const stop = (): void => this.events.turnHold(0);
      button.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
        button.setPointerCapture(event.pointerId);
        this.events.turnHold(direction);
      });
      button.addEventListener("pointerup", stop);
      button.addEventListener("pointercancel", stop);
      this.turners.append(button);
    }
    this.root.append(this.turners);
  }

  private buildMenu(): void {
    const card = el("div", "card panel");
    const head = el("div");
    head.append(
      el("h1", "title", "4D Mölkky <em>First Light</em>"),
      el(
        "p",
        "subtitle",
        "Twelve pins stand in four dimensions. You see one slice at a time. Turn your view, find the pins, and score exactly 50.",
      ),
    );
    const players = el("div", "field");
    const segmented = el("div", "segmented");
    const names = el("div", "names");
    const defaults = ["Aino", "Eero", "Ilta", "Otso"];
    const renderNames = (): void => {
      names.replaceChildren();
      for (let i = 0; i < this.playerCount; i++) {
        const input = el("input");
        input.value = defaults[i];
        input.maxLength = 12;
        input.setAttribute("aria-label", `Name of player ${i + 1}`);
        names.append(input);
      }
      names.style.display = this.playerCount > 1 ? "grid" : "none";
    };
    for (let n = 1; n <= 4; n++) {
      const button = el("button", "", n === 1 ? "Solo" : `${n} players`);
      button.type = "button";
      button.setAttribute("aria-pressed", String(n === 1));
      button.addEventListener("click", () => {
        this.playerCount = n;
        for (const b of segmented.children) b.setAttribute("aria-pressed", String(b === button));
        renderNames();
      });
      segmented.append(button);
    }
    renderNames();
    players.append(el("span", "label", "Players"), segmented, names);

    const how = el("ul", "how");
    how.innerHTML = `
      <li><span>1</span><span><b>Aim</b> with the pointer. <b>Hold</b> to charge, <b>release</b> to throw. The ring shows where the skittle lands.</span></li>
      <li><span>2</span><span><b>Scroll</b> to turn your view through the fourth dimension. Hidden pins show as <b style="color:var(--below)">blue</b> and <b style="color:var(--above)">amber</b> ghosts.</span></li>
      <li><span>3</span><span><b>One pin</b> down scores its number. <b>Several</b> score their count. Reach exactly ${TARGET_SCORE}: go over and you drop to 25.</span></li>`;
    const actions = el("div", "actions");
    const start = el("button", "btn primary", "Play");
    start.type = "button";
    start.addEventListener("click", () => {
      const inputs = [...names.querySelectorAll("input")];
      const list = inputs.map((input, i) => input.value.trim() || defaults[i]);
      this.events.start(this.playerCount === 1 ? ["You"] : list);
    });
    actions.append(start);
    card.append(head, players, how, actions);
    card.append(
      el(
        "p",
        "fineprint",
        "Three misses in a row end your game. Sound starts with your first click.",
      ),
    );
    this.menu.append(card);
  }

  private buildPause(): void {
    const card = el("div", "card panel wide");
    card.append(el("h1", "title", "Paused"));
    const how = el("ul", "how");
    how.innerHTML = `
      <li><span>→</span><span><b>Pointer</b> aims. <b>Hold</b> the button or <kbd>Space</kbd> to charge, <b>release</b> to throw.</span></li>
      <li><span>↻</span><span><b>Scroll</b>, <kbd>Q</kbd> <kbd>E</kbd> or <kbd>←</kbd> <kbd>→</kbd> turn your slice through the fourth dimension. Click a pin in the compass to turn to it. <kbd>0</kbd> turns back.</span></li>
      <li><span>↑</span><span><kbd>W</kbd> <kbd>S</kbd> change the loft. <kbd>T</kbd> changes how you hold the skittle.</span></li>
      <li><span>◎</span><span><kbd>V</kbd> zooms in on the pins. <kbd>L</kbd> shows or hides the pin numbers. <kbd>M</kbd> mutes the sound.</span></li>`;
    const actions = el("div", "actions");
    const resume = el("button", "btn primary", "Resume");
    const restart = el("button", "btn", "Restart");
    const menu = el("button", "btn", "Main menu");
    for (const b of [resume, restart, menu]) b.type = "button";
    resume.addEventListener("click", () => this.events.resume());
    restart.addEventListener("click", () => this.events.restart());
    menu.addEventListener("click", () => this.events.menu());
    actions.append(resume, restart, menu);
    card.append(how, actions);
    this.pause.append(card);
  }

  // --- State -------------------------------------------------------------------

  showMenu(show: boolean): void {
    this.menu.classList.toggle("show", show);
  }

  showPause(show: boolean): void {
    this.pause.classList.toggle("show", show);
  }

  /** Show or hide everything that belongs to a running match. */
  setPlaying(playing: boolean): void {
    const display = playing ? "" : "none";
    this.scores.style.display = display;
    this.turn.style.display = display;
    this.throwbar.style.display = playing ? "grid" : "none";
    this.turners.style.visibility = playing ? "visible" : "hidden";
    (this.compassCanvas.parentElement as HTMLElement).style.display = playing ? "flex" : "none";
    if (!playing) {
      this.toast.classList.remove("show");
      this.hint.classList.remove("show");
    }
  }

  setThrowbar(visible: boolean): void {
    this.throwbar.classList.toggle("hidden", !visible);
  }

  setPower(power: number): void {
    this.powerFill.style.transform = `scaleX(${power.toFixed(3)})`;
    this.powerValue.textContent = `${Math.round(power * 100)}%`;
  }

  setThrowSetup(style: ThrowStyle, loftDegrees: number): void {
    this.styleChip.innerHTML = `<kbd>T</kbd> Hold: <b>${STYLE_NAMES[style]}</b>`;
    this.styleChip.title = STYLE_HELP[style];
    this.loftChip.innerHTML = `<kbd>W</kbd><kbd>S</kbd> Loft <b>${Math.round(loftDegrees)}°</b>`;
  }

  setScores(match: Match): void {
    this.scores.replaceChildren();
    match.players.forEach((player, i) => {
      const card = el("div", "score panel");
      if (i === match.current && !match.over) card.classList.add("current");
      if (player.eliminated) card.classList.add("out");
      const value = el("div", "score-value", `${player.score}<small> / ${TARGET_SCORE}</small>`);
      const bar = el("div", "score-bar");
      const fill = el("i");
      fill.style.transform = `scaleX(${player.score / TARGET_SCORE})`;
      bar.append(fill);
      const meta = el("div", "score-meta");
      const misses = el("div", "misses");
      misses.setAttribute("aria-label", `${player.misses} of ${MAX_MISSES} misses`);
      for (let m = 0; m < MAX_MISSES; m++) misses.append(el("i", m < player.misses ? "on" : ""));
      const need = TARGET_SCORE - player.score;
      meta.append(
        el(
          "span",
          "",
          player.eliminated
            ? "Out"
            : `<span class="wide-only">${player.throws.length} throws · </span>needs ${need}`,
        ),
        misses,
      );
      card.append(el("div", "score-name", escapeHtml(player.name)), value, bar, meta);
      this.scores.append(card);
    });
    const player = match.players[match.current];
    this.turn.innerHTML = match.solo
      ? `Throw <b>${player.throws.length + 1}</b>`
      : `<b>${escapeHtml(player.name)}</b> to throw`;
  }

  showOutcome(outcome: ThrowOutcome, name: string): void {
    const points = outcome.points;
    let text: string;
    const out = name === "You" ? "You are out." : `${name} is out.`;
    if (points === 0) text = outcome.eliminated ? `Third miss in a row. ${out}` : "No pin fell.";
    else if (outcome.fallen.length === 1) text = `Pin ${outcome.fallen[0]} fell alone.`;
    else text = `${outcome.fallen.length} pins fell: ${outcome.fallen.join(", ")}.`;
    if (outcome.bust) text += ` Over ${TARGET_SCORE}: back to 25.`;
    this.toast.innerHTML = `<div class="toast-points${points === 0 ? " miss" : ""}">${points === 0 ? "Miss" : `+${points}`}</div><div class="toast-text">${escapeHtml(text)}</div>`;
    this.toast.classList.add("show");
    this.toastLeft = 2.4;
  }

  showHint(text: string, seconds = 6): void {
    this.hint.textContent = text;
    this.hint.classList.add("show");
    this.hintLeft = seconds;
  }

  /** Count down the toast and the hint. Call every frame with the game time step. */
  tick(dt: number): void {
    if (this.toastLeft > 0) {
      this.toastLeft -= dt;
      if (this.toastLeft <= 0) this.toast.classList.remove("show");
    }
    if (this.hintLeft > 0) {
      this.hintLeft -= dt;
      if (this.hintLeft <= 0) this.hint.classList.remove("show");
    }
  }

  showGameOver(match: Match, best: number | null): void {
    this.over.replaceChildren();
    const card = el("div", "card panel");
    const winner = match.winner === null ? null : match.players[match.winner];
    const head = el("div");
    if (winner) {
      const throws = winner.throws.length;
      head.append(
        el(
          "h1",
          "title",
          match.solo ? "Exactly <em>50</em>" : `<em>${escapeHtml(winner.name)}</em> wins`,
        ),
        el(
          "p",
          "subtitle",
          match.solo
            ? `You finished in ${throws} throws.${best !== null && best === throws ? " That is your best game." : best !== null ? ` Your best is ${best}.` : ""}`
            : match.wonByElimination
              ? `${escapeHtml(winner.name)} is the last player standing and takes the full 50.`
              : `${escapeHtml(winner.name)} reached exactly 50 in ${throws} throws.`,
        ),
      );
    } else {
      head.append(
        el("h1", "title", "Three misses"),
        el("p", "subtitle", "Three throws in a row without a fallen pin end the game."),
      );
    }
    const final = el("div", "final");
    for (const player of match.players) {
      const row = el("div", "final-row");
      row.append(
        el("span", "", escapeHtml(player.name)),
        el("span", "", `${player.score} points · ${player.throws.length} throws`),
      );
      final.append(row);
    }
    const actions = el("div", "actions");
    const again = el("button", "btn primary", "Play again");
    const menu = el("button", "btn", "Main menu");
    again.type = menu.type = "button";
    again.addEventListener("click", () => this.events.restart());
    menu.addEventListener("click", () => this.events.menu());
    actions.append(again, menu);
    card.append(head, final, actions);
    this.over.append(card);
    this.over.classList.add("show");
  }

  hideGameOver(): void {
    this.over.classList.remove("show");
  }

  // --- Compass -----------------------------------------------------------------

  /**
   * Draw the pins as seen along the throwing direction. Sideways on the canvas is
   * sideways in the view. Up and down are the two hidden sides of the slice.
   */
  drawCompass(dots: CompassDot[], sliceDegrees: number): void {
    this.dots = dots;
    this.compassAngle.textContent = `${Math.round(sliceDegrees)}°`;
    const canvas = this.compassCanvas;
    const g = canvas.getContext("2d")!;
    const size = canvas.width;
    const half = size / 2;
    let extent = 0.13;
    for (const d of dots) if (!d.skittle) extent = Math.max(extent, Math.hypot(d.side, d.hidden));
    const targetScale = 0.74 / extent;
    this.compassScale += (targetScale - this.compassScale) * 0.12;
    const scale = this.compassScale * half;
    g.clearRect(0, 0, size, size);
    g.save();
    g.translate(half, half);

    // Rings at fixed ground distances.
    g.lineWidth = Math.max(1, size / 208);
    for (const metres of [0.1, 0.25, 0.5, 1, 2, 4]) {
      const r = metres * scale;
      if (r < half * 0.18 || r > half * 0.98) continue;
      g.strokeStyle = "rgba(246, 241, 231, 0.10)";
      g.beginPath();
      g.arc(0, 0, r, 0, Math.PI * 2);
      g.stroke();
    }
    // Hidden sides.
    const gradient = g.createLinearGradient(0, -half, 0, half);
    gradient.addColorStop(0, "rgba(255, 171, 61, 0.16)");
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(74, 168, 255, 0.16)");
    g.fillStyle = gradient;
    g.beginPath();
    g.arc(0, 0, half * 0.98, 0, Math.PI * 2);
    g.fill();
    // The slice: a band one pin radius thick.
    const band = Math.max(PIN_RADIUS * scale, 1.5);
    g.fillStyle = "rgba(246, 241, 231, 0.16)";
    g.fillRect(-half, -band, size, band * 2);
    g.strokeStyle = "rgba(246, 241, 231, 0.55)";
    g.beginPath();
    g.moveTo(-half, 0);
    g.lineTo(half, 0);
    g.stroke();

    // Dots are as large as the nearest pair allows, so close pins stay apart.
    let nearest = Number.POSITIVE_INFINITY;
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        if (dots[i].skittle || dots[j].skittle) continue;
        const d = Math.hypot(dots[i].side - dots[j].side, dots[i].hidden - dots[j].hidden);
        if (d > 0.008 && d < nearest) nearest = d;
      }
    }
    const radius = Math.max(size * 0.04, Math.min(nearest * scale * 0.48, size * 0.075));
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `700 ${Math.round(radius * 1.15)}px "Avenir Next", "Helvetica Neue", Arial, sans-serif`;
    const ordered = [...dots].sort((a, b) => Math.abs(b.hidden) - Math.abs(a.hidden));
    const drawn: { x: number; y: number }[] = [];
    for (const d of ordered) {
      let x = d.side * scale;
      let y = -d.hidden * scale;
      // Pins that stand one behind the other along the throw would hide each other:
      // fan them out a little.
      for (const other of drawn) {
        if (Math.hypot(other.x - x, other.y - y) < radius * 0.9) {
          x += radius * 0.7;
          y -= radius * 0.9;
        }
      }
      if (!d.skittle) drawn.push({ x, y });
      const inSlice = Math.abs(d.hidden) < PIN_RADIUS;
      if (d.skittle) {
        g.fillStyle = "rgba(255,255,255,0.9)";
        g.beginPath();
        g.arc(x, y, radius * 0.45, 0, Math.PI * 2);
        g.fill();
        continue;
      }
      g.fillStyle = inSlice ? "#f6f1e7" : d.hidden > 0 ? "#ffab3d" : "#4aa8ff";
      g.globalAlpha = inSlice ? 1 : 0.9;
      g.beginPath();
      g.arc(x, y, radius, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
      g.strokeStyle = "rgba(16, 20, 28, 0.55)";
      g.stroke();
      g.fillStyle = "#14171d";
      g.fillText(d.label, x, y + radius * 0.06);
    }
    g.restore();
  }
}

const escapeHtml = (text: string): string =>
  text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

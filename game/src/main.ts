import { App, type DebugApi } from "./app";

declare global {
  interface Window {
    molkky?: DebugApi;
  }
}

const canvas = document.getElementById("scene") as HTMLCanvasElement;
try {
  const app = new App(canvas);
  window.molkky = app.debugApi();
} catch (error) {
  console.error(error);
  const hud = document.getElementById("hud")!;
  hud.innerHTML =
    '<div class="overlay show"><div class="card panel"><h1 class="title">This browser cannot show the game</h1><p class="subtitle">4D Mölkky needs WebGL 2. Try a current version of Chrome, Edge, Firefox or Safari.</p></div></div>';
}

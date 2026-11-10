// Pin numbers drawn over the 3D view with leader lines.
//
// Pins that stand close together on screen share one tidy row of labels above them,
// so the numbers never pile up on the rack.

export interface LabelItem {
  text: string;
  /** Anchor on screen, in CSS pixels. */
  x: number;
  y: number;
  /** Null for a pin in the slice, else the ghost colour. */
  tint: string | null;
  /** 0 to 1: how visible the label is. */
  alpha: number;
}

const RADIUS = 10;
const PITCH = 24;
const LIFT = 26;
const CLUSTER_REACH = 30;

export class LabelLayer {
  readonly canvas = document.createElement("canvas");
  private readonly g: CanvasRenderingContext2D;
  private ratio = 1;

  constructor() {
    this.canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none";
    this.g = this.canvas.getContext("2d")!;
    this.resize();
  }

  resize(): void {
    this.ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(window.innerWidth * this.ratio);
    this.canvas.height = Math.round(window.innerHeight * this.ratio);
  }

  draw(items: LabelItem[]): void {
    const g = this.g;
    g.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    g.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (items.length === 0) return;

    // Group anchors that are near each other (single linkage).
    const group = items.map((_, i) => i);
    const find = (i: number): number => {
      while (group[i] !== i) i = group[i];
      return i;
    };
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (Math.hypot(items[i].x - items[j].x, items[i].y - items[j].y) < CLUSTER_REACH)
          group[find(i)] = find(j);
      }
    }
    const clusters = new Map<number, number[]>();
    items.forEach((_, i) => {
      const root = find(i);
      const list = clusters.get(root);
      if (list) list.push(i);
      else clusters.set(root, [i]);
    });

    const spots: { x: number; y: number }[] = items.map((item) => ({
      x: item.x,
      y: item.y - LIFT,
    }));
    for (const members of clusters.values()) {
      if (members.length === 1) continue;
      members.sort((a, b) => items[a].x - items[b].x);
      const centre = members.reduce((sum, i) => sum + items[i].x, 0) / members.length;
      const top = Math.min(...members.map((i) => items[i].y));
      const perRow = Math.min(members.length, 8);
      members.forEach((i, k) => {
        const row = Math.floor(k / perRow);
        const inRow = Math.min(perRow, members.length - row * perRow);
        const column = k - row * perRow;
        spots[i].x = centre + (column - (inRow - 1) / 2) * PITCH;
        spots[i].y = top - LIFT - 8 - row * PITCH;
      });
    }

    g.textAlign = "center";
    g.textBaseline = "middle";
    g.lineWidth = 1;
    items.forEach((item, i) => {
      const spot = spots[i];
      g.globalAlpha = item.alpha * 0.7;
      g.strokeStyle = item.tint ?? "#ffffff";
      g.beginPath();
      g.moveTo(item.x, item.y);
      g.lineTo(spot.x, spot.y + RADIUS);
      g.stroke();
    });
    items.forEach((item, i) => {
      const spot = spots[i];
      g.globalAlpha = item.alpha;
      g.fillStyle = "rgba(16, 20, 28, 0.82)";
      g.beginPath();
      g.arc(spot.x, spot.y, RADIUS, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 1.5;
      g.strokeStyle = item.tint ?? "rgba(255, 255, 255, 0.85)";
      g.stroke();
      g.fillStyle = item.tint ?? "#ffffff";
      g.font = '700 11px "Avenir Next", "Helvetica Neue", Arial, sans-serif';
      g.fillText(item.text, spot.x, spot.y + 0.5);
    });
    g.globalAlpha = 1;
  }
}

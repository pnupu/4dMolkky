// Mölkky scoring and turn order (wiki: Mölkky Rules Model, I.M.O. interpretation).

export const TARGET_SCORE = 50;
export const BUST_SCORE = 25;
export const MAX_MISSES = 3;

export interface Player {
  name: string;
  score: number;
  /** Consecutive throws with zero points. */
  misses: number;
  eliminated: boolean;
  /** Points of each throw, in order. */
  throws: number[];
}

export interface ThrowOutcome {
  player: number;
  /** Numbers of the pins that count as fallen. */
  fallen: number[];
  points: number;
  /** The total went over 50 and dropped back to 25. */
  bust: boolean;
  eliminated: boolean;
  /** Index of the winner when this throw ended the match, else null. */
  winner: number | null;
  /** True when the match is over, with or without a winner. */
  matchOver: boolean;
}

/** One fallen pin scores its number. Two or more score their count. */
export const throwPoints = (fallen: number[]): number =>
  fallen.length === 1 ? fallen[0] : fallen.length;

export class Match {
  readonly players: Player[];
  current = 0;
  winner: number | null = null;
  over = false;

  constructor(names: string[]) {
    this.players = names.map((name) => ({
      name,
      score: 0,
      misses: 0,
      eliminated: false,
      throws: [],
    }));
  }

  get solo(): boolean {
    return this.players.length === 1;
  }

  /** Total throws taken by all players. */
  get throwCount(): number {
    return this.players.reduce((n, p) => n + p.throws.length, 0);
  }

  /** Apply a settled throw for the current player and advance the turn. */
  applyThrow(fallen: number[]): ThrowOutcome {
    if (this.over) throw new Error("The match is over");
    const index = this.current;
    const player = this.players[index];
    const points = throwPoints(fallen);
    player.throws.push(points);
    let bust = false;
    if (points === 0) {
      player.misses += 1;
      if (player.misses >= MAX_MISSES) player.eliminated = true;
    } else {
      player.misses = 0;
      player.score += points;
      if (player.score > TARGET_SCORE) {
        player.score = BUST_SCORE;
        bust = true;
      }
    }

    const active = this.players.filter((p) => !p.eliminated);
    if (player.score === TARGET_SCORE) {
      this.winner = index;
      this.over = true;
    } else if (active.length === 0) {
      this.over = true;
    } else if (!this.solo && active.length === 1) {
      // The last side standing wins the set.
      this.winner = this.players.indexOf(active[0]);
      this.over = true;
    } else {
      do {
        this.current = (this.current + 1) % this.players.length;
      } while (this.players[this.current].eliminated);
    }
    return {
      player: index,
      fallen,
      points,
      bust,
      eliminated: player.eliminated,
      winner: this.winner,
      matchOver: this.over,
    };
  }
}

// Real Mölkky dimensions (wiki: Mölkky Rules), carried into four dimensions.

import { Shape } from "../physics/shape";

export const PIN_RADIUS = 0.0295;
export const PIN_HEIGHT = 0.15;
export const SKITTLE_LENGTH = 0.225;
/** Distance from the throwing line to the front of the rack. */
export const THROW_DISTANCE = 3.5;

let pin: Shape | undefined;
let skittle: Shape | undefined;

/** A numbered pin: 15 cm tall, 5.9 cm across, top cut at 45 degrees. */
export const pinShape = (): Shape => {
  pin ??= new Shape({ radius: PIN_RADIUS, height: PIN_HEIGHT, bevel: 1, mass: 0.26 });
  return pin;
};

/** The throwing skittle: 22.5 cm long, 5.9 cm across, flat ends. */
export const skittleShape = (): Shape => {
  skittle ??= new Shape({ radius: PIN_RADIUS, height: SKITTLE_LENGTH, bevel: 0, mass: 0.42 });
  return skittle;
};

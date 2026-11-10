# First Light — desktop playtest

A solo wooden-pin game with four spatial dimensions. Win by reaching exactly 50 points in as few throws as possible.

## Play

1. Start a solo match from the menu. The normal camera shows the lakeside field; V gives an optional closer inspection view.
2. Aim with the mouse. Hold Space to charge, then release once to throw. T makes a quick throw.
3. Wait until the pins settle. One fallen pin scores its number; several score their count. Leaning pins do not score.
4. Press T after a result to stand the affected pins at their landing positions and recover the throwing skittle. Their W displacement remains.
5. Reach exactly 50. An overshoot returns the score to 25. Three consecutive misses ends the match.

## Find a pin in four dimensions

- Standing pins use the actual slice geometry. With W aids enabled, falling and fallen pins use a continuous numbered wooden projection instead of fragmented cross-sections.
- Blue tint and outlines indicate negative W; amber indicates positive W. W silhouettes and ground shadows stay visible even far from the current slice and with body aids off. Projected bodies become slightly translucent away from the slice. These are visual aids, not extra colliders or scoring pins.
- F cycles targets and moves only to the selected pin's W slice. It does not aim at the pin: keep your mouse aim and choose the shot yourself. Isolating a single pin is a precision shot; selecting its number is not a lock-on.
- Tab releases the pointer so you can select a numbered target in the bottom row. Selection changes only the W slice, just like F. It cancels a charged throw; throwing is disabled while selecting targets. Tab again returns to mouse aiming.
- Q / E move the slice slowly. 0 restores the home slice and view.
- Hold the left mouse button while moving the mouse to turn the viewing plane through W.
- G toggles full-body aids: off shows literal wooden slices, on restores readable falling-pin bodies. W silhouettes and ground shadows stay on in both modes. This does not move pins or change scoring.
- Normal play uses a 50° field of view to show the lakeside setting. V toggles an optional 18° inspection view; starting or resetting a match restores the normal view. Neither view moves the throwing position or changes aim.

## Other controls

- H: show or hide help.
- Esc: pause, change sound/mouse settings, resume, restart, or return to the menu.
- R: start a new match immediately.
- The game pauses when it loses focus. Resume after returning. After pause, restart, starting a match, or leaving pointer mode, release Space and T before pressing again; a held key cannot launch a throw during the transition.
- Arming stops an ongoing automatic slice movement at the current W position, so the launch slice cannot drift while charging. Mouse aim and the existing power curve remain available.
- Sound level, mouse sensitivity, and the best winning throw count are stored locally. Automated captures do not submit personal bests.

## Current boundaries

This candidate is single-player desktop software. It does not include VR, phone controls, multiplayer, Steam achievements, or tested gamepad/Steam Deck support. Its four-dimensional contact and fall solver is deterministic gameplay code, not a general rigid-body engine.

Engine4D is by HackerPoet and is used under its included MIT license. The working Mölkky title is not a claim of endorsement or commercial brand permission.

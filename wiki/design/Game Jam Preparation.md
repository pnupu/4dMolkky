# Game Jam Preparation

This page defines the smallest preparation package needed to start the Nimble Game Jam with working tools, a safe submission path, and a realistic VR option.

## Current Readiness

- Unity Hub is installed on the development Mac.
- Unity `2022.2.2f1`, the exact version recorded by Engine4D, is installed.
- Engine4D imports, compiles, and runs its desktop sample.
- The current prototype has a working desktop-first throwing loop under active development.
- XR is not yet validated on real hardware.
- Unity Android and Windows build-support modules were not found in the installed editor on 2026-08-31.
- The current macOS OpenXR configuration cannot provide the required headset runtime in Play Mode.

## Hardware Recommendation

Prefer borrowing or renting a Meta Quest 2, Quest 3S, or Quest 3 before buying. A standalone Quest is the most practical first test because an Android build can be produced from the Mac, while PC-tethered OpenXR testing would also require a suitable Windows gaming PC.

If buying:

- Choose Quest 3 when lens clarity and repeated development use justify the higher cost.
- Choose Quest 3S when minimizing cost matters more than optical clarity.
- Consider a used Quest 2 only as a low-cost development device; confirm both controllers work, the lenses are undamaged, the USB port is reliable, and the battery can survive a test session.

Minimum useful kit:

- headset and both tracked controllers,
- a USB-C data cable, not merely a charging cable,
- charger and enough power for repeated builds,
- a clear play area,
- optional spare battery or powered strap for longer sessions.

Do not buy a headset solely on the assumption that Engine4D VR works. First secure a returnable, borrowed, or rented unit and pass the deployment spike below.

## Pre-Jam Checklist

### Registration and logistics

- [ ] Join the jam on itch.io.
- [ ] Join the Nimble Fox Discord and enable announcement notifications.
- [ ] Decide remote versus Founders House participation.
- [ ] Submit the on-site form for every attending team member if using the venue.
- [ ] Confirm the team roster, Discord usernames, responsibilities, and communication channel.
- [ ] Re-check the detailed schedule and opening ceremony in Discord.

### Unity and repository

- [x] Install Unity Hub.
- [x] Install Unity `2022.2.2f1`.
- [x] Open Engine4D and run its desktop sample.
- [ ] Add Android Build Support, Android SDK & NDK Tools, and OpenJDK to `2022.2.2f1` if targeting Quest.
- [ ] Confirm the prototype opens without compiler errors from a clean launch.
- [ ] Produce a desktop build outside the editor and test it on another account or machine if possible.
- [ ] Decide whether the jam branch starts from the current prototype or a clean project that imports selected Engine4D work.
- [ ] Create a build folder and exclude it from version control.

### VR deployment spike

- [ ] Obtain a Quest-class headset and working controllers by Thursday.
- [ ] Enable developer mode and verify the headset is recognized over USB.
- [ ] Add Android as an XR target without removing the known-good desktop path.
- [ ] Build and install a minimal static Engine4D scene.
- [ ] Verify stereo rendering, head tracking, both controllers, readable UI, and acceptable frame rate.
- [ ] Run a five-minute comfort test with slice/4D controls.
- [ ] Record the exact build steps and failure modes.

Pass condition: a fresh build can be installed and launched twice, with stereo rendering and controller tracking working.

Fallback deadline: if this has not passed by Thursday evening, make the jam submission desktop-first and treat VR as an optional post-submission or stretch build.

### Submission safety

- [ ] Create an itch.io draft page before Sunday.
- [ ] Prepare a README template with controls, download instructions, supported OS/headset, and known issues.
- [ ] Maintain an asset and license credit list as assets enter the project.
- [ ] Make the first downloadable build by Saturday evening.
- [ ] Freeze new features early Sunday and reserve time for packaging and upload.
- [ ] Submit a tested build well before the 18:00 deadline.

## Jam Scope Guardrails

- Aim for one legible throw-and-score loop, not a complete Mölkky simulation.
- Keep a desktop build playable even if headset support works.
- Use premade public assets only with captured license and attribution details.
- Wait for the announced theme before committing the jam game's theme-specific content.
- Favor Most Creative Concept: meaningful fourth-dimensional play is the project's strongest differentiator.

## Risks

- Engine4D's VR support remains work in progress and may require shader or camera adaptation.
- Unity `2022.2.2f1` is old and not an LTS release, but changing versions immediately before a jam adds migration risk.
- Standalone Quest performance may be substantially lower than the validated desktop sample.
- Buying hardware late leaves little time to resolve developer-mode, USB, XR package, or rendering issues.

## Sources

- [[Nimble Game Jam]]
- [[Engine Selection]]
- [[Engine4D Project Inspection]]
- [[VR Feasibility]]
- [[Prototype Scope]]

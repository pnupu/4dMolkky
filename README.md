# 4D Mölkky

Desktop game and research workspace for four-dimensional wooden-pin gameplay.

## Current State

`0.11.1 · First Light` is the current Mac hackathon candidate. Selecting a pin now changes only W: no automatic camera aim. Single-pin shots require the player's mouse aim, without random spread or altered collisions. The complete solo loop, ground-led falls, wider scatter, persistent W shadows, wide lakeside camera and sound remain. Seven final Air jobs plus a focused interface check pass; the 22-run lifecycle stress test belongs to 0.11.0. VR and phone input remain future work.

[Download candidate, instructions and credits](https://first-light-mac-candidat-9e9autz9cj-ilkka-lappetelainen.dev-pages.vinssi.ai) · [Actual Air gameplay](https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai).

Not yet submission-ready: Gatekeeper rejects the non-notarized download, physical newcomer/input acceptance is pending, and theme/team/eligibility plus the authenticated itch.io entry remain unresolved. The archive and its 33 file hashes are verified after public download on the Air; that is not a successful normal first launch.

This repo contains:

- an LLM-maintained design/research wiki in `wiki/`,
- immutable source records in `raw/sources/`,
- Engine4D as a git submodule in `external/Engine4D`,
- the Unity game under `external/Engine4D/Assets/Prototype/`,
- player instructions in `docs/PLAYER_GUIDE.md`,
- hackathon acceptance in `wiki/design/Hackathon Submission Readiness.md` and submission copy in `docs/JAM_SUBMISSION.md`.

Start with `docs/JAM_README.md` to install and play, or `wiki/index.md` for the knowledge base. The active target is a hackathon entry, not a Steam launch. Steam preparation remains a deferred reference under `ops/steam/`.

Current candidate evidence and unresolved release gates are in `docs/RELEASE_CANDIDATE.md`. Earlier validation history is in `docs/unity-validation-results.md`.

## Engine4D Submodule

After cloning this repo, initialize Engine4D with:

```sh
git submodule update --init --recursive
```

Engine4D currently targets Unity `2022.2.2f1`.

## Build and validate

On the configured MacBook Air, `python3 ops/unity_cycle.py run` serializes scene generation, development builds, and captured gameplay checks. `python3 -m unittest discover -s ops -p 'test_*.py'` checks the build/package helpers.

`AutomatedMolkkyBuild.BuildHackathonMacOS` creates the non-development, fixed-window IL2CPP macOS build under `MOLKKY_RELEASE_OUTPUT`. See `ops/unity-mac-il2cpp.md` for the matching module and temporary old-zlib/modern-SDK compatibility guard used on the Air. Apply Unity's official CVE-2025-59489 remediation to release binaries and retest the patched output before packaging. A clean rebuild can restore the original runtime; do not skip the security gate because a previous build was patched.

`python3 ops/package_release.py <candidate-root> <archive-output> --platform macos` adds controls, credits, licences, verification limits and SHA-256 manifests. Stage only the `.app`, not the adjacent IL2CPP debug/backup folder. Artifacts are generated under `artifacts/` and are not committed. The older `BuildSteamRelease` and two-platform packaging defaults remain available, but Windows execution is not verified or advertised for the jam package.

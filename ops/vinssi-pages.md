# Vinssi Pages Operations

- Dashboard source: `/Users/ilkka/4dmölkky/docs/gamejam-control/`
- Site ID: `01a06214-3c4c-74db-8cfd-93fb646dd5c9`
- Current version ID: `01a06214-3c51-7349-b7f9-72b1f14a94da`
- URL: https://4d-molkky-jam-runbook-res4f5j545-ilkka-lappetelainen.dev-pages.vinssi.ai
- Environment: `https://dev.vinssi.ai`

Republish with the existing site ID so the phone URL remains stable:

```sh
cd /Users/ilkka/Vertics/locorum-setup/vertics-deploy/apps/cli
VINSSI_API_URL=https://dev.vinssi.ai bun run src/index.ts pages publish \
  /Users/ilkka/4dmölkky/docs/gamejam-control \
  --site 01a06214-3c4c-74db-8cfd-93fb646dd5c9 \
  --json
```

After publication, require HTTP 200 from the dashboard URL.

## Gameplay videos

Always publish user-facing gameplay recordings, comparisons, and slow-motion clips to Vinssi before delivery. A local video path alone is not a finished handoff. Keep the existing playtest URL stable; this is a different site from the dashboard above.

- HTML source: `docs/playtest-video/index.html`
- Current upload folder: `artifacts/video-tests/aim-v0111-site/`
- Site ID: `01a0634c-b8c4-7138-8e3e-28d533611b82`
- Current version ID: `01a07216-56ee-7239-ac9c-19a3d8adc496`
- URL: https://4d-molkky-unity-video-te-2dywdy3wcj-ilkka-lappetelainen.dev-pages.vinssi.ai
- Published 2026-09-05: 24 files, 12,426,239 bytes; actual Air 0.11.1 footage, current screenshots, selected-pin miss and current gameplay/interface reports. The retained lifecycle report is labelled historical 0.11.0. On-demand mobile video loading remains in `docs/playtest-video/video-player.js`; do not treat a desktop browser resized to phone dimensions as mobile playback proof.

Stage the HTML and its referenced assets together, then publish:

```sh
cd /Users/ilkka/Vertics/locorum-setup/vertics-deploy/apps/cli
VINSSI_API_URL=https://dev.vinssi.ai bun run src/index.ts pages publish \
  /Users/ilkka/4dmölkky/artifacts/video-tests/aim-v0111-site \
  --site 01a0634c-b8c4-7138-8e3e-28d533611b82 \
  --json
```

Require HTTP 200 for the page and every referenced asset, compare downloaded video bytes with the originals, and verify decoded browser playback before sharing the link. These checks passed for this version; all three embedded clips advanced without media errors. Older verification downloads under `artifacts/video-tests/scatter-v0101-verification/` belong to 0.10.1, not the current publication.

## Mobile media delivery

Current verification: `artifacts/video-tests/aim-v0111-http-verification.json` and `aim-v0111-mobile-video-report.json`; all 34 assets across gameplay/download sites match and all three clips decode/seek/retry in muted WebKit. The Air public-download report retains the failed Gatekeeper gate separately from successful transfer/hash checks.

The gateway currently answers `Range: bytes=0-1` with HTTP 200 and the full 1,101,586-byte gameplay MP4, rather than HTTP 206 and two bytes. This breaks the range-based media loading used by Safari. The old page stalls at media readyState 0 in Playwright WebKit with iPhone emulation. Apple documents the requirement in [Creating Video for Safari](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/CreatingVideoforSafarioniPhone/CreatingVideoforSafarioniPhone.html).

The page now downloads only the selected short clip with Fetch, gives the native player a local `blob:` URL, and requires an explicit Play tap. It retains native seeking/fullscreen, the original footage/audio, a 30-second download timeout, visible retry on failure, and direct MP4 links. This is a small-clip delivery workaround, not a gateway repair; do not extend full-file buffering to long recordings. Restore ordinary streaming once the gateway demonstrably supports ranges, or use segmented media for larger videos. No automatic clip downloads or autoplay occur.

Keep `video-player.js` with `index.html` when staging. Verification script: `artifacts/video-tests/check-mobile-video.cjs` (uses the installed Playwright 1.62.1 runtime and WebKit 26.5 on macOS). It checks no unsolicited downloads, failed-fetch retry, all three clips decoding/advancing, seeking, and no horizontal overflow at iPhone 13 dimensions. This is WebKit emulation, not physical-iPhone or audible-speaker validation.

The final public-URL run passes with the test player muted. Unmuted playback stalls at readyState 4 even for an independent synthetic H.264/AAC control with no HTTP server; retain `mobile-audio-control.json` as an audio-harness limitation. The shipped player is not forced muted and retains the original audio track. No system audio configuration was changed.

## Mac hackathon candidate download

- Source: `docs/jam-download/index.html`.
- Upload folder: `artifacts/releases/aim-v0111-download-site/`.
- Site ID: `01a0718f-3dbb-70ff-a04d-76d24fbc3a49`.
- Version ID: `01a07216-f77f-740e-8c3c-5a4fc991f739`.
- URL: https://first-light-mac-candidat-9e9autz9cj-ilkka-lappetelainen.dev-pages.vinssi.ai
- Published: 10 files, 44,130,695 bytes, including the exact 42,097,325-byte ZIP, manifest, instructions/credits and three current Air screenshots. Separate from the video site to stay below the 50 MB upload cap.
- ZIP SHA-256: `cdce38a2fdb351ce03a28adfacabd6ebbd6ba5d0115f0a037cf302784bbdb347`.

Republish using this site's ID, not the dashboard or video ID. Air download/extraction verifies the ZIP, 33 file hashes and deep/strict signature. Gatekeeper rejects it (exit 3); the page explicitly states that normal first launch and the jam entry are not accepted. Keep this warning until signed/notarized download acceptance actually passes. A Vinssi candidate is not an itch.io upload or entry.

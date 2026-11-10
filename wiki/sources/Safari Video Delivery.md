# Safari Video Delivery

Safari media delivery depends on server behavior as well as a valid MP4 codec.

## Key points

- Apple documents byte-range support for HTTP-hosted iOS video and a curl test for it.
- Safari Mobile exposes Blob object URLs; the project uses this for short-clip playback after an explicit full-file download.
- Project evidence: the Vinssi MP4 range probe returns the whole file with status 200; original playback stalls at readyState 0 in WebKit iPhone emulation. The local-Blob version loads, decodes, advances and seeks in muted automated tests.
- **Inference:** missing range handling explains the mobile-loading failure. Physical-iPhone playback and audible output remain unverified. Full-file buffering is a bounded-use workaround for these small clips, not a fix for the shared gateway or suitable long-video streaming.

## Sources

- [Apple Safari video guide](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/CreatingVideoforSafarioniPhone/CreatingVideoforSafarioniPhone.html).
- [Apple Blob URL reference](https://developer.apple.com/documentation/webkitjs/domurl/1631236-createobjecturl).
- `raw/sources/safari-video-delivery-2026-09-05.md`, `ops/vinssi-pages.md`, and `artifacts/video-tests/mobile-video-report.json`.

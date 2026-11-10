# Unity Mac IL2CPP Build Compatibility

Records the matching Unity macOS IL2CPP module and the upstream platform guard used to resolve this project's old-editor/modern-SDK compilation failure.

## Key points

- Unity's official 2022.2.2f1 manifest identifies the matching macOS IL2CPP support package. Its size/checksum and trusted Unity installer signature were verified before copying its payload into the Air's user-owned editor.
- Upstream zlib 1.3.1 separates the classic `MACOS` platform guard from `__APPLE__`; Unity's older bundled header also checks `TARGET_OS_MAC` and enables an obsolete fdopen macro.
- **Inference:** removing only that extra guard term resolves the observed SDK stdio collision. The subsequent IL2CPP build succeeds. This is not an upstream Unity update, zlib upgrade or broad compatibility guarantee.
- The original editor header was restored after building. Original SHA-256 `ae060141efbf6856488e646075e564c33b0fc429ec80f5fc9b1134e967d711a9`; temporary patched SHA-256 `0dfdbae20691bba15b655515d828d4e6fb00f2d477065048a5bbcec1faa97a1d`.

## Risks and application

The temporary adjustment must be reconsidered if the editor or SDK changes; do not modify Apple's SDK or treat this as an automatic patch for unrelated compiler errors. See [[Hackathon Candidate 0.11.0]] and `ops/unity-mac-il2cpp.md` for the tested build and exact procedure. Official runtime security remediation is a separate post-build gate.

## Sources

- [Unity release manifest](https://download.unity3d.com/download_unity/c93c5d3acf5b/unity-2022.2.2f1-osx.ini).
- [Upstream zlib 1.3.1 zutil.h](https://github.com/madler/zlib/blob/v1.3.1/zutil.h).
- Raw record: `raw/sources/unity-mac-il2cpp-compatibility-2026-09-05.md`.

# Air IL2CPP build prerequisites

The hackathon profile uses Unity 2022.2.2f1, revision `c93c5d3acf5b`, and its matching macOS IL2CPP module. This removes the Mono runtime implicated in the earlier CoreVideo shutdown crash; it is not proof against all native crashes.

## Module installation evidence

The editor is user-owned at `/Users/ilkka/Applications/Unity/Hub/Editor/2022.2.2f1/Unity.app` on the Air. The official [release manifest](https://download.unity3d.com/download_unity/c93c5d3acf5b/unity-2022.2.2f1-osx.ini) names `UnitySetup-Mac-IL2CPP-Support-for-Editor-2022.2.2f1.pkg`, 551,602,193 bytes, MD5 `e2903493adfe2a78e516de069651f9e1`.

The downloaded package matched that checksum and `pkgutil --check-signature` validated Unity Technologies ApS's trusted Developer ID Installer signature. Its expanded payload was copied into this editor's `Contents/PlaybackEngines/MacStandaloneSupport`, preserving the existing Mono module. No root installer or global Xcode configuration was changed. The temporary installer and expanded payload were later removed to reclaim Air disk space; the installed module and provenance remain.

## SDK compatibility

The first native compilation with Command Line Tools/macOS SDK 26 failed because bundled zlib `zutil.h:140` treats any `TARGET_OS_MAC` definition as classic Mac OS and defines `fdopen` to NULL. This corrupts the modern SDK's stdio declaration. The build log shows both that macro expansion and duplicate OS_CODE definitions.

For this build, back up the exact editor file `Contents/il2cpp/external/zlib/zutil.h`, then change only `#if defined(MACOS) || defined(TARGET_OS_MAC)` to `#if defined(MACOS)`. The upstream [zlib 1.3.1 header](https://github.com/madler/zlib/blob/v1.3.1/zutil.h) uses that narrower classic-Mac guard and a separate `__APPLE__` branch. This is a narrowly scoped build-tool compatibility adjustment, not a zlib upgrade or an Apple SDK edit. Retain original/patched hashes and restore the original editor header after the build. Reapply only if the same old-editor/SDK combination fails at this exact guard.

## Build

Acquire `ops/unity-lease.md` after confirming no editor owns the project. On the Air:

```sh
MOLKKY_RELEASE_OUTPUT="$PWD/artifacts/releases/jam-v0110" \
  /Users/ilkka/Applications/Unity/Hub/Editor/2022.2.2f1/Unity.app/Contents/MacOS/Unity \
  -batchmode -quit -projectPath "$PWD/external/Engine4D" \
  -executeMethod AutomatedMolkkyBuild.BuildHackathonMacOS \
  -logFile "$PWD/artifacts/releases/jam-v0110/build-il2cpp-sdk-compat.log"
```

Wait for the real process exit, clear the lease, apply Unity's official runtime remediation and test the patched app. Package only `.app` plus player documents, never the adjacent IL2CPP backup/debug folder. Retain rejected logs; a successful retry does not erase the earlier failures.

The build method explicitly calls `AssetDatabase.SaveAssets()` after restoring the previous backend/resizability in `finally`; restoring only the in-memory values left the build profile serialized on disk. A separate successful build under `artifacts/releases/jam-v0110-restore-check/` verifies that the Air returns to `resizableWindow: 1` and `Standalone: 0` (Mono). Its GameAssembly SHA-256 matches the shipped candidate exactly. This verification output is not the patched/distributed release.

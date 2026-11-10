# Steam handoff

These files prepare a candidate; they do not authorize a public release.

## Content and launch options

- macOS depot root: `artifacts/releases/first-light-v0100/macos`
- macOS launch executable: `FirstLight4D.app`
- Windows depot root: `artifacts/releases/first-light-v0100/windows`
- Windows launch executable: `FirstLight4D.exe`
- Use separate OS-restricted depots and launch options. Do not claim Windows compatibility until the exact packaged executable has been run and tested on Windows.
- Keep Unity's `UnityPlayer` library, data directory, and Mono runtime together with the executable.

## SteamPipe template

Replace the three capitalized ID placeholders with the actual IDs from Steamworks. Set each content root to the corresponding absolute directory. Keep preview enabled for the first file-mapping check.

```vdf
"AppBuild"
{
    "AppID" "APP_ID"
    "Desc" "First Light 0.10.0 candidate"
    "Preview" "1"
    "BuildOutput" "../steam-output"
    "Depots"
    {
        "MAC_DEPOT_ID"
        {
            "ContentRoot" "../first-light-v0100/macos"
            "FileMapping" { "LocalPath" "*" "DepotPath" "." "Recursive" "1" }
            "FileExclusion" "*.log"
        }
        "WINDOWS_DEPOT_ID"
        {
            "ContentRoot" "../first-light-v0100/windows"
            "FileMapping" { "LocalPath" "*" "DepotPath" "." "Recursive" "1" }
            "FileExclusion" "*.pdb"
            "FileExclusion" "*.log"
        }
    }
}
```

Use an authorized Steam build account and interactive Steam Guard authentication. Do not put passwords into scripts. A preview creates local logs and manifests without uploading content. Remove preview only after reviewing mappings and receiving upload authorization. No `SetLive` entry is supplied.

After upload, install the private branch through Steam and repeat the player guide, exact-50 win, overshoot, three misses, pause/focus loss, window resizing, settings persistence, and quit/relaunch checks. Valve review, release waiting periods, brand permission, and final OS/signing verification remain independent gates.

## Candidate checks before upload

Run the exact patched player, one process at a time. Append `-molkkyCaptureDemo -molkkyCaptureOutput <absolute-new-output-directory> -logFile <absolute-log-path>` and one of the following:

- No extra flag: 360-frame, 24-second gameplay capture with pin-motion CSV, actual rendered-floor clearance, two throws, miss/loss/reset checks, and captured game audio.
- `-molkkyMatchTest`: complete physical-throw scenarios for exact 50, overshoot, pause rejection, terminal rejection, and restart. Scores are not assigned by the test.
- `-molkkyThrowSweep`: varied power/aim and W-focused second throws at 15, 30, and 60 FPS.
- `-molkkyInterfaceTest`: genuine boot menu/cursor, start-view alignment, start/pause/resume/menu transitions, and screenshots at the launch resolution. Run separately with `-screen-width` / `-screen-height` values `960 / 600`, `1280 / 720`, and `1920 / 1080`.

Require exit code zero and `passed: true` in each JSON report. Inspect the images/video as well: prior numeric checks missed visible defects. Test mode drives public gameplay operations rather than physical keyboard events, and cannot establish manual input usability by itself.

On the locked Air, rapid programmatic live window resizing hung inside native AppKit/Unity window handling. Separate launches at all three resolutions worked. Preserve this distinction: the screenshot checks are not proof that live resizing or foreground input works. Those require an unlocked-session playtest before release.

Source: [Valve's upload documentation](https://partner.steamgames.com/doc/sdk/uploading).

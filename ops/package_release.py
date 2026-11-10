#!/usr/bin/env python3
"""Archive desktop candidates with player instructions, attribution, and hashes."""

import argparse
import hashlib
import json
import shutil
import subprocess
from pathlib import Path


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate_candidate(root, platforms=("macos", "windows")):
    required = {
        "macos": ("FirstLight4D.app/Contents/Info.plist",),
        "windows": ("FirstLight4D.exe", "UnityPlayer.dll", "FirstLight4D_Data/boot.config"),
    }
    if not platforms or any(platform not in required for platform in platforms):
        raise ValueError("Select macos, windows, or both")
    for platform in platforms:
        for relative in required[platform]:
            if not (root / platform / relative).is_file():
                raise ValueError(f"Missing release content: {platform}/{relative}")
        for path in (root / platform).rglob("*"):
            if "DoNotShip" in path.name or "DontShip" in path.name or path.suffix == ".pdb":
                raise ValueError(f"Debug content must not be packaged: {path}")


def package(root, output, repo, platforms=("macos", "windows")):
    validate_candidate(root, platforms)
    output.mkdir(parents=True, exist_ok=True)
    for platform in platforms:
        shutil.copy2(repo / "docs/PLAYER_GUIDE.md", root / platform / "PLAYER_GUIDE.md")
        shutil.copy2(repo / "external/Engine4D/LICENSE", root / platform / "ENGINE4D-LICENSE.txt")
        shutil.copy2(repo / "external/Engine4D/Assets/TextMesh Pro/Fonts/LiberationSans - OFL.txt",
                     root / platform / "LIBERATION-SANS-LICENSE.txt")
        for document in ("CREDITS.md", "KNOWN_ISSUES.md", "JAM_README.md"):
            if (repo / "docs" / document).is_file():
                shutil.copy2(repo / "docs" / document, root / platform / document)
    archives = []
    if "macos" in platforms:
        mac_archive = output / "FirstLight4D-macOS.zip"
        subprocess.run(
            ["ditto", "-c", "-k", "--sequesterRsrc", "--keepParent", str(root / "macos"), str(mac_archive)],
            check=True,
        )
        archives.append(mac_archive)
    if "windows" in platforms:
        archives.append(Path(shutil.make_archive(str(output / "FirstLight4D-Windows"), "zip", root / "windows")))
    manifest = {
        "status": "candidate",
        "archives": [
            {"file": path.name, "bytes": path.stat().st_size, "sha256": sha256(path)}
            for path in archives
        ],
        "content": {
            path.relative_to(root).as_posix(): sha256(path)
            for platform in platforms
            for path in sorted((root / platform).rglob("*"))
            if path.is_file()
        },
    }
    (output / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--platform", action="append", choices=("macos", "windows"))
    args = parser.parse_args()
    manifest = package(args.root.resolve(), args.output.resolve(), Path(__file__).resolve().parent.parent,
                       tuple(args.platform) if args.platform else ("macos", "windows"))
    print(json.dumps(manifest["archives"], indent=2))


if __name__ == "__main__":
    main()

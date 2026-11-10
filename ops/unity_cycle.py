#!/usr/bin/env python3
"""Change-aware, serialized Unity scene/build/capture runner."""

import argparse
import fcntl
import hashlib
import json
import os
import plistlib
import shutil
import subprocess
import sys
import time
from pathlib import Path


DEFAULT_UNITY = Path(
    "/Users/ilkka/Applications/Unity/Hub/Editor/2022.2.2f1/Unity.app/Contents/MacOS/Unity"
)
SCENE = Path("Assets/Prototype/Scenes/MolkkyPrototype4D.unity")
SCENE_INPUTS = (
    Path("Assets/Prototype/Editor"),
    Path("Assets/Sample/SampleScene4D.unity"),
    Path("Assets/Sample/SampleScene4D.unity.meta"),
)
BUILD_INPUTS = (Path("Assets"), Path("Packages"), Path("ProjectSettings"))
SCENE_OUTPUTS = (
    "Assets/Prototype/Materials/",
    "Assets/Prototype/Textures/",
    "Assets/Prototype/Textures.meta",
    "Assets/Prototype/Pin Outline.mesh",
    "Assets/Prototype/Pin Outline.mesh.meta",
    "Assets/Prototype/Scenes/MolkkyPrototype4D.unity",
    "Assets/Prototype/Scenes/MolkkyPrototype4D.unity.meta",
)
CAPTURE_ARGUMENTS = (
    "-screen-fullscreen", "0",
    "-screen-width", "1280",
    "-screen-height", "720",
    "-molkkyCaptureDemo",
)


def parse_args():
    repo = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("plan", "run"), nargs="?", default="plan")
    parser.add_argument("--project", type=Path, default=repo / "external/Engine4D")
    parser.add_argument("--output", type=Path, default=repo / "artifacts/unity-cycle")
    parser.add_argument("--unity", type=Path, default=DEFAULT_UNITY)
    parser.add_argument("--no-capture", action="store_true")
    parser.add_argument(
        "--force", choices=("scene", "build", "capture", "all"), action="append", default=[]
    )
    parser.add_argument("--lock-timeout", type=float, default=1800.0)
    return parser.parse_args()


def files_under(project, roots):
    files = []
    for relative in roots:
        path = project / relative
        if path.is_file():
            files.append(path)
        elif path.is_dir():
            files.extend(item for item in path.rglob("*") if item.is_file())
    return sorted(set(files), key=lambda item: item.relative_to(project).as_posix())


def digest_files(project, roots, excluded=()):
    digest = hashlib.sha256()
    for path in files_under(project, roots):
        relative = path.relative_to(project).as_posix()
        if any(relative == item or relative.startswith(item) for item in excluded):
            continue
        digest.update(relative.encode("utf-8"))
        digest.update(b"\0")
        with path.open("rb") as source:
            while True:
                chunk = source.read(1024 * 1024)
                if not chunk:
                    break
                digest.update(chunk)
        digest.update(b"\0")
    return digest.hexdigest()


def digest_values(*values):
    digest = hashlib.sha256()
    for value in values:
        digest.update(str(value).encode("utf-8"))
        digest.update(b"\0")
    return digest.hexdigest()


def load_json(path):
    if not path.exists():
        return {}
    try:
        with path.open(encoding="utf-8") as source:
            return json.load(source)
    except (OSError, json.JSONDecodeError):
        return {}


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    with temporary.open("w", encoding="utf-8") as destination:
        json.dump(value, destination, indent=2, sort_keys=True)
        destination.write("\n")
    os.replace(temporary, path)


class ProjectLock:
    def __init__(self, path, timeout):
        self.path = path
        self.timeout = timeout
        self.file = None

    def __enter__(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.file = self.path.open("a+")
        deadline = time.monotonic() + self.timeout
        while True:
            try:
                fcntl.flock(self.file.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
                break
            except BlockingIOError:
                if time.monotonic() >= deadline:
                    raise RuntimeError(f"timed out waiting for Unity project lock: {self.path}")
                time.sleep(0.2)
        self.file.seek(0)
        self.file.truncate()
        self.file.write(json.dumps({"pid": os.getpid(), "acquired": time.time()}))
        self.file.flush()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        fcntl.flock(self.file.fileno(), fcntl.LOCK_UN)
        self.file.close()


def force_enabled(args, stage):
    return "all" in args.force or stage in args.force


def ensure_project_available(project):
    unity_lock = project / "Temp/UnityLockfile"
    if unity_lock.exists():
        raise RuntimeError(
            f"Unity already owns {project}; close the editor before running the cycle"
        )


def run_checked(command, log_prefix=None, env=None):
    started = time.monotonic()
    printable = " ".join(str(part) for part in command)
    print(f"RUN {printable}", flush=True)
    result = subprocess.run([str(part) for part in command], env=env, check=False)
    elapsed = time.monotonic() - started
    print(f"DONE {elapsed:.2f}s exit={result.returncode}", flush=True)
    if result.returncode != 0:
        suffix = f"; inspect {log_prefix}" if log_prefix else ""
        raise RuntimeError(f"command failed with exit {result.returncode}{suffix}")
    return elapsed


def valid_build(app, marker, build_input):
    metadata = load_json(marker)
    return (
        app.is_dir()
        and (app / "Contents/Info.plist").is_file()
        and metadata.get("build_input") == build_input
    )


def valid_capture(capture):
    report = load_json(capture / "capture-report.json")
    complete = capture / "complete.txt"
    if report.get("passed") is not True or not complete.is_file():
        return False
    try:
        expected = int(complete.read_text(encoding="utf-8").strip())
    except (OSError, ValueError):
        return False
    return expected > 0 and len(list(capture.glob("frame-*.png"))) == expected


def app_executable(app):
    with (app / "Contents/Info.plist").open("rb") as source:
        name = plistlib.load(source)["CFBundleExecutable"]
    executable = app / "Contents/MacOS" / name
    if not executable.is_file():
        raise RuntimeError(f"player executable is missing: {executable}")
    return executable


def current_plan(args, state):
    project = args.project.resolve()
    scene_input = digest_files(project, SCENE_INPUTS)
    scene_dirty = (
        force_enabled(args, "scene")
        or not (project / SCENE).is_file()
        or state.get("scene_input") != scene_input
    )
    build_input = digest_files(project, BUILD_INPUTS)
    build_key = digest_values("macos-development-v1", build_input)
    build_dir = args.output.resolve() / "build"
    app = build_dir / "MolkkyPrototype4D.app"
    marker = build_dir / "build-complete.json"
    build_dirty = (
        scene_dirty
        or force_enabled(args, "build")
        or not valid_build(app, marker, build_input)
    )
    capture_key = digest_values("capture-v1", build_key, *CAPTURE_ARGUMENTS)
    capture = args.output.resolve() / "captures" / capture_key[:16]
    capture_dirty = (
        not args.no_capture
        and (build_dirty or force_enabled(args, "capture") or not valid_capture(capture))
    )
    return {
        "scene_input": scene_input,
        "scene_dirty": scene_dirty,
        "build_input": build_input,
        "build_key": build_key,
        "build_dir": build_dir,
        "app": app,
        "marker": marker,
        "build_dirty": build_dirty,
        "capture_key": capture_key,
        "capture": capture,
        "capture_dirty": capture_dirty,
    }


def print_plan(plan, no_capture):
    print(f"scene:  {'RUN' if plan['scene_dirty'] else 'reuse'}")
    print(f"build:  {'RUN' if plan['build_dirty'] else 'reuse'} {plan['app']}")
    if no_capture:
        print("capture: disabled")
    else:
        print(f"capture: {'RUN' if plan['capture_dirty'] else 'reuse'} {plan['capture']}")


def main():
    args = parse_args()
    args.project = args.project.resolve()
    args.output = args.output.resolve()
    state_path = args.output / "state.json"
    state = load_json(state_path)
    plan = current_plan(args, state)
    print_plan(plan, args.no_capture)
    if args.command == "plan":
        return 0

    timings = {}
    force_capture = any(
        force in ("scene", "build", "capture", "all") for force in args.force
    )
    needs_unity = plan["scene_dirty"] or plan["build_dirty"]
    if needs_unity:
        if not args.unity.is_file():
            raise RuntimeError(f"Unity executable is missing: {args.unity}")
        with ProjectLock(
            args.project / "Library/MolkkyUnityCycle.lock", args.lock_timeout
        ):
            ensure_project_available(args.project)
            # Re-check after waiting: another cycle may have produced the same artifacts.
            state = load_json(state_path)
            plan = current_plan(args, state)
            if plan["build_dirty"]:
                plan["build_dir"].mkdir(parents=True, exist_ok=True)
                logs = args.output / "logs"
                logs.mkdir(parents=True, exist_ok=True)
                method = (
                    "AutomatedMolkkyBuild.GenerateSceneAndBuildMacOS"
                    if plan["scene_dirty"]
                    else "AutomatedMolkkyBuild.BuildMacOS"
                )
                env = os.environ.copy()
                env["MOLKKY_BUILD_OUTPUT"] = str(plan["app"])
                stable_inputs_before = digest_files(
                    args.project, BUILD_INPUTS, SCENE_OUTPUTS
                )
                # A failed overwrite must not leave an older success marker reusable.
                if plan["marker"].exists():
                    plan["marker"].unlink()
                timings["unity_seconds"] = run_checked(
                    (
                        args.unity, "-batchmode", "-quit",
                        "-projectPath", args.project,
                        "-executeMethod", method,
                        "-logFile", logs / f"build-{plan['build_key'][:16]}.log",
                    ),
                    logs / f"build-{plan['build_key'][:16]}.log",
                    env,
                )
                if not plan["app"].is_dir():
                    raise RuntimeError(f"Unity reported success but did not create {plan['app']}")
                stable_inputs_after = digest_files(
                    args.project, BUILD_INPUTS, SCENE_OUTPUTS
                )
                if stable_inputs_after != stable_inputs_before:
                    raise RuntimeError(
                        "source inputs changed during the Unity build; rerun for a trusted artifact"
                    )
                completed_build_input = digest_files(args.project, BUILD_INPUTS)
                write_json(plan["marker"], {
                    "build_input": completed_build_input,
                    "scene_generated": plan["scene_dirty"],
                    "seconds": timings["unity_seconds"],
                })
                if plan["scene_dirty"]:
                    state["scene_input"] = plan["scene_input"]
                state["last_build"] = str(plan["app"])
                write_json(state_path, state)

    # Regeneration can change the scene and therefore the build/capture keys.
    args.force = ["capture"] if force_capture else []
    state = load_json(state_path)
    plan = current_plan(args, state)
    if plan["build_dirty"]:
        raise RuntimeError("build inputs changed during the Unity stage; rerun the cycle")

    if not args.no_capture and plan["capture_dirty"]:
        capture_lock = args.output / f"capture-{plan['capture_key'][:16]}.lock"
        with ProjectLock(capture_lock, args.lock_timeout):
            if force_enabled(args, "capture") or not valid_capture(plan["capture"]):
                if plan["capture"].exists():
                    shutil.rmtree(plan["capture"])
                plan["capture"].mkdir(parents=True, exist_ok=True)
                executable = app_executable(plan["app"])
                timings["capture_seconds"] = run_checked(
                    (
                        executable, *CAPTURE_ARGUMENTS,
                        "-molkkyCaptureOutput", plan["capture"],
                        "-logFile", plan["capture"] / "player.log",
                    ),
                    plan["capture"] / "player.log",
                )
                if not valid_capture(plan["capture"]):
                    raise RuntimeError(
                        f"capture did not produce a passing, complete frame set: {plan['capture']}"
                    )
                state["last_capture"] = str(plan["capture"])
                write_json(state_path, state)

    write_json(args.output / "last-run.json", {
        "build": str(plan["app"]),
        "capture": None if args.no_capture else str(plan["capture"]),
        "timings": timings,
    })
    print("PASS")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, RuntimeError, KeyError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        sys.exit(1)

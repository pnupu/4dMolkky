#!/usr/bin/env python3

import tempfile
import unittest
from argparse import Namespace
from pathlib import Path

import unity_cycle


class UnityCycleTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        root = Path(self.temporary.name)
        self.project = root / "project"
        self.output = root / "output"
        for relative in (
            "Assets/Prototype/Editor",
            "Assets/Prototype/Scenes",
            "Assets/Sample",
            "Packages",
            "ProjectSettings",
        ):
            (self.project / relative).mkdir(parents=True, exist_ok=True)
        (self.project / unity_cycle.SCENE).write_text("scene", encoding="utf-8")
        (self.project / "Assets/Prototype/Editor/Builder.cs").write_text(
            "builder", encoding="utf-8"
        )
        self.args = Namespace(
            project=self.project,
            output=self.output,
            unity=Path("/not-used"),
            no_capture=False,
            force=[],
            lock_timeout=0.1,
        )

    def tearDown(self):
        self.temporary.cleanup()

    def establish_valid_artifacts(self):
        scene_input = unity_cycle.digest_files(self.project, unity_cycle.SCENE_INPUTS)
        state = {"scene_input": scene_input}
        plan = unity_cycle.current_plan(self.args, state)
        (plan["app"] / "Contents").mkdir(parents=True)
        (plan["app"] / "Contents/Info.plist").write_bytes(b"plist")
        unity_cycle.write_json(plan["marker"], {"build_input": plan["build_input"]})
        plan = unity_cycle.current_plan(self.args, state)
        plan["capture"].mkdir(parents=True)
        unity_cycle.write_json(plan["capture"] / "capture-report.json", {"passed": True})
        (plan["capture"] / "complete.txt").write_text("2", encoding="utf-8")
        (plan["capture"] / "frame-0000.png").touch()
        (plan["capture"] / "frame-0001.png").touch()
        return state

    def test_reuses_complete_matching_artifacts(self):
        plan = unity_cycle.current_plan(self.args, self.establish_valid_artifacts())
        self.assertFalse(plan["scene_dirty"])
        self.assertFalse(plan["build_dirty"])
        self.assertFalse(plan["capture_dirty"])

    def test_missing_capture_frame_invalidates_capture_only(self):
        state = self.establish_valid_artifacts()
        plan = unity_cycle.current_plan(self.args, state)
        (plan["capture"] / "frame-0001.png").unlink()
        plan = unity_cycle.current_plan(self.args, state)
        self.assertFalse(plan["build_dirty"])
        self.assertTrue(plan["capture_dirty"])

    def test_forced_scene_invalidates_downstream_stages(self):
        state = self.establish_valid_artifacts()
        self.args.force = ["scene"]
        plan = unity_cycle.current_plan(self.args, state)
        self.assertTrue(plan["scene_dirty"])
        self.assertTrue(plan["build_dirty"])
        self.assertTrue(plan["capture_dirty"])


if __name__ == "__main__":
    unittest.main()

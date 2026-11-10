import tempfile
import unittest
from pathlib import Path

from package_release import sha256, validate_candidate


class PackageReleaseTests(unittest.TestCase):
    def test_rejects_incomplete_and_debug_candidates(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            with self.assertRaises(ValueError):
                validate_candidate(root)
            for relative in (
                "macos/FirstLight4D.app/Contents/Info.plist",
                "windows/FirstLight4D.exe",
                "windows/UnityPlayer.dll",
                "windows/FirstLight4D_Data/boot.config",
            ):
                path = root / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(b"fixture")
            validate_candidate(root)
            (root / "windows/debug.pdb").touch()
            with self.assertRaises(ValueError):
                validate_candidate(root)

    def test_manifest_hash_identifies_content(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "sample"
            path.write_bytes(b"abc")
            self.assertEqual(sha256(path), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad")

    def test_mac_only_does_not_require_or_validate_unshipped_windows(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            app = root / "macos/FirstLight4D.app/Contents"
            app.mkdir(parents=True)
            (app / "Info.plist").write_bytes(b"fixture")
            validate_candidate(root, ("macos",))
            with self.assertRaises(ValueError):
                validate_candidate(root)
            with self.assertRaises(ValueError):
                validate_candidate(root, ())
            (app / "debug.pdb").touch()
            with self.assertRaises(ValueError):
                validate_candidate(root, ("macos",))


if __name__ == "__main__":
    unittest.main()

"""Build the showcase inventory and lightweight thumbnails from the local media folder."""

from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from pathlib import Path
from tempfile import TemporaryDirectory
import json
import subprocess


LAUNCH = Path(__file__).resolve().parents[1] / "10 - launch 2026-11"
SOURCE = LAUNCH / "01-objects" / "02-media-unsorted"
SHOWCASE = LAUNCH / "showcase"
PREVIEWS = SHOWCASE / "assets" / "media"
FORMATS = {".png": "image", ".jpg": "image", ".jpeg": "image", ".webp": "image", ".mp4": "video"}


def prepare(file):
    kind = FORMATS[file.suffix.lower()]
    digest = sha256(file.name.encode()).hexdigest()[:20]
    thumbnail = PREVIEWS / (digest + ".jpg")
    if not thumbnail.is_file() or thumbnail.stat().st_mtime_ns < file.stat().st_mtime_ns:
        with TemporaryDirectory(dir=PREVIEWS) as scratch:
            output = Path(scratch) / thumbnail.name
            seek = ["-ss", "0.5"] if kind == "video" else []
            subprocess.run([
                "ffmpeg", "-v", "error", "-nostdin", *seek, "-i", str(file),
                "-vf", "scale=480:480:force_original_aspect_ratio=decrease",
                "-frames:v", "1", "-c:v", "mjpeg", "-q:v", "5", "-threads", "1", "-update", "1",
                str(output),
            ], check=True)
            output.replace(thumbnail)
    return {"name": file.name, "type": kind, "preview": thumbnail.relative_to(SHOWCASE).as_posix()}


def main():
    PREVIEWS.mkdir(parents=True, exist_ok=True)
    sources = sorted(
        (file for file in SOURCE.iterdir() if file.is_file() and not file.is_symlink() and file.suffix.lower() in FORMATS),
        key=lambda file: file.name.casefold(),
    )
    with ThreadPoolExecutor(max_workers=4) as pool:
        inventory = list(pool.map(prepare, sources))
    with TemporaryDirectory(dir=SHOWCASE) as scratch:
        manifest = Path(scratch) / "media-catalog.json"
        manifest.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        manifest.replace(SHOWCASE / manifest.name)
    print(f"{len(inventory)} media files indexed.")


if __name__ == "__main__":
    main()

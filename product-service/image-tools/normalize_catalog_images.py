from io import BytesIO
from pathlib import Path

from PIL import Image
from rembg import new_session, remove
from rembg.sessions.base import BaseSession


ASSET_DIR = Path(__file__).resolve().parents[1] / "assets"
OUTPUT_DIR = ASSET_DIR / "catalog"
PRODUCT_IMAGES = (
    "keyboard.jpg",
    "mouse-final.jpg",
    "monitor.jpg",
    "ssd.jpg",
    "stand-laptop.jpg",
    "laptop.jpg",
)
CANVAS_SIZE = 800
OBJECT_SIZE = 720


def normalize_image(filename: str, session: BaseSession) -> None:
    source_path = ASSET_DIR / filename
    image_data = remove(source_path.read_bytes(), session=session)

    with Image.open(BytesIO(image_data)) as image:
        foreground = image.convert("RGBA")

    alpha_mask = foreground.getchannel("A").point(
        lambda value: 255 if value > 24 else 0
    )
    bounds = alpha_mask.getbbox()
    if bounds is None:
        raise ValueError(f"No product foreground detected in {filename}")

    foreground = foreground.crop(bounds)
    scale = OBJECT_SIZE / max(foreground.size)
    dimensions = tuple(round(value * scale) for value in foreground.size)
    foreground = foreground.resize(dimensions, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), "white")
    position = (
        (CANVAS_SIZE - foreground.width) // 2,
        (CANVAS_SIZE - foreground.height) // 2,
    )
    canvas.alpha_composite(foreground, position)

    output_path = OUTPUT_DIR / filename
    canvas.convert("RGB").save(
        output_path,
        format="JPEG",
        quality=94,
        subsampling=0,
        optimize=True,
    )
    print(f"{filename} -> {output_path.name}: {CANVAS_SIZE}x{CANVAS_SIZE}")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    session = new_session("u2net")
    for filename in PRODUCT_IMAGES:
        normalize_image(filename, session)


if __name__ == "__main__":
    main()

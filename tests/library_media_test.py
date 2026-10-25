"""Local real MP4/image sanitization; no network or customer media."""
import importlib.util
import pathlib
import tempfile
import imageio_ffmpeg
from PIL import Image

root = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('validator', root/'scripts/validate_attachment.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
(root/'test-results').mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(prefix='hc-library-qa-',dir=root/'test-results') as directory:
    clean_video = pathlib.Path(directory)/'video.mp4'
    clean_cover = pathlib.Path(directory)/'cover.png'
    validator.sanitize(root/'public/assets/ho-sen-demo.mp4', clean_video, 'video/mp4')
    frames = imageio_ffmpeg.read_frames(str(clean_video))
    metadata = next(frames)
    frames.close()
    assert 30 <= metadata['duration'] <= 60 and tuple(metadata['size']) == (1280,720)
    assert 0 < clean_video.stat().st_size <= 20*1024**2
    validator.sanitize(root/'public/assets/ho-sen-poster.png', clean_cover, 'image/png')
    with Image.open(clean_cover) as image:
        image.load()
        assert image.width > 0 and not image.getexif()
    print('2 library media checks passed: real MP4 re-encoded and cover decoded, no cloud upload/release claimed.')

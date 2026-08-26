import tempfile
import time
from pathlib import Path

from app.utils.cleanup import purge_expired_temp_files


def test_purge_expired_temp_files():
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)

        # 1. Create a fresh file (0s old)
        fresh_file = tmp_path / "pykemon_fresh.mp4"
        fresh_file.write_text("fresh video content")

        # 2. Create an old expired file (simulate 1000s old)
        old_file = tmp_path / "pykemon_old.mp4"
        old_file.write_text("old video content")

        # Modify mtime to 1000s in the past
        past_time = time.time() - 1000
        import os

        os.utime(str(old_file), (past_time, past_time))

        # Purge files older than 300s
        purged = purge_expired_temp_files(temp_dir=tmp_path, max_age_seconds=300)

        assert purged == 1
        assert fresh_file.exists()
        assert not old_file.exists()

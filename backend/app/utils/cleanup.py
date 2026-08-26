import logging
import threading
import time
from pathlib import Path

from app.config import CLEANUP_INTERVAL_SECONDS, TEMP_DIR, TEMP_FILE_MAX_AGE_SECONDS

logger = logging.getLogger("who-is-that-pykemon.cleanup")

_cleanup_thread_running = False


def purge_expired_temp_files(
    temp_dir: Path = TEMP_DIR, max_age_seconds: int = TEMP_FILE_MAX_AGE_SECONDS
) -> int:
    """
    Deletes temporary video and image files that exceed the maximum retention age.

    Args:
        temp_dir (Path): The directory to scan.
        max_age_seconds (int): Maximum age in seconds before a file is considered expired.

    Returns:
        int: Number of deleted files.
    """
    if not temp_dir.exists():
        return 0

    now = time.time()
    deleted_count = 0

    try:
        for file_path in temp_dir.glob("pykemon_*"):
            if file_path.is_file():
                try:
                    file_age = now - file_path.stat().st_mtime
                    if file_age > max_age_seconds:
                        file_path.unlink()
                        deleted_count += 1
                        logger.info(
                            f"Purged expired temporary file: {file_path.name} (Age: {int(file_age)}s)"
                        )
                except Exception as e:
                    logger.warning(f"Error purging file {file_path}: {e}")
    except Exception as e:
        logger.error(f"Error scanning temp directory for cleanup: {e}")

    return deleted_count


def _cleanup_worker_loop():
    """Continuous background loop executing periodic disk purge."""
    logger.info("Background disk cleanup worker started.")
    while _cleanup_thread_running:
        try:
            purge_expired_temp_files()
        except Exception as e:
            logger.error(f"Unexpected error in cleanup worker loop: {e}")
        time.sleep(CLEANUP_INTERVAL_SECONDS)


def start_cleanup_worker():
    """Spawns the background disk garbage collector daemon thread."""
    global _cleanup_thread_running
    if not _cleanup_thread_running:
        _cleanup_thread_running = True
        thread = threading.Thread(
            target=_cleanup_worker_loop, daemon=True, name="DiskCleanupWorker"
        )
        thread.start()


def stop_cleanup_worker():
    """Signals the background disk garbage collector to shut down."""
    global _cleanup_thread_running
    _cleanup_thread_running = False

import pathlib
import subprocess
import signal
import time
import argparse
import logging

import webview

from lib.application import BCApplication
from lib.api import BCAPI
from lib.log_helper import getLogger


HERE = pathlib.Path(__file__).parent
LOG = getLogger(__name__)


def setup_logging(level=logging.DEBUG):
    print(f"Setting up logging for {__name__}")

    root = getLogger(__name__)
    lib = getLogger("lib")

    root.setLevel(level)
    lib.setLevel(level)

    console = logging.StreamHandler()
    console.setLevel(level)

    basic_format = logging.Formatter(
        "%(levelname)s - %(name)s.%(funcName)s@%(lineno)s - %(message)s"
    )
    console.setFormatter(basic_format)

    root.addHandler(console)
    lib.addHandler(console)

    root.info("Logging setup")


def spinup_pnpm(url_path: pathlib.Path):
    ui_dir = url_path.parent
    LOG.debug("Spinup CWD {}", ui_dir)

    process = subprocess.Popen(
        ["pnpm", "dev", "--port", "8080", "--host"],
        cwd=str(ui_dir),
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
    )

    status = process.poll()
    if status is not None:
        raise Exception(f"pnpm failed to run {status}")

    time.sleep(2)

    return process


def write_bridge(dest: pathlib.Path):
    import transformer

    dest.touch(exist_ok=True)
    transformer.process_source((HERE / "lib" / "api.py"), dest)


def main():
    setup_logging()

    args = argparse.ArgumentParser("OpenAI API talker")

    args.add_argument(
        "--url",
        type=pathlib.Path,
        default=pathlib.Path("./book_control/dist/index.html"),
    )
    args.add_argument("--dev", action="store_true", default=False)
    args.add_argument("--write_bridge", type=pathlib.Path, default=None)

    result = args.parse_args()
    LOG.debug("url={}", result.url)
    LOG.debug("dev={}", result.dev)
    LOG.debug("write_bridge={}", result.write_bridge)

    app = BCApplication()
    api = BCAPI(app)

    worker = None

    default_win_settings = dict(
        min_size=(
            800,
            480,
        ),
        js_api=api,
    )

    if result.write_bridge is not None:
        assert (
            result.write_bridge.parent.exists() and result.write_bridge.parent.is_dir()
        )
        write_bridge(result.write_bridge)

    if result.dev is True:
        worker = spinup_pnpm(result.url)
        default_win_settings["url"] = "http://127.0.0.1:8080"
    else:
        default_win_settings["url"] = str(result.url)

    win1 = webview.create_window("PyBook Control", **default_win_settings)
    app.set_window(win1)
    webview.start(debug=True)

    if worker is not None:
        worker.send_signal(signal.CTRL_BREAK_EVENT)
        worker.send_signal(signal.CTRL_C_EVENT)
        worker.kill()
        time.sleep(2)


if __name__ == "__main__":
    main()

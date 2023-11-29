import pathlib
import subprocess
import signal
import time
import argparse
import logging
import typing as T

import webview
from tap import Tap

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
    ui_dir = url_path
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


def transform_api(dest: pathlib.Path):
    import transformer

    dest.touch(exist_ok=True)
    transformer.process_source((HERE / "lib" / "api.py"), dest)


class MainArgs(Tap):
    """
    Python Book Control

    """

    url: T.Optional[pathlib.Path] = pathlib.Path("./ui2/")
    """
        :param url: The interface to load
    """

    dev: bool = False
    """
    :param dev: Enable debug options
    """

    transform_api: T.Optional[pathlib.Path] = None
    """
    :param transform_api: Convert the api.py file into a quasi-typeascript api bridge
    """

    database: T.Optional[pathlib.Path] = pathlib.Path("test.sqlite3")
    """
    :param database: An alternative database file to use
    """

    def configure(self) -> None:
        self.add_argument("--dev", action="store_true")


def main():
    setup_logging()

    result = MainArgs().parse_args()
    LOG.debug(f"{result.url}")
    LOG.debug(f"{result.dev=}")
    LOG.debug(f"{result.transform_api=}")
    LOG.debug(f"{result.database.as_posix()=}")

    app = BCApplication(result.database)
    api = BCAPI(app)

    worker = None

    default_win_settings = dict(
        min_size=(
            800,
            480,
        ),
        js_api=api,
    )

    if result.transform_api is not None:
        assert (
            result.transform_api.parent.exists()
            and result.transform_api.parent.is_dir()
        )
        transform_api(result.transform_api)

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

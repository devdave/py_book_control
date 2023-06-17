import pathlib
import subprocess
import signal
import time
import argparse
import webview
from dataclasses import asdict
import random
import string

from lib.types import Character, Location, Scene, Chapter, Book, TargetedElement
from lib import models
from lib.application import BCApplication
from lib.api import BCAPI



HERE = pathlib.Path(__file__).parent


def spinup_pnpm(url_path:pathlib.Path):
    ui_dir = url_path.parent
    process = subprocess.Popen(["pnpm", "dev", "--port", "8080"],
                               cwd=str(ui_dir),
                               creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
                               )

    status = process.poll()
    if status is not None:
        raise Exception(f"pnpm failed to run {status}")

    time.sleep(2)

    return process


def write_bridge(dest:pathlib.Path):
    import transformer
    transformer.process_source(
        (HERE/"lib"/"remote.py"),
        dest
    )



def main():
    args = argparse.ArgumentParser("OpenAI API talker")

    args.add_argument("--url", type=pathlib.Path, default=pathlib.Path("./book_control/dist/index.html"))
    args.add_argument("--dev", action="store_true", default=False)
    args.add_argument("--write_bridge", type=pathlib.Path, default=None)


    result = args.parse_args()
    app = BCApplication()
    api = BCAPI(app)

    worker = None

    if result.write_bridge is not None:
        assert result.write_bridge.parent.exists() and result.write_bridge.parent.isdir()
        write_bridge(result.write_bridge)



    if result.dev is True:
        worker = spinup_pnpm(result.url)
        win1 = webview.create_window("PyOpen Talk", url="http://127.0.0.1:8080", js_api=api)
    else:
        win1 = webview.create_window("PyOpen Talk", url=str(result.url), js_api=api)

    app.set_window(win1)
    webview.start(debug=True)

    if worker is not None:
        worker.send_signal(signal.CTRL_BREAK_EVENT)
        worker.send_signal(signal.CTRL_C_EVENT)
        worker.kill()
        time.sleep(2)



if __name__ == '__main__':
    main()
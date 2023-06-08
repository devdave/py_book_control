import pathlib
import subprocess
import signal
import time
import argparse
import webview

class BCApplication:
    pass

class BCAPI:

    def __init__(self, app:BCApplication):
        self.app = app


def spinup_pnpm():
    ui_dir = pathlib.Path(__file__).parent / "book_control"
    process = subprocess.Popen(["pnpm", "dev", "--port", "8080"],
                               cwd=str(ui_dir),
                               creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
                               )

    status = process.poll()
    if status is not None:
        raise Exception(f"pnpm failed to run {status}")

    time.sleep(2)

    return process



def main():
    args = argparse.ArgumentParser("OpenAI API talker")

    args.add_argument("--url", type=pathlib.Path, default=pathlib.Path("./potui/dist/index.html"))
    args.add_argument("--dev", action="store_true", default=False)

    result = args.parse_args()
    app = BCApplication()
    api = BCAPI(app)

    worker = None

    if result.dev is True:
        worker = spinup_pnpm()
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
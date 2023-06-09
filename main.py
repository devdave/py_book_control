import pathlib
import subprocess
import signal
import time
import argparse
import webview

class BCApplication:

    chapters: []
    main_window:webview.Window
    def __init__(self):
        self.main_window = None

    def set_window(self, main_window):
        self.main_window = main_window

class BCAPI:

    app:BCApplication
    FILE_TYPES = ('Database file (*.sqlite;*.sqlite3)',)
    def __init__(self, app:BCApplication):
        self.app = app

    def info(self, message):
        print(f"Frontend says `{message}`")

    def alert(self, message):
        return self.app.main_window.create_confirmation_dialog("Problem", message )
    def find_source(self):

        result = self.app.main_window.create_file_dialog(webview.OPEN_DIALOG, allow_multiple=False, file_types=self.FILE_TYPES)
        print(result, repr(result))

    def create_source(self):
        result = self.app.main_window.create_file_dialog(webview.SAVE_DIALOG, allow_multiple=False, file_types=self.FILE_TYPES)
        if result is None:
            self.alert("No file was loaded or created, a save dialog will appear the next time you try to save.")




    def fetch_chapters(self):
        return [chapter.to_dict() for chapter in self.app.chapters]

    def create_chapter(self, chapter_dict):
        print(chapter_dict, repr(chapter_dict))

    def save_reordered_chapters(self, chapters):
        print(chapters)


    def boot_up(self):
        result = self.app.main_window.create_confirmation_dialog("Startup", "Click yes/confirm to open an existing book.")
        if result:
            self.find_source()
            return True
        else:
            self.create_source()
            return False


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

    args.add_argument("--url", type=pathlib.Path, default=pathlib.Path("./book_control/dist/index.html"))
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
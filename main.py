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

def generate_id(length):
    alphanum = string.ascii_letters + string.digits
    return "".join(random.choice(alphanum) for _ in range(length))

class BCApplication:


    main_window:webview.Window
    def __init__(self):
        self.main_window = None

        engine, session = models.connect()
        self.engine = engine
        self.session = session


    def set_window(self, main_window):
        self.main_window = main_window

    def fetch_chapters(self):
        return models.Chapter.Fetch_all(self.session)



class BCAPI:

    app:BCApplication
    chapters: dict()
    scenes: dict()

    FILE_TYPES = ('Database file (*.sqlite;*.sqlite3)',)


    def __init__(self, app:BCApplication):
        self.app = app

        self.data_store = dict()


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




    def fetch_manifest(self):

        chapters = self.app.fetch_chapters()


        fake = []
        chapter = TargetedElement('1', 'chapter 1', 0, "chapter", "1")
        chapter.add_scene("a1", "Scene 1", 0, 1)
        chapter.add_scene("b1", "Scene 2", 0, 2)
        chapter.add_scene("c1", "Scene 3", 0, 3)
        fake.append(chapter)

        chapter = TargetedElement('2', 'chapter 2', 0, "chapter", "2")
        chapter.add_scene("a2", "Scene 1", 0, 4)
        chapter.add_scene("b2", "Scene 2", 0, 5)
        chapter.add_scene("c2", "Scene 3", 0, 6)
        fake.append(chapter)

        chapter = TargetedElement('3', 'Chapter 3', 0, "chapter", "3")
        fake.append(chapter)



        return [asdict(element) for element in fake]


    def create_chapter(self, chapter_dict):
        print(chapter_dict, repr(chapter_dict))

    def fetch_scene(self, scene_id: str):
        scene = Scene(scene_id, "Scene from remote", 0, "lorem ipsum", "desc goes here", [], [], "notes", 0);
        return asdict(scene);

    def update_scene(self, scene_id, property_name, data):
        print(scene_id, property_name, data);
        return True

    def save_reordered_chapters(self, chapters):
        print(chapters)


    def boot_up(self):
        result = self.app.main_window.create_confirmation_dialog("Startup", "Click Ok to open an existing book.")
        if result:
            # self.find_source()
            return True



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
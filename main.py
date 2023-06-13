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



class BCApplication:


    main_window:webview.Window
    book:models.Book
    session:models.Session

    def __init__(self):
        self.main_window = None

        engine, session = models.connect()
        self.session = session


        try:
            self.book = models.Book.Fetch_book_by_id(self.session, 1)
        except models.NoResultFound:
            self.book = models.Book(name="Test1")
            self.session.add(self.book)
            self.session.commit()




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

        return [chapter.asdict() for chapter in self.app.book.chapters]


    def create_chapter(self, chapter_name):
        chapter = models.Chapter(name=chapter_name, uid=models.generate_id(7))

        self.app.book.chapters.append(chapter)
        self.app.session.add(chapter)
        self.app.session.commit()

        return chapter.asdict()

    def fetch_scene(self, scene_uid: str):
        scene = models.Scene.Fetch_by_uid(self.app.session, scene_uid)
        return scene.asdict()

    def update_scene(self, scene_uid, new_data):
        scene = models.Scene.Fetch_by_uid(self.app.session, scene_uid)

        for key, val in new_data.items():
            if key in ['id', 'uid']:
                continue

            setattr(scene, key, val)

        self.app.session.commit()
        return True


    def create_scene(self, chapter_uid, scene_name):
        chapter = models.Chapter.Fetch_by_uid(self.app.session, chapter_uid)
        scene = models.Scene(name=scene_name)
        chapter.scenes.append(scene)
        self.app.session.add(scene)
        self.app.session.commit()
        return scene.asdict()


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
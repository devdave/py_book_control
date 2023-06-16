import webview
from .application import BCApplication
from . import models


class BCAPI:

    app:BCApplication
    chapters: dict()
    scenes: dict()

    FILE_TYPES = ('Database file (*.sqlite;*.sqlite3)',)


    def __init__(self, app:BCApplication):
        self.app = app

        self.data_store = dict()


    def info(self, message:str):
        print(f"Frontend says `{message}`")

    def alert(self, message:str):
        return self.app.main_window.create_confirmation_dialog("Problem", message )
    def find_source(self):

        result = self.app.main_window.create_file_dialog(webview.OPEN_DIALOG, allow_multiple=False, file_types=self.FILE_TYPES)
        print(result, repr(result))

    def create_source(self):
        result = self.app.main_window.create_file_dialog(webview.SAVE_DIALOG, allow_multiple=False, file_types=self.FILE_TYPES)
        if result is None:
            self.alert("No file was loaded or created, a save dialog will appear the next time you try to save.")

    def fetch_chapters(self):
        return [chapter.asdict() for chapter in self.app.book.chapters]

    def fetch_chapter(self, chapter_id:str):
        return models.Chapter.Fetch_by_uid(self.app.session, chapter_id).asdict();

    def fetch_stripped_chapters(self):

        return [chapter.asdict(stripped=True) for chapter in self.app.book.chapters]

    def create_chapter(self, chapter_name:str):
        chapter = models.Chapter(name=chapter_name, uid=models.generate_id(7))

        self.app.book.chapters.append(chapter)
        self.app.session.add(chapter)
        self.app.session.commit()

        return chapter.asdict()

    def fetch_scene(self, scene_uid: str):
        scene = models.Scene.Fetch_by_uid(self.app.session, scene_uid)
        return scene.asdict()

    def update_scene(self, scene_uid:str, new_data:dict):
        scene = models.Scene.Fetch_by_uid(self.app.session, scene_uid)

        for key, val in new_data.items():
            if key in ['id', 'uid', 'words']:
                continue

            setattr(scene, key, val)

        self.app.session.commit()
        return True


    def create_scene(self, chapter_uid:str, scene_name:str):
        chapter = models.Chapter.Fetch_by_uid(self.app.session, chapter_uid)
        scene = models.Scene(name=scene_name)
        chapter.scenes.append(scene)
        self.app.session.add(scene)
        self.app.session.commit()
        return scene.asdict()


    def save_reordered_chapters(self, chapters:[]):
        print(chapters)


    def boot_up(self):
        """
            Will be deprecated, automatically loads up the 1st Book for use with the app.
                :return: bool
        """
        result = self.app.main_window.create_confirmation_dialog("Startup", "Click Ok to open an existing book.")
        if result:
            # self.find_source()
            return True
import webview
from application import BCApplication


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
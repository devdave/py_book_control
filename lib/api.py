import typing as T
import webview
from .application import BCApplication
from . import models


class BCAPI:
    app: BCApplication

    FILE_TYPES: T.Tuple[str] = ('Database file (*.sqlite;*.sqlite3)',)

    data_store: T.Dict[str, str]

    def __init__(self, app: BCApplication):
        self.app = app

        self.data_store = dict()

    def info(self, message: str):
        print(f"Frontend says `{message}`")

    def alert(self, message: str):
        return self.app.main_window.create_confirmation_dialog("Problem", message)

    def list_books(self):
        return [book.asdict() for book in models.Book.Fetch_All(self.app.session)]

    def get_current_book(self):
        return self.app.book.asdict()

    def set_current_book(self, book_id: str):
        book = models.Book.Fetch_by_ID(self.app.session, book_id)
        return book.asdict()

    def find_source(self):

        result = self.app.main_window.create_file_dialog(webview.OPEN_DIALOG, allow_multiple=False,
                                                         file_types=self.FILE_TYPES)
        print(result, repr(result))

    def create_source(self):
        result = self.app.main_window.create_file_dialog(webview.SAVE_DIALOG, allow_multiple=False,
                                                         file_types=self.FILE_TYPES)
        if result is None:
            self.alert("No file was loaded or created, a save dialog will appear the next time you try to save.")

    def fetch_chapters(self):
        return [chapter.asdict() for chapter in self.app.book.chapters]

    def fetch_chapter(self, chapter_id: str):
        return models.Chapter.Fetch_by_uid(self.app.session, chapter_id).asdict()

    def update_chapter(self, chapter_id: str, chapter_data: dict[str, str]):
        chapter = models.Chapter.Fetch_by_uid(self.app.session, chapter_id)
        chapter.update(chapter_data)

        self.app.session.commit()

        return True

    def fetch_stripped_chapters(self):

        return [chapter.asdict(stripped=True) for chapter in self.app.book.chapters]

    def create_chapter(self, chapter_name: str):
        chapter = models.Chapter(title=chapter_name, uid=models.generate_id(7))

        self.app.book.chapters.append(chapter)
        self.app.session.add(chapter)
        self.app.session.commit()

        return chapter.asdict()

    def save_reordered_chapters(self, chapters: T.List[T.Dict[str, str]]):
        return models.Chapter.Reorder(self.app.session, chapters)

    def fetch_scene(self, scene_uid: str):
        scene = models.Scene.Fetch_by_uid(self.app.session, scene_uid)
        return scene.asdict()

    def update_scene(self, scene_uid: str, new_data: dict):
        scene = models.Scene.Fetch_by_uid(self.app.session, scene_uid)

        scene.update(new_data)

        self.app.session.commit()
        return True

    def create_scene(self, chapter_uid: str, scene_title: str):
        chapter = models.Chapter.Fetch_by_uid(self.app.session, chapter_uid)
        scene = models.Scene(title=scene_title)
        chapter.scenes.append(scene)
        self.app.session.add(scene)
        self.app.session.commit()
        return scene.asdict()

    def boot_up(self):
        """
            Will be deprecated, automatically loads up the 1st Book for use with the app.
                :return: bool
        """
        result = self.app.main_window.create_confirmation_dialog("Startup", "Click Ok to open an existing book.")
        if result:
            # self.find_source()
            return True

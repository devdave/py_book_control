import typing as T
import logging

import webview
from .scene_processor import SceneProcessor2 as SceneProcessor
from .application import BCApplication
from . import models
from .log_helper import getLogger

log = getLogger(__name__)

class BCAPI:
    FILE_TYPES: T.Tuple[str] = ("Database file (*.sqlite;*.sqlite3)",)


    app: BCApplication
    data_store: T.Dict[str, str]
    log: logging.Logger

    def __init__(self, app: BCApplication):
        self.app = app
        self.data_store = dict()
        self.log = getLogger(__name__)

    def info(self, message: str):
        self.log.info("Frontend says `{}`", message)

    def alert(self, message: str):
        return self.app.main_window.create_confirmation_dialog("Problem", message)

    def list_books(self, stripped: bool = True):
        with self.app.get_db() as session:
            return [
                book.asdict(stripped=stripped)
                for book in models.Book.Fetch_All(session)
            ]

    def get_current_book(self, stripped: bool = True):
        with self.app.get_db() as session:
            return self.app.get_book(session).asdict(stripped=stripped)


    def set_current_book(self, book_uid: str):
        with self.app.get_db() as session:
            self.app.book = models.Book.Fetch_by_UID(session, book_uid)
            return self.app.book.asdict()

    def find_source(self):
        result = self.app.main_window.create_file_dialog(
            webview.OPEN_DIALOG, allow_multiple=False, file_types=self.FILE_TYPES
        )
        print(result, repr(result))

    def create_source(self):
        result = self.app.main_window.create_file_dialog(
            webview.SAVE_DIALOG, allow_multiple=False, file_types=self.FILE_TYPES
        )
        if result is None:
            self.alert(
                "No file was loaded or created, a save dialog will appear the next time you try to save."
            )

    def fetch_chapters(self):
        with self.app.get_db() as session:
            return [chapter.asdict() for chapter in self.app.fetch_chapters(session).chapters]

    def fetch_chapter(self, chapter_id: str):
        with self.app.get_db() as session:
            session = self.app.Session()
            return models.Chapter.Fetch_by_uid(session, chapter_id).asdict()

    def update_chapter(self, chapter_id: str, chapter_data: dict[str, str]):
        with self.app.get_db() as session:
            chapter = models.Chapter.Fetch_by_uid(session, chapter_id)
            chapter.update(chapter_data)
            session.commit()
            return chapter.asdict()

    def fetch_stripped_chapters(self):
        with self.app.get_db() as session:
            book = models.Book.Fetch_by_Id(session, self.app.book_id)
            return [chapter.asdict(stripped=True) for chapter in book.chapters]

    def create_chapter(self, chapter_name: str):
        chapter = models.Chapter(title=chapter_name, uid=models.generate_id(12))

        with self.app.get_db() as session:
            book = self.app.get_book(session)
            book.chapters.append(chapter)
            session.add(chapter)
            session.commit()

            return chapter.asdict()

    def save_reordered_chapters(self, chapters: T.List[T.Dict[str, str]]):
        with self.app.get_db() as session:
            return models.Chapter.Reorder(session, chapters)

    def fetch_scene(self, scene_uid: str):
        with self.app.get_db() as session:
            scene = models.Scene.Fetch_by_uid(session, scene_uid)
            return scene.asdict()

    def fetch_scene_markedup(self, scene_uid: str):
        with self.app.get_db() as session:
            scene = models.Scene.Fetch_by_uid(session, scene_uid)

            processor = SceneProcessor()
            return processor.compile(scene.title, scene.content)



    def process_scene_markdown(self, scene_uid: str, raw_text:str):
        self.log.debug("`{}`, `{}`", scene_uid, raw_text)

        processor = SceneProcessor()
        try:
            response = processor.walk(raw_text)
            if 'markdown' not in response:
                response['markdown'] = raw_text
        except ValueError as exc:
            self.log.error("Handling walk failure: {}", exc)
            response = dict(status = 'error', message = str(exc.args))


        return response

        # if response['status'] == 'success':
        #     with self.app.get_db() as session:
        #         sceneRecord = models.Scene.Fetch_by_uid(session, scene_uid) # type: models.Scene
        #         sceneRecord.update(response)
        #         session.commit()
        #         response['updated_on'] = models.Scene.FMT_STR.format(sceneRecord.updated_on)
        #         self.log.debug("updated record hopefully")
        #         return response
        # elif response['status'] == 'split':
        #     self.log.debug("TODO split implementation")
        #     return response
        # else:
        #     self.log.error("Got a non-success status {}", response)
        #     return response



    def update_scene(self, scene_uid: str, new_data: T.Dict[str, str]):
        with self.app.get_db() as session:
            scene = models.Scene.Fetch_by_uid(session, scene_uid)
            scene.update(new_data)
            session.commit()

            return scene.asdict()

    def create_scene(self, chapter_uid: str, scene_title: str):
        with self.app.get_db() as session:
            chapter = models.Chapter.Fetch_by_uid(session, chapter_uid)
            scene = models.Scene(title=scene_title)
            chapter.scenes.append(scene)
            session.add(scene)
            session.commit()
            return scene.asdict()

    def delete_scene(self, chapter_uid: str, scene_uid: str):
        try:
            with self.app.get_db() as session:
                scene = models.Scene.Fetch_by_uid(session, scene_uid)
                parent = scene.chapter  # type: models.Chapter
                parent.scenes.remove(scene)
                session.delete(scene)
                parent.scenes.reorder()
                session.commit()
                return True
        except models.NoResultFound:
            raise ValueError("Scene was already deleted");

    def reorder_scenes(self, new_order:[models.Scene]):
        with self.app.get_db() as session:
            for authority in new_order:
                record = models.Scene.Fetch_by_uid(session, authority['id'])
                record.order = int(authority['order'])
                chapterId = record.chapter.id

            session.commit()

            data = models.Chapter.Fetch_by_Id(session, chapterId).asdict()

        return data['scenes']


    def boot_up(self):
        """
        Will be deprecated, automatically loads up the 1st Book for use with the app.
            :return: bool
        """
        result = self.app.main_window.create_confirmation_dialog(
            "Startup", "Click Ok to open an existing book."
        )
        if result:
            # self.find_source()
            return True

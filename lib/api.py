import typing as T
import logging

import webview  # type: ignore
from .scene_processor import SceneProcessor2 as SceneProcessor
from .application import BCApplication
from . import models
from .log_helper import getLogger
from .app_types import common_setting_type, UniqueID


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

    def get_current_book(self, stripped: bool = True) -> T.Optional[models.Book]:
        if self.app.has_active_book:
            with self.app.get_db() as session:
                book = self.app.get_book(session)
                return book.asdict(stripped=stripped) if book is not None else None

        return None

    def set_current_book(self, book_uid: str):
        with self.app.get_db() as session:
            book = models.Book.Fetch_by_UID(session, book_uid)
            self.app.book_id = book.id
            return book.asdict()

    def update_book(self, changed_book: dict[str, str]):
        with self.app.get_db() as session:
            book = models.Book.Fetch_by_UID(session, changed_book["id"])
            updated = book.update(changed_book)
            session.commit()
            return updated.asdict(True)

    def update_book_title(self, book_uid: str, new_title: str):
        with self.app.get_db() as session:
            book = models.Book.Fetch_by_UID(session, book_uid)
            book.title = new_title
            session.commit()
            return book.asdict(True)

    def fetch_book_simple(self, book_uid: str):
        with self.app.get_db() as session:
            self.log.info("book_ui == `{}`", book_uid)
            book = models.Book.Fetch_by_UID(session, book_uid)
            return book.asdict(stripped=True)

    def find_source(self):
        return self.app.main_window.create_file_dialog(
            webview.OPEN_DIALOG, allow_multiple=False, file_types=self.FILE_TYPES
        )

    def create_source(self):
        result = self.app.main_window.create_file_dialog(
            webview.SAVE_DIALOG, allow_multiple=False, file_types=self.FILE_TYPES
        )
        if result is None:
            self.alert(
                "No file was loaded or created, a save dialog will appear the next time you try to save."
            )

    def fetch_chapters(self):
        if self.app.has_active_book:
            with self.app.get_db() as session:
                return [
                    chapter.asdict() for chapter in self.app.fetch_chapters(session)
                ]

        return []

    def fetch_chapter(self, chapter_id: str):
        with self.app.get_db() as session:
            return models.Chapter.Fetch_by_uid(session, chapter_id).asdict()

    def fetch_chapter_index(self, chapter_id: str):
        with self.app.get_db() as session:
            return models.Chapter.Fetch_by_uid(session, chapter_id).asdict(True)

    def update_chapter(self, chapter_id: str, chapter_data: dict[str, str]):
        with self.app.get_db() as session:
            chapter = models.Chapter.Fetch_by_uid(session, chapter_id)
            chapter.update(chapter_data)
            session.commit()
            return chapter.asdict()

    def reorder_chapter(self, from_pos, to_pos):
        if self.app.has_active_book:
            with self.app.get_db() as session:
                book = self.app.get_book(session)
                floating = book.chapters.pop(from_pos)
                book.chapters.insert(to_pos, floating)
                book.chapters.reorder()
                session.commit()
                return True

        return False

    def fetch_stripped_chapters(self):
        if self.app.has_active_book:
            with self.app.get_db() as session:
                book = models.Book.Fetch_by_Id(session, self.app.book_id)
                return [chapter.asdict(stripped=True) for chapter in book.chapters]

        return []

    def create_chapter(self, new_chapter: dict):
        chapter = models.Chapter(title=new_chapter["title"], uid=models.generate_id(12))

        with self.app.get_db() as session:
            book = self.app.get_book(session)
            if book is not None:
                book.chapters.append(chapter)
                session.add(chapter)
                session.commit()
                return chapter.asdict()
            else:
                return None

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

    def process_scene_markdown(self, scene_uid: str, raw_text: str):
        self.log.debug("`{}`, `{}`", scene_uid, raw_text)

        processor = SceneProcessor()
        try:
            if len(raw_text.strip()) == 0:
                return dict(status='empty', markdown=raw_text )

            response = processor.walk(raw_text)
            if "markdown" not in response:
                response["markdown"] = raw_text
        except ValueError as exc:
            self.log.error("Handling walk failure: {}", exc)
            response = dict(status="error", message=str(exc.args))

        return response

    def update_scene(self, scene_uid: str, new_data: T.Dict[str, str]):
        with self.app.get_db() as session:
            scene = models.Scene.Fetch_by_uid(session, scene_uid)
            scene.update(new_data)
            session.commit()

            return (
                scene.asdict(),
                scene.chapter.asdict(),
            )

    def create_scene(self, chapterId, title, position=-1):
        with self.app.get_db() as session:
            chapter = models.Chapter.Fetch_by_uid(session, chapterId)
            scene = models.Scene(title=title)
            if position >= 0:
                chapter.scenes.insert(position, scene)
                chapter.scenes.reorder()
            else:
                chapter.scenes.append(scene)

            session.add(scene)
            session.commit()

            return (
                scene.asdict(),
                chapter.asdict(),
            )

    def delete_scene(self, chapter_uid: str, scene_uid: str):
        try:
            with self.app.get_db() as session:
                scene = models.Scene.Fetch_by_uid(session, scene_uid)
                parent = scene.chapter  # type: models.Chapter
                parent.scenes.remove(scene)
                session.delete(scene)
                parent.scenes.reorder()  # type: ignore
                parent.touch()
                session.commit()
                return True
        except models.NoResultFound:
            raise ValueError("Scene was already deleted")

    def reorder_scene(self, chapterId: str, from_pos, to_pos):
        with self.app.get_db() as session:
            chapter = models.Chapter.Fetch_by_uid(session, chapterId)
            floating = chapter.scenes.pop(from_pos)
            chapter.scenes.insert(to_pos, floating)
            session.commit()

    def reorder_scenes(self, new_order: T.List[dict[str, str]]):
        with self.app.get_db() as session:
            self.log.info("Reordering scenes: {}", new_order)

            for authority in new_order:
                self.log.info("Scene authority is {}", authority)

                record = models.Scene.Fetch_by_uid(session, authority["id"])
                record.order = int(authority["order"])
                chapterId = record.chapter.id

            models.Chapter.Touch(session, chapterId)
            session.commit()

            data = models.Chapter.Fetch_by_Id(session, chapterId).asdict()

        return data["scenes"]

    def list_all_characters(self, book_uid: str) -> list[dict[str, str]]:
        with self.app.get_db() as session:
            book = models.Book.Fetch_by_UID(session, book_uid)
            return [toon.asdict() for toon in book.characters]

    def list_characters_by_scene(self, scene_id: UniqueID):
        with self.app.get_db() as session:
            toons = models.Scene.List_all_characters_by_Uid(
                session, scene_id
            )  # type: T.List[models.Character]
            if toons is not None:
                return [toon.asdict() for toon in toons]
            else:
                return []

    def search_characters(self, query):
        with self.app.get_db() as session:
            result = models.Character.Search(session, query)
            if result is not None:
                return [toon.asdict for toon in result]

        return []

    def add_character_to_scene(self, scene_uid:UniqueID, toon_uid:UniqueID):
        with self.app.get_db() as session:
            scene = models.Scene.Fetch_by_uid(session, scene_uid)
            toon = models.Character.Fetch_by_Uid(session, toon_uid)
            scene.characters.append(toon)
            scene.touch()
            session.commit()
            return scene.asdict()

    def create_new_character_to_scene(self, book_uid:UniqueID, scene_uid:UniqueID, new_name:str):
        self.log.info(f"Looking for or add {book_uid=}, {scene_uid=}, {new_name=}")
        with self.app.get_db() as session:
            scene = models.Scene.Fetch_by_uid(session, scene_uid)
            toon = models.Character(name=new_name)
            book = models.Book.Fetch_by_UID(session, book_uid)
            book.characters.append(toon)
            book.touch()
            scene.characters.append(toon)
            scene.touch()
            session.commit()
            return scene.asdict()

    def fetch_character(self, book_uid: models.UID, character_uid: models.UID):
        with self.app.get_db() as session:
            book = models.Book.Fetch_by_UID(session, book_uid)  # type: models.Book
            toon = models.Character.Fetch_by_Uid_and_Book(session, book, character_uid)
            return toon.asdict(extended=True)

    def update_character(self, changed_character: dict[str, str|UniqueID]):
        with self.app.get_db() as session:
            character = models.Character.Fetch_by_Uid(
                session, changed_character["id"]
            )  # type: models.Character
            character.update(changed_character)
            session.commit()
            return character.asdict(extended=True)

    def delete_character(self, character_uid: UniqueID):
        with self.app.get_db() as session:
            models.Character.Delete_by_Uid(session, character_uid)
            session.commit()
            return True

    """
        Settings
    """

    def fetchAllSettings(self) -> T.List[dict[str, common_setting_type]]:
        with self.app.get_db() as session:
            return [setting.asdict() for setting in models.Setting.All(session)]

    def getSetting(self, name: str) -> common_setting_type:
        with self.app.get_db() as session:
            temp = models.Setting.Get(session, name)
            return temp

    def setSetting(self, name: str, value: common_setting_type):
        with self.app.get_db() as session:
            models.Setting.Set(session, name, value)
            session.commit()

    def bulkUpdateSettings(self, changeset: T.List[dict[str, common_setting_type]]):
        with self.app.get_db() as session:
            models.Setting.BulkSet(session, changeset)
            session.commit()

    def bulkDefaultSettings(self, changeset):
        with self.app.get_db() as session:
            for default in changeset:
                models.Setting.SetDefault(
                    session, default["name"], default["value"], default["type"]
                )

            session.commit()

    def setDefaultSetting(self, name, val, type):
        with self.app.get_db() as session:
            models.Setting.SetDefault(session, name, val, type)

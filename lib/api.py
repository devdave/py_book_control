import pathlib
import typing as T
import logging
import datetime as DT

import webview  # type: ignore
from sqlalchemy.exc import IntegrityError

from .scene_processor import SceneProcessor2 as SceneProcessor
from .application import BCApplication
from . import models
from .log_helper import getLogger
from .app_types import (
    common_setting_type,
    UniqueId,
    BookTypes,
    DocumentFile,
    ImportedBook,
)
from .app_types import (
    SettingType as Setting,
    SceneType as Scene,
    CharacterType as Character,
    ChapterDict as Chapter,
    BookType as Book,
    SceneStatusType as SceneStatus,
)


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

    def list_books(self, stripped: bool = True) -> list[Book]:
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

    def set_current_book(self, book_uid: UniqueId) -> Book:
        with self.app.get_db() as session:
            book = models.Book.Fetch_by_UID(session, book_uid)
            self.app.book_id = book.id
            return book.asdict()

    def update_book(self, changed_book: Book) -> Book:
        with self.app.get_db() as session:
            book = models.Book.Fetch_by_UID(session, changed_book["id"])  # type: ignore
            book.update(changed_book)
            session.commit()
            return book.asdict(True)

    def update_book_title(self, book_uid: UniqueId, new_title: str) -> Book:
        with self.app.get_db() as session:
            book = models.Book.Fetch_by_UID(session, book_uid)
            book.title = new_title
            session.commit()
            return book.asdict(True)

    def fetch_book_simple(self, book_uid: UniqueId) -> Book:
        with self.app.get_db() as session:
            self.log.info("book_ui == `{}`", book_uid)
            book = models.Book.Fetch_by_UID(session, book_uid)
            return book.asdict(stripped=True)

    def create_managed_book(self, book_name: str) -> Book:
        with self.app.get_db() as session:
            book = models.Book(title=book_name, operation_type=BookTypes.managed)
            session.add(book)
            session.commit()
            return book.asdict()

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

    def fetch_chapters(self) -> list[Chapter]:
        if self.app.has_active_book:
            with self.app.get_db() as session:
                return [
                    chapter.asdict() for chapter in self.app.fetch_chapters(session)
                ]

        return []

    def fetch_chapter(self, chapter_id: UniqueId, stripped: bool = False) -> Chapter:
        with self.app.get_db() as session:
            return models.Chapter.Fetch_by_uid(session, chapter_id).asdict(stripped)

    def fetch_chapter_index(self, chapter_id: UniqueId):
        return self.fetch_chapter(chapter_id, stripped=True)

    def update_chapter(self, chapter_id: UniqueId, chapter_data: Chapter) -> Chapter:
        with self.app.get_db() as session:
            chapter = models.Chapter.Fetch_by_uid(session, chapter_id)
            chapter.update(chapter_data)
            session.commit()
            return chapter.asdict()

    def reorder_chapter(self, book_uid: UniqueId, from_pos: int, to_pos: int) -> bool:
        if self.app.has_active_book:
            with self.app.get_db() as session:
                book = models.Book.Fetch_by_UID(session, book_uid)
                floating = book.chapters.pop(from_pos)
                book.chapters.insert(to_pos, floating)
                book.chapters.reorder()
                session.commit()
                return True

        return False

    def fetch_stripped_chapters(self, book_uid: UniqueId) -> list[Chapter]:
        if self.app.has_active_book:
            with self.app.get_db() as session:
                book = models.Book.Fetch_by_UID(session, book_uid)
                return [chapter.asdict(stripped=True) for chapter in book.chapters]

        return []

    def create_chapter(self, new_chapter: Chapter) -> T.Optional[Chapter]:
        with self.app.get_db() as session:
            chapter = models.Chapter(
                title=new_chapter["title"], uid=models.generate_id(12)
            )
            book = self.app.get_book(session)
            if book is not None:
                book.chapters.append(chapter)
                session.add(chapter)
                session.commit()
                return chapter.asdict()
            else:
                return None

    # def save_reordered_chapters(self, chapters: list[Chapter]):
    #     with self.app.get_db() as session:
    #         return models.Chapter.Reorder(session, chapters)

    def fetch_scene(self, scene_uid: UniqueId) -> Scene:
        with self.app.get_db() as session:
            scene = models.Scene.Fetch_by_uid(session, scene_uid)
            return scene.asdict()

    def fetch_scene_markedup(self, scene_uid: UniqueId) -> str:
        with self.app.get_db() as session:
            scene = models.Scene.Fetch_by_uid(session, scene_uid)

            processor = SceneProcessor()
            return processor.compile(scene.title, scene.content)

    def process_scene_markdown(self, scene_uid: UniqueId, raw_text: str):
        self.log.debug("`{}`, `{}`", scene_uid, raw_text)

        processor = SceneProcessor()
        try:
            if len(raw_text.strip()) == 0:
                return dict(status="empty", markdown=raw_text)

            response = processor.walk(raw_text)
            if "markdown" not in response:
                response["markdown"] = raw_text
        except ValueError as exc:
            self.log.error("Handling walk failure: {}", exc)
            response = dict(status="error", message=str(exc.args))

        return response

    def update_scene(
        self, scene_uid: UniqueId, new_data: Scene
    ) -> T.Tuple[Scene, Chapter]:
        with self.app.get_db() as session:
            scene = models.Scene.Fetch_by_uid(session, scene_uid)
            scene.update(new_data)
            session.commit()

            return (
                scene.asdict(),
                scene.chapter.asdict(),
            )

    def create_scene(
        self, chapter_id: UniqueId, title: str, position: int = -1
    ) -> T.Tuple[Scene, Chapter]:
        with self.app.get_db() as session:
            chapter = models.Chapter.Fetch_by_uid(session, chapter_id)
            scene = models.Scene(title=title)
            if position >= 0:
                chapter.scenes.insert(position, scene)
                chapter.scenes.reorder()  # type: ignore
            else:
                chapter.scenes.append(scene)

            statusValue = models.Setting.Get(session, "defaultSceneStatus")
            if statusValue != "-1":
                try:
                    status = models.SceneStatus.Fetch_by_Uid(session, statusValue)
                except Exception as exc:
                    self.log.error(
                        "Failed to attach default "
                        + f"scene status with id {statusValue=} because {exc=}"
                    )

            session.add(scene)
            session.commit()

            return (
                scene.asdict(),
                chapter.asdict(),
            )

    def delete_scene(self, chapter_uid: UniqueId, scene_uid: UniqueId) -> bool:
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

    def reorder_scene(self, chapterId: str, from_pos: int, to_pos: int):
        with self.app.get_db() as session:
            chapter = models.Chapter.Fetch_by_uid(session, chapterId)
            floating = chapter.scenes.pop(from_pos)
            chapter.scenes.insert(to_pos, floating)
            session.commit()

    def reorder_scenes(self, new_order: list[Scene]) -> Chapter:
        with self.app.get_db() as session:
            self.log.info("Reordering scenes: {}", new_order)

            for authority in new_order:
                self.log.info("Scene authority is {}", authority)

                record = models.Scene.Fetch_by_uid(session, authority["id"])
                record.order = int(authority["order"])
                chapterId = record.chapter.id

            models.Chapter.Touch(session, chapterId)
            session.commit()

            return models.Chapter.Fetch_by_Id(session, chapterId).asdict()

    def attach_scene_status2scene(
        self, scene_uid: UniqueId, status_uid: UniqueId
    ) -> bool:
        with self.app.get_db() as session:
            scene_status = models.SceneStatus.Fetch_by_Uid(session, status_uid)

            scene = models.Scene.Fetch_by_uid(session, scene_uid)

            scene.status = scene_status
            session.commit()
            return True

    """
    
        Character
    """

    def list_all_characters(self, book_uid: UniqueId) -> list[Character]:
        with self.app.get_db() as session:
            book = models.Book.Fetch_by_UID(session, book_uid)
            return [toon.asdict() for toon in book.characters]

    def list_characters_by_scene(self, scene_uid: UniqueId) -> list[Character]:
        with self.app.get_db() as session:
            toons = models.Scene.List_all_characters_by_Uid(
                session, scene_uid
            )  # type: T.List[models.Character]
            if toons is not None:
                return [toon.asdict() for toon in toons]
            else:
                return []

    def search_characters(self, query: str) -> list[Character]:
        with self.app.get_db() as session:
            result = models.Character.Search(session, query)
            if result is not None:
                return [toon.asdict() for toon in result]

        return []

    def add_character_to_scene(self, scene_uid: UniqueId, toon_uid: UniqueId) -> Scene:
        with self.app.get_db() as session:
            scene = models.Scene.Fetch_by_uid(session, scene_uid)
            toon = models.Character.Fetch_by_Uid(session, toon_uid)
            scene.characters.append(toon)
            scene.touch()
            session.commit()
            return scene.asdict()

    def remove_character_from_scene(
        self, character_uid: UniqueId, scene_uid: UniqueId
    ) -> bool:
        with self.app.get_db() as session:
            scene = models.Scene.Fetch_by_uid(session, scene_uid)
            toon = models.Character.Fetch_by_Uid(session, character_uid)
            scene.characters.remove(toon)
            session.commit()
            return True

    def create_new_character_to_scene(
        self, book_uid: UniqueId, scene_uid: UniqueId, new_name: str
    ) -> Scene:
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

    def fetch_character(self, book_uid: UniqueId, character_uid: UniqueId) -> Character:
        with self.app.get_db() as session:
            book = models.Book.Fetch_by_UID(session, book_uid)  # type: models.Book
            toon = models.Character.Fetch_by_Uid_and_Book(session, book, character_uid)
            return toon.asdict(extended=True)

    def update_character(self, changed_character: Character) -> Character:
        with self.app.get_db() as session:
            character = models.Character.Fetch_by_Uid(
                session, changed_character["id"]
            )  # type: models.Character
            character.update(changed_character)
            session.commit()
            return character.asdict(extended=True)

    def delete_character(self, character_uid: UniqueId) -> bool:
        with self.app.get_db() as session:
            models.Character.Delete_by_Uid(session, character_uid)
            session.commit()
            return True

    """
        Settings
    """

    def fetchAllSettings(self) -> list[Setting]:
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

    def bulk_update_settings(self, changeset: Setting):
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

    def set_default_setting(self, name, val, type):
        with self.app.get_db() as session:
            models.Setting.SetDefault(session, name, val, type)

    """
        Scene Status
    """

    def fetch_all_scene_statuses(self, book_uid: UniqueId) -> list[SceneStatus]:
        with self.app.get_db() as session:
            book = models.Book.Fetch_by_UID(session, book_uid)  # type: models.Book
            return [status.asdict() for status in book.scene_statuses]

    def fetch_scene_status(self, status_uid: UniqueId) -> SceneStatus:
        with self.app.get_db() as session:
            status = models.SceneStatus.Fetch_by_Uid(session, status_uid)
            return status.asdict(stripped=True)

    def create_scene_status(
        self,
        book_uid: UniqueId,
        name: str,
        color: str,
        scene_uid: T.Optional[UniqueId] = None,
    ) -> SceneStatus:
        with self.app.get_db() as session:
            book = models.Book.Fetch_by_UID(session, book_uid)
            status = models.SceneStatus(name=name, color=color, book=book)
            session.add(status)

            if scene_uid is not None:
                scene = models.Scene.Fetch_by_uid(session, scene_uid)
                scene.status = status

            try:
                session.commit()
            except IntegrityError:
                raise Exception(
                    "There may already be a scene status with that name for this book."
                )

            return status.asdict()

    def update_scene_status(
        self, status_uid: UniqueId, changeset: SceneStatus
    ) -> SceneStatus:
        with self.app.get_db() as session:
            status = models.SceneStatus.Fetch_by_Uid(session, status_uid)
            status.update(changeset)
            session.commit()
            return status.asdict()

    def delete_scene_status(self, status_uid: UniqueId) -> None:
        """
        Removes the targetted record

        TODO verify this cascades

        :param status_uid:
        :return:
        """
        with self.app.get_db() as session:
            models.SceneStatus.Delete(session, status_uid)
            session.commit()

    """  
  ____              _      _____                            _            
 |  _ \            | |    |_   _|                          | |           
 | |_) | ___   ___ | | __   | |  _ __ ___  _ __   ___  _ __| |_ ___ _ __ 
 |  _ < / _ \ / _ \| |/ /   | | | '_ ` _ \| '_ \ / _ \| '__| __/ _ \ '__|
 | |_) | (_) | (_) |   <   _| |_| | | | | | |_) | (_) | |  | ||  __/ |   
 |____/ \___/ \___/|_|\_\ |_____|_| |_| |_| .__/ \___/|_|   \__\___|_|   
                                          | |                            
                                          |_|
    """

    def importer_start_batch(self):
        return self.app.get_batch()

    def importer_add2_batch(self, name, value):
        return self.app.add2_batch(name, value)

    def importer_reset_batch(self):
        self.app.reset_batch()

    def importer_find_source(self, optional_dir: T.Optional[str]) -> str:
        starting_dir = optional_dir if isinstance(optional_dir, str) else ""

        returnval = self.app.main_window.create_file_dialog(
            dialog_type=webview.FOLDER_DIALOG, directory=starting_dir
        )
        self.log.debug("Source is {}", returnval)
        return returnval

    def importer_list_files(self, filepath: str) -> ImportedBook:
        path = pathlib.Path(filepath)
        if path.exists() is False or path.is_dir() is False:
            raise ValueError(f"{filepath} is not a valid directory")

        def stat2str(statval):
            return DT.datetime.fromtimestamp(statval).strftime("%Y-%m-%d %H:%M")

        def format_file(file: pathlib.Path):
            return DocumentFile(
                name=str(file.name),
                path=str(file.parent),
                created_date=stat2str(file.stat().st_ctime),
                modified_last=stat2str(file.stat().st_mtime),
                size=file.stat().st_size,
            )

        files = [
            format_file(file)
            for file in path.iterdir()
            if file.name.startswith("~") is False
            and file.name.startswith("_") is False
            and file.suffix == ".docx"
        ]

        project = ImportedBook(path=str(path), dir_name=path.name, documents=files)

        self.log.debug("File option list is {}", files)
        return project

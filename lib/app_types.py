import typing as T
from enum import Enum

UID = str
UniqueId = str
common_setting_type = T.Union[str, bool, int, None]


class SettingType(T.TypedDict):
    id: UniqueId
    name: str
    type: T.Literal["boolean", "string", "number"]
    value: common_setting_type


class CharacterType(T.TypedDict):
    id: UniqueId
    name: str
    notes: str
    book_id: UniqueId


class SceneType(T.TypedDict):
    id: UniqueId
    chapterId: UniqueId
    title: str
    notes: str
    type: T.Literal["scene"]
    order: int
    created_on: str
    updated_on: str

    characters: list[CharacterType]
    status_id: UniqueId
    status: T.Optional["SceneStatusType"]


class ChapterDict(T.TypedDict):
    id: UniqueId
    book_id: UniqueId
    type: T.Literal["chapter"]
    title: str
    order: T.Union[str | int]
    words: T.Union[str | int]
    created_on: str
    updated_on: str
    notes: str
    summary: str
    scenes: list[SceneType]

    source_file: T.Optional[str]
    source_size: T.Optional[int]
    source_modified: T.Optional[str]
    last_imported: T.Optional[str]


class BookType(T.TypedDict):
    id: UniqueId
    title: str
    notes: str

    words: T.Union[str | int]
    created_on: str
    updated_on: str

    chapters: T.List[ChapterDict]


class SceneStatusType(T.TypedDict):
    id: UniqueId
    name: str
    color: str

    book_id: UniqueId


class BookTypes(Enum):
    """The types of books the app works with."""

    managed = 1
    """The app controls everything about the project, starting from scratch"""

    oversight = 2
    """The app tries to import the project and locks Scene.content, Scene.Title, Chapter.Title, and Book.Title"""

    imported = 4
    """Similar to managed except the content was imported and can potentially import/update as directed by the user"""


class DocumentFile(T.TypedDict):
    name: str
    path: str
    created_date: str
    modified_last: str
    size: int
    words: int


class ImportedBook(T.TypedDict):
    path: str
    dir_name: str
    documents: list[DocumentFile]


class InitialSettings(T.TypedDict):
    book_name: str
    have_default_status: bool
    default_status: str
    status_color: str


class BatchSettings(T.TypedDict):
    documents: list[DocumentFile]
    name_and_status: InitialSettings
    book_path: str


class ImportMessage(T.TypedDict):
    action: T.Literal["show"]
    msg: T.Optional[str]


class ImportChapter(T.TypedDict):
    action: T.Literal["add_chapter"]
    name: str
    title: str
    scene_ct: int

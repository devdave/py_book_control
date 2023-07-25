import typing as T

UID = str
UniqueID = str
common_setting_type = T.Union[str, bool, int, None]


class SettingType(T.TypedDict):
    id: UniqueID
    name: str
    type: T.Literal["boolean", "string", "number"]


class CharacterType(T.TypedDict):
    id: UniqueID
    name: str
    notes: str
    book_id: UniqueID


class SceneType(T.TypedDict):
    id: UniqueID
    chapterId: UniqueID
    title: str
    notes: str
    type: T.Literal["scene"]
    order: int
    created_on: str
    updated_on: str

    characters: list[CharacterType]


class ChapterDict(T.TypedDict):
    id: UniqueID
    book_id: UniqueID
    type: T.Literal["chapter"]
    title: str
    order: T.Union[str | int]
    words: T.Union[str | int]
    created_on: str
    updated_on: str
    notes: str
    summary: str
    scenes: list[SceneType]


class BookType(T.TypedDict):
    id: UniqueID
    title: str
    notes: str

    words: T.Union[str | int]
    created_on: str
    updated_on: str

    chapters: T.List[ChapterDict]

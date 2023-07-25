import typing as T

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


class BookType(T.TypedDict):
    id: UniqueId
    title: str
    notes: str

    words: T.Union[str | int]
    created_on: str
    updated_on: str

    chapters: T.List[ChapterDict]

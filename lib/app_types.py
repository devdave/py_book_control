import typing as T

UID = str
UniqueID = str
common_setting_type = T.Union[str, bool, int, None]


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
    scenes: T.List[T.Dict]

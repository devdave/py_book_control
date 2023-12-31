from typing import TypedDict


class AppSettingValues(TypedDict):
    fontName: str
    fontWeight: int
    fontSize: int
    lineHeight: int
    debounceTime: int
    dontAskOnSplit: bool
    dontAskOnClear2Delete: bool
    defaultSceneStatus: str
    lastImportedPath: str
    save2Disk: bool
    saveInterval: int

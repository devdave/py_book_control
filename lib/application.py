import pathlib
import tomllib
import typing as T
import json

import webview  # type: ignore

from .app_types import BatchSettings
from . import models
from contextlib import contextmanager


class BCApplication:
    database_path: pathlib.Path
    main_window: webview.Window
    book_id: T.Optional[int]
    here: pathlib.Path

    Session: models.scoped_session

    _batch: T.Optional[dict[str, str]]

    def __init__(self, database_path: pathlib.Path, here: pathlib.Path = None):
        self.database_path = database_path
        self.main_window = None
        self.book_id = None
        self.here = here

        # Makes sure we can connect
        self.engine, self.Session = models.connect(self.database_path)

        self._batch = None

    def set_window(self, main_window):
        self.main_window = main_window

    def fetch_chapters(self, session):
        if self.has_active_book:
            return [chapter for chapter in self.get_book(session).chapters]

        return False

    @contextmanager
    def get_db(self):
        session = self.Session()
        yield session
        session.close()
        del session

    def get_batch(self) -> BatchSettings:
        if self._batch is None:
            self._batch = dict()

        return self._batch

    def add2_batch(self, name, value):
        self.get_batch()
        self._batch[name] = value
        return self._batch

    def reset_batch(self):
        self._batch = dict()

    def callback(self, identifierID, returnval):
        payload = json.dumps(returnval)
        script = "window.callBack('{0}', {1})".format(identifierID, payload)
        print(f"callback `{script}`")
        self.main_window.evaluate_js(script)

    def ensure_db_ready(self):
        def mk_setting(key, value):
            match type(value):
                case thing if isinstance(thing, str):
                    return models.Setting(name=key, value=value, type="string")
                case thing if isinstance(thing, int):
                    return models.Setting(name=key, value=value, type="number")
                case thing if isinstance(thing, bool):
                    return models.Setting(name=key, value=value, type="boolean")
                case _:
                    return models.Setting(name=key, value=value, type="string")

        try:
            defaults = tomllib.load(self.here / "defaults.settings.toml")
        except FileNotFoundError:
            defaults = dict()

        with self.get_db() as session:
            for key, value in defaults.items():
                setting = models.Setting.Fetch_by_Name(session=session, name=key)
                if setting is None:
                    new_setting = mk_setting(key, value)
                    if new_setting is not None:
                        session.add(new_setting)

            session.commit()

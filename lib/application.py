import pathlib

import webview
from . import models
from contextlib import contextmanager


class BCApplication:
    database_path: pathlib.Path
    main_window: webview.Window
    book_id: int
    Session: models.scoped_session

    def __init__(self, database_path: pathlib.Path):
        self.database_path = database_path
        self.main_window = None
        self.book_id = None

        # Makes sure we can connect
        self.engine, self.Session = models.connect(self.database_path)

    @property
    def has_active_book(self):
        return self.book_id is not None

    def get_book(self, session: models.Session) -> models.Book | None:
        if self.has_active_book:
            return models.Book.Fetch_by_Id(session, self.book_id)

        return None

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

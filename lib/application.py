import webview
from . import models
from contextlib import contextmanager

class BCApplication:
    main_window: webview.Window
    book_id: int
    session: models.scoped_session

    def __init__(self):
        self.main_window = None

        engine, Session = models.connect()
        self.Session = Session



        with self.get_db() as session:
            try:
                self.book_id = models.Book.Fetch_by_Id(session, 1).id
            except models.NoResultFound:
                new_book = models.Book(title="Test1")
                session.add(new_book)
                session.commit()
                self.book_id = new_book.id

    def get_book(self, session: models.Session) -> models.Book:
        return models.Book.Fetch_by_Id(session, self.book_id)

    def set_window(self, main_window):
        self.main_window = main_window

    def fetch_chapters(self, session):
        return [chapter for chapter in self.get_book(session).chapters]

    @contextmanager
    def get_db(self):
        session = self.Session()
        yield session
        session.close()
        del session
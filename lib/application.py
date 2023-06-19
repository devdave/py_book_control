import webview
from . import models

class BCApplication:
    main_window: webview.Window
    book: models.Book
    session: models.Session

    def __init__(self):
        self.main_window = None

        engine, session = models.connect()
        self.session = session

        try:
            self.book = models.Book.Fetch_book_by_id(self.session, 1)
        except models.NoResultFound:
            self.book = models.Book(title="Test1")
            self.session.add(self.book)
            self.session.commit()

    def set_window(self, main_window):
        self.main_window = main_window

    def fetch_chapters(self):
        return models.Chapter.Fetch_all(self.session)
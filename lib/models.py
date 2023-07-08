import datetime
import string
import random
import contextlib
import typing as T
import datetime as DT
from sqlalchemy import select, update, ForeignKey, create_engine, DateTime, func

from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.ext.orderinglist import ordering_list
from sqlalchemy.orm import (
    Session,
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
    declared_attr,
)


def generate_id(length):
    alphanum = string.ascii_letters + string.digits
    return "".join(random.choice(alphanum) for _ in range(length))


class Base(DeclarativeBase):
    id: Mapped[int] = mapped_column(primary_key=True)

    created_on: Mapped[DT.datetime] = mapped_column(server_default=func.now())
    updated_on: Mapped[DT.datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now()
    )

    @classmethod
    def Touch(cls, session: Session, fetch_id: int):
        stmt = update(cls).where(cls.id == fetch_id).values()
        session.execute(stmt)


    @classmethod
    def Fetch_by_Id(cls, session: Session, fetch_id: int):
        stmt = select(cls).where(cls.id == fetch_id)
        return session.execute(stmt).scalars().one()

    @declared_attr
    def __tablename__(self):
        return self.__name__


class Book(Base):
    uid: Mapped[str] = mapped_column(default=lambda: generate_id(12))
    title: Mapped[str]
    notes: Mapped[str] = mapped_column(default="")

    chapters: Mapped[T.List["Chapter"]] = relationship(
        back_populates="book",
        cascade="all, delete-orphan",
        order_by="Chapter.order",
        collection_class=ordering_list("order"),
    )

    @classmethod
    def Update(cls, session: Session, changeset: T.Dict[str, str]):
        if "id" not in changeset:
            raise ValueError("Missing Book's uid from changeset")

        uid = changeset["id"]

        book = cls.Fetch_by_UID(session, uid)

        SAFE_KEYS = ["title", "notes"]
        for safe in SAFE_KEYS:
            if safe in changeset:
                setattr(book, safe, changeset[safe])

        session.commit()
        return True

    @classmethod
    def Fetch_All(cls, session: Session):
        stmt = select(cls)
        return session.scalars(stmt).all()

    @classmethod
    def Fetch_by_UID(cls, session, uid):
        stmt = select(cls).where(cls.uid == uid)
        return session.scalars(stmt).one()

    def asdict(self, stripped=True):
        data = dict(
            type="book",
            id=self.id,
            title=self.title,
            updated_on=str(self.updated_on),
            created_on=str(self.created_on),
        )
        if stripped is False:
            data["chapters"] = [chapter.asdict() for chapter in self.chapters]

        return data

    @hybrid_property
    def words(self):
        return sum([chapter.words for chapter in self.chapters])


class Chapter(Base):
    uid: Mapped[str]
    title: Mapped[str]
    order: Mapped[int]

    summary: Mapped[str] = mapped_column(default="")
    notes: Mapped[str] = mapped_column(default="")

    scenes: Mapped[T.List["Scene"]] = relationship(
        back_populates="chapter",
        cascade="all, delete-orphan",
        order_by="Scene.order",
        collection_class=ordering_list("order"),
    )

    book_id: Mapped[int] = mapped_column(ForeignKey("Book.id"))
    book: Mapped["Book"] = relationship(back_populates="chapters")

    def asdict(self, stripped=False):
        data = dict(
            id=self.uid,
            type="chapter",
            title=self.title,
            order=self.order,
            words=self.words,
            created_on=str(self.created_on),
            updated_on=str(self.updated_on),
        )
        if stripped is False:
            data["notes"] = self.notes
            data["summary"] = self.summary

        data["scenes"] = [scene.asdict(stripped=stripped) for scene in self.scenes]
        return data

    @hybrid_property
    def words(self):
        return sum(scene.words for scene in self.scenes)

    @classmethod
    def Fetch_all(cls, session, stripped=False):
        stmt = select(cls)
        return session.scalars(stmt)

    @classmethod
    def Fetch_by_uid(cls, session: Session, chapter_uid) -> "Chapter":
        stmt = select(cls).where(cls.uid == chapter_uid)
        return session.scalars(stmt).one()

    @classmethod
    def Reorder(cls, session: Session, chapters: T.List[T.Dict[str, str]]):
        for chapterData in chapters:
            record = cls.Fetch_by_uid(chapterData["id"])
            record.order = chapterData["order"]

        session.commit()

    def update(self, chapter_data: dict[str, str]):
        VALID = ["title", "order", "summary", "notes"]

        for key, value in chapter_data.items():
            if key in VALID:
                setattr(self, key, value)


class Scene(Base):
    uid: Mapped[str] = mapped_column(default=lambda: generate_id(12))
    title: Mapped[str]
    order: Mapped[int]

    summary: Mapped[str] = mapped_column(default="")
    content: Mapped[str] = mapped_column(default="")
    notes: Mapped[str] = mapped_column(default="")
    location: Mapped[str] = mapped_column(default="")
    characters: Mapped[str] = mapped_column(default="")

    chapter_id: Mapped[int] = mapped_column(ForeignKey("Chapter.id"))
    chapter: Mapped["Chapter"] = relationship(back_populates="scenes")

    FMT_STR = "%y/%m/%d %H:%M:%S"

    def update(self, newScene: dict[str, str]):
        VALID = [
            "title",
            "order",
            "summary",
            "content",
            "notes",
            "location",
            "characters",
        ]
        for key, value in newScene.items():
            if key in VALID:
                setattr(self, key, value)

    @hybrid_property
    def words(self):
        cleaned = "" + self.content
        return len(cleaned.replace('",.!?', " ").split(" "))

    def asdict(self, stripped=False):
        data = dict(
            id=self.uid,
            type="scene",
            title=self.title,
            order=self.order,
            chapterId=self.chapter.uid,
            created_on=str(self.created_on),
            updated_on=str(self.updated_on),
            words=self.words,
        )

        if stripped is False:
            data["summary"] = self.summary
            data["notes"] = self.notes
            data["content"] = self.content
            data["location"] = self.location
            data["characters"] = self.characters

        return data

    @classmethod
    def Fetch_by_uid(cls, session, scene_uid):
        stmt = select(cls).where(cls.uid == scene_uid)
        return session.scalars(stmt).one()


@contextlib.contextmanager
def db_with():
    from sqlalchemy import create_engine
    from sqlalchemy.orm import Session

    engine = create_engine("sqlite:///test.sqlite3", echo=True)
    Base.metadata.create_all(engine, checkfirst=True)

    with Session(engine) as session:
        yield session


from sqlalchemy.orm import scoped_session
from sqlalchemy.orm import sessionmaker


def connect():
    engine = create_engine("sqlite:///test.sqlite3", echo=False)
    Base.metadata.create_all(engine, checkfirst=True)

    session_factory = sessionmaker(bind=engine)
    Session = scoped_session(session_factory)

    return engine, Session

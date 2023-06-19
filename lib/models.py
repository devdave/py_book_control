import string
import random
import contextlib
import typing as T
import datetime as DT
from sqlalchemy import select, ForeignKey, create_engine, DateTime, func

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
    def Fetch_All(cls, session: Session):
        stmt = select(cls)
        return session.scalars(stmt).all()

    @classmethod
    def Fetch_by_ID(cls, session, id):
        stmt = select(cls).where(cls.id == id)
        return session.scalars(stmt).one()

    def asdict(self, stripped=True):
        data = dict(type="book", id=self.id, title=self.title)
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
        SKIP = ["id", "scenes", "words"]

        for key, value in chapter_data.items():
            if key in SKIP:
                continue
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


    def update(self, newScene: dict[str, str]):
        SKIP = ["id", "words", "chapter_id", "chapterId"]
        for key, value in newScene.items():
            if key in SKIP:
                continue
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
        )

        if stripped is False:
            data["summary"] = self.summary
            data["content"] = self.content
            data["location"] = self.location
            data["characters"] = self.characters

        data["words"] = self.words

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


def connect():
    engine = create_engine("sqlite:///test.sqlite3", echo=True)
    Base.metadata.create_all(engine, checkfirst=True)

    return engine, Session(engine)

import string
import random
import contextlib
import typing as T
from sqlalchemy import select
from sqlalchemy import ForeignKey
from sqlalchemy import create_engine
from sqlalchemy import String
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.orderinglist import ordering_list
from sqlalchemy.orm import Session
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
    declared_attr

)
def generate_id(length):
    alphanum = string.ascii_letters + string.digits
    return "".join(random.choice(alphanum) for _ in range(length))


class Base(DeclarativeBase):
    id: Mapped[int] = mapped_column(primary_key=True)

    @declared_attr
    def __tablename__(self):
        return self.__name__

class Book(Base):
    name: Mapped[str]
    notes: Mapped[str]

    chapters: Mapped[T.List["Chapter"]] = relationship(
        back_populates="book",
        cascade="all, delete-orphan", order_by="Chapter.order", collection_class=ordering_list("order")
    )


    @classmethod
    def Fetch_book_by_id(cls, session, id):
        stmt = select(cls).where(cls.id == id)
        return session.scalars(stmt).one()

    def asdict(self):
        data = dict(type='book', id=self.id, name=self)
        data['chapters'] = [chapter.asdict() for chapter in self.chapters]
        return data


class Chapter(Base):
    uid: Mapped[str]
    name: Mapped[str]
    order: Mapped[int]

    notes: Mapped[str] = mapped_column(default="")

    scenes: Mapped[T.List["Scene"]] = relationship(
        back_populates="chapter", cascade="all, delete-orphan", order_by="Scene.order", collection_class=ordering_list("order")
    )

    book_id: Mapped[int] = mapped_column(ForeignKey("Book.id"))
    book: Mapped["Book"] = relationship(back_populates="chapters")

    def asdict(self):
        data = dict(id=self.uid, type='chapter', name=self.name, order=self.order)
        data['scenes'] = [scene.asdict() for scene in self.scenes]
        return data


    @classmethod
    def Fetch_all(cls, session):
        stmt = select(cls)
        return session.scalars(stmt)

    @classmethod
    def Fetch_by_uid(cls, session:Session, chapter_uid)->"Chapter":
        stmt = select(cls).where(cls.uid == chapter_uid)
        return session.scalars(stmt).one()




class Scene(Base):
    uid: Mapped[str] = mapped_column(default=lambda : generate_id(7))
    name: Mapped[str]
    order: Mapped[int]

    desc: Mapped[str] = mapped_column(default="")
    content: Mapped[str] = mapped_column(default="")
    notes: Mapped[str] = mapped_column(default="")

    chapter_id: Mapped[int] = mapped_column(ForeignKey("Chapter.id"))
    chapter: Mapped["Chapter"] = relationship(back_populates="scenes")

    locations: Mapped[T.List["Location"]] = relationship(
        back_populates="scene", cascade="all, delete-orphan", order_by="Location.order"
        , collection_class=ordering_list("order")
    )

    characters: Mapped[T.List["Character"]] = relationship(
        back_populates="scene", cascade="all, delete-orphan", order_by="Character.order"
        , collection_class = ordering_list("order")
    )

    def asdict(self):
        data = dict(id=self.uid, type='scene', name=self.name, order=self.order, desc=self.desc, content=self.content)
        data['locations'] = [location.asdict() for location in self.locations]
        data['characters'] = [character.asdict() for character in self.characters]
        return data

    @classmethod
    def Fetch_by_uid(cls, session, scene_uid):
        stmt = select(cls).where(cls.uid == scene_uid)
        return session.scalars(stmt).one()


class Location(Base):
    uid: Mapped[str]
    name: Mapped[str]
    order: Mapped[int]

    notes: Mapped[str]

    scene_id: Mapped[int] = mapped_column(ForeignKey("Scene.id"))
    scene: Mapped["Scene"] = relationship(back_populates="locations")

    def adsdict(self):
        return dict(id=self.uid, type='location', name=self.name, order=self.order, notes=self.notes)

class Character(Base):
    uid: Mapped[str]
    name: Mapped[str]
    order: Mapped[int]

    notes: Mapped[str]

    scene_id: Mapped[int] = mapped_column(ForeignKey("Scene.id"))
    scene: Mapped["Scene"] = relationship(back_populates="characters")

    def adsdict(self):
        return dict(id=self.uid, type='character', name=self.name, order=self.order, notes=self.notes)


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

import contextlib
import typing as T
from sqlalchemy import ForeignKey
from sqlalchemy import String
from sqlalchemy.ext.orderinglist import ordering_list
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
    declared_attr
)

class Base(DeclarativeBase):
    id: Mapped[int] = mapped_column(primary_key=True)

    @declared_attr
    def __tablename__(self):
        return self.__name__


class Chapter(Base):
    uid: Mapped[str]
    name: Mapped[str]
    order: Mapped[int]

    scenes: Mapped[T.List["Scene"]] = relationship(
        back_populates="chapter", cascade="all, delete-orphan", order_by="Scene.order", collection_class=ordering_list("order")
    )

    def asdict(self):
        data = dict(id=self.uid, name=self.name, order=self.order)
        data['scenes'] = [scene.asdict() for scene in self.scenes]
        return data


    @classmethod
    def Fetch_all(cls, session):
        stmt = select(cls)
        return session.scalars(stmt)



class Scene(Base):
    uid: Mapped[str]
    name: Mapped[str]
    order: Mapped[int]

    desc: Mapped[str]
    content: Mapped[str]

    locations: Mapped[T.List["Location"]] = relationship(
        back_populates="scene", cascade="all, delete-orphan", order_by="Location.order"
        , collection_class=ordering_list("order")
    )

    characters: Mapped[T.List["Character"]] = relationship(
        back_populates="scene", cascade="all, delete-orphan", order_by="Character.order"
        , collection_class = ordering_list("order")
    )

    def asdict(self):
        data = dict(id=self.uid, name=self.name, order=self.order, desc=self.desc, content=self.content)
        data['locations'] = [location.asdict() for location in self.locations]
        data['characters'] = [character.asdict() for character in self.characters]
        return data



class Location(Base):
    uid: Mapped[str]
    name: Mapped[str]
    order: Mapped[int]

    notes: Mapped[str]

    def adsdict(self):
        return dict(id=self.uid, name=self.name, order=self.order, notes=self.notes)

class Character(Base):
    uid: Mapped[str]
    name: Mapped[str]
    order: Mapped[int]

    notes: Mapped[str]

    def adsdict(self):
        return dict(id=self.uid, name=self.name, order=self.order, notes=self.notes)


@contextlib.contextmanager
def db_with():
    from sqlalchemy import create_engine
    from sqlalchemy.orm import Session

    engine = create_engine("sqlite:///test.sqlite3", echo=True)
    Base.metadata.create_all(engine, checkfirst=True)

    with Session(engine) as session:
        yield (engine, session)



def connect():
    from sqlalchemy import create_engine
    from sqlalchemy.orm import Session

    engine = create_engine("sqlite:///test.sqlite3", echo=True)
    Base.metadata.create_all(engine, checkfirst=True)

    return engine, Session(engine)
import string
import random
import contextlib
import typing as T
import datetime as DT

from typing import Sequence

from sqlalchemy import (
    select,
    update,
    ForeignKey,
    create_engine,
    func,
    Table,
    Column,
    and_,
    delete,
    insert,
)
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
    scoped_session,
    sessionmaker,
    attribute_keyed_dict,
    attributes,
)

from .log_helper import getLogger
from .app_types import common_setting_type, UID, UniqueID


log = getLogger(__name__)


GEN_LEN = 18


def generate_id(length) -> UniqueID:
    alphanum = string.ascii_letters + string.digits
    return "".join(random.choice(alphanum) for _ in range(length))


@contextlib.contextmanager
def db_with():
    from sqlalchemy import create_engine
    from sqlalchemy.orm import Session

    engine = create_engine("sqlite:///test.sqlite3", echo=True)
    Base.metadata.create_all(engine, checkfirst=True)

    with Session(engine) as session:
        yield session


def connect():
    engine = create_engine(
        "sqlite:///test.sqlite3", echo=False, pool_size=10, max_overflow=20
    )
    Base.metadata.create_all(engine, checkfirst=True)

    session_factory = sessionmaker(bind=engine)

    return engine, scoped_session(session_factory)


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

    def touch(self):
        # noinspection PyTypeChecker
        self.updated_on = DT.datetime.now()

    @classmethod
    def Fetch_by_Id(cls, session: Session, fetch_id: int):
        stmt = select(cls).where(cls.id == fetch_id)
        return session.execute(stmt).scalars().one()

    @declared_attr
    def __tablename__(self):
        return self.__name__


class Book(Base):
    uid: Mapped[str] = mapped_column(default=lambda: generate_id(GEN_LEN))
    title: Mapped[str]
    notes: Mapped[str] = mapped_column(default="")

    chapters: Mapped[T.List["Chapter"]] = relationship(
        back_populates="book",
        cascade="all, delete-orphan",
        order_by="Chapter.order",
        collection_class=ordering_list("order"),
    )

    characters: Mapped[T.List["Character"]] = relationship(back_populates="book")

    def update(self, change: T.Dict[str, str]):
        SAFE_KEYS = ["title", "notes"]
        for safe in SAFE_KEYS:
            if safe in change:
                setattr(self, safe, change[safe])

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
    def Fetch_by_UID(cls, session: Session, uid: str):
        stmt = select(cls).where(cls.uid == uid)
        return session.scalars(stmt).one()

    def asdict(self, stripped=True):
        data = dict(
            type="book",
            id=self.uid,
            title=self.title,
            updated_on=str(self.updated_on),
            created_on=str(self.created_on),
            words=str(self.words),
            notes=self.notes,
            chapters=[chapter.asdict(stripped) for chapter in self.chapters],
        )


        return data

    @hybrid_property
    def words(self):
        return sum([chapter.words for chapter in self.chapters])


class Chapter(Base):
    uid: Mapped[str] = mapped_column(default=lambda: generate_id(GEN_LEN))
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
    def Fetch_all(cls, session):
        stmt = select(cls)
        return session.scalars(stmt)

    @classmethod
    def Fetch_by_uid(cls, session: Session, chapter_uid) -> "Chapter":
        stmt = select(cls).where(cls.uid == chapter_uid)
        return session.scalars(stmt).one()

    @classmethod
    def Reorder(cls, session: Session, chapters: T.List[T.Dict[str, str]]):
        for chapterData in chapters:
            record = cls.Fetch_by_uid(session, chapterData["id"])
            record.order = int(chapterData["order"])

        session.commit()

    def update(self, chapter_data: dict[str, str]):
        VALID = ["title", "order", "summary", "notes"]

        for key, value in chapter_data.items():
            if key in VALID:
                setattr(self, key, value)


Scenes2Characters = Table(
    "scenes2characters",
    Base.metadata,
    Column(
        "scene_id", ForeignKey("Scene.id", name="FK_Scene2Character"), primary_key=True
    ),
    Column(
        "character_id",
        ForeignKey("Character.id", name="FK_Character2Scene"),
        primary_key=True,
    ),
)


class Scene(Base):
    uid: Mapped[str] = mapped_column(default=lambda: generate_id(12))
    title: Mapped[str]
    order: Mapped[int]

    summary: Mapped[str] = mapped_column(default="")
    content: Mapped[str] = mapped_column(default="")
    notes: Mapped[str] = mapped_column(default="")
    location: Mapped[str] = mapped_column(default="")

    characters: Mapped[list["Character"]] = relationship(
        secondary=Scenes2Characters,
        back_populates="scenes",
    )

    # cascade="all, delete-orphan"

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
        if cleaned == "":
            return 0

        return len(cleaned.replace('",.!?', " ").strip().split(" "))

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
            data["characters"] = [toon.asdict() for toon in self.characters]
        else:
             data['notes'] = self.notes and len(self.notes.strip()) > 0

        return data

    @classmethod
    def Fetch_by_uid(cls, session: Session, scene_uid: str) -> "Scene":
        stmt = select(cls).where(cls.uid == scene_uid)
        return session.execute(stmt).scalars().one()

    @classmethod
    def List_all_characters_by_Uid(
        cls, session: Session, scene_uid: str
    ) -> T.List["Character"]:
        scene = cls.Fetch_by_uid(session, scene_uid)
        return scene.characters


class Character(Base):
    uid: Mapped[str] = mapped_column(default=lambda: generate_id(GEN_LEN))
    name: Mapped[str] = mapped_column(unique=True)
    notes: Mapped[str] = mapped_column(default="")

    book_id: Mapped[int] = mapped_column(ForeignKey("Book.id", name="FK_Book2Scenes"))
    book: Mapped[Book] = relationship(back_populates="characters")

    scenes: Mapped[list[Scene]] = relationship(
        secondary=Scenes2Characters, back_populates="characters"
    )

    @classmethod
    def Get_All(cls, session):
        stmt = select(cls)
        return session.scalars(stmt)

    @classmethod
    def Search(cls, session: Session, query: str) -> Sequence["Character"]:
        stmt = select(cls).where(cls.name.ilike(f"{query}%"))
        return session.execute(stmt).scalars().all()

    def asdict(self, extended=False):
        data = dict(
            id=self.uid,
            name=self.name,
            notes=self.notes,
            book_id=self.book_id,
            created_on=str(self.created_on),
            updated_on=str(self.updated_on),
            scene_count=len(self.scenes),
        )

        if extended is True:
            locations = []

            for scene in self.scenes:  # type: Scene
                locations.append(
                    (scene.chapter.title, scene.chapter.uid, scene.title, scene.uid)
                )

            data["locations"] = locations

        return data

    def update(self, character_change: dict[str, str]):
        SAFE = ["name", "notes"]
        for safe_key in SAFE:
            if safe_key in character_change:
                setattr(self, safe_key, character_change[safe_key])

    @classmethod
    def Fetch_by_Uid(cls, session: Session, scene_uid: str):
        stmt = select(cls).where(cls.uid == scene_uid)
        return session.execute(stmt).scalars().one()

    @classmethod
    def Fetch_by_name_or_create(cls, session: Session, new_name: str):
        try:
            stmt = select(cls).where(cls.name.ilike(new_name))
            return session.execute(stmt).one()
        except NoResultFound:
            record = cls(name=new_name)
            session.add(record)
            return record

    @classmethod
    def Fetch_by_Uid_and_Book(cls, session: Session, book: Book, character_uid: UID):
        stmt = select(cls).where(and_(cls.book == book, cls.uid == character_uid))
        return session.execute(stmt).scalars().one()

    @classmethod
    def Delete_by_Uid(cls, session: Session, character_uid: str):
        stmt = delete(cls).where(cls.uid == character_uid)
        return session.execute(stmt)


class Setting(Base):
    name: Mapped[str] = mapped_column(unique=True)
    val: Mapped[str]
    type: Mapped[str]

    @classmethod
    def Get(cls, session: Session, val_name: str) -> common_setting_type:
        stmt = select(cls).where(cls.name == val_name)
        try:
            rec = session.execute(stmt).scalars().one()  # type: 'Setting'
        except NoResultFound:
            log.error(f"Failed to fetch: {val_name}")
            raise

        match rec.type:
            case "string":
                return rec.val
            case "number":
                return int(rec.val)
            case "boolean":
                return bool(int(rec.val))
            case _:
                return rec.val

    @classmethod
    def Set(cls, session: Session, val_name: str, value: common_setting_type):
        stmt = select(cls).where(cls.name == val_name)
        try:
            rec = session.execute(stmt).scalars().one()  # type: Setting
        except NoResultFound:
            raise ValueError(
                f"Attempting to set {val_name} but it hasn't been set in the DB yet."
            )
        else:
            rec.name = val_name
            rec.val = str(value)

    @classmethod
    def All(cls, session: Session) -> T.Sequence["Setting"]:
        stmt = select(cls)
        return session.execute(stmt).scalars().all()

    @classmethod
    def BulkSet(
        cls,
        session: Session,
        changeset: T.Dict[str, T.Dict[str, common_setting_type]],
    ):
        for name, item in changeset.items():
            cls.Set(session, name, item["value"])

    def asdict(self)->T.Mapping[str, common_setting_type]:
        data = dict(name=self.name, type=self.type)  # type: T.Dict[str, common_setting_type]
        match self.type:
            case 'number':
                data['value'] = int(self.val)
            case 'boolean' | 'bool':
                data['value'] = bool(int(self.val))
            case 'string':
                data['value'] = self.val
            case _:
                data["value"] = self.val

        return data

    @classmethod
    def SetDefault(
        cls, session: Session, name: str, val: common_setting_type, setting_type
    ):
        stmt = select(cls).where(cls.name == name)
        try:
            session.execute(stmt).scalars().one()
        except NoResultFound:
            rec = cls(name=name, val=val, type=setting_type)
            session.add(rec)
            session.commit()

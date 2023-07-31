import pathlib
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
    UniqueConstraint,
    text,
    String,
    Enum,
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

from .sa_pathlike import SAPathlike
from .log_helper import getLogger
from .app_types import (
    common_setting_type,
    UID,
    UniqueId,
    ChapterDict,
    SettingType,
    SceneStatusType,
    BookTypes,
)

log = getLogger(__name__)

GEN_LEN = 18


def generate_id(length) -> UniqueId:
    alphanum = string.ascii_letters + string.digits
    return "".join(random.choice(alphanum) for _ in range(length))


@contextlib.contextmanager
def db_with():
    from sqlalchemy import create_engine

    engine = create_engine("sqlite:///test.sqlite3", echo=True)
    Base.metadata.create_all(engine, checkfirst=True)

    with Session(engine) as session:
        yield session


def connect(db_path: pathlib.Path):
    engine = create_engine(
        f"sqlite:///{db_path}", echo=False, pool_size=10, max_overflow=20
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

    def update(self, changeset):
        if not hasattr(self, "SAFE_KEYS"):
            raise AttributeError(
                f"Attempting to update {self} with `{changeset=}` but missing SAFE_KEYS"
            )

        for safe_key in getattr(self, "SAFE_KEYS"):
            if safe_key in changeset:
                setattr(self, safe_key, changeset[safe_key])


class Book(Base):
    uid: Mapped[UniqueId] = mapped_column(default=lambda: generate_id(GEN_LEN))
    title: Mapped[str]
    notes: Mapped[str] = mapped_column(default="")

    operation_type: Mapped[BookTypes] = mapped_column(Enum(BookTypes))
    import_dir: Mapped[SAPathlike] = mapped_column(default=None)

    chapters: Mapped[T.List["Chapter"]] = relationship(
        back_populates="book",
        cascade="all, delete-orphan",
        order_by="Chapter.order",
        collection_class=ordering_list("order"),
    )

    SAFE_KEYS = ["title", "notes"]

    characters: Mapped[T.List["Character"]] = relationship(back_populates="book")

    scene_statuses: Mapped[T.List["SceneStatus"]] = relationship(back_populates="book")

    def update(self, change: T.Dict[str, str]):
        for safe in self.SAFE_KEYS:
            if safe in change:
                setattr(self, safe, change[safe])

    @classmethod
    def Update(cls, session: Session, changeset: T.Dict[str, str]):
        if "id" not in changeset:
            raise ValueError("Missing Book's uid from changeset")

        uid = changeset["id"]

        book = cls.Fetch_by_UID(session, uid)

        for safe in cls.SAFE_KEYS:
            if safe in changeset:
                setattr(book, safe, changeset[safe])

        session.commit()
        return True

    @classmethod
    def Fetch_All(cls, session: Session):
        stmt = select(cls)
        return session.scalars(stmt).all()

    @classmethod
    def Fetch_by_UID(cls, session: Session, uid: UniqueId):
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
    uid: Mapped[UniqueId] = mapped_column(default=lambda: generate_id(GEN_LEN))
    title: Mapped[str]
    order: Mapped[int]

    summary: Mapped[str] = mapped_column(default="")
    notes: Mapped[str] = mapped_column(default="")

    source_file: Mapped[SAPathlike] = mapped_column(default=None)
    """The source file from which this chapter and its scenes were imported from"""

    source_size: Mapped[int] = mapped_column(default=-1)
    """Ideally kilobytes but the actual value doesn't matter as this is fed from file stat"""

    source_modified: Mapped[int] = mapped_column(default=-1)
    """Ideally kilobytes but the actual value doesn't matter as this is fed from file stat"""

    last_imported: Mapped[DT.datetime] = mapped_column(default=None)
    """When was it last imported"""

    scenes: Mapped[T.List["Scene"]] = relationship(
        back_populates="chapter",
        cascade="all, delete-orphan",
        order_by="Scene.order",
        collection_class=ordering_list("order"),
    )

    book_id: Mapped[int] = mapped_column(ForeignKey("Book.id"))
    book: Mapped["Book"] = relationship(back_populates="chapters")

    SAFE_KEYS = ["title", "order", "summary", "notes"]

    def asdict(self, stripped=False) -> ChapterDict:
        data: ChapterDict = dict(
            id=self.uid,
            book_id=self.book.uid,
            type="chapter",
            title=self.title,
            order=self.order,
            words=self.words,
            created_on=str(self.created_on),
            updated_on=str(self.updated_on),
            notes=self.notes if stripped is False else "",
            summary=self.summary if stripped is False else "",
            scenes=[scene.asdict(stripped=stripped) for scene in self.scenes],
        )  # type: ignore

        return data

    @hybrid_property
    def words(self):
        return sum(scene.words for scene in self.scenes)

    @classmethod
    def Fetch_all(cls, session):
        stmt = select(cls)
        return session.scalars(stmt)

    @classmethod
    def Fetch_by_uid(cls, session: Session, chapter_uid: UniqueId) -> "Chapter":
        stmt = select(cls).where(cls.uid == chapter_uid)
        return session.scalars(stmt).one()

    @classmethod
    def Reorder(
        cls,
        session: Session,
        chapters: T.List[ChapterDict],
    ):
        for chapterData in chapters:
            record = cls.Fetch_by_uid(session, chapterData["id"])
            record.order = int(chapterData["order"])

        session.commit()

    # def update(self, chapter_data: dict[str, str]):
    #
    #
    #
    #     for key, value in chapter_data.items():
    #         if key in VALID:
    #             setattr(self, key, value)


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
    uid: Mapped[UniqueId] = mapped_column(default=lambda: generate_id(12))
    title: Mapped[str]
    order: Mapped[int]

    summary: Mapped[str] = mapped_column(default="")
    content: Mapped[str] = mapped_column(default="")
    notes: Mapped[str] = mapped_column(default="")
    location: Mapped[str] = mapped_column(default="")

    is_locked: Mapped[str] = mapped_column(default=False)
    """If set, the Scene is locked due likely to being imported in a managed book"""

    status: Mapped["SceneStatus"] = relationship(back_populates="scenes")
    scene_status_id: Mapped[int] = mapped_column(
        ForeignKey("SceneStatus.id", name="FK_Scene2SceneStatus"),
        default=None,
        nullable=True,
    )

    characters: Mapped[list["Character"]] = relationship(
        secondary=Scenes2Characters,
        back_populates="scenes",
    )

    # cascade="all, delete-orphan"

    chapter_id: Mapped[int] = mapped_column(ForeignKey("Chapter.id"))
    chapter: Mapped["Chapter"] = relationship(back_populates="scenes")

    SAFE_KEYS = [
        "title",
        "order",
        "summary",
        "content",
        "notes",
        "location",
    ]

    FMT_STR = "%y/%m/%d %H:%M:%S"

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

        if self.status:
            data["status"] = self.status.asdict()
        else:
            data["status"] = None

        if stripped is False:
            data["summary"] = self.summary
            data["notes"] = self.notes
            data["content"] = self.content
            data["location"] = self.location
            data["characters"] = [toon.asdict() for toon in self.characters]

        else:
            data["notes"] = self.notes and len(self.notes.strip()) > 0

        return data

    @classmethod
    def Fetch_by_uid(cls, session: Session, scene_uid: UniqueId) -> "Scene":
        stmt = select(cls).where(cls.uid == scene_uid)
        return session.execute(stmt).scalars().one()

    @classmethod
    def List_all_characters_by_Uid(
        cls, session: Session, scene_uid: UniqueId
    ) -> T.List["Character"]:
        scene = cls.Fetch_by_uid(session, scene_uid)
        return scene.characters


class Character(Base):
    uid: Mapped[UniqueId] = mapped_column(default=lambda: generate_id(GEN_LEN))
    name: Mapped[str] = mapped_column(unique=True)
    notes: Mapped[str] = mapped_column(default="")

    book_id: Mapped[int] = mapped_column(ForeignKey("Book.id", name="FK_Book2Scenes"))
    book: Mapped[Book] = relationship(back_populates="characters")

    scenes: Mapped[list[Scene]] = relationship(
        secondary=Scenes2Characters, back_populates="characters"
    )

    SAFE_KEYS = ["name", "notes"]

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

    @classmethod
    def Fetch_by_Uid(cls, session: Session, scene_uid: UniqueId):
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
    def Fetch_by_Uid_and_Book(
        cls, session: Session, book: Book, character_uid: UniqueId
    ):
        stmt = select(cls).where(and_(cls.book == book, cls.uid == character_uid))
        return session.execute(stmt).scalars().one()

    @classmethod
    def Delete_by_Uid(cls, session: Session, character_uid: UniqueId):
        stmt = delete(cls).where(cls.uid == character_uid)
        return session.execute(stmt)


class Setting(Base):
    name: Mapped[str] = mapped_column(unique=True)
    val: Mapped[str]
    type: Mapped[str]

    SAFE_KEYS = ["val"]

    @classmethod
    def _CastVal2Type(cls, type_name, value):
        match type_name:
            case "string":
                return value
            case "number":
                return int(value)
            case "boolean":
                try:
                    return bool(int(value))
                except ValueError:
                    if str(value).lower() == "true":
                        return True
                    elif str(value).lower() == "false":
                        return False

                    raise
            case _:
                return value

    @classmethod
    def Get(cls, session: Session, val_name: str) -> common_setting_type:
        stmt = select(cls).where(cls.name == val_name)
        try:
            rec = session.execute(stmt).scalars().one()  # type: 'Setting'
        except NoResultFound:
            log.error(f"Failed to fetch: {val_name}")
            raise

        return cls._CastVal2Type(rec.type, rec.val)

    @classmethod
    def Set(cls, session: Session, val_name: str, value: common_setting_type):
        stmt = select(cls).where(cls.name == val_name)
        try:
            rec = session.execute(stmt).scalars().one()  # type: Setting
        except NoResultFound:
            raise ValueError(
                f"Attempting to set {val_name} but it hasn't been created in the DB yet and therefore has no default."
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
        changeset: T.Dict[str, SettingType],
    ):
        for name, item in changeset.items():
            cls.Set(session, name, item["value"])

    def asdict(self) -> SettingType:
        data = dict(
            name=self.name,
            type=self.type,
            value=self._CastVal2Type(self.type, self.val),
        )  # type: T.Dict[str, common_setting_type]

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


class SceneStatus(Base):
    uid: Mapped[UniqueId] = mapped_column(default=lambda: generate_id(GEN_LEN))
    name: Mapped[str] = mapped_column(String(255, collation="NOCASE"))
    color: Mapped[str] = mapped_column(default="gray")

    book: Mapped["Book"] = relationship(back_populates="scene_statuses")
    book_id: Mapped[int] = mapped_column(
        ForeignKey("Book.id", name="FK_SceneStatus2Book")
    )

    scenes: Mapped[T.List["Scene"]] = relationship(back_populates="status")

    __table_args__ = (UniqueConstraint("book_id", "name", name="ux_book_name"),)

    SAFE_KEYS = ["name", "color"]

    def asdict(self, stripped=True) -> SceneStatusType:
        return dict(id=self.uid, name=self.name, color=self.color, book_id=self.book_id)

    @classmethod
    def Fetch_by_Uid(cls, session, scene_uid: UniqueId) -> "SceneStatus":
        stmt = select(cls).where(cls.uid == scene_uid)
        return session.execute(stmt).scalars().one()

    @classmethod
    def Fetch_by_Name(
        cls, session, book_uid: UniqueId, status_name: str
    ) -> T.Optional["SceneStatus"]:
        # TODO security threat!
        stmt = select(cls).where(
            cls.book.uid == book_uid, cls.name.ilike(f"{status_name}%")
        )
        print("Fetch by name", stmt)
        return session.execute(stmt).scalars().one_or_none()

    @classmethod
    def Fetch_All(cls, session: Session) -> T.Sequence["SceneStatus"]:
        stmt = select(cls)
        return session.execute(stmt).scalars().all()

    @classmethod
    def Create(cls, session, book_uid: UniqueId, name: str):
        record = cls.Fetch_by_Name(session, book_uid, name)
        if record is not None:
            raise ValueError(f"{name} already exists")
        book = Book.Fetch_by_UID(session, book_uid)
        return cls(name=name, book=book)

    @classmethod
    def Delete(cls, session: Session, status_uid: UniqueId):
        stmt = delete(cls).where(cls.uid == status_uid)
        return session.execute(stmt)

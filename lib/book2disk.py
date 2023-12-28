from typing import Tuple

from sqlalchemy.orm import Session

from app_types import UniqueId
from log_helper import getLogger

LOG = getLogger(__name__)


class RawFile:
    pass


class TextFile(RawFile):
    body: str

    def __init__(self, identity, body):
        self.body = body

    def write(self, fileobj):
        fileobj.write(self.body)


class ListFile(RawFile):
    items: [str]

    def __init__(self, identity):
        self.items = []

    def add(self, name, value) -> None:
        self.items.append(
            (
                name,
                value,
            )
        )

    def write(self, fileobj):
        for name, value in self.items:
            fileobj.write(f"{name}:\t{value}\n\n")


class Book2Disk(object):
    @classmethod
    def CheckBook(cls, session: Session, book_id: UniqueId) -> bool:
        LOG.debug(f"Checking book session {session.identity_map.keys()}")

        if len(session.dirty):
            LOG.debug(f"Book is dirty {session.dirty}")
        elif len(session.deleted):
            LOG.debug(f"Book will be deleted {session.deleted}")
        elif len(session.new):
            LOG.debug(f"New book will be created! {session.new}")

    @classmethod
    def CheckChapter(
        cls, session: Session, book_id: UniqueId, chapter_id: UniqueId
    ) -> bool:
        LOG.debug(f"Checking chapter session {session.identity_map.keys()}")

        if len(session.dirty):
            LOG.debug(f"Chapter is dirty {session.dirty}")

        elif len(session.deleted):
            LOG.debug(f"Chapter will be deleted {session.deleted}")

        elif len(session.new):
            LOG.debug(f"New chapter will be created! {session.new}")

    @classmethod
    def CheckScene(
        cls, session: Session, book_id: UniqueId, chapter_id: UniqueId
    ) -> bool:
        LOG.debug(f"Checking scene session {session.identity_map.keys()}")

        if len(session.dirty):
            LOG.debug(f"Scene is dirty {session.dirty}")

        elif len(session.deleted):
            LOG.debug(f"Scene will be deleted {session.deleted}")

        elif len(session.new):
            LOG.debug(f"New scene will be created! {session.new}")

    @classmethod
    def CheckCharacter(
        cls, session: Session, book_id: UniqueId, toon_id: UniqueId
    ) -> bool:
        LOG.debug(f"Checking character {session.identity_map.keys()}")

        if len(session.dirty):
            LOG.debug(f"Toon is dirty {session.dirty}")

        elif len(session.deleted):
            LOG.debug(f"Toon will be deleted {session.deleted}")

        elif len(session.new):
            LOG.debug(f"Toon will be created! {session.new}")

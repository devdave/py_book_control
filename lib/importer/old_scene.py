from __future__ import annotations
import typing as T
from nltk.tokenize import word_tokenize, sent_tokenize

from extractor.lib.docx import DocxParagraph


class Scene:
    body: T.List[DocxParagraph]
    location: T.List[str]
    notes: T.List[str]

    def __init__(
        self,
        body: T.List[DocxParagraph] | None = None,
        location: T.List[str] | None = None,
        notes: T.List[str] | None = None,
    ):
        self.body = body or []
        self.location = location or []
        self.notes = notes or []

    def add_body(self, para: DocxParagraph, paraId: str):
        self.body.append(para)

    def add_location(self, text: str):
        self.location.append(text)

    def add_note(self, text: str):
        self.notes.append(text)

    def is_empty(self):
        return len(self.body) > 0

    def __len__(self):
        return sum([len(self.body), len(self.location), len(self.notes)]) > 0

    def get_body(self, spacer=""):
        return spacer.join([para.get_body() for para in self.body])

    def get_notes(self, spacer="\n"):
        return spacer.join(self.notes)

    def get_location(self, spacer="| "):
        return spacer.join(self.location)

    def get_token_count(self):
        return len(word_tokenize(self.get_body()))

    def get_sentence_count(self):
        return len(sent_tokenize(self.get_body()))

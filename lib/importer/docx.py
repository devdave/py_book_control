import typing as T
from pathlib import Path
from zipfile import ZipFile
import unicodedata

from lxml.etree import fromstring, _Element

from .tags_and_ns import TAGS, NS


class UNSET:
    pass


class DocxProperty:
    style_name: str
    orientation: str

    def __init__(self, style_name, orientation):
        self.style_name = style_name
        self.orientation = orientation

    @property
    def is_left(self):
        return self.orientation == "left"

    @property
    def is_right(self):
        return self.orientation == "right"

    @property
    def is_center(self):
        return self.orientation == "center"

    @property
    def name(self):
        return self.style_name

    @property
    def is_title(self):
        return self.style_name.lower() == "title"

    @property
    def is_subtitle(self):
        return self.style_name.lower() == "subtitle"

    @classmethod
    def Load(cls, src_elm: _Element):
        # get style
        style = "Normal"
        style_sub = src_elm.find(TAGS.StyleType.value)
        if style_sub is not None:
            style: str = style_sub.attrib[TAGS.Val.value]

        # get orientation
        orientation = "both"
        orient_sub = src_elm.find(TAGS.Justification.value)
        if orient_sub is not None:
            orientation = orient_sub.attrib[TAGS.Val.value]

        return cls(style, orientation)

    @classmethod
    def Default(cls):
        return cls("Normal", "both")


class DocxParagraph:
    body: T.List[str]
    properties: DocxProperty
    hard_break: bool
    paraId: str

    def __init__(
        self,
        body,
        properties,
        paraId,
        hard_break=False,
    ):
        self.body = body
        self.properties = properties
        self.paraId = paraId
        self.hard_break = hard_break

    def get_body(self, spacer=""):
        return spacer.join(self.body)

    def __len__(self):
        return len(self.body)

    def __repr__(self):
        return f"<DocxParagraph body.len=={len(self.body)}, Properties=={self.properties}, {self.hard_break=}/>"

    def is_empty(self):
        if len(self.body) == 1 and self.body[0].strip() == "":
            return True

        return len(self.body) == 0

    @classmethod
    def Load(cls, src_elm: _Element):
        property_xml = src_elm.find(TAGS.ParaStyle.value)
        property = (
            DocxProperty.Load(property_xml)
            if property_xml is not None
            else DocxProperty.Default()
        )

        body = []
        hard_break = False
        for run_elm in src_elm.findall(TAGS.Run.value):  # type: _Element
            if run_elm.find(TAGS.PageBreak.value) is not None:
                hard_break = True

            for text_elm in run_elm.findall(TAGS.Text.value):  # type: _Element
                cleaned = unicodedata.normalize("NFKD", text_elm.text)
                body.append(cleaned)

        paraId = src_elm.attrib[TAGS.paraId.value]
        return cls(body, property, paraId, hard_break=hard_break)


class Docx:
    paragraphs: T.List[DocxParagraph]
    st_ctime: int
    st_mtime: int
    size_b: int

    def __init__(
        self,
        paragraphs: T.List[DocxParagraph],
        st_ctime: int,
        st_mtime: int,
        size_b: int,
    ):
        self.paragraphs = paragraphs
        self.st_ctime = st_ctime
        self.st_mtime = st_mtime
        self.size_b = size_b

    def __len__(self):
        return len(self.paragraphs)

    def __getitem__(self, index):
        return self.paragraphs[index]

    def __iter__(self):
        for paragraph in self.paragraphs:  # type: DocxParagraph
            yield paragraph

    @classmethod
    def Load(cls, file_path: Path):
        assert file_path.exists() is True
        assert file_path.is_file() is True
        assert file_path.suffix == ".docx"

        zip_file = ZipFile(file_path).read("word/document.xml")
        doc_elm = fromstring(zip_file)
        body = doc_elm[0]

        paragraphs = [
            DocxParagraph.Load(raw_paragraph)
            for raw_paragraph in body.findall(TAGS.ParaType.value)
        ]  # type: T.List[DocxParagraph]

        stat = file_path.stat()
        return cls(paragraphs, stat.st_ctime, stat.st_mtime, stat.st_size)

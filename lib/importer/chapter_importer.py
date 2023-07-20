import pathlib
from .docx import Docx


class Scene:
    title: str
    _body: list[str]
    location: str
    notes: str

    def __init__(self):
        self.title = ""
        self._body = []
        self.location = ""
        self.notes = ""

    @property
    def body(self):
        return "".join(self._body)

    def add_para(self, paratext):
        self._body.append(paratext)

    def add_location(self, text):
        self.location += f"\n{text}"
        self.location = self.location.strip()

    def add_title(self, text):
        self.title += f" {text}"
        self.title = self.title.strip()


class ChapterImporter:
    scenes: list[Scene]
    title: str

    def __init__(self):
        self.scenes = []
        self.title = ""

    def add_scene(self, scene: Scene):
        self.scenes.append(scene)

    def __len__(self):
        return len(self.scenes)

    @classmethod
    def Load(cls, src: pathlib.Path):
        chapter = ChapterImporter()

        document = Docx.Load(src)

        current_scene = Scene()
        empty_count = 0
        for idx, paragraph in enumerate(document.paragraphs):
            if len(paragraph.body) == 0:
                empty_count += 1
            else:
                empty_count = 0

            if empty_count >= 2:
                chapter.add_scene(current_scene)
                current_scene = Scene()
                empty_count = 0
                continue

            if paragraph.hard_break is True:
                chapter.add_scene(current_scene)
                current_scene = Scene()
                empty_count = 0
                continue

            if len(paragraph.body) == 0:
                current_scene.add_para("")
            else:
                empty_count = 0
                if paragraph.properties.is_right is True:
                    current_scene.add_location("".join(paragraph.body))
                elif paragraph.properties.is_title is True:
                    chapter.title = "".join(paragraph.body)
                elif paragraph.properties.is_center is True:
                    current_scene.add_title("".join(paragraph.body))
                else:
                    current_scene.add_para("".join(paragraph.body))

        chapter.add_scene(current_scene)

        if chapter.title == "":
            chapter.title = src.name

        return chapter

import typing as T
from pathlib import Path

from .docx import Docx, DocxParagraph, DocxProperty
from .scene import Scene


class Chapter:

    scenes: T.List[Scene]
    title: str
    subtitle: str

    def __init__(
        self,
        scenes: T.List[Scene],
        title: str | None = None,
        subtitle: str | None = None,
    ):
        self.scenes = scenes
        self.title = title
        self.subtitle = subtitle

    def __len__(self):
        return len(self.scenes)

    def __iter__(self):
        for scene in self.scenes:
            yield scene

    @classmethod
    def LoadFromFile(cls, file_path: Path | str):
        document = Docx.Load(file_path)

        scenes = []
        assert (
            len(document) > 0
        ), f"Error, cannot handle a empty document file {file_path}"

        # check scene 0/one for title/subtitle
        title = None
        subtitle = None
        last_was_empty = False
        current_scene = Scene()

        for paragraph in document:  # type: DocxParagraph
            if paragraph.hard_break is True:
                if len(current_scene) > 0:
                    scenes.append(current_scene)
                current_scene = Scene()

            elif paragraph.properties.is_title is True:
                title = paragraph.get_body()
                continue
            elif paragraph.properties.is_subtitle is True:
                subtitle = paragraph.get_body()
                continue
            elif paragraph.is_empty() is False:

                if paragraph.properties.is_right is True:
                    current_scene.add_location(paragraph.get_body())

                elif paragraph.properties.is_center is True:
                    # TODO fix this
                    print(f"<Note>{paragraph.body}</Note>")

                elif paragraph.get_body().startswith("//"):
                    current_scene.add_note(paragraph.get_body())

                else:
                    current_scene.add_body(paragraph, paragraph.paraId)

                last_was_empty = False
            elif paragraph.is_empty() is True:

                # Two consecutive blank lines detected!
                if last_was_empty is True:
                    if len(current_scene) > 0:
                        scenes.append(current_scene)
                    current_scene = Scene()

                last_was_empty = True
            else:
                raise ValueError(
                    f"Unexpected/impossible situation, paragraph is both empty and not empty {paragraph.is_empty()!r}"
                )

        if current_scene.is_empty() is False:
            scenes.append(current_scene)

        return cls(scenes=scenes, title=title, subtitle=subtitle)

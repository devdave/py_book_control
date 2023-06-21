from mistletoe import Document
from mistletoe import block_token, span_token
import typing as T


class RawScene:
    pass


def get_text(element):
    content = []
    if hasattr(element, "content"):
        if len(element.content) > 0:
            return [element.content]
    else:
        for child in element.children:
            content.extend(get_text(child))

    return content


class SceneProcessor:
    status: str
    msg: str
    title: T.Optional[str]
    body: T.List[str]

    is_first: bool

    def __init__(self):
        self.status = "error"
        self.msg = "An unhandled error has occurred"
        self.title = None
        self.body = []

    def walk(self, raw: str):
        self.ast = Document(raw.strip())

        if len(self.ast.children) <= 0:
            raise ValueError("A scene needs a title at minimum")

        if isinstance(self.ast.children[0], block_token.Heading):
            self.title = self.ast.children[0].content
        else:
            raise ValueError("Missing Scene title")

        for child in self.ast.children[1:]:
            if isinstance(child, block_token.Paragraph):
                self.visit_paragraph(child)
            elif isinstance(child, block_token.BlockCode) and get_text(child) == ["\n"]:
                continue
            elif isinstance(child, block_token.BlockCode):
                raise ValueError(
                    f"Text block out of place, missing a blank line after a scene title?"
                )
            elif isinstance(child, block_token.Heading):
                # split scene!
                new_title = child.children[0].content
                return dict(
                    status="split",
                    msg="Scene split detected",
                    title=self.title,
                    new_title=new_title,
                    content="\n\n".join(self.body),
                )
            else:
                raise ValueError(f"Unexpected element: {type(child)}, {vars(child)}")

        return dict(
            status="success",
            msg="",
            title=self.title,
            content="\n\n".join(self.body),
        )

    def visit_paragraph(self, elm: block_token.Paragraph):
        text = [child.content for child in elm.children if len(child.content) > 0]
        self.body.append("\n".join(text))

    def visit_blockcode(self, elm: block_token.BlockCode):
        text = [child.content for child in elm.children]
        self.body.append("\n".join(text))

    def consume(self, raw_scene: str):
        ast = Document(raw_scene.strip())

        response = dict()
        if len(ast.children) < 1:
            return dict(status="error", msg="Scene is missing a title")

        if isinstance(ast.children[0], block_token.Heading) is False:
            return dict(status="error", msg="Scene is missing a title")

        title = ast.children[0].content

        paragraphs = []
        for element in ast.children[1:]:
            if isinstance(
                element,
                (
                    block_token.Paragraph,
                    block_token.BlockCode,
                ),
            ):
                subbody = [child.content for child in element.children]
                paragraphs.append("\n".join(subbody))

        return dict(status="save", title=title, content="\n".join(paragraphs).strip())

    def compile(self, title, content):
        return f"# {title}\n\n{content}"
from mistletoe import Document
from mistletoe import block_token, span_token
import mistune
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


class SceneProcessor2:
    status: str
    msg: str
    title: T.Optional[str]
    body: T.List[str]

    parser: mistune.Markdown
    ast: T.List[T.Dict[str, T.Any]]

    def __init__(self):
        self.status = 'error'
        self.msg = 'unknown error or status unset'
        self.title = None
        self.content = []

        #split vars
        self.split_title = None
        self.split_content = []

        self.parser = mistune.create_markdown(renderer='ast')
        self.ast = []

    def collect_text(self, ast_node:T.Dict[str, T.Any]) -> str:
        body = []
        for child in ast_node['children']:
            if child['type'] == 'text':
                body.append(child['raw'])
            elif child['type'] == 'softbreak':
                body.append('\n')
            else:
                raise ValueError(f"I don't know how to collect text from {child}-{repr(child)}")

        return "".join(body)

    def compile(self, title, content):
        return f"""## {title}

{content}"""


    def walk(self, raw_txt: str):
        self.ast = self.parser(raw_txt)


        if len(self.ast[0]) <= 0:
            raise ValueError("A scene must have at least a title.")

        if self.ast[0]['type'] != 'heading':
            raise ValueError("A scene must start with a `# Scene title` header line.")

        if self.ast[0]['attrs']['level'] != 2:
            raise ValueError("A scene title must have a double sharp/2 # heading.")

        self.title = self.collect_text(self.ast [0]).strip()

        if len(self.ast) > 1 and self.ast[1]['type'] != 'blank_line':
            raise ValueError("Expected a blank line after the scene title!")

        for child in self.ast[2:]:
            if child['type'] == 'heading':
                if child['attrs']['level'] != 2:
                    raise ValueError("Scene split tile must have double sharp/2 #'s.")

                if self.status != 'split':
                    self.status = 'split'
                    self.split_title = self.collect_text(child).strip()
                else:
                    raise ValueError("Parser can only split one scene at a time!")

            elif child['type'] == 'paragraph':
                if self.status == 'split':
                    self.split_content.append(self.collect_text(child))
                else:
                    self.content.append(self.collect_text(child))

            elif child['type'] == 'blank_line':
                self.content.append('')
            else:
                raise ValueError(f"Unexpected token {child['type']} - unsure what to do with {repr(child)}")

        response = dict(
            status=self.status,
            title=self.title,
            content="\n".join(self.content)
        )

        if self.status == 'split':
            response['split_title'] = self.split_title
            response['split_content'] = "\n".join(self.split_content)



        return response


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

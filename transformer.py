import ast
import pathlib
import argparse
import typing as T

import jinja2
import tap

template_body = """

interface Boundary {
    remote: (method_name:string, ...args:any)=>any
}

class APIBridge {

    boundary:Boundary
    
    constructor(boundary:Boundary) {
        this.boundary = boundary
    }

    {% for func_name, func_def in functions|items() %}
    {%if func_def.doc %}/* {{func_def.doc}} */{% endif%}
    async {{ func_name }}( {% for key, arg_def in func_def.args|items %}{{key}}:string, {% endfor %}) {
        
        return await this.boundary.remote("{{ func_name }}", {% for key, arg_def in func_def.args|items %}{{key}}, {% endfor %});
    }
    {% endfor %}

}

export default APIBridge;
"""


class FuncArg(T.NamedTuple):
    name: str
    annotype: str = None


class FuncDef(T.NamedTuple):
    args: T.List[FuncArg] = []
    doc: str = ""


def process_source(src_file: pathlib.Path, dest: pathlib.Path = None):
    module = ast.parse(src_file.read_text(), src_file.name, mode="exec")

    body = []

    for element in module.body:
        if isinstance(element, ast.ClassDef):
            payload = process_class(element)
            clsbody = transform(payload)
            body.append(clsbody)
            break  # for now process only the first class in source

    product = "\n\n\n\n".join(body)

    if dest is None:
        print(product)
    else:
        dest.write_text(product)


def process_class(class_elm: ast.ClassDef):
    cls_name = class_elm.name
    functions = {}
    for element in class_elm.body:
        if isinstance(element, ast.FunctionDef):
            if element.name.startswith("__"):
                continue

            functions[element.name] = process_function(element)

    return (cls_name, functions)


def process_function(func_elm: ast.FunctionDef):
    # beeline for the args
    return FuncDef(process_args(func_elm.args.args), ast.get_docstring(func_elm))


def process_args(func_args: ast.arguments):
    return {
        arg_elm.arg: FuncArg(arg_elm.annotation)
        for arg_elm in func_args
        if arg_elm.arg != "self"
    }


def transform(payload: (str, set[str])):
    cls_name, functions = payload

    template = jinja2.Template(
        template_body,
    )
    return template.render(cls_name=cls_name, functions=functions)


class MainArgs(tap.Tap):
    """
        Dirt simple AST to hopefully parseable Javascript/Typescript
    """
    source: pathlib.Path  # Source Python file to transform into quasi js/ts
    dest: pathlib.Path = None  # optional file to write to instead of printing to stdout

    def configure(self) -> None:
        self.add_argument("source")
        self.add_argument("dest", type=pathlib.Path, default=None)



def main():
    args = MainArgs().parse_args()

    process_source(args.source, dest=args.dest)


if __name__ == "__main__":
    main()

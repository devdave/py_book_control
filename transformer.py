import ast
import pathlib
import argparse
import sys
from itertools import zip_longest
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
    async {{ func_name }}({{func_def.compiled|join(', ')}}) {
        
        return await this.boundary.remote("{{ func_name }}", {{func_def.arg_names|join(', ')}});
    }
    {% endfor %}

}

export default APIBridge;
"""


class FuncArg(T.NamedTuple):
    name: T.Optional[str]
    annotype: T.Optional[str] = None


class FuncDef(T.NamedTuple):
    args: T.List[FuncArg]
    doc: T.Optional[str]
    compiled: T.List[str]
    arg_names: T.List[str]


def process_source(src_file: pathlib.Path, dest: pathlib.Path|None = None):
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

    return cls_name, functions


def py2ts_value(something):

    if isinstance(something, str):
        return f"'{something}'"
    elif isinstance(something, bool):
        return "true" if something is True else 'false'
    else:
        return repr(something)

def process_function(func_elm: ast.FunctionDef):
    # unit tests... we don't need no stinking unit tests!
    # beeline for the args

    arg_map = dict()

    definition = FuncDef(process_args(func_elm.args.args), ast.get_docstring(func_elm), [], [])

    mapped_defaults = dict()

    if len(func_elm.args.defaults) > 0:
        names = [arg.arg for arg in func_elm.args.args]
        names.reverse()
        try:
            defaults = []
            for idx, elm in enumerate(func_elm.args.defaults):
                val = py2ts_value(process_default_argument(elm))
                defaults.append(val)

            # defaults = [py2ts_value(elm.value) for elm in func_elm.args.defaults]
        except AttributeError:
            print(f"Unable to process {func_elm} with {func_elm.args}")
            raise

        defaults.reverse()
        married = list(zip_longest(names, defaults))
        married.reverse()
        mapped_defaults = dict(married)


    for arg in func_elm.args.args: # type: ast.arg
        if arg.arg == "self": continue

        definition.arg_names.append(arg.arg)

        func_name = func_elm.name
        func_type = "any"
        arg_def = func_elm

        if isinstance(arg.annotation, ast.Subscript):
            #fuck it
            func_type = "any"

        elif arg.annotation is not None and hasattr(arg.annotation, "id"):
            match arg.annotation.id:
                case "str":
                    func_type = "string"
                case ["int","float"]:
                    func_type = "number"
                case "bool":
                    func_type = "boolean"
                case _:
                    func_type = "any"

        arg_map[arg.arg] = f"{arg.arg}:{func_type}"
        if arg.arg in mapped_defaults and mapped_defaults[arg.arg] in (None, 'None'):
            del mapped_defaults[arg.arg]

        if arg.arg not in mapped_defaults:
            arg_body = f"{arg.arg}:{func_type}"
        else:
            arg_body = f"{arg.arg}:{func_type} = {mapped_defaults[arg.arg]}".replace("'","")

        definition.compiled.append(arg_body)

    return definition


def process_default_argument(defaultOp):

    if isinstance(defaultOp, (ast.unaryop, ast.UnaryOp,)) is True:
        #Very likely a negative number
        if isinstance(defaultOp.op, ast.USub):
            return f"-{defaultOp.operand.value}"
        elif isinstance(defaultOp.op, ast.UAdd):
            return f"+{defaultOp.operand.value}"
    elif isinstance(defaultOp, ast.Constant):
        if defaultOp.value is True:
            return 'true'
        elif defaultOp.value is False:
            return 'false'
        else:
            return str(defaultOp.value)

    elif hasattr(defaultOp, 'val'):
        return defaultOp.val
    else:
        raise ValueError(f"I don't know how to handle {type(defaultOp)} {vars(defaultOp)}")










def process_args(func_args: T.List[ast.arg]):
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
        self.add_argument("source", type=pathlib.Path)
        self.add_argument("dest", type=pathlib.Path)



def main():
    args = MainArgs().parse_args()
    assert args.source.exists(), f"Cannot find source {args.source} file to process!"

    if args.dest.name == "-":
        args.dest = None

    if args.dest is not None:
        assert args.dest.parent.exists(), f"Cannot write {args.dest.name} to {args.dest.parent} as it does not exist!"
        assert args.dest.parent.is_dir(), f"Cannot write {args.dest.name} to {args.dest.parent} as it is not a dir!"



    process_source(args.source, dest=args.dest)


if __name__ == "__main__":
    main()

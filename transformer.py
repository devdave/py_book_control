import ast
import pathlib
import argparse
import jinja2

template_body = """
class APIBridge {

    constructor(boundary) {
        this.boundary = boundary;
    }

    {% for func_name, args in functions|items() %}
    {{ func_name }}({{args|join(", ") }}) {
        {%- if args|length > 0 %}
        return this.boundary.remote("{{ func_name }}", {{ args|join(',') }});
        {%- else %}
        return this.boundary.remote("{{ func_name }}");
        {%- endif %}
    }
    {% endfor %}

}
"""

def process_body(src_file:pathlib.Path):

    module = ast.parse(src_file.read_text(), src_file.name, mode="exec")

    for element in module.body:
        if isinstance(element, ast.ClassDef):
            payload = process_class(element)
            transform(payload)
            break

def process_class(class_elm: ast.ClassDef):
    cls_name = class_elm.name
    functions = {}
    for element in class_elm.body:
        if isinstance(element, ast.FunctionDef):
            if element.name.startswith("__"): continue

            functions[element.name] = process_function(element)

    return (cls_name, functions)


def process_function(func_elm: ast.FunctionDef):
    # beeline for the args
    data = []
    for arg_elm in func_elm.args.args: # type: ast.arg
        if arg_elm.arg == "self":
            continue

        data.append(arg_elm.arg)

    return data


def transform(payload:(str, set[str])):
    cls_name, functions = payload

    template = jinja2.Template(
        template_body,
    )
    body = template.render(cls_name=cls_name, functions=functions)
    print(body)










def main():
    parser = argparse.ArgumentParser("Python to JS utility")
    parser.add_argument("source", type=pathlib.Path)
    args = parser.parse_args()

    process_body(args.source)





if __name__ == '__main__':
    main()
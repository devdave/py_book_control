import pytest
from lib.scene_processor import SceneProcessor

def test_transform_md2dict():

    processor = SceneProcessor()

    raw = """# Scene 1
    
This is the scene's content!
"""

    actual = processor.consume(raw)
    assert actual['title'] == "Scene 1"
    assert actual['content'] == "This is the scene's content!"


def test_catches_badsyntax():
    processor = SceneProcessor()

    raw = """# Split scene
Is this the first paragraph?

Is this the second paragraph?    
"""



    actual = processor.walk(raw)
    assert actual['title'] == "Split scene"
    assert actual['content'] == "Is this the first paragraph?\n\nIs this the second paragraph?"


def test_catches_scene_split():
    raw = """# Split scene

Is this the first paragraph?
Is this the second paragraph?

# Second scene    
        """

    processor = SceneProcessor()

    response = processor.walk(raw)

    assert response['status'] == 'split'
    assert response['content'] == 'Is this the first paragraph?\nIs this the second paragraph?'
    assert response['new_title'] == 'Second scene'


def test_return2md():
    processor = SceneProcessor()
    test_title = "Scene foo"
    test_content = """This is the first line!

a space and then another paragraph
with a third line right after!"""



    actual = processor.compile(test_title, test_content)

    expected = """# Scene foo

This is the first line!

a space and then another paragraph
with a third line right after!"""

    assert expected == actual

    processor2 = SceneProcessor()
    response = processor2.walk(expected)
    repeat = processor2.compile(response['title'], response['content'])

    assert expected == repeat


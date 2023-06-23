import pytest
# from lib.scene_processor import SceneProcessor
from lib.scene_processor import SceneProcessor2 as SceneProcessor

def test_transform_md2dict():

    processor = SceneProcessor()

    raw = """# Scene 1
    
This is the scene's content!
"""

    actual = processor.walk(raw)
    assert actual['title'] == "Scene 1"
    assert actual['content'] == "This is the scene's content!"


def test_catches_badsyntax():
    processor = SceneProcessor()

    raw = """# Split scene
Is this the first paragraph?

Is this the second paragraph?    
"""


    with pytest.raises(ValueError, match="Expected a blank line after the scene title."):
        actual = processor.walk(raw)



def test_catches_scene_split():
    raw = """# Split scene

Is this the first paragraph?
Is this the second paragraph?

# Second scene    
"""

    processor = SceneProcessor()

    response = processor.walk(raw)

    assert response['status'] == 'split'
    assert response['content'] == 'Is this the first paragraph?\nIs this the second paragraph?\n'
    assert response['split_title'] == 'Second scene'


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


def test_splits_2_large_paragraphs():

    data = """# Title 1

This is a block of text that should be detected as a paragraph
Second line of 1st paragraph of text and i need
one more line of text to hopefully get enough material for this test

# The Second title

Now the test is to see if the system is smart enough to handle a block of text after the split
point.   Ideally it should create a 'new_title' that equals 'The Secodn title' and a 'new_content'
block that has this paragraph in it.
""".strip()


    processor = SceneProcessor()
    product = processor.walk(data)

    title1 = 'Title 1'
    content1 = """This is a block of text that should be detected as a paragraph
Second line of 1st paragraph of text and i need
one more line of text to hopefully get enough material for this test

"""

    title2 = 'The Second title'
    content2 = """Now the test is to see if the system is smart enough to handle a block of text after the split
point.   Ideally it should create a 'new_title' that equals 'The Secodn title' and a 'new_content'
block that has this paragraph in it."""

    assert product['title'] == title1
    assert product['content'] == content1

    assert product['split_title'] == title2
    assert product['split_content'] == content2




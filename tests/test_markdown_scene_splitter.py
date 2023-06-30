from lib.md_splitter import MDSplitter

def test_basic_idea():

    raw = """
## scene1 

Some raw text goes here

## scene 2 

Blah de blah

more blah

## scene 3 

last scene cause I am lazy 
""".strip()

    scenes = MDSplitter.Process(raw)
    assert len(scenes) == 3

    assert scenes[1]['title'] == 'scene 2'
    assert scenes[2]['content'] == 'last scene cause I am lazy!'


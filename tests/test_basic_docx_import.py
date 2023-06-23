import pathlib

from lib.importer.chapter_importer import ChapterImporter


HERE = pathlib.Path(__file__).parent

THREE_SCENE = (HERE / "./data/sample_chapter_document.docx")
THREE_LOCATION = (HERE / "./data/sample_chapter_with_locations.docx")
THREE_TITLE = (HERE / "./data/sample_chapter_with_titles.docx")

SIMPLE_SCENES = [
    "This is the first scene in the document.  But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?1.2 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.1.3 This is the last paragraph in the first scene.  The following will be two blank lines followed by the text for the second scene.",
    "Second scene starts here!  Not there this is one blank line between each paragraph in this scene.  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Eget velit aliquet sagittis id consectetur purus ut. In est ante in nibh mauris. Gravida cum sociis natoque penatibus et magnis dis. Enim sed faucibus turpis in eu. Amet est placerat in egestas erat imperdiet sed euismod. Neque volutpat ac tincidunt vitae. Tristique et egestas quis ipsum suspendisse ultrices gravida. Sed faucibus turpis in eu mi. Gravida quis blandit turpis cursus in. Eu lobortis elementum nibh tellus molestie nunc non blandit massa. Etiam non quam lacus suspendisse faucibus. Commodo ullamcorper a lacus vestibulum sed arcu non odio euismod. Nunc id cursus metus aliquam. Quam vulputate dignissim suspendisse in est ante in nibh mauris. Enim lobortis scelerisque fermentum dui faucibus. Diam maecenas sed enim ut sem. Mi in nulla posuere sollicitudin aliquam ultrices sagittis orci a.2.2 Morbi tincidunt augue interdum velit euismod. Dui ut ornare lectus sit amet est placerat. Dignissim sodales ut eu sem integer vitae justo. Vitae tempus quam pellentesque nec. Tellus in metus vulputate eu scelerisque felis imperdiet proin fermentum. In hac habitasse platea dictumst quisque. Curabitur gravida arcu ac tortor dignissim convallis aenean. Hendrerit dolor magna eget est lorem ipsum dolor sit amet. Ut aliquam purus sit amet. Cursus mattis molestie a iaculis at erat pellentesque. Sollicitudin nibh sit amet commodo nulla facilisi nullam. Ipsum dolor sit amet consectetur. Id aliquet lectus proin nibh nisl condimentum. Urna porttitor rhoncus dolor purus non enim praesent elementum. Aliquet sagittis id consectetur purus ut faucibus pulvinar elementum. Ornare massa eget egestas purus. Tincidunt arcu non sodales neque. Dictum at tempor commodo ullamcorper a lacus vestibulum sed. Nisi lacus sed viverra tellus. Arcu ac tortor dignissim convallis aenean et tortor at.2.3 Vitae congue eu consequat ac felis donec. Amet risus nullam eget felis eget nunc lobortis. Feugiat sed lectus vestibulum mattis ullamcorper velit sed ullamcorper morbi. Varius morbi enim nunc faucibus a pellentesque. Diam phasellus vestibulum lorem sed risus ultricies tristique. Quam quisque id diam vel quam. Dictum sit amet justo donec enim diam. Pulvinar proin gravida hendrerit lectus. Turpis egestas maecenas pharetra convallis posuere morbi leo urna. Sed vulputate mi sit amet mauris commodo. Duis at tellus at urna condimentum mattis pellentesque id. Et egestas quis ipsum suspendisse ultrices. A diam maecenas sed enim ut sem viverra. Sed egestas egestas fringilla phasellus. Sollicitudin ac orci phasellus egestas tellus. Pellentesque adipiscing commodo elit at imperdiet. Diam volutpat commodo sed egestas egestas fringilla. Sit amet mauris commodo quis. Ac tortor dignissim convallis aenean et tortor at.2.4 Id ornare arcu odio ut sem nulla. Volutpat blandit aliquam etiam erat velit. Quis ipsum suspendisse ultrices gravida dictum. In nulla posuere sollicitudin aliquam ultrices. Faucibus purus in massa tempor. Id aliquet lectus proin nibh nisl condimentum id. Egestas pretium aenean pharetra magna ac placerat vestibulum lectus. Enim neque volutpat ac tincidunt. Eu ultrices vitae auctor eu augue ut. Est ultricies integer quis auctor elit sed vulputate mi sit. Platea dictumst quisque sagittis purus sit amet volutpat. Malesuada fames ac turpis egestas integer eget. Facilisi cras fermentum odio eu. Nisi scelerisque eu ultrices vitae auctor. Turpis tincidunt id aliquet risus feugiat in ante. Ullamcorper eget nulla facilisi etiam dignissim diam quis enim. Fermentum posuere urna nec tincidunt. Egestas quis ipsum suspendisse ultrices. Viverra nibh cras pulvinar mattis nunc sed blandit libero. Dolor sit amet consectetur adipiscing elit ut aliquam purus sit.2.5 Ac tincidunt vitae semper quis lectus nulla at. Sagittis id consectetur purus ut. Volutpat consequat mauris nunc congue nisi vitae. Ut pharetra sit amet aliquam id diam maecenas ultricies. Semper eget duis at tellus at urna condimentum. Turpis in eu mi bibendum neque egestas congue quisque egestas. Odio ut enim blandit volutpat. Odio ut sem nulla pharetra diam. Ultricies tristique nulla aliquet enim tortor at auctor. Urna neque viverra justo nec ultrices dui sapien. Ut tellus elementum sagittis vitae et leo. Et odio pellentesque diam volutpat commodo sed egestas egestas. Tortor condimentum lacinia quis vel eros donec ac. Diam maecenas ultricies mi eget mauris pharetra et ultrices. Arcu cursus euismod quis viverra. A lacus vestibulum sed arcu.2.6 This is the end of the 2nd scene and now it will be terminated by a hard new page",
    "This is the third and final scene.   Unlike the others, this will be smaller to make sure that size/length won’t affect scene parsing.   In fact it will be so short that there will only be one paragraph made up of three sentences.   As we come to the third sentence of the third scene, it is time to draw to a close and see how this experiment pans out!"
]


def test_imports_basic():
    chapter = ChapterImporter.Load(THREE_SCENE)


    assert len(chapter) == 3
    assert chapter.title == "sample_chapter_document.docx"
    assert chapter.scenes[0].body == SIMPLE_SCENES[0]
    assert chapter.scenes[1].body == SIMPLE_SCENES[1]
    assert chapter.scenes[2].body == SIMPLE_SCENES[2]

def test_imports_locations():
    chapter = ChapterImporter.Load(THREE_LOCATION)

    assert len(chapter) == 3
    assert chapter.title == "sample_chapter_with_locations.docx"
    assert chapter.scenes[0].location == "First scene| Beginning of the document"
    assert chapter.scenes[1].location == "Stuck in the middle with you"
    assert chapter.scenes[2].location == ""

def test_detects_titles():

    chapter = ChapterImporter.Load(THREE_TITLE)

    assert len(chapter) == 3
    assert chapter.title == "This is the chapter title"

    assert chapter.scenes[0].title == "This is the scene title"
    assert chapter.scenes[1].title == ""
    assert chapter.scenes[2].title == "All things must come to an end!"
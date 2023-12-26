import IPython
from pathlib import Path

from lib import models


Scene = models.Scene
Character = models.Character
Chapter = models.Chapter
Book = models.Book
select = models.select

engine, session = models.connect(Path("test.sqlite3"), echo=True)


test1 = session.execute(
    select(
        Character.uid,
        Character.name,
        Scene.uid.label("scene_id"),
        Scene.title,
        Chapter.title,
        Chapter.uid.label("chapter_id"),
    )
    .join(
        models.Scenes2Characters,
        Character.id == models.Scenes2Characters.c.character_id,
    )
    .join(Scene, Scene.id == models.Scenes2Characters.c.scene_id)
    .join(Chapter)
    .join(Book)
    .filter(Book.id == 1)
).fetchall()

headers = ("uid", "name", "scene_id", "scene_title", "chapter_title", "chapter_id")
for row in test1:
    print(dict(zip(headers, row)))

IPython.embed()

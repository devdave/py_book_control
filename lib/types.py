from dataclasses import dataclass, field
import typing as T

@dataclass()
class BaseElement:
    id: str
    title: str
    order: int

@dataclass()
class Location(BaseElement):
    notes: str
    pass


@dataclass()
class Character(BaseElement):
    notes: str


@dataclass()
class Scene(BaseElement):
    content: str
    desc: str
    locations: T.List[Location]
    characters: T.List[Character]
    notes: str
    words: int


@dataclass()
class Chapter(BaseElement):
    desc: str
    words: int
    scenes: T.List[Scene]

@dataclass()
class Book:
    id: str
    title: str
    notes: str

@dataclass()
class TargetedElement:
    id: str
    name: str
    words: int
    targetType: str
    targetedId: str
    children: T.List['TargetedElement'] = field(default_factory=list)


    def add_scene(self, id, name, words, scene_id):
        self.children.append(TargetedElement(id, name, words, "scene", scene_id))


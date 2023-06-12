from dataclasses import dataclass
import typing as T

@dataclass()
class BaseElement:
    id: str
    name: str
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
    locations: [Location]
    characters: [Character]
    notes: str
    words: int


@dataclass()
class Chapter(BaseElement):
    desc: str
    words: int
    scenes: [Scene]

@dataclass()
class Book:
    id: str
    title: str
    notes: str

@dataclass()
class TargetedElement:
    name: str
    words: int
    targetType: str
    targetedId: str
    children: T.List['TargetedElement']




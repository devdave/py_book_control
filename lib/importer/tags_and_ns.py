from enum import Enum


class NS(Enum):
    MAIN_WORD = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
    WORD_ML = "{http://schemas.microsoft.com/office/word/2010/wordml}"
    WORD_ML_20210 = "{http://schemas.microsoft.com/office/word/2010/wordml}"


class TAGS(Enum):
    Body = f"{NS.MAIN_WORD.value}body"
    ParaStyle = f"{NS.MAIN_WORD.value}pPr"
    ParaType = f"{NS.MAIN_WORD.value}p"
    Run = f"{NS.MAIN_WORD.value}r"
    Text = f"{NS.MAIN_WORD.value}t"
    Justification = f"{NS.MAIN_WORD.value}jc"
    Val = f"{NS.MAIN_WORD.value}val"
    PageBreak = f"{NS.MAIN_WORD.value}br"
    StyleType = f"{NS.MAIN_WORD.value}pStyle"
    paraId = f"{NS.WORD_ML_20210.value}paraId"

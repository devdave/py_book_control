from enum import Enum


class NS(Enum):
    MAIN_WORD = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
    WORD_ML = "{http://schemas.microsoft.com/office/word/2010/wordml}"
    WORD_ML_20210 = "{http://schemas.microsoft.com/office/word/2010/wordml}"


"""
It helps to read the spec slightly intoxicated.

<?xml version="1.0"?>
<w:document xmlns:w="…">
    <w:body>
        <w:p>
            <w:pPr>
                <w:jc w:val="center"/>
                <w:rPr>
                    <w:i/>
                </w:rPr>
            </w:pPr>
            <w:r>
                <w:t>Hello, world.</w:t>
            </w:r>
        </w:p>
    </w:body>
</w:document>

Above have 1 Paragraph, center styled with italics, and the text 'Hello, World.'


    A document root has
        a (B)ody
            has one or more (P)aragraph
                which have one more (R)uns
                    which has a (T)ext
"""


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

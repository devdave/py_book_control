import {Chapter} from "./types.ts";
import {GenerateRandomString} from "./lib/utils.ts";
import {Boundary} from "./lib/boundary.ts";

import React, {useState} from "react";
import {InputModal} from "./lib/input_modal.tsx";

type DS<Type> = React.Dispatch<React.SetStateAction<Type>>

export interface ListChaptersProps {
    boundary: Boundary,
    chapters: Chapter[],
    setChapters: DS<Chapter[]>,
    activeChapter: string | null,
    setActiveChapter: DS<String | null>
}

export const ListChapters: React.FC<ListChaptersProps> = ({
                                                              boundary,
                                                              chapters,
                                                              setChapters,
                                                              activeChapter,
                                                              setActiveChapter
                                                          }) => {


    let newChapterModal = new InputModal();

    const showChapterCreate = () => {
        newChapterModal.run(createChapter);
    }
    const createChapter = (chapterName: string) => {


        const my_id = GenerateRandomString(12);

        const order_pos = chapters.length;

        const new_chapter: Chapter = {
            id: my_id,
            name: chapterName,
            order: order_pos,
            words: 0,
            scenes: []
        };

        console.log(new_chapter);

        setActiveChapter(my_id);
        setChapters([...chapters, new_chapter]);


    }

    const deleteChapter = (chapterId: string) => {
        setChapters(chapters.filter(chapter => chapter.id !== chapterId));
    }

    const renderChapterContent = () => {


        if (Object.keys(chapters).length > 0) {

            const sortedChapters: Chapter[] = [].concat(chapters).sort((chapterA, chapterB) => chapterA.order - chapterB.order);

            return sortedChapters.map((chapter, idx) =>
                <tr key={idx}>
                    <td title="Double click to edit">{chapter.name}</td>
                    <td>{chapter.words}</td>
                    <td>{chapter.scenes.length}</td>
                    <td>
                        <button data-id={idx} onClick={() => deleteChapter(chapter.id)}>Delete</button>
                    </td>
                </tr>
            );
        } else {
            return (
                <tr>
                    <td colSpan={3}>No chapters</td>
                </tr>
            )
        }
    }

    const renderChapterList = () => {
        return (
            <table>
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Words</th>
                    <th>Scenes</th>
                </tr>
                </thead>
                <tbody>
                {renderChapterContent()}
                </tbody>
            </table>
        );
    }


    return (
        <>
            <button onClick={showChapterCreate}>New Chapter</button>
            {renderChapterList()}
        </>
    )
}
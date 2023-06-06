import {Chapter} from "./types.ts";
import {GenerateRandomString} from "./lib/utils.ts";
import {Boundary} from "./lib/boundary.ts";

import {Button, Text, TextInput} from '@mantine/core';
import { modals } from '@mantine/modals';
import {useState} from "react";

export interface ListChaptersProps {
    boundary: Boundary,
    chapters: Chapter[],
    setChapters:  React.Dispatch<React.SetStateAction<Chapter[]>>,
    activeChapter: string,
    setActiveChapter: React.Dispatch<React.SetStateAction<string>>
}

export const ListChapters:React.FC<ListChaptersProps> = ({boundary, chapters, setChapters, activeChapter, setActiveChapter}) => {



    const showChapterCreate = () => {

        const [chapterName, setChapterName] = useState("");

        const handleClose = () => {
            modals.closeAll();
            createChapter(chapterName);

        };

        modals.open({
            title: "Create a new chapter",
            children: (
                <>
                    <TextInput name="chapterName"
                               label="Chapter title"
                               placeholder="New chapter name"
                               data-autofocusa
                               onChange={(evt)=>setChapterName(evt.currentTarget.value)}
                    />
                    <Button fullWidth onClick={handleClose} mt="md">Create</Button>
                </>
            )
        })

    }
    const createChapter = (chapterName:string) => {


        const my_id = GenerateRandomString(12);

        const order_pos = Object.entries(chapters).length;

        const new_chapter: Chapter = {
            id: my_id,
            name: chapterName,
            order: order_pos,
            words: 0,
            scenes: []
        };

        setActiveChapter(my_id);
        setChapters([...chapters, new_chapter]);


    }

    const deleteChapter = (chapterId:string) => {
        setChapters(chapters.filter(chapter=>chapter.id !== chapterId));
    }

    const renderChapterContent = () => {


        if(Object.keys(chapters).length > 0) {

            const sortedChapters: Chapter[] = [].concat(chapters).sort((chapterA, chapterB)=>chapterA.order-chapterB.order);

            return sortedChapters.map( (chapter, idx) =>
                <tr key={idx}>
                    <td>{chapter.name}</td>
                    <td>{chapter.words}</td>
                    <td>{chapter.scenes.length}</td>
                    <td><button data-id={idx} onClick={()=>deleteChapter(chapter.id)}>Delete</button></td>
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
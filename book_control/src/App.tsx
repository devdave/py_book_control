
import {_, concat} from 'lodash';
import { useImmer } from 'use-immer';

import './App.css'
import {Chapter} from "./types.ts";
import {GenerateRandomString} from './utils.ts';

function App() {

    const [chapters, editChapters] = useImmer<Chapter[]>([]);

    const createChapter = () => {
        const my_id = GenerateRandomString(12);

        const order_pos = Object.entries(chapters).length;

        const new_chapter: Chapter = {
            id: my_id,
            name: `New Chapter ${order_pos}`,
            order: order_pos,
            words: 0,
            scenes: []
        };


        editChapters([...chapters, new_chapter]);


    }

    const deleteChapter = (chapterId:string) => {
        const updatedChapters = chapters.filter(chapter=>chapter.id !== chapterId);
        editChapters(updatedChapters);
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
            {renderChapterList()}
            <button onClick={createChapter}>New Chapter</button>
        </>
    )
}

export default App


import { useImmer } from 'use-immer';

import './App.css'
import {Chapter} from "./types.ts";
import {Boundary} from "./lib/boundary.ts";

import {ListChapters} from "./ListChapters.tsx";

function App() {

    const [chapters, setChapters] = useImmer<Chapter[]>([]);
    const [activeChapter, setActiveChapter] = useImmer<string>("");

    const boundary = new Boundary();




    return (
        <>
            <ListChapters
                boundary={boundary}
                chapters={chapters} setChapters={setChapters}
                activeChapter={activeChapter} setActiveChapter={setActiveChapter}
            />
        </>
    )


}

export default App

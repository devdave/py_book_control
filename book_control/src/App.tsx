import {useImmer} from 'use-immer';

import './App.css'
import {Chapter} from "./types.ts";
import {Boundary} from "./lib/boundary.ts";

import {ListChapters} from "./ListChapters.tsx";
import {useEffect, useState} from "react";
import {AppShell, Group, Navbar} from "@mantine/core";

function App() {

    const [chapters, setChapters] = useImmer<Chapter[]>([]);
    const [activeChapter, setActiveChapter] = useState<string | null>(null);

    const boundary = new Boundary();

    const doBootup = () => {
        window.removeEventListener("pywebview", doBootup);

        boundary.remote("boot_up").then((status: boolean) => {
                console.log("backend says: ", status);

                if (status === true) {
                    boundary.remote("fetch_chapters").then(
                        (chapters: Chapter[]) => {
                            setChapters(chapters);
                        }
                    );

                }
            }
        );
    }

    useEffect(
        () => {
            window.addEventListener("pywebviewready", doBootup);
        },
        []
    );

    const leftPanel = (
        <Navbar width={{base: 350}}>
            <ListChapters
                boundary={boundary}
                chapters={chapters} setChapters={setChapters}
                activeChapter={activeChapter} setActiveChapter={setActiveChapter}
            />
        </Navbar>
    )

    const appBody = (
        <h1>Hello World</h1>
    );


    return (
        <>
            <AppShell navbar={leftPanel}>
                {appBody}
            </AppShell>
        </>
    )


}

export default App

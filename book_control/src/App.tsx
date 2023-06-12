

import './App.css'
import {Chapter} from "./types.ts";
import {Boundary} from "./lib/boundary.ts";

import {ListChapters} from "./ListChapters.tsx";
import {useEffect, useState} from "react";
import {AppShell, Navbar} from "@mantine/core";

function App() {

    const [chapters, setChapters] = useState<Chapter[]>([]);

    const boundary = new Boundary();

    const doBootup = () => {
        window.removeEventListener("pywebview", doBootup);

        boundary.remote("boot_up").then((status: boolean) => {
                console.log("backend says: ", status);

                if (status === true) {
                    boundary.remote("fetch_chapters").then(
                        (fetched: Chapter[]) => {
                            setChapters(fetched);
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

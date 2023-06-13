

import './App.css'
import {Chapters, SceneRecord, TargetedElement} from "./types.ts";
import {Boundary} from "./lib/boundary.ts";

import {useEffect, useState} from "react";
import {AppShell, Navbar} from "@mantine/core";
import {ContentTree} from "./ContentTree.tsx";
import {RightPanel} from "./RightPanel.tsx";
import {useImmer} from "use-immer";


function App() {

    const [elements, setElements] = useState<Chapters[]>([]);
    const [activeElement, updateActiveElement] = useImmer<TargetedElement|null>(null);

    const boundary = new Boundary();



    const doBootup = () => {
        window.removeEventListener("pywebview", doBootup);

        boundary.remote("boot_up").then((status: boolean) => {
                console.log("backend says: ", status);

                if (status === true) {
                    boundary.remote("fetch_manifest").then(
                        (fetched: Chapters[]) => {
                            setElements(fetched);
                            console.log(fetched);
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
        <Navbar width={{base: 150}}>
            <Navbar.Section grow>
                <ContentTree elements={elements} boundary={boundary} setElements={setElements} activeElement={activeElement} updateActiveElement={updateActiveElement}/>
            </Navbar.Section>
        </Navbar>
    )

    const appBody = (
        <RightPanel activeElement={activeElement} updateActiveElement={updateActiveElement} boundary={boundary}/>
    );

    //Going to use https://github.com/brimdata/react-arborist

    return (
        <>
            <AppShell navbar={leftPanel}>
                {appBody}
            </AppShell>
        </>
    )


}

export default App

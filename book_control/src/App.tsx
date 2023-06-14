import './App.css'
import {Chapter, Chapters, SceneRecord} from "./types.ts";
import {Boundary, PYWEBVIEWREADY} from "./lib/boundary.ts";

import {useEffect, useState} from "react";
import {AppShell, Navbar} from "@mantine/core";
import {ContentTree} from "./ContentTree.tsx";
import {RightPanel} from "./RightPanel.tsx";
import {useImmer} from "use-immer";
import {assignWith} from "lodash";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";


function App() {

    const [elements, setElements] = useState<Chapters[]>([]);
    const [activeElement, updateActiveElement] = useImmer<Chapter | SceneRecord | null>(null);


    const boundary = new Boundary();

    const queryClient = useQueryClient();

    const chaptersQuery = useQuery({queryKey: ['chapters'], queryFn: fetchChapters});

    const createChapter = useMutation({
        mutationKey: ['chapters'],
        mutationFn: callCreateChapter,
        onSuccess: () => {
            queryClient.invalidateQueries(["chapters"]);
        }
    });

    const createScene = useMutation({
        mutationKey: ["scenes"],
        mutationFn: callCreateScene,
        onSuccess: () => {
            queryClient.invalidateQueries(["chapters"]);
        }
    });

    const updateScene = useMutation(
        {
            mutationKey: ["chapters", "scene"],
            mutationFn: callUpdateScene,
            onSuccess: () => {
                queryClient.invalidateQueries(["headers"]);
            }
        }
    )

    async function callUpdateScene(scene_data: SceneRecord) {
        const scene_id = scene_data.id;
        if (scene_id == undefined) {
            throw Error("Must include scene id to allow editing!");
        }
        const response = boundary.remote("update_scene", scene_id, scene_data);
        return response;
    }


    async function callCreateChapter(chapterName) {
        const newChapter = await boundary.remote("create_chapter", chapterName);
        return newChapter
    }

    async function callCreateScene([chapter_id, scene_name]) {
        const newScene = await boundary.remote("create_scene", chapter_id, scene_name);
        return newScene;
    }


    async function fetchChapters() {
        const chapters = await boundary.remote("fetch_manifest");
        console.log("Fetched", chapters);
        return chapters;
    }


    const leftPanel = (
        <Navbar width={{base: 150}}>
            <Navbar.Section grow>
                <ContentTree
                    createChapter={createChapter}
                    createScene={createScene}
                    chaptersData={chaptersQuery?.data}
                    activeElement={activeElement}
                    updateActiveElement={updateActiveElement}/>
            </Navbar.Section>
        </Navbar>
    )

    const appBody = (
        <RightPanel
            activeElement={activeElement}
            updateActiveElement={updateActiveElement}
            updateScene={updateScene}
            boundary={boundary}/>
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

import './App.css'
import {Chapter, SceneRecord} from "./types.ts";
import {Boundary, PYWEBVIEWREADY} from "./lib/boundary.ts";

import {useEffect, useState} from "react";
import {AppShell, LoadingOverlay, Navbar} from "@mantine/core";
import {ContentTree} from "./ContentTree.tsx";
import {RightPanel} from "./RightPanel.tsx";
import {APIBridge} from "./bridge.ts";
import {useImmer} from "use-immer";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";


function App() {

    const [isReady, setIsReady] = useState(false);
    const [activeElement, updateActiveElement] = useImmer<Chapter | SceneRecord | null>(null);

    const boundary = new Boundary();
    const bridge: APIBridge  = new APIBridge(boundary);

    const queryClient = useQueryClient();

    const chaptersQuery = useQuery({queryKey: ['chapters'], queryFn: bridge.fetch_chapters});

    useEffect(()=>{
        addEventListener(PYWEBVIEWREADY, ()=>setIsReady(true));
    },[])

    const createChapter = useMutation({
        mutationKey: ['chapters'],
        mutationFn: bridge.create_chapter,
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
                queryClient.invalidateQueries(["chapters"]);
            }
        }
    )

    async function callUpdateScene([scene_id, scene_data] ) {

        if (scene_id == undefined) {
            throw Error("Must include scene id to allow editing!");
        }
        console.log("callUpdateScene", scene_id, scene_data);
        const response = await bridge.update_scene(scene_id, scene_data);
        return response;
    }

    async function callCreateScene([chapter_id, scene_name]) {
        return await bridge.create_scene(chapter_id, scene_name);
    }


    if(isReady == false){
        return (
            <LoadingOverlay visible={true}/>
        );
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
            bridge={bridge}/>
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

import './App.css'
import {Chapter, SceneRecord} from "./types.ts";
import {Boundary} from "./lib/boundary.ts";


import {AppShell, Navbar} from "@mantine/core";
import {ContentTree} from "./ContentTree.tsx";
import {RightPanel} from "./RightPanel.tsx";
import {APIBridge} from "./bridge.ts";
import {useImmer} from "use-immer";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";


function App() {


    const [activeElement, updateActiveElement] = useImmer<Chapter | SceneRecord | null>(null);

    const boundary = new Boundary();
    const bridge: APIBridge = new APIBridge(boundary);

    const queryClient = useQueryClient();

    const {data} = useQuery({
        queryKey: ['chapters'],
        queryFn: bridge.fetch_chapters.bind(bridge)
    });


    const createChapter = useMutation({
        mutationKey: ['chapters'],
        mutationFn: bridge.create_chapter.bind(bridge),
        onSuccess: () => {
            queryClient.invalidateQueries(["chapters"]);
        }
    });

    const doCreateChapter = (chapterName:string) => {
        return createChapter.mutate(chapterName);
    }

    const createScene = useMutation({
        mutationKey: ["scenes"],
        mutationFn: callCreateScene,
        onSuccess: () => {
            queryClient.invalidateQueries(["chapters"]);
        }
    });

    const doCreateScene = (chapter_id: string, scene_name: string) => {
        return createScene.mutate([chapter_id, scene_name])
    }

    const updateScene = useMutation(
        {
            mutationKey: ["chapters", "scene"],
            mutationFn: callUpdateScene,
            onSuccess: () => {
                queryClient.invalidateQueries(["chapters"]);
            }
        }
    )

    async function callUpdateScene([scene_id, scene_data]:[scene_id:string, scene_data:SceneRecord]) {

        if (scene_id == undefined) {
            throw Error("Must include scene id to allow editing!");
        }
        console.log("callUpdateScene", scene_id, scene_data);
        const response = await bridge.update_scene(scene_id, scene_data);
        return response;
    }

    async function callCreateScene([chapter_id, scene_name]:[chapter_id:string, scene_name:string]) {
        return await bridge.create_scene(chapter_id, scene_name);
    }


    const leftPanel = (
        <Navbar width={{base: 150}}>
            <Navbar.Section grow>
                <ContentTree
                    createChapter={doCreateChapter}
                    createScene={doCreateScene}
                    chaptersData={data}
                    updateActiveElement={updateActiveElement}
                />
            </Navbar.Section>
        </Navbar>
    )

    const appBody = (
        <RightPanel
            activeElement={activeElement}
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

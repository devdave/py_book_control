import {useForm} from "@mantine/form";
import {useEffect, useState} from "react";
import {Button, createStyles, Divider, Flex, Skeleton, Text, Textarea} from "@mantine/core";
import {useDebouncedEffect} from "../lib/useDebouncedEffect";
import {useBookContext} from "../Book.context";
import {Scene} from "../types";
import {modals} from "@mantine/modals";

const useStyles = createStyles((theme) => ({
    greedytext: {
        height: "80vh"
    }
}));

interface SceneTextProps {
    scene: Scene
}

const compile_scene2md = (scene: Scene) => {
    return `## ${scene.title}\n\n${scene.content}`;
}


export const SceneText: React.FC<SceneTextProps> = ({scene}) => {
    const {api, activeScene, activeChapter, updateScene, createScene, reorderScene, deleteScene} = useBookContext();
    const [sceneLoaded, setSceneLoaded] = useState(false);
    const [sceneMD, setSceneMD] = useState("");

    const {classes} = useStyles();

    const form = useForm({
        initialValues: {
            content: compile_scene2md(scene),
            notes: scene.notes,
            summary: scene.summary,
        }
    });

    const scanDuplicateScenes = () => {
        const sceneList: { [key: string]:boolean } = {};

        if(activeChapter){
            activeChapter.scenes.map((scene, sdx)=>{

                if(scene == undefined || scene == null){
                    console.error("dupe!", activeChapter.scenes);
                    throw new Error("Founded an empty slot in scenes");
                }

                if(sceneList[scene.id] !== undefined){
                    console.error("Duplicate scene detected!", activeChapter.scenes);
                    throw Error("Integrity error!");
                } else {
                    sceneList[scene.id] = true;
                }

            })
        }
    }

    const doSplit = async (response: any) => {

        console.group("doSplit");

        let active = activeScene;

        if (active) {
            active.content = response['content'];
            updateScene(active);
            console.log("Updated current scene");
        }

        const priorLen = activeChapter ? activeChapter.scenes.length + 1 :
            activeScene ? activeScene.order + 1 : -1

        if(priorLen == -1) {
            console.error("No activeChapter on split, cannot proceeded!", activeChapter, activeScene);
            console.groupEnd();
            return;
        }


        const new_scene = await createScene(
            scene.chapterId,
            response['split_title'],
        );
        console.log("created new scene ", new_scene.id, new_scene.title);
        scanDuplicateScenes();

        new_scene.content = response['split_content'];

        // @ts-ignore
        console.log("Reordering", new_scene.chapterId, new_scene.order, activeScene.order+1);
        // @ts-ignore
        reorderScene(new_scene.chapterId, new_scene.order, activeScene.order+1);
        scanDuplicateScenes();

        console.groupEnd();
    }


    useDebouncedEffect(() => {

        async function reprocessMDnSave() {
            const response = await api.process_scene_markdown(scene.id, form.values['content']);

            if (response.status == "error") {
                form.setValues({content: sceneMD});

                throw new Error(response.message);
            }

            if (response.status == 'split') {
                console.log("Split!")
                console.log(response);

                modals.openConfirmModal({
                    modalId: "splitModal",
                    title: "Split/add new scene?",
                    children: (
                        <Text size="sm">
                            You have added a second title to the current scene. Was this a mistake
                            or do you want to create and insert a new after the current scene with the
                            new title?
                        </Text>
                    ),
                    labels: {confirm: "Do split", cancel: "Undo/remove second title"},
                    onConfirm: () => doSplit(response).then(),
                    onCancel: () => console.log("Split cancelled!")
                });

                return;

            }


            const new_scene =
                {
                    id: scene.id,
                    title: response['title'],
                    content: response['content'],
                    notes: form.values['notes'],
                    summary: form.values['summary'],
                }

            updateScene(
                {
                    ...scene,
                    ...new_scene
                }
            );
            console.log("Got safe content", response['markdown']);
            setSceneMD(prev => response['markdown']);
            return response['markdown'];
        }

        if (form.isDirty()) {
            reprocessMDnSave().catch(reason => {
                alert(`Failed to reprocess markdown to content: ${reason}`);
            });
        }

    }, [form.values], {delay: 1000, runOnInitialize: false});


    return (
        <Flex
            mih={50}
            gap="md"
            justify="center"
            align="stretch"
            direction="row"
            wrap="nowrap"
            style={{
                height: "100%"
            }}
        >
            <textarea
                style={{
                    height: "100%",
                    width: "100%",
                    boxSizing: "border-box",

                }}
                autoCapitalize="sentences"

                {...form.getInputProps("content")}
            />
            <Divider orientation="vertical"/>
            <Flex
                direction="column"
                style={{height: "100%"}}
            >
                <label>Notes</label>
                <textarea
                    autoCapitalize="sentences"
                    style={{
                        height: "40%",
                        flexGrow: 1
                    }}
                    {...form.getInputProps("notes")}
                />
                <label>Summary</label>
                <textarea
                    autoCapitalize="sentences"
                    style={{
                        height: "40%",
                        flexGrow: 1
                    }}
                    {...form.getInputProps("summary")}
                />
                <Button
                    onClick={()=>deleteScene(scene.chapterId, scene.id) }
                    >Delete Scene</Button>

            </Flex>
        </Flex>

    )
}
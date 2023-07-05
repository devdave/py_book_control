import {useForm} from "@mantine/form";
import {useEffect, useState} from "react";
import {Button, createStyles, Divider, Flex, Skeleton, Text, Textarea} from "@mantine/core";
import {useDebouncedEffect} from "../lib/useDebouncedEffect";
import {useBookContext} from "../Book.context";
import {Chapter, Scene} from "../types";
import {modals} from "@mantine/modals";
import {clone, map} from "lodash";

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
    const {
        api,
        activeScene,
        activeChapter,
        setActiveChapter,
        setActiveScene,
        updateScene,
        createScene,
        reorderScene,
        deleteScene,
        _setChapters,
    } = useBookContext();
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

    const doSplit = async (response: any) => {
        console.group("doSplit");


        if (activeScene == undefined || activeChapter == undefined) {
            //These are both undefined
            console.error("Cannot split scenes when there is no active scene or chapter.");
            throw new Error("Cannot split scenes when there is no active scene or chapter.");
        }
        const wasActiveChapter = clone(activeChapter);

        const activeSceneId = activeScene.id;
        const activeChapId = activeChapter.id;

        activeScene.content = response['content'];
        await api.update_scene(activeSceneId, activeScene);

        const newScene = await api.create_scene(activeChapId, response['split_title']);

        newScene.order = activeScene.order + 1;
        newScene.content = response['split_content'];

        let newScenes = clone(activeChapter.scenes);
        newScenes.splice(newScene.order, 0, newScene);
        const renumbered = map(newScenes, (newScene, idx)=>{
            newScene.order = idx;
            return newScene;
        })


        await api.reorder_scenes(renumbered);
        await api.update_scene(newScene.id, newScene);


        setActiveChapter(wasActiveChapter);
        setActiveScene(wasActiveChapter, newScene);

        console.groupEnd()


    }


    useDebouncedEffect(() => {

        async function reprocessMDnSave() {

            if(form.values['content'] != undefined && form.values['content'].trim().length == 0){
                modals.openConfirmModal({
                    modalId: "shouldDeleteScene",
                    title: "Scene body empty",
                    children: (
                        <Text size="sm">
                            The scene's content body is empty, do you want to delete this scene?
                        </Text>
                    ),
                    labels: {confirm: "Delete scene!", cancel: "Do not delete scene!"},
                    onConfirm: () => {deleteScene(scene.chapterId, scene.id)},

                })
                return;
            }

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
            <Text>{scene.order}</Text>
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
                    onClick={() => deleteScene(scene.chapterId, scene.id)}
                >Delete Scene</Button>

            </Flex>
        </Flex>

    )
}
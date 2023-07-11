import {useForm} from "@mantine/form";
import {Ref, useEffect, useRef, useState} from "react";
import {
    ActionIcon,
    Button,
    Center,
    createStyles,
    Divider,
    Flex, Group,
    Indicator,
    Skeleton,
    Text,
    Textarea,
    TextInput
} from "@mantine/core";

import {useDebouncedEffect} from "@src/lib/useDebouncedEffect";
import {PopoutTextarea} from "@src/widget/PopoutTextarea";
import {useEditorContext} from "../Editor.context";
import {Chapter, Scene} from "@src/types";
import {ResizeablePanels} from "@src/widget/ResizeablePanels";

import {modals} from "@mantine/modals";


import {useQueryClient} from "@tanstack/react-query";
import {IconWindowMaximize} from "@tabler/icons-react";


interface SceneTextProps {
    scene: Scene
}

const compile_scene2md = (scene: Scene) => {
    if (scene) {
        let content = (scene.content != undefined) ? scene.content : "";
        return `## ${scene.title}\n\n${scene.content}`;
    } else {
        return "Loading..."
    }

}


export const SceneText: React.FC<SceneTextProps> = ({scene}) => {


    const {
        api,
        activeBook,
        activeScene,
        activeChapter,
        setActiveScene,
        updateScene,
        deleteScene,
    } = useEditorContext();


    const [sceneMD, setSceneMD] = useState("");
    const queryClient = useQueryClient();


    const form = useForm<Partial<Scene>>({
        initialValues: {
            content: compile_scene2md(scene),
            notes: scene ? scene.notes : 'STOP! failed to load...',
            summary: scene ? scene.summary : 'STOP! failed to load...',
            location: scene ? scene.location : "STOP! Failed to load..."
        }
    });


    const doSplit = async (response: any) => {
        console.group("doSplit");

        form.reset()

        if (activeScene == undefined || activeChapter == undefined) {
            //These are both undefined
            console.error("Cannot split scenes when there is no active scene or chapter.");
            throw new Error("Cannot split scenes when there is no active scene or chapter.");
        }


        const activeSceneId = activeScene.id;
        const activeChapId = activeChapter.id;

        activeScene.content = response['content'];
        await api.update_scene(activeSceneId, activeScene);

        const newSceneAndChapter = await api.create_scene(activeChapId, response['split_title'], activeScene.order + 1);

        await queryClient.invalidateQueries({queryKey: ['book', activeBook.id, 'index']});
        await queryClient.invalidateQueries({queryKey: ['book', activeBook.id, 'chapter', activeChapId]});
        await queryClient.invalidateQueries({queryKey: ['book', activeBook.id, 'scene', activeSceneId]});

        setActiveScene(newSceneAndChapter[1], newSceneAndChapter[0]);
        console.groupEnd()


    }


    useDebouncedEffect(() => {

        async function reprocessMDnSave() {

            // @ts-ignore
            if (form.values['content'].trim().length == 0) {
                modals.openConfirmModal({
                    modalId: "shouldDeleteScene",
                    title: "Scene body empty",
                    children: (
                        <Text size="sm">
                            The scene's content body is empty, do you want to delete this scene?
                        </Text>
                    ),
                    labels: {confirm: "Delete scene!", cancel: "Do not delete scene!"},
                    onConfirm: () => {
                        deleteScene(scene.chapterId, scene.id)
                    },

                })
                return;
            }

            const response = await api.process_scene_markdown(scene.id, form.values['content'] as string);

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
                    onConfirm: () => doSplit(response).then(() => {
                        form.resetDirty()
                    }),
                    onCancel: () => console.log("Split cancelled!")
                });

                return;

            }


            //Else we're doing some simple update logic

            const new_scene =
                {
                    id: scene.id,
                    chapterId: scene.chapterId,
                    title: response['title'],
                    content: response['content'],
                    notes: form.values['notes'],
                    summary: form.values['summary'],
                    location: form.values['location'],
                }

            updateScene(new_scene);
            setSceneMD(prev => response['markdown']);
            form.resetDirty();
            return response['markdown'];
        }

        if (form.isDirty()) {
            reprocessMDnSave().catch(reason => {
                alert(`Failed to reprocess markdown to content: ${reason}`);
            });
        }

    }, [form.values], {delay: 1000, runOnInitialize: false});

    if (scene === undefined) {
        return (
            <Skeleton height={100} mt={6} width="100%" radius="xl"/>
        )
    }

    return (

        <ResizeablePanels>
            <Indicator
                color="red"
                position="top-start"
                processing
                disabled={!form.isDirty("content")}
                style={{
                    height: "100%",
                    width: "100%",
                    boxSizing: "border-box",
                }}
            >
            <textarea
                style={{
                    height: "100%",
                    width: "100%",
                    boxSizing: "border-box",

                }}
                autoFocus={activeScene?.id === scene.id}
                autoCapitalize="sentences"
                {...form.getInputProps("content")}
            />
            </Indicator>

            <Flex
                direction="column"
                style={{height: "100%", position: "relative", minWidth: "8rem"}}
            >
                <details open={true}>
                    <summary>Location</summary>
                    <Indicator processing color="red" disabled={!form.isDirty("location")}>
                        <Textarea placeholder="Scene location" autosize
                                  minRows={5} {...form.getInputProps("location")} />
                    </Indicator>
                </details>
                <details open={true} style={{}}>
                    <summary>Notes</summary>
                    <Indicator processing color="red"
                        disabled={!form.isDirty('notes')}
                               style={{height:"100%", width:"100%", flex:"1"}}
                    >
                        <Textarea
                            autosize minRows={5} autoCapitalize="sentences"
                            {...form.getInputProps("notes")}
                            style={{height:"100%", width:"100%", flex:"1" }}
                        />
                    </Indicator>
                </details>

                <details open={true}>
                    <summary>Summary</summary>

                    <Indicator
                        color="red" processing
                        disabled={!form.isDirty("summary")}
                    >
                    <Textarea
                        autosize minRows={5}
                        autoCapitalize="sentences"
                        {...form.getInputProps("summary")}
                    />
                    </Indicator>
                </details>

                <Button style={{position: "absolute", bottom: "0px"}}
                        onClick={() => deleteScene(scene.chapterId, scene.id)}
                >Delete Scene</Button>

            </Flex>
        </ResizeablePanels>
    )
}
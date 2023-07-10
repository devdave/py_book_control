import {useForm} from "@mantine/form";
import {Ref, useEffect, useRef, useState} from "react";
import {Button, createStyles, Divider, Flex, Indicator, Skeleton, Text, Textarea, TextInput} from "@mantine/core";
import {useDebouncedEffect} from "../../../lib/useDebouncedEffect";
import {useEditorContext} from "../Editor.context";
import {Chapter, Scene} from "../../../types";
import {modals} from "@mantine/modals";
import {clone, map} from "lodash";
import {useQueryClient} from "@tanstack/react-query";


interface SceneTextProps {
    scene: Scene
}

const compile_scene2md = (scene: Scene) => {
    if(scene){
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


    const form = useForm({
        initialValues: {
            content: compile_scene2md(scene),
            notes: scene ? scene.notes : 'STOP! failed to load...',
            summary: scene ? scene.summary : 'STOP! failed to load...',
            location: scene? scene.location : "STOP! Failed to load..."
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
        await api.update_scene( activeSceneId, activeScene);

        const newSceneAndChapter = await api.create_scene(activeChapId, response['split_title'], activeScene.order+1);

        await queryClient.invalidateQueries({queryKey:['book', activeBook.id, 'index']});
        await queryClient.invalidateQueries({queryKey:['book', activeBook.id, 'chapter', activeChapId]});
        await queryClient.invalidateQueries({queryKey:['book', activeBook.id, 'scene', activeSceneId]});

        setActiveScene(newSceneAndChapter[1], newSceneAndChapter[0]);
        console.groupEnd()


    }


    useDebouncedEffect(() => {

        async function reprocessMDnSave() {

            if(form.values['content'].trim().length == 0) {
                modals.openConfirmModal({
                    modalId: "shouldDeleteScene",
                    title: "Scene body empty",
                    children: (
                        <Text size="sm">
                            The scene's content body is empty, do you want to delete this scene?
                        </Text>
                    ),
                    labels: {confirm: "Delete scene!", cancel: "Do not delete scene!"},
                    onConfirm: () => { deleteScene(scene.chapterId, scene.id) },

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
                    onConfirm: () => doSplit(response).then(()=>{form.resetDirty()}),
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

    if(scene === undefined){
        return (
            <Skeleton height={100} mt={6} width="100%" radius="xl"/>
        )
    }

    return (
        <Flex
            // ref={ref}
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
                autoCapitalize="sentences"

                {...form.getInputProps("content")}
            />
            </Indicator>

            <Divider orientation="vertical"/>
            <Flex
                direction="column"
                style={{height: "100%"}}
            >

                <Indicator
                    processing
                    color="red"
                    disabled={!form.isDirty("location")}
                >
                    <textarea
                        label="Location"
                        placeholder="Scene location"
                        {...form.getInputProps("location")}
                    />
                </Indicator>

                <label>Notes</label>
                <Indicator
                    processing
                    color="red"
                    disabled={!form.isDirty('notes')}
                    style={{
                            height: "40%",
                            flexGrow: 1
                        }}
                >
                    <textarea
                        autoCapitalize="sentences"
                        style={{
                            height: "100%"
                        }}
                        {...form.getInputProps("notes")}
                    />
                </Indicator>

                <label>Summary</label>
                <Indicator
                    color="red"
                    processing
                    disabled={!form.isDirty("summary")}
                    style={{
                            height: "40%",
                            flexGrow: 1
                        }}
                    >
                    <textarea
                        autoCapitalize="sentences"
                        style={{
                            height: "100%"

                        }}
                        {...form.getInputProps("summary")}
                    />
                </Indicator>
                <Button
                    onClick={() => deleteScene(scene.chapterId, scene.id)}
                >Delete Scene</Button>

            </Flex>
        </Flex>
    )
}
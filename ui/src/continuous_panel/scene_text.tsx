import {useForm} from "@mantine/form";
import {useEffect, useState} from "react";
import {createStyles, Divider, Flex, Skeleton, Textarea} from "@mantine/core";
import {useDebouncedEffect} from "../lib/useDebouncedEffect";
import {useBookContext} from "../Book.context";
import {Scene} from "../types";

const useStyles = createStyles((theme) => ({
    greedytext: {
        height: "80vh"
    }
}));

interface SceneTextProps {
    scene: Scene
}

const compile_scene2md = (scene:Scene) => {
    return `## ${scene.title}\n\n${scene.content}`;
}



export const SceneText: React.FC<SceneTextProps> = ({scene}) => {
    const {api, updateScene, createScene, reorderScene} = useBookContext();
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


    useDebouncedEffect(() => {

        async function reprocessMDnSave() {
            const response = await api.process_scene_markdown(scene.id, form.values['content']);

            if (response.status == "error") {
                form.setValues({content: sceneMD});

                throw new Error(response.message);
            }

            if (response.status == 'split') {
                console.log("Split!")
                const new_scene = await createScene(
                    scene.chapterId,
                    response['split_title'],
                    scene.order + 1,
                );
                reorderScene(new_scene.chapterId, new_scene.order, scene.order + 1);

                new_scene.content = response['split_content'];
                updateScene(new_scene);

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

    }, [form.values], {delay: 500, runOnInitialize: false});



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
                boxSizing:"border-box",

            }}
            autoCapitalize="sentences"

            {...form.getInputProps("content")}
            />
            <Divider orientation="vertical"/>
            <Flex
                direction="column"
                style={{height:"100%"}}
            >
                <label>Notes</label>
                <textarea
                    autoCapitalize="sentences"
                    style={{
                        height: "40%",
                        flexGrow:1
                    }}
                    {...form.getInputProps("notes")}
                />
                <label>Summary</label>
                <textarea
                    autoCapitalize="sentences"
                    style={{
                        height: "40%",
                        flexGrow:1
                    }}
                    {...form.getInputProps("summary")}
                />


            </Flex>
        </Flex>

    )
}
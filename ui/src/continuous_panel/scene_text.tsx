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

export const SceneText: React.FC<SceneTextProps> = ({scene}) => {
    const {api, updateScene} = useBookContext();
    const [sceneLoaded, setSceneLoaded] = useState(false);
    const [sceneMD, setSceneMD] = useState("");

    const {classes} = useStyles();

    const form = useForm({
        initialValues: {
            content: sceneMD,
            notes: scene.notes,
            summary: scene.summary,
        }
    });

    useEffect(
        () => {

            async function doWork() {
                const markedown = await api.fetch_scene_markedup(scene.id);
                setSceneMD(markedown);
                form.setValues({content: markedown});


            }

            doWork().then(() => setSceneLoaded(true));

        },
        [scene]
    )


    useDebouncedEffect(() => {

        async function doWork() {
            const response = await api.process_scene_markdown(scene.id, form.values['content']);

            if (response.status == "error") {
                form.setValues({content: sceneMD});

                throw new Error(response.message);
            }

            if (response.status == 'split') {
                console.log("Split!")



            }


            const new_scene =
                {
                    id: scene.id,
                    title: response['title'],
                    content: response['content'],
                    updated_on: response['updated_on']
                }

            updateScene(
                {
                    ...scene,
                    new_scene
                }
            );
            console.log("Got safe content", response['markdown']);
            setSceneMD(prev => response['markdown']);
            return response['markdown'];
        }

        if (form.isDirty()) {
            doWork().then((mdtext) => setSceneMD(mdtext)).catch(reason => {
                alert(reason);
            });
        }

    }, [form.values], {delay: 500, runOnInitialize: false});


    if (sceneLoaded == false) {
        return (
            <Skeleton height={8} mt={6} width="70%" radius="xl"/>
        )
    }

    console.log("Conti ST ", sceneLoaded, sceneMD);

    return (
        <Flex
            mih={50}
            gap="md"
            justify="center"
            align="stretch"
            direction="row"
            wrap="nowrap"
        >
            <Textarea
                        style={{
                            height: "80vh",
                            flexGrow: 4
                        }}
                        autoCapitalize="sentences"
                      autosize
                      minRows={5}
                        maxRows={30}
                      variant="unstyled"
                      key={`smd-${scene.id}`}
                      {...form.getInputProps("content")}/>
            <Divider orientation="vertical"/>
            <Flex
                direction="column"


            >
                <Textarea
                    autoCapitalize="sentences"
                    autosize
                    minRows={10}
                    maxRows={15}
                    label="Notes"
                    style={{
                        minHeight:"30vh",
                        flexGrow:1
                    }}
                    {...form.getInputProps("notes")}
                ></Textarea>
                <Textarea
                    autoCapitalize="sentences"
                    autosize
                    minRows={10}
                    maxRows={15}

                    label="Summary"
                    style={{
                        minHeight:"30vh",
                        flexGrow:1
                    }}
                    {...form.getInputProps("summary")}
                ></Textarea>


            </Flex>
        </Flex>

    )
}
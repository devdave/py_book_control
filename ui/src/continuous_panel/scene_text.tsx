import {useForm} from "@mantine/form";
import {useEffect, useState} from "react";
import {Textarea} from "@mantine/core";
import {useDebouncedEffect} from "../lib/useDebouncedEffect";
import {useBookContext} from "../Book.context";
import {Scene} from "../types";


interface SceneTextProps {
    scene: Scene
}

export const SceneText: React.FC<SceneTextProps> = ({scene}) => {
    const {api, updateScene} = useBookContext();
    const [sceneLoaded, setSceneLoaded] = useState(false);
    const [sceneMD, setSceneMD] = useState("");


    const form = useForm({
        initialValues: {
            content: sceneMD
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

            if(response.status == "error"){
                form.setValues({content: sceneMD});
                throw new Error(response.message);
            }

            if(response.status == 'split'){

            }


            const new_scene =
                { id: scene.id,
                    title: response['title'],
                    content: response['content'],
                    updated_on: response['updated_on']
                }

            updateScene(
                {
                    ...scene,
                    ...new_scene
                }
            );

            return response['markdown'];
        }

        if (form.isDirty()) {
            doWork().then((mdtext) => setSceneMD(mdtext)).catch(reason=>{
                alert(reason);
            });
        }

    }, [form.values], {delay: 500});


    if (sceneLoaded == false) {
        return (
            <h2>Loading</h2>
        )
    }

    console.log("Conti ST ", sceneLoaded, sceneMD);

    return (
        <Textarea autoCapitalize="sentences"
                  autosize
                  minRows={5}
                  key={`smd-${scene.id}`}
                  {...form.getInputProps("content")}/>
    )
}
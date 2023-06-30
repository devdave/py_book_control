import {Chapter, type Scene} from "../types";
import {useDebouncedEffect} from "../lib/useDebouncedEffect";

import {Button, Center, Paper, TextInput} from "@mantine/core";
import {useEffect, useRef} from "react";
import {SceneText} from "./scene_text";
import {useBookContext} from "../Book.context";
import {useForm} from "@mantine/form";


export const ContinuousBody = ({}) => {



    const {activeChapter, activeScene, addScene, updateChapter} = useBookContext();
    const paperRefs = useRef<Record<string, HTMLDivElement>>({});

    const form = useForm({
        initialValues: {
            title: activeChapter?.title
        },
        validate: {
            title: (value:string|undefined) => ((value != undefined && value.length) <= 2 ? "Chapter title's need to be at least 3 characters long" : undefined)
        }
    });

    useDebouncedEffect(()=>{
        async function updateChapterTitle() {
            if(activeChapter){
                const new_chapter:Chapter = {
                    ...activeChapter,
                    title: form.values.title || "Missing chapter"
                };

                updateChapter(new_chapter);
            } else {
                alert("Full stop! Data integrity issue.  activeChapter is not defined.");
            }

        }

        if(form.isDirty()){
            updateChapterTitle().then();
        }
    }, [form.values], {delay:500, runOnInitialize: false});


    useEffect(() => {
        if (activeScene && paperRefs.current[activeScene.id] !== undefined) {
            paperRefs.current[activeScene.id]?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
            })
        }
    }, [activeScene?.id]);

    // @ts-ignore
    return (
        <div>

            <TextInput
                style={{
                    position: "sticky",
                    top: "0",
                }}

                {...form.getInputProps('title')}/>

            {activeChapter?.scenes.map((scene:Scene)=>
                <Paper key={scene.id}
                       shadow="xl"
                        p='xs'
                       withBorder
                       style={{height: "80vh", marginBottom:"2em"}}
                ref={(ref: HTMLDivElement) => {
                    if (ref) {
                        paperRefs.current[scene.id] = ref;
                    }
                }}
                >
                   <SceneText scene={scene}/>
                </Paper>
            )}
            {activeChapter?.scenes.length == 0 &&
                <Center>
                    <Button onClick={()=>addScene(activeChapter.id)}>Create a scene</Button>
                </Center>
            }
        </div>
    );

}
import {Chapter, type Scene} from "../types";
import {useDebouncedEffect} from "../lib/useDebouncedEffect";

import {Button, Center, Paper, TextInput, Text, Title} from "@mantine/core";
import {useEffect, useRef, useState} from "react";
import {SceneText} from "./scene_text";
import {useBookContext} from "../Book.context";
import {useForm} from "@mantine/form";
import {useQuery} from "@tanstack/react-query";


export const ContinuousBody = ({}) => {


    const {api, bookId , activeChapter, activeScene, addScene, updateChapter} = useBookContext();
    const paperRefs = useRef<Record<string, HTMLDivElement>>({});

    if(activeChapter == undefined){
        throw Error("Data integrity issue, activechapter is not defined");
        return
    }

    // @ts-ignore
    const {data:chapter, isLoading: chapterIsLoading} = useQuery({
        queryFn: () => api.fetch_chapter(activeChapter.id),
        queryKey: ['book', bookId, 'chapter', activeChapter?.id]
    })


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
                // @ts-ignore
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
    }, [form.values], {delay:900, runOnInitialize: false});


    useEffect(() => {
        if (activeScene && paperRefs.current[activeScene.id] !== undefined) {
            paperRefs.current[activeScene.id]?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
            })
        }
    }, [activeScene?.id]);

    if(!activeChapter){
        return (
            <Title order={2}>Missing active chapter</Title>
        )
    }

    if(chapterIsLoading){
        return (
            <Text>Loading chapter now</Text>
        )
    }

    // @ts-ignore
    return (
        <div>
            <div
                    style={{
                        position: "sticky",
                        top: "0",
                    }}
            >
                <TextInput
                    {...form.getInputProps('title')}/>
            </div>


            {chapter.scenes.map((scene:Scene)=>
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
                    {scene &&
                        <SceneText key={`${scene.id} ${scene.updated_on} ${scene.order}`} scene={scene}/>
                    }

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
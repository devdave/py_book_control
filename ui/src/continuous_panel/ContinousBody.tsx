import {type Scene} from "../types";
import {useDebouncedEffect} from "../lib/useDebouncedEffect";

import {Button, Center, createStyles, Paper, Text, Textarea, useMantineTheme} from "@mantine/core";
import {useCallback, useEffect, useRef, useState} from "react";
import {forEach} from "lodash";
import {SceneText} from "./scene_text";
import {useBookContext} from "../Book.context";


const useStyles = createStyles((theme)=>({
    greedy_box: {
        height: "80vh"
    }
}));


export const ContinousBody = ({}) => {

    const {classes} = useStyles();

    const {activeChapter, activeScene, addScene, updateScene, api} = useBookContext();
    const paperRefs = useRef<Record<string, HTMLDivElement>>({});

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
        <>
            <h1>{activeChapter?.title}</h1>
            {activeChapter?.scenes.map((scene:Scene)=>
                <Paper key={scene.id}
                       style={{height: "80vh"}}
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
        </>
    );

}
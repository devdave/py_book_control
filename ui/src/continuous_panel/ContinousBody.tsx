import {type Scene} from "../types";
import {useDebouncedEffect} from "../lib/useDebouncedEffect";

import {Button, Center, Paper, Text, Textarea} from "@mantine/core";
import {useCallback, useEffect, useState} from "react";
import {forEach} from "lodash";
import {SceneText} from "./scene_text";
import {useBookContext} from "../Book.context";



export const ContinousBody = ({}) => {

    const {activeChapter, createScene, updateScene, api} = useBookContext();

    // @ts-ignore
    return (
        <>
            <h1>{activeChapter?.title}</h1>
            {activeChapter?.scenes.map((scene:Scene)=>
                <Paper key={scene.id} >
                   <SceneText scene={scene}/>
                </Paper>
            )}
            {activeChapter?.scenes.length == 0 &&
                <Center>
                    <Button onClick={()=>createScene()}>Create a scene</Button>
                </Center>
            }
        </>
    );

}
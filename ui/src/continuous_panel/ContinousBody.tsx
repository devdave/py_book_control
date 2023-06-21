import {useBookContext} from 'src/Book.context'
import {Scene} from "src/types";
import {useDebouncedEffect} from "src/lib/useDebouncedEffect";

import {Paper, Text, Textarea} from "@mantine/core";
import {useCallback, useEffect, useState} from "react";
import {forEach} from "lodash";
import {SceneText} from "./scene_text";



export const ContinousBody = ({}) => {

    const {activeChapter, createScene, updateScene, api} = useBookContext();

    // @ts-ignore
    return (
        <>
            <h1>{activeChapter.title}</h1>
            {activeChapter.scenes.map((scene:Scene)=>
                <Paper key={scene.id} >
                   <SceneText scene={scene}/>
                </Paper>
            )}
        </>
    );

}
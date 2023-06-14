import {Boundary} from "./lib/boundary.ts";
import React from "react";
import {Chapter, SceneRecord} from "./types.ts";
import {SceneDetail} from "./sceneDetail.tsx";
import {ChapterDetail} from "./chapterDetail.tsx";


interface RightPanelProps {
    boundary: Boundary;
    activeElement: Chapter | SceneRecord | null,
}

export const RightPanel: React.FC<RightPanelProps> = ({
                                                          boundary,
                                                          activeElement,
                                                          updateScene
                                                      }) => {


    console.log(activeElement);


    if (activeElement?.type == "scene") {
        return (
            <SceneDetail activeElement={activeElement as SceneRecord} boundary={boundary} updateScene={updateScene}/>
        )
    } else if (activeElement?.type === "chapter") {
        return (
            <ChapterDetail activeElement={activeElement as Chapter}/>
        )
    } else {
        return (
            <>
                <h1>Welcome to PyBook control</h1>
            </>
        )
    }


}
import {Boundary} from "./lib/boundary.ts";
import React from "react";
import {TargetedElement} from "./types.ts";
import {SceneDetail} from "./sceneDetail.tsx";
import {ChapterDetail} from "./chapterDetail.tsx";


interface RightPanelProps {
    boundary: Boundary;
    activeElement: TargetedElement | null,
}

export const RightPanel: React.FC<RightPanelProps> = ({boundary, activeElement,updateActiveElement}) => {


    console.log(activeElement);


    if(activeElement?.type=="scene"){
        return (
            <SceneDetail activeElement={activeElement} updateActiveElement={updateActiveElement} boundary={boundary}/>
        )
    } else if (activeElement?.type === "chapter") {
        return (
            <ChapterDetail activeElement={activeElement} />
        )
    } else {
        return (
            <>
                <h1>Welcome to PyBook control</h1>
            </>
        )
    }


}
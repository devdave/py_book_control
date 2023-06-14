import React from "react";
import {Chapter, SceneRecord} from "./types.ts";
import {SceneDetail} from "./sceneDetail.tsx";
import {ChapterDetail} from "./chapterDetail.tsx";
import {APIBridge} from "./bridge.ts";


interface RightPanelProps {
    bridge: APIBridge,
    activeElement: Chapter | SceneRecord | null,
    updateScene: any
}

export const RightPanel: React.FC<RightPanelProps> = ({
                                                          activeElement,
                                                          updateScene
                                                      }) => {


    console.log(activeElement);


    if (activeElement?.type === "scene") {
        return (
            <SceneDetail key={activeElement.id}
                         activeElement={activeElement as SceneRecord}
                         updateScene={updateScene}/>
        )
    } else if (activeElement?.type === "chapter") {
        return (
            <ChapterDetail key={activeElement.id} activeElement={activeElement as Chapter}/>
        )
    } else {
        return (
            <>
                <h1>Welcome to PyBook control</h1>
            </>
        )
    }


}
import {Boundary} from "./lib/boundary.ts";
import React from "react";
import {TargetedElement} from "./types.ts";
import {Scene} from "./scene.tsx";



interface RightPanelProps {
    boundary: Boundary;
    activeElement: TargetedElement | null,
}

export const RightPanel: React.FC<RightPanelProps> = ({boundary, activeElement,updateActiveElement}) => {


    console.log(activeElement);


    if(activeElement?.targetType=="scene"){
        return (
            <Scene activeElement={activeElement} updateActiveElement={updateActiveElement} boundary={boundary}/>
        )
    } else if (activeElement?.targetType === "chapter") {
        return (
            <>
                <h1>{activeElement.name}</h1>

            </>
        )
    } else {
        return (
            <>
                <h1>Welcome to PyBook control</h1>
            </>
        )
    }


}
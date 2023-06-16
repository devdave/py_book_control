import React from "react";
import {Paper, Textarea, TextInput} from "@mantine/core";


interface SceneElement {
    id: string
    type: string
    name: string
    content: string
    notes: string

}

interface SceneNodeProps {
    scene: SceneElement
}

const SceneNode: React.FC<SceneNodeProps> = ({scene}) => {

    return (
        <div id={`${scene.type}-${scene.id}`}>
            <Paper>
                <TextInput label="Scene name" defaultValue={scene.name}/>
                <Textarea label="Content" defaultValue={scene.content} variant="unstyled" size="xl" minRows={10} autosize={true}/>
            </Paper>
        </div>

    )
}

export default SceneNode;
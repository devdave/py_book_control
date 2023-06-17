import React from "react";
import {Paper, Tabs, Textarea, TextInput} from "@mantine/core";


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
                <TextInput label="Scene" defaultValue={scene.name}/>
                <Tabs defaultValue="content">
                    <Tabs.List>
                        <Tabs.Tab value="content">Content</Tabs.Tab>
                        <Tabs.Tab value="desc">Description</Tabs.Tab>
                        <Tabs.Tab value="notes">Notes</Tabs.Tab>
                        <Tabs.Tab value="locations">Locations</Tabs.Tab>
                        <Tabs.Tab value="chacters">Characters</Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="content">
                        <Textarea label="Content" defaultValue={scene.content} variant="unstyled" size="xl" minRows={10} autosize={true}/>
                    </Tabs.Panel>
                    <Tabs.Panel value="desc">
                        <Textarea variant="unstyled" size='xl' minRows={10} autosize={true}/>
                    </Tabs.Panel>
                    <Tabs.Panel value="notes">
                        <Textarea variant="unstyled" size='xl' minRows={10} autosize={true}/>
                    </Tabs.Panel>
                    <Tabs.Panel value="locations">
                        <Textarea variant="unstyled" size='xl' minRows={10} autosize={true}/>
                    </Tabs.Panel>
                    <Tabs.Panel value="characters">
                        <Textarea variant="unstyled" size='xl' minRows={10} autosize={true}/>
                    </Tabs.Panel>
                    
                </Tabs>

            </Paper>
        </div>

    )
}

export default SceneNode;
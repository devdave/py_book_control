import React from "react";
import {Button, Group, Paper, Tabs, Textarea, TextInput} from "@mantine/core";
import SceneNode from "./SceneNode.tsx";


interface BookElement {
    id:string
    type: string
    order: number
    name: string
    notes: string
    content: string
    scenes: BookElement[]
}

interface BookProps {
    chapter: BookElement
}

const ChapterNode:React.FC<BookProps> = ({chapter}) => {

    const sceneList = chapter.scenes.map(scene=>
        <>
            <SceneNode key={scene.id} scene={scene}/>
            <Group position="center">
                <Button compact size="xs">Insert scene</Button>
            </Group>
        </>
    );

    return (
        <div id={`${chapter.type}-${chapter.id}`}>
            <TextInput label="Chapter" defaultValue={chapter.name}/>
            <Tabs defaultValue="scenes">
                <Tabs.List>
                    <Tabs.Tab value="scenes">Scenes</Tabs.Tab>
                    <Tabs.Tab value="notes">Notes</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="scenes" pt='xs'>
                    <Paper shadow={"sm"}>
                        <Group position="center">
                        <Button compact={true} size="sx">Append new scene</Button>
                        </Group>

                        {chapter.scenes.length > 0 && sceneList}<br/>
                        <Group position="center">
                        <Button compact={true} size="sx">Attach new scene</Button>
                        </Group>

                    </Paper>

                </Tabs.Panel >
                <Tabs.Panel value="notes" pt='xs'>
                    <Textarea defaultValue={chapter.notes} minRows={10} autosize={true}/>
                </Tabs.Panel>
            </Tabs>

        </div>
    )

}

export default ChapterNode;
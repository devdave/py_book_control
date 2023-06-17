import React from "react";
import {Button, Group, Paper, Tabs, Textarea, TextInput} from "@mantine/core";
import SceneNode from "./SceneNode.tsx";
import "./book.css";

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
        <article id={`${chapter.type}-${chapter.id}`}>
            <div className="banner">
                <TextInput label="Chapter" defaultValue={chapter.name}/>
                <Button>Prepend chapter</Button>
                <Button>Append chapter</Button>
            </div>
            <div className="scenesBody">
            <Tabs defaultValue="scenes">
                <Tabs.List>
                    <Tabs.Tab value="scenes">Scenes</Tabs.Tab>
                    <Tabs.Tab value="notes">Notes</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="scenes" pt='xs'>
                    <Paper shadow={"sm"}>
                        <Group position="center">
                        <Button compact={true} size="sx">Append scene</Button>
                        </Group>

                        {chapter.scenes.length > 0 && sceneList}<br/>
                        {/*<Group position="center">*/}
                        {/*<Button compact={true} size="sx">Attach scene</Button>*/}
                        {/*</Group>*/}

                    </Paper>

                </Tabs.Panel >
                <Tabs.Panel value="notes" pt='xs'>
                    <Textarea defaultValue={chapter.notes} minRows={10} autosize={true}/>
                </Tabs.Panel>
            </Tabs>
            </div>
            <div className="chapterFoot">
                <span> Visible end of Chapter marker</span>
            </div>
        </article>
    )

}

export default ChapterNode;
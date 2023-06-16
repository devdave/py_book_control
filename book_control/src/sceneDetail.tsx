import {Paper, Textarea, TextInput, Tabs} from "@mantine/core";
import React, {FormEventHandler} from "react";
import {SceneRecord} from "./types.ts";


import {useTimeout} from '@mantine/hooks'
import {useForm} from "@mantine/form";


//How long to let a dirty record sit before pushing changes
const MAX_DIRT_LENGTH = 1200;


interface SceneProps {
    activeElement: SceneRecord,
    updateScene: any
}

export const SceneDetail: React.FC<SceneProps> = ({activeElement, updateScene}) => {


    const {start, clear} = useTimeout(whenDirtTimesOut, MAX_DIRT_LENGTH);
    const myForm = useForm(
        {
            initialValues: {...activeElement}
        }
    )

    const onFormChange = () => {
        clear();
        start();
    }

    async function whenDirtTimesOut() {
        clear();

        if (myForm.isDirty()) {
            console.log("updating ", myForm.values);
            updateScene.mutate([activeElement.id, myForm.values]);
            myForm.resetDirty();

        }
    }

    const fuckOff:FormEventHandler<HTMLFormElement> = (evt) => {
        evt.preventDefault();
        start();

    }

    const blurred = (evt) => {
        whenDirtTimesOut();
    }

    return (
        <form onSubmit={fuckOff} onChange={onFormChange}>
            <TextInput label="Scene name" placeholder={"Scene name"} {...myForm.getInputProps("name")}/>
            <Tabs defaultValue="content">
                <Tabs.List>
                    <Tabs.Tab value="content">Content</Tabs.Tab>
                    <Tabs.Tab value="desc">Description</Tabs.Tab>
                    <Tabs.Tab value="notes">Notes</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="content">
                    <Paper miw="60vw" shadow="md" p="md" withBorder>
                        <Textarea autosize minLength={80} minRows={14} onBlur={blurred} {...myForm.getInputProps("content")}/>
                    </Paper>
                </Tabs.Panel>
                <Tabs.Panel value="desc">
                    <Textarea autosize minRows={14} onBlur={blurred} {...myForm.getInputProps("desc")} />
                </Tabs.Panel>
                <Tabs.Panel value="notes">
                    <Textarea autosize minRows={14} onBlur={blurred} {...myForm.getInputProps("notes")} />
                </Tabs.Panel>
            </Tabs>

        </form>

    );
}
import {Accordion, Grid, Textarea, TextInput} from "@mantine/core";
import React from "react";
import {Chapter, SceneRecord} from "./types.ts";
import {Boundary} from "./lib/boundary.ts";

import {useForm} from "@mantine/form";


interface SceneProps {
    activeElement: SceneRecord | Chapter,
    boundary: Boundary
}
export const SceneDetail:React.FC<SceneProps> = ({activeElement, boundary}) => {
    
    //How long to let a dirty record sit before pushing changes
    const MAX_DIRT_LENGTH = 5000;
    //How long to wait after a user makes a change
    const DIRT_WAIT_LENGTH = 2000;


    let maxDirtTimer: (number| undefined) = undefined;
    let dirtWaitTimer: (number| undefined) = undefined;

    const form = useForm({
        initialValues: {
            name: activeElement.name,
            desc: activeElement.desc,
            content: activeElement.content,
            notes: activeElement.notes
        },
        validate: {
            name: (value) => (value.length > 0 ? null : "Name cannot be empty"),
        }

    })

    function onFormChange() {

        clearTimeout(dirtWaitTimer);
        dirtWaitTimer = setTimeout(whenDirtTimesOut, DIRT_WAIT_LENGTH);

        if(maxDirtTimer === null){
            maxDirtTimer = setTimeout(whenDirtTimesOut, MAX_DIRT_LENGTH)
        }
    }

    async function whenDirtTimesOut(){
        clearTimeout(dirtWaitTimer);
        clearTimeout(maxDirtTimer);
        dirtWaitTimer = undefined;
        maxDirtTimer = undefined;

        if(form.isDirty()){
            const response = await boundary.remote("update_scene", activeElement.id, form.values);
            console.log("Scene updated", response);
            form.resetDirty();
        }
    }

    return (
        <form onChange={onFormChange} onSubmit={form.onSubmit((values)=>console.log(values))}>
            <Grid>
                <Grid.Col span={"auto"}>
                    <TextInput placeholder={"Scene name"} {...form.getInputProps("name")}/>
                    <Textarea minRows={5} {...form.getInputProps("content")}/>
                </Grid.Col>
                <Grid.Col span={"content"}>
                    <Accordion multiple={true} defaultValue={["synopsis","notes"]}>
                        <Accordion.Item value="synopsis">
                            <Accordion.Control>Description</Accordion.Control>
                            <Accordion.Panel>
                                <Textarea {...form.getInputProps("desc")} />
                            </Accordion.Panel>
                        </Accordion.Item>
                        <Accordion.Item value="notes">
                            <Accordion.Control>Notes</Accordion.Control>
                            <Accordion.Panel>
                                <Textarea {...form.getInputProps("notes")} />
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>

                </Grid.Col>
            </Grid>
        </form>

    );
}
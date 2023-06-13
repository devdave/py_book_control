import {Accordion, Grid, Textarea, TextInput} from "@mantine/core";
import React, {useEffect} from "react";
import {SceneRecord} from "./types.ts";
import {Boundary} from "./lib/boundary.ts";
import {useImmer} from "use-immer";
import {useForm} from "@mantine/form";


interface SceneProps {
    activeElement: SceneRecord,
    boundary: Boundary
}
export const SceneDetail:React.FC<SceneProps> = ({activeElement, updateActiveElement, boundary}) => {

    const [sceneData, updateSceneData] = useImmer<SceneRecord>({});

    //How long to let a dirty record sit before pushing changes
    let maxDirtLength = 5000;
    //How long to wait after a user makes a change
    let dirtWaitLength = 2000;

    let maxDirtTimer = null;
    let dirtWaitTimer = null;

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

    function onFormChange(evt) {

        clearTimeout(dirtWaitTimer);
        dirtWaitTimer = setTimeout(whenDirtTimesOut, dirtWaitLength);

        if(maxDirtTimer === null){
            maxDirtTimer = setTimeout(whenDirtTimesOut, maxDirtLength)
        }
    }

    async function whenDirtTimesOut(){
        clearTimeout(dirtWaitTimer);
        clearTimeout(maxDirtTimer);
        dirtWaitTimer = null;
        maxDirtTimer = null;

        if(form.isDirty() === true){
            const response = await boundary.remote("update_scene", activeElement.id, form.values);
            console.log("Scene updated", response);
            form.resetDirty();
        }
    }

    async function getSceneData(){
        const scene = await boundary.remote("fetch_scene", activeElement.id);
        updateActiveElement(scene);
        // updateSceneData(scene);
    }

    async function updateSceneProperty(property_name, scene) {
        return await boundary.remote("update_scene_property", activeElement.id, property_name, scene);
    }

    function make_handler(property_name:string){
        return async function handler(evt){
            const value = evt.target.value;
            const response = await updateSceneProperty(property_name, value);
            if(response === true) {
                updateActiveElement(draft=>{
                        draft[property_name] = value;
                });
            }
        }
    }

    async function update_name(evt){
        const value = evt.target.value;
        const response = await updateSceneProperty("name", value);
        if(response == true){
            updateSceneData(draft=>{
                draft['name'] = value;
            });
            updateActiveElement(draft=>{
                draft.name = value;
            });
        }
    }

    async function trackChange(evt) {
        console.log(form.values);
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
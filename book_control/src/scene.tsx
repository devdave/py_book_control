import {Accordion, Grid, Textarea, TextInput} from "@mantine/core";
import React, {useEffect} from "react";
import {SceneRecord, TargetedElement} from "./types.ts";
import {Boundary} from "./lib/boundary.ts";
import {useImmer} from "use-immer";


interface SceneProps {
    activeElement: TargetedElement,
    boundary: Boundary
}
export const Scene:React.FC<SceneProps> = ({activeElement, updateActiveElement, boundary}) => {

    const [sceneData, updateSceneData] = useImmer<SceneRecord>({});

    async function getSceneData(){
        const scene = await boundary.remote("fetch_scene", activeElement.id);
        updateSceneData(scene);
    }

    async function updateSceneProperty(property_name, scene) {
        return await boundary.remote("update_scene", activeElement.id, property_name, scene);
    }

    useEffect(()=>{
        if(activeElement){
            getSceneData();
        }
    }, [activeElement.id]);

    function make_handler(property_name:string){
        return async function handler(evt){
            const value = evt.target.value;
            const response = await updateSceneProperty(property_name, value);
            if(response === true) {
                updateSceneData(draft=>{
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



    return (
        <>
            <Grid>
                <Grid.Col span={"auto"}>
                    <TextInput placeholder={"Scene name"} value={sceneData?.name} onChange={update_name}/>
                    <Textarea minRows={5} value={sceneData?.content} onChange={make_handler("content")}></Textarea>
                </Grid.Col>
                <Grid.Col span={"content"}>
                    <Accordion multiple={true} defaultValue={["synopsis","notes"]}>
                        <Accordion.Item value="synopsis">
                            <Accordion.Control>Synopsis</Accordion.Control>
                            <Accordion.Panel>
                                <Textarea value={sceneData?.desc} onChange={make_handler("desc")} ></Textarea>
                            </Accordion.Panel>
                        </Accordion.Item>
                        <Accordion.Item value="notes">
                            <Accordion.Control>Notes</Accordion.Control>
                            <Accordion.Panel>
                                <Textarea value={sceneData?.notes} onChange={make_handler("notes")} ></Textarea>
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>

                </Grid.Col>
            </Grid>
        </>

    );
}
import {Book, Character} from "@src/types.ts";
import {useAppContext} from "@src/App.context.ts";
import {Button, Fieldset, LoadingOverlay, ScrollArea, Stack, Table} from "@mantine/core";
import {IconX} from "@tabler/icons-react";

import classes from "./characters.module.css"
import {useEffect, useState} from "react";
import {CharacterDetail} from "@src/routes/editor/CharacterDetail.tsx";
import {ConfirmModal} from "@src/widget/ConfirmModal.tsx";
import {useLocation, useNavigate} from "react-router-dom";

import {Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export const Characters = ({book}:{book:Book}) => {

    const {hash} = useLocation()

    const [requestedToon,] = useState(hash.length > 1 ? hash.slice(1) : null)

    const [selectedToon, setSelectedToon] = useState<string | null>(requestedToon)

    const {characterBroker} = useAppContext()

    const {data, isLoading, isError} = characterBroker.list(book)

    const {data:toon, isLoading:toonIsLoading, isError:toonIsError} = characterBroker.get(book.id, selectedToon as string, selectedToon !== null)

    useEffect(() => {
        if(hash.length > 1){
            setSelectedToon(hash.slice(1))
        }
    }, [hash]);

    const handleDelete=(toon:Character)=>{
        ConfirmModal("Delete Character?", `Delete ${toon.name} forever?`)
            .then((result)=>{
                if(result) {
                    characterBroker.delete(book, toon.id)
                }})
    }

    const navigate = useNavigate()


    const focusToon = (toon_id:Character['id'],toon_name:Character['name']) => {
        setSelectedToon(toon_id)
        navigate(`/book/${book.id}/characters#${toon_id}`, {replace: true, state:{title:`Character ${toon_name}`}})
    }

    if(isLoading) {
        return (
            <LoadingOverlay visible />
        )
    }

    if(isError) {
        return (
            <>
                <h1>Loading error</h1>
                <p>TODO be more verbose</p>
            </>
        )
    }

    return (

        <Stack>
            <h3>Characters!</h3>
            <PanelGroup autoSaveId="characters" direction={"vertical"} style={{minHeight:"80vh"}}>
                <Panel minSize={15}>
                    <ScrollArea h={350} type={"auto"}>
                        <Table highlightOnHover stickyHeader striped stickyHeaderOffset={0}>
                            <Table.Thead style={{zIndex: 100}}>
                                <Table.Tr>
                                    <Table.Th>Name</Table.Th>
                                    <Table.Th>Scene count</Table.Th>
                                    <Table.Th>Action</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {data?.map((toon) => (
                                    <>
                                        <Table.Tr id={toon.id} key={toon.id}>
                                            <Table.Td className={classes.namefield}
                                                onClick={() => focusToon(toon.id, toon.name)}
                                            >{toon.name}</Table.Td>
                                            <Table.Td>{toon.scene_count}</Table.Td>
                                            <Table.Td>
                                                <Button onClick={() => handleDelete(toon)}
                                                    leftSection={<IconX/>}>Delete?</Button>
                                            </Table.Td>
                                        </Table.Tr>
                                    </>

                                ))}

                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                </Panel>
                <PanelResizeHandle style={{minHeight:10}}/>
                <Panel>

                    <Fieldset legend={toon ? `${toon.name} details` : "Select a character"} radius={"md"}>
                        {!toon &&
                    <p>Select a character</p>
                        }
                        {toonIsLoading &&
                    <LoadingOverlay visible/>
                        }
                        {toonIsError &&
                    <h2>Failed to load character</h2>
                        }
                        {toon &&
                    <CharacterDetail key={`${toon.id}_${toon.updated_on}`} book={book} character={toon}/>
                        }

                    </Fieldset>
                </Panel>
            </PanelGroup>
        </Stack>

    )
}

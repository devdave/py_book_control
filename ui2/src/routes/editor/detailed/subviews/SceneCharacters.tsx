import {ActionIcon, Combobox, InputBase, Table, useCombobox} from "@mantine/core";
import {useState} from "react";

import {Book, Scene} from "@src/types.ts";
import {useAppContext} from "@src/App.context.ts";
import {map} from "lodash";
import {IconEdit, IconPlugConnected} from "@tabler/icons-react";


export const SceneCharacters = ({book, scene}:{book:Book, scene:Scene}) => {

    const {characterBroker} = useAppContext()

    const { data: allCharacters } = characterBroker.list(book)

    //Crazy shit begins

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption()
    })

    const [value, setValue] = useState<string | null>(null)
    const [search, setSearch] = useState('')


    const filteredOptions = allCharacters?.filter(toon=>{
        const lowerName = toon.name.toLowerCase()
        const lowerCaseSearch = search.toLowerCase()

        return search.trim() === '' || lowerName.includes(lowerCaseSearch)
    })

    const options = filteredOptions?.map((item)=>(
        <Combobox.Option value={item.id} key={item.id}>{item.name}</Combobox.Option>
    ))

    const createOnEnter = (evt: { code: string; }) => {
        if(evt.code.toLowerCase() === 'enter') {
            const shouldMakeNew = options ? options.length <= 0 : false
            console.log(search, value, shouldMakeNew)

            if(shouldMakeNew) {
                characterBroker.createAndAdd2Scene(book, scene, search)
            }else if(options?.length === 1){
                const toon_id = filteredOptions?.at(0)?.id
                const toon_name = filteredOptions?.at(0)?.name
                if(toon_id && toon_name) {
                    characterBroker.assign2Scene(book, scene, toon_id)
                }
            }
        }
    }


    return (
        <>
            <Combobox
                store={combobox}
                withinPortal={false}

                onOptionSubmit={(val)=>{
                    if(val === '$create') {
                        characterBroker.createAndAdd2Scene(book, scene, search)
                        setValue(search)
                        setSearch("")
                    } else {
                        console.log("Selected ", search, val)
                        setValue(val)
                        setSearch(search)
                        characterBroker.assign2Scene(book, scene, val)
                    }
                    combobox.closeDropdown()
                }}
            >
                <Combobox.Target>
                    <InputBase
                        rightSection={<Combobox.Chevron />}
                        value={search}
                        onKeyUp={createOnEnter}
                        onChange={(event) => {
                            combobox.openDropdown();
                            combobox.updateSelectedOptionIndex();
                            setSearch(event.currentTarget.value);
                        }}
                        onClick={() => combobox.openDropdown()}
                        onFocus={() => combobox.openDropdown()}
                        onBlur={() => {
                            combobox.closeDropdown();
                            // setSearch(value || '');
                        }}
                        placeholder="Search characters"
                        rightSectionPointerEvents="none"
                    />
                </Combobox.Target>

                <Combobox.Dropdown>
                    <Combobox.Options>
                        {options}
                        {((options ? options.length <= 0 : true) || search.trim().length === 0) && (
                            <Combobox.Option value="$create">+Select or press enter to create {search}</Combobox.Option>
                        )}
                    </Combobox.Options>
                </Combobox.Dropdown>


            </Combobox>

            <Table maw={"30vw"}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Edit</Table.Th>
                        <Table.Th>Disconnect</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {map(scene.characters, (toon)=>(
                        <Table.Tr key={`${toon.id}_${toon.updated_on}`}>
                            <Table.Td>{toon.name}</Table.Td>
                            <Table.Td>
                                <ActionIcon onClick={()=>console.log("todo edit toon")}>
                                    <IconEdit/>
                                </ActionIcon>
                            </Table.Td>
                            <Table.Td>
                                <ActionIcon onClick={()=>characterBroker.removeFromScene(book.id, toon.id, scene.id).then()}>
                                    <IconPlugConnected/>
                                </ActionIcon>
                            </Table.Td>

                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

        </>
    )

}

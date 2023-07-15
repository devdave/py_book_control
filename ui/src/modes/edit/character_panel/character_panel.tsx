import {
    Box,
    Center,
    createStyles,
    Group,
    LoadingOverlay,
    ScrollArea,
    Stack,
    Table,
    Tabs,
    Text,
    Textarea,
    Title
} from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@src/App.context'
import { Character } from '@src/types'
import { Tab } from '@mantine/core/lib/Tabs/Tab/Tab'
import { MouseEventHandler, useState } from 'react'

const useStyle = createStyles((theme) => ({
    active_style: {
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.colors.blue[6]
        }
    },
    filled_textarea: {
        height: '100%',
        width: '100%',
        boxSizing: 'border-box'
    }
}))

export const CharacterPanel = () => {
    const { api, activeBook } = useAppContext()

    const { classes } = useStyle()

    const [selectedToon, setSelectedToon] = useState(undefined)

    const disableListChars =
        activeBook && activeBook.id !== null && activeBook.id !== undefined

    const {
        data: characters,
        isLoading: charactersIsLoading,
        status: charactersStatus
    } = useQuery<Character[], Error, Character[], string[]>({
        enabled: disableListChars,
        queryKey: ['book', activeBook.id, 'characters'],
        queryFn: api.list_all_characters(activeBook.id)
    })

    if (charactersIsLoading || !characters) {
        return (
            <Box
                sx={(theme) => ({
                    minWidth: '100%',
                    minHeight: '80vh'
                })}
                pos='relative'
            >
                <Text>Loading...</Text>
                <LoadingOverlay visible />
            </Box>
        )
    }

    const handleClick: MouseEventHandler<HTMLTableRowElement> = (evt) => {
        console.log(evt.currentTarget.dataset.id)
    }

    const rows = characters.map((character: Character) => (
        <tr
            className={classes.active_style}
            key={`${character.id}-${character.updated_on}`}
            data-id={character.id}
            onClick={handleClick}
        >
            <td>{character.name}</td>
            <td>{character.scene_count}</td>
            <td>{character.created_on}</td>
            <td>{character.updated_on}</td>
        </tr>
    ))

    return (
        <Stack className={classes.filled_textarea}>
            <Center>
                <Title>Characters</Title>
            </Center>
            <Group className={classes.filled_textarea}>
                <ScrollArea
                    style={{ minWidth: '100%' }}
                    h={300}
                    type='auto'
                >
                    <Table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th># of scenes</th>
                                <th>Created on</th>
                                <th>Updated on</th>
                            </tr>
                        </thead>
                        <tbody>{rows}</tbody>
                    </Table>
                </ScrollArea>
                <Tabs
                    defaultValue='notes'
                    className={classes.filled_textarea}
                >
                    <Tabs.List>
                        <Tabs.Tab value='notes'>Notes</Tabs.Tab>
                        <Tabs.Tab value='Scenes'>Scenes present</Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value='notes'>
                        <Textarea
                            classNames={{
                                input: classes.filled_textarea,
                                root: classes.filled_textarea,
                                wrapper: classes.filled_textarea
                            }}
                            label='notes'
                            minRows={5}
                        />
                    </Tabs.Panel>
                </Tabs>
            </Group>
        </Stack>
    )
}

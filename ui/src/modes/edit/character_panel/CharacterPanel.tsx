import {
    Box,
    Center,
    createStyles,
    Group,
    LoadingOverlay,
    ScrollArea,
    Skeleton,
    Stack,
    Table,
    Tabs,
    Text,
    Textarea,
    Title
} from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@src/App.context'
import { Character, Scene } from '@src/types'
import { Tab } from '@mantine/core/lib/Tabs/Tab/Tab'
import { MouseEventHandler, useState } from 'react'
import { CharacterDetail } from '@src/modes/edit/character_panel/CharacterDetail'

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
    },
    sticky_header: {
        position: 'sticky',
        top: 0,
        backgroundColor: 'gray',
        color: 'white'
    }
}))

export const CharacterPanel = () => {
    const { api, activeBook } = useAppContext()

    const { classes } = useStyle()

    const [selectedToonId, setSelectedToonId] = useState<string | undefined>(undefined)

    const disableListChars =
        activeBook && activeBook.id !== null && activeBook.id !== undefined

    const {
        data: characters,
        isLoading: charactersIsLoading,
        status: charactersStatus,
        failureReason: characterLoadFailureReason
    } = useQuery<Character[], Error, Character[]>(
        ['book', activeBook.id, 'characters'],
        () => api.list_all_characters(activeBook.id),
        {
            enabled: disableListChars
        }
    )

    const {
        data: currentToon,
        isFetched: currentToonFetched,
        isLoading: currentToonIsLoading
    } = useQuery<string, Error, Character>({
        queryKey: ['book', activeBook.id, 'character', selectedToonId],
        queryFn: () => api.fetch_character(activeBook.id, selectedToonId),
        enabled: selectedToonId !== undefined
    })

    const currentToonAbleToRender =
        selectedToonId !== undefined && selectedToonId.length > 0

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

    if (charactersStatus === 'error') {
        return (
            <Box>
                <Text>There was a problem loading the book's character data</Text>
                {characterLoadFailureReason && (
                    <Text>{characterLoadFailureReason.message}</Text>
                )}
            </Box>
        )
    }

    const handleClick: MouseEventHandler<HTMLTableRowElement> = (evt) => {
        console.log(evt.currentTarget.dataset.id)
        setSelectedToonId(evt.currentTarget.dataset.id)
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
        <Stack
            pos='relative'
            mah='100%'
            maw='100%'
            className={classes.filled_textarea}
        >
            <Center>
                <Title>Characters</Title>
            </Center>
            <Group
                className={classes.filled_textarea}
                maw='100%'
                mah='100%'
            >
                <ScrollArea
                    style={{ minWidth: '100%' }}
                    h={300}
                    type='auto'
                >
                    <Table pos='relative'>
                        <thead>
                            <tr style={{ backgroundColor: 'gray', color: 'white' }}>
                                <th className={classes.sticky_header}>Name</th>
                                <th className={classes.sticky_header}># of scenes</th>
                                <th className={classes.sticky_header}>Created on</th>
                                <th className={classes.sticky_header}>Updated on</th>
                            </tr>
                        </thead>
                        <tbody>{rows}</tbody>
                    </Table>
                </ScrollArea>
                <Box
                    pos='relative'
                    mah='100%'
                    maw='100%'
                    mih='100%'
                    miw='100%'
                >
                    {selectedToonId === undefined && (
                        <Center>Click on a character to review</Center>
                    )}
                    {selectedToonId !== undefined && currentToonIsLoading === true && (
                        <Box
                            maw='100%'
                            mah='100%'
                        >
                            <Text>Loading....</Text>
                            <Skeleton />
                            <Skeleton />
                            <Skeleton />
                            <Skeleton />
                            <LoadingOverlay visible />
                        </Box>
                    )}
                    {currentToonFetched && currentToon !== undefined && (
                        <CharacterDetail
                            key={selectedToonId}
                            character={currentToon}
                        />
                    )}
                    {currentToonFetched && currentToon === undefined && (
                        <>
                            <Text>
                                There was a problem loading this character, please try
                                again.
                            </Text>
                        </>
                    )}
                </Box>
            </Group>
        </Stack>
    )
}

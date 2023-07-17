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
    Text,
    Title
} from '@mantine/core'
import { useAppContext } from '@src/App.context'
import { Character } from '@src/types'
import { MouseEventHandler } from 'react'
import { CharacterDetail } from '@src/modes/edit/character_panel/CharacterDetail'
import { useEditorContext } from '@src/modes/edit/Editor.context'

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
    const { activeBook } = useAppContext()

    const { activeElement, fetchCharacter, listAllCharacters } = useEditorContext()

    const { classes } = useStyle()

    const {
        data: characters,
        isLoading: charactersIsLoading,
        status: charactersStatus,
        failureReason: charactersLoadFailureReason
    } = listAllCharacters(activeBook)

    const enabledCurrentToonQuery =
        activeElement.subType === 'character' && activeElement.subDetail !== undefined

    const {
        data: currentToon,
        isFetched: currentToonFetched,
        isLoading: currentToonIsLoading
    } = fetchCharacter(activeBook.id, activeElement.subDetail as string, enabledCurrentToonQuery)

    if (charactersIsLoading || !characters) {
        return (
            <Box
                sx={() => ({
                    minWidth: '100%',
                    minHeight: '80vh'
                })}
                pos='relative'
            >
                <Text>Loadin characters...</Text>
                <LoadingOverlay visible />
            </Box>
        )
    }

    if (charactersStatus === 'error') {
        return (
            <Box>
                <Text>There was a problem loading the book's character data</Text>
                {charactersLoadFailureReason && <Text>{charactersLoadFailureReason.message}</Text>}
            </Box>
        )
    }

    const handleClick: MouseEventHandler<HTMLTableRowElement> = (evt) => {
        console.log(evt.currentTarget.dataset.id)
        activeElement.setCharacterById(evt.currentTarget.dataset.id as string)
        // setSelectedToonId(evt.currentTarget.dataset.id)
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
                    {!enabledCurrentToonQuery && <Center>Click on a character to review</Center>}
                    {enabledCurrentToonQuery && currentToonIsLoading && (
                        <Box
                            maw='100%'
                            mah='100%'
                            mih='100%'
                        >
                            <Text>Loading character....</Text>
                            <Skeleton />
                            <Skeleton />
                            <Skeleton />
                            <Skeleton />
                            <LoadingOverlay visible />
                        </Box>
                    )}
                    {activeElement.subDetail !== undefined &&
                        currentToonFetched &&
                        currentToon !== undefined && (
                            <CharacterDetail
                                key={`${activeElement.subType} ${currentToon?.updated_on}`}
                                character={currentToon}
                            />
                        )}
                    {activeElement.subDetail !== undefined &&
                        currentToonFetched &&
                        currentToon === undefined && (
                            <>
                                <Text>There was a problem loading this character, please try again.</Text>
                            </>
                        )}
                </Box>
            </Group>
        </Stack>
    )
}

import React, { useCallback } from 'react'
import { useAppContext } from '@src/App.context'
import { Character } from '@src/types'
import { createStyles, Text, Button, Table, ActionIcon } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IndicatedTextInput } from '@src/widget/IndicatedTextInput'
import { IndicatedTextarea } from '@src/widget/IndicatedTextarea'
import { useDebouncedEffect } from '@src/lib/useDebouncedEffect'
import { useEditorContext } from '@src/modes/edit/Editor.context'
import { ResizeablePanels } from '@src/widget/ResizeablePanels'
import { IconEye, IconX } from '@tabler/icons-react'
import { ShowError } from '@src/widget/ShowErrorNotification'
import { modals } from '@mantine/modals'

const useStyle = createStyles(() => ({
    filled_textarea: {
        height: '100%',
        width: '100%',
        boxSizing: 'border-box'
    }
}))

interface FormProps {
    name: string
    notes: string
}

interface CharacterDetailProps {
    character: Character
}

export const CharacterDetail: React.FC<CharacterDetailProps> = ({ character }) => {
    const { settings } = useAppContext()

    const [debounceTime] = settings.makeState('debounceTime')

    const { activeElement, characterBroker } = useEditorContext()

    const { classes } = useStyle()

    const form = useForm<FormProps>({
        initialValues: {
            name: character.name,
            notes: character.notes
        }
    })

    useDebouncedEffect(
        () => {
            if (form.isDirty()) {
                const changeset = {
                    id: character.id,
                    name: form.values.name,
                    notes: form.values.notes
                }
                characterBroker.update(changeset as Character)
                form.resetDirty()
            }
        },
        [form.values],
        { delay: debounceTime as number }
    )

    const onDeleteClick = useCallback(() => {
        modals.openConfirmModal({
            title: 'Permanently delete character?',
            children: <Text size='sm'>Permanently delete the character {character.name} from the book?</Text>,
            labels: { confirm: 'Erase character', cancel: 'CANCEL!' },
            onConfirm: () => {
                characterBroker.delete(character.id)
                activeElement.clearSubType()
            }
        })
    }, [activeElement, character.id, character.name, characterBroker])

    return (
        <ResizeablePanels>
            <>
                <IndicatedTextInput
                    form={form}
                    fieldName='name'
                    label='Name'
                    containerprops={{ miw: '100%' }}
                    indicatorprops={{ miw: '100%' }}
                    inputprops={{ maw: '35%' }}
                />
                <Text>Notes</Text>
                <IndicatedTextarea
                    form={form}
                    formField='notes'
                    inputProps={{
                        classNames: {
                            input: classes.filled_textarea,
                            root: classes.filled_textarea,
                            wrapper: classes.filled_textarea
                        },
                        style: {
                            width: '100%',
                            minWidth: '100%'
                        },
                        minRows: 5
                    }}
                />
                <Button onClick={onDeleteClick}>Delete?</Button>
            </>
            <>
                <Table>
                    <thead>
                        <tr>
                            <th colSpan={2}>Chapter name</th>
                            <th>Scene name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {character.locations &&
                            character.locations.map(([chapterName, chapterId, sceneName, sceneId]) => (
                                <tr key={`${chapterId}-${sceneId}`}>
                                    <td>
                                        <ActionIcon
                                            size='sm'
                                            onClick={() => activeElement.setSceneById(chapterId, sceneId)}
                                        >
                                            <IconEye />
                                        </ActionIcon>
                                    </td>
                                    <td>{chapterName}</td>
                                    <td>{sceneName}</td>
                                    <td>
                                        <ActionIcon
                                            size='sm'
                                            onClick={() => ShowError('Warning', 'TODO implement delete')}
                                        >
                                            <IconX />
                                        </ActionIcon>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </Table>
            </>
        </ResizeablePanels>
    )
}

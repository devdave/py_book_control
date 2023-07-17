import React, { useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@src/App.context'
import { Character } from '@src/types'
import {
    Box,
    createStyles,
    LoadingOverlay,
    Skeleton,
    Tabs,
    Textarea,
    TextInput,
    Text,
    Button
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IndicatedTextInput } from '@src/widget/IndicatedTextInput'
import { IndicatedTextarea } from '@src/widget/IndicatedTextarea'
import { useDebouncedEffect } from '@src/lib/useDebouncedEffect'
import { useEditorContext } from '@src/modes/edit/Editor.context'

const useStyle = createStyles((theme) => ({
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
    const { api, activeBook, debounceTime } = useAppContext()

    const { activeElement, updateCharacter, deleteCharacter } = useEditorContext()

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
                updateCharacter(changeset as Character)
                form.resetDirty()
            }
        },
        [form.values],
        { delay: debounceTime }
    )

    const onDeleteClick = useCallback(() => {
        activeElement.clearSubType()
        deleteCharacter(character.id)
    }, ['deleteCharacter'])

    return (
        <Tabs
            defaultValue='notes'
            className={classes.filled_textarea}
            style={{
                minWidth: '100%'
            }}
        >
            <Tabs.List>
                <Tabs.Tab value='notes'>Notes</Tabs.Tab>
                <Tabs.Tab value='Scenes'>Scenes present</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel
                value='notes'
                style={{ width: '100%', minWidth: '100%' }}
            >
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
            </Tabs.Panel>
        </Tabs>
    )
}

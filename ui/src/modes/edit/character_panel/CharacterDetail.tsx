import React, { KeyboardEventHandler, useCallback } from 'react'
import { useAppContext } from '@src/App.context'
import { Character } from '@src/types'
import { createStyles, Tabs, Text, Button, Table } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IndicatedTextInput } from '@src/widget/IndicatedTextInput'
import { IndicatedTextarea } from '@src/widget/IndicatedTextarea'
import { useDebouncedEffect } from '@src/lib/useDebouncedEffect'
import { useEditorContext } from '@src/modes/edit/Editor.context'
import { useHotkeys } from '@mantine/hooks'
import { useRotate } from '@src/lib/use-rotate'

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

    const [activeTab, nextTab] = useRotate(['notes', 'scenes'])

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
        activeElement.clearSubType()
        characterBroker.delete(character.id)
    }, [activeElement, character.id, characterBroker])

    console.log(character)

    const handleKeyUp: KeyboardEventHandler<HTMLTextAreaElement> = (evt) => {
        if (evt.ctrlKey) {
            if (evt.key === 'Tab') {
                evt.preventDefault()
                nextTab()
            } else if (evt.key === 'ArrowRight') {
                evt.preventDefault()
                nextTab()
            }
        }
    }

    useHotkeys([
        ['ctrl+Tab', () => nextTab()],
        ['ctrl+ArrowRight', () => nextTab()]
    ])

    return (
        <Tabs
            value={activeTab}
            className={classes.filled_textarea}
            style={{
                minWidth: '100%'
            }}
            loop
            onTabChange={(name) => name && nextTab(name)}
        >
            <Tabs.List>
                <Tabs.Tab value='notes'>Notes</Tabs.Tab>
                <Tabs.Tab value='scenes'>Scenes present</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel
                value='notes'
                style={{ width: '100%', minWidth: '100%' }}
                onClick={() => nextTab('notes')}
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
                    onKeyUp={handleKeyUp}
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
            <Tabs.Panel
                value='scenes'
                style={{ width: '100%', minWidth: '100%' }}
            >
                <Table>
                    <thead>
                        <tr>
                            <th>Chapter name</th>
                            <th>Scene name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {character.locations &&
                            character.locations.map(([chapterName, chapterId, sceneName, sceneId]) => (
                                <tr
                                    key={`${chapterId}-${sceneId}`}
                                    onClick={() => activeElement.setSceneById(chapterId, sceneId)}
                                >
                                    <td>{chapterName}</td>
                                    <td>{sceneName}</td>
                                </tr>
                            ))}
                    </tbody>
                </Table>
            </Tabs.Panel>
        </Tabs>
    )
}

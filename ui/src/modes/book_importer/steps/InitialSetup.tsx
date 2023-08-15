import { useEffect, useMemo, useState } from 'react'
import { Title, Text, TextInput, Checkbox, Group, ColorPicker, Center, Stack, Button } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useAppContext } from '@src/App.context'
import { useDebouncedEffect } from '@src/lib/useDebouncedEffect'
import { IconFlagFilled } from '@tabler/icons-react'
import { BatchBroker } from '@src/modes/book_importer/lib/BatchBroker'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IndicatedTextInput } from '@src/widget/IndicatedTextInput'
import { useImportContext } from '@src/modes/book_importer/BookImporter.context'

interface InitialSetupProps {
    nextStep: () => void
}

export const InitialSetup = ({ nextStep }: InitialSetupProps) => {
    const { api } = useAppContext()
    const { batchBroker } = useImportContext()

    const { data: batch, status: batchStatus } = batchBroker.fetch()

    const form = useForm({
        initialValues: {
            book_name: '',
            have_default_status: false,
            default_status: '',
            status_color: ''
        },
        validate: {
            book_name: (val: string) => {
                if (val) {
                    if (val.length >= 3) {
                        return undefined
                    }
                    return 'Book name needs to be 3 or more characters long.'
                }
                return 'Missing book name.'
            }
        }
    })

    useEffect(() => {
        if (batch && batch.name_and_status) {
            form.setValues({ ...batch.name_and_status })
            console.log('Set vars')
        }
    }, [batch, batchStatus])

    useDebouncedEffect(
        () => {
            if (form.isDirty()) {
                batchBroker.set('name_and_status', form.values).then(() => {
                    form.resetDirty()
                })
            }
        },
        [form],
        { delay: 900 }
    )

    return (
        <Stack align='center'>
            <Title>Step 1: Book basics</Title>
            <Text>
                Here I need to know the name of the book (which can be changed later) plus some other basic
                questions.
            </Text>
            <fieldset style={{ width: '45vw' }}>
                <IndicatedTextInput
                    form={form}
                    fieldName='book_name'
                    label='Book name'
                    inputprops={{ description: 'Remember, this can always be changed later!', maxLength: 45 }}
                />
                <Checkbox
                    label='Provide a default status?'
                    description={
                        'Scene status flags are visual cues to remind ' +
                        'you what stage a scene is at in the writing process.'
                    }
                    {...form.getInputProps('have_default_status', { type: 'checkbox' })}
                />
                <Group display={!form.values.have_default_status ? 'none' : 'inline-block'}>
                    <IndicatedTextInput
                        form={form}
                        fieldName='default_status'
                        label='Scene status flag name (draft, for review, final, etc)'
                        inputprops={{ maxLength: 45 }}
                    />
                    <Text>Status flag color</Text>
                    <IconFlagFilled style={{ color: form.values.status_color }} />
                    <ColorPicker {...form.getInputProps('status_color')} />
                    <IndicatedTextInput
                        form={form}
                        fieldName='status_color'
                        label=''
                        inputprops={{}}
                    />
                </Group>
            </fieldset>
            {form.isValid() && <Button onClick={nextStep}>Continue</Button>}
        </Stack>
    )
}

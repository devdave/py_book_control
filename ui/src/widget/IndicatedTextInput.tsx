import { Text, Group, Indicator, TextInput } from '@mantine/core'
import React from 'react'
import { UseFormReturnType } from '@mantine/form'

interface IndicatedTextInputProps {
    form: UseFormReturnType<unknown>
    fieldName: string
    label: string
    containerprops: object
    indicatorprops: object
    inputprops: object
}

export const IndicatedTextInput: React.FC<IndicatedTextInputProps> = ({
    form,
    fieldName,
    label,
    containerprops,
    indicatorprops,
    inputprops
}) => (
    <Group {...containerprops}>
        <Text>{label}</Text>
        <Indicator
            processing
            withBorder
            color='red'
            position='top-start'
            disabled={!form.isDirty(fieldName)}
            {...indicatorprops}
        >
            <TextInput
                {...form.getInputProps(fieldName)}
                {...inputprops}
            />
        </Indicator>
    </Group>
)

import { Text, Group, Indicator, TextInput } from '@mantine/core'
import React from 'react'
import { UseFormReturnType } from '@mantine/form'

interface IndicatedTextInputProps {
    form: UseFormReturnType<any>
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
            color='red'
            position='top-start'
            {...indicatorprops}
        >
            <TextInput
                {...form.getInputProps(fieldName)}
                {...inputprops}
            />
        </Indicator>
    </Group>
)

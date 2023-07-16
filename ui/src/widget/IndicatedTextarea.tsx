import { UseFormReturnType } from '@mantine/form'
import { Scene } from '@src/types'
import React from 'react'
import { Indicator, Textarea } from '@mantine/core'
import { TextareaProps } from '@mantine/core/lib/Textarea/Textarea'

interface IndicatedTextAreaProps {
    form: UseFormReturnType<any>
    formField: string
    inputProps: TextareaProps & React.RefAttributes<HTMLTextAreaElement>
    indicatorStyle?: object
    textStyle?: object
}

export const IndicatedTextarea: React.FC<IndicatedTextAreaProps> = ({
    form,
    formField,
    inputProps,
    indicatorStyle,
    textStyle
}) => (
    <Indicator
        processing
        color='red'
        position='top-start'
        disabled={!form.isDirty(formField)}
        style={indicatorStyle}
    >
        <Textarea
            autosize
            minRows={5}
            {...form.getInputProps(formField)}
            {...inputProps}
        />
    </Indicator>
)

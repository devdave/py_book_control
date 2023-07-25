import { UseFormReturnType } from '@mantine/form'
import React from 'react'
import { createStyles, Indicator, Textarea } from '@mantine/core'
import { TextareaProps } from '@mantine/core/lib/Textarea/Textarea'

const useStyle = createStyles({
    max_out: {
        height: '100%',
        boxSizing: 'border-box'
    }
})

interface IndicatedTextAreaProps {
    form: UseFormReturnType<any>
    formField: string
    inputProps?: TextareaProps & React.RefAttributes<HTMLTextAreaElement>
    indicatorStyle?: object
    textStyle?: object
    onKeyUp?: React.KeyboardEventHandler<HTMLTextAreaElement>
}

export const IndicatedTextarea: React.FC<IndicatedTextAreaProps> = ({
    form,
    formField,
    inputProps,
    indicatorStyle,
    textStyle,
    onKeyUp
}) => {
    const { classes } = useStyle()
    return (
        <Indicator
            processing
            color='red'
            position='top-start'
            disabled={!form.isDirty(formField)}
            style={{ height: '100%', boxSizing: 'border-box' }}
        >
            <Textarea
                autosize
                minRows={5}
                onKeyUp={onKeyUp}
                classNames={{ root: classes.max_out, wrapper: classes.max_out, input: classes.max_out }}
                {...form.getInputProps(formField)}
                {...inputProps}
            />
        </Indicator>
    )
}

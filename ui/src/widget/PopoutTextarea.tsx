import {ActionIcon, Group, Textarea, Text, Indicator, Button} from "@mantine/core";
import {UseFormReturnType} from "@mantine/form";
import {IconWindowMaximize} from "@tabler/icons-react";
import {modals} from "@mantine/modals";

import {type Scene} from '@src/types';

interface PopoutTextareaProps {
    form: UseFormReturnType<Scene>
    field_name: string
    label: string
    placeholder: string | undefined
    defaultTextareaProps: { [key: string]: string }
    modalTextAreaProps: { [key: string]: string }
}

export const PopoutTextarea: React.FC<PopoutTextareaProps> = ({
                                                                  form,
                                                                  field_name,
                                                                  label,
                                                                  placeholder,
                                                                  defaultTextareaProps = {},
                                                                  modalTextAreaProps = {}
                                                              }) => {


    const popout = () => {
        modals.open({
            style: {
                minWidth: "80vw",
                minHeight: "80vh"
            },
            modalId: "PopoutTextarea",
            children: (
                <>
                    <Indicator
                        processing
                        color="red"
                        disabled={!form.isDirty(field_name)}
                        style={{
                            height: "100%",
                            width: "100%",
                        }}
                    >
                        <Textarea
                            autosize
                            data-autofocus
                            minRows={10}
                            autoFocus
                            label={label}
                            placeholder={placeholder}
                            {...form.getInputProps(field_name)}
                            {...modalTextAreaProps}

                        />
                    </Indicator>
                    <Button onClick={() => modals.close("PopoutTextarea")}>Close/Exit</Button>
                </>
            )
        })
    }

    return (
        <Indicator
            processing
            color="red"
            disabled={!form.isDirty(field_name)}
        >
            <Textarea
                label={
                    <Group>
                        <Text>{label}</Text>
                        <ActionIcon onClick={popout}>
                            <IconWindowMaximize/>
                        </ActionIcon>
                    </Group>
                }
                placeholder={placeholder}
                {...form.getInputProps(field_name)}
                {...defaultTextareaProps}
            />
        </Indicator>
    )
}
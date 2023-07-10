import {Indicator, Text, TextInput, Title} from "@mantine/core";
import {useState} from "react";
import {useToggle} from "@mantine/hooks";
import {useForm} from "@mantine/form";
import {useDebouncedEffect} from "../lib/useDebouncedEffect";
import {IconEdit} from "@tabler/icons-react";


interface ToggleInputProps {
    value: string | undefined
    onChange: (new_value:string) => void
    title: string | undefined
}

export const ToggleInput:React.FC<ToggleInputProps> = ({value, onChange, title}) => {

    const [lastTouched, setLastTouched] = useState<number>(10000);
    const [state, toggle] = useToggle(['text', 'input']);

    const form = useForm({
        initialValues:{
            value: value ? value : 'Empty field'
        }
    });

    const doUpdate = () =>{
        const newVal = form.values['value'];
        console.log("Would update to", newVal, "from", value);
        onChange(newVal);
        form.resetDirty();
    }

    useDebouncedEffect(()=> {
        if(form.isDirty()){
            doUpdate();
            if(state == 'input'){
                toggle();
            }
        }
    }, [form.values], {delay: 900, runOnInitialize: false});

    const handleKeyEnter = (evt:React.KeyboardEvent<HTMLInputElement>) => {
        if(evt.key == "Enter" || evt.key == 'enter'){
            if(form.isDirty()){
                doUpdate();
            }
            toggle();
        } else if(evt.key == "Escape"){
            toggle();
        }
    }

    if(state == 'input'){
        return (
            <Indicator
                color="red"
                disabled={form.isDirty()}
                processing
                onBlur={()=>toggle()}
            >
                <TextInput autoFocus required onKeyUp={handleKeyEnter} onBlur={()=>toggle()} {...form.getInputProps('value')} />
            </Indicator>
        )
    }

    return (
        <Title
            title={title}
            order={1}
            onDoubleClick={()=>toggle()}
            style={{
                cursor: "text"
            }}
        >{form.values['value']}{<IconEdit/>}</Title>
    )

}
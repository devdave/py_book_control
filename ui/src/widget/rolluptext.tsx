import {Textarea} from "@mantine/core";


interface RolluptextProps {
    label: string,
    name: string,
    form: any,
}

const Rolluptext:React.FC<RolluptextProps> = ({label, name, form}) => {

    return (
        <details>
            <summary>{label}</summary>
                <details>
                <Textarea autoCapitalize="sentences" autosize minRows={5} {...form.inputProps(name)}/>
                </details>
        </details>
    );
}
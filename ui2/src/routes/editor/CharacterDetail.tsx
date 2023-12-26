import {Book, type Character} from "@src/types.ts";
import {Group, Text} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useDebouncedEffect} from "@src/lib/useDebouncedEffect.ts";
import {useAppContext} from "@src/App.context.ts";
import {IndicatedTextInput} from "@src/widget/IndicatedTextInput.tsx";
import {IndicatedTextarea} from "@src/widget/IndicatedTextarea.tsx";

export const CharacterDetail = ({book, character}:{book:Book, character:Character}) => {

    const {characterBroker} = useAppContext()

    const form = useForm<Partial<Character>>({
        initialValues:{
            "name": character.name,
            "notes": character.notes
        }
    })

    useDebouncedEffect(()=>{
        const toonUpdate = {id:character.id,...form.values}
        let shouldUpdate = false

        shouldUpdate = (form.values.name != character.name) || (form.values.notes != character.notes)
        if(shouldUpdate){
            characterBroker.update(book, toonUpdate as Character)
        }

    },[form.values], {delay: 900})


    return (
        <>
            <Group><Text>Created: {character.created_on}</Text> <Text>Last update: {character.updated_on}</Text></Group>
            <IndicatedTextInput form={form} fieldName={"name"} label={"Character name"} inputprops={form.getInputProps("name")}/>
            <IndicatedTextarea label={"Notes"} isDirty={()=>form.isDirty("notes")} inputProps={form.getInputProps("notes")}/>
        </>
    )

}

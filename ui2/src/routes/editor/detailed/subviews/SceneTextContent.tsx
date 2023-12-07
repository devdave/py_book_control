import {type Scene, SceneFormValues} from "@src/types.ts";
import {TextInput} from "@mantine/core";
import {UseFormReturnType} from "@mantine/form";
// import {useLocation} from "react-router-dom";
import {IndicatedTextarea} from "@src/widget/IndicatedTextarea.tsx";

export const SceneTextContent = ({form}:{scene:Scene, form:UseFormReturnType<SceneFormValues>}) => {

    // const {hash} = useLocation()

    return (
        <>
            <TextInput maxLength={50} maw={240} label={"Title"} {...form.getInputProps("title")} />
            <IndicatedTextarea isDirty={()=>form.isDirty("content")} inputProps={form.getInputProps("content")}/>
        </>
    )
}

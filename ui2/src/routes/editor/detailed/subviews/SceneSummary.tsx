import {Scene, SceneFormValues} from "@src/types.ts";
import {UseFormReturnType} from "@mantine/form";
import {IndicatedTextarea} from "@src/widget/IndicatedTextarea.tsx";

export const SceneSummary = ({form}:{scene:Scene, form:UseFormReturnType<SceneFormValues>}) => {

    return (
        <>
            <IndicatedTextarea isDirty={()=>form.isDirty("summary")} inputProps={form.getInputProps("summary")}/>
        </>
    )
}

import {type Scene, SceneFormValues} from "@src/types.ts";

import {useForm} from "@mantine/form";
import {useDebouncedEffect} from "@src/lib/useDebouncedEffect.ts";
import {useAppContext} from "@src/App.context.ts";
import {isEqual} from "lodash";

import {IndicatedTextarea} from "@src/widget/IndicatedTextarea.tsx";

import {ResizeablePanels} from "@src/widget/ResizeablePanels.tsx";
import {Stack} from "@mantine/core";




export const SceneElement = ({scene}:{scene:Scene}) => {

    // const navigate = useNavigate()
    //
    // const params = useParams<{book_id:UniqueId, chapter_id:UniqueId, mode:string|undefined}>()
    //
    // const {hash} = useLocation()

    const {sceneBroker, settings} = useAppContext()
    const [debounceTime] = settings.makeState('debounceTime')



    const form = useForm<SceneFormValues>({
        initialValues:{
            title: scene.title,
            content: scene.content,
            summary: scene.summary,
            notes: scene.notes,
            location: scene.location,
            characters: scene.characters,
        }
    })



    useDebouncedEffect(()=>{
        const newScene = {...scene, ...form.values}
        const shouldUpdate = !isEqual(scene, form.values)

        if(shouldUpdate) {
            sceneBroker.update(newScene as Scene).then(() => {
                form.resetDirty()
            })
        } else {
            form.resetDirty()
        }

    }, [form.values], {delay:debounceTime || 800})


    return (
        <ResizeablePanels>
            <IndicatedTextarea rows={25} isDirty={()=>form.isDirty('content')} inputProps={form.getInputProps("content")}/>

            <Stack>
                <label>location</label>
                <IndicatedTextarea isDirty={()=>form.isDirty("location")} inputProps={form.getInputProps("location")}/>
                <label>Notes</label>
                <IndicatedTextarea isDirty={()=>form.isDirty("notes")} inputProps={form.getInputProps("notes")}/>
                <label>Summary</label>
                <IndicatedTextarea isDirty={()=>form.isDirty("summary")} inputProps={form.getInputProps("summary")}/>
            </Stack>
        </ResizeablePanels>
    )


}

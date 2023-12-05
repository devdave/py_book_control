import {Scene} from "@src/types.ts";
import {useLocation} from "react-router-dom";
import {Paper, Textarea, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useAppContext} from "@src/App.context.ts";
import {useDebouncedEffect} from "@src/lib/useDebouncedEffect.ts";


export const SceneElement = ({scene}:{scene:Scene}) => {

    const {hash} = useLocation()

    const {sceneBroker, settings} = useAppContext()
    const [debounceTime] = settings.makeState('debounceTime')

    const form = useForm({
        initialValues: {
            title: scene.title,
            content: scene.content
        }
    })

    useDebouncedEffect(()=>{
        const newScene = structuredClone(scene)
        let shouldUpdate = false;

        if(newScene.title != form.values.title) {shouldUpdate = true}
        newScene.title = form.values.title

        if(newScene.content != form.values.content) {shouldUpdate = true}
        newScene.content = form.values.content

        if(shouldUpdate) {
            sceneBroker.update(newScene as Scene).then(() => {
                form.resetDirty()
            })
        } else {
            form.resetDirty()
        }

    }, [form.values.title, form.values.content], {delay:debounceTime || 800})


    return (
        <Paper id={scene.id} p="xl" style={{minHeight:"80vh"}}>
            <TextInput label={"Title"} {...form.getInputProps("title")} />
            <Textarea autosize autoFocus={scene.id === hash.slice(1)} {...form.getInputProps("content")}></Textarea>
            <pre>{JSON.stringify(scene, null, 4)}</pre>
        </Paper>
    )


}

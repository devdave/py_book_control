import {Book, Scene, SceneFormValues, type UniqueId} from "@src/types.ts";
import {Tabs} from "@mantine/core";

import {SceneTextContent} from "@src/routes/editor/detailed/subviews/SceneTextContent.tsx";
import {useForm} from "@mantine/form";
import {useDebouncedEffect} from "@src/lib/useDebouncedEffect.ts";
import {useAppContext} from "@src/App.context.ts";
import {isEqual} from "lodash";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {IndicatedTextarea} from "@src/widget/IndicatedTextarea.tsx";
import {SceneCharacters} from "@src/routes/editor/detailed/subviews/SceneCharacters.tsx";


export const SceneElement = ({scene}:{scene:Scene}) => {

    const navigate = useNavigate()

    const params = useParams<{book_id:UniqueId, chapter_id:UniqueId, mode:string|undefined}>()

    const {hash} = useLocation()

    const {sceneBroker, settings} = useAppContext()
    const [debounceTime] = settings.makeState('debounceTime')

    const [tabState, setTabState] = useState(params.mode || "content")

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

    useEffect(() => {
        const path = `/book/${params?.book_id}/detailed/chapter/${params?.chapter_id}.${tabState}#${hash.slice(1)}`
        // window.history.replaceState(null, "", path )
        navigate(path, {replace:true})
    }, [tabState]);

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
        <>
            <Tabs value={tabState} onChange={(tab) => setTabState(tab||"content")}>
                <Tabs.List grow>
                    <Tabs.Tab value={'content'}>Content</Tabs.Tab>
                    <Tabs.Tab value={'summary'}>Summary</Tabs.Tab>
                    <Tabs.Tab value={'notes'}>Notes</Tabs.Tab>
                    <Tabs.Tab value={'toons_loc'}>Characters & Location</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value={'content'}>
                    <SceneTextContent key={`${scene.id}_${scene.updated_on}`} scene={scene} form={form}/>
                </Tabs.Panel>
                <Tabs.Panel value={'summary'}><IndicatedTextarea isDirty={()=>form.isDirty("summary")} inputProps={form.getInputProps("summary")}/></Tabs.Panel>
                <Tabs.Panel value={'notes'}><IndicatedTextarea isDirty={()=>form.isDirty("notes")} inputProps={form.getInputProps("notes")}/></Tabs.Panel>
                <Tabs.Panel value={'toons_loc'}>
                    <SceneCharacters key={`${scene.id}_${scene.updated_on}_${scene.characters.length}`} book={{id:params.book_id} as Book} scene={scene} />
                </Tabs.Panel>
            </Tabs>

        </>
    )


}
